import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseApiFetch } from '../src/lib/supabase-fetch.mjs';

test('new Supabase secret keys are sent as apikey, not as bearer tokens', async () => {
  const secret = 'sb_secret_test_key_test_checksum';
  let requestHeaders;
  const supabase = createClient('https://example.supabase.co', secret, {
    global: {
      fetch: createSupabaseApiFetch(secret, async (_input, init) => {
        requestHeaders = new Headers(init?.headers);
        return new Response(null, { status: 201 });
      }),
    },
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  const { error } = await supabase.from('contact_messages').insert({
    name: 'Ada',
    email: 'ada@example.com',
    message: 'Hello',
  });

  assert.equal(error, null);
  assert.equal(requestHeaders.get('apikey'), secret);
  assert.equal(requestHeaders.get('authorization'), null);
});
