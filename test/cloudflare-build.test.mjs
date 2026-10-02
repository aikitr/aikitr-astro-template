import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { assembleCloudflareAssets } from '../scripts/assemble-cloudflare.mjs';

test('assembles both sites beneath their public path and removes stale output', async () => {
  const rootDir = await mkdtemp(path.join(os.tmpdir(), 'astro-cloudflare-'));

  try {
    await mkdir(path.join(rootDir, 'starlight', 'dist'), { recursive: true });
    await mkdir(path.join(rootDir, 'astrowind', 'dist', 'client'), { recursive: true });
    await mkdir(path.join(rootDir, 'dist'), { recursive: true });
    await writeFile(path.join(rootDir, 'starlight', 'dist', 'index.html'), 'docs');
    await writeFile(path.join(rootDir, 'astrowind', 'dist', 'client', 'index.html'), 'site');
    await writeFile(
      path.join(rootDir, 'astrowind', 'dist', 'client', 'sitemap-index.xml'),
      '<loc>https://example.test/sitemap-0.xml</loc>'
    );
    await writeFile(path.join(rootDir, 'astrowind', 'dist', 'client', 'robots.txt'), 'Sitemap: https://example.test/sitemap-index.xml');
    await writeFile(path.join(rootDir, 'dist', 'stale.txt'), 'stale');

    await assembleCloudflareAssets(rootDir, { publicSiteUrl: 'https://example.test' });

    assert.equal(await readFile(path.join(rootDir, 'dist', 'startlight', 'index.html'), 'utf8'), 'docs');
    assert.equal(await readFile(path.join(rootDir, 'dist', 'astrowind', 'index.html'), 'utf8'), 'site');
    assert.equal(
      await readFile(path.join(rootDir, 'dist', 'astrowind', 'sitemap-index.xml'), 'utf8'),
      '<loc>https://example.test/astrowind/sitemap-0.xml</loc>'
    );
    assert.equal(
      await readFile(path.join(rootDir, 'dist', 'astrowind', 'robots.txt'), 'utf8'),
      'Sitemap: https://example.test/astrowind/sitemap-index.xml'
    );
    await assert.rejects(readFile(path.join(rootDir, 'dist', 'stale.txt')));
  } finally {
    await rm(rootDir, { recursive: true, force: true });
  }
});
