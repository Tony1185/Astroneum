# TradingView Essential Control Inventory

> Source: `https://www.tradingview.com/chart/YSAuF0Li/`  
> Live verification: 2026-07-10, BTCUSDT · 1D · 1920×945  
> Scope: controls necessary for primary chart workflows; raw exhaustive inventory remains in `button-scan.json`

## 1. Inventory conventions

Each logical control receives one context-specific `semantic_id`, even when TradingView renders multiple responsive DOM variants.

State notation:

- `momentary`: performs an action;
- `toggle`: uses `aria-pressed` or equivalent;
- `selection`: one option in a group;
- `disclosure`: opens a nested surface;
- `disabled`: visible but not currently available.

Selector preference is role/accessibility name, then `data-qa-id`, then `data-name`. Selectors containing the current interval, symbol, price, or last action are state-dependent.

## 2. Essential top toolbar controls

| semantic_id | Control | Preferred selector | Kind | Result / state |
|---|---|---|---|---|
| `header.main_menu` | Main menu | `[data-qa-id="main-menu-button"]` | disclosure | account/app menu |
| `header.symbol_search` | Symbol | `[title="Symbol search"]` | disclosure | Symbol Search dialog |
| `header.compare` | Compare | `[aria-label="Compare symbols"]` | disclosure | Compare Symbols dialog |
| `header.interval` | Interval | active button with interval accessible name | disclosure | interval menu; label changes after selection |
| `header.chart_type` | Chart type | active button with chart-type accessible name | disclosure | chart-type menu |
| `header.indicators` | Indicators | `[data-name="open-indicators-dialog"]` | disclosure | Indicators dialog |
| `header.templates` | Indicator templates | `[aria-label="Indicator templates"]` | disclosure | Save/Open template menu |
| `header.alert_create` | Alert | `[aria-label="Create alert"]` | disclosure | Create Alert dialog |
| `header.replay` | Replay | `[aria-label="Bar replay"]` | toggle | selection mode, then replay toolbar |
| `header.undo` | Undo | action-specific accessible name | momentary | reverts latest eligible action |
| `header.redo` | Redo | visible disabled/enabled sibling of Undo | momentary | disabled when redo stack is empty |
| `header.layout_setup` | Layout setup | `[data-qa-id="layouts-menu-button"]` | disclosure | checked layout menu |
| `header.save_layout` | Save status | `[data-qa-id="header-toolbar-save-load"]` | momentary/status | disabled when all changes are saved |
| `header.manage_layouts` | Manage layouts | `[data-name="save-load-menu"]` | disclosure | save/share/rename/open menu |
| `header.quick_search` | Quick search | `[data-name="header-toolbar-quick-search"]` | disclosure | command search dialog |
| `header.settings` | Settings | `[data-name="header-toolbar-properties"]` | disclosure | chart Settings dialog |
| `header.fullscreen` | Fullscreen | `[data-name="header-toolbar-fullscreen"]` | toggle | browser/chart fullscreen |
| `header.snapshot` | Snapshot | `[aria-label="Take a snapshot"]` | disclosure | download/copy/link menu |
| `header.trade` | Trade | `[data-qa-id="trade-button"]` | disclosure | broker picker when disconnected; trading panel when connected |
| `header.publish` | Publish | `[aria-label="Share your idea with the trade community"]` | disclosure | publish flow; `requires manual verification` |

### Main menu essentials

Observed rows include profile, Home, Help Center, Support requests, What's new, Dark theme, Drawings panel, Language, Keyboard shortcuts, Get desktop app, and Sign out.

`Dark theme` and `Drawings panel` are checked toggles. Sign out is destructive to the current session and was not exercised.

## 3. Essential drawing controls

