<?php
// Shared exact-origin CORS policy runs before session startup or API output.
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/rate_limit.php';

if (session_status() !== PHP_SESSION_ACTIVE) {
    // Enforce cookie-only session IDs and strict ID validation before starting the session.
    ini_set('session.use_strict_mode', '1');
    ini_set('session.use_only_cookies', '1');

    $rememberSession = defined('SANObazar_SESSION_LIFETIME')
        ? SANObazar_SESSION_LIFETIME > 0
        : (($_COOKIE['sanobazar_remember'] ?? '') === '1');
    $sessionLifetime = $rememberSession ? 2592000 : 0;
    ini_set('session.gc_maxlifetime', (string)($rememberSession ? 2592000 : 1800));
    if (!defined('SANObazar_SESSION_LIFETIME')) {
        session_set_cookie_params([
            'lifetime' => $sessionLifetime,
            'path' => '/',
            'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
            'httponly' => true,
            'samesite' => 'Lax'
        ]);
    }
    session_start();

    if (!empty($_SESSION['user'])) {
        $now = time();
        if (array_key_exists('_remember_me', $_SESSION) && is_bool($_SESSION['_remember_me'])) {
            $rememberSession = $_SESSION['_remember_me'];
        } else {
            // Seed metadata for sessions created before inactivity tracking was added.
            $rememberSession = (($_COOKIE['sanobazar_remember'] ?? '') === '1');
            $_SESSION['_remember_me'] = $rememberSession;
        }

        $idleTimeout = $rememberSession ? 2592000 : 1800;
        $lastActivity = $_SESSION['_last_activity'] ?? null;
        $invalidActivity = $lastActivity !== null &&
            (!is_numeric($lastActivity) || (int)$lastActivity > $now + 60 || $now - (int)$lastActivity > $idleTimeout);

        if ($invalidActivity) {
            $_SESSION = [];
            // Invalidate the expired ID while keeping this request able to create a fresh session.
            session_regenerate_id(true);
            setcookie('sanobazar_remember', '', [
                'expires' => $now - 3600,
                'path' => '/',
                'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
                'httponly' => true,
                'samesite' => 'Lax'
            ]);
        } else {
            $_SESSION['_remember_me'] = $rememberSession;
            $_SESSION['_last_activity'] = $now;
            ini_set('session.gc_maxlifetime', (string)$idleTimeout);

            if ($rememberSession) {
                $params = session_get_cookie_params();
                $sessionCookie = [
                    'expires' => $now + 2592000,
                    'path' => $params['path'] ?: '/',
                    'secure' => $params['secure'],
                    'httponly' => $params['httponly'],
                    'samesite' => $params['samesite'] ?: 'Lax'
                ];
                if (!empty($params['domain'])) {
                    $sessionCookie['domain'] = $params['domain'];
                }
                setcookie(session_name(), session_id(), $sessionCookie);

                setcookie('sanobazar_remember', '1', [
                    'expires' => $now + 2592000,
                    'path' => '/',
                    'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
                    'httponly' => true,
                    'samesite' => 'Lax'
                ]);
            }
        }
    }
}

require_once __DIR__ . '/csrf.php';

/** Invalidate a session whose account authentication version is no longer current. */
function invalidateCurrentAuthSession(): void
{
    $_SESSION = [];
    session_regenerate_id(true);
    setcookie('sanobazar_remember', '', [
        'expires' => time() - 3600,
        'path' => '/',
        'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
        'httponly' => true,
        'samesite' => 'Lax'
    ]);
}

function sessionVersionRejected(): void
{
    invalidateCurrentAuthSession();
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Your session is no longer valid. Please sign in again.']);
    exit;
}

/** Validate a signed-in customer's session against the current user record. */
function requireAuthenticatedUserId(): int
{
    $userId = filter_var($_SESSION['user']['id'] ?? null, FILTER_VALIDATE_INT);
    $sessionVersion = filter_var($_SESSION['_auth_version'] ?? null, FILTER_VALIDATE_INT);
    if ($userId === false || $userId < 1 || $sessionVersion === false || $sessionVersion < 0) {
        sessionVersionRejected();
    }

    require_once __DIR__ . '/db.php';
    try {
        $versionQuery = $pdo->prepare('SELECT auth_version FROM users WHERE id = ? LIMIT 1');
        $versionQuery->execute([$userId]);
        $currentVersion = $versionQuery->fetchColumn();
    } catch (PDOException $error) {
        sanobazarLogException('auth.session_version_check_failed', $error);
        http_response_code(503);
        echo json_encode(['status' => 'error', 'message' => 'Your session could not be verified right now.']);
        exit;
    }

    if ($currentVersion === false || !is_numeric($currentVersion) || (int)$currentVersion !== (int)$sessionVersion) {
        sessionVersionRejected();
    }

    return (int)$userId;
}

function requireAdmin(): void
{
    if (empty($_SESSION['user']) || ($_SESSION['user']['role'] ?? '') !== 'admin') {
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => 'Admin access required.']);
        exit;
    }

    $userId = filter_var($_SESSION['user']['id'] ?? null, FILTER_VALIDATE_INT);
    $sessionVersion = filter_var($_SESSION['_auth_version'] ?? null, FILTER_VALIDATE_INT);
    if ($userId === false || $userId < 1 || $sessionVersion === false || $sessionVersion < 0) {
        invalidateAdminSession();
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => 'Admin access required.']);
        exit;
    }

    enforceRateLimit('admin-api-user', (string)$userId, 240, 60);

    // Recheck only admin sessions so out-of-band role changes take effect promptly.
    require_once __DIR__ . '/db.php';
    try {
        $roleQuery = $pdo->prepare('SELECT role, auth_version FROM users WHERE id = ? LIMIT 1');
        $roleQuery->execute([$userId]);
        $currentUser = $roleQuery->fetch(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        sanobazarLogException('auth.admin_role_check_failed', $e);
        http_response_code(503);
        echo json_encode(['status' => 'error', 'message' => 'Admin access could not be verified right now.']);
        exit;
    }

    if (!$currentUser || !is_numeric($currentUser['auth_version'] ?? null) ||
        (int)$currentUser['auth_version'] !== (int)$sessionVersion) {
        sessionVersionRejected();
    }

    if (($currentUser['role'] ?? null) !== 'admin') {
        invalidateAdminSession();
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => 'Admin access required.']);
        exit;
    }

}

function invalidateAdminSession(): void
{
    invalidateCurrentAuthSession();
}
