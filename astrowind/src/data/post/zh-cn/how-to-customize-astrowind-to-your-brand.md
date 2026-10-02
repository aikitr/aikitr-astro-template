---
publishDate: 2026-08-10T00:00:00Z
title: 定制网站的颜色、字体与标识
excerpt: 按顺序替换配色、字体、标识和站点信息，让示例站点成为自己的品牌网站。
category: Documentation
tags: [astro, tailwind css, theme]
---

一个模板只有在内容、视觉和行为都与你的项目一致时，才算真正完成定制。先确定品牌基础，再逐步修改各处的引用。

## 颜色与深色模式

在 `src/components/CustomStyles.astro` 中调整浅色和深色变量。修改后检查按钮、链接、表单边框及正文对比度。不要只看首页；长文章和移动菜单也会使用这些颜色。

## 字体与标识

字体由 `astro.config.ts` 中的 Astro Fonts API 配置。替换字体后观察中英文混排的宽度与换行。标识组件在 `src/components/Logo.astro`，图标文件放在 `src/assets/favicons/`；同时更新社交分享图，避免分享链接时仍出现示例品牌。

## 文案和站点资料

修改 `src/config.yaml` 的名称、网址与默认描述，检查导航、页脚和结构化数据。示例页面中的统计、评价与人物资料只是演示，正式发布前应替换为可核实的信息或移除。
