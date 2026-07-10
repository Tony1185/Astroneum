# Product

## Register

product

## Users

Professional crypto and futures traders. They sit at a desk, often in a dim
room, watching real-time price action across multiple timeframes and symbols.
Their job is to read the market fast and act: spot the level, confirm with an
indicator, place the alert, manage the position. They are fluent in the
category's best tools (TradingView is their lingua franca) and they trust an
interface only when every component behaves exactly as expected — no surprises,
no invented affordances, no choreography that delays the read. They scan, they
don't read.

## Product Purpose

The Astroneum demo (`/astroneum/`) is the reference terminal for the Astroneum
charting library. It exists to prove the library delivers TradingView-class
charting out of the box — full terminal layout, every standard panel, real
crypto data, no licensing fees. Success: a trader fluent in TradingView sits
down and within seconds forgets they are not in TradingView, while noticing the
chart is fast and the chrome stays out of the way. The demo is also the
library's shop window: every widget the library ships should be visible and
wired here.

## Brand Personality

Precise. Calm. Cosmic-clinical.

Astroneum is named for the stars, but it is an instrument, not a spectacle.
The brand voice is the voice of a well-made tool: quiet, exact, confident
without volume. The accent is a deep cosmic indigo — one note of color in an
otherwise neutral dark terminal. No enthusiasm, no hype, no "boost your
productivity." The interface speaks in data and state, not adjectives.

## Anti-references

- **TradingView impersonation.** Mirror the layout, the interaction patterns,
  the density, the keyboard logic — never the wordmark, the logo, the marketing
  voice, or the exact brand blue. Astroneum is its own instrument.
- **AI slop tells.** Purple gradients, gradient text, glassmorphism as default,
  side-stripe accent borders, identical card grids, the hero-metric template,
  tiny uppercase tracked eyebrows above every section, numbered `01/02/03`
  scaffolding. None of these belong in a trading terminal.
- **Generic SaaS marketing dressing.** "Supercharge your trading," neon
  accents, celebratory motion, fake growth metrics, glassy hero cards. A
  terminal is a tool, not a landing page.
- **Decorative motion.** Anything that animates for animation's sake. Motion
  conveys state here, full stop.
- **Invented affordances.** Custom scrollbars, weird form controls,
  non-standard modals, display fonts in labels. Standard patterns, executed
  precisely.

## Design Principles

1. **Earned familiarity.** The tool disappears into the task. A trader fluent
   in TradingView should trust it on sight — not because it copies TradingView,
   but because every component behaves the way the category trained them to
   expect.
2. **Density without noise.** Traders need many signals on screen at once. Pack
   the information, not the chrome. Whitespace is for resting the eye between
   data, not for looking spacious.
3. **One voice.** A single accent (Cosmic Indigo) carries every primary action,
   selection, and active state. It appears on ≤10% of any screen; its rarity
   is what makes it read as signal.
4. **Honesty.** Real data, real state, real numbers. No placeholder metrics, no
   fake activity, no loading theater. If something is empty, say what would
   fill it.
5. **Calm motion.** 100–200ms state transitions, ease-out, no bounce, no
   orchestrated page loads. A trader in flow never waits for choreography.

## Accessibility & Inclusion

- **WCAG AA** as the floor. Body text ≥4.5:1 against its background; large text
  and data ≥3:1. The library already ships a high-contrast theme — the terminal
  chrome inherits and respects it.
- **Color-blind safety.** Up/down must never rely on green/red alone. The
  library's `#26a69a` / `#ef5350` pair is distinguishable for most
  deuteranopia/protanopia; augment with icon or sign where a value's direction
  is the only cue (Δ chips carry `+` / `−`).
- **Reduced motion.** Every transition has a `prefers-reduced-motion: reduce`
  fallback (instant or crossfade). No reveal gated on a class trigger.
- **Keyboard first.** Every terminal action reachable by keyboard. Symbol
  search, timeframe, drawing tools, panel toggles, replay, undo/redo all have
  documented shortcuts.
- **Focus visibility.** 2px solid accent focus ring, offset 2px, on every
  interactive element — already enforced by the library's base styles.
