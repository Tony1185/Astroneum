---
description: Run the full verify gate — lint, typecheck, build, test. Fix any failures.
---
Run the Astroneum verify gate. This is non-negotiable before any deploy.

!`pnpm verify`

If it passes, report success. If it fails:
1. Read the error output carefully.
2. Categorize the failure (lint / typecheck / build / test).
3. Fix the issue in the source code.
4. Re-run `pnpm verify`.
5. Repeat until it passes.

Do not deploy until verify passes.
