<?php
require_once 'auth.php';
require_once 'db.php';
require_once 'promo_helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed.']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true) ?? [];
$code = strtoupper(trim((string) ($data['promo_code'] ?? '')));
$cart = is_array($data['cart'] ?? null) ? $data['cart'] : [];

if (!preg_match('/^[A-Z0-9][A-Z0-9_-]{1,39}$/', $code)) {
    http_response_code(422);
    echo json_encode(['status' => 'error', 'message' => 'Enter a valid promo code.']);
    exit;
}
if (!$cart) {
    http_response_code(422);
    echo json_encode(['status' => 'error', 'message' => 'Your cart is empty.']);
    exit;
}

$quantities = [];
foreach ($cart as $item) {
    $productId = filter_var($item['id'] ?? null, FILTER_VALIDATE_INT);
    $quantity = filter_var($item['quantity'] ?? null, FILTER_VALIDATE_INT);
    if ($productId === false || $productId < 1 || $quantity === false || $quantity < 1) {
        http_response_code(422);
        echo json_encode(['status' => 'error', 'message' => 'Your cart contains an invalid product or quantity.']);
        exit;
    }
    $quantities[$productId] = ($quantities[$productId] ?? 0) + $quantity;
}

try {
    $subtotalPaisa = 0;
    $productQuery = $pdo->prepare('SELECT price, stock_quantity FROM products WHERE id = ?');
    foreach ($quantities as $productId => $quantity) {
        $productQuery->execute([$productId]);
        $product = $productQuery->fetch(PDO::FETCH_ASSOC);
        if (!$product || (int) $product['stock_quantity'] < $quantity) {
            throw new RuntimeException('A product in your cart is unavailable or has insufficient stock.');
        }
        $subtotalPaisa += promoAmountToPaisa($product['price']) * $quantity;
    }

    $promo = calculatePromo($pdo, $code, $subtotalPaisa);
    echo json_encode(['status' => 'success', 'promo' => $promo]);
} catch (PDOException $error) {
    error_log($error->getMessage());
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Could not validate this promo code right now.']);
} catch (RuntimeException $error) {
    http_response_code(422);
    echo json_encode(['status' => 'error', 'message' => $error->getMessage()]);
} catch (Throwable $error) {
    error_log($error->getMessage());
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Could not validate this promo code right now.']);
}
