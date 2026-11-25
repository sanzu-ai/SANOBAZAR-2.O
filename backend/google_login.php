<?php
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/request_validation.php';
requireApiMethod(['POST']);
$inputData = readJsonRequest(24576);
$rememberMe = optionalJsonBoolean($inputData, 'remember_me');
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
header('Cache-Control: no-store');

function googleAuthRespond(int $statusCode, array $payload): void
{
    http_response_code($statusCode);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}

enforceRateLimit('google-login-ip', rateLimitClientIp(), 30, 600);
require_once __DIR__ . '/auth.php';
requireCsrfToken();

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin === '' || !in_array($origin, sanobazarAllowedOrigins(), true)) {
    googleAuthRespond(403, ['status' => 'error', 'message' => 'This sign-in request is not allowed.']);
}

$credential = requireJsonString($inputData, 'credential', true, 12000);
$flow = array_key_exists('flow', $inputData) ? requireJsonString($inputData, 'flow', true, 16) : 'login';
$termsAccepted = optionalJsonBoolean($inputData, 'terms_accepted');
if (!in_array($flow, ['login', 'register', 'link'], true)) {
    googleAuthRespond(400, ['status' => 'error', 'message' => 'Invalid sign-in flow.']);
}
if ($flow === 'register' && !$termsAccepted) {
    googleAuthRespond(400, ['status' => 'error', 'message' => 'Please accept the Terms & Conditions before creating your account with Google.']);
}
$autoloadPath = __DIR__ . '/vendor/autoload.php';
if (!is_file($autoloadPath)) {
    error_log('Google sign-in is unavailable: Composer dependencies are not installed.');
    googleAuthRespond(503, ['status' => 'error', 'message' => 'Google sign-in is not configured on the server yet.']);
}
require_once $autoloadPath;

$googleClientId = getenv('SANObazar_GOOGLE_CLIENT_ID') ?: '705585739156-gojqkl6n0egf5itpmjr993bu7r2rvj13.apps.googleusercontent.com';

try {
    $googleAuth = new Google\Auth\AccessToken();
    if (function_exists('error_clear_last')) {
        error_clear_last();
    }
    $googlePayload = $googleAuth->verify($credential, [
        'audience' => $googleClientId,
        'throwException' => true
    ]);
} catch (Throwable $error) {
    if (getenv('SANObazar_ENV') === 'development') {
        $diagnostic = [
            'exception_class' => get_class($error),
        ];
        $phpError = error_get_last();
        if (is_array($phpError)) {
            $diagnostic['php_error'] = [
                'type' => $phpError['type'] ?? null,
                'category' => 'php_runtime_error'
            ];
        }
        error_log('Google ID token verification diagnostic (development): ' . json_encode($diagnostic, JSON_UNESCAPED_SLASHES | JSON_INVALID_UTF8_SUBSTITUTE));
    } else {
        error_log('Google ID token verification failed.');
    }
    googleAuthRespond(401, ['status' => 'error', 'message' => 'Google sign-in could not be verified. Please try again.']);
}

if (!is_array($googlePayload)) {
    googleAuthRespond(401, ['status' => 'error', 'message' => 'Google sign-in could not be verified. Please try again.']);
}

$audience = $googlePayload['aud'] ?? null;
$audiences = is_array($audience) ? $audience : [$audience];
$issuer = $googlePayload['iss'] ?? '';
$expiration = filter_var($googlePayload['exp'] ?? null, FILTER_VALIDATE_INT);
$emailVerified = filter_var($googlePayload['email_verified'] ?? false, FILTER_VALIDATE_BOOLEAN);
$googleSub = $googlePayload['sub'] ?? '';
$email = strtolower(trim((string)($googlePayload['email'] ?? '')));
$fullName = trim((string)($googlePayload['name'] ?? ''));

if (!in_array($googleClientId, $audiences, true) ||
    !in_array($issuer, ['accounts.google.com', 'https://accounts.google.com'], true) ||
    $expiration === false || $expiration <= time() ||
    !$emailVerified ||
    !is_string($googleSub) || $googleSub === '' || strlen($googleSub) > 255 ||
    !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 100) {
    googleAuthRespond(401, ['status' => 'error', 'message' => 'Google sign-in could not be verified. Please try again.']);
}

enforceRateLimit('google-account', (string)$googleSub, 20, 3600);

if ($fullName === '') {
    $fullName = strstr($email, '@', true) ?: 'Sano Bazar customer';
}
$fullName = function_exists('mb_substr') ? mb_substr($fullName, 0, 100, 'UTF-8') : substr($fullName, 0, 100);

