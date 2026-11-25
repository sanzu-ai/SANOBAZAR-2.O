-- Align existing product columns with database/schema.sql.
-- Preflight before running on another database: no NULL stock/image values,
-- and no image_url longer than 500 characters.
ALTER TABLE products
    MODIFY COLUMN stock_quantity INT NOT NULL DEFAULT 0,
    MODIFY COLUMN image_url VARCHAR(500) NOT NULL;
