import astrowind from '../astrowind/dist/server/entry.mjs';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/astrowind/api/')) {
      return astrowind.fetch(request, env, ctx);
    }

    return env.ASSETS.fetch(request);
  },
};
