# MCP (Model Context Protocol) Setup Guide for OSPAiN2

This guide provides instructions for setting up and configuring Model Context Protocol (MCP) servers with Cursor IDE, which will enhance your AI assistant capabilities.

## What is MCP?

MCP (Model Context Protocol) allows AI assistants like Claude in Cursor to access external tools and information sources. These tools can search the web, access local files, run commands, and much more, making your AI assistant more capable.

## Configuring Your Ollama Models

I've updated your `.continue/config.json` file with the following Ollama model mappings for different use cases:

| Model | Title | Use Case |
|-------|-------|----------|
| `mistral` | Mistral (General Chat) | General conversation and assistance |
| `llama3.2` | Llama 3.2 (General Assistant) | General writing and reasoning tasks |
| `deepseek-coder:33b` | DeepSeek 33B (Code Generation) | Complex code generation and understanding |
| `codellama:34b` | CodeLlama 34B (Code Assistance) | Code explanations and improvements |
| `hermes3:8b` | Hermes 8B (Quick Tasks) | Fast responses for simple tasks |
| `deepseek-r1:32b-qwen-distill-q4_K_M` | DeepSeek R1 (Research) | Research and complex reasoning |

## New Slash Commands

I've also added useful slash commands to your config:

- `/explain` - Explain selected code in detail
- `/optimize` - Optimize selected code for performance
- `/refactor` - Refactor code for better readability
- `/unittest` - Generate unit tests for selected code
- `/docs` - Generate documentation for selected code
- `/fix` - Find and fix issues in the selected code
- `/security` - Review code for security vulnerabilities

## Setting Up MCP Servers

### Installation Instructions

1. Install the required Node.js packages:
   ```bash
   npm install -g @modelcontextprotocol/server-sequential-thinking
   npm install -g @mzxrai/mcp-webresearch
   ```

2. To configure MCP servers in Cursor:
   - Open Cursor
   - Go to Settings > Features
   - Scroll down to the "MCP Servers" section
   - Click "Add MCP Server"
   - Fill in the details for each server

### Recommended MCP Servers

Here are some recommended MCP servers to set up:

#### 1. Web Research
- **Name**: Web Research
- **Type**: command
- **Command**: `npx -y @mzxrai/mcp-webresearch@latest`

#### 2. Sequential Thinking
- **Name**: Sequential Thinking
- **Type**: command
- **Command**: `npx -y @modelcontextprotocol/server-sequential-thinking`

#### 3. GitHub Integration
- **Name**: GitHub
- **Type**: command
- **Command**: `env GITHUB_PERSONAL_ACCESS_TOKEN=<your_token> npx -y @modelcontextprotocol/server-github`

#### 4. Brave Search (requires API key)
- **Name**: Brave Search
- **Type**: command
- **Command**: `env BRAVE_API_KEY=<your_api_key> npx -y @modelcontextprotocol/server-brave-search`

#### 5. SearXNG for Private Search
- **Name**: SearXNG
- **Type**: command
- **Command**: `npx -y @kevinwatt/mcp-server-searxng`

## Alternative Configuration via Config File

As an alternative to the UI configuration, you can set up MCP servers via a config file at:

Windows: `%LOCALAPPDATA%\cursor-mcp\config\config.json`

Example configuration:
```json
{
  "mcpServers": {
    "Sequential Thinking": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"]
    },
    "Web Research": {
      "command": "npx",
      "args": ["-y", "@mzxrai/mcp-webresearch@latest"]
    },
    "GitHub": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "<your_token>"
      }
    }
  }
}
```

## Popular MCP Servers for Development

Here are some other useful MCP servers for development:

1. **Code Research**: https://github.com/nahmanmate/code-research-mcp-server
   - Stack Overflow, MDN Web Docs, GitHub, npm, PyPI integration

2. **Screenshot**: https://github.com/kazuph/mcp-screenshot
   - OCR and screenshot capabilities

3. **Omnisearch**: https://github.com/spences10/mcp-omnisearch
   - Unified search across multiple engines

4. **Database Manager**: https://github.com/jbdamask/cursor-db-mcp
   - Database exploration and interaction

5. **Memory Assistant**: https://github.com/mem0ai/mem0-mcp
   - Contextual memory for conversations

6. **Meilisearch**: https://github.com/meilisearch/meilisearch-mcp
   - Powerful search operations

## Recommended AI Rules for MCP

Add these to your AI settings in Cursor (Settings > Features > Rules for AI):

```
When you need to research or find current information, use the Web Research MCP tool to search for up-to-date information before providing answers.

For complex problem-solving tasks, use the Sequential Thinking MCP tool to break down problems methodically before implementing solutions.

Check GitHub issues and Stack Overflow using the Code Research tool when troubleshooting errors or bugs to find community solutions.
```

## Troubleshooting

If an MCP server isn't working:

1. Make sure Node.js and npm are properly installed and up to date
2. Try using the full path to `npx` (run `which npx` in terminal to find it)
3. Check for any error messages in the terminal window that opens
4. Restart Cursor after configuration
5. Use environment variables for API keys with the format: `env KEY=value command` 