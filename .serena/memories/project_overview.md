# OSPAiN2 project overview

## Current state summary
OSPAiN2 is a mixed-purpose local AI tooling repository centered on agentic workflows, context/knowledge systems, research tooling, Notion integrations, and a documented-but-not-fully-wired frontend effort. The repo still contains legacy Ollama-era branding in `README.md` and `package.json`, but the actual codebase has evolved into a broader runtime/orchestration platform with multiple subsystems.

## Important current caveats
- The top-level README is partially stale. It still frames the repo as an "Ollama Ecosystem Project" and documents some package scripts (for example cleanup-related `npm run ...` commands) that do not exist in the current root `package.json`.
- Frontend documentation exists under `docs/frontend/`, and there are React/TSX components in `src/components/`, but no visible top-level frontend app directory is present in the current root listing. `start-app.sh` still expects an `OSPAiN2-hub-new` directory.
- The repository is under active local modification on branch `chore/desloppify` with uncommitted changes present. As of the refresh, modified/new files include `package.json`, `pnpm-lock.yaml`, several Notion service files, research code, React components, and new TS type files.
- The repository layout has changed since the first onboarding snapshot: `mcp-servers/` is not present in the current root listing, while `dist/`, `node_modules/`, `logs/`, `.venv/`, `.desloppify/`, `.claude/`, `.archived/`, and `.gitnexus/` are now present.

## Tech stack observed
- TypeScript with `strict: true`
- Node.js/CommonJS at the root package level
- Jest with ts-jest
- ESLint with `@typescript-eslint`
- Prettier
- Bash and PowerShell operational scripts
- Python helper/integration scripts
- React/TSX components are present in `src/components/`
- `dompurify` is now included in root dependencies
- Both `package-lock.json` and `pnpm-lock.yaml` are present; the `packageManager` field still points to pnpm

## Rough structure
- `src/`: main code
  - notable active areas include `components/`, `research/`, `services/`, `services/notion/`, `rules/`, `context/`, `knowledge/`, `knowledge-graph/`, `cli/`, `modes/`, `planning/`, `t2p/`
- `docs/`: extensive documentation, including `docs/frontend/`
- `scripts/` and many root-level `*.sh`, `*.ps1`, `*.js`: operational tooling and launch scripts
- `models/`: model-related TypeScript code
- `test/`, `src/**/__tests__`, and `*.test.ts`: tests
- `agents-system/`, `tools/`, `startup/`, `development-modes/`, `t2p/`: ecosystem support tooling
- generated/runtime directories currently present: `dist/`, `node_modules/`, `logs/`, `.venv/`

## Main code entry surfaces observed
- `src/index.ts` still re-exports context, knowledge graph, services, rules, and absorption-related modules.
- Root operational scripts still include `context-runner.js`, `cleanup-agent.js`, `start-app.sh`, `start-ospain-hub.sh`, Notion-related helpers, and other maintenance scripts.
- Recent local changes suggest active work in Notion integration, research scanning, and React component/UI areas.

## Recent repo activity snapshot
Recent commits on the active branch include:
- `09ab681` Refactor project structure and remove deprecated files
- `7844211` Update project files and enhance documentation
- `6b2e007` Refactor project structure and enhance documentation
- `36fd1c8` Remove deprecated files and update `.gitignore` for project maintenance

## Environment
- Linux project environment
- UTF-8 encoding
- Languages detected by Serena: TypeScript, Vue, Bash, Python
