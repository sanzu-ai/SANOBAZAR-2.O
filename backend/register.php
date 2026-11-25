<?php
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/request_validation.php';
requireApiMethod(['POST']);
require_once __DIR__ . '/rate_limit.php';
enforceRateLimit('register-ip', rateLimitClientIp(), 30, 3600);

require_once __DIR__ . '/auth.php';
requireCsrfToken();

$data = readJsonRequest(16384);

// Validate inputs
$fullName = trim(requireJsonString($data, 'full_name', true, 400));
$email = trim(requireJsonString($data, 'email', true, 400));
$phone = trim(requireJsonString($data, 'phone_number', true, 120));
$password = requireJsonString($data, 'password', true, 72);
$termsAccepted = optionalJsonBoolean($data, 'terms_accepted');
$role     = 'customer'; // Public registration must never grant admin access.

if ($fullName === '' || mb_strlen($fullName, 'UTF-8') > 100 || !filter_var($email, FILTER_VALIDATE_EMAIL) || mb_strlen($email, 'UTF-8') > 100 ||
    !preg_match('/^[+0-9().\s-]{7,30}$/', $phone) || preg_match_all('/[0-9]/', $phone) < 7 ||
    strlen($password) < 8 || strlen($password) > 72 || !$termsAccepted) {
    http_response_code(422);
    echo json_encode(["status" => "error", "message" => "Check your name, email, phone, password length (8–72 characters), and terms acceptance."]);
    exit();
}

enforceRateLimit('register-email', strtolower($email), 3, 3600);
require_once "db.php";

try {
    // 1. Check if email already exists
    $checkStmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $checkStmt->execute([$email]);
    
    if ($checkStmt->fetch()) {
        echo json_encode(["status" => "error", "message" => "Email address is already registered."]);
        exit();
    }

    // 2. Hash password securely
    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

    // 3. Insert new user into MySQL
    $stmt = $pdo->prepare("INSERT INTO users (full_name, email, phone_number, password, role, terms_accepted_at) VALUES (?, ?, ?, ?, ?, NOW())");
    $stmt->execute([$fullName, $email, $phone, $hashedPassword, $role]);

    echo json_encode([
        "status" => "success",
        "message" => "Account created successfully! You can now log in."
    ]);

} catch (PDOException $e) {
    sanobazarLogException('customer.registration_failed', $e);
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Registration could not be completed right now. Please try again later."]);
}
?>
