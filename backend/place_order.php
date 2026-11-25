<?php
require_once "auth.php";
require_once __DIR__ . '/request_validation.php';
requireApiMethod(['POST']);

requireCsrfToken();

final class CheckoutValidationException extends RuntimeException {}

function respondWithOrder(array $order, bool $replayed = false): void
{
    echo json_encode([
        'status' => 'success',
        'message' => $replayed ? 'This checkout was already completed.' : 'Order placed successfully!',
        'order_id' => (int)$order['id'],
        'total_amount' => $order['total_amount'],
        'subtotal_amount' => $order['subtotal_amount'],
        'discount_amount' => $order['discount_amount'],
        'promo_code' => $order['promo_code'],
        'payment_status' => $order['payment_status'],
        'idempotent_replay' => $replayed
    ]);
}

$data = readJsonRequest(65536);

$userId = requireAuthenticatedUserId();
$cart = $data['cart'] ?? null;
$address = trim(requireJsonString($data, 'shipping_address', true, 2000));
$phone = trim(requireJsonString($data, 'phone_number', true, 120));
$paymentMethod = array_key_exists('payment_method', $data) ? requireJsonString($data, 'payment_method', true, 16) : 'cod';
$promoCode = strtoupper(trim(requireJsonString($data, 'promo_code', false, 160)));
$idempotencyKey = $data['idempotency_key'] ?? null;

enforceRateLimit('checkout-user', (string)$userId, 30, 900);
enforceRateLimit('checkout-ip', rateLimitClientIp(), 100, 900);
require_once 'db.php';
require_once 'promo_helpers.php';

if (!is_string($idempotencyKey) || !preg_match('/^[a-f0-9]{32}$/i', $idempotencyKey)) {
    http_response_code(422);
    echo json_encode(["status" => "error", "message" => "Start a new checkout attempt and try again."]);
    exit;
}

if (!is_array($cart) || !array_is_list($cart) || !$cart || count($cart) > 100) {
    http_response_code(422);
    echo json_encode(["status" => "error", "message" => "Your cart is empty."]);
    exit;
}

if ($address === '' || mb_strlen($address, 'UTF-8') > 500) {
    http_response_code(422);
    echo json_encode(["status" => "error", "message" => "Enter a delivery address of 1 to 500 characters."]);
    exit;
}

if (!preg_match('/^[+0-9().\\s-]{7,30}$/', $phone) || !preg_match('/[0-9].*[0-9].*[0-9].*[0-9].*[0-9].*[0-9].*[0-9]/', $phone)) {
    http_response_code(422);
    echo json_encode(["status" => "error", "message" => "Enter a valid phone number."]);
    exit;
}

if (!in_array($paymentMethod, ['cod', 'digital'], true)) {
    http_response_code(422);
    echo json_encode(["status" => "error", "message" => "Choose a valid payment method."]);
    exit;
}

if ($promoCode !== '' && !preg_match('/^[A-Z0-9][A-Z0-9_-]{1,39}$/', $promoCode)) {
    http_response_code(422);
    echo json_encode(["status" => "error", "message" => "Enter a valid promo code."]);
    exit;
}

// Combine repeated product IDs and accept only validated product IDs and quantities.
$quantities = [];
foreach ($cart as $item) {
    if (!is_array($item)) {
        http_response_code(422);
        echo json_encode(["status" => "error", "message" => "Your cart contains an invalid product or quantity."]);
        exit;
    }
    $productId = validateApiInt($item['id'] ?? null, 1, SANObazar_MAX_DB_INT);
    $quantity = validateApiInt($item['quantity'] ?? null, 1, SANObazar_MAX_DB_INT);
    if ($productId === false || $quantity === false) {
        http_response_code(422);
        echo json_encode(["status" => "error", "message" => "Your cart contains an invalid product or quantity."]);
        exit;
    }
    $quantities[$productId] = ($quantities[$productId] ?? 0) + $quantity;
    if ($quantities[$productId] > SANObazar_MAX_DB_INT) {
        http_response_code(422);
        echo json_encode(["status" => "error", "message" => "Your cart contains an invalid product or quantity."]);
        exit;
    }
}
ksort($quantities, SORT_NUMERIC);

