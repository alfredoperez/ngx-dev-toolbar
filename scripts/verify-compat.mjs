#!/usr/bin/env node
// @ts-check
/**
 * Angular version-compatibility verifier for ngx-dev-toolbar.
 *
 * Each `sandboxes/angular-<v>/` is a full copy of the demo app, pinned to a
 * different Angular major, that depends on the LOCAL library build
 * (`file:../../dist/libs/ngx-dev-toolbar`, installed with --install-links so it
 * is a real copy isolated from the workspace's Angular 19). For every version
 * this script:
 *   1. installs (--install-links --legacy-peer-deps),
 *   2. runs a production `ng build`,
 *   3. serve-smokes the build with Playwright: loads `/`, asserts <ndt-toolbar>
 *      renders, and fails on any page/console error.
 *
 * Usage:
 *   node scripts/verify-compat.mjs                 # all sandboxes, full check
 *   node scripts/verify-compat.mjs --versions 22   # subset (comma-separated)
 *   node scripts/verify-compat.mjs --no-build      # skip rebuilding the library
 *   node scripts/verify-compat.mjs --skip-smoke    # build only, no browser
 */

import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, rmSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, join, resolve, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const SANDBOXES = join(ROOT, 'sandboxes');
const DIST_LIB = join(ROOT, 'dist', 'libs', 'ngx-dev-toolbar');

const args = process.argv.slice(2);
const noBuild = args.includes('--no-build');
const skipSmoke = args.includes('--skip-smoke');

const versionsFlagIndex = args.indexOf('--versions');
const versionsArg = versionsFlagIndex !== -1 ? args[versionsFlagIndex + 1] : null;

if (versionsFlagIndex !== -1 && (!versionsArg || versionsArg.startsWith('--'))) {
  console.error('Missing value for --versions (expected e.g. "19" or "19,20").');
  process.exit(1);
}

const requested = versionsArg
  ? versionsArg.split(',').map((v) => v.trim()).filter(Boolean)
  : discoverSandboxVersions();

function discoverSandboxVersions() {
  if (!existsSync(SANDBOXES)) return [];
  return readdirSync(SANDBOXES, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name.startsWith('angular-'))
    .map((d) => d.name.replace('angular-', ''))
    .sort((a, b) => Number(a) - Number(b));
}

/**
 * Angular 22 needs Node ^22.22.3 || ^24.15 || >=26; older majors are happy on
 * Node 22+. Warn early with a clear message instead of a cryptic ng CLI error.
 */
function warnNodeForVersions(versions) {
  const [maj, min, patch] = process.versions.node.split('.').map(Number);
  const ok22 =
    (maj === 22 && (min > 22 || (min === 22 && patch >= 3))) ||
    (maj === 24 && min >= 15) ||
    maj >= 26;
  if (versions.includes('22') && !ok22) {
    console.warn(
      `\n⚠️  Node ${process.versions.node} cannot build the Angular 22 sandbox ` +
        `(needs ^22.22.3 || ^24.15 || >=26). Use Node 24 (e.g. \`nvm use 24\`).\n`
    );
  }
}

function run(cmd, cmdArgs, cwd) {
  console.log(`\n$ ${cmd} ${cmdArgs.join(' ')}   (cwd: ${cwd.replace(ROOT, '.')})`);
  execFileSync(cmd, cmdArgs, { cwd, stdio: 'inherit', shell: process.platform === 'win32' });
}

function buildLib() {
  console.log('\n=== Building library to dist ===');
  run('npx', ['nx', 'run', 'ngx-dev-toolbar:build'], ROOT);
  if (!existsSync(DIST_LIB)) throw new Error(`Library build missing at ${DIST_LIB}`);
}

const MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
};

/** Tiny static file server with SPA fallback to index.html. */
function serveStatic(rootDir) {
  return new Promise((resolvePort) => {
    const server = createServer((req, res) => {
      const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
      let filePath = join(rootDir, urlPath);
      try {
        if (existsSync(filePath) && statSync(filePath).isFile()) {
          // serve as-is
        } else {
          filePath = join(rootDir, 'index.html'); // SPA fallback
        }
        const body = readFileSync(filePath);
        res.writeHead(200, { 'Content-Type': MIME[extname(filePath)] || 'application/octet-stream' });
        res.end(body);
      } catch {
        res.writeHead(404);
        res.end('not found');
      }
    });
    server.listen(0, '127.0.0.1', () => {
      const { port } = /** @type {import('node:net').AddressInfo} */ (server.address());
      resolvePort({ server, port });
    });
  });
}

