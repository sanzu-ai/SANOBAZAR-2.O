-- Run once on the existing MySQL database before deploying the matching auth code.
ALTER TABLE users
    ADD COLUMN phone_number VARCHAR(30) NULL AFTER email,
    ADD COLUMN terms_accepted_at TIMESTAMP NULL AFTER role;
