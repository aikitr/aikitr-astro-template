# Astro 双模板示例

两个目录都是可直接复制、独立开发的 Astro 项目。内容保存在本地 Markdown；AstroWind 的联系与订阅表单通过 Cloudflare Worker 写入 Supabase。

| 模板 | 用途 | 内容入口 |
| --- | --- | --- |
| [starlight/](starlight/README.md) | 中英双语文档站 | `src/content/docs/`、`astro.config.mjs` |
| [astrowind/](astrowind/README.md) | 中英双语网站、博客与表单 | `src/pages/`、`src/data/post/`、`src/config.yaml` |

需要 Node.js 22.22.3 或更新版本，使用 npm 和各模板自己的 `package-lock.json`。

## 复制后开发

复制需要的模板目录即可，根目录文件用于本仓库的合并演示部署，无需一起复制。不要复制 `node_modules/`、`dist/`、`.astro/`、`.wrangler/`、Supabase 的 `.temp/` 或已有的环境密钥文件；保留 `.env.example` 和 `.dev.vars.example`。

例如在 macOS / Linux 上复制 AstroWind 到一个新的目录：

```sh
rsync -a --exclude=node_modules --exclude=dist --exclude=.astro --exclude=.wrangler --exclude=.temp \
  --include=.env.example --include=.dev.vars.example --exclude='.env*' --exclude='.dev.vars*' \
  --exclude='pnpm-*' astrowind/ ../my-site/
cd ../my-site
npm ci
npm run dev
```

复制 Starlight 时将 `astrowind/` 换为 `starlight/`。目标目录应是新目录，避免合并到已有项目。也可以直接在本仓库进入任一模板目录运行安装与启动命令。

开发前修改 `package.json` 的项目名、站点标题与域名，以及 `wrangler.jsonc` 的 Worker 名称。独立项目英文使用 `/`，中文使用 `/zh-cn/`。具体内容和环境配置见各模板的 README。

修改后检查并构建：

```sh
npm run check
npm run build
```

AstroWind 保留了上游组件、博客与演示页，可按实际项目删减。上游版本和 MIT 署名见 [astrowind/UPSTREAM.md](astrowind/UPSTREAM.md)。未配置 Supabase 时可以预览页面；使用表单前执行迁移并设置服务端密钥。

## 本仓库的 Cloudflare 演示部署

根目录将两个模板构建为同一个站点：

| 模板 | 英文 | 中文 |
| --- | --- | --- |
| AstroWind | `/astrowind/` | `/astrowind/zh-cn/` |
| Starlight | `/startlight/` | `/startlight/zh-cn/` |

`starlight/` 是源码目录，`/startlight/` 是约定的演示访问路径。根目录的 `wrangler.jsonc`、`scripts/`、`src/cloudflare-worker.mjs` 仅负责这个组合部署。

```sh
npm ci
npm run build
npm run preview
npm run deploy
```

构建会安装并构建两个模板，将静态资源组合到根目录 `dist/`。部署前设置构建变量 `PUBLIC_SITE_URL` 为正式域名，例如 `https://example.com`，不要附加模板路径。

表单接口是 `/astrowind/api/contact` 和 `/astrowind/api/subscribe`。执行 [数据库迁移](astrowind/supabase/migrations/20261002053928_create_form_tables.sql) 后，为根 Worker 设置 `SUPABASE_URL`、`SUPABASE_SECRET_KEY`；本地预览写入根目录 `.dev.vars`，正式环境使用 Worker Secrets。可选 Turnstile 配置见 [AstroWind README](astrowind/README.md#可选-turnstile)。表单只入库，不发送通知或订阅邮件。

### GitHub 自动部署

Cloudflare Worker 的 **Settings → Builds** 连接 GitHub 仓库 `aikitr/aikitr-astro-template` 的 `main` 分支，配置：

- Build command：`npm run build`
- Deploy command：`npx wrangler deploy --config wrangler.jsonc`
- Root directory：仓库根目录
- Build variables：`PUBLIC_SITE_URL`，以及启用 Turnstile 时的 `PUBLIC_TURNSTILE_SITE_KEY`

推送到 `main` 后自动更新同一个 Worker。Supabase 和 Turnstile 私钥始终使用 Worker Secrets。
