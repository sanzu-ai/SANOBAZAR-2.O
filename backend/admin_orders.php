<?php
require_once 'auth.php';
requireAdmin();
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $stmt = $pdo->query("SELECT o.id, o.user_id, u.full_name AS customer_name, u.email,
                o.total_amount, o.subtotal_amount, o.discount_amount, o.promo_code, o.shipping_address, o.phone_number, o.payment_method,
                o.payment_status, o.order_status, o.created_at,
                COUNT(oi.id) AS line_count, COALESCE(SUM(oi.quantity), 0) AS item_count
            FROM orders o
            JOIN users u ON u.id = o.user_id
            LEFT JOIN order_items oi ON oi.order_id = o.id
            GROUP BY o.id, o.user_id, u.full_name, u.email, o.total_amount, o.subtotal_amount, o.discount_amount, o.promo_code, o.shipping_address,
                o.phone_number, o.payment_method, o.payment_status, o.order_status, o.created_at
            ORDER BY o.created_at DESC");
        echo json_encode(['status' => 'success', 'data' => $stmt->fetchAll()]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Unable to load orders.']);
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true) ?? [];
    $orderId = filter_var($data['order_id'] ?? null, FILTER_VALIDATE_INT);
    $status = $data['order_status'] ?? '';
    $allowedStatuses = ['pending', 'processing', 'completed', 'cancelled'];

    if ($orderId === false || $orderId < 1 || !in_array($status, $allowedStatuses, true)) {
        http_response_code(422);
        echo json_encode(['status' => 'error', 'message' => 'Choose a valid order and status.']);
        exit;
    }

    $stmt = $pdo->prepare('UPDATE orders SET order_status = ? WHERE id = ?');
    $stmt->execute([$status, $orderId]);
    if ($stmt->rowCount() === 0) {
        $exists = $pdo->prepare('SELECT id FROM orders WHERE id = ?');
        $exists->execute([$orderId]);
        if (!$exists->fetch()) {
            http_response_code(404);
            echo json_encode(['status' => 'error', 'message' => 'Order not found.']);
            exit;
        }
    }
    echo json_encode(['status' => 'success', 'message' => 'Order status updated.']);
    exit;
}

http_response_code(405);
echo json_encode(['status' => 'error', 'message' => 'Method not allowed.']);
