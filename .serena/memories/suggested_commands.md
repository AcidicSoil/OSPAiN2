# Suggested commands for OSPAiN2

## Package-level development commands
Run from the repository root unless noted otherwise.

- Install dependencies:
  - `npm install`
  - `pnpm install` (the lockfile and `packageManager` field indicate pnpm is preferred/expected in some workflows)
- Build TypeScript:
  - `npm run build`
- Run lint:
  - `npm run lint`
- Run tests:
  - `npm test`

## Direct script entrypoints mentioned in repo docs or root files
Use these when working on the corresponding subsystem.

- Context distribution pipeline:
  - `node context-runner.js`
  - `node context-distributor.js`
  - `node context-transition-manager.js`
  - `node context-visualization.js`
- Cleanup analysis:
  - `node cleanup-agent.js`
  - `node cleanup-agent.js --dry-run=true --age-threshold=60 --output=my-report.md`
- Frontend launcher wrapper:
  - `./start-app.sh`
  - Note: this expects an `OSPAiN2-hub-new` directory and then runs that app's package manager `run dev` command.

## Task-management/dev-mode commands documented in README
Availability depends on local setup and related tools being installed.

- Development mode switch:
  - `./development-modes/m switch maint "Running maintenance operations"`
- t2p examples:
  - `t2p todo add --priority 2 --horizon H1 --category "Documentation" --tags "docs" --title "Update API docs"`
  - `t2p todo list --priority 1 --status "in-progress"`

## Useful Linux shell commands
- `ls`, `find`, `grep`, `cd`, `pwd`, `cat`, `sed`, `awk`
- `git status`, `git diff`, `git log --oneline --decorate -n 20`
- `chmod +x <script>.sh` for executable shell scripts
- `python3 <script>.py` for Python utilities
- `node <script>.js` for JS utilities

## Recommended validation sequence after code changes
1. `npm run lint`
2. `npm test`
3. `npm run build`

Use narrower targeted test commands when appropriate via Jest, for example:
- `npx jest src/services/__tests__/NotionService.test.ts`
- `npx jest --runInBand`
