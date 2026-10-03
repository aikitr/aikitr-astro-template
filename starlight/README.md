# Starlight 双语文档站

复制本目录即可独立开发，需要 Node.js 22.22.3 或更新版本，使用 npm。执行 `npm ci && npm run dev` 后访问 `/`（英文）或 `/zh-cn/`（中文）。

## 修改内容

- 英文文档位于 `src/content/docs/`，中文对应内容位于 `src/content/docs/zh-cn/`。同名路径会由 Starlight 的语言切换器关联。
- 在 `astro.config.mjs` 中修改站点标题、侧边栏以及 `site` 正式域名。
- 每次新增英文文档，添加同路径的中文文档；然后运行 `npm run check && npm run build`。

## Cloudflare Workers

此模板是纯静态站点，`wrangler.jsonc` 指向构建后的 `dist/`。不需要 Supabase。

1. `npm ci`
2. 在 `astro.config.mjs` 配置正式域名；在 `wrangler.jsonc` 配置唯一的 Worker 名称。
3. `npm run check && npm run build`
4. `npm run preview:worker` 通过本地 Cloudflare Worker 检查英文与中文页面。
5. 登录 Cloudflare 后运行 `npm run deploy`。

如使用自定义域名，在 Cloudflare 控制台将域名绑定到 Worker，并确认规范链接及站点地图使用该域名。
