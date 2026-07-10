---
name: astroneum-deploy
description: Use when deploying Astroneum library or demo changes to the server at 72.62.73.180. Covers the git-pull to build to PM2 restart to HTTP 200 verification flow. Also use when the user says deploy, ship, publish, or restart astroneum.
---

# Astroneum Deploy

Deploy changes from the local clone to the live server at `https://72.62.73.180/astroneum/`.

## Prerequisites

- Local changes committed and pushed to `origin` (`Tony1185/Astroneum`).
- `pnpm verify` passed locally (or at minimum `pnpm typecheck`).
- SSH access to `72.62.73.180` as `deploy` (key auth via `~/.ssh/id_ed25519`).

## Deploy flow (library change)

If you changed anything under `src/` (library source):

```bash
# 1. Pull latest on server
ssh 72.62.73.180 "cd /opt/astroneum && git pull"

# 2. Build the library (tsup + css) — ~10-30s
ssh 72.62.73.180 "cd /opt/astroneum && pnpm build"

# 3. Build the demo app (picks up new dist/) — ~3-5 min, raise timeout to 300000
ssh 72.62.73.180 "cd /opt/astroneum && pnpm --filter astroneum-demo-next build"

# 4. Restart the demo process
ssh 72.62.73.180 "pm2 restart astroneum-demo"

# 5. Verify HTTP 200
ssh 72.62.73.180 "curl -sk -o /dev/null -w '%{http_code}' https://72.62.73.180/astroneum/"
```

Expected: `200`. If not 200, check `pm2 logs astroneum-demo --lines 50 --nostream`.

## Deploy flow (demo-only change)

If you only changed files under `demo/src/` (no `src/` touched):

```bash
ssh 72.62.73.180 "cd /opt/astroneum && git pull"
ssh 72.62.73.180 "cd /opt/astroneum && pnpm --filter astroneum-demo-next build"
ssh 72.62.73.180 "pm2 restart astroneum-demo"
ssh 72.62.73.180 "curl -sk -o /dev/null -w '%{http_code}' https://72.62.73.180/astroneum/"
```

Skip the library build step.

## Deploy flow (docs-only change)

No build, no restart. Just push — docs are not served by the demo app.

```bash
ssh 72.62.73.180 "cd /opt/astroneum && git pull"
```

## What NOT to touch

- `trading-bot-web` (PM2, port 3000) — separate project.
- `trading-bot-ws` (PM2, port 3001) — separate project.
- nginx config — unless explicitly asked.
- Postgres / Docker — Astroneum has no DB.

## Troubleshooting

- **HTTP not 200**: `ssh 72.62.73.180 "pm2 logs astroneum-demo --lines 50 --nostream"`
- **Build fails**: check `pnpm verify` output — likely a type error or missing dep.
- **PM2 process errored/stopped**: `ssh 72.62.73.180 "pm2 restart astroneum-demo"` — if it won't start, check memory (`max_memory_restart: 512M`).
- **High restart count**: `astroneum-demo` autorestarts on crash. Only worry if status is `errored` or `stopped` (TODO §9.3).
- **Git pull conflict**: server should be a clean clone. If local changes exist on server, `git stash` before pull.

## PM2 quick reference

```bash
ssh 72.62.73.180 "pm2 list"                              # status of all processes
ssh 72.62.73.180 "pm2 logs astroneum-demo --lines 80 --nostream"  # recent logs (non-blocking)
ssh 72.62.73.180 "pm2 restart astroneum-demo"            # restart
ssh 72.62.73.180 "pm2 status astroneum-demo"             # status only
```

Logs: `/home/deploy/.pm2/logs/astroneum-demo-{out,error}.log`
