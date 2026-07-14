---
name: Astroneum Terminal
description: TradingView-class dark trading terminal for the Astroneum charting library.
colors:
  primary: "#6366f1"
  up: "#26a69a"
  down: "#ef5350"
  warning: "#f7931a"
  app-bg: "#131722"
  panel-bg: "#1e222d"
  panel-bg-elevated: "#2a2e39"
  border: "#2a2e39"
  text-primary: "#d1d4dc"
  text-secondary: "#787b86"
  text-muted: "#5d606b"
typography:
  title:
    fontFamily: "'Trebuchet MS', -apple-system, BlinkMacSystemFont, Roboto, Ubuntu, sans-serif"
    fontSize: "13px"
    fontWeight: 600
    lineHeight: "1.4"
  body:
    fontFamily: "'Trebuchet MS', -apple-system, BlinkMacSystemFont, Roboto, Ubuntu, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: "1.4"
  label:
    fontFamily: "'Trebuchet MS', -apple-system, BlinkMacSystemFont, Roboto, Ubuntu, sans-serif"
    fontSize: "11px"
    fontWeight: 600
    lineHeight: "1.4"
    letterSpacing: "0.5px"
  data:
    fontFamily: "'Trebuchet MS', -apple-system, BlinkMacSystemFont, Roboto, Ubuntu, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: "1.3"
    fontFeature: "tabular-nums"
rounded:
  sm: "3px"
  md: "4px"
  lg: "8px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  xxl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "6px 12px"
    typography: "{typography.title}"
  button-primary-hover:
    backgroundColor: "#4f46e5"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: "6px 10px"
  button-ghost-hover:
    backgroundColor: "{colors.panel-bg-elevated}"
  button-icon:
    backgroundColor: "transparent"
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.md}"
    size: "32px"
  button-icon-hover:
    backgroundColor: "{colors.panel-bg-elevated}"
    textColor: "{colors.text-primary}"
  button-icon-active:
    backgroundColor: "#6366f126"
    textColor: "{colors.primary}"
  chip:
    backgroundColor: "{colors.panel-bg-elevated}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.sm}"
    padding: "1px 8px"
    typography: "{typography.label}"
  chip-up:
    backgroundColor: "#26a69a1f"
    textColor: "{colors.up}"
  chip-down:
    backgroundColor: "#ef53501f"
    textColor: "{colors.down}"
  input:
    backgroundColor: "{colors.app-bg}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    height: "30px"
  tab:
    textColor: "{colors.text-secondary}"
    padding: "0 14px"
    height: "36px"
    typography: "{typography.body}"
  tab-active:
    textColor: "{colors.text-primary}"
  rail-item:
    backgroundColor: "transparent"
    textColor: "{colors.text-secondary}"
    size: "44px"
    rounded: "{rounded.md}"
  rail-item-active:
    backgroundColor: "#6366f126"
    textColor: "{colors.primary}"
  panel:
    backgroundColor: "{colors.panel-bg}"
    borderColor: "{colors.border}"
---

# Design System: Astroneum Terminal

## 1. Overview

**Creative North Star: "The Instrument"**

Astroneum Terminal is a dark trading terminal built for traders who read
fast and act faster. It is an instrument, not a surface: every pixel earns its
place by carrying data or making a control reachable. The aesthetic is the
aesthetic of a well-made tool — flat, dense, calm, with a single note of
cosmic indigo for the things that matter most.

The system deliberately mirrors the interaction grammar of the category's
reference tool (TradingView): a 44px top toolbar, a 52px left drawing rail that remains pinned through the dock, a
flex chart, a 260px right sidebar whose 52px toggle strip stays on the viewport's outer edge, and a 220px resizable bottom dock for persistent analysis panels
editor and strategy tester. Familiarity is the feature; strangeness is the
failure. It rejects AI slop (purple gradients, gradient text, glassmorphism,
side-stripe borders, eyebrow kickers, identical card grids) and SaaS marketing
dressing ("supercharge your trading", fake metrics, celebratory motion). Motion
conveys state only, 100-240ms, ease-out, no bounce. Menus, dialogs, and
contextual terminal surfaces use a short transform and opacity settle; live chart
data remains immediate.

