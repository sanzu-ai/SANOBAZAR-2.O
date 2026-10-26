<?php
require_once 'auth.php';
requireAdmin();
require_once 'db.php';

try {
    $stmt = $pdo->query("SELECT u.id, u.full_name, u.email, u.role, u.created_at,
            COUNT(o.id) AS order_count
        FROM users u
        LEFT JOIN orders o ON o.user_id = u.id
        GROUP BY u.id, u.full_name, u.email, u.role, u.created_at
        ORDER BY u.created_at DESC");
    echo json_encode(['status' => 'success', 'data' => $stmt->fetchAll()]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Unable to load users.']);
}
