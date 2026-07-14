# Astroneum Workstreams

> **Purpose:** delivery sequencing, ownership, and acceptance gates.
> **Owns:** work IDs, dependencies, file boundaries, and handoffs.
> **Does not own:** feature status ([`tv-functions-skill.md`](tv-functions-skill.md)), functional gaps ([`TODO.md`](TODO.md)), or layout gaps ([`TODO-DESIGN.md`](TODO-DESIGN.md)).

## Operating rules

- One active owner claims a work ID at a time. The claim must name the changed paths, prerequisite IDs, tests, docs, and unresolved risks.
- A handoff records the commit or patch, verification output, remaining work, and which authority documents changed. The next owner must not widen the claimed path scope without a new claim.
- [`tv-mirror-reference/`](../tv-mirror-reference/) is evidence only. Never ship its captures, HTML, scripts, screenshots, hashed classes, or TradingView assets in the demo/library bundle.
- A work item is complete only after its acceptance checks and relevant documentation updates pass.

## Delivery ledger

| ID | Workstream | Owner | Scope | Depends on | Acceptance gate | Status |
|---|---|---|---|---|---|---|
| WS-01 | Evidence and contracts | `astroneum-parity-checker` + `astroneum-doc-syncer` | `docs/`, agent guidance | — | Semantic-ID parity rows and evidence boundaries are documented | complete |
| WS-02 | Terminal workspace | `astroneum-demo-builder` | `demo/src/app/components/` | WS-01 | Keyboard dismissal, responsive shell, curtains/split view, route smoke test | complete |
| WS-03 | Alerts and drawing UX | `astroneum-builder` + `astroneum-demo-builder` | `src/chart/`, `src/widget/`, `demo/` | WS-01 | Alert unit/UI tests; Gann/Fib family menu acceptance | complete |
| WS-04 | Strategy report UI | `astroneum-demo-builder` | `demo/src/app/components/panels/` | WS-01 | Deterministic fixture report and accessible tab navigation | complete |
| WS-05 | Strategy runtime | `astroneum-builder` | `src/strategy/`, `src/scripting/` | WS-04 | Deterministic backtest unit/performance tests | complete |
| WS-06 | AI OS operations | `astroneum-doc-syncer` | `.opencode/`, `AGENTS.md` | WS-01 | Claim/handoff convention and parity command documented | complete |
| WS-07 | Release verification | `astroneum-auditor` | tests and docs | WS-02–WS-06 | `pnpm verify`, demo build, E2E/accessibility checks | complete with size-tool environment limitation |
| WS-08 | Watchlist parity | `OpenCode` | `src/types.ts`, `src/datafeed/StandardCryptoDatafeed.ts`, `src/chart/WatchlistManager.ts`, `src/index.ts`, `src/entries/watchlist.ts`, `src/__tests__/`, `demo/src/app/components/`, watchlist authority docs | WS-01–WS-03 | 38 tests pass, changed-source lint passes, size passes, library/demo builds pass, live quote smoke passes, outer-right rail placement ships, HTTP 200; full lint blocked by pre-existing unrelated dropdown/alert errors | complete with unrelated lint blocker |

## Handoff template

```text
Work ID:
Owner:
Changed paths:
Dependencies satisfied:
Tests run and results:
Authority docs updated:
Known limitations / follow-up:
```

## Reference refresh

Refresh [`tv-mirror-reference/`](../tv-mirror-reference/) only through a non-destructive capture. Record capture date, viewport, chart state, theme, and account state in its audit. Extract implementation requirements into the canonical documents above; do not treat the raw capture as a product API or copy source.
