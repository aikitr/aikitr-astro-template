/**
 * @param {string} token
 * @param {string} secret
 * @param {typeof fetch} fetcher
 */
export async function verifyTurnstile(token, secret, fetcher = fetch) {
  try {
    const body = new URLSearchParams({ secret, response: token });
    const response = await fetcher('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body,
    });
    if (!response.ok) return false;
    const result = await response.json();
    return result?.success === true;
  } catch {
    return false;
  }
}
