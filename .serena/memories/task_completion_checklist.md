# Task completion checklist

Use this as the default completion workflow for code changes in OSPAiN2.

## Before editing
1. Check current branch and dirty state:
   - `git status --short`
   - `git log --oneline --decorate -n 5`
2. Inspect affected files and neighboring tests before changing code
3. Verify whether the subsystem is current or legacy/stale by comparing code with docs

## Minimum checks after changes
1. Run the narrowest relevant validation first
2. Run root validation when applicable:
   - `npm run lint`
   - `npm test`
   - `npm run build`

## When applicable
- Run a targeted Jest test for the affected module or service
- Run the relevant entry script if the task touches an operational workflow (for example a CLI, cleanup tool, context runner, or startup script)
- If editing shell scripts, verify path assumptions and executable permissions
- If editing Python/Notion integration scripts, run the narrowest related script/test available
- If editing React/TSX components, also validate any directly related service or type-layer changes

## Completion reporting expectations
When reporting work, distinguish clearly between:
- implemented
- validated by lint/test/build
- partially validated
- not validated

## Repo-specific caveats
- The root README contains stale commands and branding. Treat the current root `package.json` and actual files/scripts as the source of truth for validation.
- The workspace may already contain unrelated local modifications. Do not over-attribute existing changes to the current task.
- The frontend launcher (`start-app.sh`) depends on an external/adjacent `OSPAiN2-hub-new` directory; do not assume frontend validation is possible from the current root alone.

## Safe default order
- inspect current repo state
- inspect affected code and tests
- implement the smallest effective change unless the task explicitly calls for an overhaul
- run targeted validation first
- run repo-level lint/test/build if the impacted area is covered by the root toolchain
- report any validation gaps, stale docs, or workspace-state blockers explicitly
