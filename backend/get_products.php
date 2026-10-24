<?php
// Enable Cross-Origin Resource Sharing (CORS) & JSON response header
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// Include database connection
require_once "db.php";

try {
    // SQL query to join products with category names
    $sql = "SELECT p.id, p.name, p.price, p.stock_quantity, p.image_url, c.category_name AS category
            FROM products p
            JOIN categories c ON p.category_id = c.id
            ORDER BY p.id ASC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute();

    // Fetch all products as an associative array
    $products = $stmt->fetchAll();

    // Return products array as JSON
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