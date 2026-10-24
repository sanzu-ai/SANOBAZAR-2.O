<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
include 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    // 1. ADD NEW PRODUCT
    $data = json_decode(file_get_contents("php://input"), true);
    
    $name = $data['name'];
    $price = $data['price'];
    $stock = $data['stock_quantity'];
    $cat_id = $data['category_id'];
    $image = $data['image_url'];

    $sql = "INSERT INTO products (name, price, stock_quantity, category_id, image_url) VALUES (?, ?, ?, ?, ?)";
    $stmt = $pdo->prepare($sql);
    
    if($stmt->execute([$name, $price, $stock, $cat_id, $image])) {
        echo json_encode(["message" => "Product added successfully"]);
    } else {
        echo json_encode(["error" => "Failed to add product"]);
    }
} 

if ($method === 'DELETE') {
    // 2. DELETE PRODUCT
    $id = $_GET['id'];
    $sql = "DELETE FROM products WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    if($stmt->execute([$id])) {
        echo json_encode(["message" => "Product deleted"]);
    }
}
?>