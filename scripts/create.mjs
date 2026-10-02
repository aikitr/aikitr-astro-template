#!/usr/bin/env node
import { cp, access, readFile, readdir, writeFile, rm, mkdir } from 'node:fs/promises';
import { join, resolve, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createInterface } from 'node:readline/promises';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const templates = new Set(['starlight', 'astrowind']);
const excluded = new Set(['node_modules', '.git', '.astro', 'dist', '.wrangler', '.temp', '.dev.vars', '.env', '.DS_Store']);
const shouldCopy = (path) => {
  const name = basename(path);
  if (excluded.has(name)) return false;
  if (name.startsWith('.env.') && name !== '.env.example') return false;
  if (name.startsWith('.dev.vars.') && name !== '.dev.vars.example') return false;
  return true;
};

function parseArgs(argv) {
  const values = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') return { help: true };
    if (!['--template', '--name', '--dir'].includes(arg) || !argv[i + 1] || argv[i + 1].startsWith('--')) {
      throw new Error(`Invalid argument: ${arg}`);
    }
    values[arg.slice(2)] = argv[++i];
  }
  return values;
}

function slugify(name) {
  const slug = name.normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  if (!slug) throw new Error('Project name must contain Latin letters or digits for npm and Cloudflare.');
  return slug;
}

function yamlQuote(value) {
  return /['\r\n]/.test(value) ? JSON.stringify(value) : `'${value}'`;
}

async function promptMissing(options) {
  if (options.template && options.name) return options;
  if (!process.stdin.isTTY) throw new Error('Provide --template and --name in non-interactive mode.');
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    options.template ||= (await rl.question('Template (starlight/astrowind): ')).trim().toLowerCase();
    options.name ||= (await rl.question('Project name: ')).trim();
    if (!options.dir) {
      const suggested = slugify(options.name);
      options.dir = (await rl.question(`Target directory [${suggested}]: `)).trim() || suggested;
    }
    return options;
  } finally {
    rl.close();
  }
}

async function replaceInFile(path, replacements) {
  let source = await readFile(path, 'utf8');
  for (const [from, to] of replacements) source = source.replaceAll(from, to);
  await writeFile(path, source);
}

async function exists(path) {
  try { await access(path); return true; } catch { return false; }
}

async function main() {
  const parsed = parseArgs(process.argv.slice(2));
  if (parsed.help) {
    console.log('Usage: npm run create -- --template starlight|astrowind --name "My Site" [--dir path]');
    return;
  }
  const options = await promptMissing(parsed);
  if (options.help) {
    console.log('Usage: npm run create -- --template starlight|astrowind --name "My Site" [--dir path]');
    return;
  }
  if (!templates.has(options.template)) throw new Error('Template must be starlight or astrowind.');
  const title = options.name.trim();
  const slug = slugify(title);
  const destination = resolve(options.dir || slug);
  try {
    await mkdir(destination);
  } catch (error) {
    if (error.code === 'EEXIST') throw new Error(`Destination already exists: ${destination}`);
    throw error;
  }

  try {
    const templateDir = join(root, options.template);
    for (const entry of await readdir(templateDir)) {
      if (!shouldCopy(entry)) continue;
      await cp(join(templateDir, entry), join(destination, entry), {
        recursive: true,
        filter: shouldCopy,
      });
    }
    const packagePath = join(destination, 'package.json');
    const pkg = JSON.parse(await readFile(packagePath, 'utf8'));
    pkg.name = slug;
    await writeFile(packagePath, JSON.stringify(pkg, null, 2) + '\n');
    const lockPath = join(destination, 'package-lock.json');
    if (await exists(lockPath)) {
      const lock = JSON.parse(await readFile(lockPath, 'utf8'));
      lock.name = slug;
      if (lock.packages?.['']) lock.packages[''].name = slug;
      await writeFile(lockPath, JSON.stringify(lock, null, 2) + '\n');
    }
    if (options.template === 'starlight') {
      await replaceInFile(join(destination, 'astro.config.mjs'), [["'Starter Docs'", JSON.stringify(title)]]);
      await replaceInFile(join(destination, 'wrangler.jsonc'), [['starter-docs', slug]]);
    } else {
      await replaceInFile(join(destination, 'src/config.yaml'), [
        ['site_name: Starter Site', `site_name: ${yamlQuote(title)}`],
        ['name: Starter Site', `name: ${yamlQuote(title)}`],
        ['default: Starter Site', `default: ${yamlQuote(title)}`],
        ["template: '%s — Starter Site'", `template: ${yamlQuote(`%s — ${title}`)}`],
      ]);
      await replaceInFile(join(destination, 'wrangler.jsonc'), [['starter-site', slug]]);
    }
  } catch (error) {
    await rm(destination, { recursive: true, force: true });
    throw error;
  }
  console.log(`Created ${options.template} project at ${destination}`);
  console.log(
    `Next: cd ${destination}\n  npm ci\n  npm run dev\n  Read README.md for ${options.template === 'astrowind' ? 'Supabase and Cloudflare setup' : 'content and Cloudflare setup'}.`
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
