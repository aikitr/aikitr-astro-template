# 两个 Astro 模板，一个 Cloudflare Worker

本目录负责将仓库中的 AstroWind 和 Starlight 合并部署。仓库根目录无需 `package.json`、锁文件或构建工具；两个模板使用各自的 npm 依赖和锁文件。需要 Node.js 22.22.3 或更新版本。

| 模板                                   | 英文           | 中文                 |
| -------------------------------------- | -------------- | -------------------- |
| [AstroWind](../README.md)              | `/astrowind/`  | `/astrowind/zh-cn/`  |
| [Starlight](../../starlight/README.md) | `/startlight/` | `/startlight/zh-cn/` |

`starlight/` 是源码目录，`/startlight/` 保持现有演示站点的访问路径。页面和博客在构建时生成；AstroWind 的联系与订阅接口由同一个 Worker 处理。

## Cloudflare 自动构建与部署

在 Worker 的 **Settings → Builds** 连接本仓库，选择需要自动部署的分支，填写：

| 设置           | 值                                                                       |
| -------------- | ------------------------------------------------------------------------ |
| Root directory | 仓库根目录（留空）                                                       |
| Build command  | `node astrowind/deployment/scripts/build-cloudflare.mjs`                 |
| Deploy command | `cd astrowind && npx wrangler deploy --config deployment/wrangler.jsonc` |
| Build variable | `PUBLIC_SITE_URL=https://你的正式域名`                                   |
| Build variable | `SKIP_DEPENDENCY_INSTALL=1`                                              |

`PUBLIC_SITE_URL` 必须是域名，不附加模板路径。`SKIP_DEPENDENCY_INSTALL` 关闭平台自动安装依赖，由构建脚本为两个模板分别执行 `npm ci`。构建时分别设置 `ASTROWIND_BASE=/astrowind`、`STARLIGHT_BASE=/startlight`，依次构建两站，然后组合静态文件到 `astrowind/deployment/dist/`。

部署使用 AstroWind 已安装的 Wrangler，读取本目录的 `wrangler.jsonc`。Worker 名称是 `aikitr-astro-template`；换项目时修改这个名称。统一入口将 `/astrowind/api/*` 交给 AstroWind，其余请求由静态资源处理。两个项目构建完成后只部署一次。

Cloudflare 构建与部署命令的配置说明见[官方文档](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/)。

## 本地构建与预览

以下命令在仓库根目录执行：

```sh
PUBLIC_SITE_URL=https://example.com node astrowind/deployment/scripts/build-cloudflare.mjs
cd astrowind
npx wrangler dev --config deployment/wrangler.jsonc
```

正式部署前设置实际域名。完成构建后，从 `astrowind/` 执行部署命令：

```sh
npx wrangler deploy --config deployment/wrangler.jsonc
```

## 表单配置

组合部署的接口是 `/astrowind/api/contact` 和 `/astrowind/api/subscribe`。执行[数据库迁移](../supabase/migrations/20261002053928_create_form_tables.sql)后，为统一 Worker 设置 `SUPABASE_URL` 和 `SUPABASE_SECRET_KEY` Secrets。本地预览将配置写入本目录的 `.dev.vars`，不要提交密钥。表单只入库，不发送通知或订阅邮件。

从 `astrowind/` 设置统一 Worker 的密钥：

```sh
npx wrangler secret put SUPABASE_URL --config deployment/wrangler.jsonc
npx wrangler secret put SUPABASE_SECRET_KEY --config deployment/wrangler.jsonc
```

可选 Turnstile 见 [AstroWind README](../README.md#可选-turnstile)。构建环境设置 `PUBLIC_TURNSTILE_SITE_KEY`，统一 Worker 设置 `TURNSTILE_SECRET_KEY` Secret。

## 复制模板独立开发

只复制所需模板。复制 AstroWind 时排除本目录 `deployment/`，以及生成目录、已有密钥；保留 `.env.example` 和 `.dev.vars.example`。例如在仓库根目录复制到新的目标目录：

```sh
rsync -a --exclude=deployment --exclude=node_modules --exclude=dist --exclude=.astro --exclude=.wrangler --exclude=.temp \
  --include=.env.example --include=.dev.vars.example --exclude='.env*' --exclude='.dev.vars*' \
  --exclude='pnpm-*' astrowind/ ../my-site/
cd ../my-site
npm ci
npm run dev
```

复制 Starlight 时将 `astrowind/` 换为 `starlight/`。独立项目英文使用 `/`，中文使用 `/zh-cn/`；部署使用模板自身的 `wrangler.jsonc`。项目说明见各模板 README。仓库原创部分的 MIT 许可见 [LICENSE](LICENSE)，AstroWind 上游许可见 [LICENSE.md](../LICENSE.md)。
