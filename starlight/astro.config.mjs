import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: process.env.PUBLIC_SITE_URL ?? 'https://example.com',
  base: process.env.STARLIGHT_BASE ?? '/',
  integrations: [
    starlight({
      title: 'Starter Docs',
      locales: {
        root: { label: 'English', lang: 'en' },
        'zh-cn': { label: '简体中文', lang: 'zh-CN' },
      },
      sidebar: [
        { label: 'Guides', translations: { 'zh-CN': '指南' }, items: [{ autogenerate: { directory: 'guides' } }] },
        { label: 'Reference', translations: { 'zh-CN': '参考' }, items: [{ autogenerate: { directory: 'reference' } }] },
      ],
    }),
  ],
});
