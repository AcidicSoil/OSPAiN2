# OSPAiN2 Code-base Audit – Master Task List
> Use this checklist to generate an exhaustive audit report.

## Phase 0 – Environment Prep
1. **Clone** `github.com/AcidicSoil/OSPAiN2` with full history.
2. **Scan** `.gitignore`, `docs/`, `scripts/`, and `mcp-servers/` to map non-source assets.

## Phase 1 – Domain Glossary
1. Build a **Terminology Table**: every domain term (e.g. *MCP*, *Master Player*, *KnowledgeGraph*) → short definition → primary source file.
2. Flag **ambiguous synonyms** (e.g. `KnowledgeGraph` vs `KnowledgeGraphManager`) and mark for rename.

## Phase 2 – Structural Inventory
1. Generate a **directory tree** with LOC counts (src, mcp-servers, vscode-extension, react UI, python agents).
2. Tag each module by **concern**: *Agent-Logic*, *UI-Shell*, *Tool-Adapters*, *Services*, *Scripts*.

## Phase 3 – Dependency & Coupling Analysis
1. Produce import graphs (TS + Python) to surface tight coupling.
2. List any **service names hard-coded** (e.g. `ollama`, `Notion`) for future abstraction.

## Phase 4 – Quality Signals
1. Lint & test coverage summary.
2. Token usage hotspots (look for `TokenManager` thresholds).
3. Performance choke points (e.g. synchronous FS calls in UI thread).

## Phase 5 – Recommendations
1. **Rename Map** – legacy terms → agnostic replacements.
2. **Module Split Plan** – which packages belong in a monorepo and why.
3. **Quick Wins** – low-risk refactors that unlock modularization.

## Deliverables
- `AUDIT_REPORT.md`
- `TERMS_GLOSSARY.md`
- `LLMS.txt` – one-line descriptions of every module (max 120 chars each) for fast LLM context loading.
