<?php
require_once __DIR__ . '/auth.php';
requireAdmin();
require_once __DIR__ . '/db.php';

try {
    $totalRevenue = (float)$pdo->query("SELECT COALESCE(SUM(total_amount), 0)
        FROM orders WHERE order_status = 'completed'")->fetchColumn();
    $totalOrders = (int)$pdo->query('SELECT COUNT(id) FROM orders')->fetchColumn();
    $completedOrders = (int)$pdo->query("SELECT COUNT(id) FROM orders WHERE order_status = 'completed'")->fetchColumn();
    $avgOrderValue = $completedOrders > 0 ? $totalRevenue / $completedOrders : 0;

    // Start at the first day of the month five months ago, including this month.
    $firstMonth = new DateTimeImmutable('first day of this month');
    $fromDate = $firstMonth->modify('-5 months')->format('Y-m-d');
    $afterLastMonth = $firstMonth->modify('+1 month')->format('Y-m-d');
    $trendQuery = $pdo->prepare("SELECT DATE_FORMAT(created_at, '%Y-%m') AS month_key,
            COUNT(id) AS completed_orders, COALESCE(SUM(total_amount), 0) AS revenue
        FROM orders
        WHERE order_status = 'completed' AND created_at >= ? AND created_at < ?
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')");
    $trendQuery->execute([$fromDate, $afterLastMonth]);
    $trendRows = $trendQuery->fetchAll(PDO::FETCH_ASSOC);
    $trendByMonth = [];
    foreach ($trendRows as $row) {
        $trendByMonth[$row['month_key']] = $row;
    }

    $monthlyTrend = [];
    for ($offset = 5; $offset >= 0; $offset--) {
        $month = $firstMonth->modify("-$offset months");
        $key = $month->format('Y-m');
        $row = $trendByMonth[$key] ?? [];
        $monthlyTrend[] = [
            'month' => $key,
            'label' => $month->format('M Y'),
            'revenue' => (float)($row['revenue'] ?? 0),
            'completed_orders' => (int)($row['completed_orders'] ?? 0)
        ];
    }

    $categoryQuery = $pdo->query("SELECT c.id AS category_id, c.category_name,
            COALESCE(SUM(s.category_revenue), 0) AS category_revenue,
            COALESCE(SUM(s.items_sold), 0) AS items_sold
        FROM categories c
        LEFT JOIN products p ON c.id = p.category_id
        LEFT JOIN (
            SELECT oi.product_id, SUM(oi.quantity * oi.unit_price) AS category_revenue,
                SUM(oi.quantity) AS items_sold
            FROM order_items oi
            JOIN orders o ON o.id = oi.order_id
            WHERE o.order_status = 'completed'
            GROUP BY oi.product_id
        ) s ON s.product_id = p.id
        GROUP BY c.id, c.category_name
        ORDER BY category_revenue DESC, c.category_name ASC");
    $categorySales = $categoryQuery->fetchAll(PDO::FETCH_ASSOC);

    $topProductsQuery = $pdo->query("SELECT p.id, p.name, p.image_url, c.category_name AS category,
            SUM(oi.quantity) AS units_sold, SUM(oi.quantity * oi.unit_price) AS revenue
        FROM orders o
        JOIN order_items oi ON oi.order_id = o.id
        JOIN products p ON p.id = oi.product_id
        JOIN categories c ON c.id = p.category_id
        WHERE o.order_status = 'completed'
        GROUP BY p.id, p.name, p.image_url, c.category_name
        ORDER BY units_sold DESC, revenue DESC, p.name ASC
        LIMIT 5");
    $topProducts = $topProductsQuery->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'status' => 'success',
        'data' => [
            'total_revenue' => number_format($totalRevenue, 2, '.', ''),
            'total_orders' => $totalOrders,
            'completed_orders' => $completedOrders,
            'avg_order_value' => number_format($avgOrderValue, 2, '.', ''),
            'monthly_trend' => $monthlyTrend,
            'category_sales' => $categorySales,
            'top_products' => $topProducts
        ]
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Could not load sales analytics.'
    ]);
}
?>
