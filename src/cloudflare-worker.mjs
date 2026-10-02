import astrowind from '../astrowind/dist/server/entry.mjs';

const ASTROWIND_PREFIX = '/astrowind';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname.startsWith(`${ASTROWIND_PREFIX}/api/`)) {
      url.pathname = url.pathname.slice(ASTROWIND_PREFIX.length) || '/';
      return astrowind.fetch(new Request(url, request), env, ctx);
    }

    return env.ASSETS.fetch(request);
  },
};
