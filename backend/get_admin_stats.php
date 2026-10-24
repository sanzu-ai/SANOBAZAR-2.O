<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once "db.php";

try {
    // 1. Calculate Total Revenue from completed orders
    $stmtRevenue = $pdo->query("SELECT COALESCE(SUM(total_amount), 0) AS total_revenue FROM orders WHERE order_status = 'completed'");
    $totalRevenue = $stmtRevenue->fetchColumn();

    // 2. Count Total Orders
    $stmtOrders = $pdo->query("SELECT COUNT(id) AS total_orders FROM orders");
    $totalOrders = $stmtOrders->fetchColumn();

    // 3. Count Total Registered Users
    $stmtUsers = $pdo->query("SELECT COUNT(id) AS total_users FROM users WHERE role = 'customer'");
    $totalUsers = $stmtUsers->fetchColumn();

    // 4. Count Low Stock Products (Stock quantity < 5)
    $stmtLowStock = $pdo->query("SELECT COUNT(id) AS low_stock_count FROM products WHERE stock_quantity < 5");
    $lowStockCount = $stmtLowStock->fetchColumn();

    // 5. Fetch Low Stock Product Details
    $stmtLowStockItems = $pdo->query("SELECT id, name, price, stock_quantity FROM products WHERE stock_quantity < 5 ORDER BY stock_quantity ASC");
    $lowStockItems = $stmtLowStockItems->fetchAll();

    // 6. Fetch Recent Orders with Customer Name
    $stmtRecentOrders = $pdo->query("
        SELECT o.id, u.full_name AS customer_name, o.total_amount, o.order_status, o.created_at 
        FROM orders o
        JOIN users u ON o.user_id = u.id
        ORDER BY o.created_at DESC
        LIMIT 5
    ");
    $recentOrders = $stmtRecentOrders->fetchAll();

    echo json_encode([
        "status" => "success",
        "stats" => [
            "total_revenue"   => number_format($totalRevenue, 2),
            "total_orders"    => $totalOrders,
            "total_users"     => $totalUsers,
            "low_stock_count" => $lowStockCount
        ],
        "low_stock_items" => $lowStockItems,
        "recent_orders"   => $recentOrders
    ]);

} catch (PDOException $e) {
    echo json_encode([
        "status" => "error",
        "message" => "Failed to fetch stats: " . $e->getMessage()
    ]);
}
?>