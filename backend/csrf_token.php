<?php
require_once __DIR__ . '/cors.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET') {
    header('Allow: GET, OPTIONS');
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed.']);
    exit;
}

require_once __DIR__ . '/rate_limit.php';
enforceRateLimit('csrf-token-ip', rateLimitClientIp(), 120, 60);
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/csrf.php';
header('Cache-Control: no-store, private');
echo json_encode(['status' => 'success', 'csrf_token' => getCsrfToken()]);
