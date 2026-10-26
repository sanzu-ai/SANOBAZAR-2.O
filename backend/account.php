<?php
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/db.php';

if (empty($_SESSION['user']['id'])) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Please sign in to view your account.']);
    exit;
}

try {
    $stmt = $pdo->prepare('SELECT id, full_name, email, role, created_at FROM users WHERE id = ?');
    $stmt->execute([$_SESSION['user']['id']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$user) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Your account was not found. Please sign in again.']);
        exit;
    }
    echo json_encode(['status' => 'success', 'user' => $user]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Could not load account details.']);
}
