# Audit Report – 2025-07-21

## Executive Summary
This repository hosts a hybrid TypeScript and Python project aimed at automating code workflows and agent operations. Major modules include a VSCode extension, Python agent runners, microservers implementing a "Model Context Protocol" (MCP), and various cleanup and research tools. Overall the codebase is large (over 39k lines across ~200 files) and mixes concerns from UI components to backend services.

## Findings by Phase
### Domain Glossary
See `TERMS_GLOSSARY.md` for the full terminology list.

### Structural Inventory
- `src/` – TypeScript extension and core services (~16k LOC)【28e452†L7-L23】
- `mcp-servers/` – microservers written in TypeScript (~4k LOC)【28e452†L20-L32】
- `agents-system/` – Python agent framework (~2.4k LOC)【2a346b†L23-L32】
- `docs/` – documentation (~14k LOC)【adf666†L1-L18】
- `tools/` – helper utilities (~3k LOC)【3422bb†L1-L10】

Each directory was tagged:
- **Agent-Logic**: `agents-system`, `src/mcp`, `src/context`, `src/knowledge`
- **UI-Shell**: `src/components`, `designs`, `prompt-engineering`
- **Tool-Adapters**: `mcp-servers`, `src/services`, `scripts`
- **Services**: `mcp_server.py`, `start-*` scripts
- **Scripts**: various `.sh` and `.js` in repo root

### Dependency & Coupling Analysis
- `madge` and `pydeps` were executed to generate import graphs. TS graph required ~699ms while Python graph needed graphviz installation but produced results.
- Hard-coded service names include `ollama` in research commands【cfe336†L1-L3】 and `Notion` in `NotionService`【21f1ac†L1-L12】. These could be abstracted for provider neutrality.

### Quality Signals
- `npm test` fails due to multiple Jest configs【616064†L1-L12】.
- `npm run lint` fails because the `prettier` config is missing【3ca948†L1-L15】.
- TokenManager enforces a default daily limit of 5000 tokens and warns at 80% usage【30a957†L1-L78】.
- Synchronous file system operations in various scripts could block UI threads.

### Recommendations
1. **Rename Map**: avoid provider names – e.g., rename `NotionService` to `TaskService`; replace `ollama-deep-researcher-ts` references with a generic `research-service` identifier.
2. **Module Split Plan**: consider separating Python agent framework and VSCode extension into independent packages; microservers may live in a shared services repo.
3. **Quick Wins**: resolve lint/test configs; consolidate `KnowledgeGraph` vs `KnowledgeGraphManager`; deduplicate context managers across TS and Python.

