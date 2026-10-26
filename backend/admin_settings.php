<?php
require_once 'auth.php';
requireAdmin();
require_once 'db.php';

$userId = (int) $_SESSION['user']['id'];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->prepare('SELECT id, full_name, email, role, created_at FROM users WHERE id = ?');
    $stmt->execute([$userId]);
    $user = $stmt->fetch();
    if (!$user) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Admin account not found.']);
        exit;
    }
    echo json_encode(['status' => 'success', 'user' => $user]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true) ?? [];
    $fullName = trim($data['full_name'] ?? '');
    $email = trim($data['email'] ?? '');
    $currentPassword = $data['current_password'] ?? '';
    $newPassword = $data['new_password'] ?? '';

    if ($fullName === '' || strlen($fullName) > 100 || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 100) {
        http_response_code(422);
        echo json_encode(['status' => 'error', 'message' => 'Enter a valid name and email address.']);
        exit;
    }

    $stmt = $pdo->prepare('SELECT password FROM users WHERE id = ?');
    $stmt->execute([$userId]);
    $passwordHash = $stmt->fetchColumn();
    if (!$passwordHash || !password_verify($currentPassword, $passwordHash)) {
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => 'Current password is incorrect.']);
        exit;
    }

    if ($newPassword !== '' && strlen($newPassword) < 8) {
        http_response_code(422);
        echo json_encode(['status' => 'error', 'message' => 'New password must be at least 8 characters.']);
        exit;
    }

    $emailCheck = $pdo->prepare('SELECT id FROM users WHERE email = ? AND id <> ?');
    $emailCheck->execute([$email, $userId]);
    if ($emailCheck->fetch()) {
        http_response_code(409);
        echo json_encode(['status' => 'error', 'message' => 'That email address is already in use.']);
        exit;
    }

    if ($newPassword !== '') {
        $update = $pdo->prepare('UPDATE users SET full_name = ?, email = ?, password = ? WHERE id = ?');
        $update->execute([$fullName, $email, password_hash($newPassword, PASSWORD_DEFAULT), $userId]);
    } else {
        $update = $pdo->prepare('UPDATE users SET full_name = ?, email = ? WHERE id = ?');
        $update->execute([$fullName, $email, $userId]);
    }

    $_SESSION['user']['full_name'] = $fullName;
    $_SESSION['user']['email'] = $email;
    echo json_encode(['status' => 'success', 'message' => 'Account settings saved.', 'user' => $_SESSION['user']]);
    exit;
}

http_response_code(405);
echo json_encode(['status' => 'error', 'message' => 'Method not allowed.']);
