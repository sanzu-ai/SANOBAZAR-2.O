<?php
/** Shared request guards for PHP API endpoints. */
require_once __DIR__ . '/security_headers.php';

const SANObazar_MAX_DB_INT = 2147483647;

function requireApiMethod(array $allowedMethods): void
{
    $method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
    $allowHeader = implode(', ', [...$allowedMethods, 'OPTIONS']);

    if ($method === 'OPTIONS') {
        header('Allow: ' . $allowHeader);
        header('Access-Control-Allow-Methods: ' . $allowHeader);
        http_response_code(204);
        exit;
    }

    if (!in_array($method, $allowedMethods, true)) {
        header('Allow: ' . $allowHeader);
        apiRequestError(405, 'Method not allowed.');
    }
}
function apiRequestError(int $statusCode, string $message): void
{
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode(['status' => 'error', 'message' => $message], JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}

function readJsonRequest(int $maximumBytes): array
{
    $contentType = $_SERVER['CONTENT_TYPE'] ?? $_SERVER['HTTP_CONTENT_TYPE'] ?? '';
    $mediaType = strtolower(trim(explode(';', $contentType, 2)[0]));
    if ($mediaType !== 'application/json') {
        apiRequestError(415, 'Send this request as JSON.');
    }

    $contentLength = $_SERVER['CONTENT_LENGTH'] ?? null;
    if (is_string($contentLength) && ctype_digit($contentLength) && (int)$contentLength > $maximumBytes) {
        apiRequestError(413, 'The request is too large.');
    }

    $body = file_get_contents('php://input', false, null, 0, $maximumBytes + 1);
    if (!is_string($body)) {
        apiRequestError(400, 'The request body could not be read.');
    }
    if (strlen($body) > $maximumBytes) {
        apiRequestError(413, 'The request is too large.');
    }

    try {
        $decodedObject = json_decode($body, false, 512, JSON_THROW_ON_ERROR);
    } catch (JsonException $error) {
        apiRequestError(400, 'The JSON request is malformed.');
    }
    if (!is_object($decodedObject)) {
        apiRequestError(400, 'The JSON request must be an object.');
    }

    return json_decode($body, true, 512, JSON_THROW_ON_ERROR);
}

function requireJsonString(array $data, string $field, bool $required = true, int $maximumBytes = 65535): string
{
    if (!array_key_exists($field, $data)) {
        if ($required) {
            apiRequestError(422, 'One or more request fields are invalid.');
        }
        return '';
    }
    if (!is_string($data[$field]) || strlen($data[$field]) > $maximumBytes) {
        apiRequestError(422, 'One or more request fields are invalid.');
    }
    if ($required && trim($data[$field]) === '') {
        apiRequestError(422, 'One or more request fields are invalid.');
    }
    return $data[$field];
}

function optionalJsonBoolean(array $data, string $field, bool $default = false): bool
{
    if (!array_key_exists($field, $data)) {
        return $default;
    }
    $value = $data[$field];
    if (is_bool($value)) {
        return $value;
    }
    if (in_array($value, [0, '0', 'false'], true)) {
        return false;
    }
    if (in_array($value, [1, '1', 'true'], true)) {
        return true;
    }
    apiRequestError(422, 'One or more request fields are invalid.');
}

function requirePositiveDatabaseId($value): int
{
    $id = validateApiInt($value, 1, SANObazar_MAX_DB_INT);
    if ($id === false) {
        apiRequestError(422, 'One or more request fields are invalid.');
    }
    return (int)$id;
}

function validateApiInt($value, int $minimum, int $maximum)
{
    if (!is_int($value) && !is_string($value)) {
        return false;
    }
    if (!preg_match('/^-?(?:0|[1-9][0-9]*)$/D', (string)$value)) {
        return false;
    }
    $integer = filter_var($value, FILTER_VALIDATE_INT);
    if ($integer === false || $integer < $minimum || $integer > $maximum) {
        return false;
    }
    return (int)$integer;
}

function validateApiDecimal($value, bool $allowZero = true)
{
    if ((!is_string($value) && !is_int($value) && !is_float($value)) || !is_finite((float)$value)) {
        return false;
    }
    $text = (string)$value;
    if (!preg_match('/^(?:0|[1-9][0-9]{0,7})(?:\.[0-9]{1,2})?$/D', $text)) {
        return false;
    }
    $number = (float)$text;
    if (!$allowZero && $number <= 0) {
        return false;
    }
    return $number;
}
