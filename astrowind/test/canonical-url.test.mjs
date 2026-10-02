import assert from 'node:assert/strict';
import test from 'node:test';

import { canonicalUrl } from '../src/utils/canonical-url.mjs';

test('canonical URLs include the configured base path exactly once', () => {
  assert.equal(canonicalUrl('/', 'https://site.example', '/astrowind', true), 'https://site.example/astrowind/');
  assert.equal(
    canonicalUrl('/zh-cn/about/', 'https://site.example', '/astrowind', true),
    'https://site.example/astrowind/zh-cn/about/'
  );
  assert.equal(
    canonicalUrl('/astrowind/blog/post/', 'https://site.example', '/astrowind', true),
    'https://site.example/astrowind/blog/post/'
  );
});

test('canonical URLs respect trailing-slash settings and the default root base', () => {
  assert.equal(canonicalUrl('/about/', 'https://site.example', '/astrowind', false), 'https://site.example/astrowind/about');
  assert.equal(canonicalUrl('/about', 'https://site.example', '/', true), 'https://site.example/about/');
});
