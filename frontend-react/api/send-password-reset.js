import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { Buffer } from 'node:buffer';
import process from 'node:process';

const MAX_BODY_BYTES = 2048;
const MAX_CLOCK_SKEW_SECONDS = 300;
const NONCE_TTL_SECONDS = 600;
const RECIPIENT_LIMIT = 3;
const RECIPIENT_WINDOW_SECONDS = 3600;

const consumeNonceAndLimitRecipient = `
local nonceWasSet = redis.call('SET', KEYS[1], '1', 'NX', 'EX', ARGV[1])
if not nonceWasSet then
  return -1
end
local count = redis.call('INCR', KEYS[2])
if count == 1 then
  redis.call('EXPIRE', KEYS[2], ARGV[2])
end
if count > tonumber(ARGV[3]) then
  return -2
end
return 1
`;

function jsonResponse(status, body) {
  return Response.json(body, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

function isValidEmail(value) {
  return typeof value === 'string' && value.length <= 100 &&
    value === value.trim().toLowerCase() &&
    !/[\r\n\s]/.test(value) &&
    /^[^@]+@[^@]+\.[^@]+$/.test(value);
}

function readRelayConfig() {
  const secret = process.env.RESET_MAIL_RELAY_HMAC_SECRET || '';
  const apiKey = process.env.BREVO_API_KEY || '';
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL || '';
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || '';
  const senderEmail = process.env.BREVO_SENDER_EMAIL || '';
  const resetPage = process.env.FRONTEND_RESET_URL || '';

  if (!/^[a-f0-9]{64}$/i.test(secret) || !apiKey || !redisToken ||
      !/^[^@\s\r\n]+@[^@\s\r\n]+\.[^@\s\r\n]+$/.test(senderEmail)) {
    return null;
  }

  let redis;
  let resetUrl;
  try {
    redis = new URL(redisUrl);
    resetUrl = new URL(resetPage);
  } catch {
    return null;
  }

  if (redis.protocol !== 'https:' || !redis.hostname.endsWith('.upstash.io') ||
      redis.username || redis.password || redis.search || redis.hash ||
      resetUrl.pathname !== '/reset-password' || resetUrl.username || resetUrl.password ||
      resetUrl.search || resetUrl.hash ||
      !(resetUrl.protocol === 'https:' ||
        (resetUrl.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(resetUrl.hostname)))) {
    return null;
  }

  return { secret, apiKey, redisUrl: redis.toString().replace(/\/$/, ''), redisToken, senderEmail, resetUrl };
}

async function readBoundedBody(request) {
  const declaredLength = request.headers.get('content-length');
  if (declaredLength !== null && (!/^\d+$/.test(declaredLength) || Number(declaredLength) > MAX_BODY_BYTES)) {
    return null;
  }

  if (!request.body) return null;
  const reader = request.body.getReader();
  const chunks = [];
  let total = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_BODY_BYTES) {
        await reader.cancel();
        return null;
      }
      chunks.push(Buffer.from(value));
    }
  } finally {
    reader.releaseLock();
  }

  return Buffer.concat(chunks).toString('utf8');
}

function validRequestId(requestId) {
  return typeof requestId === 'string' && /^[a-f0-9]{32}$/i.test(requestId);
}

function signatureIsValid(secret, timestamp, requestId, rawBody, signature) {
  if (!/^\d{10}$/.test(timestamp) || !validRequestId(requestId) || !/^[a-f0-9]{64}$/i.test(signature)) {
    return false;
  }
  const timestampNumber = Number(timestamp);
  if (!Number.isSafeInteger(timestampNumber) || Math.abs(Math.floor(Date.now() / 1000) - timestampNumber) > MAX_CLOCK_SKEW_SECONDS) {
    return false;
  }

  const digest = createHash('sha256').update(rawBody, 'utf8').digest('hex');
  const message = `sanobazar-reset-email-v1\n${timestamp}\n${requestId}\n${digest}`;
  const expected = createHmac('sha256', secret).update(message, 'utf8').digest();
  const supplied = Buffer.from(signature, 'hex');
  return supplied.length === expected.length && timingSafeEqual(expected, supplied);
}

async function reserveRelayRequest(config, requestId, email) {
  const nonceKey = `sanobazar:resetmail:nonce:${createHash('sha256').update(requestId).digest('hex')}`;
  const recipientKey = `sanobazar:resetmail:recipient:${createHash('sha256').update(email).digest('hex')}`;
  const redisResponse = await fetch(config.redisUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.redisToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify([
      'EVAL', consumeNonceAndLimitRecipient, 2, nonceKey, recipientKey,
      NONCE_TTL_SECONDS, RECIPIENT_WINDOW_SECONDS, RECIPIENT_LIMIT,
    ]),
    cache: 'no-store',
    signal: AbortSignal.timeout(5000),
  });

  if (!redisResponse.ok) return 'storage-error';
  const result = await redisResponse.json();
  if (result?.result === -1) return 'replay';
  if (result?.result === -2) return 'rate-limit';
  return result?.result === 1 ? 'reserved' : 'storage-error';
}

