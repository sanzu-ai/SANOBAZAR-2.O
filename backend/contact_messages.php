<?php
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$configuredOrigins = array_filter(array_map('trim', explode(',', getenv('SANOBAZAR_ALLOWED_ORIGINS') ?: '')));
$allowedOrigins = array_merge([
    'http://localhost:5173',
    'http://127.0.0.1:5173'
], $configuredOrigins);
if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Credentials: true');
    header('Vary: Origin');
}
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!is_array($data)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Enter valid contact details.']);
        exit;
    }

    $fullName = trim($data['full_name'] ?? '');
    $email = trim($data['email'] ?? '');
    $phone = trim($data['phone'] ?? '');
    $subject = trim($data['subject'] ?? '');
    $message = trim($data['message'] ?? '');

    if (mb_strlen($fullName) < 2 || mb_strlen($fullName) > 100 ||
        !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 254 ||
        strlen($phone) > 30 || mb_strlen($subject) < 3 || mb_strlen($subject) > 150 ||
        mb_strlen($message) < 10 || mb_strlen($message) > 5000) {
        http_response_code(422);
        echo json_encode(['status' => 'error', 'message' => 'Check the contact form fields and try again.']);
        exit;
    }

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
