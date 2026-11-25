<?php
require_once __DIR__ . '/security_headers.php';
/**
 * Shared credentialed CORS and browser-origin policy for the PHP API.
 * Configure SANOBAZAR_ALLOWED_ORIGINS as a comma-separated list of exact origins.
 */
function sanobazarAllowedOrigins(): array
{
    $origins = [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:5174',
        'http://127.0.0.1:5174',
        'https://sanobazar.infinityfree.me',
        'https://sano-bazar-preview.vercel.app'
    ];
    $configured = getenv('SANOBAZAR_ALLOWED_ORIGINS') ?: '';

    foreach (explode(',', $configured) as $origin) {
        $origin = rtrim(trim($origin), '/');
        if ($origin !== '' && filter_var($origin, FILTER_VALIDATE_URL)) {
            $parts = parse_url($origin);
            if (is_array($parts) && isset($parts['scheme'], $parts['host']) &&
                in_array(strtolower($parts['scheme']), ['http', 'https'], true) &&
                !isset($parts['user']) && !isset($parts['pass']) &&
                !isset($parts['query']) && !isset($parts['fragment']) &&
                (!isset($parts['path']) || $parts['path'] === '')) {
                $origins[] = $origin;
            }
        }
    }

    return array_values(array_unique($origins));
}

function sanobazarRefererOrigin(string $referer): ?string
{
    $parts = parse_url($referer);
    if (!is_array($parts) || empty($parts['scheme']) || empty($parts['host']) ||
        !in_array(strtolower($parts['scheme']), ['http', 'https'], true) ||
        isset($parts['user']) || isset($parts['pass'])) {
        return null;
    }

    $origin = strtolower($parts['scheme']) . '://' . strtolower($parts['host']);
    if (isset($parts['port'])) {
        $origin .= ':' . (int)$parts['port'];
    }
    return $origin;
}

function sanobazarCorsReject(int $status, string $message): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode(['status' => 'error', 'message' => $message]);
    exit;
}

$requestMethod = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
$requestOriginHeader = trim($_SERVER['HTTP_ORIGIN'] ?? '');
$requestOrigin = $requestOriginHeader !== ''
    ? $requestOriginHeader
    : sanobazarRefererOrigin(trim($_SERVER['HTTP_REFERER'] ?? ''));
$allowedOrigins = sanobazarAllowedOrigins();
$unsafeMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];

header('Vary: Origin');
header('Access-Control-Allow-Headers: Content-Type, X-CSRF-Token');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Max-Age: 600');
header('Content-Type: application/json; charset=UTF-8');

if ($requestOrigin !== null && $requestOrigin !== '' && !in_array($requestOrigin, $allowedOrigins, true)) {
    sanobazarCorsReject(403, 'This request origin is not allowed.');
}

if (in_array($requestMethod, $unsafeMethods, true) && ($requestOrigin === null || $requestOrigin === '')) {
    sanobazarCorsReject(403, 'A valid request origin is required.');
}

if ($requestOrigin !== null && $requestOrigin !== '') {
    header('Access-Control-Allow-Origin: ' . $requestOrigin);
    header('Access-Control-Allow-Credentials: true');
}

if ($requestMethod === 'OPTIONS') {
    http_response_code(204);
    exit;
}
