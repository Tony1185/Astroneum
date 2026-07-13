# TradingView Chart UI Reference

Implementation-focused documentation for the current TradingView chart workspace at:

`https://www.tradingview.com/chart/YSAuF0Li/`

## Start here

- [Product context](PRODUCT.md) — audience, purpose, and design principles.
- [Structure](structure.md) — regions, overlays, responsive architecture, and nested surfaces.
- [Essential controls](tradingview-buttons.md) — normalized semantic IDs and stable selector guidance.
- [Interactions](interactions.md) — events, states, focus, dismissal, gestures, and edge cases.
- [Watchlist panel](watchlist.md) — right-panel anatomy, control inventory, interaction model, and gaps.
- [Audit results](audit-results.md) — confirmed inconsistencies, missing behavior, and prioritized recommendations.

## Scope

The Markdown focuses on necessary controls for:

- selecting and configuring a chart;
- adding indicators and alerts;
- drawing and navigating;
- saving/managing layouts;
- using watchlist and analysis panels (Watchlist deep-dive in [watchlist.md](watchlist.md));
- opening product curtains and moving them to split view;
- handling replay, settings, snapshot, date, and timezone flows.

It does not attempt to describe every drawing sub-tool, broker workflow, screener column, community action, or toast category. `button-scan.json` preserves the broader raw control scan.

## Evidence hierarchy

1. Live CDP observation on 2026-07-10.
2. Current accessible state and semantic DOM attributes.
3. `button-scan.json`.
4. HTML reference captures.
5. Visual inference.

Confidence markers used throughout:

- `observed`
- `inferred`
- `not captured`
- `requires manual verification`

## Evidence files

| File | Purpose | Limitation |
|---|---|---|
| `button-scan.json` | Raw buttons and drawing flyout rows | Includes responsive duplicates and hidden toast controls |
| `tradingview-live.html` | Full live DOM snapshot | Static; scripts and account state can drift |
| `tradingview-ref.html` | Earlier reference DOM | Supplementary only |
| `ref-alert-create.html` | Synthetic/manual alert reconstruction | Not a CDP capture; use only as supplementary context |
| `ref-alert-notifications.html` | Synthetic/manual notification reconstruction | Not a CDP capture; use only as supplementary context |
| `ref-icons.html` | Derived icon gallery | Does not define interaction behavior; Icons flyout scan is empty |
| `cdp-expand-scan.js` | Drawing flyout scanner | Uses port 9223 and hashed classes; update before reuse |
| `cdp-live-capture.js` | HTML/screenshot capture | Replaces canvas with an image in exported HTML |
| `cdp-screenshot.js` | PNG + HTML wrapper capture | Simpler alternative to `cdp-live-capture.js` |
| `chart-screenshot.png` | Chart screenshot | Output of `cdp-screenshot.js` |
| `watchlist-screenshot.png` | Watchlist panel screenshot (2026-07-13, CDP clip capture) | Manual clip capture, not from a checked-in script |

`cdp-symbol-search.js`, `cdp-watchlist.js`, `ref-symbol-search.html`, and `ref-watchlist.html` referenced in `docs/MIRROR-PLAN-SYMBOL-SEARCH-WATCHLIST.md` were **not built**. The Symbol Search and Watchlist geometry used for the 2026-07-13 implementation pass came from ad hoc CDP `Runtime.evaluate` calls (computed styles + DOM structure), recorded inline in `structure.md` §4.1 and `watchlist.md` §2.4/§3/§8 rather than as standalone reusable scripts or checked-in HTML/PNG artifacts. This is a known evidence-reproducibility gap: the exact values are documented, but the capture is not re-runnable from a script in this directory.

## Refresh policy

TradingView changes frequently. When refreshing:

1. Record date, viewport, account state, symbol, interval, chart type, open panels, and theme.
2. Capture visible controls separately from hidden responsive variants.
3. Exercise only non-destructive interactions.
4. Compare semantic attributes before CSS classes.
5. Update `audit-results.md` before changing documented contracts.
6. Restore the chart to the baseline state after inspection.

## Selector policy

Prefer:

1. role + accessible name;
2. `data-qa-id`;
3. `data-name`;
4. semantic IDs in `tradingview-buttons.md`.

Avoid hashed classes, absolute coordinates, live price/time text, and selectors that match hidden responsive copies.
