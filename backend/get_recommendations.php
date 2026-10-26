<?php
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/db.php';

$productId = filter_var($_GET['product_id'] ?? 0, FILTER_VALIDATE_INT);
$categoryId = filter_var($_GET['category_id'] ?? 0, FILTER_VALIDATE_INT);
$productId = $productId !== false && $productId > 0 ? $productId : 0;
$categoryId = $categoryId !== false && $categoryId > 0 ? $categoryId : 0;
$userId = filter_var($_SESSION['user']['id'] ?? null, FILTER_VALIDATE_INT);

try {
    $currentProductCategory = 0;
    if ($productId > 0) {
        $productCategory = $pdo->prepare('SELECT category_id FROM products WHERE id = ?');
        $productCategory->execute([$productId]);
        $currentProductCategory = (int)($productCategory->fetchColumn() ?: 0);
    }

    // Use the customer's most purchased non-cancelled category when there is history.
    $preferredCategory = 0;
    if ($userId !== false && $userId > 0) {
        $history = $pdo->prepare("SELECT p.category_id
            FROM orders o
            JOIN order_items oi ON oi.order_id = o.id
            JOIN products p ON p.id = oi.product_id
            WHERE o.user_id = ? AND o.order_status <> 'cancelled'
            GROUP BY p.category_id
            ORDER BY SUM(oi.quantity) DESC, MAX(o.created_at) DESC, p.category_id ASC
            LIMIT 1");
        $history->execute([$userId]);
        $preferredCategory = (int)($history->fetchColumn() ?: 0);
    }

    $recommendationCategory = $preferredCategory ?: $currentProductCategory ?: $categoryId;
    $basis = $preferredCategory ? 'purchase_history' : ($recommendationCategory ? 'category' : 'popular');
    $recommendations = [];

    if ($recommendationCategory > 0) {
        $stmt = $pdo->prepare("SELECT p.id, p.name, p.price, p.image_url, p.stock_quantity,
                p.category_id, c.category_name AS category, COALESCE(s.units_sold, 0) AS total_sold
            FROM products p
            JOIN categories c ON c.id = p.category_id
            LEFT JOIN (
                SELECT oi.product_id, SUM(oi.quantity) AS units_sold
                FROM order_items oi
                JOIN orders o ON o.id = oi.order_id
                WHERE o.order_status <> 'cancelled'
                GROUP BY oi.product_id
            ) s ON s.product_id = p.id
            WHERE p.category_id = ? AND p.id <> ? AND p.stock_quantity > 0
            ORDER BY total_sold DESC, p.id ASC
            LIMIT 4");
        $stmt->execute([$recommendationCategory, $productId]);
        $recommendations = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Fall back to in-stock best sellers when a category has no alternatives.
    if (!$recommendations) {
        $stmt = $pdo->prepare("SELECT p.id, p.name, p.price, p.image_url, p.stock_quantity,
                p.category_id, c.category_name AS category, COALESCE(s.units_sold, 0) AS total_sold
            FROM products p
            JOIN categories c ON c.id = p.category_id
            LEFT JOIN (
                SELECT oi.product_id, SUM(oi.quantity) AS units_sold
                FROM order_items oi
                JOIN orders o ON o.id = oi.order_id
                WHERE o.order_status <> 'cancelled'
                GROUP BY oi.product_id
            ) s ON s.product_id = p.id
            WHERE p.stock_quantity > 0 AND p.id <> ?
            ORDER BY total_sold DESC, p.id ASC
            LIMIT 4");
        $stmt->execute([$productId]);
        $recommendations = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $basis = 'popular';
    }

    echo json_encode([
        'status' => 'success',
        'basis' => $basis,
        'category_id' => $recommendationCategory ?: null,
        'data' => $recommendations
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Could not load product recommendations.'
    ]);
}
?>
