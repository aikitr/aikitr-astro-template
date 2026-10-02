import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { test } from 'node:test';
import { zhPages } from '../src/i18n/zh-pages.mjs';

const root = resolve(import.meta.dirname, '..');

test('every English marketing page has Chinese route data', () => {
  const pages = ['index', 'about', 'contact', 'services', 'pricing', 'showcase'];
  const homes = readdirSync(join(root, 'src/pages/homes'))
    .filter((file) => file.endsWith('.astro'))
    .map((file) => `homes/${file.slice(0, -6)}`);
  const landing = readdirSync(join(root, 'src/pages/landing'))
    .filter((file) => file.endsWith('.astro'))
    .map((file) => `landing/${file.slice(0, -6)}`);
  const expected = [...pages, ...homes, ...landing].sort();
  assert.deepEqual(zhPages.map((page) => page.slug).sort(), expected);
  for (const page of zhPages) {
    assert.match(page.title, /[\u3400-\u9fff]/);
    assert.ok(page.points.length >= 3, `${page.slug} needs substantive sections`);
  }
});

test('every English sample post has a Chinese Markdown counterpart', () => {
  const english = readdirSync(join(root, 'src/data/post'))
    .filter((file) => /\.mdx?$/.test(file))
    .map((file) => file.replace(/\.mdx?$/, ''));
  const chinese = readdirSync(join(root, 'src/data/post/zh-cn'))
    .filter((file) => /\.mdx?$/.test(file))
    .map((file) => file.replace(/\.mdx?$/, ''));
  assert.deepEqual(chinese.sort(), english.sort());
});
