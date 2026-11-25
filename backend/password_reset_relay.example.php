<?php
/**
 * Copy to password_reset_relay.local.php for local XAMPP, or configure these
 * values as backend-only environment variables on the PHP host.
 * Generate one 32-byte random secret and use the same 64-character hex value
 * for this setting and Vercel's RESET_MAIL_RELAY_HMAC_SECRET.
 */
return [
    'PASSWORD_RESET_RELAY_URL' => 'https://your-project.vercel.app/api/send-password-reset',
    'PASSWORD_RESET_RELAY_HMAC_SECRET' => 'replace-with-your-own-64-character-hex-secret'
];
