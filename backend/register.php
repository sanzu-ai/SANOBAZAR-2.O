<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

require_once "db.php";

$inputData = file_get_contents("php://input");
$data = json_decode($inputData, true);

// Validate inputs
if (empty($data['full_name']) || empty($data['email']) || empty($data['password'])) {
    echo json_encode(["status" => "error", "message" => "Please fill in all required fields."]);
    exit();
}

$fullName = trim($data['full_name']);
$email    = trim($data['email']);
$password = $data['password'];
$role     = 'customer'; // Public registration must never grant admin access.

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
    $stmt = $pdo->prepare("INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)");
    $stmt->execute([$fullName, $email, $hashedPassword, $role]);

    echo json_encode([
        "status" => "success",
        "message" => "Account created successfully! You can now log in."
    ]);

} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Registration failed: " . $e->getMessage()]);
}
?>
