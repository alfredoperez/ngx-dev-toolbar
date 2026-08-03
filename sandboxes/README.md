# Angular compatibility sandboxes

Each `angular-<major>/` is a **full copy of the demo app** (`apps/ngx-dev-toolbar-demo`),
pinned to a different Angular major, that runs against the **locally built** library.
They prove `ngx-dev-toolbar` actually builds **and runs** across the supported range —
not just that the peer-dependency range permits it.

| Sandbox | Angular | TypeScript |
| ------- | ------- | ---------- |
| `angular-19` | `^19.0.0` | `~5.6` |
| `angular-20` | `^20.0.0` | `~5.8` |
| `angular-21` | `^21.0.0` | `~5.9` |
| `angular-22` | `^22.0.0` | `~6.0` |

The i18n libraries (`@jsverse/transloco`, `@ngx-translate/core`) are kept uniform — their
peer ranges already cover Angular 19–22.

## How the toolbar is wired

Each sandbox depends on the library via:

```jsonc
"ngx-dev-toolbar": "file:../../dist/libs/ngx-dev-toolbar"
```

Installed with **`--install-links`** so the local `dist` is **copied** (not symlinked)
into the sandbox's `node_modules`. This is essential: it forces the app to compile the
library against its **own** Angular major instead of leaking the workspace's Angular 19.
Build the library first (`nx run ngx-dev-toolbar:build`) so `dist` exists.

## What's committed vs generated

- **Committed:** the demo-app `src/` copy, `public/`, `package.json`, `angular.json`,
  `tsconfig*.json`.
- **Gitignored:** `node_modules`, `package-lock.json`, `dist`, `.angular`.

> These are full committed copies of the demo (chosen deliberately). They can drift from
> `apps/ngx-dev-toolbar-demo` over time; re-copy `src/` when the demo changes meaningfully.

## Running locally

```bash
# Build lib, then install + production-build + headless serve-smoke every sandbox:
npm run verify:compat

# A single major (reuse the already-built dist):
node scripts/verify-compat.mjs --versions 22 --no-build

# Build only, skip the browser smoke:
node scripts/verify-compat.mjs --skip-smoke

# Open one in a dev server manually:
cd sandboxes/angular-22 && npm install --install-links --legacy-peer-deps && npm start
```

> **Node:** Angular 22 requires Node `^22.22.3 || ^24.15.0 || >=26`. Use **Node 24**
> locally and in CI — it satisfies the engine ranges of all four majors.

The serve-smoke serves the production build, loads `/` in headless Chromium, and asserts
`<ndt-toolbar>` renders with no page/console errors. CI runs the same script across a
`[19, 20, 21, 22]` matrix in `.github/workflows/compat.yml`.
