<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

include 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

// 1. GET ALL PRODUCTS FOR ADMIN TABLE
if ($method === 'GET') {
    $sql = "SELECT p.*, c.category_name 
            FROM products p 
            JOIN categories c ON p.category_id = c.id 
            ORDER BY p.id DESC";
    $stmt = $pdo->query($sql);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit;
}

// 2. ADD PRODUCT OR RESTOCK STOCK
if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    $action = $data['action'] ?? 'add';

    if ($action === 'add') {
        $name = $data['name'];
        $price = $data['price'];
        $stock = $data['stock_quantity'];
        $cat_id = $data['category_id'];
        $image = $data['image_url'];

        $sql = "INSERT INTO products (name, price, stock_quantity, category_id, image_url) VALUES (?, ?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        
        if ($stmt->execute([$name, $price, $stock, $cat_id, $image])) {
            echo json_encode(["status" => "success", "message" => "Product added successfully!"]);
        } else {
            echo json_encode(["status" => "error", "message" => "Failed to add product."]);
        }
    } elseif ($action === 'restock') {
        $productId = $data['product_id'];
        $addQuantity = intval($data['add_quantity']);

        $sql = "UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        
        if ($stmt->execute([$addQuantity, $productId])) {
            echo json_encode(["status" => "success", "message" => "Stock updated successfully!"]);
        } else {
            echo json_encode(["status" => "error", "message" => "Failed to restock product."]);
        }
    }
    exit;
}

// 3. DELETE PRODUCT (WITH FOREIGN KEY INTEGRITY CHECK)
if ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    
    if (!$id) {
        echo json_encode(["status" => "error", "message" => "Product ID required"]);
        exit;
    }

    try {
        $sql = "DELETE FROM products WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$id]);
        echo json_encode(["status" => "success", "message" => "Product deleted successfully!"]);
    } catch (PDOException $e) {
        // Foreign Key Constraint Violation (Error 23000)
        if ($e->getCode() == '23000') {
            echo json_encode([
                "status" => "error", 
                "message" => "Cannot delete product: It is linked to existing customer orders."
            ]);
        } else {
            echo json_encode(["status" => "error", "message" => "Database error occurred."]);
        }
    }
    exit;
}
?>