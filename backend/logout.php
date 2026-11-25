<?php
require_once __DIR__ . '/security_headers.php';
if (!in_array($_SERVER['REQUEST_METHOD'] ?? '', ['POST', 'OPTIONS'], true)) {
    header('Content-Type: application/json; charset=UTF-8');
    header('Allow: POST, OPTIONS');
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed.']);
    exit;
}

require_once 'auth.php';
requireCsrfToken();

$_SESSION = [];
$isSecure = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
if (ini_get('session.use_cookies')) {
    $params = session_get_cookie_params();
    $sessionCookie = [
        'expires' => time() - 42000,
        'path' => $params['path'] ?: '/',
        'secure' => $params['secure'],
        'httponly' => $params['httponly'],
        'samesite' => $params['samesite'] ?: 'Lax'
    ];
    if ($params['domain'] !== '') {
        $sessionCookie['domain'] = $params['domain'];
    }
    setcookie(session_name(), '', $sessionCookie);
}
setcookie('sanobazar_remember', '', [
    'expires' => time() - 3600,
    'path' => '/',
    'secure' => $isSecure,
    'httponly' => true,
    'samesite' => 'Lax'
]);
session_destroy();

echo json_encode(['status' => 'success']);
