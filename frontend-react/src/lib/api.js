// Production uses a same-origin /backend path. Vercel proxies it to InfinityFree,
// while an InfinityFree-hosted frontend serves the PHP API at the same path.
// Local Vite development keeps the XAMPP backend as its default.
export const API_BASE = import.meta.env.VITE_API_BASE || (import.meta.env.PROD
  ? '/backend'
  : `${window.location.protocol}//${window.location.hostname}/SANOBAZAR/backend`);

export async function apiRequest(url, options = {}) {
  const { csrf = true, ...requestOptions } = options;
  const method = (requestOptions.method || 'GET').toUpperCase();
  const headers = new Headers(requestOptions.headers || {});

  if (csrf && !['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    const tokenResponse = await fetch(`${API_BASE}/csrf_token.php`, {
      credentials: 'include',
      cache: 'no-store'
    });
    const tokenData = await readApiJson(tokenResponse);
    if (!tokenResponse.ok || tokenData.status !== 'success' || !tokenData.csrf_token) {
      throw new Error(tokenData.message || 'Could not verify this request. Refresh the page and try again.');
    }
    headers.set('X-CSRF-Token', tokenData.csrf_token);
  }

  return fetch(url, {
    ...requestOptions,
    credentials: requestOptions.credentials || 'include',
    headers
  });
}

export async function readApiJson(response) {
  const body = await response.text();
  try {
    return body ? JSON.parse(body) : {};
  } catch {
    const message = response.ok
      ? 'The server returned an unreadable response.'
      : 'The server returned an error. Check the backend URL and hosting configuration.';
    throw new Error(message);
  }
}