try {
    require_once __DIR__ . '/db.php';

    // The stable Google subject is the primary account match.
    $findByGoogleSub = $pdo->prepare('SELECT id, full_name, email, role, auth_version FROM users WHERE google_sub = ? LIMIT 1');
    $findByGoogleSub->execute([$googleSub]);
    $user = $findByGoogleSub->fetch();

    if (!$user) {
        $findByEmail = $pdo->prepare('SELECT id, full_name, email, role, password, google_sub, auth_version FROM users WHERE email = ? LIMIT 1');
        $findByEmail->execute([$email]);
        $existingUser = $findByEmail->fetch();

        if ($existingUser) {
            if ($existingUser['role'] === 'admin') {
                googleAuthRespond(403, ['status' => 'error', 'message' => 'Google sign-in cannot be linked to an administrator account. Use the administrator password login.']);
            }
            if ($existingUser['role'] !== 'customer') {
                googleAuthRespond(403, ['status' => 'error', 'message' => 'This account cannot be linked to Google sign-in.']);
            }
            if ($existingUser['google_sub'] !== null && $existingUser['google_sub'] !== $googleSub) {
                googleAuthRespond(409, ['status' => 'error', 'message' => 'This email is already linked to a different Google account.']);
            }

            if ($existingUser['google_sub'] === null) {
                if ($flow !== 'link') {
                    if ($flow === 'register') {
                        googleAuthRespond(409, [
                            'status' => 'error',
                            'code' => 'PASSWORD_REAUTH_REQUIRED',
                            'message' => 'This email already has an account. Sign in with its password, then continue with Google to link it.'
                        ]);
                    }
                    googleAuthRespond(409, [
                        'status' => 'error',
                        'code' => 'PASSWORD_REAUTH_REQUIRED',
                        'message' => 'This account uses a password. Enter its password to securely link Google.'
                    ]);
                }

                $linkPassword = $inputData['password'] ?? null;
                $passwordHash = $existingUser['password'] ?? null;
                if (!is_string($linkPassword) || $linkPassword === '' || strlen($linkPassword) > 72 ||
                    !is_string($passwordHash) || $passwordHash === '' || !password_verify($linkPassword, $passwordHash)) {
                    googleAuthRespond(401, [
                        'status' => 'error',
                        'code' => 'REAUTHENTICATION_FAILED',
                        'message' => 'The password could not be verified. Check it and try again.'
                    ]);
                }

                // Include the verified hash in the condition so a concurrent password change
                // or another account-link request cannot invalidate the reauthentication check.
                $linkAccount = $pdo->prepare('UPDATE users SET google_sub = ? WHERE id = ? AND google_sub IS NULL AND role = ? AND password = ?');
                $linkAccount->execute([$googleSub, $existingUser['id'], 'customer', $passwordHash]);
            }

            $findByGoogleSub->execute([$googleSub]);
            $user = $findByGoogleSub->fetch();
            if (!$user || (int)$user['id'] !== (int)$existingUser['id']) {
                googleAuthRespond(409, ['status' => 'error', 'message' => 'This account could not be linked safely. Please contact support.']);
            }
        } else {
            if ($flow !== 'register') {
                googleAuthRespond(404, ['status' => 'error', 'message' => 'No account is linked to this Google account. Choose Google sign-up or register first.']);
            }

            $createUser = $pdo->prepare('INSERT INTO users (full_name, email, phone_number, password, role, terms_accepted_at, google_sub) VALUES (?, ?, NULL, NULL, ?, NOW(), ?)');
            $createUser->execute([$fullName, $email, 'customer', $googleSub]);

            $findByGoogleSub->execute([$googleSub]);
            $user = $findByGoogleSub->fetch();
        }
    }

    if (!$user) {
        googleAuthRespond(500, ['status' => 'error', 'message' => 'Google sign-in could not be completed. Please try again.']);
    }

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
        'id' => (int)$user['id'],
        'full_name' => $user['full_name'],
        'email' => $user['email'],
        'role' => $user['role']
    ];
    $_SESSION['_auth_version'] = (int)($user['auth_version'] ?? 0);
    $_SESSION['_remember_me'] = $rememberMe;
    $_SESSION['_last_activity'] = time();

    googleAuthRespond(200, [
        'status' => 'success',
        'message' => 'Login successful!',
        'user' => $_SESSION['user']
    ]);
} catch (PDOException $error) {
    sanobazarLogException('google.account_login_failed', $error);
    googleAuthRespond(500, ['status' => 'error', 'message' => 'Google sign-in could not be completed right now. Please try again later.']);
}
?>
