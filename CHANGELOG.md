# Changelog

All notable changes to **astroneum** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html)
once it reaches v1.0. Until then, minor releases may include breaking changes
— always check this file before upgrading.

## [Unreleased]

### Added — v0.3 Hardening

- **Subpath exports** for tree-shakeable, opt-in feature modules
  ([#roadmap-4](README.md#v04--modularization)):
  - `astroneum/replay` — `BarReplay`
  - `astroneum/multichart` — `MultiChartLayout`
  - `astroneum/watchlist` — `WatchlistManager`
  - `astroneum/portfolio` — `PortfolioTracker`
  - `astroneum/alerts` — `AlertManager`
  - `astroneum/script` — `ScriptEngine`
  - `astroneum/datafeeds/polygon` — `DefaultDatafeed` + `WebSocketDatafeed`
  - `astroneum/datafeeds/crypto` — `createStandardCryptoDatafeed` + adapters
- **`size-limit` budget** ([.size-limit.json](.size-limit.json)) with one
  budget per entry. Run `pnpm size` after `pnpm build`.
- **Datafeed contract tests** ([src/__tests__/datafeed-contract.test.ts](src/__tests__/datafeed-contract.test.ts))
  — type-level + behavioural checks for any `Datafeed` implementation.
- **SSR smoke tests** ([src/__tests__/ssr-smoke.test.ts](src/__tests__/ssr-smoke.test.ts))
  — verifies the root entry and all subpath entries import cleanly with no
  DOM globals defined, and that the root entry's public API surface is stable.
- **`CONTRIBUTING.md`**, **`SECURITY.md`**, **`CODE_OF_CONDUCT.md`**,
  and this `CHANGELOG.md`.
- **Browser support matrix** documented in [README](README.md#browser-support).

### Changed

- `pnpm verify` order is now `lint → typecheck → build → test` so SSR and
  bundle tests can assert against fresh `dist/` output.
- `tsup.config.ts` now bundles every subpath entry and injects `'use client'`
  into every emitted JS file (not just `dist/index.js`).
- `package.json#files` widened from `dist/*.{js,css,d.ts}` to
  `dist/**/*.{js,css,d.ts}` so nested subpath artifacts ship.

### Fixed

- `src/index.ts` no longer side-imports the non-existent
  `./styles/index.less` (was a leftover from a SCSS migration and caused the
  build to fail outright on a clean install).

### Deferred

Items from the roadmap that intentionally did NOT ship in this release:

- **Lazy locale loading** — requires an API change to `setLocale` and a
  per-locale bundle chunk strategy. Tracked for **v0.5**. The current eager
  bundling of all 19 locales is unchanged in this release.
- **React component tests** (`@testing-library/react` + jsdom). Requires a
  new test runner + DOM environment that does not exist in the repo yet.
  Tracked for **v0.5**.
- **Visual regression tests** (Playwright). Tracked for **v0.5**.
- **WebGPU renderer, real WASM/SIMD indicators, benchmark CI, accessibility
  pass, drawing persistence, new chart types, Storybook site.** Tracked under
  v0.5 – v1.0 in the README roadmap.

---

## [0.2.0] — 2026-05-30

Initial public roadmap baseline. See git history for details prior to this
changelog being introduced.
