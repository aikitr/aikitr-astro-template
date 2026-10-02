---
publishDate: 2026-01-20T00:00:00Z
title: Markdown 元素展示
excerpt: 检查标题、列表、引用、表格和代码在博客中的显示效果。
category: Documentation
metadata:
  robots:
    index: false
tags: [markdown, blog, Astro]
---

这篇文章用于检查 Markdown 的常用排版。正式站点可以保留为内部参考，或在发布前删除。

## 二级标题

正文可以包含**重点文字**、*强调文字*和[内部链接](../blog/)。段落长度不同，有助于观察阅读宽度与行距。

### 三级标题

- 第一项：标题应说明具体内容。
- 第二项：列表之间要保持清楚的层次。
- 第三项：移动屏幕上也应容易阅读。

> 引用区块适合放简短、需要与正文区分的内容。

| 元素 | 用途           |
| ---- | -------------- |
| 标题 | 划分文章结构   |
| 列表 | 汇总步骤或要点 |
| 表格 | 比较简短资料   |

```js
const site = { title: '示例站点', locale: 'zh-CN' };
console.log(site.title);
```
