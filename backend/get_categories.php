<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
require_once __DIR__ . '/request_validation.php';
requireApiMethod(['GET']);
require_once __DIR__ . '/rate_limit.php';
enforceRateLimit('categories-read-ip', rateLimitClientIp(), 120, 60);

require_once "db.php";

try {
    $stmt = $pdo->query("SELECT * FROM categories ORDER BY id ASC");
    $categories = $stmt->fetchAll();

    echo json_encode([
        "status" => "success",
        "data"   => $categories
    ]);
} catch (PDOException $e) {
    sanobazarLogException('catalog.categories_query_failed', $e);
    http_response_code(500);
    echo json_encode([
        "status"  => "error",
        "message" => "Unable to load categories right now. Please try again later."
    ]);
}
?>
