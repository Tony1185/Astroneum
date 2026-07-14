# TradingView UI Documentation Audit

> Audited: 2026-07-10  
> Baseline: BTCUSDT · 1D · light theme · 1920×945  
> Scope: necessary chart controls and representative popup, curtain, and split-view behavior

## 1. Outcome

The original documentation was a strong static DOM inventory but not yet an implementation-ready interaction specification. It duplicated conventions, mixed hidden DOM controls with logical controls, omitted important nested surfaces, and documented snapshot state without modeling transitions.

This revision separates:

- structure and layering;
- essential controls and selectors;
- interaction/state behavior;
- remaining gaps and recommendations.

## 2. Confirmed corrections

| Severity | Original issue | Resolution |
|---|---|---|
| P1 | `legend.more` identified both main-series and study More controls | Split into `legend.main_more` and `legend.study_more` |
| P1 | Product curtain pop-out behavior was absent | Added `curtain.split_view` for `Move overlay to split-view` |
| P1 | Screeners, Pine, Calendars, and Community were described only as rail buttons | Added their curtain, Close, split-view, and essential internal actions |
| P1 | Alert dialog had only a one-line action description | Added condition, trigger, expiration, message, notifications, validation, submit, and error states |
| P1 | Replay toolbar was absent | Added selecting, paused, playing, endpoint, stop, and Replay Trading states |
| P2 | Snapshot entry claimed no aria-label while the current DOM exposes `Take a snapshot` | Corrected selector and nested actions |
| P2 | Details count mixed buttons and a link | Removed misleading count-based specification |
| P2 | Drawing disclosure controls were missing from semantic registry | Added focused disclosure IDs for necessary tool families |
| P2 | Widgetbar hider appeared structurally but had no inventory entry | Added `panel.hide`; exact stable selector remains `not captured` |
| P2 | `chart-screenshot.png` was cited but absent | Removed as active evidence and documented the stale reference |
| P2 | `ref-icons.html` and `ref-alert-notifications.html` existed but were absent from provenance | Added to README evidence manifest |
| P2 | Coordinates were treated as selector-like facts | Reframed as capture evidence only |
| P2 | Watchlist panel was a single one-line nested-controls entry | Added [watchlist.md](watchlist.md) with full anatomy, control inventory (`watchlist.list_selector`, `watchlist.add_symbol`, `watchlist.advanced_view`, `watchlist.settings`, `watchlist.column_header`, `watchlist.details_metrics`), sortable-column and quote-state model; row DOM, row context menu, list-menu contents, and News sub-view remain `not captured` |

## 3. Necessary controls missing from the original inventory

### Popup and dialog controls

- Symbol Search asset tabs, Clear, spread operators, and result Expand.
- Indicators Search, type tabs, navigation groups, and More.
- Create Alert presets, Add condition, Trigger, Expiration, Message, Notifications, Cancel, Create.
- Settings tabs and Cancel/Ok.
- Go to Date/Custom range tabs, date/time fields, calendar navigation, Cancel/Go to.
- Snapshot Download, Copy image, Copy link, Open in new tab, Tweet image.
- Broker picker Find broker, Paper Trading/broker rows, favorites, Show all brokers.

### Pop-out / split-view controls

- `Move overlay to split-view` on Screeners, Pine Editor, Calendars, and Community.
- Curtain Close.
- Screener fullscreen.
- Split-view pane close/collapse/resize behavior.

### Docked panel controls

- Alerts/Log tabs and empty-state Create alert.
- Object tree/Data window tabs and drawing-management actions.
- Panel hider/collapse behavior.

### Replay controls

- Select date;
- play/pause;
- step;
- speed;
- endpoint/realtime;
- Close;
- Replay Trading.

## 4. State gaps in the original documentation

| Area | Missing states now specified |
|---|---|
| Save layout | saved, dirty, saving, failed/retry |
| Alert create | editing, invalid, submitting, success, quota/network failure |
| Drawing tools | selected, in-progress, complete, cancelled, keep-drawing |
| Toggle controls | pressed/checked and option substate |
| Dialogs | opening, focus trap, validation, cancel, Escape, focus return |
| Docked panels | closed, active, switched, collapsed, restored |
| Product curtains | overlay, split-view, fullscreen where available, close |
| Indicators | loading, no results, paid/permission, script error, limit |
| Replay | selecting, paused, playing, endpoint, stopped |
| Network actions | loading, success announcement, recoverable failure |
| Empty content | Alerts, Chats, Notifications, Watchlist (full panel in [watchlist.md](watchlist.md)) |

