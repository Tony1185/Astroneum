# Mirror Plan: Symbol Search + Watchlist Parity

> **Status:** Phases 2–5 executed 2026-07-13 (commit `c14a88c` local / `4bfe8fd` server). **Phase 1 (dedicated capture scripts) was not executed** — see note below.
> **Date:** 2026-07-13
> **CDP source:** Chrome port 9223, chart `8Wh6yRIo`, BTC.D active
> **Scope:** Capture live TV DOM for Symbol Search + Watchlist; implement functional parity in Astroneum
>
> **Execution note:** Phase 1's `cdp-symbol-search.js` / `cdp-watchlist.js` / `ref-symbol-search.html` / `ref-watchlist.html` were never created. The geometry and DOM structure used for Phases 2–5 came from ad hoc CDP `Runtime.evaluate` calls during the working session, recorded inline in `tv-mirror-reference/structure.md` §4.1 and `watchlist.md` §2.4/§3/§8. This is an honest gap, not a silent one: the values are real (captured live), but the capture is not re-runnable from a checked-in script. See `tv-mirror-reference/README.md` for the current, corrected evidence-files table. A follow-up should build the two capture scripts before the next visual refresh.
>
> **What actually shipped (Phases 2–3):** rewrote `SymbolSearchModal` (840px, 11 asset tabs, 4-cell rows, debounce, token-driven styling) and fixed the `Modal`/`Input` primitives it depends on (initial-focus targeting, native attribute forwarding, removed a hardcoded TradingView-blue focus glow). Rebuilt the Watchlist header to TV's actual 4-control anatomy (list selector / Add symbol / Advanced view / Settings) instead of the previous 5-tab layout, added collapsible group headers, widened the sidebar, and wired a working resize handle. Full detail in `docs/TODO-DESIGN.md` changelog, entry "2026-07-13 (c)".
>
> **What did not ship:** the automated visual-regression gate (Phase 5 in spirit, never formally scoped here) that the accompanying UX audit called for. Verification for this pass was `pnpm verify` + demo build + CDP computed-style comparison, not a screenshot-diff CI gate.

---

## Context

Both surfaces were inspected live via CDP on 2026-07-13.

### Symbol Search is a shared library component

`src/widget/symbol-search-modal/index.tsx` is consumed by two entry points:
- `AstroneumChart.tsx:656` — chart symbol change (`chart.setSymbol()`)
- `WatchlistPanel.tsx:219` — add to watchlist (`manager.addSymbolFromInfo()`)

Rewriting it improves both entry points simultaneously.

### Current state

| Surface | File | Lines | Gap |
|---|---|---|---|
| Symbol Search (library) | `src/widget/symbol-search-modal/index.tsx` | 100 | Large — 460px, no tabs, no row structure, no debounce |
| Symbol Search SCSS | `src/widget/symbol-search-modal/index.scss` | 42 | Layout for 460px modal |
| Watchlist (demo) | `demo/src/app/components/panels/WatchlistPanel.tsx` | 514 | Small — missing section group headers |
| Watchlist CSS | `demo/src/app/components/panels/panels.css` L1-286 | 286 | Mature |
| WatchlistManager (library) | `src/chart/WatchlistManager.ts` | 244 | Stable — add `group` field |

### Live TV DOM (observed via CDP 2026-07-13)

**Symbol Search dialog** — `[data-name="symbol-search-items-dialog"]` role=dialog, 840x680px:
```
Title "Symbol search" + Close [data-qa-id="close"]
Input [data-qa-id="symbol-search-input"] role=searchbox, placeholder="Symbol, ISIN, or CUSIP"
Tabs [role=tablist]: All(active) / Stocks / Funds / Futures / Forex / Crypto / Indices / Bonds / Economy / Options / More
Results: [data-name="symbol-search-dialog-content-item"] rows, 4 cells:
  1. ticker (bold, e.g. "BTCUSD")
  2. description (muted, e.g. "Bitcoin / U.S. dollar")
  3. exchange (smaller, e.g. "spot crypto defiBitstamp")
  4. actions (empty, hover-revealed)
51 rows in listContainer, active row has indigo tint
Footer: "Search using ISIN and CUSIP codes"
```

