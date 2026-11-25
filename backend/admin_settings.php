<?php
require_once 'auth.php';
require_once __DIR__ . '/request_validation.php';
$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
requireApiMethod(['GET', 'POST']);
requireAdmin();
require_once 'db.php';

$userId = (int) $_SESSION['user']['id'];

if ($method === 'GET') {
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

if ($method === 'POST') {
    requireCsrfToken();
    enforceRateLimit('admin-write-user', (string)$_SESSION['user']['id'], 30, 60);
    $data = readJsonRequest(16384);
    $fullName = trim(requireJsonString($data, 'full_name', true, 400));
    $email = trim(requireJsonString($data, 'email', true, 400));
    $currentPassword = requireJsonString($data, 'current_password', true, 72);
    $newPassword = requireJsonString($data, 'new_password', false, 72);

    if ($fullName === '' || mb_strlen($fullName, 'UTF-8') > 100 || !filter_var($email, FILTER_VALIDATE_EMAIL) || mb_strlen($email, 'UTF-8') > 100) {
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

    if ($newPassword !== '' && (strlen($newPassword) < 8 || strlen($newPassword) > 72)) {
        http_response_code(422);
        echo json_encode(['status' => 'error', 'message' => 'New password must be between 8 and 72 bytes.']);
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
        $update = $pdo->prepare('UPDATE users SET full_name = ?, email = ?, password = ?, auth_version = auth_version + 1 WHERE id = ?');
        $update->execute([$fullName, $email, password_hash($newPassword, PASSWORD_DEFAULT), $userId]);
        $_SESSION['_auth_version'] = (int)($_SESSION['_auth_version'] ?? 0) + 1;
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
header('Allow: GET, POST, OPTIONS');
echo json_encode(['status' => 'error', 'message' => 'Method not allowed.']);

http_response_code(405);
echo json_encode(['status' => 'error', 'message' => 'Method not allowed.']);
