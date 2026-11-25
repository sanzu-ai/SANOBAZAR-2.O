<?php
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/request_validation.php';
requireApiMethod(['POST']);
header('Cache-Control: no-store');
require_once __DIR__ . '/rate_limit.php';
enforceRateLimit('password-reset-ip', rateLimitClientIp(), 10, 900);

require_once __DIR__ . '/auth.php';
requireCsrfToken();
$data = readJsonRequest(8192);
$email = strtolower(trim(requireJsonString($data, 'email', true, 100)));
if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 100) {
    apiRequestError(422, 'Enter a valid email address.');
}

// Hash the address before using it as a rate-limit identity so the storage key
// does not contain a customer's email address.
enforceRateLimit('password-reset-email', hash('sha256', $email), 3, 3600);
require_once __DIR__ . '/db.php';

$genericResponse = [
    'status' => 'success',
    'message' => 'If an account matches that email address, the password reset request has been recorded.'
];

try {
    $pdo->beginTransaction();
    $findUser = $pdo->prepare('SELECT id FROM users WHERE email = ? LIMIT 1 FOR UPDATE');
    $findUser->execute([$email]);
    $userId = $findUser->fetchColumn();

    if ($userId !== false) {
        // Keep at most one live reset credential per user. The lock on the user
        // row serializes concurrent requests for reset links.
        $removePrevious = $pdo->prepare('DELETE FROM password_reset_tokens WHERE user_id = ?');
        $removePrevious->execute([(int)$userId]);

        $token = bin2hex(random_bytes(32));
        $tokenHash = hash('sha256', $token);
        $insertToken = $pdo->prepare(
            'INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
             VALUES (?, ?, DATE_ADD(UTC_TIMESTAMP(), INTERVAL 30 MINUTE))'
        );
        $insertToken->execute([(int)$userId, $tokenHash]);

        $pdo->commit();

        // Deliver only after the token hash is committed. Mail failures remain
        // generic so account existence is not disclosed to the requester.
        try {
            require_once __DIR__ . '/email_service.php';
            sendSanoBazarPasswordResetEmail($email, $token);
        } catch (Throwable $emailError) {
            sanobazarLogException('password_reset.email_delivery_failed', $emailError);
        }

        // The raw token is used only to build the email link and is never
        // returned, persisted, or written to logs.
        unset($token, $tokenHash);
    } else {
        $pdo->commit();
    }

    echo json_encode($genericResponse, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
} catch (Throwable $error) {
    unset($token, $tokenHash);
    if ($pdo->inTransaction()) {
        try {
            $pdo->rollBack();
        } catch (Throwable $rollbackError) {
            sanobazarLogException('password_reset.request_rollback_failed', $rollbackError);
        }
    }
    sanobazarLogException('password_reset.request_failed', $error);
    http_response_code(500);
    header('Cache-Control: no-store');
    echo json_encode([
        'status' => 'error',
        'message' => 'Your request could not be completed right now. Please try again later.'
    ], JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
}