/**
 * Serve-smoke: load the built app headless, assert the toolbar renders, fail on
 * page/console errors. Returns { ok, error }.
 */
async function serveSmoke(version) {
  const browserRoot = join(SANDBOXES, `angular-${version}`, 'dist', 'browser');
  if (!existsSync(browserRoot)) {
    return { ok: false, error: `build output missing at ${browserRoot}` };
  }

  let chromium;
  try {
    ({ chromium } = await import('@playwright/test'));
  } catch {
    return { ok: false, error: 'Playwright not available at repo root (npm i + npx playwright install chromium)' };
  }

  const { server, port } = await serveStatic(browserRoot);
  let browser;
  try {
    browser = await chromium.launch();
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
    page.on('console', (m) => {
      if (m.type() === 'error') errors.push(`console.error: ${m.text()}`);
    });

    await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle' });
    // provideToolbar() auto-attaches <ndt-toolbar>; wait for it to exist.
    await page.waitForSelector('ndt-toolbar', { timeout: 15000, state: 'attached' });

    // Ignore benign font/network noise; only real app errors should fail us.
    const appErrors = errors.filter(
      (e) => !/fonts\.googleapis|fonts\.gstatic|favicon|net::ERR/i.test(e)
    );
    if (appErrors.length) {
      return { ok: false, error: `runtime errors: ${appErrors.slice(0, 3).join(' | ')}` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  } finally {
    if (browser) await browser.close();
    server.close();
  }
}

function installAndBuild(version) {
  const dir = join(SANDBOXES, `angular-${version}`);
  if (!existsSync(dir)) throw new Error(`Sandbox not found: ${dir}`);

  // Force a fresh copy of the just-built library (--install-links copies the
  // dist dir into node_modules; removing it first avoids a stale copy).
  rmSync(join(dir, 'node_modules', 'ngx-dev-toolbar'), { recursive: true, force: true });

  // --install-links: copy local `file:` deps instead of symlinking, so the app
  //   compiles the library against its OWN Angular major, not the workspace's.
  // --legacy-peer-deps: the sandbox installs a higher Angular major than the
  //   library's declared peer floor (>=19); the build is the real gate.
  run('npm', ['install', '--install-links', '--legacy-peer-deps'], dir);
  run('npm', ['run', 'build'], dir);
}

async function main() {
  if (!requested.length) {
    console.error('No sandboxes found under sandboxes/angular-*');
    process.exit(1);
  }
  warnNodeForVersions(requested);
  if (!noBuild) buildLib();
  else if (!existsSync(DIST_LIB)) throw new Error(`--no-build set but ${DIST_LIB} is missing.`);

  console.log(`\n=== Verifying Angular: ${requested.join(', ')}${skipSmoke ? ' (build only)' : ' (build + serve smoke)'} ===`);
  const results = [];
  for (const version of requested) {
    try {
      installAndBuild(version);
      if (skipSmoke) {
        results.push({ version, ok: true, smoke: 'skipped' });
      } else {
        const smoke = await serveSmoke(version);
        results.push({ version, ok: smoke.ok, error: smoke.error, smoke: smoke.ok ? 'pass' : 'fail' });
      }
    } catch (err) {
      results.push({ version, ok: false, error: err instanceof Error ? err.message : String(err), smoke: 'n/a' });
    }
  }

  console.log('\n=== Compatibility summary ===');
  for (const r of results) {
    const detail = r.ok ? `PASS ✓ (smoke: ${r.smoke})` : `FAIL ✗  (${r.error})`;
    console.log(`  Angular ${r.version}: ${detail}`);
  }

  const failed = results.filter((r) => !r.ok);
  if (failed.length) {
    console.error(`\n${failed.length} version(s) failed: ${failed.map((r) => r.version).join(', ')}`);
    process.exit(1);
  }
  console.log('\nAll versions passed.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
