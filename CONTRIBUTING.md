# Contributing to Astroneum

Thanks for your interest in improving Astroneum. This document covers the
basics — for the project direction, see the
[Roadmap in the README](README.md#roadmap).

## Getting started

```bash
git clone https://github.com/kowito/astroneum.git
cd astroneum
pnpm install
pnpm verify
```

Requirements:

- **Node.js ≥ 18** (matches the `engines` field).
- **pnpm 10+** (the lockfile is pnpm v10).

`pnpm verify` runs the full gate: `lint → typecheck → build → test`. Every
change must keep this green.

## Repository layout

| Path | What lives here |
| --- | --- |
| [src/chart](src/chart) | React `AstroneumChart` and surrounding controllers (replay, multi-chart, alerts, watchlist, portfolio). |
| [src/engine](src/engine) | Core engine: stores, panes, views, widgets, worker pool. |
| [src/datafeed](src/datafeed) | Reference datafeeds (Polygon, WebSocket, standard crypto). |
| [src/extension](src/extension) | Built-in drawing tool overlays. |
| [src/plugin](src/plugin) | Public indicator plugin system. |
| [src/scripting](src/scripting) | Sandboxed indicator scripting engine. |
| [src/entries](src/entries) | Subpath export entry points (e.g. `astroneum/replay`). |
| [src/i18n](src/i18n) | Locale dictionaries. |
| [src/__tests__](src/__tests__) | All tests. |
| [demo](demo) | Next.js demo app used as a live integration test. |

## Development workflow

1. **Create a branch** off `main`: `git checkout -b feat/<thing>` or
   `fix/<thing>`.
2. **Edit code and tests in lockstep.** New features need at least one
   unit test in [src/__tests__](src/__tests__).
3. **Run the gate locally:** `pnpm verify`.
4. **Run bundle-size check** when you change anything that flows into a
   shipped entry: `pnpm size`. Update the budget in
   [.size-limit.json](.size-limit.json) only with reviewer approval.
5. **Update [CHANGELOG.md](CHANGELOG.md)** under the `## [Unreleased]`
   heading. Use `Added`, `Changed`, `Fixed`, `Deprecated`, `Removed`,
   `Security`.
6. **Open a PR** targeting `main`.

## Coding conventions

- **TypeScript strict mode** — no `any`, no `as unknown as T` unless there
  is a comment justifying it.
- **No emoji in source or commits.**
- **Comments explain WHY, not WHAT.** Prefer descriptive names.
- **No side-effect imports** in the public entry, including subpath
  entries. The library must be safe to evaluate on a Next.js server.
- **2-space indentation, single quotes, no semicolons.** ESLint enforces.

## Tests

```bash
pnpm test            # one shot
pnpm test:watch      # watch mode
```

We use the **Node.js built-in test runner** via `tsx --test`. No Jest, no
Vitest. Place new tests under [src/__tests__](src/__tests__).

If a test needs the built artifacts (SSR check, bundle inspection), import
from `../../dist/...` and document the dependency in a top-of-file comment;
`pnpm verify` runs `pnpm build` before `pnpm test` to make this safe.

## Adding a new subpath export

1. Create a thin re-export file under `src/entries/<name>.ts` (or
   `src/entries/<group>/<name>.ts`).
2. Add the file to `entry` in [tsup.config.ts](tsup.config.ts).
3. Add an `"./<name>": { ... }` block under `exports` in
   [package.json](package.json).
4. Add a size budget in [.size-limit.json](.size-limit.json).
5. Add an SSR import test in
   [src/__tests__/ssr-smoke.test.ts](src/__tests__/ssr-smoke.test.ts).
6. Document the new entry in [README.md](README.md) and
   [CHANGELOG.md](CHANGELOG.md).

## Reporting bugs

File issues at <https://github.com/kowito/astroneum/issues>. Include:

- The version (`astroneum` package version).
- A minimum reproduction (StackBlitz, CodeSandbox, or a repo).
- Browser + OS + framework versions.
- For runtime crashes: the stack trace.

## Security

Do not file security bugs on the public issue tracker. See
[SECURITY.md](SECURITY.md).

## License

By contributing, you agree that your contributions will be licensed under
the project's [MIT License](LICENSE).
