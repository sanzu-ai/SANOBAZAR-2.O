<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once "db.php";

try {
    $stmt = $pdo->query("SELECT * FROM categories ORDER BY id ASC");
    $categories = $stmt->fetchAll();

    echo json_encode([
        "status" => "success",
        "data"   => $categories
    ]);
} catch (PDOException $e) {
    echo json_encode([
        "status"  => "error",
        "message" => "Failed to load categories: " . $e->getMessage()
    ]);
}
?>