<?php
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/request_validation.php';
requireApiMethod(['POST']);
$data = readJsonRequest(16384);
$rememberMe = optionalJsonBoolean($data, 'remember_me');
define('SANObazar_SESSION_LIFETIME', $rememberMe ? 2592000 : 0);
ini_set('session.gc_maxlifetime', (string)($rememberMe ? 2592000 : 1800));
session_set_cookie_params([
    'lifetime' => $rememberMe ? 2592000 : 0,
    'path' => '/',
    'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
    'httponly' => true,
    'samesite' => 'Lax'
]);

require_once __DIR__ . '/rate_limit.php';
enforceRateLimit('login-ip', rateLimitClientIp(), 120, 900);

require_once "auth.php";
requireCsrfToken();

$email = trim(requireJsonString($data, 'email', true, 100));
$password = requireJsonString($data, 'password', true, 72);
if (!filter_var($email, FILTER_VALIDATE_EMAIL) || mb_strlen($email, 'UTF-8') > 100) {
    apiRequestError(422, 'Enter a valid email address and password.');
}
$normalizedEmail = strtolower($email);

enforceRateLimit('login-account', $normalizedEmail, 10, 900);
require_once "db.php";

try {
    // Fetch user by email
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    // Verify user exists AND password hash matches
    if ($user && is_string($user['password']) && $user['password'] !== '' && password_verify($password, $user['password'])) {
        clearRateLimit('login-account', $normalizedEmail);
        session_regenerate_id(true);
        getCsrfToken(true);
        if ($rememberMe) {
            setcookie('sanobazar_remember', '1', [
                'expires' => time() + 2592000,
                'path' => '/',
                'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
                'httponly' => true,
                'samesite' => 'Lax'
            ]);
        } else {
            setcookie('sanobazar_remember', '', [
                'expires' => time() - 3600,
                'path' => '/',
                'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
                'httponly' => true,
                'samesite' => 'Lax'
            ]);
        }
        $_SESSION['user'] = [
            'id' => (int) $user['id'],
            'full_name' => $user['full_name'],
            'email' => $user['email'],
            'role' => $user['role']
        ];
        $_SESSION['_auth_version'] = (int)($user['auth_version'] ?? 0);
        $_SESSION['_remember_me'] = $rememberMe;
        $_SESSION['_last_activity'] = time();
        echo json_encode([
            "status"  => "success",
            "message" => "Login successful!",
            "user" => $_SESSION['user']
        ]);
    } else {
        echo json_encode(["status" => "error", "message" => "Invalid email or password."]);
    }

} catch (PDOException $e) {
    sanobazarLogException('customer.login_failed', $e);
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Unable to sign in right now. Please try again later."]);
}
?>
