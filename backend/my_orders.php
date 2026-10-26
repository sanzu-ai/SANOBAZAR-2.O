<?php
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/db.php';

if (empty($_SESSION['user']['id'])) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Please sign in to view your orders.', 'data' => []]);
    exit;
}

try {
    $stmt = $pdo->prepare('SELECT o.id, o.total_amount, o.shipping_address, o.phone_number,
        o.payment_method, o.payment_status, o.order_status, o.created_at, COUNT(oi.id) AS item_count
        FROM orders o LEFT JOIN order_items oi ON oi.order_id = o.id
        WHERE o.user_id = ? GROUP BY o.id, o.total_amount, o.shipping_address, o.phone_number,
            o.payment_method, o.payment_status, o.order_status, o.created_at
        ORDER BY o.created_at DESC');
    $stmt->execute([$_SESSION['user']['id']]);
    echo json_encode(['status' => 'success', 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Could not load order history.', 'data' => []]);
}
