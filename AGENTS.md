> **You are an expert full-stack AI ecosystem architect.**
>
> My project, \[OSPAiN2 (GitHub: AcidicSoil/OSPAiN2)], is a local-first, agentic workflow automation platform integrating AI, task management, and knowledge graphs. I want a thorough re-architecture and refactor to leverage the latest stable tools and frameworks—**saving development time by using existing, well-maintained open-source solutions wherever possible.**
>
> ### Context:
>
> * **Current stack:** TypeScript, Node.js (Volta), React (migrating to Vite/T3), modular MCP servers, T2P engine, local knowledge graph.
> * **Core goals:** Local-first, data sovereignty, modular agent workflows, unified knowledge graph, extensible hub UI.
> * **Blockers:** Outdated dependencies (Create React App), frontend/backend coupling, slow integration pace, manual glue code.
>
> ### Requirements:
>
> 1. **Audit the project**: Identify all places where modern libraries/tools can replace custom code or legacy systems (e.g., agent orchestration, knowledge graph, UI, workflow engine).
> 2. **Recommend and justify**: For each core subsystem, recommend the *best modern open-source alternatives*, explaining why they’re optimal for local-first, sovereign AI platforms (e.g., for workflow orchestration, use \[Temporal.io] or \[n8n]; for frontend, \[Next.js] or \[Remix]; for knowledge graph, \[TerminusDB] or \[Weaviate] local).
> 3. **Design a new architecture diagram**: Show how all new technologies and integrations fit together (include modules, data flows, and extensibility points).
> 4. **Stepwise migration/refactor plan**: Lay out a migration roadmap from the current OSPAiN2 to the new architecture with milestones, quick wins, and risk management.
> 5. **Sample implementation stubs**: For key systems (frontend shell, agent orchestrator, knowledge graph integration), provide well-structured code stubs using the recommended stack.
> 6. **Manifest of reused OSS**: Create a table of adopted open-source solutions, version pinned, with links and reasons for selection.
> 7. **Document local-first and privacy aspects**: Highlight how the chosen tech stack and integrations meet the requirements for user sovereignty, offline-first usage, and auditability.
>
> ### Constraints:
>
> * All major systems must run **entirely local** (no cloud/SaaS dependencies unless self-hosted).
> * Prefer TypeScript across stack, but open to best-in-class tools in other languages if local/portable.
> * Focus on developer ergonomics, maintainability, and rapid extensibility.
>
> ---
>
> Please provide a full technical proposal, step-by-step migration guide, and sample code stubs for this new OSPAiN2 architecture.

---

**Key Improvements:**
• Explicitly calls for **modern, local-first replacements** for each custom/legacy subsystem
• Requires **justification and reasoning** for all tech stack choices
• Enforces **local-only/no-SaaS** constraints
• Includes **migration, code stubs, and architecture visualization**
• Provides a clear, audit-friendly manifest of open-source tools used

**Techniques Applied:**

* **Chain-of-thought** (task breakdown, rationale for each choice)
* **Constraint optimization** (local-first, privacy, developer velocity)
* **Architecture mapping**
* **Few-shot learning** (sample stubs, manifest templates)

**Pro Tip:**
*Share this prompt with advanced AI (ChatGPT-4, Claude 3, or Gemini 1.5+) for system-level architectural design, then use follow-up prompts to iterate on specific modules or implementation details. For the **manifest**, ask for comparisons (“Why not X vs Y?”) to ensure the stack is robust and future-proof.*
> **You are an expert full-stack AI ecosystem architect and technical documentation strategist.**
>
> My project, [OSPAiN2 (GitHub: AcidicSoil/OSPAiN2)], is a local-first, agentic workflow automation platform integrating AI, task management, and knowledge graphs. The system’s future depends on clear, agent-friendly, and human-friendly documentation to enable rapid onboarding, robust analysis, and future extensibility.
>
> ### Context:
>
> * **Current stack:** TypeScript, Node.js (Volta), React (migrating to Vite/T3), modular MCP servers, T2P engine, local knowledge graph.
> * **Core goals:** Local-first, data sovereignty, modular agent workflows, unified knowledge graph, extensible hub UI.
> * **Blockers:** Outdated dependencies (Create React App), frontend/backend coupling, slow integration pace, manual glue code.
>
> ---
>
> ## 📄 **Documentation Objectives**:
>
> 1. **Comprehensive module inventory**
>    - Systematically audit the codebase to extract all top-level modules, packages, and components.
>    - For each: document its purpose, primary responsibilities, key interfaces, and major dependencies in clear, plain English.
>
> 2. **Functional domain mapping**
>    - Explicitly identify and describe agent-centric subsystems:
>      - Memory (state, persistence, recall)
>      - Planning/decision logic (schedulers, evaluators, orchestrators)
>      - Evaluation/reasoning (scoring, feedback, error correction)
>      - Communication/adapters (I/O, integration, plugin points)
>      - Utility/toolkit layers (parsing, data handling, scheduling, etc.)
>
> 3. **Data & control flow**
>    - Map how data and control signals move through the system, using diagrams and concise bullet-lists.
>    - Document all extensibility points, plugin hooks, and API boundaries.
>
> 4. **Surface ambiguities & overlaps**
>    - Identify and flag any modules or layers with unclear, overlapping, or conflicting responsibilities.
>    - Suggest points for refactoring, clearer boundaries, or renaming.
>
> 5. **Manifest for open-source dependencies**
>    - Create a table (format: [Name, Version, Source URL, Role, Reason]) for all reused OSS solutions, pinning versions and justifying inclusion.
>
> 6. **Privacy & local-first design**
>    - For each subsystem, explain how local-first principles and data sovereignty are ensured.
>    - Clearly mark any system boundaries where cloud or network access is possible or required.
>
> 7. **Technical documentation structure**
>    - Organize all documentation in a `/docs` directory as Markdown files, using intuitive names (e.g., `architecture.md`, `modules.md`, `api.md`, `memory.md`, `extensibility.md`).
>    - Use consistent front-matter for easy agentic parsing (e.g., section type, summary, related modules).
>    - Prepare docs for static site deployment via MkDocs, Docusaurus, or similar SSGs.
>    - (Optional) Create a simple JSON index or MCP-style API endpoint for agent/AI access to docs.
>
> ---
## 📚 Documentation Curation Objectives

