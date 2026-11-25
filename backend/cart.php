<?php
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/request_validation.php';
$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
requireApiMethod(['GET', 'POST', 'DELETE']);

$userId = requireAuthenticatedUserId();

final class CartValidationException extends RuntimeException {}

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

if (in_array($method, ['POST', 'DELETE'], true)) {
    requireCsrfToken();
    enforceRateLimit('cart-user', (string)$userId, 120, 60);
    enforceRateLimit('cart-ip', rateLimitClientIp(), 300, 60);
}

if ($method === 'GET') {
    require_once __DIR__ . '/db.php';
    echo json_encode(['status' => 'success', 'data' => getCartItems($pdo, $userId)]);
    exit;
}

if ($method === 'DELETE') {
    require_once __DIR__ . '/db.php';
    $stmt = $pdo->prepare('DELETE FROM cart_items WHERE user_id = ?');
    $stmt->execute([$userId]);
    echo json_encode(['status' => 'success', 'data' => []]);
    exit;
}

if ($method === 'POST') {
    $data = readJsonRequest(65536);
    if (!is_array($data['items'] ?? null) || !array_is_list($data['items']) || count($data['items']) > 100) {
        http_response_code(422);
        echo json_encode(['status' => 'error', 'message' => 'Your cart data is invalid.']);
        exit;
    }

    require_once __DIR__ . '/db.php';

    $requested = [];
    foreach ($data['items'] as $item) {
        if (!is_array($item)) {
            http_response_code(422);
            echo json_encode(['status' => 'error', 'message' => 'Your cart contains an invalid product or quantity.']);
            exit;
        }
        $productId = validateApiInt($item['product_id'] ?? null, 1, SANObazar_MAX_DB_INT);
        $quantity = validateApiInt($item['quantity'] ?? null, 1, SANObazar_MAX_DB_INT);
        if ($productId === false || $quantity === false) {
            http_response_code(422);
            echo json_encode(['status' => 'error', 'message' => 'Your cart contains an invalid product or quantity.']);
            exit;
        }
        $requested[$productId] = ($requested[$productId] ?? 0) + $quantity;
        if ($requested[$productId] > SANObazar_MAX_DB_INT) {
            http_response_code(422);
            echo json_encode(['status' => 'error', 'message' => 'Your cart contains an invalid product or quantity.']);
            exit;
        }
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
                throw new CartValidationException('A product in your cart is no longer available.');
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
            try {
                $pdo->rollBack();
            } catch (Throwable $rollbackError) {
                sanobazarLogException('cart.rollback_failed', $rollbackError);
                sanobazarLogException('cart.save_failed', $e);
                http_response_code(500);
                echo json_encode(['status' => 'error', 'message' => 'Could not save your cart.']);
                exit;
            }
        }
        if ($e instanceof CartValidationException) {
            http_response_code(422);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
            exit;
        }

        sanobazarLogException('cart.save_failed', $e);
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Could not save your cart.']);
    }
    exit;
}

http_response_code(405);
echo json_encode(['status' => 'error', 'message' => 'Method not allowed.']);
?>
