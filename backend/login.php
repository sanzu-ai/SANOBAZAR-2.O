<?php
require_once "auth.php";

require_once "db.php";

$inputData = file_get_contents("php://input");
$data = json_decode($inputData, true);

if (empty($data['email']) || empty($data['password'])) {
    echo json_encode(["status" => "error", "message" => "Please enter email and password."]);
    exit();
}

$email    = trim($data['email']);
$password = $data['password'];

try {
    // Fetch user by email
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    // Verify user exists AND password hash matches
    if ($user && password_verify($password, $user['password'])) {
        session_regenerate_id(true);
        $_SESSION['user'] = [
            'id' => (int) $user['id'],
            'full_name' => $user['full_name'],
            'email' => $user['email'],
            'role' => $user['role']
        ];
        echo json_encode([
            "status"  => "success",
            "message" => "Login successful!",
            "user" => $_SESSION['user']
        ]);
    } else {
        echo json_encode(["status" => "error", "message" => "Invalid email or password."]);
    }

} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Login failed: " . $e->getMessage()]);
}
?>
