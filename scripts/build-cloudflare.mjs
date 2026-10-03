import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assembleCloudflareAssets } from './assemble-cloudflare.mjs';

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';

function runNpm(args, env = process.env) {
  return new Promise((resolve, reject) => {
    const child = spawn(npm, args, { cwd: rootDir, env, stdio: 'inherit' });
    child.once('error', reject);
    child.once('exit', (code, signal) => {
      if (code === 0) resolve();
      else reject(new Error(`npm ${args.join(' ')} failed (${signal ?? `exit ${code}`}).`));
    });
  });
}

const publicSiteUrl = process.env.PUBLIC_SITE_URL ?? 'https://example.com';
for (const [template, variable, base] of [
  ['astrowind', 'ASTROWIND_BASE', '/astrowind'],
  ['starlight', 'STARLIGHT_BASE', '/startlight'],
]) {
  await runNpm(['ci', '--prefix', template]);
  await runNpm(['run', 'build', '--prefix', template], {
    ...process.env,
    [variable]: base,
    PUBLIC_SITE_URL: publicSiteUrl,
  });
}
await assembleCloudflareAssets(rootDir, { publicSiteUrl });
