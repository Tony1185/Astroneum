---
description: Refresh STRUCTURE.md after structural changes — file tree, exports, deploy topology
agent: astroneum-doc-syncer
---
Refresh the structure doc to reflect recent changes.

Recent git changes:
!`git diff --name-only HEAD~3 HEAD`

Read @structure (docs/STRUCTURE.md) and update it per the §10 maintenance policy:

- File or directory added/removed/renamed
- New export added to src/index.ts
- PM2/port/nginx configuration change
- Build config or package.json edit
- New subpath export

Only update sections that are actually stale. Do not rewrite the whole doc.
Report what was changed.
