<?php
require_once 'auth.php';
require_once __DIR__ . '/request_validation.php';
$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
requireApiMethod(['GET', 'POST']);
requireAdmin();
require_once 'db.php';

if ($method === 'GET') {
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

if ($method === 'POST') {
    requireCsrfToken();
    enforceRateLimit('admin-write-user', (string)$_SESSION['user']['id'], 30, 60);
    $data = readJsonRequest(16384);
    $orderId = validateApiInt($data['order_id'] ?? null, 1, SANObazar_MAX_DB_INT);
    $status = array_key_exists('order_status', $data) ? requireJsonString($data, 'order_status', true, 16) : '';
    $allowedStatuses = ['pending', 'processing', 'completed', 'cancelled'];

    if ($orderId === false || $orderId < 1 || !in_array($status, $allowedStatuses, true)) {
        http_response_code(422);
        echo json_encode(['status' => 'error', 'message' => 'Choose a valid order and status.']);
        exit;
    }

    try {
        $pdo->beginTransaction();
        $order = $pdo->prepare('SELECT order_status FROM orders WHERE id = ? FOR UPDATE');
        $order->execute([$orderId]);
        $currentStatus = $order->fetchColumn();

        if ($currentStatus === false) {
            $pdo->rollBack();
            http_response_code(404);
            echo json_encode(['status' => 'error', 'message' => 'Order not found.']);
            exit;
        }

        // The order lock makes repeated cancellation requests safe and idempotent.
        if ($currentStatus !== $status && (($currentStatus === 'cancelled') !== ($status === 'cancelled'))) {
            $items = $pdo->prepare('SELECT product_id, SUM(quantity) AS quantity FROM order_items WHERE order_id = ? GROUP BY product_id ORDER BY product_id');
            $items->execute([$orderId]);
            $stockQuery = $pdo->prepare('SELECT stock_quantity FROM products WHERE id = ? FOR UPDATE');
            $stockUpdate = $pdo->prepare('UPDATE products SET stock_quantity = ? WHERE id = ?');

            foreach ($items->fetchAll(PDO::FETCH_ASSOC) as $item) {
                $productId = (int)$item['product_id'];
                $quantity = (int)$item['quantity'];
                $stockQuery->execute([$productId]);
                $stock = $stockQuery->fetchColumn();
                if ($stock === false) {
                    throw new RuntimeException('A product linked to this order no longer exists.');
                }

                if ($status === 'cancelled') {
                    $stockUpdate->execute([(int)$stock + $quantity, $productId]);
                } else {
                    if ((int)$stock < $quantity) {
                        throw new DomainException('There is not enough stock to reactivate this order.');
                    }
                    $stockUpdate->execute([(int)$stock - $quantity, $productId]);
                }
            }
        }

        $update = $pdo->prepare('UPDATE orders SET order_status = ? WHERE id = ?');
        $update->execute([$status, $orderId]);
        $pdo->commit();
        echo json_encode(['status' => 'success', 'message' => 'Order status updated and inventory adjusted.']);
    } catch (DomainException $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        http_response_code(409);
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        sanobazarLogException('admin_orders.update_failed', $e);
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Unable to update the order right now.']);
    }
    exit;
}

http_response_code(405);
header('Allow: GET, POST, OPTIONS');
echo json_encode(['status' => 'error', 'message' => 'Method not allowed.']);