| semantic_id | Control | Selector | Kind | Notes |
|---|---|---|---|---|
| `draw.cursor` | Cursor tool | `[aria-label="Cross"]` | selection | default chart interaction |
| `draw.cursor_menu` | Cursor menu | `[aria-label="Cursors"]` | disclosure | Cross, Dot, Arrow, Demonstration, Eraser |
| `draw.trendline` | Trendline | `[aria-label="Trendline"]` | selection | shortcut Alt+T |
| `draw.trend_menu` | Trend tools | `[aria-label="Trend tools"]` | disclosure | line/channel/pitchfork family |
| `draw.fib` | Fib retracement | `[aria-label="Fib retracement"]` | selection | shortcut Alt+F |
| `draw.fib_menu` | Gann/Fibonacci | `[aria-label="Gann and Fibonacci tools"]` | disclosure | Fibonacci and Gann family |
| `draw.position` | Long position | `[aria-label="Long position"]` | selection | forecasting/risk drawing |
| `draw.shape` | Brush | `[aria-label="Brush"]` | selection | representative geometry tool |
| `draw.text` | Text | `[aria-label="Text"]` | selection | annotation |
| `draw.measure` | Measure | `[data-name="measure"]` | selection | temporary measurement mode |
| `draw.zoom` | Zoom in | `[data-name="zoom"]` | selection | click chart to zoom |
| `draw.magnet` | Magnet mode | `[aria-label*="Magnet mode"]` | toggle | snaps points to OHLC |
| `draw.keep_drawing` | Keep drawing | `[data-name="drawginmode"]` | toggle | raw misspelling is intentional |
| `draw.lock_all` | Lock all drawings | `[data-name="lockAllDrawings"]` | toggle | prevents editing |
| `draw.hide_all` | Hide all drawings | `[aria-label="Hide all drawings"]` | toggle | visibility only |
| `draw.remove_menu` | Remove options | `[aria-label="Remove options"]` | disclosure | destructive; confirm bulk intent |

The flyout row's favorite and learn-more controls are secondary. They are omitted from this focused inventory but must remain reachable in a full implementation.

## 4. Legend and chart controls

| semantic_id | Control | Selector | Kind | Result / state |
|---|---|---|---|---|
| `legend.symbol_change` | Symbol title | `[aria-label="Change symbol"]` | disclosure | Symbol Search |
| `legend.interval_change` | Interval title | `[aria-label="Change interval"]` | disclosure | interval menu |
| `legend.flag_symbol` | Flag | `[data-qa-id="legend-flag-action"]` | toggle | personal symbol flag |
| `legend.main_more` | Main-series More | first visible `[data-qa-id="legend-more-action"]` in series item | disclosure | series context menu |
| `legend.study_visibility` | Study visibility | study-scoped `[data-qa-id="legend-show-hide-action"]` | toggle | show/hide study |
| `legend.study_settings` | Study settings | study-scoped `[data-qa-id="legend-settings-action"]` | disclosure | study settings |
| `legend.study_remove` | Remove study | study-scoped `[data-qa-id="legend-delete-action"]` | momentary | remove + Undo availability |
| `legend.study_more` | Study More | study-scoped `[data-qa-id="legend-more-action"]` | disclosure | study context menu |
| `scale.auto` | Auto scale | `[aria-label="Toggle auto scale"]` | toggle | observed active |
| `scale.log` | Log scale | `[aria-label="Toggle log scale"]` | toggle | independent scale mode |

`legend.main_more` and `legend.study_more` deliberately replace the former duplicated `legend.more` ID.

## 5. Date, range, and replay

| semantic_id | Control | Selector | Kind | Result / state |
|---|---|---|---|---|
| `range.shortcut_1d` | 1D | `[data-name="date-range-tab-1D"]` | selection | changes visible range and interval |
| `range.shortcut_5d` | 5D | `[data-name="date-range-tab-5D"]` | selection | changes visible range and interval |
| `range.shortcut_1m` | 1M | `[data-name="date-range-tab-1M"]` | selection | changes visible range and interval |
| `range.shortcut_ytd` | YTD | `[data-name="date-range-tab-YTD"]` | selection | year-to-date |
| `range.shortcut_1y` | 1Y | `[data-name="date-range-tab-12M"]` | selection | one year |
| `range.shortcut_all` | All | `[data-name="date-range-tab-ALL"]` | selection | all available data |
| `range.goto` | Go to | `[data-name="go-to-date"]` | disclosure | Date / Custom range dialog |
| `range.timezone` | Timezone | `[data-name="time-zone-menu"]` | disclosure | UTC/Exchange/named-zone menu |

Other visible range shortcuts follow `range.shortcut_{normalized_id}`.

### Active replay toolbar

After choosing a replay start date, the chart adds:

