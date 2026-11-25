<?php
function getCsrfToken(bool $rotate = false): string
{
    if ($rotate || !isset($_SESSION['_csrf_token']) || !is_string($_SESSION['_csrf_token'])) {
        $_SESSION['_csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['_csrf_token'];
}

function requireCsrfToken(): void
{
    $expected = $_SESSION['_csrf_token'] ?? '';
    $provided = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    if (!is_string($expected) || $expected === '' || !is_string($provided) ||
        $provided === '' || !hash_equals($expected, $provided)) {
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => 'Your request could not be verified. Refresh the page and try again.']);
        exit;
    }
}
