# Astro 双模板脚手架

仓库内提供两个可独立运行的 Astro 项目：`starlight/` 是中英双语文档站，`astrowind/` 是中英双语网站与博客。内容保存在本地 Markdown；AstroWind 的联系与订阅表单由 Cloudflare Worker 写入 Supabase。仓库自身也可以合并部署为一个 Worker：AstroWind 位于 `/astrowind/`，Starlight 位于 `/startlight/`。

需要 Node.js 22.22.3 或更新版本、npm。创建命令仅复制文件，不会安装依赖，也不会覆盖已有目录。

## 创建项目

```sh
npm run create
# 或无需交互
npm run create -- --template starlight --name "My Docs" --dir ./my-docs
npm run create -- --template astrowind --name "My Site" --dir ./my-site
```

不传 `--dir` 时，目录名由项目名转换为英文小写短名。目录已存在会安全退出。

```sh
cd my-site
npm ci
npm run dev
npm run check
npm run build
npm run preview
```

生成项目的 `README.md` 说明了内容位置、环境配置和部署步骤。AstroWind 在未配置 Supabase 时仍可预览页面，提交表单会显示服务暂不可用；生产使用前应先执行迁移并设置 Worker 密钥。

## 模板约定

| 项目 | 英文 | 中文 | 部署 |
| --- | --- | --- | --- |
| Starlight | `/startlight/` | `/startlight/zh-cn/` | 合并部署时由仓库根目录的 Cloudflare Worker 提供 |
| AstroWind | `/astrowind/` | `/astrowind/zh-cn/` | 合并部署时由同一个 Worker 提供页面与表单接口 |

将示例域名 `https://example.com` 改为正式域名后再部署。AstroWind 保留了上游组件和演示页；版本与 MIT 署名见 [astrowind/UPSTREAM.md](astrowind/UPSTREAM.md)。两个模板各自带有锁文件。

## 将本仓库部署到 Cloudflare

仓库根目录的 `wrangler.jsonc` 定义唯一 Worker 和一份组合静态资源目录。根目录构建会分别安装并构建两个模板，然后将输出放到 `dist/astrowind/` 和 `dist/startlight/`。

```sh
npm ci
npm run build
npm run preview
npm run deploy
```

AstroWind 的表单接口在 `/astrowind/api/contact` 和 `/astrowind/api/subscribe`。执行 `astrowind/supabase/migrations/` 下的迁移后，为这个根 Worker 设置 `SUPABASE_URL`、`SUPABASE_SECRET_KEY`，可选设置 `TURNSTILE_SECRET_KEY`；`PUBLIC_TURNSTILE_SITE_KEY` 是构建变量。密钥只能设置为 Worker Secret，不能放进前端变量。

连接 GitHub 自动部署：在 Cloudflare Dashboard 打开 Worker `aikitr-astro-template` 的 **Settings → Builds → Connect**，选择 GitHub 仓库 `aikitr/aikitr-astro-template` 和 `main` 分支。设置 Build command 为 `npm run build`，Deploy command 为 `npx wrangler deploy --config wrangler.jsonc`，Root directory 留空。每次推送到 `main` 后，Cloudflare Workers Builds 会构建并更新这个 Worker。首次连接时在 Build variables 中配置 `PUBLIC_SITE_URL` 为该 Worker 的正式站点 URL；Turnstile 公钥也是非敏感的构建变量。

未配置 Supabase 时网站仍可打开，但表单接口会返回服务未配置响应。未启用 Turnstile 时接口仍能保存内容，因此生产环境建议同时配置 Turnstile 并为 Worker 配置防刷规则。首版只写入数据库，不发送通知或订阅邮件。
