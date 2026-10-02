import { access, cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

export async function assembleCloudflareAssets(
  projectRoot = rootDir,
  { publicSiteUrl = process.env.PUBLIC_SITE_URL ?? 'https://example.com' } = {}
) {
  const outputDir = path.join(projectRoot, 'dist');
  const sources = [
    [path.join(projectRoot, 'astrowind', 'dist', 'client'), path.join(outputDir, 'astrowind')],
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

  const site = new URL(publicSiteUrl);
  if (site.pathname !== '/' || site.search || site.hash) {
    throw new Error('PUBLIC_SITE_URL must be an origin such as https://docs.example.com, without a path or query.');
  }

  const astrowindDir = path.join(outputDir, 'astrowind');
  for (const fileName of await readdir(astrowindDir)) {
    if (fileName.startsWith('sitemap') && fileName.endsWith('.xml')) {
      const filePath = path.join(astrowindDir, fileName);
      const content = await readFile(filePath, 'utf8');
      await writeFile(filePath, content.replaceAll(`<loc>${site.origin}/`, `<loc>${site.origin}/astrowind/`));
    }
  }

  const robotsPath = path.join(astrowindDir, 'robots.txt');
  try {
    const robots = await readFile(robotsPath, 'utf8');
    await writeFile(robotsPath, robots.replace(/^Sitemap:.*$/m, `Sitemap: ${site.origin}/astrowind/sitemap-index.xml`));
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await assembleCloudflareAssets();
  console.log('Combined Cloudflare assets are ready in dist/astrowind and dist/startlight.');
}
