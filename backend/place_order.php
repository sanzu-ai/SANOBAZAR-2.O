<?php
require_once "auth.php";

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

require_once 'db.php';

$data = json_decode(file_get_contents("php://input"), true);

$userId = $_SESSION['user']['id'] ?? null;
$cart = is_array($data['cart'] ?? null) ? $data['cart'] : [];
$address = trim((string)($data['shipping_address'] ?? ''));
$phone = trim((string)($data['phone_number'] ?? ''));
$paymentMethod = $data['payment_method'] ?? 'cod';

if (!$userId) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Please login before placing an order."]);
    exit;
}

if (empty($cart)) {
    http_response_code(422);
    echo json_encode(["status" => "error", "message" => "Your cart is empty."]);
    exit;
}

if ($address === '' || strlen($address) > 500) {
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

// Combine repeated product IDs and accept only validated product IDs and quantities.
$quantities = [];
foreach ($cart as $item) {
    $productId = filter_var($item['id'] ?? null, FILTER_VALIDATE_INT);
    $quantity = filter_var($item['quantity'] ?? null, FILTER_VALIDATE_INT);
    if ($productId === false || $productId < 1 || $quantity === false || $quantity < 1) {
        http_response_code(422);
        echo json_encode(["status" => "error", "message" => "Your cart contains an invalid product or quantity."]);
        exit;
    }
    $quantities[$productId] = ($quantities[$productId] ?? 0) + $quantity;
}
ksort($quantities, SORT_NUMERIC);

try {
    $pdo->beginTransaction();

    // 1. Calculate total amount & validate stock
    $totalPaisa = 0;
    $products = [];
    foreach ($quantities as $productId => $quantity) {
        $stmt = $pdo->prepare("SELECT price, stock_quantity FROM products WHERE id = ? FOR UPDATE");
        $stmt->execute([$productId]);
        $product = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$product) {
            throw new Exception("A product in your cart is no longer available.");
        }

        if ((int)$product['stock_quantity'] < $quantity) {
            throw new Exception("Insufficient stock for one or more products in your cart.");
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
    $totalAmount = intdiv($totalPaisa, 100) . '.' . str_pad((string)($totalPaisa % 100), 2, '0', STR_PAD_LEFT);

    // 2. Save verified delivery/payment details with the order.
    $paymentStatus = $paymentMethod === 'digital' ? 'simulated' : 'pending';
    $stmtOrder = $pdo->prepare("INSERT INTO orders (user_id, total_amount, shipping_address, phone_number, payment_method, payment_status, order_status) VALUES (?, ?, ?, ?, ?, ?, 'pending')");
    $stmtOrder->execute([$userId, $totalAmount, $address, $phone, $paymentMethod, $paymentStatus]);
    $orderId = $pdo->lastInsertId();

    // 3. Insert into order_items table and deduct stock
    $stmtItem = $pdo->prepare("INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)");
    $stmtUpdateStock = $pdo->prepare("UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?");

    foreach ($quantities as $productId => $quantity) {
        $stmtItem->execute([$orderId, $productId, $quantity, $products[$productId]['price']]);
        $stmtUpdateStock->execute([$quantity, $productId]);
    }

    $clearSavedCart = $pdo->prepare('DELETE FROM cart_items WHERE user_id = ?');
    $clearSavedCart->execute([$userId]);

    $pdo->commit();

    echo json_encode([
        "status" => "success",
        "message" => "Order placed successfully!",
        "order_id" => (int)$orderId,
        "total_amount" => $totalAmount,
        "payment_status" => $paymentStatus
    ]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code($e instanceof PDOException ? 500 : 422);
    echo json_encode([
        "status" => "error",
        "message" => $e instanceof PDOException
            ? "Could not place the order. Please try again."
            : $e->getMessage()
    ]);
}
?>
