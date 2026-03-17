# Suggested commands for OSPAiN2

## Package-level development commands
Run from the repository root unless noted otherwise.

### Install dependencies
- `pnpm install`
- `npm install`

Notes:
- `packageManager` points to pnpm and a `pnpm-lock.yaml` is present.
- `package-lock.json` is also present, so mixed package-manager history exists. Prefer whichever matches the current branch workflow, but do not assume lockfiles are fully normalized.

### Validate the root TypeScript package
- `npm run lint`
- `npm test`
- `npm run build`

Equivalent pnpm forms should also work if the local branch is using pnpm:
- `pnpm lint`
- `pnpm test`
- `pnpm build`

## Direct script entrypoints actually present in the repo
Use these when working on the corresponding subsystem.

### Context / workflow tooling
- `node context-runner.js`
- `node context-distributor.js`
- `node context-transition-manager.js`
- `node context-visualization.js`

### Cleanup tooling
- `node cleanup-agent.js`
- `node cleanup-agent.js --dry-run=true --age-threshold=60 --output=my-report.md`
- `node cleanup-system.js`

Important: the README documents extra cleanup package scripts, but those script names are not currently present in the root `package.json`.

### Frontend launcher wrapper
- `./start-app.sh`

Important: this script still expects an `OSPAiN2-hub-new` directory and then runs that app's package manager `run dev` command.

### Notion / Python helpers
- `python3 create_notion_database.py`
- `python3 notion_test_suite.py` if present in the working tree for the task
- `python3 notion_proxy.py` only if the file exists on the current branch/worktree

### Shell utilities
- `./start-ospain-hub.sh`
- `./start-ospain-hub-fast.sh`
- `./system-status.sh`
- `./install-dependencies.sh`

## Useful Linux shell commands
- `git status --short`
- `git diff --stat`
- `git log --oneline --decorate -n 20`
- `ls`, `find`, `grep`, `cd`, `pwd`, `cat`, `sed`, `awk`
- `python3 <script>.py`
- `node <script>.js`
- `chmod +x <script>.sh`

## Recommended validation sequence after code changes
1. Check current workspace state first: `git status --short`
2. Run the narrowest relevant validation for the touched area
3. Run root validation when applicable:
   - `npm run lint`
   - `npm test`
   - `npm run build`
4. If editing script-driven subsystems, run the relevant `node ...` or shell entrypoint directly

## Targeted validation examples
- `npx jest src/services/__tests__/NotionService.test.ts`
- `npx jest src/modes/__tests__/ContextManager.test.ts`
- `npx jest --runInBand`

## Current repo-state reminder
The workspace is currently dirty on branch `chore/desloppify`. Do not assume commands are being run on a clean main-branch checkout.
