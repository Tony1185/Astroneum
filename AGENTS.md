# AGENTS.md — Astroneum AI OS

## Identity

Astroneum is a professional financial charting library for React — MIT, ESM-only,
Canvas/WebGL/WebGPU, TypeScript. Goal: TradingView-class features, zero licensing fees.
The demo app at `/astroneum/` is the reference terminal proving the library works out of the box.

**You are building the library and its demo.** Not trading on it, not analyzing markets.

## Git topology

- `origin` → `Tony1185/Astroneum` — your fork. Push here. AI OS files live here only.
- `upstream` → `kowito/astroneum` — original library. Pull updates, merge/rebase into fork.
- Server `/opt/astroneum` clones from `Tony1185/Astroneum`.
- `.opencode/` + `AGENTS.md` are fork-only. Never PR them to upstream.

Sync flow: local edit → `git push origin` → `ssh 72.62.73.180 "cd /opt/astroneum && git pull"` → build → restart.

## Source of truth docs

Read the relevant doc **before building**. These are wired as `@references` in opencode.json.

| Alias | Doc | Role |
|---|---|---|
| `@structure` | `docs/STRUCTURE.md` | Where things live — file tree, deploy topology, build flow, refresh workflow |
| `@gaps` | `docs/TODO.md` | Actionable function-gap backlog — one row per gap with status + next action |
| `@workstreams` | `docs/WORKSTREAMS.md` | Work ownership, file boundaries, dependencies, acceptance, and handoff |
| `@design-gaps` | `docs/TODO-DESIGN.md` | Design/layout gap backlog — TV UI surfaces → Astroneum mirror |
| `@parity` | `docs/tv-functions-skill.md` | TV→Astroneum function catalog + 6-bucket status authority + build/verify workflow |
| `@design` | `docs/design-astroneum.md` | Library UX spec — colors, typography, layout, motion, a11y, design tokens |
| `@api` | `docs/api.md` | API reference — AstroneumChart props, instance methods, exported types |
| `@datafeed-guide` | `docs/datafeed-guide.md` | How to build a datafeed — 4-method interface, mock/REST/WebSocket patterns |
| `@plugin-guide` | `docs/plugin-development.md` | Plugin & indicator authoring — IndicatorPlugin, ChartPlugin, ScriptEngine, renderers |
| `@indicator-parity` | `INDICATOR_COMPARISON.md` | 50/50 indicator parity table (Astroneum vs TradingView Pro) |
| `@demo-design` | `demo/DESIGN.md` | Demo app design system — tokens, component specs, terminal layout |
| `@demo-product` | `demo/PRODUCT.md` | Product framing — users, brand voice, anti-references ("no AI slop"), design principles |
| `@tv-reference` | `tv-mirror-reference/README.md` | Read-only behavioral evidence — never implementation source or shipped asset |

## No TradingView-MCP

The TradingView MCP server is globally configured but **not used in this project**.
Parity work drives off the grounded docs (`@parity`, `@indicator-parity`) as the spec.
Do not call any `tradingview_*` tool.

## Build workflow

1. Pick a gap from `@gaps` (TODO.md) or `@design-gaps` (TODO-DESIGN.md).
2. Claim the matching work ID in `@workstreams`, including exact files, dependencies, verification, documentation, and risks.
3. Read its status in `@parity` (tv-functions-skill.md §3, 6-bucket taxonomy):
   - `widget-native` / `api-bridged` → already exists. Do not rebuild.
   - `native-chrome` / `v1-in-scope` → build now per `@design` / `@demo-design`.
   - `v1-deferred` / `v2-future` → do not build. Note only.
4. Consult `@api` and `@plugin-guide` for implementation patterns.
5. Implement only within the claimed file scope. Respect conventions (below).
6. Run `pnpm verify` (lint + typecheck + build + test). Must pass.
7. Hand off with changed paths, verification, authority-doc updates, and remaining risks; then deploy (see deploy skill or `/deploy`).

## Verify gate (non-negotiable)

`pnpm verify` = `pnpm lint && pnpm typecheck && pnpm build && pnpm test`.
Must pass before any deploy. Never deploy a failing build.

## Deploy flow

Three steps, touches **only** `astroneum-demo`, never trading-bot processes:

```
ssh 72.62.73.180 "cd /opt/astroneum && pnpm build"
ssh 72.62.73.180 "cd /opt/astroneum && pnpm --filter astroneum-demo-next build"
ssh 72.62.73.180 "pm2 restart astroneum-demo"
```

Then verify: `curl -k https://72.62.73.180/astroneum/` expects HTTP 200.

For the full git-sync deploy (pull → build → restart), see the `astroneum-deploy` skill.

## Conventions

- **ESM-only** — `"type": "module"`, `format: ['esm']` in tsup.
- **Branded financial types** — `Price`, `Volume`, `Timestamp` (see `src/types.ts`).
- **Path alias** — `@/` → `./src/` (tsconfig `paths` + tsup esbuild `alias`).
- **`'use client'`** — tsup `onSuccess` re-injects it into every emitted `.js`. Do not add manually to `src/` files.
- **Tests** — `src/__tests__/*.test.ts`, run via `tsx --test`. Excluded from tsconfig.
- **No code comments** unless explicitly asked.
- **Size budgets** — `.size-limit.json` per-entry. Check `pnpm size` after adding exports.
- **Subpath exports** — every new export needs: `package.json` exports map + `tsup.config.ts` entry + `src/entries/` file.
- **i18n** - 18 locale JSON files in `src/i18n/`. New keys go in `en-US.json` first; other locales fall back.

## Doc-sync rule

After any structural or functional change, update the living docs per their maintenance policies:
- `@structure` (STRUCTURE.md §10) — file/dir added/removed/renamed, new export, PM2/port/nginx change, config edit.
- `@gaps` (TODO.md maintenance) — gap closed (remove row) or new gap (add row).
- `@design-gaps` (TODO-DESIGN.md maintenance) — UI/layout element added/changed/removed.
- `@parity` (tv-functions-skill.md §9) — catalog row pointer updated.

Run `/refresh-structure` or `/refresh-todo` after changes, or the `astroneum-doc-sync` skill.

## Pitfalls

- **Server was a no-`.git` snapshot** — now a clone from `Tony1185/Astroneum` (TODO §9.1 closed).
- **3 overlapping nginx server blocks** in `sites-enabled/` (STRUCTURE.md §7). Only first match wins. Flag for cleanup (§9.2).
- **`astroneum-demo` high restart count** on PM2 (§9.3). Autorestarts on crash; only worry if `errored` or `stopped`.
- **Never reuse Trading-Bot-V2 code** — separate project (`/opt/trading-bot-v2`). Astroneum builds its own API routes in `demo/src/app/api/`.
- **`next build` is slow** — raise timeout to 300000+ ms.
- **Docker needs sudo** on that server — `deploy` is sudoer but not in docker group.
- **DB user is `appuser`** not `postgres` — but Astroneum has no DB yet (TODO §8).

## SSH access

Host `72.62.73.180`, user `deploy`, key auth via `~/.ssh/id_ed25519`.
Always pass an explicit command: `ssh 72.62.73.180 "<cmd>"` — never bare interactive ssh (hangs).
Multi-statement: separate with `;`, wrap in quotes.
