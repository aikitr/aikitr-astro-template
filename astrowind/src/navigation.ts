import { getPermalink, getBlogPermalink, getAsset, getLocalizedPermalink } from './utils/permalinks';

export const headerData = {
  links: [
    {
      text: 'Homes',
      links: [
        {
          text: 'SaaS',
          href: getPermalink('/homes/saas'),
        },
        {
          text: 'Startup',
          href: getPermalink('/homes/startup'),
        },
        {
          text: 'Mobile App',
          href: getPermalink('/homes/mobile-app'),
        },
        {
          text: 'Personal',
          href: getPermalink('/homes/personal'),
        },
      ],
    },
    {
      text: 'Pages',
      links: [
        { text: 'Showcase', href: getPermalink('/showcase') },
        {
          text: 'Features (Anchor Link)',
          href: getPermalink('/#features'),
        },
        {
          text: 'Services',
          href: getPermalink('/services'),
        },
        {
          text: 'Pricing',
          href: getPermalink('/pricing'),
        },
        {
          text: 'About us',
          href: getPermalink('/about'),
        },
        {
          text: 'Contact',
          href: getPermalink('/contact'),
        },
        {
          text: 'Terms',
          href: getPermalink('/terms'),
        },
        {
          text: 'Privacy policy',
          href: getPermalink('/privacy'),
        },
      ],
    },
    {
      text: 'Landing',
      links: [
        {
          text: 'Lead Generation',
          href: getPermalink('/landing/lead-generation'),
        },
        {
          text: 'Long-form Sales',
          href: getPermalink('/landing/sales'),
        },
        {
          text: 'Click-Through',
          href: getPermalink('/landing/click-through'),
        },
        {
          text: 'Product Details (or Services)',
          href: getPermalink('/landing/product'),
        },
        {
          text: 'Coming Soon or Pre-Launch',
          href: getPermalink('/landing/pre-launch'),
        },
        {
          text: 'Subscription',
          href: getPermalink('/landing/subscription'),
        },
      ],
    },
    {
      text: 'Blog',
      links: [
        {
          text: 'Blog List',
          href: getBlogPermalink(),
        },
        {
          text: 'Article',
          href: getPermalink('get-started-website-with-astro-tailwind-css', 'post'),
        },
        {
          text: 'Article (with MDX)',
          href: getPermalink('markdown-elements-demo-post', 'post'),
        },
        {
          text: 'Category Page',
          href: getPermalink('tutorials', 'category'),
        },
        {
          text: 'Tag Page',
          href: getPermalink('astro', 'tag'),
        },
      ],
    },
  ],
  actions: [{ text: 'Download', href: 'https://github.com/arthelokyo/astrowind', target: '_blank' }],
};

export const footerData = {
  links: [
    {
      title: 'Product',
      links: [
        { text: 'Features', href: getPermalink('/#features') },
        { text: 'Pricing', href: getPermalink('/pricing') },
        { text: 'Services', href: getPermalink('/services') },
        { text: 'Blog', href: getBlogPermalink() },
      ],
    },
    {
      title: 'Demos',
      links: [
        { text: 'SaaS', href: getPermalink('/homes/saas') },
        { text: 'Startup', href: getPermalink('/homes/startup') },
        { text: 'Mobile App', href: getPermalink('/homes/mobile-app') },
        { text: 'Personal', href: getPermalink('/homes/personal') },
        { text: 'Landing pages', href: getPermalink('/landing/lead-generation') },
      ],
    },
    {
      title: 'Resources',
      links: [
        { text: 'Documentation', href: 'https://github.com/arthelokyo/astrowind#readme' },
        { text: 'Skills for AI agents', href: 'https://github.com/arthelokyo/astrowind/tree/main/.agents/skills' },
        { text: 'Releases', href: 'https://github.com/arthelokyo/astrowind/releases' },
        { text: 'Discussions', href: 'https://github.com/arthelokyo/astrowind/discussions' },
      ],
    },
    {
      title: 'Company',
      links: [
        { text: 'About', href: getPermalink('/about') },
        { text: 'Contact', href: getPermalink('/contact') },
        { text: 'Report an issue', href: 'https://github.com/arthelokyo/astrowind/issues' },
        { text: 'License', href: 'https://github.com/arthelokyo/astrowind/blob/main/LICENSE.md' },
      ],
    },
  ],
  secondaryLinks: [
    { text: 'Terms', href: getPermalink('/terms') },
    { text: 'Privacy Policy', href: getPermalink('/privacy') },
  ],
  socialLinks: [
    { ariaLabel: 'RSS', icon: 'tabler:rss', href: getAsset('/rss.xml') },
    { ariaLabel: 'Github', icon: 'tabler:brand-github', href: 'https://github.com/arthelokyo/astrowind' },
  ],
  footNote: `
    Made by <a class="text-blue-600 underline dark:text-muted" href="https://arthelokyo.com"> Arthelokyo</a> · All rights reserved.
  `,
};

const zhLabels: Record<string, string> = {
  Homes: '首页示例',
  SaaS: 'SaaS',
  Startup: '创业公司',
  'Mobile App': '移动应用',
  Personal: '个人主页',
  Pages: '页面',
  'Features (Anchor Link)': '功能',
  Services: '服务',
  Pricing: '价格',
  'About us': '关于我们',
  Showcase: '组件展示',
  Contact: '联系',
  Terms: '使用条款',
  'Privacy policy': '隐私说明',
  Landing: '落地页',
  'Lead Generation': '潜客收集',
  'Long-form Sales': '长篇销售',
  'Click-Through': '点击跳转',
  'Product Details (or Services)': '产品详情',
  'Coming Soon or Pre-Launch': '即将上线',
  Subscription: '订阅',
  Blog: '博客',
  'Blog List': '文章列表',
  Article: '文章',
  'Article (with MDX)': 'MDX 文章',
  'Category Page': '分类页',
  'Tag Page': '标签页',
  Download: '下载',
  Product: '产品',
  Features: '功能',
  Demos: '演示',
  'Landing pages': '落地页',
  Resources: '资源',
  Documentation: '文档',
  'Skills for AI agents': 'AI 助手指南',
  Releases: '版本',
  Discussions: '讨论',
  Company: '团队',
  About: '关于',
  'Report an issue': '反馈问题',
  License: '许可证',
  'Privacy Policy': '隐私说明',
};

const localizeText = (text: string) => zhLabels[text] ?? text;
const localizeHref = (href?: string) =>
  href?.startsWith('/') && !href.startsWith('/rss.xml') ? getLocalizedPermalink(href, 'zh-cn') : href;

export const headerDataZh = {
  ...headerData,
  links: headerData.links.map((item) => ({
    ...item,
    text: localizeText(item.text),
    links: item.links.map((link) => ({ ...link, text: localizeText(link.text), href: localizeHref(link.href) })),
  })),
  actions: headerData.actions.map((action) => ({ ...action, text: localizeText(action.text) })),
};

export const footerDataZh = {
  ...footerData,
  links: footerData.links.map((group) => ({
    ...group,
    title: localizeText(group.title),
    links: group.links.map((link) => ({ ...link, text: localizeText(link.text), href: localizeHref(link.href) })),
  })),
  secondaryLinks: footerData.secondaryLinks.map((link) => ({
    ...link,
    text: localizeText(link.text),
    href: localizeHref(link.href),
  })),
  footNote: '基于 AstroWind 构建。',
};
