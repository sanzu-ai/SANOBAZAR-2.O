<?php
require_once __DIR__ . '/security_headers.php';
/** Small file-backed fixed-window limiter for shared hosting without Redis. */
function rateLimitStorageDirectory(): string
{
    $directory = __DIR__ . '/rate-limit-storage';
    if (!is_dir($directory) && !@mkdir($directory, 0700, true) && !is_dir($directory)) {
        throw new RuntimeException('Rate limit storage is unavailable.');
    }
    return $directory;
}

function rateLimitSecret(string $directory): string
{
    $configuredSecret = getenv('SANOBAZAR_RATE_LIMIT_SECRET') ?: '';
    if (strlen($configuredSecret) >= 32) {
        return $configuredSecret;
    }

    $secretPath = $directory . '/.secret';
    for ($attempt = 0; $attempt < 3; $attempt++) {
        if (is_file($secretPath)) {
            $secret = @file_get_contents($secretPath);
            if (is_string($secret) && strlen($secret) >= 32) {
                return $secret;
            }
        }

        $handle = @fopen($secretPath, 'x+b');
        if (is_resource($handle)) {
            try {
                $secret = random_bytes(32);
                if (fwrite($handle, $secret) !== 32 || !fflush($handle)) {
                    throw new RuntimeException('Rate limit storage is unavailable.');
                }
                return $secret;
            } finally {
                fclose($handle);
            }
        }
        usleep(10000);
    }

    throw new RuntimeException('Rate limit storage is unavailable.');
}

function rateLimitClientIp(): string
{
    $ip = trim($_SERVER['REMOTE_ADDR'] ?? '');
    return filter_var($ip, FILTER_VALIDATE_IP) ? $ip : 'unknown';
}

function openRateLimitBucketLocked(string $path)
{
    for ($attempt = 0; $attempt < 3; $attempt++) {
        $handle = @fopen($path, 'c+');
        if (!is_resource($handle)) {
            throw new RuntimeException('Rate limit storage is unavailable.');
        }
        if (!flock($handle, LOCK_EX)) {
            fclose($handle);
            throw new RuntimeException('Rate limit storage is unavailable.');
        }

        $opened = fstat($handle);
        $named = @stat($path);
        if (is_array($opened) && is_array($named) &&
            $opened['dev'] === $named['dev'] && $opened['ino'] === $named['ino']) {
            return $handle;
        }

        flock($handle, LOCK_UN);
        fclose($handle);
    }

    throw new RuntimeException('Rate limit storage is unavailable.');
}

function maybePruneRateLimitStorage(string $directory): void
{
    if (random_int(1, 128) !== 1) {
        return;
    }

    $markerPath = $directory . '/.cleanup';
    $marker = @fopen($markerPath, 'c+');
    if (!is_resource($marker) || !flock($marker, LOCK_EX)) {
        if (is_resource($marker)) fclose($marker);
        return;
    }

    rewind($marker);
    $lastCleanup = (int)stream_get_contents($marker);
    $now = time();
    if ($now - $lastCleanup < 3600) {
        flock($marker, LOCK_UN);
        fclose($marker);
        return;
    }

    rewind($marker);
    ftruncate($marker, 0);
    fwrite($marker, (string)$now);
    fflush($marker);
    flock($marker, LOCK_UN);
    fclose($marker);

    $cutoff = $now - 172800;
    $removed = 0;
    foreach (glob($directory . '/bucket-*.json') ?: [] as $path) {
        if ($removed >= 250 || @filemtime($path) >= $cutoff) {
            continue;
        }

        try {
            $handle = openRateLimitBucketLocked($path);
            if (@filemtime($path) < $cutoff && @unlink($path)) {
                $removed++;
            }
            flock($handle, LOCK_UN);
            fclose($handle);
        } catch (Throwable $error) {
            // A cleanup failure must not interrupt an otherwise valid API request.
        }
    }
}

function enforceRateLimit(string $scope, string $identity, int $limit, int $windowSeconds): void
{
    try {
        $directory = rateLimitStorageDirectory();
        maybePruneRateLimitStorage($directory);
        $secret = rateLimitSecret($directory);
        $identityHash = hash_hmac('sha256', $scope . "\0" . $identity, $secret);
        $path = $directory . '/bucket-' . $identityHash . '.json';
        $now = time();
        $windowStart = intdiv($now, $windowSeconds) * $windowSeconds;

        $handle = openRateLimitBucketLocked($path);

        try {
            rewind($handle);
            $stored = stream_get_contents($handle);
            $state = is_string($stored) ? json_decode($stored, true) : null;
            $storedWindow = is_array($state) ? (int)($state['window_start'] ?? -1) : -1;
            $count = is_array($state) ? max(0, (int)($state['count'] ?? 0)) : 0;

            if ($storedWindow !== $windowStart) {
                $storedWindow = $windowStart;
                $count = 0;
            }

            if ($count >= $limit) {
                flock($handle, LOCK_UN);
                fclose($handle);
                rateLimitRespond(429, max(1, $windowStart + $windowSeconds - $now));
            }

            $encoded = json_encode(['window_start' => $windowStart, 'count' => $count + 1]);
            if (!is_string($encoded)) {
                throw new RuntimeException('Rate limit storage is unavailable.');
            }

            rewind($handle);
            if (!ftruncate($handle, 0) || fwrite($handle, $encoded) !== strlen($encoded) || !fflush($handle)) {
                throw new RuntimeException('Rate limit storage is unavailable.');
            }
        } finally {
            if (is_resource($handle)) {
                flock($handle, LOCK_UN);
                fclose($handle);
            }
        }
    } catch (Throwable $error) {
        error_log('Rate limit storage is unavailable.');
        rateLimitRespond(503, 30);
    }
}

function clearRateLimit(string $scope, string $identity): void
{
    try {
        $directory = rateLimitStorageDirectory();
        $secret = rateLimitSecret($directory);
        $identityHash = hash_hmac('sha256', $scope . "\0" . $identity, $secret);
        $path = $directory . '/bucket-' . $identityHash . '.json';
        $handle = openRateLimitBucketLocked($path);
        try {
            rewind($handle);
            ftruncate($handle, 0);
            fwrite($handle, json_encode(['window_start' => -1, 'count' => 0]));
            fflush($handle);
        } finally {
            flock($handle, LOCK_UN);
            fclose($handle);
        }
    } catch (Throwable $error) {
        error_log('Rate limit state could not be cleared.');
    }
}

function rateLimitRespond(int $statusCode, int $retryAfter): void
{
    http_response_code($statusCode);
    header('Retry-After: ' . max(1, $retryAfter));
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode([
        'status' => 'error',
        'message' => $statusCode === 429
            ? 'Too many requests. Please wait and try again.'
            : 'This service is temporarily unavailable. Please try again shortly.'
    ]);
    exit;
}