**Watchlist panel** — rail `[data-name="base"]` 44x44px aria-pressed=true:
```
Header:
  [data-name="watchlists-button"] "Red list" 102x34px
  [data-name="add-symbol-button"] aria-label="Add symbol" 38x38px
  [data-name="advanced-view-button"] aria-label="Advanced view" 38x38px
  [data-name="settings-button"] aria-label="Settings" 38x38px
Columns: Symbol / Last / Chg / Chg% (sortable buttons, class="sortable-PYr1BHmD", NO aria-sort on TV)
Rows: [data-name="symbol-list-wrap"] 319x775px
  Each row: ticker + "Market open" status + last + chg + chg% + volume
  Section dividers: plain text group headers (e.g. "US STOCK")
Details: details-add-note / details-settings / details-more-technicals
```

---

## Phase 1: CDP Capture

### 1A. Create two targeted capture scripts

| Script | Output | Target |
|---|---|---|
| `cdp-symbol-search.js` | `ref-symbol-search.html` + `symbol-search.png` | `[data-name="symbol-search-items-dialog"]` outerHTML + screenshot |
| `cdp-watchlist.js` | `ref-watchlist.html` + `watchlist.png` | Watchlist panel (header + columns + rows) outerHTML + screenshot |

Both reuse the existing CDP pattern (port 9223, WebSocket, `Runtime.evaluate` + `Page.captureScreenshot`). Output only to `tv-mirror-reference/`.

### 1B. Update reference docs

| File | Section | Change |
|---|---|---|
| `tv-mirror-reference/watchlist.md` | 2.4, 3, 8 | Fill `not captured` items: row DOM (4 cells per row), section group headers ("US STOCK"), "Market open" status, details buttons |
| `tv-mirror-reference/structure.md` | 4.1 | Update Symbol Search: 840px width, 11 tabs, 4-cell rows, footer text, selectors |
| `tv-mirror-reference/README.md` | Evidence files table | Add `ref-symbol-search.html`, `ref-watchlist.html` rows |

---

## Phase 2: Symbol Search Rewrite (library-level)

### 2A. Component rewrite — `src/widget/symbol-search-modal/index.tsx`

| # | Change | Why |
|---|---|---|
| S1 | Width 460px to 840px | Fit 4-cell rows |
| S2 | Asset-class tabs: All / Stocks / Funds / Futures / Forex / Crypto / Indices / Bonds / Economy / Options / More | Core TV function — filter results by `symbol.type` |
| S3 | 4-cell result rows: ticker / description / exchange / actions | TV row structure |
| S4 | Keyboard up/down navigation through results | Functional — can't use dialog without it |
| S5 | 200ms debounce on input | Prevents API hammering (Polygon) |
| S6 | Footer "Search using ISIN and CUSIP codes" | Part of the dialog |

`SymbolInfo.type` is `string` (not union) — tab filter maps common values client-side: `stock/equity` to Stocks, `crypto` to Crypto, `forex/fx` to Forex, etc. Undefined `type` shows in "All" only.

### 2B. Props interface — no breaking change

```ts
export interface SymbolSearchModalProps {
  locale: string
  searchSymbols: (query?: string) => Promise<SymbolInfo[]>
  onSymbolSelected: (symbol: SymbolInfo) => void
  onClose: () => void
}
```

No change to `Datafeed.searchSymbols` signature — filtering by `type` happens client-side on returned results.

### 2C. SCSS rewrite — `src/widget/symbol-search-modal/index.scss`

- 840px width, max-height with internal scroll on results
- Tab bar: horizontal scroll, 28px buttons, active underline
- Result rows: 4-cell grid layout (ticker | description | exchange | actions)
- Active row: `--astroneum-accent-tint` background
- Footer: muted, 12px, centered

### 2D. i18n — `src/i18n/en-US.json`

New keys (en-US first, 17 other locales fall back):
```json
"symbol_search_all": "All",
"symbol_search_stocks": "Stocks",
"symbol_search_funds": "Funds",
"symbol_search_futures": "Futures",
"symbol_search_forex": "Forex",
"symbol_search_crypto": "Crypto",
"symbol_search_indices": "Indices",
"symbol_search_bonds": "Bonds",
"symbol_search_economy": "Economy",
"symbol_search_options": "Options",
"symbol_search_more": "More",
"symbol_search_footer": "Search using ISIN and CUSIP codes"
```

### 2E. No subpath export needed

`SymbolSearchModal` rides the root barrel (`src/index.ts:82`). No `src/entries/` or `package.json` change.

### 2F. Demo consumer fix — `WatchlistPanel.tsx:219`

