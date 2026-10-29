<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once "db.php";

// Check if search query (q) or category_id is sent via URL parameters
$search = isset($_GET['q']) ? trim($_GET['q']) : '';
$categoryId = isset($_GET['category_id']) ? intval($_GET['category_id']) : 0;

try {
    $sql = "SELECT p.id, p.name, p.price, p.stock_quantity, p.image_url, p.created_at, c.category_name AS category, p.category_id,
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
    echo json_encode([
        "status"  => "error",
        "message" => $e->getMessage()
    ]);
}
?>
