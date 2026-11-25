-- Allow Google-only accounts to have no password while preserving existing password hashes.
-- Run after 20261109_add_auth_profile_fields.sql has been applied.
ALTER TABLE users
    MODIFY COLUMN password VARCHAR(255) NULL,
    ADD COLUMN google_sub VARCHAR(255)
        CHARACTER SET ascii
        COLLATE ascii_bin
        NULL,
    ADD UNIQUE KEY uq_users_google_sub (google_sub);
