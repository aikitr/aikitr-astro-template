---
publishDate: 2026-08-24T00:00:00Z
title: 使用 Astro 与 Tailwind CSS 创建网站
excerpt: 从安装依赖、修改站点信息到发布 Markdown 文章，完成 AstroWind 网站的第一次部署。
category: Tutorials
tags: [astro, tailwind css]
---

AstroWind 提供已经组合好的页面、博客、深色模式与响应式样式。你可以先让站点运行起来，再逐步替换示例内容。

## 在本地启动

进入生成的项目目录，运行 `npm ci` 和 `npm run dev`。浏览器打开终端显示的地址，先检查首页、导航、博客和联系页。不要在尚未检查页面时就直接部署。

## 设置站点信息

在 `src/config.yaml` 中修改站点名称、正式网址和 SEO 描述。把 `https://example.com` 换成真实域名，这样规范链接、站点地图和分享预览才会指向正确位置。接着在 `src/navigation.ts` 中调整导航；如果保留双语站点，英文与中文链接都要同步检查。

## 修改页面与文章

首页在 `src/pages/index.astro`，中文首页在 `src/i18n/zh-pages.mjs`。现成区块位于 `src/components/widgets/`，可以移动和组合。博客文章保存在 `src/data/post/`，中文文章保存在其 `zh-cn/` 子目录。新增文章时使用相同文件名建立双语对应，填写标题、发布日期和摘要。

## 上线前检查

运行 `npm run check` 和 `npm run build`。在本地预览中打开中英两种语言，确认菜单、表单和文章链接可用。若启用表单，还要先配置 Supabase；若使用 Turnstile，必须同时设置站点密钥与 Worker 密钥。
