import assert from 'node:assert/strict';
import { test } from 'node:test';
import { verifyTurnstile } from '../src/lib/turnstile.mjs';

test('accepts only a successful Siteverify response', async () => {
  const fetcher = async (_url, init) => {
    const body = new URLSearchParams(init.body);
    assert.equal(body.get('secret'), 'server-secret');
    assert.equal(body.get('response'), 'challenge-token');
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  };
  assert.equal(await verifyTurnstile('challenge-token', 'server-secret', fetcher), true);
});

test('rejects Siteverify failures and network errors', async () => {
  assert.equal(
    await verifyTurnstile('bad', 'secret', async () => new Response('{"success":false}', { status: 200 })),
    false
  );
  assert.equal(
    await verifyTurnstile('bad', 'secret', async () => {
      throw new Error('network');
    }),
    false
  );
});
