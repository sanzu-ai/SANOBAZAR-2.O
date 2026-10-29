<?php
require_once 'auth.php';
requireAdmin();
require_once 'db.php';

function optionalPromoDate($value)
{
    if ($value === null || trim((string) $value) === '') {
        return null;
    }
    $date = DateTime::createFromFormat('Y-m-d\TH:i', (string) $value, new DateTimeZone('Asia/Kathmandu'));
    if (!$date || $date->format('Y-m-d\TH:i') !== (string) $value) {
        throw new InvalidArgumentException('Enter valid promotion dates.');
    }
    return $date->format('Y-m-d H:i:s');
}

function promoList(PDO $pdo): array
{
    return $pdo->query('SELECT id, code, discount_type, discount_value, minimum_order, maximum_discount, usage_limit, usage_count, starts_at, expires_at, is_active, created_at FROM promo_codes ORDER BY created_at DESC, id DESC')->fetchAll(PDO::FETCH_ASSOC);
}

$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'GET') {
    echo json_encode(['status' => 'success', 'data' => promoList($pdo)]);
    exit;
}

if ($method !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed.']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true) ?? [];
$action = $data['action'] ?? 'create';

try {
    if ($action === 'delete') {
        $id = filter_var($data['id'] ?? null, FILTER_VALIDATE_INT);
        if ($id === false || $id < 1) {
            throw new InvalidArgumentException('Choose a valid promo code.');
        }
        $delete = $pdo->prepare('DELETE FROM promo_codes WHERE id = ?');
        $delete->execute([$id]);
        if ($delete->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(['status' => 'error', 'message' => 'Promo code not found.']);
            exit;
        }
        echo json_encode(['status' => 'success', 'message' => 'Promo code deleted.', 'data' => promoList($pdo)]);
        exit;
    }

    if ($action === 'toggle') {
        $id = filter_var($data['id'] ?? null, FILTER_VALIDATE_INT);
        $active = filter_var($data['is_active'] ?? null, FILTER_VALIDATE_INT);
        if ($id === false || $id < 1 || !in_array($active, [0, 1], true)) {
            throw new InvalidArgumentException('Choose a valid promotion status.');
        }
        $stmt = $pdo->prepare('UPDATE promo_codes SET is_active = ? WHERE id = ?');
        $stmt->execute([$active, $id]);
        if ($stmt->rowCount() === 0) {
            $exists = $pdo->prepare('SELECT id FROM promo_codes WHERE id = ?');
            $exists->execute([$id]);
            if (!$exists->fetchColumn()) {
                http_response_code(404);
                echo json_encode(['status' => 'error', 'message' => 'Promo code not found.']);
                exit;
            }
        }
        echo json_encode(['status' => 'success', 'message' => 'Promo code status updated.', 'data' => promoList($pdo)]);
        exit;
    }

    if (!in_array($action, ['create', 'update'], true)) {
        throw new InvalidArgumentException('Choose a supported promotion action.');
    }

    $id = null;
    $existingUsageCount = 0;
    if ($action === 'update') {
        $id = filter_var($data['id'] ?? null, FILTER_VALIDATE_INT);
        if ($id === false || $id < 1) {
            throw new InvalidArgumentException('Choose a valid promo code to edit.');
        }
        $existing = $pdo->prepare('SELECT usage_count FROM promo_codes WHERE id = ?');
        $existing->execute([$id]);
        $usageCount = $existing->fetchColumn();
        if ($usageCount === false) {
            http_response_code(404);
            echo json_encode(['status' => 'error', 'message' => 'Promo code not found.']);
            exit;
        }
        $existingUsageCount = (int) $usageCount;
    }

    $code = strtoupper(trim((string) ($data['code'] ?? '')));
    $type = $data['discount_type'] ?? '';
    $value = filter_var($data['discount_value'] ?? null, FILTER_VALIDATE_FLOAT);
    $minimum = filter_var($data['minimum_order'] ?? '0', FILTER_VALIDATE_FLOAT);
    $maximum = trim((string) ($data['maximum_discount'] ?? '')) === '' ? null : filter_var($data['maximum_discount'], FILTER_VALIDATE_FLOAT);
    $usageLimit = trim((string) ($data['usage_limit'] ?? '')) === '' ? null : filter_var($data['usage_limit'], FILTER_VALIDATE_INT);
    $startsAt = optionalPromoDate($data['starts_at'] ?? null);
    $expiresAt = optionalPromoDate($data['expires_at'] ?? null);

    if (!preg_match('/^[A-Z0-9][A-Z0-9_-]{1,39}$/', $code)) {
        throw new InvalidArgumentException('Promo codes must be 2–40 characters using letters, numbers, hyphens, or underscores.');
    }
    if (!in_array($type, ['percentage', 'fixed'], true) || $value === false || $value <= 0 || ($type === 'percentage' && $value > 100)) {
        throw new InvalidArgumentException('Enter a valid discount type and value. Percentage discounts cannot exceed 100%.');
    }
    if ($minimum === false || $minimum < 0 || ($maximum !== null && ($maximum === false || $maximum <= 0))) {
        throw new InvalidArgumentException('Enter valid minimum order and maximum discount amounts.');
    }
    if ($usageLimit !== null && ($usageLimit === false || $usageLimit < 1)) {
        throw new InvalidArgumentException('Usage limit must be at least one, or left blank for unlimited uses.');
    }
    if ($usageLimit !== null && $usageLimit < $existingUsageCount) {
        throw new InvalidArgumentException('The usage limit cannot be lower than the number of times this code has already been used.');
    }
    if ($startsAt !== null && $expiresAt !== null && new DateTimeImmutable($expiresAt) <= new DateTimeImmutable($startsAt)) {
        throw new InvalidArgumentException('The expiry time must be later than the start time.');
    }

    $values = [$code, $type, number_format($value, 2, '.', ''), number_format($minimum, 2, '.', ''), $maximum === null ? null : number_format($maximum, 2, '.', ''), $usageLimit, $startsAt, $expiresAt];
    if ($action === 'update') {
        $update = $pdo->prepare('UPDATE promo_codes SET code = ?, discount_type = ?, discount_value = ?, minimum_order = ?, maximum_discount = ?, usage_limit = ?, starts_at = ?, expires_at = ? WHERE id = ?');
        $update->execute([...$values, $id]);
        $message = 'Promo code updated.';
    } else {
        $insert = $pdo->prepare('INSERT INTO promo_codes (code, discount_type, discount_value, minimum_order, maximum_discount, usage_limit, starts_at, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
        $insert->execute($values);
        $message = 'Promo code created.';
    }
    echo json_encode(['status' => 'success', 'message' => $message, 'data' => promoList($pdo)]);
} catch (InvalidArgumentException $error) {
    http_response_code(422);
    echo json_encode(['status' => 'error', 'message' => $error->getMessage()]);
} catch (PDOException $error) {
    if ($error->getCode() === '23000') {
        http_response_code(409);
        echo json_encode(['status' => 'error', 'message' => 'That promo code already exists.']);
    } else {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Could not save the promo code.']);
    }
}