try {
    $pdo->beginTransaction();

    // Serialize checkout attempts for this customer. The unique index remains the
    // database-level backstop for the idempotency key.
    $lockCustomer = $pdo->prepare('SELECT id FROM users WHERE id = ? FOR UPDATE');
    $lockCustomer->execute([$userId]);
    if (!$lockCustomer->fetchColumn()) {
        throw new CheckoutValidationException('The customer account is unavailable. Please sign in again.');
    }

    $findExisting = $pdo->prepare('SELECT id, total_amount, subtotal_amount, discount_amount, promo_code, payment_status
        FROM orders WHERE user_id = ? AND idempotency_key = ? FOR UPDATE');
    $findExisting->execute([$userId, $idempotencyKey]);
    $existingOrder = $findExisting->fetch(PDO::FETCH_ASSOC);
    if ($existingOrder) {
        $pdo->commit();
        respondWithOrder($existingOrder, true);
        exit;
    }

    // 1. Calculate total amount & validate stock
    $totalPaisa = 0;
    $products = [];
    foreach ($quantities as $productId => $quantity) {
        $stmt = $pdo->prepare("SELECT price, stock_quantity FROM products WHERE id = ? FOR UPDATE");
        $stmt->execute([$productId]);
        $product = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$product) {
            throw new CheckoutValidationException('A product in your cart is no longer available.');
        }

        if ((int)$product['stock_quantity'] < $quantity) {
            throw new CheckoutValidationException('Insufficient stock for one or more products in your cart.');
        }

        $priceParts = explode('.', (string)$product['price'], 2);
        $wholeRupees = (int)$priceParts[0];
        $paisaPart = str_pad(substr($priceParts[1] ?? '0', 0, 2), 2, '0');
        $unitPricePaisa = ($wholeRupees * 100) + (int)$paisaPart;

        $products[$productId] = $product;
        $products[$productId]['unit_price_paisa'] = $unitPricePaisa;
        $totalPaisa += $unitPricePaisa * $quantity;
    }

    // Products and order totals are NPR; calculate in paisa to avoid float drift.
    $subtotalPaisa = $totalPaisa;
    $discountPaisa = 0;
    $promo = null;
    if ($promoCode !== '') {
        try {
            $promo = calculatePromo($pdo, $promoCode, $subtotalPaisa, true);
            $discountPaisa = promoAmountToPaisa($promo['discount_amount']);
        } catch (RuntimeException $e) {
            // Only forward the known, fixed promo validation messages. Unexpected
            // RuntimeException text is handled as an internal error below.
            $promoValidationMessages = [
                'A promotional price is invalid.',
                'This promo code is invalid or inactive.',
                'This promo code is not active yet.',
                'This promo code has expired.',
                'This promo code has reached its usage limit.',
                'Your order does not meet the minimum amount for this promo code.',
                'This promo code has an invalid discount.'
            ];
            if (!in_array($e->getMessage(), $promoValidationMessages, true)) {
                throw $e;
            }
            throw new CheckoutValidationException($e->getMessage(), 0, $e);
        }
    }
    $totalPaisa = max(0, $subtotalPaisa - $discountPaisa);
    $subtotalAmount = promoFormatPaisa($subtotalPaisa);
    $discountAmount = promoFormatPaisa($discountPaisa);
    $totalAmount = promoFormatPaisa($totalPaisa);

    // 2. Save verified delivery/payment details with the order.
    $paymentStatus = $paymentMethod === 'digital' ? 'simulated' : 'pending';
    $stmtOrder = $pdo->prepare("INSERT INTO orders (user_id, idempotency_key, total_amount, subtotal_amount, discount_amount, promo_code, shipping_address, phone_number, payment_method, payment_status, order_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')");
    $stmtOrder->execute([$userId, $idempotencyKey, $totalAmount, $subtotalAmount, $discountAmount, $promoCode !== '' ? $promoCode : null, $address, $phone, $paymentMethod, $paymentStatus]);
    $orderId = $pdo->lastInsertId();

    // 3. Insert into order_items table and deduct stock
    $stmtItem = $pdo->prepare("INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)");
    $stmtUpdateStock = $pdo->prepare("UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?");

    foreach ($quantities as $productId => $quantity) {
        $stmtItem->execute([$orderId, $productId, $quantity, $products[$productId]['price']]);
        $stmtUpdateStock->execute([$quantity, $productId]);
    }

    if ($promo) {
        $incrementPromoUse = $pdo->prepare('UPDATE promo_codes SET usage_count = usage_count + 1 WHERE id = ?');
        $incrementPromoUse->execute([$promo['id']]);
    }

    $clearSavedCart = $pdo->prepare('DELETE FROM cart_items WHERE user_id = ?');
    $clearSavedCart->execute([$userId]);

    $pdo->commit();

    respondWithOrder([
        'id' => $orderId,
        'total_amount' => $totalAmount,
        'subtotal_amount' => $subtotalAmount,
        'discount_amount' => $discountAmount,
        'promo_code' => $promoCode !== '' ? $promoCode : null,
        'payment_status' => $paymentStatus
    ]);

} catch (Throwable $e) {
    if ($pdo->inTransaction()) {
        try {
            $pdo->rollBack();
        } catch (Throwable $rollbackError) {
            sanobazarLogException('checkout.rollback_failed', $rollbackError);
            sanobazarLogException('checkout.place_order_failed', $e);
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Could not place the order. Please try again.']);
            exit;
        }
    }

    // Return the committed order if the unique index caught a concurrent replay.
    if ($e instanceof PDOException && $e->getCode() === '23000') {
        try {
            $findExisting = $pdo->prepare('SELECT id, total_amount, subtotal_amount, discount_amount, promo_code, payment_status
                FROM orders WHERE user_id = ? AND idempotency_key = ? LIMIT 1');
            $findExisting->execute([$userId, $idempotencyKey]);
            $existingOrder = $findExisting->fetch(PDO::FETCH_ASSOC);
            if ($existingOrder) {
                respondWithOrder($existingOrder, true);
                exit;
            }
        } catch (Throwable $lookupError) {
            sanobazarLogException('checkout.idempotency_replay_lookup_failed', $lookupError);
        }
    }

    if ($e instanceof CheckoutValidationException) {
        http_response_code(422);
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        exit;
    }

    sanobazarLogException('checkout.place_order_failed', $e);
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Could not place the order. Please try again.']);
}
?>
