<?php
require_once 'auth.php';
require_once __DIR__ . '/request_validation.php';
$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
requireApiMethod(['GET', 'POST']);
requireAdmin();
require_once 'db.php';

function optionalPromoDate($value)
{
    if ($value === null || (is_string($value) && trim($value) === '')) {
        return null;
    }
    if (!is_string($value) || strlen($value) > 16) {
        throw new InvalidArgumentException('Enter valid promotion dates.');
    }
    $date = DateTime::createFromFormat('Y-m-d\TH:i', $value, new DateTimeZone('Asia/Kathmandu'));
    if (!$date || $date->format('Y-m-d\TH:i') !== $value) {
        throw new InvalidArgumentException('Enter valid promotion dates.');
    }
    return $date->format('Y-m-d H:i:s');
}

function promoList(PDO $pdo): array
{
    return $pdo->query('SELECT id, code, discount_type, discount_value, minimum_order, maximum_discount, usage_limit, usage_count, starts_at, expires_at, is_active, created_at FROM promo_codes ORDER BY created_at DESC, id DESC')->fetchAll(PDO::FETCH_ASSOC);
}

if ($method === 'GET') {
    echo json_encode(['status' => 'success', 'data' => promoList($pdo)]);
    exit;
}

if ($method !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed.']);
    exit;
}
requireCsrfToken();
enforceRateLimit('admin-write-user', (string)$_SESSION['user']['id'], 30, 60);

$data = readJsonRequest(16384);
$action = array_key_exists('action', $data) ? requireJsonString($data, 'action', true, 16) : 'create';

try {
    if ($action === 'delete') {
        $id = validateApiInt($data['id'] ?? null, 1, SANObazar_MAX_DB_INT);
        if ($id === false) {
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
        $id = validateApiInt($data['id'] ?? null, 1, SANObazar_MAX_DB_INT);
        $active = validateApiInt($data['is_active'] ?? null, 0, 1);
        if ($id === false || $active === false) {
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
        $id = validateApiInt($data['id'] ?? null, 1, SANObazar_MAX_DB_INT);
        if ($id === false) {
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

    $code = strtoupper(trim(requireJsonString($data, 'code', true, 160)));
    $type = array_key_exists('discount_type', $data) ? requireJsonString($data, 'discount_type', true, 16) : '';
    $value = validateApiDecimal($data['discount_value'] ?? null, false);
    $minimum = validateApiDecimal($data['minimum_order'] ?? '0', true);
    $maximumRaw = $data['maximum_discount'] ?? '';
    $maximum = ($maximumRaw === '' || $maximumRaw === null) ? null : validateApiDecimal($maximumRaw, false);
    $usageRaw = $data['usage_limit'] ?? '';
    $usageLimit = ($usageRaw === '' || $usageRaw === null) ? null : validateApiInt($usageRaw, 1, SANObazar_MAX_DB_INT);
    $startsRaw = $data['starts_at'] ?? null;
    $expiresRaw = $data['expires_at'] ?? null;
    if (($startsRaw !== null && !is_string($startsRaw)) || ($expiresRaw !== null && !is_string($expiresRaw))) {
        throw new InvalidArgumentException('Enter valid promotion dates.');
    }
    $startsAt = optionalPromoDate($startsRaw);
    $expiresAt = optionalPromoDate($expiresRaw);

    if (!preg_match('/^[A-Z0-9][A-Z0-9_-]{1,39}$/', $code)) {
        throw new InvalidArgumentException('Promo codes must be 2–40 characters using letters, numbers, hyphens, or underscores.');
    }
    if (!in_array($type, ['percentage', 'fixed'], true) || $value === false || $value <= 0 || ($type === 'percentage' && $value > 100)) {
        throw new InvalidArgumentException('Enter a valid discount type and value. Percentage discounts cannot exceed 100%.');
    }
    if ($minimum === false || $minimum < 0 || ($maximum !== null && $maximum === false)) {
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
