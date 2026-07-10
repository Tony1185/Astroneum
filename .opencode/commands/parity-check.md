---
description: Check TradingView-to-Astroneum feature parity status — 6-bucket taxonomy + indicator table
agent: astroneum-parity-checker
---
Produce a parity status report for Astroneum vs TradingView.

Read @parity (docs/tv-functions-skill.md) for the 6-bucket taxonomy and @indicator-parity (INDICATOR_COMPARISON.md) for the 50-indicator table.

Report:
1. **Function parity** — count of items per bucket, list of `native-chrome` and `v1-in-scope` gaps
2. **Indicator parity** — X/50 implemented, list of missing indicators
3. **Recommended next builds** — top 5 gaps to close, sorted by impact
