# Terms Glossary
| Term | Definition | Primary Source | Notes |
|------|-----------|----------------|-------|
| Agent Runner | Main orchestration loop coordinating agent tasks | agents-system/src/agents_system/core/manager.py | - |
| MCP Server | Micro service implementing Model Context Protocol | mcp-servers/shared/mcp-server.ts | Python version in mcp_server.py |
| Knowledge Graph | Graph-based semantic chunk index | src/knowledge/KnowledgeGraph.ts | - |
| KnowledgeGraphManager | VSCode manager for knowledge graph operations | src/knowledge-graph/KnowledgeGraphManager.ts | Possible rename to avoid confusion with KnowledgeGraph |
| Development Mode | Enum for design/engineering/testing/deployment/maintenance | src/modes/ContextManager.ts | - |
| Horizon Map | Mapping of tasks across H1/H2/H3 horizons | @horizon-map.mdc | - |
| TokenManager | Tracks token usage and rate limits | src/token-management/TokenManager.ts | - |
| EnhancedContextManager | VSCode context store with events | src/context/EnhancedContextManager.ts | Overlaps with ContextManager |
| ContextManager | Manages development mode context state | src/modes/ContextManager.ts | Overlaps with EnhancedContextManager |
| CleanupAgent | Recursive codebase analyzer for stale files | cleanup-agent.js | - |
| CleanupSystem | CLI wrapper around CleanupAgent and horizon features | cleanup-system.js | - |
| Master Player | Command system for running tasks | agents-system/src/agents_system/core/master_player.py | - |
| MCPServerManager | Starts and monitors multiple MCP servers | mcp_server.py | - |
| Absorption Tool | Summarizes and absorbs code snippets | src/tools/absorption | - |
| NotionService | Adapter for Notion API via MCP server | src/services/NotionService.ts | Python counterpart notion_proxy.py |
| TodoManager | React component for task tracking | src/components/todo/TodoManager.tsx | Works with NotionService |
| T2P CLI | Terminal utility for tasks and research | t2p/src | - |
