# Style and conventions

## Formatting
The repository has an explicit Prettier configuration:
- semicolons enabled
- single quotes
- trailing commas enabled
- print width 100
- tab width 2
- no tabs
- bracket spacing enabled
- `arrowParens: always`
- `endOfLine: lf`

## TypeScript conventions from config
- `strict: true` in `tsconfig.json`
- CommonJS module output at root package level
- `esModuleInterop: true`
- declaration output enabled
- tests and Node typings included

## ESLint conventions
- `eslint:recommended` + `plugin:@typescript-eslint/recommended`
- explicit function return type is a warning (`@typescript-eslint/explicit-function-return-type`)
- `any` is allowed (`@typescript-eslint/no-explicit-any` is off)
- unused variables warn, but arguments prefixed with `_` are ignored
- `console` usage warns except `console.warn` and `console.error`

## Naming and organization patterns observed
- Classes and managers typically use PascalCase filenames and exports (for example `KnowledgeGraph.ts`, `EnhancedContextManager.ts`, `RuleValidator.ts`, `NotionService.ts`)
- React components use TSX and PascalCase component filenames in `src/components/`
- test files use `*.test.ts` and often live either in `__tests__` folders or adjacent test folders
- source code is organized by domain/subsystem (`services`, `rules`, `context`, `knowledge`, `cli`, `modes`, `research`, `components`, etc.)
- root-level operational scripts use descriptive kebab-case filenames (for example `start-app.sh`, `cleanup-logs.sh`)

## Documentation/PR conventions from `AGENTS.md`
- Keep communication concise and engineering-focused
- Avoid embedding secrets
- Follow Conventional Commits style for PR/change descriptions (`feat:`, `refactor:`, etc.)
- Focus on architecture and code quality rather than branding/UX copy in agent-style outputs

## Practical guidance
When editing code in this repo:
- preserve the existing domain-oriented directory structure
- keep TypeScript changes compatible with strict mode
- maintain single-quote/semi/trailing-comma formatting
- prefer small, scoped changes over broad rewrites unless the task explicitly calls for structural overhaul
- expect mixed legacy and in-progress modernization work; verify neighboring files before assuming a subsystem is current
- when touching React/UI files, also inspect adjacent services and types, because current local work spans components, research, Notion services, and supporting TS type files

## Current-state caution
Legacy branding and architecture terminology in docs may not reflect the actual implementation direction. Prefer repository structure and active files over README wording when deciding local conventions.