## 5. Remaining issues

### P1 — Publish flow is not safely verified

Impact: implementers do not have a reliable model for draft, validation, preview, publishing, success, or failure.

Recommendation: inspect with a disposable draft/account and stop before final publication. Until then, retain `requires manual verification`.

### P1 — Connected-broker trading panel is not captured

Impact: Trade currently opens the broker picker. Order ticket, positions, orders, history, account switching, and rejection states vary by broker.

Recommendation: create a separate broker-agnostic trading specification using Paper Trading. Do not infer live-order behavior from the disconnected state.

### P1 — Exact keyboard/focus behavior needs assistive-technology verification

Impact: DOM roles alone do not prove focus trapping, roving focus, announcements, or focus restoration.

Recommendation: manually verify Tab, Shift+Tab, arrows, Enter, Space, Escape, 200% zoom, and a screen reader on the essential dialogs.

### P2 — Right panel hider lacks a stable selector

Impact: automation may rely on a structural/hashed selector.

Recommendation: capture its role, accessible name, and semantic attribute in the next scan; retain `panel.hide` as the normalized ID.

### P2 — Responsive thresholds remain unverified

Impact: the old three-variant coordinates prove responsive presentations, not their breakpoint values or focus behavior.

Recommendation: scan representative widths and record only structural transitions: labels collapse, shortcuts move to overflow, right panel changes presentation.

### P2 — Legend More is difficult to target reliably

Impact: the same `data-qa-id` is reused and actions may be hover-revealed.

Recommendation: scope by main-series/study container and require keyboard discoverability in the implementation.

### P2 — Current scan overcounts hidden controls

Impact: raw totals include responsive duplicates, empty toast-group controls, and repeated flyout parent rows.

Recommendation: report three numbers separately: visible controls, logical controls, raw DOM controls. The focused Markdown intentionally avoids a grand-total claim.

### P3 — Some icon-only controls have weak labels

Impact: purpose can be unclear to assistive technology and maintainers.

Recommendation: add context-specific accessible labels while preserving visual density.

## 6. WCAG AA recommendations

These are recommendations, not claims about exact TradingView behavior:

1. Ensure all essential actions are keyboard-reachable without hover.
2. Use visible focus with at least 3:1 component contrast.
3. Expose selected, checked, pressed, expanded, disabled, invalid, and busy states.
4. Keep normal text at 4.5:1 and non-text controls at 3:1.
5. Announce dynamic save, alert, clipboard, replay, and error outcomes.
6. Trap focus in modal dialogs and restore it on close.
7. Provide a chart summary and data-table alternative.
8. Respect reduced motion and 200% zoom.
9. Increase effective targets for touch without reducing desktop information density.
10. Never use color alone for price direction, alert severity, or selected state.

## 7. Verification backlog

- [ ] Publish flow with no final publish action.
- [ ] Paper Trading connection and trading-panel shell.
- [ ] Panel hider semantic selector.
- [ ] Focus order and restoration for the five essential dialogs.
- [ ] Compact and narrow viewport transitions.
- [ ] Dark-theme contrast and state parity.
- [ ] Clipboard/download failure feedback.
- [ ] Offline/session-expiry recovery.
- [ ] Watchlist row DOM, row context menu, list-selector menu, settings/column-chooser contents, Advanced-view presets, section groups, Details metrics grid, and News sub-view (see [watchlist.md](watchlist.md) 8).

## 8. Positive findings

- Most essential toolbar controls expose useful accessible names or semantic QA attributes.
- Right-rail product curtains share a consistent Close and split-view pattern.
- Settings and search dialogs expose clear tab/search structures.
- Go to uses semantic tabs, grid cells, and disabled future dates.
- Replay and docked products preserve the chart as the primary workspace rather than forcing full navigation.
