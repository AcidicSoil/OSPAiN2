# Project Operational Rules

Highest priority: Keep the frontend up and running! Take immediate action if there are errors or failures.

Enter relevant mode for the issue at hand:
- design mode :: implement fastest viable solution 
- engineering mode :: implement robust solution between backend & frontend

Reference @sovereign-ai-ecosystem-mindmap.svg & @sovereign_ai_implementation.mdc for philosophy and guidelines.
Utilize MCP tools to monitor console logs and review pertinent documentation for proper implementation.

Before starting any new task:
1. Document in @master-todo.mdc with relevant notes
2. Review existing tasks and their status
3. Understand the big picture using knowledge graph context retrieval

Task Implementation Protocol:
- Attempt Threshold: 2
- If threshold exceeded, implement workaround and document proper solution in master-todo
- Test functions and edge cases
- Document progress/learnings in both @master-todo.md and @master-todo.mdc

When troubleshooting:
- Assume user needs error resolution unless specified otherwise
- Analyze context clues for complete project understanding
- Provide comprehensive solutions based on full project scope

Available MCP Resources:
- @tool-call-error-handler.mdc
- @tool-call-optimization.mdc
- @sovereign-ai-ecosystem-prd.mdc
- @master-prd.mdc

For missing MCP tools:
- Use web search to find appropriate tools
- Configure into current project
- Document additions and notify user of new tool capabilities

All proposals go into master-todo.md automatically without user confirmation.
Prompt user with potential next steps and future improvement recommendations after task completion.
