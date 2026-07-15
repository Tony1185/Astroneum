# Astroneum — Design TODO: Mirror TradingView Layout

> **Master index** of every TV UI surface → Astroneum design mirror. One row per layout element.
> **Last updated:** 2026-07-12
> Pair with: `docs/TODO.md` (function gaps) · `docs/STRUCTURE.md` (where things live) · `docs/tv-functions-skill.md` (function catalog) · `docs/design-astroneum.md` (UX spec) · `INDICATOR_COMPARISON.md` (indicators)
> **Update on every UI/layout/design change** (see §Maintenance).
>
> **Scope:** design/layout only. "Inside function" column is filled when Astroneum has the function wired; left blank when not implemented. Function specs live in `TODO.md`.
>
> **Authority:** TV-vs-Astroneum status lives in `docs/tv-functions-skill.md` §3 (6-bucket taxonomy). This file tracks design/layout only. When statuses conflict, tv-functions-skill.md wins.

## How to read

**Design status legend**

| Symbol | Meaning (layout only) |
|---|---|
| ✅ | Layout element exists and matches TV |
| 🔧 | Layout exists but partial (missing sub-elements / wrong placement) |
| ⏳ | v1-in-scope — layout spec'd to build now |
| 🟦 | v1.1 — layout deferred |
| ⟫ | v2-future — layout not in v1 |
| ❌ | Layout missing |
| ⚠️ | Layout risk / tech debt |

**TV reference IDs**: `#header-toolbar-*` (top bar), `#drawing-toolbar*` / `linetool-group-*` (left bar), `#right-toolbar` / `data-name` (right rail), `#footer-chart-panel` (bottom dock). Astroneum pointers: `src/widget/`, `src/extension/`, `demo/src/app/components/`.

---

## 0. Shell regions  →  `design-astroneum.md` §4, `STRUCTURE.md` §5

| # | TV region | TV container | Astroneum design | Inside function |
|---|---|---|---|---|
| 0.1 | Top toolbar (44px) | `#header-toolbar` | 🔧 `TerminalShell` topbar + `PeriodBar` — covers ~8/23 elements | |
| 0.2 | Left drawing rail (52px) | `#drawing-toolbar` | ✅ Library-owned `DrawingBar` is the sole left rail; it remains pinned through dock height and scrolls on short viewports | `DrawingBar` |
| 0.3 | Chart pane (center) | `layout__area--center` | ✅ `TerminalShell` chart slot + `<AstroneumChart>` | Canvas/WebGL render |
| 0.4 | Right rail toggle bar + panels (320px default, resizable 280–540px, 240ms slide) | `#right-toolbar` | 🔧 `TerminalShell` + `SidebarContent`: panel body opens left of the persistent outer-right 52px strip; 5 rail tabs; active-tab repeat collapses only the body; Watchlist contains Details/News sub-tabs; width now resizable via a drag handle (2026-07-13). **"Persisted" was previously claimed but is false** — `TerminalShell` does not read/write `localStorage` for sidebar/dock state; this remains an open gap, not yet corrected | `WatchlistPanel`, `AlertsPanel`, `TerminalShell` |
| 0.5 | Bottom dock (tab bar, 220px, 240ms slide, persisted) | `#footer-chart-panel` | ✅ Explicit CSS Grid dock row + `DockContent` persistent tab panels, resize handle, fixed-overlay maximize, collapse, report overflow/menu controls; dock begins right of the 52px rail | `PineEditorPanel`, `StrategyTesterPanel`, `TradingPanel` |
| 0.6 | Footer (date range navigator, 28px) | `withdateranges` | ✅ `DateRangeNavigator` — 7 presets (1D/1W/1M/3M/1Y/5Y/ALL) + live visible-range readout via `ChartPlugin` engine bridge | `DateRangeNavigator` |

