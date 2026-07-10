---
name: astroneum-doc-sync
description: Use after any structural, functional, or design change to the Astroneum library or demo. Refreshes the three living docs (STRUCTURE.md, TODO.md, TODO-DESIGN.md) and runs consistency checks. Also use when the user says refresh structure, refresh todo, or update docs.
---

# Astroneum Doc Sync

The Astroneum repo has three **living docs** with maintenance policies. They must be
updated whenever the codebase changes. This skill defines how to refresh them.

## The three living docs

| Doc | Path | What it tracks | Maintenance policy |
|---|---|---|---|
| STRUCTURE.md | `docs/STRUCTURE.md` | Where things live — file tree, deploy, build, config | §10 |
| TODO.md | `docs/TODO.md` | Function-gap backlog — one row per gap | Maintenance section |
| TODO-DESIGN.md | `docs/TODO-DESIGN.md` | Design/layout gap backlog — TV UI → Astroneum mirror | Maintenance section |

A fourth doc, `docs/tv-functions-skill.md` (the TV→Astroneum catalog), is the **status
authority**. Its §9 verification checklist should be run after catalog changes, but it
doesn't have a "refresh" workflow — it's updated row-by-row when a feature's status changes.

## When to refresh

### STRUCTURE.md (§10 triggers)
- File/dir added/removed/renamed under `src/`, `demo/src/`, `docs/`, `.github/`
- New/renamed export in `package.json` exports or `tsup.config.ts` entry
- New/changed PM2 process, port, or nginx route
- Version bump in `package.json`
- New dependency that changes the public surface
- New locale / widget / component / engine module / extension tool
- Build/tooling config edit (`tsup.config.ts`, `tsconfig.json`, `next.config.ts`, `ecosystem.config.cjs`, `.size-limit.json`, `eslint.config.js`)

### TODO.md (maintenance triggers)
- New/removed/renamed file under `src/`, `demo/src/`, `docs/`
- New/renamed export or entry
- New indicator / drawing tool / widget / engine module / extension
- New PM2 process, port, or nginx route
- New API route in `demo/src/app/api/`
- New DB table / auth / persistence layer
- New locale / i18n key batch
- New CI workflow / deploy step
- Alert / webhook / Pine / strategy / trading feature added or changed
- **When a gap is closed** — remove the row (it graduates to `tv-functions-skill.md` §3)

### TODO-DESIGN.md (maintenance triggers)
- UI/layout element added/changed/removed
- Shell region, toolbar, panel, dock, or navigator change
- New component in `demo/src/app/components/`
- Responsive behavior change

## How to refresh

1. **Re-scan the live tree** — use `glob` and `read` to inspect the current `src/`, `demo/src/`, `docs/`, config files.
2. **Diff against the doc** — compare what the doc says vs what actually exists.
3. **Patch the doc** — add/remove/update rows or sections. Preserve the doc's format and status legend.
4. **Append a changelog entry** — dated, one-line summary of what changed.
5. **Run consistency checks** (below).

## Consistency checks (run after every refresh)

### STRUCTURE.md
- [ ] `package.json` exports match `tsup.config.ts` entries match `dist/` files
- [ ] PM2 processes match `ecosystem.config.cjs`
- [ ] Ports table matches actual nginx/PM2 config
- [ ] File tree under `src/` matches actual directory listing
- [ ] `demo/src/app/` routes match actual directory listing

### TODO.md
- [ ] Every `❌` / `🔧` row hasn't been silently fixed (if fixed, remove row)
- [ ] `INDICATOR_COMPARISON.md` indicator count matches `src/engine/extension/indicator/`
- [ ] Cross-links to `tv-functions-skill.md` §3 still resolve
- [ ] Cross-links to `TODO-DESIGN.md` still resolve

### TODO-DESIGN.md
- [ ] Cross-links to `tv-functions-skill.md` §3 still resolve
- [ ] Cross-links to `TODO.md` still resolve
- [ ] `demo/src/app/components/` entries match actual files

### tv-functions-skill.md (§9 checklist)
- [ ] Every §3 catalog row has a `Status` and (where applicable) a `Pointer`
- [ ] Every `api-bridged` pointer resolves to a file that exists
- [ ] Every `native-chrome` pointer resolves to a planned/built file
- [ ] §5 widget flags match the config in `design-astroneum.md` §6

## Git workflow for doc changes

Docs-only changes don't need a build or restart:
```bash
git add docs/ && git commit -m "docs: refresh <STRUCTURE|TODO|TODO-DESIGN> after <change>"
git push origin
ssh 72.62.73.180 "cd /opt/astroneum && git pull"
```

## Commands

- `/refresh-structure` — refresh STRUCTURE.md only
- `/refresh-todo` — refresh TODO.md + TODO-DESIGN.md + consistency checks
