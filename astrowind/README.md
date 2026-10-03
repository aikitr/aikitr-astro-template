# AstroWind 双语网站模板

复制本目录即可独立开发，含组件、演示页、英文与中文博客，可按项目需要删减。英文站点位于 `/`，中文站点位于 `/zh-cn/`。页面和博客在构建时生成；联系与订阅表单由 Cloudflare Worker 处理。上游版本与 MIT 署名见 [UPSTREAM.md](UPSTREAM.md)。

本仓库将两个模板部署到同一个 Cloudflare Worker 的方法见 [deployment/README.md](deployment/README.md)。复制 AstroWind 独立开发时排除 `deployment/`、生成目录和已有密钥文件。

需要 Node.js 22.22.3 或更新版本，使用 npm。首次运行：

```sh
npm ci
npm run dev
```

修改后检查与预览：

```sh
npm run test
npm run check
npm run build
npm run preview
# 生产构建完成后，也可直接用本地 Cloudflare Worker 预览
npm run preview:worker
```

## 修改内容

- `src/config.yaml`：站点名称、域名、SEO 元数据。部署前必须替换 `https://example.com`。
- `src/pages/`：英文页面；`src/i18n/zh-pages.mjs` 与 `src/pages/zh-cn/`：中文页面。
- `src/data/post/`：英文 Markdown/MDX 博客；`src/data/post/zh-cn/`：对应中文博客。新增文章时沿用同名 slug，便于语言切换。
- `src/navigation.ts`：中英文导航。保留的上游演示页可从 `/showcase/` 访问。
- `src/components/CustomStyles.astro`：主题色与本地 Inter 字体。
- `src/pages/privacy.md`、`src/pages/terms.md` 及其中文版本：上线前按实际经营者和数据处理情况填写，不要直接发布示例法律文本。

## Supabase 表单

联系表单提交到 `POST /api/contact`，订阅表单提交到 `POST /api/subscribe`。只入库，不发送通知或订阅邮件。订阅者勾选同意后才会存储邮箱；重复提交显示普通成功页。两个表不允许浏览器使用匿名密钥直接读取或写入。

1. 创建 Supabase 项目，在项目中执行 `supabase/migrations/20261002053928_create_form_tables.sql`。可使用 Supabase SQL Editor，或安装/运行 Supabase CLI 后执行 `supabase login`、`supabase link --project-ref <项目 ID>`、`supabase db push`。
2. 将 `.dev.vars.example` 复制为 `.dev.vars`，填写项目 URL 与 **secret key**。只在服务端使用；不要放入 `PUBLIC_` 环境变量，也不要提交 `.dev.vars`。旧项目若使用 `service_role` 密钥，也只能放在 Worker 密钥中。
3. `npm run build && npm run preview:worker`，测试表单。未配置密钥时接口返回暂不可用，不会假装提交成功。
4. 正式部署前在 Cloudflare 中设置 `SUPABASE_URL` 和 `SUPABASE_SECRET_KEY` 为 Worker Secrets，例如 `npx wrangler secret put SUPABASE_URL` 和 `npx wrangler secret put SUPABASE_SECRET_KEY`。

数据库迁移启用了 RLS，且撤销了 `anon`、`authenticated` 的表权限。Worker 使用有权限的密钥写入；浏览器代码不会获取这个密钥。应在 Supabase 控制台按运营需求设置数据保留期限和访问流程。

`supabase/config.toml` 只保留本地数据库版本与迁移设置；其他选项使用 [Supabase CLI 默认值](https://supabase.com/docs/guides/local-development/cli/config)。修改本地数据库版本时，与自己的 Supabase 项目保持一致。

## 可选 Turnstile

本地和正式环境均不强制启用 Turnstile。要启用，先在 Cloudflare 创建 Turnstile Widget：

- 构建环境设置 `PUBLIC_TURNSTILE_SITE_KEY`，以显示验证控件。本地可写入 `.env`，样例见 `.env.example`。
- Worker 运行环境设置 `TURNSTILE_SECRET_KEY`；本地可写入 `.dev.vars`，正式环境使用 `npx wrangler secret put TURNSTILE_SECRET_KEY`。
- 两个值必须同时配置。服务端会向 Cloudflare 验证令牌后才写库。

未配置时表单仍能运行。生产站点应至少启用 Turnstile，并结合 Cloudflare 的 WAF/速率限制与监控防刷；蜜罐字段和长度限制只能减少部分滥用。

## Cloudflare Workers 部署

`wrangler.jsonc` 已配置 Worker，Astro 适配器负责预渲染页面和两个 API 路由。

1. 在 `src/config.yaml` 设置正式域名，在 `wrangler.jsonc` 设置唯一的 Worker 名称。
2. 配置并迁移 Supabase；设置上面的 Worker Secrets。若启用 Turnstile，也要在构建环境提供 public site key。
3. 执行 `npm run test && npm run check && npm run build`。
4. 执行 `npm run preview:worker`，检查 `/`、`/zh-cn/`、博客、语言切换及表单。
5. 登录 Cloudflare 后执行 `npm run deploy`；再绑定自定义域名并核对 canonical 与 sitemap。

部署命令不会自动创建 Supabase 或 Cloudflare 账号。静态页面不依赖 Supabase 正常运行；只有表单提交依赖数据库。