1. **Audit and inventory all Markdown and doc files in /docs and subfolders.**
2. For each doc:
    - Summarize its stated purpose and last known update.
    - Flag any that:
        - Are outdated, superseded, or reference deprecated/removed modules.
        - Duplicate information present elsewhere (recommend consolidation target).
        - Are incomplete, low-value, or speculative (recommend archive or removal).
        - Reference external services that are not local-first or aligned (e.g., Notion—suggest replacement).
    - Recommend one of: [Keep & Update, Merge, Archive, Remove, Replace, Rewrite].

3. **Build a /docs/updates.md or /docs/audit-summary.md**
   - Log every file with:
        - Recommended action and rationale.
        - Dependencies (what code/module does this doc relate to?).
        - Any urgent TODOs for critical, missing, or broken docs.

4. **Enforce a “living doc” approach:**
    - For every doc marked “Keep,” ensure it references current module names and architecture.
    - Move anything “Archive” to a /docs/legacy/ folder (don’t delete yet).
    - For “Merge,” specify exact doc merge targets.
    - For “Replace,” specify new tool/process (e.g., “Replace Notion references with Logseq or Obsidian”).


## 🧹 **Critical Curation & Refactoring Instructions**:

- During audit and documentation, you **must**:
    - Flag any module, function, or tool integration (e.g., Notion references) that appears outdated, poorly integrated, or inconsistent with the platform’s local-first, agentic mission.
    - For each flagged area:
        - Propose one of the following actions, with clear rationale:
            1. **Retain & Refactor:** Describe why it’s still valuable, and *how* it could be refactored to fit cohesively (including any architectural changes needed).
            2. **Replace:** Suggest a modern/local-first alternative, with justification (e.g., “Replace Notion with [Logseq](https://logseq.com/) for privacy, local graph support, extensibility”).
            3. **Remove:** If the code is redundant or a dead end, mark for excision and explain why.
    - Document *only* what survives this curation filter, unless otherwise instructed.
    - Maintain a living “Exclusions & Replacements” log (e.g., `exclusions.md` in `/docs`) listing what was flagged, the rationale, and proposed action (including alternatives).

- You are empowered to be ruthless but rational in your curation—do not preserve dead weight or half-integrated features without strong justification.

Example Log Entry (for Notion references):
## Exclusions & Replacements Log

### Flagged: Notion Integration
- **Location:** `/src/integrations/notion.ts`
- **Reason:** Notion is cloud-based, not local-first, and duplicates knowledge graph features already present.
- **Proposed Action:** Replace with Logseq or Obsidian integration, or remove entirely if redundant.
- **Status:** Pending review.

>
> ## 🚦 **Workflow & Output Requirements**:
>
> - **Begin by auditing and cataloguing the project as described.**
> - Produce documentation incrementally—commit each well-formed Markdown file as soon as a logical section is complete.
> - Structure all content to be clear to both human developers and AI agents (avoid jargon or “magic strings”; be explicit in definitions and boundaries).
> - Output a summary report listing completed docs, remaining gaps, and proposed next actions.
>
> ---
>
> ## **System Constraints:**
>
> * All major systems and docs must remain local-first (no SaaS/cloud dependency unless self-hosted).
> * Prefer TypeScript, Markdown, and open standards for all outputs and docs.
> * Prioritize maintainability, extensibility, and auditability.
>
> ---
>
> **Pro Tip:**
> After initial doc generation, request architectural critique, module overlap analysis, or migration roadmaps from an advanced agent to further refine the project.
