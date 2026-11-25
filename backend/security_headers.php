<?php
/** Shared security headers and safe PHP error-display defaults for API responses. */

// Keep PHP diagnostics in the configured server log, never in API response bodies.
// error_reporting is intentionally left unchanged so PHP can still record warnings.
ini_set('display_errors', '0');
ini_set('log_errors', '1');

if (!headers_sent()) {
    header('X-Content-Type-Options: nosniff');
    header('Referrer-Policy: strict-origin-when-cross-origin');
    header('X-Frame-Options: DENY');
    header('Permissions-Policy: camera=(), microphone=(), geolocation=()');

    $isHttps = !empty($_SERVER['HTTPS']) && strtolower((string)$_SERVER['HTTPS']) !== 'off';
    if ($isHttps) {
        // Host-only policy; do not include subdomains on shared hosting domains.
        header('Strict-Transport-Security: max-age=15552000');
    }
}

require_once __DIR__ . '/safe_log.php';
