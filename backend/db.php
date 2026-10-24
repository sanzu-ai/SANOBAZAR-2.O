<?php
// Database Configuration
$host     = "localhost";
$username = "root";
$password = ""; // Default XAMPP password is empty
$database = "sanobazar_db";

// Create Connection using PDO (PHP Data Objects)
try {
    $pdo = new PDO("mysql:host=$host;dbname=$database;charset=utf8", $username, $password);
    
    // Set PDO Error Mode to Exception
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

} catch (PDOException $e) {
    // If connection fails, return JSON error message
    header('Content-Type: application/json');
    echo json_encode(["error" => "Database connection failed: " . $e->getMessage()]);
    exit();
}
?>