The chrome is a thin layer over the Astroneum charting library. Every color,
font, and radius token references the library's own `--astroneum-*` CSS
variables so the terminal shell and the chart canvas stay in lockstep. The
single override is the primary accent: Astroneum's Cosmic Indigo (`#6366f1`)
replaces the library's default TradingView blue, applied via a `:root`-scoped
`--astroneum-primary-color` override so the chart's selection, focus, and
drawing handles re-skin with it.

**Key Characteristics:** dark, dense, flat, tabular-numeric, one accent, calm
motion, keyboard-first, library-token-aligned.

## 2. Colors: The Cosmic-Indigo-on-Terminal-Black Palette

One accent over a neutral dark ramp. Up/down are the only other saturated
colors and they carry semantic direction only.

### Primary
- **Cosmic Indigo** (`#6366f1`): Astroneum brand accent. Primary actions, the
  active timeframe button, selected rail/sidebar items, the 3px active
  accent bar, focus rings, chart selection and drawing handles (via the
  `--astroneum-primary-color` override). Used on ≤10% of any screen.

### Semantic
- **Up Green** (`#26a69a`): rising candles, positive Δ, buy. Never as
  decoration.
- **Down Red** (`#ef5350`): falling candles, negative Δ, sell. Never as
  decoration.
- **Warning Amber** (`#f7931a`): triggered alerts, caution states.

### Neutral
- **Terminal Black** (`#131722`): app and chart background. The void the data
  sits in.
- **Panel Slate** (`#1e222d`): toolbar, sidebar, dock, panel backgrounds — one
  step up from the void.
- **Elevated Slate** (`#2a2e39`): hover backgrounds, popovers, menus, borders.
- **Primary Text** (`#d1d4dc`): UI labels, legend values, data.
- **Secondary Text** (`#787b86`): axis labels, captions, sublabels, inactive
  tabs.
- **Muted Text** (`#5d606b`): disabled hints, placeholders (must still meet
  4.5:1 where used as body — verify per use).

### Named Rules
**The One Voice Rule.** Cosmic Indigo is the only accent. It appears on ≤10% of
any screen and only on primary actions, current selection, and active state.
Never as decoration, never on inactive states, never as a second accent.

**The No-Decoration Rule.** Up green and down red carry direction only. They
never color a surface, border, or label that is not directional data.

## 3. Typography

**UI Font:** `'Trebuchet MS', -apple-system, BlinkMacSystemFont, Roboto, Ubuntu, sans-serif`
**Data Font:** same family, with `font-variant-numeric: tabular-nums`.

One family carries everything — product UI does not pair fonts. Trebuchet MS
is the library's chart font and the category convention; using it for chrome
too keeps the terminal in one voice.

### Hierarchy
- **Title** (600, 13px, 1.4): toolbar buttons, panel headers, modal titles.
- **Body** (400, 13px, 1.4): list rows, panel body, default UI text.
- **Label** (600, 11px, 0.5px, UPPERCASE): column headers, field legends, the
  "ACTIVE" style markers. Used sparingly — not as an eyebrow above every
  section.
- **Data** (400, 12px, 1.3, tabular-nums): axis ticks, OHLC legend, watchlist
  last/Δ, any numeric value that must align in a column.

### Named Rules
**The Tabular-Data Rule.** Every numeric value that stacks vertically (prices,
Δ, volume, OHLC, axis ticks) uses `font-variant-numeric: tabular-nums`. Numbers
that don't align are broken.

**The No-Display-Font Rule.** No display fonts in UI labels, buttons, or data.
The one family is the whole system.

## 4. Elevation

Flat by default. Depth is conveyed by tonal layering, not shadow: Terminal
Black → Panel Slate → Elevated Slate. A surface one step lighter than its
parent reads as elevated without any shadow.

### Shadow Vocabulary
- **Modal lift** (`box-shadow: 0 10px 40px rgba(0,0,0,0.5)`): modals and the
  symbol-search dropdown only — the only elements that float above the
  terminal.
- **Popover** (`box-shadow: 0 2px 10px rgba(0,0,0,0.3)`): context menus and
  hover popovers that escape the chrome.

