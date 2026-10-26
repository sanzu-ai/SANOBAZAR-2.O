<?php
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/db.php';

$userId = filter_var($_SESSION['user']['id'] ?? null, FILTER_VALIDATE_INT);
if ($userId === false || $userId < 1) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Please sign in to sync your cart.']);
    exit;
}

function getCartItems(PDO $pdo, int $userId): array
{
    $stmt = $pdo->prepare("SELECT p.id, p.name, p.price, p.stock_quantity, p.image_url,
            c.category_name AS category, p.category_id, ci.quantity
        FROM cart_items ci
        JOIN products p ON p.id = ci.product_id
        JOIN categories c ON c.id = p.category_id
        WHERE ci.user_id = ? AND p.stock_quantity > 0
        ORDER BY ci.updated_at DESC, p.id ASC");
    $stmt->execute([$userId]);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    echo json_encode(['status' => 'success', 'data' => getCartItems($pdo, $userId)]);
    exit;
}

if ($method === 'DELETE') {
    $stmt = $pdo->prepare('DELETE FROM cart_items WHERE user_id = ?');
    $stmt->execute([$userId]);
    echo json_encode(['status' => 'success', 'data' => []]);
    exit;
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true) ?? [];
    if (!is_array($data['items'] ?? null) || count($data['items']) > 100) {
        http_response_code(422);
        echo json_encode(['status' => 'error', 'message' => 'Your cart data is invalid.']);
        exit;
    }

    $requested = [];
    foreach ($data['items'] as $item) {
        $productId = filter_var($item['product_id'] ?? null, FILTER_VALIDATE_INT);
        $quantity = filter_var($item['quantity'] ?? null, FILTER_VALIDATE_INT);
        if ($productId === false || $productId < 1 || $quantity === false || $quantity < 1) {
            http_response_code(422);
            echo json_encode(['status' => 'error', 'message' => 'Your cart contains an invalid product or quantity.']);
            exit;
        }
        $requested[$productId] = ($requested[$productId] ?? 0) + $quantity;
    }
    ksort($requested, SORT_NUMERIC);

    try {
        $pdo->beginTransaction();
        $availableItems = [];
        $productQuery = $pdo->prepare('SELECT stock_quantity FROM products WHERE id = ? FOR UPDATE');
        foreach ($requested as $productId => $quantity) {
            $productQuery->execute([$productId]);
            $stock = $productQuery->fetchColumn();
            if ($stock === false) {
                throw new RuntimeException('A product in your cart is no longer available.');
            }
            $allowedQuantity = min($quantity, (int)$stock);
            if ($allowedQuantity > 0) {
                $availableItems[$productId] = $allowedQuantity;
            }
        }

        $delete = $pdo->prepare('DELETE FROM cart_items WHERE user_id = ?');
        $delete->execute([$userId]);
        $insert = $pdo->prepare('INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)');
        foreach ($availableItems as $productId => $quantity) {
            $insert->execute([$userId, $productId, $quantity]);
        }
        $pdo->commit();

        echo json_encode(['status' => 'success', 'data' => getCartItems($pdo, $userId)]);
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        http_response_code($e instanceof PDOException ? 500 : 422);
        echo json_encode([
            'status' => 'error',
            'message' => $e instanceof PDOException ? 'Could not save your cart.' : $e->getMessage()
        ]);
    }
    exit;
}

http_response_code(405);
echo json_encode(['status' => 'error', 'message' => 'Method not allowed.']);
?>
