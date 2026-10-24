<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

require_once "db.php";

$inputData = file_get_contents("php://input");
$data = json_decode($inputData, true);

// Check if cart is empty
if (!isset($data['cart']) || empty($data['cart'])) {
    echo json_encode(["status" => "error", "message" => "Cart is empty."]);
    exit();
}

// Get user_id sent from frontend JavaScript
$userId = isset($data['user_id']) ? intval($data['user_id']) : 0;

if ($userId <= 0) {
    echo json_encode(["status" => "error", "message" => "Please login before placing an order."]);
    exit();
}

$cart = $data['cart'];
$totalAmount = 0;

try {
    // 1. Verify user actually exists in database
    $userCheck = $pdo->prepare("SELECT id FROM users WHERE id = ?");
    $userCheck->execute([$userId]);
    if (!$userCheck->fetch()) {
        echo json_encode(["status" => "error", "message" => "Logged in user not found. Please log in again."]);
        exit();
    }

    // START DATABASE TRANSACTION
    $pdo->beginTransaction();

    // 2. Validate stock & calculate Grand Total
    foreach ($cart as $item) {
        $stmt = $pdo->prepare("SELECT price, stock_quantity FROM products WHERE id = ?");
        $stmt->execute([$item['id']]);
        $product = $stmt->fetch();

        if (!$product) {
            throw new Exception("Product ID {$item['id']} not found.");
        }

        if ($product['stock_quantity'] < $item['quantity']) {
            throw new Exception("Insufficient stock for {$item['name']}. Available: {$product['stock_quantity']}");
        }

        $totalAmount += $product['price'] * $item['quantity'];
    }

    // 3. Insert into `orders` table with actual $userId
    $stmtOrder = $pdo->prepare("INSERT INTO orders (user_id, total_amount, order_status) VALUES (?, ?, 'completed')");
    $stmtOrder->execute([$userId, $totalAmount]);
    $orderId = $pdo->lastInsertId();

    // 4. Insert line items & deduct product stock
    $stmtItem = $pdo->prepare("INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)");
    $stmtUpdateStock = $pdo->prepare("UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?");

    foreach ($cart as $item) {
        $stmtPrice = $pdo->prepare("SELECT price FROM products WHERE id = ?");
        $stmtPrice->execute([$item['id']]);
        $unitPrice = $stmtPrice->fetchColumn();

        $stmtItem->execute([$orderId, $item['id'], $item['quantity'], $unitPrice]);
        $stmtUpdateStock->execute([$item['quantity'], $item['id']]);
    }

    // COMMIT TRANSACTION
    $pdo->commit();

    echo json_encode([
        "status"   => "success",
        "message"  => "Order placed successfully!",
        "order_id" => $orderId,
        "total"    => $totalAmount
    ]);

} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode([
        "status"  => "error",
        "message" => $e->getMessage()
    ]);
}
?>