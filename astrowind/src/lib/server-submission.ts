import { getSecret } from 'astro:env/server';
import { createClient } from '@supabase/supabase-js';
import { handleSubmission } from './submission.mjs';
import { createSupabaseApiFetch } from './supabase-fetch.mjs';
import { verifyTurnstile } from './turnstile.mjs';
import { SITE } from 'astrowind:config';

export function submit(kind: 'contact' | 'subscribe', request: Request): Promise<Response> {
  const url = getSecret('SUPABASE_URL');
  const secret = getSecret('SUPABASE_SECRET_KEY');
  return handleSubmission(kind, request, {
    url,
    secret,
    turnstileSecret: getSecret('TURNSTILE_SECRET_KEY'),
    basePath: SITE.base,
    verify: verifyTurnstile,
    insert: async (table, row) => {
      if (!url || !secret) throw new Error('Missing Supabase configuration');
      const supabase = createClient(url, secret, {
        global: { fetch: createSupabaseApiFetch(secret) },
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      });
      return supabase.from(table).insert(row);
    },
  });
}
