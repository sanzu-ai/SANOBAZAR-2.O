-- Run once in sanobazar_db to enable managed promo codes and discounted orders.
ALTER TABLE orders
    ADD COLUMN subtotal_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER total_amount,
    ADD COLUMN discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER subtotal_amount,
    ADD COLUMN promo_code VARCHAR(40) NULL AFTER discount_amount;

UPDATE orders
SET subtotal_amount = total_amount
WHERE subtotal_amount = 0.00 AND discount_amount = 0.00;

CREATE TABLE IF NOT EXISTS promo_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(40) NOT NULL UNIQUE,
    discount_type ENUM('percentage', 'fixed') NOT NULL,
    discount_value DECIMAL(10,2) NOT NULL,
    minimum_order DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    maximum_discount DECIMAL(10,2) NULL,
    usage_limit INT NULL,
    usage_count INT NOT NULL DEFAULT 0,
    starts_at DATETIME NULL,
    expires_at DATETIME NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
