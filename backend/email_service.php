<?php
require_once __DIR__ . '/safe_log.php';

/**
 * Load server-only credentials for the signed Vercel password-reset relay.
 * Values in the local PHP config are overridden by matching environment vars.
 */
function sanoBazarEmailConfig(): array
{
    $keys = ['PASSWORD_RESET_RELAY_URL', 'PASSWORD_RESET_RELAY_HMAC_SECRET'];
    $config = [];
    $localConfigPath = __DIR__ . '/password_reset_relay.local.php';

    if (is_file($localConfigPath)) {
        $localConfig = require $localConfigPath;
        if (!is_array($localConfig)) {
            throw new RuntimeException('Password reset email configuration is invalid.');
        }
        $config = $localConfig;
    }

    foreach ($keys as $key) {
        $environmentValue = getenv($key);
        if ($environmentValue !== false && $environmentValue !== '') {
            $config[$key] = $environmentValue;
        }
    }

    foreach ($keys as $required) {
        if (!isset($config[$required]) || !is_string($config[$required]) || trim($config[$required]) === '') {
            throw new RuntimeException('Password reset email configuration is incomplete.');
        }
    }

    $relayUrl = parse_url($config['PASSWORD_RESET_RELAY_URL']);
    if (!is_array($relayUrl) || strtolower($relayUrl['scheme'] ?? '') !== 'https' ||
        empty($relayUrl['host']) || ($relayUrl['path'] ?? '') !== '/api/send-password-reset' ||
        isset($relayUrl['user']) || isset($relayUrl['pass']) || isset($relayUrl['query']) || isset($relayUrl['fragment']) ||
        filter_var($config['PASSWORD_RESET_RELAY_URL'], FILTER_VALIDATE_URL) === false) {
        throw new RuntimeException('Password reset email relay URL is invalid.');
    }

    // Require a 256-bit key encoded as 64 hex characters, shared with Vercel.
    if (preg_match('/^[a-f0-9]{64}$/iD', $config['PASSWORD_RESET_RELAY_HMAC_SECRET']) !== 1) {
        throw new RuntimeException('Password reset relay authentication is unavailable.');
    }

    return $config;
}

/** Send only the fixed password-reset message through the authenticated relay. */
function sendSanoBazarPasswordResetEmail(string $recipient, string $token): void
{
    $recipient = strtolower(trim($recipient));
    if (!filter_var($recipient, FILTER_VALIDATE_EMAIL) || strlen($recipient) > 100 ||
        preg_match('/[\r\n]/', $recipient) || preg_match('/^[a-f0-9]{64}$/iD', $token) !== 1) {
        throw new RuntimeException('Password reset email request is invalid.');
    }

    $config = sanoBazarEmailConfig();
    if (!extension_loaded('curl')) {
        throw new RuntimeException('Secure password reset email delivery is unavailable.');
    }

    $timestamp = (string)time();
    $requestId = bin2hex(random_bytes(16));
    $payload = json_encode(
        ['email' => $recipient, 'token' => strtolower($token)],
        JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR
    );
    $signatureMessage = "sanobazar-reset-email-v1\n" . $timestamp . "\n" . $requestId . "\n" . hash('sha256', $payload);
    $signature = hash_hmac('sha256', $signatureMessage, $config['PASSWORD_RESET_RELAY_HMAC_SECRET']);

    $curl = curl_init($config['PASSWORD_RESET_RELAY_URL']);
    if ($curl === false) {
        throw new RuntimeException('Password reset email delivery failed.');
    }

    try {
        curl_setopt_array($curl, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $payload,
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json',
                'Accept: application/json',
                'X-SB-Timestamp: ' . $timestamp,
                'X-SB-Request-Id: ' . $requestId,
                'X-SB-Signature: ' . $signature
            ],
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => false,
            CURLOPT_CONNECTTIMEOUT => 5,
            CURLOPT_TIMEOUT => 15,
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_SSL_VERIFYHOST => 2,
            CURLOPT_MAXREDIRS => 0
        ]);

        $response = curl_exec($curl);
        $status = (int)curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
        if (!is_string($response) || $status !== 202) {
            throw new RuntimeException('Password reset email delivery failed.');
        }
    } finally {
        curl_close($curl);
        unset($payload, $signatureMessage, $signature, $token);
    }
}
