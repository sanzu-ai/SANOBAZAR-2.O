-- Idempotency keys are scoped to the signed-in customer. Existing orders retain NULL;
-- MySQL/MariaDB permits multiple NULL values in this unique index.
ALTER TABLE orders
    ADD COLUMN idempotency_key VARCHAR(64) NULL AFTER user_id,
    ADD UNIQUE KEY uq_orders_user_idempotency_key (user_id, idempotency_key);
