---
publishDate: 2026-07-27T00:00:00Z
title: AstroWind 模板的内部工作方式
excerpt: 理解配置集成、页面路由、内容集合和图片处理之间的关系。
category: Documentation
tags: [astro, tailwind css, front-end]
---

日常改文案通常只需要编辑页面和 Markdown。遇到路由、构建或图片问题时，理解模板的几层边界会更有帮助。

## 配置如何进入页面

`vendor/integration/` 在 Astro 启动时读取 `src/config.yaml`，将站点名称、网址、博客设置和界面选项提供给组件。配置中的正式网址影响规范链接、站点地图及分享元数据，因此不能长期保留示例域名。

## 页面与内容

`src/pages/` 决定访问路径；主页和演示页由 Astro 组件组成。文章在 `src/data/post/`，通过 `src/content.config.ts` 定义的集合读取，并在构建时生成静态页面。中文文章放在 `zh-cn/`，与英文文章使用相同文件名，以便语言切换对应。

## 静态页面与动态提交

绝大多数页面在构建时生成，访问时不需要数据库查询。只有 `/api/contact` 和 `/api/subscribe` 在 Cloudflare Worker 上运行，负责验证并保存表单。Supabase 密钥只保存在 Worker 环境中，不会进入浏览器脚本。

## 图片与样式

本地图片可由 Astro 处理；远程图片则依赖相应来源的优化能力。Tailwind 的主题变量与组件样式共同决定视觉效果。修改图片或字体时，务必在生产构建中检查结果。