- Select date;
- play/pause;
- step forward;
- playback speed;
- jump to real time / endpoint controls;
- Close;
- Replay Trading dock trigger.

Replay controls are absent before replay starts. Stopping replay returns the chart to real time.

## 6. Essential right-rail controls

| semantic_id | Control | Selector | Presentation | Necessary nested controls |
|---|---|---|---|---|
| `sidebar.watchlist` | Watchlist/details/news | `[data-name="base"]` | docked panel | Add symbol, advanced view, settings, sorting |
| `sidebar.alerts` | Alerts | `[data-name="alerts"]` | docked panel | Alerts/Log tabs, Create alert |
| `sidebar.object_tree` | Object tree/data window | `[data-name="object_tree"]` | docked panel | tabs, group, clone/copy, move, manage drawings |
| `sidebar.chats` | Chats | `[data-name="union_chats"]` | docked panel | empty and message-list states |
| `sidebar.screeners` | Screeners | `[data-name="screener-dialog-button"]` | product curtain | split-view, Close, filters, view, columns, fullscreen |
| `sidebar.pine` | Pine Editor | `[data-name="pine-dialog-button"]` | product curtain | split-view, Close, add to chart, save, publish, more |
| `sidebar.calendars` | Calendars | `[data-name="calendar-dialog-button"]` | product curtain | split-view, Close, date/category/importance filters |
| `sidebar.community` | Community | `[data-name="community-hub-button"]` | product curtain | split-view, Close, feed tabs |
| `sidebar.notifications` | Notifications | `[data-name="notifications-button"]` | panel/curtain subview | empty state and recovery CTA |
| `sidebar.products` | Products | `[data-qa-id="products-button"]` | popup | product/social destinations and favorites |
| `sidebar.help` | Help Center | `[data-name="help-button"]` | navigation | opens support content |

### Pop-up, pop-out, and close controls

| semantic_id | Label | Selector | Behavior |
|---|---|---|---|
| `curtain.split_view` | Move overlay to split-view | `[data-qa-id="split-view-button"]` | converts curtain to chart-adjacent pane |
| `curtain.close` | Close | curtain-scoped `[aria-label="Close"]` | restores chart workspace |
| `screener.fullscreen` | Fullscreen | `[data-qa-id="screener-enter-fullscreen"]` | expands screener within viewport |
| `panel.hide` | Panel hider | widgetbar-scoped hider control | collapses right panel; exact selector `not captured` |

TradingView's observed "pop-out" is an in-app split view, not a new operating-system window.

## 7. Essential dialog controls

### Symbol Search

- Close;
- Search;
- Clear;
- spread operators;
- asset-class tabs;
- result rows and Expand.

### Indicators

- Close;
- Search;
- Indicators / Strategies / Profiles / Patterns tabs;
- personal, built-in, and community navigation;
- More.

### Create Alert

- symbol and preset buttons;
- source/operator/value controls;
- Increase/Decrease threshold;
- Add condition;
- Trigger;
- Expiration;
- Message;
- Notifications;
- Cancel / Create.

### Settings

- Symbol, Status line, Scales and lines, Canvas, Trading, Alerts, Events tabs;
- tab-specific controls;
- Template;
- Cancel / Ok.

### Go to

- Date / Custom range tabs;
- date and time inputs;
- month navigation and calendar cells;
- Cancel / Go to.

### Broker picker

When no broker is connected, Trade opens:

- Close;
- Find broker;
- Paper Trading and available broker rows;
- favorites;
- Show all brokers.

## 8. Chart context menu

Observed necessary actions:

- Reset chart view;
- Copy price and Paste;
- Add alert at price;
- Buy/Sell and Add order at price;
- Lock vertical cursor line by time;
- Table view;
- Object tree;
- Chart template submenu;
- Remove indicator;
- Settings.

Trading actions are account/broker-dependent and were not executed.

## 9. Global state requirements

Every necessary control must define:

- default, hover, focus-visible, pressed/active;
- selected/expanded/checked where applicable;
- disabled with reason;
- loading for operations over 300 ms;
- success/error feedback for save, clipboard, alert, and network actions.

See [interactions.md](interactions.md) for transitions and [audit-results.md](audit-results.md) for gaps in the captured model.
