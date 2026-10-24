<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once "db.php";

// Get product_id or category_id from URL if passed (e.g. while viewing a product)
$productId = isset($_GET['product_id']) ? intval($_GET['product_id']) : 0;
$categoryId = isset($_GET['category_id']) ? intval($_GET['category_id']) : 0;

try {
    if ($productId > 0) {
        // Algorithm Rule 1: Find products in the SAME category, excluding the current product
        $stmt = $pdo->prepare("
            SELECT p.id, p.name, p.price, p.image_url, c.category_name AS category
            FROM products p
            JOIN categories c ON p.category_id = c.id
            WHERE p.category_id = (SELECT category_id FROM products WHERE id = ?)
            AND p.id != ?
            LIMIT 4
        ");
        $stmt->execute([$productId, $productId]);
        $recommendations = $stmt->fetchAll();
    } else if ($categoryId > 0) {
        // Algorithm Rule 2: Recommend items matching user's preferred category
        $stmt = $pdo->prepare("
            SELECT p.id, p.name, p.price, p.image_url, c.category_name AS category
            FROM products p
            JOIN categories c ON p.category_id = c.id
            WHERE p.category_id = ?
            LIMIT 4
        ");
        $stmt->execute([$categoryId]);
        $recommendations = $stmt->fetchAll();
    } else {
        // Algorithm Rule 3 (Fallback): Recommend top-selling / popular products across store
        $stmt = $pdo->query("
            SELECT p.id, p.name, p.price, p.image_url, c.category_name AS category,
                   COALESCE(SUM(oi.quantity), 0) AS total_sold
            FROM products p
            JOIN categories c ON p.category_id = c.id
            LEFT JOIN order_items oi ON p.id = oi.product_id
            GROUP BY p.id
            ORDER BY total_sold DESC, p.id ASC
            LIMIT 4
        ");
        $recommendations = $stmt->fetchAll();
    }

    echo json_encode([
        "status" => "success",
        "data"   => $recommendations
    ]);

} catch (PDOException $e) {
    echo json_encode([
        "status"  => "error",
        "message" => "Recommendation Engine Error: " . $e->getMessage()
    ]);
}
?>