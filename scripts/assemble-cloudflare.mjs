import { access, cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

export async function assembleCloudflareAssets(projectRoot, { publicSiteUrl = 'https://example.com' } = {}) {
  const site = new URL(publicSiteUrl);
  if (site.pathname !== '/' || site.search || site.hash) {
    throw new Error('PUBLIC_SITE_URL must be an origin such as https://docs.example.com, without a path or query.');
  }
  const outputDir = path.join(projectRoot, 'dist');
  const sources = [
    [path.join(projectRoot, 'astrowind', 'dist', 'client', 'astrowind'), path.join(outputDir, 'astrowind')],
    [path.join(projectRoot, 'starlight', 'dist'), path.join(outputDir, 'startlight')],
  ];

  for (const [source] of sources) {
    try {
      await access(source);
    } catch {
      throw new Error(`Missing build output: ${path.relative(projectRoot, source)}. Run the template builds first.`);
    }
  }

  await rm(outputDir, { recursive: true, force: true });
  await mkdir(outputDir, { recursive: true });

  for (const [source, destination] of sources) {
    await cp(source, destination, { recursive: true });
  }

  const astrowindDir = path.join(outputDir, 'astrowind');
  for (const fileName of await readdir(astrowindDir)) {
    if (fileName.startsWith('sitemap') && fileName.endsWith('.xml')) {
      const filePath = path.join(astrowindDir, fileName);
      const content = await readFile(filePath, 'utf8');
      const escapedOrigin = site.origin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const unprefixedLocation = new RegExp(`(<loc>${escapedOrigin}/)(?!astrowind/)`, 'g');
      await writeFile(filePath, content.replace(unprefixedLocation, '$1astrowind/'));
    }
  }

  const robotsPath = path.join(astrowindDir, 'robots.txt');
  try {
    const robots = await readFile(robotsPath, 'utf8');
    await writeFile(robotsPath, robots.replace(/^Sitemap:.*$/m, `Sitemap: ${site.origin}/astrowind/sitemap-index.xml`));
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }

  await writeFile(
    path.join(outputDir, 'robots.txt'),
    [
      'User-agent: *',
      'Allow: /',
      `Sitemap: ${site.origin}/astrowind/sitemap-index.xml`,
      `Sitemap: ${site.origin}/startlight/sitemap-index.xml`,
      '',
    ].join('\n')
  );
}
