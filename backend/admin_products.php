<?php
require_once 'auth.php';
require_once __DIR__ . '/request_validation.php';
$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
requireApiMethod(['GET', 'POST', 'DELETE']);
requireAdmin();
include 'db.php';

if (in_array($method, ['POST', 'DELETE'], true)) {
    requireCsrfToken();
    enforceRateLimit('admin-write-user', (string)$_SESSION['user']['id'], 30, 60);
}

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
    $data = readJsonRequest(65536);
    $action = array_key_exists('action', $data) ? requireJsonString($data, 'action', true, 16) : 'add';

    if ($action === 'add') {
        $name = trim(requireJsonString($data, 'name', true, 600));
        $price = validateApiDecimal($data['price'] ?? null, false);
        $stock = validateApiInt($data['stock_quantity'] ?? null, 0, SANObazar_MAX_DB_INT);
        $cat_id = validateApiInt($data['category_id'] ?? null, 1, SANObazar_MAX_DB_INT);
        $image = trim(requireJsonString($data, 'image_url', false, 2000));
        $description = trim(requireJsonString($data, 'description', false, 40000));

        if ($name === '' || mb_strlen($name, 'UTF-8') > 150 || $price === false ||
            $stock === false || $cat_id === false || mb_strlen($description, 'UTF-8') > 10000 ||
            mb_strlen($image, 'UTF-8') > 500 || ($image !== '' && filter_var($image, FILTER_VALIDATE_URL) === false)) {
            http_response_code(422);
            echo json_encode(["status" => "error", "message" => "Enter valid product details, price, stock, category, and image URL."]);
            exit;
        }

        $sql = "INSERT INTO products (name, description, price, stock_quantity, category_id, image_url) VALUES (?, ?, ?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        
        if ($stmt->execute([$name, $description ?: null, $price, $stock, $cat_id, $image])) {
            echo json_encode(["status" => "success", "message" => "Product added successfully!"]);
        } else {
            echo json_encode(["status" => "error", "message" => "Failed to add product."]);
        }
    } elseif ($action === 'restock') {
        $productId = validateApiInt($data['product_id'] ?? null, 1, SANObazar_MAX_DB_INT);
        $addQuantity = validateApiInt($data['add_quantity'] ?? null, 1, SANObazar_MAX_DB_INT);
        if ($productId === false || $addQuantity === false) {
            http_response_code(422);
            echo json_encode(["status" => "error", "message" => "Enter a valid product and a positive restock quantity."]);
            exit;
        }

        $sql = "UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ? AND stock_quantity <= ?";
        $stmt = $pdo->prepare($sql);
        if ($stmt->execute([$addQuantity, $productId, SANObazar_MAX_DB_INT - $addQuantity])) {
            if ($stmt->rowCount() === 0) {
                $exists = $pdo->prepare('SELECT id FROM products WHERE id = ?');
                $exists->execute([$productId]);
                if (!$exists->fetch()) {
                    http_response_code(404);
                    echo json_encode(["status" => "error", "message" => "Product not found."]);
                    exit;
                }
                http_response_code(422);
                echo json_encode(["status" => "error", "message" => "Restocking would exceed the supported stock limit."]);
                exit;
            }
            echo json_encode(["status" => "success", "message" => "Stock updated successfully!"]);
        } else {
            echo json_encode(["status" => "error", "message" => "Failed to restock product."]);
        }
    } elseif ($action === 'update') {
        $productId = validateApiInt($data['product_id'] ?? null, 1, SANObazar_MAX_DB_INT);
        $categoryId = validateApiInt($data['category_id'] ?? null, 1, SANObazar_MAX_DB_INT);
        $price = validateApiDecimal($data['price'] ?? null, false);
        $stock = validateApiInt($data['stock_quantity'] ?? null, 0, SANObazar_MAX_DB_INT);
        $name = trim(requireJsonString($data, 'name', true, 600));
        $image = trim(requireJsonString($data, 'image_url', false, 2000));
        $description = trim(requireJsonString($data, 'description', false, 40000));

        if ($productId === false || $categoryId === false || $price === false || $stock === false || $name === '' ||
            mb_strlen($name, 'UTF-8') > 150 || mb_strlen($description, 'UTF-8') > 10000 || mb_strlen($image, 'UTF-8') > 500 ||
            ($image !== '' && filter_var($image, FILTER_VALIDATE_URL) === false)) {
            http_response_code(422);
            echo json_encode(["status" => "error", "message" => "Enter a valid name, category, price, and stock quantity."]);
            exit;
        }

        $stmt = $pdo->prepare("UPDATE products SET name = ?, description = ?, category_id = ?, price = ?, stock_quantity = ?, image_url = ? WHERE id = ?");
        $stmt->execute([$name, $description ?: null, $categoryId, $price, $stock, $image, $productId]);

        if ($stmt->rowCount() === 0) {
            $exists = $pdo->prepare("SELECT id FROM products WHERE id = ?");
            $exists->execute([$productId]);
            if (!$exists->fetch()) {
                http_response_code(404);
                echo json_encode(["status" => "error", "message" => "Product not found."]);
                exit;
            }
        }

        echo json_encode(["status" => "success", "message" => "Product updated successfully!"]);
    } else {
        http_response_code(422);
        echo json_encode(["status" => "error", "message" => "Choose a valid product action."]);
    }
    exit;
}

// 3. DELETE PRODUCT (WITH FOREIGN KEY INTEGRITY CHECK)
if ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    $id = requirePositiveDatabaseId($id);

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

http_response_code(405);
header('Allow: GET, POST, DELETE, OPTIONS');
echo json_encode(['status' => 'error', 'message' => 'Method not allowed.']);
?>
