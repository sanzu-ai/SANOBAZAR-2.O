<?php
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/request_validation.php';
requireApiMethod(['POST']);
header('Cache-Control: no-store');
require_once __DIR__ . '/rate_limit.php';
enforceRateLimit('password-reset-confirm-ip', rateLimitClientIp(), 20, 900);

require_once __DIR__ . '/auth.php';
requireCsrfToken();
$data = readJsonRequest(8192);
$token = requireJsonString($data, 'token', true, 64);
$password = requireJsonString($data, 'password', true, 72);
$passwordConfirmation = requireJsonString($data, 'password_confirmation', true, 72);

if (!preg_match('/^[a-f0-9]{64}$/iD', $token) ||
    strlen($password) < 8 || strlen($password) > 72 ||
    $password !== $passwordConfirmation) {
    apiRequestError(422, 'The reset link or new password is invalid. Check the details and try again.');
}

$tokenHash = hash('sha256', $token);
enforceRateLimit('password-reset-token', $tokenHash, 5, 900);
unset($token, $passwordConfirmation);
require_once __DIR__ . '/db.php';

try {
    $pdo->beginTransaction();
    $findToken = $pdo->prepare(
        'SELECT user_id FROM password_reset_tokens
         WHERE token_hash = ? AND consumed_at IS NULL AND expires_at > UTC_TIMESTAMP()
         LIMIT 1 FOR UPDATE'
    );
    $findToken->execute([$tokenHash]);
    $userId = $findToken->fetchColumn();

    if ($userId === false) {
        $pdo->rollBack();
        apiRequestError(400, 'This password reset link is invalid or has expired. Request a new one.');
    }

    $passwordHash = password_hash($password, PASSWORD_DEFAULT);
    unset($password);
    if (!is_string($passwordHash)) {
        throw new RuntimeException('Password hashing failed.');
    }

    // The version increment revokes every session created with the prior value.
    // The password may be NULL for Google-only users; their Google identity and
    // role are intentionally left unchanged.
    $updateUser = $pdo->prepare(
        'UPDATE users SET password = ?, auth_version = auth_version + 1 WHERE id = ?'
    );
    $updateUser->execute([$passwordHash, (int)$userId]);
    if ($updateUser->rowCount() !== 1) {
        $pdo->rollBack();
        apiRequestError(400, 'This password reset link is invalid or has expired. Request a new one.');
    }

    $consumeTokens = $pdo->prepare(
        'UPDATE password_reset_tokens SET consumed_at = UTC_TIMESTAMP()
         WHERE user_id = ? AND consumed_at IS NULL'
    );
    $consumeTokens->execute([(int)$userId]);
    $pdo->commit();

    echo json_encode([
        'status' => 'success',
        'message' => 'Your password has been reset. Sign in with your new password.'
    ], JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
} catch (Throwable $error) {
    if ($pdo->inTransaction()) {
        try {
            $pdo->rollBack();
        } catch (Throwable $rollbackError) {
            sanobazarLogException('password_reset.completion_rollback_failed', $rollbackError);
        }
    }
    sanobazarLogException('password_reset.completion_failed', $error);
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Your password could not be reset right now. Please try again later.'
    ], JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
}
