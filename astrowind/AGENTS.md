# AstroWind project notes

This template derives from AstroWind; see UPSTREAM.md and LICENSE.md. Node.js >=22.22.3 is required.

- `npm run dev`, `npm run test`, `npm run check`, `npm run build`, `npm run preview` verify the project.
- English routes use `/`; Chinese equivalents use `/zh-cn/`. When adding a visible page or blog post, add its translated counterpart and check language links.
- Pages and Markdown are prerendered. `/api/contact` and `/api/subscribe` run in Cloudflare Workers and write to Supabase. Read README.md before changing secrets, forms or deployment.
- Never expose `SUPABASE_SECRET_KEY` or `TURNSTILE_SECRET_KEY` to client code. Keep RLS enabled; browser roles must not have table access.
- `.agents/skills/` came from upstream. Some deployment and form instructions describe the original static template and may be stale for this fork; prefer this README and the current code for those topics.
