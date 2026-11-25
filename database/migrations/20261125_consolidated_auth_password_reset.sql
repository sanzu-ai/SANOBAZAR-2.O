-- One-time consolidated migration for the inspected production users schema.
-- Preserves existing accounts and password hashes while adding the fields
-- required by registration, Google authentication, session revocation, and
-- password recovery.
--
-- Preconditions: users.id is signed INT (11) and users uses InnoDB. Apply once
-- after taking a database backup and confirming these additions are absent.

ALTER TABLE users
    ADD COLUMN phone_number VARCHAR(30) NULL AFTER email,
    MODIFY COLUMN password VARCHAR(255) NULL,
    ADD COLUMN auth_version INT UNSIGNED NOT NULL DEFAULT 0 AFTER password,
    ADD COLUMN terms_accepted_at TIMESTAMP NULL AFTER role,
    ADD COLUMN google_sub VARCHAR(255) CHARACTER SET ascii COLLATE ascii_bin NULL AFTER terms_accepted_at,
    ADD UNIQUE KEY uq_users_google_sub (google_sub);

CREATE TABLE password_reset_tokens (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token_hash CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    consumed_at DATETIME NULL,
    UNIQUE KEY uq_password_reset_token_hash (token_hash),
    KEY idx_password_reset_user_expiry (user_id, expires_at),
    KEY idx_password_reset_expiry (expires_at),
    CONSTRAINT fk_password_reset_tokens_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