> **Shell behavior (§4):** Sidebar collapse uses grid columns; `term-workspace-main` uses explicit CSS Grid chart/dock rows (240ms, `--term-dur`) so the chart ends exactly at the dock boundary. The 52px library `DrawingBar` extends through the dock height; the dock is inset to its right. Dock maximize is a fixed overlay and does not reflow the chart or rail. Collapse state is persisted per-user in `localStorage` key `astroneum:shell` (decoupled from chart `serializeState`). Below lg (1024px) the layout is chart-dominant: left rail hidden, sidebar + dock forced collapsed, topbar slimmed to brand + badges (symbol/timeframe live in the chart's `PeriodBar`). FAB overlay for the right rail is 🟦 v1.1.

## 1. Top toolbar — `#header-toolbar`  →  `design-astroneum.md` §5

| # | TV element | TV id / data-name | Astroneum design | Inside function |
|---|---|---|---|---|
| 1.1 | Symbol search (value text button) | #header-toolbar-symbol-search | ✅ PeriodBar symbol trigger + SymbolSearchModal - title(symbol_search), data-semantic-id(header.symbol_search), apply-common-tooltip, mobile text-hide @ max-width:600px | PeriodBar + SymbolSearchModal |
| 1.2 | Switch data type (icon button) | `#header-toolbar-switch-data-type` | ❌ | |
| 1.3 | Compare symbols button | `#header-toolbar-compare` | 🟦 | |
| 1.4 | Timeframe radiogroup (1h/4h/D/W) | `#header-toolbar-intervals` | ✅ `PeriodBar` periods | `PeriodBar` |
| 1.5 | Chart interval dropdown (`,`) | `menuBtn-U9b0TAs4` | 🔧 `PeriodBar` has period buttons, no overflow dropdown — `,` hotkey not wired. Deferred to a library `PeriodBar` pass | |
| 1.6 | Chart style menu (Candles) | `#header-toolbar-chart-styles` | ✅ `ChartTypeDropdown` | `ChartTypeDropdown` |
| 1.7 | Indicators dialog button (`/`) | `data-name="open-indicators-dialog"` | ✅ `IndicatorModal` — `/` hotkey wired in `AstroneumChart.tsx` | `IndicatorModal` |
| 1.8 | Favorite indicators menu | `data-name="show-favorite-indicators"` | 🟦 v1.1 — needs an indicator-favorites model + menu | |
| 1.9 | Indicator templates menu | `#header-toolbar-study-templates` | ✅ folded into `SaveLoadMenu` — named chart-state presets via `ChartTemplateManager` | `SaveLoadMenu` |
| 1.10 | Create alert button (Alt+A) | `#header-toolbar-alerts` | ✅ `AlertModal` — Alt+A hotkey wired in `AstroneumChart.tsx` | `AlertModal` |
| 1.11 | Bar replay button | `#header-toolbar-replay` | ✅ `ReplayToolbar` + `BarReplay` | `BarReplay` |
| 1.12 | Undo button | `#header-toolbar-undo-redo` | ✅ `UndoManager` + brand-bar button (disabled when empty) + `Ctrl+Z` wired in `ChartTerminal` | `UndoManager` |
| 1.13 | Redo button | `#header-toolbar-undo-redo` | ✅ `UndoManager` + brand-bar button + `Ctrl+Y` / `Ctrl+Shift+Z` wired in `ChartTerminal` | `UndoManager` |
| 1.14 | Fill-spacer (push right groups) | `fill-dlFDN0Zd` | ✅ CSS flex auto | |
| 1.15 | Layout setup (grid picker) | `#header-toolbar-layouts` | ✅ `LayoutPicker` in demo topbar — 1/2/4/8/16 grid | `LayoutPicker` |
| 1.16 | Save/Load button ("Unnamed" + state) | `#header-toolbar-save-load` | ✅ `SaveLoadMenu` — named layouts with autosave and active-layout recovery via `ChartTemplateManager` | `SaveLoadMenu` |
| 1.17 | Manage layouts menu | `data-name="save-load-menu"` | ✅ folded into `SaveLoadMenu` dropdown (save-as / load / delete per layout) | `SaveLoadMenu` |
| 1.18 | Quick search button (Ctrl+K) | `#header-toolbar-quick-search` | ✅ `CommandPalette` — symbol search + actions, Ctrl+K wired in demo | `CommandPalette` |
| 1.19 | Settings button | `#header-toolbar-properties` | ✅ `SettingModal` | `SettingModal` |
| 1.20 | Fullscreen button (Shift+F) | `#header-toolbar-fullscreen` | ✅ `PeriodBar` fullscreen — Shift+F hotkey wired in `AstroneumChart.tsx` | `PeriodBar` fullscreen |
| 1.21 | Screenshot button (with menu) | `#header-toolbar-screenshot` | ✅ `ScreenshotModal` | `ScreenshotModal` |
| 1.22 | Mobile trade pill | `#header-toolbar-trade-mobile` | ⟫ mobile (§12) | |
| 1.23 | Mobile publish button | `#header-toolbar-publish-mobile` | ⟫ | |

## 2. Left drawing toolbar — `#drawing-toolbar`  →  `design-astroneum.md` §5

| # | TV element | TV data-name | Astroneum design | Inside function |
|---|---|---|---|---|
| 2.1 | Cursors group (Cross default + submenu) | `linetool-group-cursors` | ✅ `DrawingBar` cursor group — Cross/Dot/Arrow/Eraser submenu + `onCursorChange` sets CSS cursor | `DrawingBar` |
| 2.2 | Trendline + Trend tools submenu | `linetool-group-trend-line` | 🔧 `singleLine` group | |
| 2.3 | Fib retracement + Gann/Fib submenu | `linetool-group-gann-and-fibonacci` | 🔧 `fibonacci` group — missing pure Fib Retracement, Channel, Wedge, Time Zones, Arcs, Fan | |
| 2.4 | XABCD pattern + Patterns submenu | `linetool-group-patterns` | 🔧 `wave` group — missing Cypher, Crab, Bat, Butterfly, Three Drives, Elliott Impulse | |
| 2.5 | Long position + Forecasting submenu | `linetool-group-prediction-and-measurement` | ✅ `DrawingBar` forecasting group - 12 tools in 3 sections (Forecasting, Volume-based, Measurers) with section headers. Overlays in `src/extension/`: `longPosition`, `shortPosition`, `positionForecast`, `barsPattern`, `ghostFeed`, `sector`, `anchoredVwap`, `fixedRangeVolumeProfile`, `anchoredVolumeProfile`, `priceRange`, `dateRange`, `dateAndPriceRange` | `DrawingBar` forecasting group |
| 2.6 | Brush + Geometric shapes submenu | `linetool-group-geometric-shapes` | 🔧 `polygon` group (circle, rect, triangle, parallelogram) ??? popup now visible after clipping fix. Missing: Brush, Ellipse, Polygon, Polyline | |
| 2.7 | Text + Annotation submenu | `linetool-group-annotation` | ❌ | |
| 2.8 | Icon + Icons submenu (font icons) | `linetool-group-font-icons` | ❌ | |
| 2.9 | Measure button (Shift+Click) | `data-name="measure"` | ✅ `DrawingBar` measure button + Shift+Click on chart canvas | `measure` |
| 2.10 | Zoom in button | `data-name="zoom"` | ✅ `DrawingBar` zoom button — `zoomAtCoordinate(1.2, center)` | `DrawingBar` |
| 2.11 | Magnet mode button (Ctrl) | `data-name="magnet-button"` | ✅ `DrawingBar` magnet + `DrawingSnapper` | `DrawingSnapper` |
| 2.12 | Keep drawing (sticky) button | `data-name="drawginmode"` | 🔧 `DrawingBar` keepDrawing toggle exists; re-trigger on drawing-end deferred until engine event support | `DrawingBar` |
| 2.13 | Lock all drawings button | `data-name="lockAllDrawings"` | ✅ `DrawingBar` lock + `lockAllDrawings()` | `lockAllDrawings()` |
| 2.14 | Hide all drawings button (Ctrl+Alt+H) | `data-name="hide-all"` | ✅ `DrawingBar` visible toggle + `Ctrl+Alt+H` in `hooks.ts` | `DrawingBar` |
| 2.15 | Remove objects button | `data-name="removeAllDrawingTools"` | ✅ `DrawingBar` remove | |
| 2.16 | Favorite drawings toolbar toggle | `#drawing-toolbar-favorite-drawings` | ❌ | |

## 3. Right rail — `#right-toolbar` toggle bar + panels  →  `tv-functions-skill.md` §3.17

TV's right rail is a **vertical toggle bar** (`#right-toolbar`, 11 buttons) that switches which panel shows. Astroneum mirrors this with a 52px sidebar strip and collapses only its panel body on desktop.

### 3a. Right toolbar toggle bar

| # | TV element | data-name | Astroneum design | Inside function |
|---|---|---|---|---|
| 3.1 | Vertical toggle bar container | `#right-toolbar` | ✅ `term-sidebar-strip` is the persistent 52px outer-right rail with 5 icon+label tabs; the panel body opens immediately to its left | `SidebarContent`, `TerminalShell` |
| 3.2 | Watchlist/details/news toggle (active) | `base` | ✅ Watchlist toggle lives in the persistent outer rail; Watchlist / Details / News are sub-tabs inside the adjacent panel | `WatchlistPanel` |
| 3.3 | Alerts toggle | `alerts` | ✅ `AlertsPanel` — toggle button in `term-sidebar-strip` | `AlertsPanel` |
| 3.4 | Object tree + data window toggle | `object_tree` | ❌ | |
| 3.5 | Chats toggle | `union_chats` | ⟫ | |
| 3.6 | Filler (spacer) | `filler-Sc5Go8G8` | ✅ CSS | |
| 3.7 | Screeners toggle | `screener-dialog-button` | ⟫ | |
| 3.8 | Pine toggle | `pine-dialog-button` | 🔧 `PineEditorPanel` — exists in bottom dock, not right rail | `PineEditorPanel` |
| 3.9 | Calendars toggle | `calendar-dialog-button` | 🔧 `StubPanel` placeholder in sidebar strip | `StubPanel` |
| 3.10 | Community toggle (with badge counter) | `community-hub-button` | ⟫ | |
| 3.11 | Notifications toggle | `notifications-button` | ❌ | |
| 3.12 | Products menu toggle | `products-button` | ❌ | |
| 3.13 | Separator | `separator-VRj5pi98` | — | |
| 3.14 | Help Center toggle | `help-button` | 🔧 `demo/src/app/support/` route — not as rail toggle | |

### 3b. Watchlist panel content (when 3.2 active)

The watchlist panel is a 3-sub-tab container (Watchlist / Details / News). The Watchlist sub-tab contains the symbol lists; Details and News are sub-tabs inside the same panel (B1 restructure).

| # | TV element | Astroneum design | Inside function |
|---|---|---|---|
| 3.15 | List selector (switch/create/rename/delete/duplicate/export/color) | ✅ Rebuilt 2026-07-13 to match TV's actual anatomy — a single list-selector button (name + chevron) opens one dropdown menu with all list actions, replacing the previous simultaneous-tabs header (`tv-mirror-reference/watchlist.md` §3 documents TV showing exactly one active list at a time, not tabs) | `WatchlistManager` |
| 3.16 | Add/remove symbol | ✅ `SymbolSearchModal` validates additions; row context menu removes symbols | `WatchlistManager`, `SymbolSearchModal` |
| 3.17 | Reorder (drag rows) | 🔧 Same-list row drag shipped via `reorderSymbols`. Cross-list drag-and-drop was removed with the tabs header (TV itself does not expose this either since only one list renders at a time); moving a symbol to another list is done through the row context menu's "Move to" action instead — no capability lost, only the affordance changed | `WatchlistManager.reorderSymbols/moveSymbol` |
| 3.18 | Details panel (OHLC + P&L + desc) | 🔧 Details sub-tab ships live OHLC and symbol metadata; fundamentals and P&L await data sources (🟦 v1.1) | `DetailsPanel` |
| 3.19 | Highlight selected row | ✅ Indigo tint + 1px inset signal; numeric columns use tabular figures | `WatchlistPanel` |
| 3.20 | Last price column | ✅ Right-aligned live last price with precision metadata and `—` fallback | `WatchlistPanel` |
| 3.21 | Column header + sort | ✅ Sticky accessible headers toggle persisted ascending/descending sort | `WatchlistManager.setSort` |
| 3.22 | Row context menu (right-click) | 🔧 Copy, Add alert, Move, and Remove ship with keyboard invocation; inferred Hide/Lock actions remain | `WatchlistPanel` |
| 3.23 | Header toolbar actions | ✅ Rebuilt 2026-07-13 to TV's 4-control anatomy: list selector, Add symbol, Advanced view, Settings — matches `tv-mirror-reference/watchlist.md` §3 control inventory exactly; list actions (Rename/Duplicate/Export JSON/color/Delete) live inside the list-selector dropdown | `WatchlistPanel` |
| 3.24 | Empty-state CTA | ✅ Factual empty state and primary Add symbol action open validated search | `WatchlistPanel` |
| 3.25 | Cross-list drag | ✅ Symbol rows move to another list through visible tab drop targets | `WatchlistManager.moveSymbol` |
| 3.26 | Per-list color dot | ✅ Six-color list identity palette persists through `setColor` | `WatchlistManager.setColor` |
| 3.27 | Advanced/Simple view toggle | ✅ Simple and Advanced column presets persist per list | `WatchlistPanel` |
| 3.28 | Column chooser popover (gear) | ✅ Name/Last/Chg/Chg%/Vol/Open checkboxes, reset, outside click, and Escape ship | `WatchlistManager.setColumns` |
| 3.29 | Live quote polling | ✅ Visible active list polls every 2s; polling pauses with the sidebar or sub-tab hidden | `Datafeed.getQuotes?`, `WatchlistManager.updateQuotes` |
| 3.30 | No-matches + quote-error + retry | ✅ Search owns no-match state; quote failure shows `—`, a status banner, and Retry | `WatchlistPanel` |
| 3.31 | Details sub-tab (OHLC + desc) | ✅ Details is folded into the watchlist panel; fundamentals/P&L remain 🟦 v1.1 | `DetailsPanel` |
| 3.32 | News sub-tab | ✅ News is folded into the panel with an honest provider-dependent empty state | `WatchlistPanel` |
| 3.33 | Section group headers | ✅ `WatchSymbol.group?` field renders non-interactive divider rows (e.g. "US STOCK") that collapse/expand via a chevron (component-level UI state, not persisted); TV's own section collapse state was `not captured` so persistence semantics remain unverified | `WatchlistManager`, `WatchlistPanel` |

## 4. Bottom dock — `#footer-chart-panel` tab bar  →  `tv-functions-skill.md` §3.13/3.15/3.20

TV's bottom dock is a **tab bar** with strategy report tabs + open/maximize toggles. Astroneum's dock has a tab bar (Pine Editor / Strategy Tester / Trading Panel) + a collapse toggle.

| # | TV element | data-name / qa-id | Astroneum design | Inside function |
|---|---|---|---|---|
| 4.1 | Tab bar container | `#footer-chart-panel` | ✅ `TerminalShell` `term-workspace-main` is a **CSS Grid** (`grid-template-rows: minmax(0,1fr) var(--term-dock-h)`), not flexbox — a `flex-basis: calc(100% - var(--term-dock-h))` attempt on `.term-chart` proved unreliable (percentage flex-basis against a nested flex container's indefinite height silently miscomputed, letting the dock render as a translucent overlay bleeding over the live chart candles). Playwright-measured after the grid fix: chart's bottom edge (`y+height`) exactly equals the dock's top edge (`y`), 0px gap, and `elementFromPoint` inside the dock's tab bar resolves to the dock button, never the chart. `DockContent`'s dock is inset by the library's own drawing-rail width via `margin-left` keyed off the library's existing `data-drawing-bar-visible` attribute — no extra spacer element, and the dock never sits under the rail or the right sidebar. The rail's ~14 icons can still need more height than a short viewport provides — `.astroneum-drawing-bar` scrolls (`overflow-y:auto`, app-level override) and its icon gap/padding were tightened at the source (`src/widget/drawing-bar/index.scss`: `$gap` 4px→2px, `padding-bottom` added, redundant first-item margin removed) | `DockContent` |
| 4.2 | Strategy report tab (icon + title + context menu) | `data-qa-id="backtesting"` | ✅ `StrategyTesterPanel` receives the compiled strategy's runtime `BacktestResult`; Summary/Performance/Trades/Equity/Properties are live | `StrategyTesterPanel` |
| 4.3 | Tab context menu (rename/close/duplicate) | `data-qa-id="tab-menu-trigger"` | ✅ Report tabs support Rename / Duplicate / Close; Pine and Trading remain permanent | `DockContent` |
| 4.4 | "More tabs" button (3 dots) | `menuButtonWrap-jogw41q5` | ✅ `DockContent` lists every dock tab from an accessible More menu | `DockContent` |
| 4.5 | Open panel toggle (chevron) | `toggle-visibility-button` | ✅ `DockContent` collapse toggle (`term-icon-btn`) | `DockContent` |
| 4.6 | Maximize panel toggle | `toggle-maximize-button` | ✅ `DockContent` maximizes/restores the dock as a `position:fixed` overlay. Because chart/dock are now explicit CSS Grid rows (not flexbox), the dock's row keeps reserving its own space in `.term-workspace-main`'s track structure even while the dock is taken out of flow — Playwright-measured to confirm the chart and the library's own left drawing rail are byte-identical before/during/after maximize, including while dock popups (More tabs, report tab menu) are open | `TerminalShell` |
| 4.7 | Pine Editor tab | (when Pine open) | ✅ `PineEditorPanel` — tab in `term-dock-tabs` | `PineEditorPanel` |
| 4.8 | Trading Panel tab | (when broker connected) | ✅ `TradingPanel` stub — tab present, content is empty state | `TradingPanel` |
| 4.9 | Resize handle (dock height) | ❌ | ✅ Pointer resize handle, bounded 120–480px | `DockContent` |

## 5. Chart pane overlays  →  `design-astroneum.md` §11

| # | TV element | Astroneum design | Inside function |
|---|---|---|---|
| 5.1 | OHLC legend (top-left) | ⏳ v1-in-scope — not built | |
| 5.2 | Right-click context menu | ⏳ v1-in-scope — not built | |
| 5.3 | Crosshair + labels | ✅ `Crosshair` engine | `Crosshair` |
| 5.4 | Y-axis scale controls (linear/log/%/indexed) | ✅ `PriceScaleTransform` | `PriceScaleTransform` |
| 5.5 | X-axis time controls | ✅ engine native | |
| 5.6 | Data window panel (in right rail — see 3.4) | ❌ | |
| 5.7 | Last price line + label | ✅ engine native | |
| 5.8 | Trade markers (entry/exit arrows) | ❌ | |
| 5.9 | Symbol watermark | ✅ engine native | |
| 5.10 | Session visualizer lines | ✅ `SessionVisualizer` | `SessionVisualizer` |

## 6. Footer — date range navigator  →  `design-astroneum.md` §4

| # | TV element | Astroneum design | Inside function |
|---|---|---|---|
| 6.1 | Date range navigator bar | ✅ `DateRangeNavigator` in `TerminalShell` footer slot — live visible-range readout (scroll/zoom aware via `onVisibleRangeChange`/`onZoom` actions) | `DateRangeNavigator` |
| 6.2 | Range presets (1D/1W/1M/3M/1Y/5Y/ALL) | ✅ `DateRangeNavigator` — 7 preset buttons, anchor-to-realtime + `zoomAtDataIndex` | `DateRangeNavigator` |

## 7. Modals & dialogs  →  `STRUCTURE.md` §3.4

| # | TV dialog | Astroneum design | Inside function |
|---|---|---|---|
| 7.1 | Indicators dialog | ✅ `IndicatorModal` | `IndicatorModal` |
| 7.2 | Indicator settings (Inputs/Style/Visibility) | 🔧 `IndicatorSettingModal` partial | |
| 7.3 | Alert dialog | ✅ canonical `AlertModal` used by chart chrome and terminal alert panel | `AlertModal` |
| 7.4 | Chart settings / properties | ✅ `SettingModal` | `SettingModal` |
| 7.5 | Screenshot | ✅ `ScreenshotModal` | `ScreenshotModal` |
| 7.6 | Symbol search | 🔧 `SymbolSearchModal` — rewritten 2026-07-13: 840px, 11 asset tabs, 4-cell rows, 200ms debounce, request-id race fix, token-driven styling (was hardcoded hex), initial focus on the search input (was the close button). **No automated visual regression yet** — verified by CDP-observed style values and manual build check only, not a screenshot diff gate | `SymbolSearchModal` |
| 7.7 | Timezone | ✅ `TimezoneModal` | `TimezoneModal` |
| 7.8 | Script editor (Pine) | ✅ `ScriptEditorModal` | `ScriptEditorModal` |
| 7.9 | Layout templates manager | ❌ | |
| 7.10 | Indicator templates manager | ❌ | |

## 8. Mobile-specific  →  `design-astroneum.md` §12

| # | TV element | Astroneum design | Inside function |
|---|---|---|---|
| 8.1 | Mobile trade pill (`#header-toolbar-trade-mobile`) | ❌ | |
| 8.2 | Mobile publish button | ⟫ | |
| 8.3 | Full mobile/touch UX | ⟫ | |

## 9. Structural primitives (shared across all regions)

| # | TV element | TV class | Astroneum design | Inside function |
|---|---|---|---|---|
| 9.1 | Vertical separator | `separator-LLZAbs0G` | ✅ `DrawingBar` `.split-line` | |
| 9.2 | Group container | `group-LLZAbs0G` | ✅ `DrawingBar` item `role=group` | |
| 9.3 | Fill-spacer (push right) | `fill-dlFDN0Zd` | ✅ CSS flex auto | |
| 9.4 | scrollWrap + noScrollBar | `scrollWrap-wXGVFOC9` | ❌ | |
| 9.5 | Tooltip system (data-tooltip + hotkey) | apply-common-tooltip | 🔧 class now applied on 1.1 Symbol Search (PeriodBar); rich tooltip layer + hotkey display still missing | |
| 9.6 | `aria-haspopup="menu"` dropdowns | multiple | 🔧 some modals, menu dropdowns incomplete | |
| 9.7 | `aria-pressed` toggles | multiple | ✅ `DrawingBar` | |
| 9.8 | `role=toolbar/radiogroup/group` | multiple | ✅ `PeriodBar` + `DrawingBar` | |
| 9.9 | Hotkey system (data-tooltip-hotkey) | multiple | 🔧 `useKeyboardShortcuts` chart-nav only | `useKeyboardShortcuts` |
| 9.10 | SVG icon system (28×28, currentColor) | multiple | ✅ | |
| 9.11 | Notification badge counter (e.g. Community "5") | `counter-DHGll3AY` | ❌ | |

## 10. Design tokens & CSS  →  `design-astroneum.md` §2/§3/§7

| # | TV element | Astroneum design | Inside function |
|---|---|---|---|
| 10.1 | Hashed class names (`button-HdKhcTye`) | ✅ `--astroneum-*` tokens (intentional) | |
| 10.2 | TV dark palette | ✅ `design-astroneum.md` §2 | |
| 10.3 | Typography (Trebuchet MS + Inter) | ✅ `design-astroneum.md` §3 | |
| 10.4 | Motion (state-only) | design-astroneum.md section 7 | Menus, dialogs, curtains, and split views use bounded 100-240ms state motion; chart data is immediate. |
| 10.5 | Light theme | ⟫ | |
| 10.6 | High-contrast theme | ✅ | `theme="high-contrast"` |
| 10.7 | 18 locale JSON files | 🔧 16 fall back to en-US for new keys | |

---

## Maintenance policy

Mirrors `TODO.md` and `STRUCTURE.md` §11. **Update this file on every UI/layout/design change.**

### Triggers — re-scan and patch when any of these change

- New / removed / renamed widget in `src/widget/` or component in `demo/src/app/components/`
- New / removed drawing tool in `src/extension/`
- New modal / dialog / overlay / panel
- TopBar / LeftToolbar / RightToolbar / Dock / Footer layout change
- New hotkey or shortcut (update §9.9 + the relevant §1/§2 row)
- New tooltip / aria / a11y pattern
- Theme / palette / typography / motion change
- New locale or i18n key batch affecting UI strings
- New chart pane overlay (legend / context menu / data window / markers)
- Mobile-specific surface added
- `TerminalShell` slot change
- New right-rail panel or bottom-dock tab
- **When a function gets implemented** — fill the "Inside function" cell (was blank)

### Re-scan model

On invocation ("refresh design todo"), re-scan live tree (`src/widget/`, `src/extension/`, `demo/src/app/components/`, `src/chart/hooks.ts`), diff against this file, patch rows, append dated changelog entry.

### Consistency check (each refresh)

- Every `✅` row still exists in source
- Every `❌` / `🔧` row hasn't been silently fixed
- `src/widget/index.tsx` barrel matches `docs/STRUCTURE.md` §3.4
- `src/extension/index.ts` matches `docs/STRUCTURE.md` §3.7
- `src/chart/hooks.ts` hotkey list matches §9.9 + §1/§2 hotkey rows
- "Inside function" cells: blank = no function; filled = function wired. Update when a function lands.
- Cross-link to `design-astroneum.md` §11/§12 for in-scope/deferred status
- Cross-link to `tv-functions-skill.md` §3 for TV function catalog

---

## Changelog
- **2026-07-13 (c)** — Symbol Search + Watchlist real UX/UI mirror (supersedes the CSS-only reskin done immediately before this entry in the same day). Root-caused via a three-agent audit: prior passes changed colors/spacing without fixing the underlying component contracts, so visual work kept regressing. This pass fixes primitives and structure first: `Modal` gains `initialFocus`/`className` (search input now receives focus, not the close button); `Input` forwards native attrs (`role`, `aria-label`, `autoFocus`, `onKeyDown`, ref) instead of only `value`/`onChange`; removed a hardcoded TradingView-blue (`#2962ff`) focus glow, now `--astroneum-primary-color`. `SymbolSearchModal`: fixed a debounce race (shared boolean to monotonic request id), replaced a global `document.querySelector` with a scoped callback ref, added real i18n copy for loading/empty/no-results (was `...` and a blank div), moved the search icon to a prefix (matches captured DOM) with a clear-button suffix, marked the unbuilt "More" tab `aria-disabled` instead of a fake-clickable button, and restyled with `--astroneum-*` tokens (previously hardcoded hex broke the high-contrast theme). Watchlist header rebuilt to TV's actual anatomy — one list selector (name + chevron + dropdown) plus Add symbol / Advanced view / Settings — replacing the prior simultaneous 5-tab-plus-4-icon header that had no TV equivalent; list actions (rename/duplicate/export/color/delete) folded into the selector's dropdown. Cross-list tab drag removed (TV doesn't have it either, since only one list renders at a time); "Move to list" via the row context menu remains the supported path. Added collapsible group headers (`WatchSymbol.group?`, chevron toggle, component-level state, not persisted). Rewrote `panels.css`'s watchlist section from hardcoded hex to `--term-*` tokens (was silently broken under the high-contrast theme). Widened the default sidebar 260 to 320px and wired a previously-declared-but-unused resize handle (`--term-sidebar-min/max` tokens existed with no drag handle behind them) so Advanced view remains reachable. **Known gap, stated honestly per the audit's core finding**: no automated visual-regression gate exists yet; this pass is verified by `pnpm verify` (lint/typecheck/build/38 tests, local and server), a demo production build, and CDP-observed computed-style comparison against live TradingView — not a screenshot-diff CI gate. That gate is not built in this pass. Committed to git on both local and server (local `c14a88c`, server `4bfe8fd`, identical tree diff) instead of editing an already-dirty server tree directly, per the audit's single-source-of-truth finding — a full reset was not performed because the server carries other legitimate in-progress work outside this task's scope.
- **2026-07-13** — Symbol Search + Watchlist mirror plan. CDP inspection (port 9223, chart `8Wh6yRIo`) captured live DOM for both surfaces. Symbol Search: 840px dialog, 11 asset-class tabs, 4-cell result rows (ticker/description/exchange/actions), footer "Search using ISIN and CUSIP codes". Watchlist: row DOM inside `[data-name="symbol-list-wrap"]`, section group headers ("US STOCK" plain-text dividers), details buttons. Updated §7.6 (✅→🔧, rewrite planned), added §3.33 (section group headers ⏳), updated §11.10 (??→🔧). Plan written to `docs/MIRROR-PLAN-SYMBOL-SEARCH-WATCHLIST.md`. Reference docs updated: `tv-mirror-reference/structure.md` §4.1, `tv-mirror-reference/watchlist.md` §2.4/§3/§8, `tv-mirror-reference/README.md` evidence table.
- **2026-07-13** — Right-rail placement fix. Reordered `SidebarContent` so the panel body opens to the left of the persistent 52px strip and the strip remains pinned to the viewport's outer-right edge, matching the reference workspace. Moved the separator to the strip's left edge and kept the collapsed rail interactive while making the hidden body inert.
- **2026-07-13** — §3b watchlist implementation. Replaced collapsible groups with one-active-list tabs and overflow; added dense sticky quote columns, per-list sorting/settings/colors, Simple/Advanced presets, validated search, empty/error/retry states, context actions, cross-list symbol drag, and keyboard row selection. Folded Details and News into panel sub-tabs and reduced the rail to five items. Live snapshots poll Binance/Bitget/OKX every 2s while visible. Remaining: list-tab drag reorder, inferred Hide/Lock actions, fundamentals/P&L, and news-provider integration.
- **2026-07-12** — Watchlist reference enhancement. Added `tv-mirror-reference/watchlist.md` as the dedicated behavioral reference for the Watchlist right panel: anatomy (rail toggle → list selector → header toolbar → sortable column header → symbol rows → section groups → Details sub-view), control inventory (`watchlist.list_selector`, `watchlist.add_symbol`, `watchlist.advanced_view`, `watchlist.settings`, `watchlist.section_toggle`, `watchlist.column_header`, `watchlist.row`, `watchlist.row_context_menu`, `watchlist.details_metrics`, `watchlist.details_more_seasonals`, `watchlist.details_more_technicals`), sortable-column and quote-state model, selector contract, responsive behavior, WCAG AA recommendations, and a `not captured` gaps list. Grounded in `button-scan.json` (header controls `observed`; row DOM, row context menu, list-menu contents, settings/column-chooser contents, Advanced-view presets, section groups, Details metrics grid, and News sub-view `not captured`). Cross-linked from `tv-mirror-reference/README.md`, `structure.md` 2.4, `tradingview-buttons.md` 6, `interactions.md` 6.1, `audit-results.md`; and from `docs/tv-functions-skill.md` 3.17, `docs/TODO-DESIGN.md` evidence line, `docs/design-astroneum.md` 13, `docs/WORKSTREAMS.md`. Pure documentation change to the read-only evidence corpus — no library/demo code, no `pnpm verify` or deploy.
- **2026-07-12** — §3b watchlist full TV parity spec. Researched against `tv-mirror-reference/structure.md` (`sidebar.watchlist` nested controls: Add symbol, advanced view, settings, sorting), `interactions.md` (empty-state + sort/column/no-matches contracts), and `design-astroneum.md §5 Watchlist Row`. Three-tier plan: Tier 1 (A1-A8 pure UI: list tabs, last price column, column header + sort, row context menu, header toolbar actions, empty-state CTA, cross-list drag, per-list color dots); Tier 2 (B1 fold Details+News into watchlist panel as sub-tabs — sidebar strip 7→5 tabs; B2 Advanced/Simple view toggle; B3 column chooser popover); Tier 3 (C1 `Datafeed.getQuotes?` optional method + 2s quote polling paused when sidebar collapsed; C2 `SymbolSearchModal` replaces text input — validates against `searchSymbols`; C3 no-matches + quote-error + retry states; C4 fundamentals/P&L deferred 🟦 v1.1). `WatchlistManager` gains `moveSymbol` / `setSort` / `setColumns` / `setColor` / `updateQuotes` / `addSymbolFromInfo`. `Datafeed` interface gains optional `getQuotes?(tickers: string[]): Promise<QuoteSnapshot[]>`. Updated §0.4 (7→5 tabs), §3.1 (7→5 tabs), §3.2 (3-sub-tab container), §3.15-3.19 (⏳), added §3.20-3.32 (new rows), §11.9 (quote polling spec'd), §11.17 (row context menu spec'd). All new rows marked ⏳ (spec'd, not yet built). Pair with `design-astroneum.md §4/§5` updates + `TODO.md` function gap rows.
- **2026-07-12** — Rail/dock geometry fix. Replaced nested-flex percentage sizing with explicit `term-workspace-main` CSS Grid rows, eliminating dock translucency/chart bleed. Extended the real `DrawingBar` through the dock height while keeping the dock 52px to its right; the rail scrolls internally when necessary. Dock maximize is now a fixed overlay with grid space retained, so the chart and rail do not reflow. Verified with Playwright geometry checks and screenshot.
- **2026-07-12** — §4 bottom dock completion. Added persistent tab panels, keyboard tab navigation, report-tab Rename/Duplicate/Close and More menus, dock resize (120–480px), maximize/restore, and a compiled strategy -> `getDataList()` -> `BacktestResult` handoff. Strategy reports now use runtime data and show expected payoff, Sharpe, and Sortino; trade markers and broker execution remain separate workstreams.
- **2026-07-12** — §3 right rail pass. Calendar, News, and Ideas now stay in the sidebar as honest empty states instead of opening the generic curtain. Watchlists now support rename and drag reordering for lists and symbols through the existing persisted `WatchlistManager` APIs. Added `DetailsPanel`, supplied with the active symbol and latest OHLC candle from `ChartTerminal`; fundamentals and position P&L remain datafeed-dependent. Selected rows now use the 2px accent edge. Corrected the duplicate 3.1 row and updated 3.15–3.18.
- **2026-07-11 (b)** — Removed dead `term-rail` from `TerminalShell`. The 60px left rail (`RailContent()` in `ChartTerminal.tsx`) was a Phase 1 placeholder with 7 non-functional buttons (cursor/watchlist/alerts/data/strategy/pine/trading) that only set local state — no panel opened, no cursor changed. All entries duplicated existing functional surfaces (sidebar tabs + dock tabs). Semantically wrong position too: TV panel toggles belong on the right rail, not left. Removed: `RailContent()` function, `rail` prop from `TerminalShell`, all `.term-rail*` CSS rules, `--term-rail-w` token from `globals.css`, grid-template-areas/columns updated from 3-col to 2-col. Cleaned 4 unused Icon components (Cursor/Data/Strategy/Pine). **0.2 promoted to ✅** — `DrawingBar` is now the sole left rail. Demo rebuilt + restarted, verified (HTTP 200, no `term-rail*` in SSR HTML, PM2 clean).
- **2026-07-12** ??? §2.5 forecasting group + popup clipping fix. Built 12 new drawing overlays in `src/extension/`. New `forecasting` group in `DrawingBar` with 3 section headers (Forecasting, Volume-based, Measurers) using `isHeader` on `SelectDataSourceItem`. 13 new SVG icons. 15 new i18n keys. Fixed popup clipping: `demo/terminal.css` `.astroneum-drawing-bar` overflow moved to `@media(max-height:620px)`. `pnpm verify` passes (35/35 tests). Deployed + verified (HTTP 200, SSR HTML has `draw.forecasting`, no PM2 errors).
- **2026-07-11** — §2 left drawing toolbar Batch A: bug fixes + Tier 1 quick wins. **Bug fixes:** (1) SCSS `.icon-overlay` class mismatch — replaced inline `style={{32x32}}` with `className="icon-overlay"` on all DrawingBar spans (hover/`.selected` visual states now functional). (2) Missing `groupId: DRAWING_GROUP_ID` on submenu item `onDrawingItemClick` calls — submenu-launched overlays now properly group-tagged. (3) `Escape` key in `hooks.ts` was nuking ALL drawings (`removeOverlay({groupId})`) — now only cancels the in-progress drawing via `currentStep > 0` check + `removeOverlay({id})`. (4) Magnet snap wiring confirmed: engine `OverlayView.ts:346-380` already snaps to OHLC when `mode` is `weak_magnet`/`strong_magnet`; `snapToOhlc`/`snapAngle` in `DrawingSnapper.ts` are utility exports (engine handles runtime snapping natively). **New features:** **2.1** Cursors group — Cross/Dot/Arrow/Eraser submenu, `onCursorChange` sets CSS cursor. **2.9** Measure button — orphaned `measure.ts` extension wired to DrawingBar + Shift+Click on chart canvas. **2.10** Zoom in button — `zoomAtCoordinate(1.2, center)`. **2.12** Keep drawing toggle — UI toggle (re-trigger on drawing-end deferred, no engine event). **2.14** Ctrl+Alt+H — toggles `overrideOverlay({groupId, visible})`. New i18n keys + 7 new SVG icons. Icon sizing fixed: `.icon-overlay` 52x38 hit area, inner SVGs 28px. Library + demo rebuilt, deployed, verified (HTTP 200, SSR HTML has `draw.cursor`/`draw.measure`/`draw.zoom`/`draw.keep_drawing`, PM2 error log empty). Remaining: 2.3/2.4/2.6 stay partial (Batch B), 2.5/2.7/2.8/2.16 stay missing (Tier 3).
- **2026-07-10** - §1.1 Symbol Search parity pass. PeriodBar symbol trigger now uses title(symbol_search), data-semantic-id(header.symbol_search), and apply-common-tooltip; responsive compact behavior added in period-bar/index.scss (hide symbol text at max-width:600px). Updated §1.1 + §9.5.

- **2026-07-08 (d)** — §1 top toolbar: undo/redo + save/load batch (demo-side, no library/`tsup`). **1.12/1.13 ⚠️→✅** — `UndoManager` wired: brand-bar undo/redo buttons (disabled when stack empty) + `Ctrl+Z` / `Ctrl+Y` / `Ctrl+Shift+Z` in `ChartTerminal`'s hotkey `useEffect` (input-field guard so Pine editor/save-prompt aren't hijacked). `record()` via a 600ms poll — `drawing-end` is not emitted (the `EventBus` is defined but never instantiated, and `ActionType` has no overlay action), so mutations are captured by polling `record()` which no-ops when overlays are unchanged (`serializeState` excludes candle data, so cheap); baseline seeded on mount. **1.16/1.17 🔧/❌→✅ + 1.9 🔧→✅** — folded into one `SaveLoadMenu.tsx` (new) backed by `ChartTemplateManager`: "Unnamed" label + Save-as / Load / Clear-drawings / Delete dropdown. **1.5** stays 🔧 — deferred to a library `PeriodBar` pass (overflow dropdown + `,` hotkey). **1.8** ❌→🟦 v1.1 (favorites model). **1.22** ❌→⟫ (mobile). New `terminal.css` `.term-menu*` + `:disabled` rules. Library `hooks.ts` left untouched (Ctrl+Z comment stays — undo is demo-owned, consistent with `/`/`Alt+A`/`Shift+F`). Built (6.2s, types valid) + restarted + verified (HTTP 200, undo button SSR-rendered disabled, PM2 error log empty).
- **2026-07-08 (c)** — §0 shell grid/behavior aligned to `design-astroneum.md` §4. **G1 dimensions:** `globals.css` tokens 48/60/300/300px+200ms → 44/48/260/220px+240ms (footer 28px unchanged). **G2 sidebar animation:** removed inline `display:none` on `.term-sidebar` (was defeating the grid-track transition → snap instead of slide); added `min-width:0`. **G3 responsive <lg:** `@media(max-width:1024px)` now hides `.term-rail`, forces `--term-sidebar-w:0` + `--term-dock-h:collapsed`, and slims topbar via `.term-spacer ~ *{display:none}` (symbol/timeframe live in the chart's `PeriodBar`). FAB overlay deferred 🟦 v1.1. **G4 persistence:** `TerminalShell` now restores/writes sidebar+dock collapse state to `localStorage` key `astroneum:shell` (decoupled from chart `serializeState` — chrome ≠ chart state); restore deferred to `useEffect` to avoid SSR hydration mismatch. **G5 docs:** fixed stale CSS header comment (footer 22→28px), §0 dimension cells (0.1 42→44, 0.2 52→48), added shell-behavior note + per-row slide/persist annotations; updated `design-astroneum.md` §4 (serializeState wording → localStorage; FAB marked v1.1) + `TODO.md` (shell persistence row). 0.1/0.2 stay 🔧 (content gaps live in §1/§2).
- **2026-07-08 (b)** — §1 top toolbar audit + build. Three hotkeys wired at library level in `AstroneumChart.tsx` (modal-toggle `useEffect`): 1.7 `/` (indicators), 1.10 `Alt+A` (alerts), 1.20 `Shift+F` (fullscreen) — promoted 🔧→✅. Built **1.18 Quick Search (Ctrl+K)** — `CommandPalette.tsx` in demo: symbol search + timeframe switch + action toggles, `Ctrl+K` listener in `ChartTerminal`. Found 1.15 LayoutPicker stale (already built) — promoted 🟦→✅. Also patched `AstroneumHandle` `useImperativeHandle` (local clone was behind server — missing `createIndicator`/`removeIndicator`/`createOverlay`/`removeOverlay`/`getDataList`/`setData`/`resize`). Library + demo rebuilt, deployed, verified (HTTP 200). Remaining §1 gaps: 1.5 (`,` interval dropdown), 1.16 (save/load UI), 1.12/1.13 (undo/redo buttons), 1.2/1.8/1.17/1.22 (missing).
- **2026-07-08** — §0 shell regions audit + build. Found server demo ahead of doc: right-rail toggle bar (`SidebarContent` `term-sidebar-strip`, 7 tabs) and bottom-dock tab bar (`DockContent` `term-dock-tabs`, 3 tabs + collapse) already shipped — promoted 0.4, 0.5, 3.1, 3.2, 3.3, 4.1, 4.2, 4.5, 4.7, 4.8 from 🔧/❌ to ✅. Built the one genuinely-missing shell piece: **§0.6 footer date-range navigator** (`DateRangeNavigator.tsx`). 7 presets (1D/1W/1M/3M/1Y/5Y/ALL) anchor to realtime then `zoomAtDataIndex`; live visible-range readout subscribes to engine `onVisibleRangeChange`/`onZoom` actions. Engine bridge via a `ChartPlugin` (`onInit` captures the full `Chart` — `AstroneumHandle` doesn't expose scroll/zoom). Footer token bumped 22px→28px. Deployed + verified (HTTP 200, `term-daterange-*` classes in SSR HTML, no PM2 errors).
- **2026-07-07** — Initial draft. Design/layout focus — "Inside function" column blank where Astroneum has no function wired. Sourced from three TV HTML snapshots (top toolbar, left drawing toolbar, right toolbar + bottom dock), `docs/STRUCTURE.md`, `docs/tv-functions-skill.md`, `docs/design-astroneum.md`, `INDICATOR_COMPARISON.md`, `docs/TODO.md`, `src/chart/hooks.ts` (hotkey audit), and live source (`src/widget/`, `src/extension/`, `demo/src/app/components/`). 10 sections + shell + maintenance policy. ~110 rows. Hotkey audit confirmed: only chart-nav hotkeys wired; all modal/dialog hotkeys missing. Cross-linked to TODO.md.

## 11. Reference Interaction Parity  ->  `design-astroneum.md` sections 13-14

This section tracks the reference behavior that cuts across shell regions.
Status records the Astroneum surface, not a claim of brand or visual parity.
Reference evidence comes from `tv-mirror-reference/structure.md`,
`interactions.md`, `tradingview-buttons.md`, and `watchlist.md` (Watchlist
right-panel deep-dive).

| # | Reference contract | Astroneum design | Inside function |
|---|---|---|---|
| 11.1 | One logical control across responsive presentations; hidden copies inert | ? Required for every responsive terminal control; audit wide/compact markup before shipping new toolbar work | |
| 11.2 | Layer order: canvas -> panels/split -> menus -> dialog -> toast/tooltip | 🔧 Shared ordered layer manager now owns workspace dialogs and Watchlist menus; tooltip/toast integration remains | `component/layer` |
| 11.3 | Only one transient menu/flyout per layer; dialog closes peer menus | 🔧 Symbol Search, AlertModal, and Watchlist list/settings/context menus register with the shared manager; peer-menu closing remains to be standardized | `useLayer` |
| 11.4 | Escape closes frontmost layer and restores focus | 🔧 Registered layers close topmost-first and restore the trigger; remaining overlay families need migration | `useLayer` |
| 11.5 | Anchored menus/flyouts flip, clamp, and support keyboard selection | ?? Individual modals exist; menu geometry and roving focus are incomplete | |
| 11.6 | Dialog focus trap, initial field focus, internal short-viewport scroll | ?? Modal inventory exists; verify each dialog before promotion | |
| 11.7 | Docked panel switch preserves prior state; repeated active rail target collapses body | ? Sidebar persistence/collapse implemented; per-panel scroll/filter restoration remains data-dependent | `TerminalShell` |
| 11.8 | Curtain can move into an in-app split view; never OS pop-out | ?? v1.1 product-surface contract; current app curtain remains chart-adjacent only | |
| 11.9 | Loading/success/error/retry state for delayed operations | 🔧 Watchlist quote polling ships loading/success/error/Retry states (§3.29-3.30); audit remaining delayed surfaces individually | `WatchlistPanel` |
| 11.10 | Symbol search: query persistence, asset scope, empty/network/entitlement recovery | 🔧 `SymbolSearchModal` rewritten 2026-07-13 with 840px/11 tabs/4-cell rows/debounce matching CDP-observed TV geometry; entitlement/delayed-data markers and virtualization remain unbuilt | `SymbolSearchModal` |
| 11.11 | Interval/chart-type single-select menus preserve time anchor and explain unavailable options | ?? Period/chart-type controls exist; keyboard and unavailable-state parity incomplete | `PeriodBar`, `ChartTypeDropdown` |
| 11.12 | Indicator result/error/limit states and legend actions | ?? Add/remove exists; dialog and legend state contract incomplete | `IndicatorModal` |
| 11.13 | Alert editing/invalid/submitting/success/retry lifecycle | ?? `AlertModal` exists; validate lifecycle before promotion | `AlertModal` |
| 11.14 | Drawing completion/cancel/keep/lock/hide/remove semantics | ?? Core controls wired; keep-drawing re-trigger and destructive confirmation remain incomplete | `DrawingBar` |
| 11.15 | Replay date-select/paused/playing/endpoint/realtime lifecycle | ?? Replay toolbar exists; full lifecycle/error recovery needs audit | `BarReplay` |
| 11.16 | Go to, range, timezone preserve chart state and validate availability | ?? Range navigator exists; Go to and timezone state contracts need audit | `DateRangeNavigator` |
| 11.17 | Context menu uses click context and has keyboard alternatives | 🔧 Watchlist row menu ships pointer and Shift+F10/ContextMenu access for Copy/Alert/Move/Remove; chart menu and inferred Hide/Lock remain | `WatchlistPanel` |
| 11.18 | Icon labels, ARIA state, focus, color-independent state, live outcomes | ?? Core components partially expose ARIA; full WCAG 2.2 AA verification pending | |
| 11.19 | 38px dense desktop targets / 44px touch targets, 200% zoom usable | ? Required responsive/accessibility audit | |

### Reference maintenance additions

- When adding a responsive variant, verify hidden variants are inert and record
  its semantic ID in the relevant table.
- When adding any transient UI, update 11.2-11.6 and document its Escape,
  outside-click, focus-return, viewport-edge, loading, and error behavior.
- When adding an async workflow, update its state row with success/retry and
  `aria-live` behavior. Do not promote a surface based on happy-path visuals.
- Treat `tv-mirror-reference` as interaction evidence only. Preserve Astroneum
  names, Cosmic Indigo product tone, and accessibility improvements.

### Change record
- **2026-07-12** - Added reference interaction parity section from the live
  chart workspace evidence. Recorded overlay layering, responsive logical
  controls, focus/dismissal, workflow states, accessibility, and explicit
  implementation gaps without marking unbuilt behavior complete.
