<?php
/** Log only fixed event labels and non-sensitive exception metadata. */
function sanobazarLogException(string $event, Throwable $error): void
{
    $event = preg_match('/^[a-z0-9_.-]{1,64}$/i', $event) === 1 ? $event : 'api_error';
    $exceptionClass = preg_replace('/[^A-Za-z0-9_\\\\]/', '', get_class($error)) ?: 'Throwable';
    $sqlState = null;

    if ($error instanceof PDOException) {
        $candidate = $error->errorInfo[0] ?? $error->getCode();
        if (is_string($candidate) && preg_match('/^[A-Z0-9]{5}$/', $candidate) === 1) {
            $sqlState = $candidate;
        }
    }

    error_log(sprintf(
        '[SanoBazar] event=%s exception=%s%s',
        $event,
        $exceptionClass,
        $sqlState !== null ? ' sqlstate=' . $sqlState : ''
    ));
}
