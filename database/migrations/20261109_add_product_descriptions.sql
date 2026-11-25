-- Run once on the existing MySQL database before deploying the matching app code.
ALTER TABLE products
    ADD COLUMN description TEXT NULL AFTER name;
