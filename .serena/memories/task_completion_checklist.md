# Task completion checklist

Use this as the default completion workflow for code changes in OSPAiN2.

## Minimum checks
1. Run `npm run lint`
2. Run `npm test`
3. Run `npm run build`

## When applicable
- Run a targeted Jest test for the affected module or service
- Run the relevant entry script if the task touches an operational workflow (for example a CLI, cleanup tool, context runner, or startup script)
- If editing shell scripts, verify path assumptions and executable permissions
- If editing Python/Notion integration scripts, run the narrowest related script/test available

## Completion reporting expectations
When reporting work, distinguish clearly between:
- implemented
- validated by lint/test/build
- partially validated
- not validated

## Repo-specific caveats
- Some documented subsystems are broader than the root package scripts expose. Validation may need to happen through direct `node ...` or shell-script entrypoints rather than `npm run ...`.
- The frontend launcher (`start-app.sh`) depends on an external/adjacent `OSPAiN2-hub-new` directory; do not assume frontend validation is possible from the current root alone.

## Safe default order
- inspect affected files and neighboring tests
- implement the smallest effective change
- run targeted validation first
- run repo-level lint/test/build if the impacted area is covered by the root toolchain
- report any gaps or blockers explicitly
