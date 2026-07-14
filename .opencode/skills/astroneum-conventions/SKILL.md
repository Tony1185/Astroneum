---
name: astroneum-conventions
description: Use when writing or modifying Astroneum library source code, demo app code, tests, or build config. Covers ESM, branded types, path alias, tsup, tests, size budgets, subpath exports, i18n, and the 'use client' injection post-build step.
---

# Astroneum Conventions

Follow these when touching any source, config, or build file in the Astroneum repo.

## Module system

- ESM-only. `package.json` has `"type": "module"`.
- tsup config: `format: ['esm']`, `target: 'esnext'`, `splitting: true`, `treeshake: true`.
- `external: ['react', 'react-dom', 'react-dom/client', 'react/jsx-runtime']` — never bundle React.

## Path alias

- `@/` → `./src/` (tsconfig `paths` + tsup esbuild `alias`).
- Use `@/chart/AstroneumChart` not `../../chart/AstroneumChart` in library source.

## Branded financial types

- `Price`, `Volume`, `Timestamp` — defined in `src/types.ts`.
- Use them in public APIs and indicator calc functions. Don't pass raw `number` where a branded type exists.

## 'use client' injection

- tsup `onSuccess` walks `dist/` and prepends `'use client';` to every `.js` file.
- **Do not** add `'use client'` manually to `src/` files — it's injected at build time.
- The demo app imports are safe — `transpilePackages: ['astroneum']` in `next.config.ts`.

## Tests

- Location: `src/__tests__/*.test.ts` (excluded from tsconfig `include`).
- Runner: `tsx --test src/__tests__/*.test.ts` (via `pnpm test`).
- Write tests for new indicators, datafeed contracts, and public API surface changes.
- No React RTL component tests yet (TODO §10.1) — focus on logic/unit tests.

## Size budgets

- `.size-limit.json` defines per-entry budgets:
  - Root entry: 200 KB
  - `replay`, `multichart`, `script`: 15 KB each
  - `watchlist`, `portfolio`, `alerts`: 10 KB each
  - `datafeeds/polygon`, `datafeeds/crypto`: 30 KB each
- Run `pnpm size` after adding exports or significant code. If a budget is exceeded, either tree-shake better or raise the budget (with justification).

## Subpath exports

Adding a new subpath export requires **three** synchronized changes:
1. `package.json` `exports` map — add the new entry path + dist target.
2. `tsup.config.ts` `entry` array — add the source file.
3. `src/entries/` — create the entry file (barrel that re-exports from `src/`).

Missing any one of these breaks the build or the public API.

## i18n

- 18 locale JSON files in `src/i18n/` (`ar-SA, de-DE, en-US, es-ES, fr-FR, hi-IN, id-ID, it-IT, ja-JP, ko-KR, nl-NL, pl-PL, pt-BR, ru-RU, th-TH, tr-TR, vi-VN, zh-CN`).
- New keys go in `en-US.json` first. Other locales fall back to en-US if missing.
- Only `en-US` and `zh-CN` are kept current with new keys (TODO §10.5).

## TypeScript

- `strict: true`, `noEmit: true` (typecheck only — tsup does the bundling).
- `moduleResolution: "Bundler"`, `isolatedModules: true`.
- `jsx: "preserve"`, `jsxImportSource: "@/jsx"` (custom JSX runtime in `src/jsx/`).
- The demo app has its own `tsconfig.json` — don't mix library and demo TS config.

## CSS / styles

- `src/styles/` → built to `dist/astroneum.css` via sass + esbuild (inlines fonts as data URLs).
- Demo app styles in `demo/src/app/globals.css` + component CSS files.
- Design tokens: `--astroneum-*` CSS custom properties. See `@design` and `@demo-design`.

## eslint

- Flat config (`eslint.config.js`). Run `pnpm lint` — part of `pnpm verify`.

## Verify command

```
pnpm verify = pnpm lint && pnpm typecheck && pnpm build && pnpm test
```

This is the gate. It must pass before deploy. Run it after any source change.
