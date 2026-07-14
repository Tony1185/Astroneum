# Astroneum — Next.js Demo

A Next.js 15 + React 19 demo for the [astroneum](https://github.com/kowito/astroneum) charting library.

## Getting started

```bash
# 1. Build the library first (from the repo root)
cd ..
pnpm install
pnpm build

# 2. Install demo deps
cd demo
pnpm install

# 3. Start the dev server
pnpm dev        # Next.js prints the active local URL
```

## Data Source

The demo uses astroneum's built-in standard crypto datafeed (`createStandardCryptoDatafeed`).

- Binance USD-M futures
- Bitget USDT futures
- OKX USDT swap
- Batched 24-hour quote snapshots for the visible watchlist

## Features

- Trading terminal shell with chart, drawing rail, bottom dock, and persistent outer-right sidebar strip
- Watchlist/Details/News panel with horizontal lists, validated symbol search, live sortable columns, view presets, list colors, context actions, and cross-list symbol drag
- Binance, Bitget, and OKX symbols with history, live candles, and 2-second visible-watchlist quote polling
- Alerts panel and unified alert creation
- Pine editor and strategy reports in a resizable/maximizable bottom dock
- Multi-chart layouts, replay controls, indicators, drawing tools, date-range navigation, and command palette
- Dark/light/high-contrast terminal tokens with keyboard focus and reduced-motion behavior

## Next.js notes

- `AstroneumChart` uses canvas + React hooks → rendered inside a `'use client'` component (`ChartDemo.tsx`)
- `astroneum/style.css` is imported inside the client component
- `transpilePackages: ['astroneum']` in `next.config.ts` ensures the ESM-only library is bundled correctly by Next.js
