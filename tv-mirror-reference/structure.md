# TradingView Chart UI Structure

> Source: `https://www.tradingview.com/chart/YSAuF0Li/`  
> Live verification: 2026-07-10, Chrome CDP, 1920×945 viewport  
> Scope: essential chart workflows and representative nested surfaces  
> Companion documents: [control inventory](tradingview-buttons.md), [interaction model](interactions.md), [audit](audit-results.md)

## 1. Purpose and evidence

This document describes the structural model needed to rebuild a faithful TradingView-style chart workspace. It intentionally does not duplicate every drawing tool, toast category, or hidden responsive DOM variant. The exhaustive 2026-07-10 scan remains available in `button-scan.json`.

Evidence priority:

1. Live behavior observed through CDP.
2. Current visible DOM attributes and accessibility state.
3. `button-scan.json` and the HTML snapshots.
4. Visual inference from screenshots.

Confidence markers:

- `observed`: confirmed in the live interface.
- `inferred`: consistent with evidence but not directly exercised.
- `not captured`: known surface without enough current evidence.
- `requires manual verification`: behavior is ambiguous, account-dependent, or risky to exercise.

Hashed CSS-module classes are evidence, not contracts. Implementations and tests should prefer role and accessible name, then `data-qa-id`, then `data-name`.

## 2. Workspace regions

```text
┌──────────────────────────────────────────────────────────────────────┐
│ Main menu │ Symbol · interval · type · indicators · alert · replay │
│           │                         layouts · search · settings      │
├───────────┼───────────────────────────────────────────────┬──────────┤
│ Drawing   │ Legend                                        │ Widget   │
│ toolbar   │                                               │ rail +   │
│           │                 Chart canvas                  │ active   │
│           │                                               │ panel    │
│           │                                               │          │
├───────────┼───────────────────────────────────────────────┼──────────┤
│           │ Range shortcuts · Go to · timezone           │ Products │
├───────────┴───────────────────────────────────────────────┴──────────┤
│ Optional dock: trading, Replay Trading, or split-view product       │
└──────────────────────────────────────────────────────────────────────┘
```

### 2.1 Top application toolbar

The toolbar has two logical clusters:

- chart context: symbol, compare, interval, chart type, indicators, templates, alert, replay, undo, redo;
- workspace actions: layout, save status, manage layouts, quick search, settings, fullscreen, snapshot, trade, publish.

TradingView renders narrow, medium, and wide variants in the DOM. Only the variant selected by CSS is operable. At wide widths, text accompanies the highest-value controls; narrower variants become icon-only.

Implementation rule: model one logical control with responsive presentation variants. Do not expose hidden variants to keyboard navigation or accessibility APIs.

### 2.2 Left drawing toolbar

The toolbar contains:

- tool + disclosure pairs for cursor, trend, Fibonacci/Gann, patterns, forecasting, shapes, annotations, icons, magnets, visibility, and removal;
- direct utilities such as Measure and Zoom;
- persistent toggles such as Keep drawing, Lock all drawings, and Hide all drawings.

A disclosure opens a vertically scrollable flyout beside the toolbar. The parent tool and its disclosure are separate targets. The exhaustive 104-row sub-tool list lives in `button-scan.json`; implementers should prioritize the common tools listed in [tradingview-buttons.md](tradingview-buttons.md).

### 2.3 Chart workspace

The center region owns:

- the main series and indicator canvases;
- symbol and study legends;
- price and time scales;
- Auto and Log price-scale toggles;
- range shortcuts, Go to, and timezone controls;
- contextual overlays such as order lines, replay cursor, drawing handles, and tooltips.

