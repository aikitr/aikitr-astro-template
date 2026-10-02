/**
 * Keep new-format Supabase API keys in the `apikey` header only.
 * Supabase secret keys are not JWTs and cannot be used as bearer tokens.
 * @param {string} apiKey
 * @param {typeof fetch} fetchImpl
 */
export function createSupabaseApiFetch(apiKey, fetchImpl = fetch) {
  const isNewApiKey = apiKey.startsWith('sb_secret_') || apiKey.startsWith('sb_publishable_');

  return (input, init) => {
    if (!isNewApiKey) return fetchImpl(input, init);

    const requestHeaders = input instanceof Request ? input.headers : undefined;
    const headers = new Headers(init?.headers ?? requestHeaders);
    if (headers.get('Authorization') === `Bearer ${apiKey}`) headers.delete('Authorization');

    return fetchImpl(input, { ...init, headers });
  };
}
