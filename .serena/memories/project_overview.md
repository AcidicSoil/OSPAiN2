# OSPAiN2 project overview

## Purpose
OSPAiN2 is a local-first Ollama ecosystem repository focused on agentic workflow automation, knowledge/context management, MCP-style tooling, and supporting utilities. The top-level README describes several subsystems: Horizon/OACL/research-level frameworks, cleanup tooling, context distribution/visualization, and a frontend referred to as OSPAiN2-Hub.

## Important caveat
The repository documentation describes a broader ecosystem than the root build configuration currently exposes. At the root, `package.json` is a Node/TypeScript package with a limited script surface (`build`, `test`, `lint`). Some runtime entrypoints are shell/JS scripts in the repo root rather than package scripts, and the frontend appears to live in a sibling/subdirectory (`OSPAiN2-hub-new`) that is referenced by `start-app.sh` but is not visible in the current root listing.

## Tech stack observed
- TypeScript (strict mode enabled)
- Node.js/CommonJS at the root package level
- Jest with ts-jest
- ESLint with `@typescript-eslint`
- Prettier
- Bash and PowerShell helper scripts
- Python helper/integration scripts (e.g. Notion-related scripts)
- Vue/React-related source folders and docs exist, but root package metadata does not fully reflect a frontend app dependency graph

## Rough structure
- `src/`: main application/library code
  - notable areas include `context/`, `knowledge/`, `knowledge-graph/`, `services/`, `rules/`, `cli/`, `mcp/`, `modes/`, `planning/`, `t2p/`, `components/`
- `docs/`: project and frontend documentation
- `scripts/` and many root-level `*.sh`, `*.ps1`, `*.js`: operational tooling and launch scripts
- `models/`: included in TypeScript compilation
- `test/`, `src/**/__tests__`, and `*.test.ts`: tests
- `mcp-servers/`, `agents-system/`, `tools/`: ecosystem support tooling

## Main code entry surface observed
- `src/index.ts` re-exports context, knowledge graph, services, rules, and absorption tool modules.
- Root operational scripts include things like `context-runner.js`, `cleanup-agent.js`, `start-app.sh`, `start-ospain-hub.sh`, and Notion-related startup scripts.

## Environment
- Linux project environment
- UTF-8 encoding
- Languages detected by Serena: TypeScript, Vue, Bash, Python
