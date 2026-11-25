<?php
require_once 'auth.php';
require_once __DIR__ . '/request_validation.php';
requireApiMethod(['POST']);

if (!empty($_SESSION['user']['id'])) {
    requireAuthenticatedUserId();
}

enforceRateLimit('promo-validation-ip', rateLimitClientIp(), 60, 60);
enforceRateLimit('promo-validation-user', (string)($_SESSION['user']['id'] ?? rateLimitClientIp()), 30, 60);
require_once 'db.php';
require_once 'promo_helpers.php';

$data = readJsonRequest(65536);
$code = strtoupper(trim(requireJsonString($data, 'promo_code', true, 160)));
$cart = $data['cart'] ?? null;

if (!preg_match('/^[A-Z0-9][A-Z0-9_-]{1,39}$/', $code)) {
    http_response_code(422);
    echo json_encode(['status' => 'error', 'message' => 'Enter a valid promo code.']);
    exit;
}
if (!is_array($cart) || !array_is_list($cart) || !$cart || count($cart) > 100) {
    http_response_code(422);
    echo json_encode(['status' => 'error', 'message' => 'Your cart is empty.']);
    exit;
}

$quantities = [];
foreach ($cart as $item) {
    if (!is_array($item)) {
        http_response_code(422);
        echo json_encode(['status' => 'error', 'message' => 'Your cart contains an invalid product or quantity.']);
        exit;
    }
    $productId = validateApiInt($item['id'] ?? null, 1, SANObazar_MAX_DB_INT);
    $quantity = validateApiInt($item['quantity'] ?? null, 1, SANObazar_MAX_DB_INT);
    if ($productId === false || $quantity === false) {
        http_response_code(422);
        echo json_encode(['status' => 'error', 'message' => 'Your cart contains an invalid product or quantity.']);
        exit;
    }
    $quantities[$productId] = ($quantities[$productId] ?? 0) + $quantity;
    if ($quantities[$productId] > SANObazar_MAX_DB_INT) {
        http_response_code(422);
        echo json_encode(['status' => 'error', 'message' => 'Your cart contains an invalid product or quantity.']);
        exit;
    }
}

try {
    $subtotalPaisa = 0;
    $productQuery = $pdo->prepare('SELECT price, stock_quantity FROM products WHERE id = ?');
    foreach ($quantities as $productId => $quantity) {
        $productQuery->execute([$productId]);
        $product = $productQuery->fetch(PDO::FETCH_ASSOC);
        if (!$product || (int) $product['stock_quantity'] < $quantity) {
            throw new RuntimeException('A product in your cart is unavailable or has insufficient stock.');
        }
        $subtotalPaisa += promoAmountToPaisa($product['price']) * $quantity;
    }

    $promo = calculatePromo($pdo, $code, $subtotalPaisa);
    echo json_encode(['status' => 'success', 'promo' => $promo]);
} catch (PDOException $error) {
    sanobazarLogException('promo.validation_query_failed', $error);
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Could not validate this promo code right now.']);
} catch (RuntimeException $error) {
    http_response_code(422);
    echo json_encode(['status' => 'error', 'message' => $error->getMessage()]);
} catch (Throwable $error) {
    sanobazarLogException('promo.validation_failed', $error);
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Could not validate this promo code right now.']);
}
