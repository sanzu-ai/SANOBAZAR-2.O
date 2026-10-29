<?php
function promoAmountToPaisa($amount): int
{
    $normalized = trim(str_replace(',', '', (string) $amount));
    if (!preg_match('/^(\d+)(?:\.(\d{1,2}))?$/', $normalized, $matches)) {
        throw new RuntimeException('A promotional price is invalid.');
    }

    return ((int) $matches[1] * 100) + (int) str_pad($matches[2] ?? '0', 2, '0');
}

function promoFormatPaisa(int $amount): string
{
    return intdiv($amount, 100) . '.' . str_pad((string) ($amount % 100), 2, '0', STR_PAD_LEFT);
}

function calculatePromo(PDO $pdo, string $code, int $subtotalPaisa, bool $lockForOrder = false): array
{
    $sql = 'SELECT * FROM promo_codes WHERE code = ?';
    if ($lockForOrder) {
        $sql .= ' FOR UPDATE';
    }
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$code]);
    $promo = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$promo || !(int) $promo['is_active']) {
        throw new RuntimeException('This promo code is invalid or inactive.');
    }

    $timezone = new DateTimeZone('Asia/Kathmandu');
    $now = new DateTimeImmutable('now', $timezone);
    if (!empty($promo['starts_at']) && new DateTimeImmutable($promo['starts_at'], $timezone) > $now) {
        throw new RuntimeException('This promo code is not active yet.');
    }
    if (!empty($promo['expires_at']) && new DateTimeImmutable($promo['expires_at'], $timezone) < $now) {
        throw new RuntimeException('This promo code has expired.');
    }

    if ($promo['usage_limit'] !== null && (int) $promo['usage_count'] >= (int) $promo['usage_limit']) {
        throw new RuntimeException('This promo code has reached its usage limit.');
    }

    $minimumPaisa = promoAmountToPaisa($promo['minimum_order']);
    if ($subtotalPaisa < $minimumPaisa) {
        throw new RuntimeException('Your order does not meet the minimum amount for this promo code.');
    }

    $discountValuePaisa = promoAmountToPaisa($promo['discount_value']);
    if ($promo['discount_type'] === 'percentage') {
        if ($discountValuePaisa < 1 || $discountValuePaisa > 10000) {
            throw new RuntimeException('This promo code has an invalid discount.');
        }
        $discountPaisa = intdiv($subtotalPaisa * $discountValuePaisa, 10000);
    } else {
        $discountPaisa = $discountValuePaisa;
    }

    if ($promo['maximum_discount'] !== null) {
        $discountPaisa = min($discountPaisa, promoAmountToPaisa($promo['maximum_discount']));
    }
    $discountPaisa = min($discountPaisa, $subtotalPaisa);

    return [
        'id' => (int) $promo['id'],
        'code' => $promo['code'],
        'discount_type' => $promo['discount_type'],
        'discount_value' => (string) $promo['discount_value'],
        'subtotal_amount' => promoFormatPaisa($subtotalPaisa),
        'discount_amount' => promoFormatPaisa($discountPaisa),
        'total_amount' => promoFormatPaisa(max(0, $subtotalPaisa - $discountPaisa)),
        'usage_count' => (int) $promo['usage_count'],
        'usage_limit' => $promo['usage_limit'] === null ? null : (int) $promo['usage_limit'],
    ];
}
