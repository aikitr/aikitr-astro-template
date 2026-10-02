const MAX_BODY_BYTES = 16_384;
const messages = {
  en: {
    success: 'Thank you. Your information was received.',
    invalid: 'Please check the form and try again.',
    unavailable: 'The form is unavailable right now. Please try again later.',
    forbidden: 'Verification failed. Please try again.',
    back: 'Back to the site',
  },
  'zh-cn': {
    success: '提交成功，感谢你的来信。',
    invalid: '请检查表单内容后重试。',
    unavailable: '表单暂时不可用，请稍后重试。',
    forbidden: '验证失败，请重试。',
    back: '返回网站',
  },
};

function page(status, locale, message, kind, basePath = '/') {
  const copy = messages[locale];
  const base = `/${String(basePath).split('/').filter(Boolean).join('/')}`.replace(/\/$/, '');
  const href = `${base === '/' ? '' : base}${locale === 'zh-cn' ? '/zh-cn' : ''}${kind === 'contact' ? '/contact/' : '/'}`;
  const html = `<!doctype html><html lang="${locale === 'zh-cn' ? 'zh-CN' : 'en'}"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${message}</title><main style="max-width:40rem;margin:12vh auto;padding:1rem;font:1.125rem system-ui"><h1>${message}</h1><p><a href="${href}">${copy.back}</a></p></main></html>`;
  return new Response(html, {
    status,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
    },
  });
}

async function readForm(request) {
  if (!request.headers.get('content-type')?.startsWith('application/x-www-form-urlencoded')) return { error: 400 };
  const reader = request.body?.getReader();
  if (!reader) return { error: 400 };
  let size = 0;
  const chunks = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BODY_BYTES) {
      await reader.cancel();
      return { error: 413 };
    }
    chunks.push(value);
  }
  const body = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return { params: new URLSearchParams(new TextDecoder().decode(body)) };
}

function validEmail(email) {
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * @param {'contact'|'subscribe'} kind
 * @param {Request} request
 * @param {{url?: string, secret?: string, turnstileSecret?: string, basePath?: string, insert: (table: string, row: Record<string, string>) => Promise<{error: {code?: string}|null}>, verify: (token: string, secret: string) => Promise<boolean>}} options
 */
export async function handleSubmission(kind, request, options) {
  if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405, headers: { allow: 'POST' } });
  const respond = (status, locale, message) => page(status, locale, message, kind, options.basePath);
  let parsed;
  try {
    parsed = await readForm(request);
  } catch {
    parsed = { error: 400 };
  }
  const params = parsed.params;
  const locale = params?.get('locale') === 'zh-cn' ? 'zh-cn' : 'en';
  const copy = messages[locale];
  if (parsed.error) return respond(parsed.error, locale, copy.invalid);
  if (!params) return respond(400, locale, copy.invalid);
  if (params.get('website')) return respond(200, locale, copy.success);

  const email = (params.get('email') || '').trim().toLowerCase();
  if (!validEmail(email)) return respond(400, locale, copy.invalid);
  let table;
  let row;
  if (kind === 'contact') {
    const name = (params.get('name') || '').trim();
    const message = (params.get('message') || '').trim();
    if (!name || name.length > 100 || !message || message.length > 5000) return respond(400, locale, copy.invalid);
    table = 'contact_messages';
    row = { name, email, message };
  } else {
    if (params.get('consent') !== 'on') return respond(400, locale, copy.invalid);
    table = 'newsletter_subscribers';
    row = { email, consent_source: 'website_form' };
  }

  if (!options.url || !options.secret) return respond(503, locale, copy.unavailable);

  if (options.turnstileSecret) {
    const token = params.get('cf-turnstile-response') || '';
    if (!token || token.length > 2048) return respond(403, locale, copy.forbidden);
    try {
      if (!(await options.verify(token, options.turnstileSecret))) return respond(403, locale, copy.forbidden);
    } catch {
      return respond(502, locale, copy.unavailable);
    }
  }
  try {
    const { error } = await options.insert(table, row);
    if (error && !(kind === 'subscribe' && error.code === '23505')) return respond(502, locale, copy.unavailable);
  } catch {
    return respond(502, locale, copy.unavailable);
  }
  return respond(200, locale, copy.success);
}
