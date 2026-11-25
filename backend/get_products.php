<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
require_once __DIR__ . '/request_validation.php';
requireApiMethod(['GET']);
require_once __DIR__ . '/rate_limit.php';
enforceRateLimit('products-read-ip', rateLimitClientIp(), 120, 60);

require_once "db.php";

// Check if search query (q) or category_id is sent via URL parameters
$search = '';
if (array_key_exists('q', $_GET)) {
    if (!is_string($_GET['q']) || strlen($_GET['q']) > 800 || mb_strlen($_GET['q'], 'UTF-8') > 200) {
        apiRequestError(422, 'The product search is invalid.');
    }
    $search = trim($_GET['q']);
}
$categoryId = filter_var($_GET['category_id'] ?? 0, FILTER_VALIDATE_INT, ['options' => ['min_range' => 0, 'max_range' => SANObazar_MAX_DB_INT]]);
if ($categoryId === false) apiRequestError(422, 'The category filter is invalid.');

try {
    $sql = "SELECT p.id, p.name, p.description, p.price, p.stock_quantity, p.image_url, p.created_at, c.category_name AS category, p.category_id,
                   (SELECT COALESCE(SUM(oi.quantity), 0)
                    FROM order_items oi
                    JOIN orders o ON o.id = oi.order_id
                    WHERE oi.product_id = p.id AND o.order_status <> 'cancelled') AS units_sold
            FROM products p
            JOIN categories c ON p.category_id = c.id
            WHERE 1=1";

    $params = [];

    // Filter by Category if selected
    if ($categoryId > 0) {
        $sql .= " AND p.category_id = ?";
        $params[] = $categoryId;
    }

    // Filter by Search Keyword if entered
    if (!empty($search)) {
        $sql .= " AND (p.name LIKE ? OR c.category_name LIKE ?)";
        $params[] = "%$search%";
        $params[] = "%$search%";
    }

    $sql .= " ORDER BY p.id ASC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $products = $stmt->fetchAll();

    echo json_encode([
        "status"  => "success",
        "count"   => count($products),
        "data"    => $products
    ]);

} catch (PDOException $e) {
    sanobazarLogException('catalog.products_query_failed', $e);
    http_response_code(500);
    echo json_encode([
        "status"  => "error",
        "message" => "Unable to load products right now. Please try again later."
    ]);
}
?>
