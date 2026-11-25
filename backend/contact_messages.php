<?php
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/rate_limit.php';
require_once __DIR__ . '/request_validation.php';
requireApiMethod(['GET', 'POST']);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = readJsonRequest(32768);
    $fullName = trim(requireJsonString($data, 'full_name', true, 400));
    $email = trim(requireJsonString($data, 'email', true, 1016));
    $phone = trim(requireJsonString($data, 'phone', false, 30));
    $subject = trim(requireJsonString($data, 'subject', true, 600));
    $message = trim(requireJsonString($data, 'message', true, 20000));

    if (mb_strlen($fullName, 'UTF-8') < 2 || mb_strlen($fullName, 'UTF-8') > 100 ||
        !filter_var($email, FILTER_VALIDATE_EMAIL) || mb_strlen($email, 'UTF-8') > 254 ||
        ($phone !== '' && !preg_match('/^[+0-9().\s-]{7,30}$/', $phone)) ||
        mb_strlen($subject, 'UTF-8') < 3 || mb_strlen($subject, 'UTF-8') > 150 ||
        mb_strlen($message, 'UTF-8') < 10 || mb_strlen($message, 'UTF-8') > 5000) {
        http_response_code(422);
        echo json_encode(['status' => 'error', 'message' => 'Check the contact form fields and try again.']);
        exit;
    }

    enforceRateLimit('contact-ip', rateLimitClientIp(), 20, 600);
    enforceRateLimit('contact-email', strtolower($email), 3, 3600);
    require_once 'db.php';

    try {
        $stmt = $pdo->prepare('INSERT INTO contact_messages (full_name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)');
        $stmt->execute([$fullName, $email, $phone !== '' ? $phone : null, $subject, $message]);
        echo json_encode(['status' => 'success', 'message' => 'Your message was sent to Sano Bazar.']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Unable to send your message right now. Please contact us by phone or email.']);
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    require_once 'auth.php';
    requireAdmin();
    require_once 'db.php';
    try {
        $stmt = $pdo->query('SELECT id, full_name, email, phone, subject, message, created_at FROM contact_messages ORDER BY created_at DESC, id DESC');
        echo json_encode(['status' => 'success', 'data' => $stmt->fetchAll()]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Unable to load contact messages.']);
    }
    exit;
}

http_response_code(405);
echo json_encode(['status' => 'error', 'message' => 'Method not allowed.']);
