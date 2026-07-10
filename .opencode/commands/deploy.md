---
description: Deploy Astroneum changes to the server — git pull, build, PM2 restart, HTTP 200 verify
agent: astroneum-deployer
---
Deploy the latest pushed changes to the server at 72.62.73.180.

Check what changed since the last deploy:
!`git log --oneline -5`

Then run the full deploy flow:
1. Git pull on server
2. Library build (`pnpm build`) — skip if only demo files changed
3. Demo build (`pnpm --filter astroneum-demo-next build`) — skip if only docs changed
4. PM2 restart `astroneum-demo`
5. Verify HTTP 200 on `https://72.62.73.180/astroneum/`

Report the result. If any step fails, show the error output.
