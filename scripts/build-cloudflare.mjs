import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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

await runNpm(['ci', '--prefix', 'astrowind']);
await runNpm(['ci', '--prefix', 'starlight']);
await runNpm(['run', 'build', '--prefix', 'astrowind'], {
  ...process.env,
  ASTROWIND_BASE: '/astrowind',
  PUBLIC_SITE_URL: process.env.PUBLIC_SITE_URL ?? 'https://example.com',
});
await runNpm(['run', 'build', '--prefix', 'starlight'], {
  ...process.env,
  STARLIGHT_BASE: '/startlight',
  PUBLIC_SITE_URL: process.env.PUBLIC_SITE_URL ?? 'https://example.com',
});
await runNpm(['run', 'assemble:cloudflare']);