Pass `locale` prop instead of hardcoded `"en-US"`.

---

## Phase 3: Watchlist — section group headers

### 3A. `WatchlistManager.ts` — add `group` field

```ts
export interface WatchSymbol {
  ticker: string
  // ... existing fields ...
  group?: string  // section header label (e.g. "US STOCK")
}
```

`group` persists (not stripped by `_storedSymbol` — it's user-organized, not injected like quotes). Add to the whitelist in `_storedSymbol` (L196-206).

### 3B. Render section dividers — `WatchlistPanel.tsx`

When iterating sorted symbols, detect `group` changes and insert a non-interactive divider row with the group label text.

### 3C. Divider row style — `panels.css`

```css
.term-wl-group-header {
  padding: 8px 12px;
  font-size: 11px;
  font-weight: 600;
  color: var(--term-text-2);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  background: var(--term-panel-bg);
  position: sticky;
  top: 0;
  z-index: 1;
}
```

---

## Phase 4: Docs Sync

| File | Section | Change |
|---|---|---|
| `docs/TODO-DESIGN.md` | 7.6 | Symbol Search: update spec (840px, tabs, 4-cell rows) |
| `docs/TODO-DESIGN.md` | 3b | Add section group header row |
| `docs/TODO-DESIGN.md` | 11.10 | Symbol search result-state parity: mark progress |
| `docs/design-astroneum.md` | Symbol Search Pill | Update width 640 to 840px, add tab + 4-cell row spec |
| `docs/design-astroneum.md` | Watchlist Panel | Add section group headers |
| `tv-mirror-reference/watchlist.md` | 2.4, 3, 8 | Fill `not captured` items from CDP |
| `tv-mirror-reference/structure.md` | 4.1 | Update Symbol Search DOM |
| `tv-mirror-reference/README.md` | Evidence table | Add new capture files |

---

## Phase 5: Verification

```
pnpm verify  (= pnpm lint && pnpm typecheck && pnpm build && pnpm test)
```

Must pass before any deploy. No deploy in this plan — implementation only.

---

## Execution Order

1. Phase 1A — CDP capture scripts (2 new files in `tv-mirror-reference/`)
2. Phase 2A-2F — Symbol Search rewrite (library: tsx + scss + i18n; demo: locale fix)
3. Phase 3A-3C — Watchlist section group headers (library: `group` field; demo: divider rows + CSS)
4. Phase 4 — Docs sync
5. Phase 5 — `pnpm verify`

---

## Files Touched

| File | Phase | Change |
|---|---|---|
| `tv-mirror-reference/cdp-symbol-search.js` | 1A | New — CDP capture script |
| `tv-mirror-reference/cdp-watchlist.js` | 1A | New — CDP capture script |
| `tv-mirror-reference/ref-symbol-search.html` | 1A | New — capture output |
| `tv-mirror-reference/ref-watchlist.html` | 1A | New — capture output |
| `tv-mirror-reference/structure.md` | 1B | Update 4.1 |
| `tv-mirror-reference/watchlist.md` | 1B | Update 2.4, 3, 8 |
| `tv-mirror-reference/README.md` | 1B | Update evidence table |
| `src/widget/symbol-search-modal/index.tsx` | 2A | Rewrite — tabs, 4-cell rows, debounce, keyboard nav |
| `src/widget/symbol-search-modal/index.scss` | 2C | Rewrite — 840px layout |
| `src/i18n/en-US.json` | 2D | 12 new keys |
| `demo/src/app/components/panels/WatchlistPanel.tsx` | 2F, 3B | Locale fix + section dividers |
| `demo/src/app/components/panels/panels.css` | 3C | Group header style |
| `src/chart/WatchlistManager.ts` | 3A | Add `group` field |
| `docs/TODO-DESIGN.md` | 4 | Update 7.6, 3b, 11.10 |
| `docs/design-astroneum.md` | 4 | Update Symbol Search + Watchlist sections |

---

## Risks

| Risk | Mitigation |
|---|---|
| `SymbolInfo.type` is `string` not union — tab filter may miss non-standard values | Client-side filter: if `type` undefined, show in "All" only; map common values |
| No debounce currently — Polygon API rate limits | 200ms debounce + cancel in-flight on new keystroke |
| `group` field on `WatchSymbol` needs migration for existing localStorage | `_load()` already validates; add `group` with fallback `undefined` |