### Named Rules
**The Flat-By-Default Rule.** Surfaces are flat at rest. Shadow appears only on
elements that physically float above the terminal (modals, popovers). Panels,
cards, buttons, and rows are never shadowed.

## 5. Components

Every interactive component ships default / hover / focus-visible / active /
disabled. Focus is always `2px solid {colors.primary}` offset 2px (inherited
from the library base styles).

### Buttons
- **Shape:** 4px radius (`{rounded.md}`).
- **Primary:** Cosmic Indigo bg, white text, 6px 12px, 13px/600. Hover
  darkens to `#4f46e5`. Used for the one primary action per surface (e.g.
  "Create" in the alert dialog).
- **Ghost:** transparent bg, primary text, 6px 10px. Hover → Elevated Slate
  bg. The default toolbar button.
- **Icon:** 32px square, transparent, secondary-color icon. Hover → Elevated
  Slate bg + primary-color icon. Active → indigo 15% tint bg + indigo icon.
  The rail item and the toolbar glyph button.

### Chips
- **Style:** 3px radius, 1px 8px, 11px/600. Elevated Slate bg, primary text.
- **Up/Down variants:** 12% tint of up/down bg with up/down text, for Δ%
  chips. Carry `+` / `−` so direction is not color-only.

### Inputs
- **Style:** Terminal Black bg, primary text, 4px radius, 30px height, border
  Elevated Slate. Focus → indigo border + `0 0 0 2px rgba(99,102,241,0.2)`.
  Placeholder = secondary text (verify 4.5:1).

### Tabs
- **Style:** 36px height, 0 14px padding, 13px body. Inactive = secondary
  text. Active = primary text + 2px bottom Cosmic Indigo bar (bottom-dock
  tabs) or 3px left Cosmic Indigo bar + 15% tint (rail/sidebar tabs).

### Navigation (rail / sidebar strip)
- **Rail:** 60px fixed, icon 24px in a 44px hit area, 4px gap, 1px
  `rgba(255,255,255,0.06)` group divider. Hover → 4% white bg. Active →
  indigo 15% tint + 3px left indigo bar.
- **Sidebar strip:** 52px on the viewport's outer-right edge, icon + compact label. The panel body opens to its left and may collapse independently. Same active treatment.

### Panels
- **Shape:** 0–2px radius (nearly square). Panel Slate bg, 1px Elevated Slate
  border. Header 36px. Body padding 8–16px per density. No shadow.

### Signature: Chart Legend
Top-left DOM overlay on the chart. `SYMBOL · TF` then `O H L C` color-coded
per bar + `Δ%`. Indicator rows below: colored dot + name + args + value, with
eye/gear/X on row hover. Updates to the crosshair bar; reverts to latest on
crosshair leave.

## 6. Do's and Don'ts

### Do:
- **Do** reference `var(--astroneum-*)` for every chrome color so the shell
  tracks the library and the high-contrast theme.
- **Do** override `--astroneum-primary-color: #6366f1` once at the demo root to
  re-skin chart + chrome together.
- **Do** use `tabular-nums` on every stacked numeric value.
- **Do** carry `+` / `−` on every Δ chip so direction survives color blindness.
- **Do** keep the accent to ≤10% of any screen — one voice.
- **Do** ship every interactive state: default, hover, focus-visible, active,
  disabled.

### Don't:
- **Don't** use TradingView's wordmark, logo, marketing voice, or its exact
  blue `#2962ff`. Astroneum is its own instrument.
- **Don't** use gradient text, glassmorphism, side-stripe accent borders
  (`border-left` > 1px as color), or eyebrow kickers above sections.
- **Don't** use shadows on panels, cards, buttons, or rows — flat by default.
- **Don't** use display fonts in labels, buttons, or data.
- **Don't** animate layout properties beyond the shell's sidebar/dock resize or
  add decorative motion. State motion stays within 100-240ms, uses ease-out,
  and never delays chart data or page readiness.
- **Don't** color a surface with up-green or down-red — they carry direction,
  not decoration.
- **Don't** invent custom scrollbars, form controls, or modal patterns —
  standard affordances, executed precisely.
- **Don't** ship placeholder metrics or fake activity — real data or an honest
  empty state that teaches the interface.
