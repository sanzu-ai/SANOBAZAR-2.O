-- Run once against an existing Sano Bazar database to store checkout details.
-- Existing orders receive blank delivery details and COD/pending payment defaults.
ALTER TABLE orders
    ADD COLUMN shipping_address VARCHAR(500) NOT NULL DEFAULT '' AFTER total_amount,
    ADD COLUMN phone_number VARCHAR(30) NOT NULL DEFAULT '' AFTER shipping_address,
    ADD COLUMN payment_method ENUM('cod', 'digital') NOT NULL DEFAULT 'cod' AFTER phone_number,
    ADD COLUMN payment_status ENUM('pending', 'simulated') NOT NULL DEFAULT 'pending' AFTER payment_method;

-- Keep the existing orders table aligned with the admin status options.
ALTER TABLE orders
    MODIFY COLUMN order_status ENUM('pending', 'processing', 'completed', 'cancelled') NOT NULL DEFAULT 'pending';
