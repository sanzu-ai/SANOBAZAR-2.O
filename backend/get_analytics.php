<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once "db.php";

try {
    // 1. Total Revenue
    $stmtRev = $pdo->query("SELECT COALESCE(SUM(total_amount), 0) AS total_revenue FROM orders WHERE order_status = 'completed'");
    $totalRevenue = $stmtRev->fetchColumn();

    // 2. Total Orders
    $stmtOrd = $pdo->query("SELECT COUNT(id) AS total_orders FROM orders");
    $totalOrders = $stmtOrd->fetchColumn();

    // 3. Average Order Value (Revenue / Total Orders)
    $avgOrderValue = $totalOrders > 0 ? ($totalRevenue / $totalOrders) : 0;

    // 4. Sales Breakdown by Category
    $stmtCat = $pdo->query("
        SELECT 
            c.category_name,
            COALESCE(SUM(oi.quantity * oi.unit_price), 0) AS category_revenue,
            COALESCE(SUM(oi.quantity), 0) AS items_sold
        FROM categories c
        LEFT JOIN products p ON c.id = p.category_id
        LEFT JOIN order_items oi ON p.id = oi.product_id
        GROUP BY c.id, c.category_name
        ORDER BY category_revenue DESC
    ");
    $categorySales = $stmtCat->fetchAll();

    echo json_encode([
        "status" => "success",
        "data" => [
            "total_revenue"   => number_format($totalRevenue, 2),
            "total_orders"    => $totalOrders,
            "avg_order_value" => number_format($avgOrderValue, 2),
            "category_sales"  => $categorySales
        ]
    ]);

} catch (PDOException $e) {
    echo json_encode([
        "status"  => "error",
        "message" => "Analytics Error: " . $e->getMessage()
    ]);
}
?>