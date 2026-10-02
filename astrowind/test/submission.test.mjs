import assert from 'node:assert/strict';
import { test } from 'node:test';
import { handleSubmission } from '../src/lib/submission.mjs';

function request(values) {
  return new Request('https://example.com/api/contact', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(values),
  });
}

function setup(options = {}) {
  const rows = [];
  return {
    rows,
    options: {
      url: 'https://demo.supabase.co',
      secret: 'server-only',
      insert: async (table, row) => {
        rows.push({ table, row });
        return { error: null };
      },
      verify: async () => true,
      ...options,
    },
  };
}

test('contact validates and stores only expected fields', async () => {
  const state = setup();
  const response = await handleSubmission(
    'contact',
    request({ name: ' Ada ', email: ' ADA@Example.COM ', message: ' Hello ', locale: 'zh-cn', extra: 'ignore' }),
    state.options
  );
  assert.equal(response.status, 200);
  assert.deepEqual(state.rows, [
    { table: 'contact_messages', row: { name: 'Ada', email: 'ada@example.com', message: 'Hello' } },
  ]);
  assert.match(await response.text(), /提交成功/);
});

test('invalid contact data is rejected before storage', async () => {
  const state = setup();
  const response = await handleSubmission('contact', request({ name: 'A', email: 'bad', message: '' }), state.options);
  assert.equal(response.status, 400);
  assert.equal(state.rows.length, 0);
});

test('newsletter duplicate email returns ordinary success', async () => {
  const state = setup({ insert: async () => ({ error: { code: '23505' } }) });
  const response = await handleSubmission(
    'subscribe',
    request({ email: 'User@Example.com', consent: 'on' }),
    state.options
  );
  assert.equal(response.status, 200);
  assert.match(await response.text(), /Thank you/);
});

test('newsletter requires explicit consent', async () => {
  const state = setup();
  const response = await handleSubmission('subscribe', request({ email: 'user@example.com' }), state.options);
  assert.equal(response.status, 400);
  assert.equal(state.rows.length, 0);
});

test('missing Supabase configuration returns service unavailable', async () => {
  const state = setup({ secret: '' });
  const response = await handleSubmission(
    'contact',
    request({ name: 'Ada', email: 'ada@example.com', message: 'Hello' }),
    state.options
  );
  assert.equal(response.status, 503);
  assert.equal(state.rows.length, 0);
});

test('form responses keep their return link under the configured base path', async () => {
  const state = setup({ secret: '', basePath: '/astrowind' });
  const response = await handleSubmission(
    'contact',
    request({ name: 'Ada', email: 'ada@example.com', message: 'Hello' }),
    state.options
  );
  assert.equal(response.status, 503);
  assert.match(await response.text(), /href="\/astrowind\/contact\/"/);
});

test('invalid input is rejected even before Supabase is configured', async () => {
  const state = setup({ secret: '' });
  const response = await handleSubmission('subscribe', request({ email: 'bad', consent: 'on' }), state.options);
  assert.equal(response.status, 400);
  assert.equal(state.rows.length, 0);
});

test('Supabase failure returns a safe error', async () => {
  const state = setup({ insert: async () => ({ error: { code: 'XX000', message: 'private database details' } }) });
  const response = await handleSubmission(
    'subscribe',
    request({ email: 'user@example.com', consent: 'on' }),
    state.options
  );
  assert.equal(response.status, 502);
  assert.doesNotMatch(await response.text(), /private database details/);
});

test('Turnstile is optional but enforced when configured', async () => {
  const state = setup({ turnstileSecret: 'secret', verify: async () => false });
  const response = await handleSubmission(
    'subscribe',
    request({ email: 'user@example.com', consent: 'on', 'cf-turnstile-response': 'bad' }),
    state.options
  );
  assert.equal(response.status, 403);
  assert.equal(state.rows.length, 0);
});

test('oversized requests are rejected', async () => {
  const state = setup();
  const response = await handleSubmission(
    'contact',
    request({ name: 'Ada', email: 'ada@example.com', message: 'x'.repeat(20_000) }),
    state.options
  );
  assert.equal(response.status, 413);
  assert.equal(state.rows.length, 0);
});
