---
description: Refresh TODO.md and TODO-DESIGN.md gap backlogs after closing or finding gaps
agent: astroneum-doc-syncer
---
Refresh the gap backlogs to reflect recent work.

Recent git changes:
!`git diff --name-only HEAD~3 HEAD`

Read @gaps (docs/TODO.md) and @design-gaps (docs/TODO-DESIGN.md), then:

1. If a gap was closed (feature implemented), remove its row or mark it done.
2. If new gaps were discovered, add rows with status and next action.
3. If a UI element was added/changed/removed, update TODO-DESIGN.md accordingly.
4. Check @parity (tv-functions-skill.md §9) — if a catalog row pointer needs updating, note it.

Only update rows that are actually stale. Do not rewrite the whole doc.
Report what was changed.
