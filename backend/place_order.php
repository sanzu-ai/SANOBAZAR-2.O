<?php
// Enable CORS and set response header
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

require_once "db.php";

// Read raw JSON data sent from JavaScript
$inputData = file_get_contents("php://input");
$data = json_decode($inputData, true);

// Check if cart data exists
if (!isset($data['cart']) || empty($data['cart'])) {
    echo json_encode(["status" => "error", "message" => "Cart is empty."]);
    exit();
}

$cart = $data['cart'];
$userId = 2; // For now, defaulting to customer ID = 2 (John Doe) until authentication is built
$totalAmount = 0;

try {
    // START DATABASE TRANSACTION (Ensures all queries succeed or none do)
    $pdo->beginTransaction();

    // 1. Calculate Grand Total on server side for security
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

    // 2. Insert into `orders` table
    $stmtOrder = $pdo->prepare("INSERT INTO orders (user_id, total_amount, order_status) VALUES (?, ?, 'completed')");
    $stmtOrder->execute([$userId, $totalAmount]);
    $orderId = $pdo->lastInsertId(); // Get generated Order ID

    // 3. Insert into `order_items` and deduct `products` stock
    $stmtItem = $pdo->prepare("INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)");
    $stmtUpdateStock = $pdo->prepare("UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?");

    foreach ($cart as $item) {
        // Fetch current price
        $stmtPrice = $pdo->prepare("SELECT price FROM products WHERE id = ?");
        $stmtPrice->execute([$item['id']]);
        $unitPrice = $stmtPrice->fetchColumn();

        // Save line item
        $stmtItem->execute([$orderId, $item['id'], $item['quantity'], $unitPrice]);

        // Reduce stock
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
    // Rollback transaction if anything failed
    $pdo->rollBack();

    echo json_encode([
        "status"  => "error",
        "message" => $e->getMessage()
    ]);
}
?>