Canvas behavior is gesture-driven and is not represented by the button count. See [interactions.md](interactions.md#7-chart-canvas-and-context-menu).

### 2.4 Right widget rail

The vertical rail switches between:

- Watchlist, details, and news (full panel anatomy in [watchlist.md](watchlist.md));
- Alerts;
- Object tree and data window;
- Chats;
- Screeners;
- Pine Editor;
- Calendars;
- Community;
- Notifications;
- Products and Help.

There are two presentation families:

1. **Docked widget panel** — Watchlist (see [watchlist.md](watchlist.md)), Alerts, Object tree, Chats.
2. **Product curtain** — Screeners, Pine Editor, Calendars, Community.

Product curtains include `Move overlay to split-view` and Close. Some also include fullscreen, view toggles, save, filters, or tab navigation.

### 2.5 Bottom and split-view surfaces

Bottom or split-view surfaces reduce chart space rather than covering it:

- broker/trading panel after a broker is connected;
- Replay Trading while bar replay is active;
- product curtains moved to split-view.

These surfaces require a visible collapse/close path and a resize handle when user-resizable.

## 3. Overlay taxonomy

| Surface | Typical trigger | Placement | Dismissal | Focus model |
|---|---|---|---|---|
| Tooltip | hover/focus | anchored | pointer leave, blur | no focus transfer |
| Flyout | drawing disclosure | anchored beside toolbar | Escape, outside click, another disclosure | first row after keyboard open |
| Popup menu | interval, chart type, layouts, snapshot | anchored | Escape, outside click, selection | roving option focus |
| Dialog | symbol search, indicators, alert, settings, Go to | centered | Close, Cancel, Escape | trapped; initial focus in search/first field |
| Docked panel | widget rail | right side | active rail button or panel hider | panel content enters tab order |
| Product curtain | Screener, Pine, Calendar, Community | large overlay | Close or Escape | trapped within curtain |
| Split view | curtain action | chart-adjacent pane | Close/collapse | normal pane-to-pane navigation |
| Context menu | chart right-click | pointer anchored | selection, Escape, outside click | menu navigation |
| Toast | asynchronous event | overlap manager | timeout or close | announced without stealing focus |

Only one transient menu/flyout should be active per interaction layer. Opening a dialog closes transient menus. A product curtain may coexist with docked chart chrome but visually dominates it.

## 4. Essential nested surfaces

### 4.1 Symbol and compare search

`observed` 2026-07-13 via CDP (port 9223, chart `8Wh6yRIo`, BTC.D active):

Symbol Search is a centered dialog (`[data-name="symbol-search-items-dialog"]`, `role="dialog"`, 840x680px) with:

- title "Symbol search" + Close button (`[data-qa-id="close"]`, text "Close menu");
- searchbox (`[data-qa-id="symbol-search-input"]`, `role="searchbox"`, placeholder `Symbol, ISIN, or CUSIP`);
- asset-class tabs (`[role="tablist"]`): All, Stocks, Funds, Futures, Forex, Crypto, Indices, Bonds, Economy, Options, More — each `[role="tab"]` with `aria-selected`, 28px height;
- result rows (`[data-name="symbol-search-dialog-content-item"]`) in a scrollable listContainer — 51 rows observed, each row has 4 cells:
  1. ticker (bold, e.g. "BTCUSD") — `itemInfoCell` class;
  2. description (muted, e.g. "Bitcoin / U.S. dollar") — `descriptionCell` class;
  3. exchange (smaller muted, e.g. "spot crypto defiBitstamp") — `exchangeCell` class;
  4. actions (empty, hover-revealed) — `emptyActions` class;
- active row has indigo tint (`active` class modifier);
- footer: "Search using ISIN and CUSIP codes";
- spread-operator disclosure (`not captured` in this pass — inferred from prior evidence).

Compare Symbols reuses the search pattern but adds a series rather than replacing the primary symbol.

### 4.2 Interval and chart type menus

The interval menu groups custom intervals, ticks, seconds, minutes, hours, days, and ranges. The selected interval updates the toolbar and legend label.

The chart type menu includes:

- Bars, Candles, Hollow candles, Volume candles;
- Line, Line with markers, Step line, Area, HLC area, Baseline, Columns, High-low;
- Volume footprint, Time price opportunity, Session volume profile;
- Heikin Ashi, Renko, Line break, Kagi, Point & figure, Range.

Unavailable or plan-gated types must remain visible with an explanatory disabled/upgrade state rather than silently disappearing.

### 4.3 Indicators dialog

The dialog contains:

- Search;
- navigation groups for personal, built-in, and community content;
- type tabs: Indicators, Strategies, Profiles, Patterns;
- a More overflow action.

Selecting an item applies it to the active chart. Loading, no-results, permission, and script-error states are required.

### 4.4 Create alert

The observed dialog contains:

- symbol selector and presets;
- Condition: source, operator, threshold, optional additional condition;
- Trigger;
- Expiration;
- Message;
- Notifications;
- Cancel and Create.

The Create action must expose validation, submitting, success, quota/permission failure, and retry states.

### 4.5 Settings

Observed tabs:

- Symbol;
- Status line;
- Scales and lines;
- Canvas;
- Trading;
- Alerts;
- Events.

Changes are staged until Ok. Cancel and Escape discard staged changes; unsaved-change confirmation is `requires manual verification`.

### 4.6 Layout and snapshot menus

Layout Setup exposes one-chart through multi-chart arrangements using checked menu items. Manage Layouts contains Save, Autosave, Share, Make a copy, Rename, Download data, Create new, recent layouts, and Open layout.

Snapshot actions:

- Download image;
- Copy image;
- Copy link;
- Open in new tab;
- Tweet image.

Clipboard and download failures need explicit feedback.

### 4.7 Go to and timezone

Go to is a dialog with Date and Custom range tabs, date input, optional time input, calendar grid, Cancel, and Go to. Future/unavailable dates are disabled.

Timezone is an anchored searchable/scrollable menu. UTC is checked in the observed state; Exchange and named UTC-offset zones are alternatives.

### 4.8 Product curtains and pop-out behavior

Screeners, Pine Editor, Calendars, and Community share:

- large curtain container;
- Close;
- `Move overlay to split-view`.

Representative additional controls:

- Screeners: filters, table/chart view, columns, sort, fullscreen.
- Pine Editor: add to chart, save, publish, script options.
- Calendars: date navigation, category tabs, importance and category filters.
- Community: feed tabs, follow and engagement actions.

`Move overlay to split-view` is the current pop-out analogue inside the chart workspace. It does not create an operating-system window.

## 5. Responsive behavior

Observed wide viewport: 1920×945.

Required structural adaptations:

- top-toolbar labels collapse before controls are removed;
- the right panel may close or become a curtain on constrained widths;
- drawing toolbar remains vertically scrollable;
- dialogs clamp to the viewport and scroll internally;
- product curtains can replace or split the chart region;
- date-range shortcuts progressively collapse into a Date Range menu;
- duplicate responsive DOM variants remain hidden and non-focusable.

Exact breakpoint pixel values are `not captured`; implementations should use available-width behavior rather than copying inferred thresholds.

## 6. Accessibility contract

Faithful behavior and recommended improvements are separate:

- preserve TradingView labels and interaction order when known;
- expose `aria-pressed`, `aria-selected`, `aria-expanded`, `aria-checked`, and disabled state consistently;
- provide visible focus;
- keep icon-only targets labelled;
- return focus to the trigger after a transient surface closes;
- do not rely on hover to reveal the only path to a necessary action;
- announce save, alert, clipboard, and error outcomes without moving focus;
- target WCAG 2.2 AA even when the observed interface falls short.

## 7. Stable selector contract

Preferred selector order:

1. role + accessible name;
2. `data-qa-id`;
3. `data-name`;
4. normalized semantic ID from [tradingview-buttons.md](tradingview-buttons.md);
5. stable layout region.

Avoid:

- hashed class suffixes;
- absolute coordinates;
- text containing live prices, times, or selected values;
- selectors that match all responsive duplicates.

## 8. Out of scope

This focused specification does not enumerate:

- every one of the 104 drawing sub-tools;
- all broker-specific order tickets;
- every screener column or community-feed action;
- every toast category;
- destructive account actions;
- publish completion or live-order execution.

Those remain in raw evidence or are marked for manual verification.
