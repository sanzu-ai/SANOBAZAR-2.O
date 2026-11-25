<?php
// Legacy SMTP reference only; password-reset email now uses password_reset_relay.example.php.
// Copy this file to smtp_config.local.php and fill in real values there.
// Never commit smtp_config.local.php or expose these values to the frontend.
return [
    'SMTP_HOST' => 'smtp-relay.brevo.com',
    'SMTP_PORT' => 587,
    'SMTP_USERNAME' => 'your-brevo-smtp-login',
    'SMTP_PASSWORD' => 'your-brevo-smtp-key',
    'SMTP_FROM_EMAIL' => 'verified-sender@example.com',
    'SMTP_FROM_NAME' => 'SANOBAZAR',
    'FRONTEND_RESET_URL' => 'http://localhost:5173/reset-password'
];