function buildResetEmail(resetUrl) {
  const resetLink = resetUrl.toString();
  const safeLink = resetLink.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Reset your SANOBAZAR password</title></head>
<body style="margin:0;padding:0;background:#f7f3ec;font-family:Arial,Helvetica,sans-serif;color:#302622">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f7f3ec;padding:32px 12px"><tr><td align="center">
<table role="presentation" width="600" cellspacing="0" cellpadding="0" style="width:100%;max-width:600px;background:#fff;border:1px solid #eadfd5;border-radius:18px;overflow:hidden">
<tr><td style="background:#901a1c;padding:26px 32px;color:#fff"><div style="font-size:22px;font-weight:800;letter-spacing:1px">SANOBAZAR</div><div style="margin-top:5px;font-size:11px;letter-spacing:2px;color:#f1d7d4">SMART E-COMMERCE · NEPAL</div></td></tr>
<tr><td style="padding:34px 32px 20px"><p style="margin:0 0 10px;color:#901a1c;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase">Account security</p><h1 style="margin:0 0 16px;font-size:26px;line-height:1.25;color:#302622">Reset your password</h1>
<p style="margin:0 0 14px;font-size:15px;line-height:1.7;color:#61564f">We received a request to reset your SANOBAZAR password. Use the button below to choose a new password.</p><p style="margin:0 0 24px;font-size:14px;line-height:1.7;color:#61564f">This secure link expires in <strong>30 minutes</strong> and can only be used once.</p>
<p style="margin:0 0 26px"><a href="${safeLink}" style="display:inline-block;padding:14px 24px;border-radius:10px;background:#901a1c;color:#fff;text-decoration:none;font-size:15px;font-weight:700">Choose a new password</a></p><p style="margin:0 0 8px;font-size:12px;line-height:1.6;color:#81756e">If the button does not work, copy this link into your browser:</p><p style="margin:0 0 22px;word-break:break-all;font-size:12px;line-height:1.6;color:#901a1c">${safeLink}</p>
<p style="margin:0;font-size:13px;line-height:1.7;color:#81756e">If you did not request a password reset, you can safely ignore this email. Your password will not change.</p></td></tr>
<tr><td style="padding:18px 32px;background:#fbf8f2;border-top:1px solid #eee6df;font-size:11px;line-height:1.6;color:#81756e">SANOBAZAR · Smart E-Commerce Management System<br>This is an automated account-security message. Please do not reply.</td></tr>
</table></td></tr></table></body></html>`;
  const text = `Reset your SANOBAZAR password using this link:\n\n${resetLink}\n\nThis link expires in 30 minutes. If you did not request it, ignore this email.`;
  return { html, text };
}

export default {
  async fetch(request) {
    if (request.method !== 'POST') {
      return jsonResponse(405, { status: 'error', message: 'Method not allowed.' });
    }

    if (!/^application\/json(?:\s*;|\s*$)/i.test(request.headers.get('content-type') || '')) {
      return jsonResponse(415, { status: 'error', message: 'Invalid request.' });
    }

    const config = readRelayConfig();
    if (!config) {
      return jsonResponse(503, { status: 'error', message: 'Email delivery is temporarily unavailable.' });
    }

    const timestamp = request.headers.get('x-sb-timestamp') || '';
    const requestId = request.headers.get('x-sb-request-id') || '';
    const signature = request.headers.get('x-sb-signature') || '';
    const rawBody = await readBoundedBody(request);
    if (rawBody === null) {
      return jsonResponse(400, { status: 'error', message: 'Invalid request.' });
    }

    let payload;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return jsonResponse(400, { status: 'error', message: 'Invalid request.' });
    }

    if (!payload || typeof payload !== 'object' || Array.isArray(payload) ||
        Object.keys(payload).sort().join(',') !== 'email,token' ||
        !isValidEmail(payload.email) || !/^[a-f0-9]{64}$/i.test(payload.token)) {
      return jsonResponse(400, { status: 'error', message: 'Invalid request.' });
    }

    if (!signatureIsValid(config.secret, timestamp, requestId, rawBody, signature)) {
      return jsonResponse(401, { status: 'error', message: 'Request could not be verified.' });
    }

    let reservation;
    try {
      reservation = await reserveRelayRequest(config, requestId, payload.email);
    } catch {
      reservation = 'storage-error';
    }
    if (reservation === 'replay') {
      return jsonResponse(409, { status: 'error', message: 'Request could not be verified.' });
    }
    if (reservation === 'rate-limit') {
      return jsonResponse(429, { status: 'error', message: 'Email delivery is temporarily unavailable.' });
    }
    if (reservation !== 'reserved') {
      return jsonResponse(503, { status: 'error', message: 'Email delivery is temporarily unavailable.' });
    }

    const resetUrl = new URL(config.resetUrl.toString());
    resetUrl.searchParams.set('token', payload.token);
    const message = buildResetEmail(resetUrl);

    try {
      const brevoResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'api-key': config.apiKey,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          sender: { email: config.senderEmail, name: 'SANOBAZAR' },
          to: [{ email: payload.email }],
          subject: 'Reset your SANOBAZAR password',
          htmlContent: message.html,
          textContent: message.text,
        }),
        cache: 'no-store',
        signal: AbortSignal.timeout(10000),
      });

      if (!brevoResponse.ok) {
        await brevoResponse.body?.cancel();
        return jsonResponse(502, { status: 'error', message: 'Email delivery is temporarily unavailable.' });
      }

      await brevoResponse.body?.cancel();
      return jsonResponse(202, { status: 'success', message: 'Email accepted for delivery.' });
    } catch {
      return jsonResponse(502, { status: 'error', message: 'Email delivery is temporarily unavailable.' });
    } finally {
      if (typeof payload.token === 'string') payload.token = '';
      if (typeof message.html === 'string') message.html = '';
      if (typeof message.text === 'string') message.text = '';
    }
  },
};
