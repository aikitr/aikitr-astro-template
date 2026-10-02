import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, existsSync, rmSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { test } from 'node:test';

const root = resolve(import.meta.dirname, '..');
const cli = join(root, 'scripts/create.mjs');

function workspace(t) {
  const dir = mkdtempSync(join(tmpdir(), 'aikitr-create-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  return dir;
}

function run(args, input) {
  return spawnSync(process.execPath, [cli, ...args], {
    cwd: root,
    input,
    encoding: 'utf8',
  });
}

function runAsync(args) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [cli, ...args], { cwd: root });
    let stderr = '';
    child.stderr.on('data', (chunk) => (stderr += chunk));
    child.on('close', (code) => resolve({ code, stderr }));
  });
}

test('creates an independent Starlight project with a custom name', (t) => {
  const dir = workspace(t);
  const destination = join(dir, 'docs');
  const result = run(['--template', 'starlight', '--name', 'Acme Docs', '--dir', destination]);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(JSON.parse(readFileSync(join(destination, 'package.json'), 'utf8')).name, 'acme-docs');
  assert.equal(JSON.parse(readFileSync(join(destination, 'package-lock.json'), 'utf8')).name, 'acme-docs');
  assert.match(readFileSync(join(destination, 'astro.config.mjs'), 'utf8'), /Acme Docs/);
  assert.match(readFileSync(join(destination, 'wrangler.jsonc'), 'utf8'), /acme-docs/);
  assert.ok(existsSync(join(destination, 'src/content/docs/zh-cn/index.md')));
  assert.ok(!existsSync(join(destination, 'node_modules')));
});

test('creates AstroWind without copying upstream tooling files', (t) => {
  const dir = workspace(t);
  const destination = join(dir, 'site');
  const result = run(['--template', 'astrowind', '--name', 'My Site', '--dir', destination]);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(JSON.parse(readFileSync(join(destination, 'package.json'), 'utf8')).name, 'my-site');
  assert.equal(JSON.parse(readFileSync(join(destination, 'package-lock.json'), 'utf8')).name, 'my-site');
  assert.match(readFileSync(join(destination, 'src/config.yaml'), 'utf8'), /name: 'My Site'/);
  assert.ok(existsSync(join(destination, 'LICENSE.md')));
  assert.ok(existsSync(join(destination, 'src/pages/zh-cn/index.astro')));
  assert.ok(existsSync(join(destination, 'supabase/migrations/20261002053928_create_form_tables.sql')));
  assert.ok(existsSync(join(destination, '.dev.vars.example')));
  assert.ok(!existsSync(join(destination, '.dev.vars')));
  assert.ok(!existsSync(join(destination, 'supabase/.temp')));
  assert.ok(!existsSync(join(destination, '.git')));
});

test('refuses to overwrite an existing directory', (t) => {
  const dir = workspace(t);
  const destination = join(dir, 'occupied');
  mkdirSync(destination);
  const result = run(['--template', 'starlight', '--name', 'Docs', '--dir', destination]);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /already exists/i);
  assert.ok(!existsSync(join(destination, 'package.json')));
});

test('concurrent creation reserves a destination exactly once', async (t) => {
  const dir = workspace(t);
  const destination = join(dir, 'raced');
  const args = ['--template', 'starlight', '--name', 'Race Docs', '--dir', destination];
  const results = await Promise.all([runAsync(args), runAsync(args)]);
  assert.deepEqual(
    results.map((result) => result.code).sort(),
    [0, 1]
  );
  assert.equal(JSON.parse(readFileSync(join(destination, 'package.json'), 'utf8')).name, 'race-docs');
});

test('rejects unknown templates', (t) => {
  const dir = workspace(t);
  const result = run(['--template', 'unknown', '--name', 'Docs', '--dir', join(dir, 'site')]);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /template/i);
});

test('prints help without requiring interactive input', () => {
  const result = run(['--help']);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /Usage:/);
});

test('quotes project titles safely in generated config', (t) => {
  const dir = workspace(t);
  const title = "Bob's Site: #1";
  const docs = join(dir, 'docs');
  const site = join(dir, 'site');
  assert.equal(run(['--template', 'starlight', '--name', title, '--dir', docs]).status, 0);
  assert.equal(run(['--template', 'astrowind', '--name', title, '--dir', site]).status, 0);
  assert.match(readFileSync(join(docs, 'astro.config.mjs'), 'utf8'), /title: "Bob's Site: #1"/);
  assert.match(readFileSync(join(site, 'src/config.yaml'), 'utf8'), /name: "Bob's Site: #1"/);
});
