# Terminal Configuration for Ollama Ecosystem

## Environment Details

- OS: Windows 10.0.26100
- Default Shell: Git Bash (C:\Program Files\Git\bin\bash.exe)
- Workspace Path: /c%3A/Users/comfy/Projects

## Preferred Terminal

Based on the environment, we'll use **Git Bash** as our primary terminal for this project. Git Bash provides Unix-like command functionality in Windows environments.

## Common Commands

### Repository Setup

```bash
# Clone the mcp-knowledge-graph repository
git clone https://github.com/shaneholloman/mcp-knowledge-graph.git
cd mcp-knowledge-graph

# Install dependencies
npm install
```

### MCP Server Management

```bash
# Build the TypeScript project
npm run build

# Start the MCP server (HTTP mode - not recommended for Cursor integration)
node dist/index.js --port 3000 --memory-path ./data/memory.jsonl

# Start the MCP server (stdio mode - recommended for Cursor integration)
node dist/index.js --memory-path ./data/memory.jsonl
```

### Cursor MCP Configuration

To configure Cursor to use the MCP server:

1. Open the `.cursor/mcp.json` file
2. Add a new server entry in the "servers" array:
   ```json
   {
     "name": "Knowledge Graph",
     "type": "command",
     "command": "node",
     "args": [
       "/c/Users/comfy/Projects/mcp-knowledge-graph/dist/index.js",
       "--memory-path",
       "./data/memory.jsonl"
     ],
     "description": "MCP server for knowledge graph and entity relationship management"
   }
   ```
3. Add tools that use this server in the "tools" array

## MCP Server Types

### stdio vs HTTP Servers

MCP servers can operate in two modes:

1. **stdio Mode (Recommended for Cursor)**

   - Communicates via standard input/output
   - No HTTP server component
   - Directly integrated with Cursor
   - Output: "Knowledge Graph MCP Server running on stdio"
   - Configuration type: "command"

2. **HTTP/SSE Mode**
   - Runs as an HTTP server with Server-Sent Events (SSE)
   - Requires a port parameter
   - Useful for debugging or external access
   - Configuration type: "sse"

For Cursor integration, the stdio mode is preferred as it's more efficient and secure.

## Known Issues

- Windows Git Bash may have issues with jq syntax in certain commands
- When running npm commands, use `npm.cmd` instead of `npm` if you encounter "command not found" errors
- Use double quotes for Windows paths to avoid escaping issues
- The server.js entry point doesn't exist; use index.js instead

## Testing Commands

Test commands in the test directory before using them in production:

```bash
mkdir -p test
cd test
# Test commands here
```

## MCP Knowledge Graph Server

### Repository Structure

The MCP Knowledge Graph server repository should have the following structure:

```
mcp-knowledge-graph/
├── data/               # Directory for memory storage
│   └── memory.jsonl    # Memory file (created automatically)
├── dist/               # Compiled JavaScript files
│   ├── index.js        # Main entry point
│   └── index.d.ts      # TypeScript declarations
├── src/                # Source TypeScript files
│   └── index.ts        # Main source file
├── package.json        # Project configuration
└── tsconfig.json       # TypeScript configuration
```

### Building and Running

```bash
# Navigate to the repository
cd mcp-knowledge-graph

# Install dependencies (first time only)
npm install

# Build the TypeScript project
npm run build

# Run in stdio mode (for Cursor integration)
node dist/index.js --memory-path ./data/memory.jsonl

# Run in HTTP mode (for debugging)
node dist/index.js --port 3001 --memory-path ./data/memory.jsonl
```

### Troubleshooting

If you encounter issues with the MCP Knowledge Graph server:

1. **Missing dist/index.js**

   - Check if the TypeScript files have been compiled
   - Ensure the src directory contains the index.ts file
   - Run `npm run build` to compile the TypeScript files

2. **Server not starting**

   - Verify the correct path to the entry point (`dist/index.js`)
   - Ensure the data directory exists
   - Check for error messages in the console

3. **Cursor not connecting**
   - Verify the server configuration in `.cursor/mcp.json`
   - Ensure the server is running in stdio mode
   - Check the path to the index.js file in the args array

# Terminal Usage Guide

This document provides information about using the Cursor CLI tool in different terminal environments.

## Supported Terminals

The Cursor CLI tool has been tested and confirmed to work in the following terminal environments:

- **Bash** (Linux, macOS, Git Bash on Windows)
- **PowerShell** (Windows)
- **Command Prompt** (Windows)
- **Zsh** (macOS, Linux)
- **Windows Terminal** (Windows)
- **iTerm2** (macOS)

## Terminal-Specific Considerations

### Bash/Zsh

```bash
# Install globally
npm install -g cursor-cli

# Run commands
cursor-cli prompt "Fix the bug in auth.ts"
cursor-cli chat
cursor-cli send --file=prompt.txt
```

### PowerShell

```powershell
# Install globally
npm install -g cursor-cli

# Run commands
cursor-cli prompt "Fix the bug in auth.ts"
cursor-cli chat
cursor-cli send --file=prompt.txt
```

### Command Prompt

```cmd
:: Install globally
npm install -g cursor-cli

:: Run commands
cursor-cli prompt "Fix the bug in auth.ts"
cursor-cli chat
cursor-cli send --file=prompt.txt
```

## Color Support

The CLI tool uses ANSI color codes for terminal output. Most modern terminals support these color codes, but some older terminals or specific configurations might not display colors correctly.

If you experience issues with color display, you can disable colors by setting the `NO_COLOR` environment variable:

```bash
# Bash/Zsh
export NO_COLOR=1
cursor-cli prompt "Fix the bug in auth.ts"

# PowerShell
$env:NO_COLOR=1
cursor-cli prompt "Fix the bug in auth.ts"

# Command Prompt
set NO_COLOR=1
cursor-cli prompt "Fix the bug in auth.ts"
```

## Interactive Mode

The interactive chat mode (`cursor-cli chat`) requires a terminal that supports readline functionality. This should work in most modern terminals, but some environments might have limitations.

## Keyboard Shortcuts

In interactive chat mode, the following keyboard shortcuts are available:

- **Ctrl+C**: Exit the chat session
- **Up/Down Arrow**: Navigate through command history
- **Tab**: Auto-complete (when implemented)

## Terminal Integration

You can integrate the CLI tool with your terminal by adding aliases or functions to your shell configuration:

### Bash/Zsh

Add to your `.bashrc` or `.zshrc`:

```bash
# Cursor CLI aliases
alias cp="cursor-cli prompt"
alias cc="cursor-cli chat"
alias cs="cursor-cli send --file"
```

### PowerShell

Add to your PowerShell profile:

```powershell
# Cursor CLI aliases
function cp { cursor-cli prompt $args }
function cc { cursor-cli chat }
function cs { cursor-cli send --file $args }
```

## Troubleshooting

If you encounter issues with the CLI tool in your terminal:

1. Ensure you have Node.js 14+ installed
2. Check that the CLI tool is installed correctly
3. Verify that your terminal supports the required features
4. Check for environment variables that might conflict with the CLI tool
5. Try running with the `--debug` flag for more detailed output

## Starting Ollama Deep Researcher and Frontend Server

### Ollama Deep Researcher via Docker Compose

To start the Ollama Deep Researcher service using Docker Compose:

```bash
# Navigate to the ollama-deep-researcher-ts directory
cd /c/Users/comfy/Projects/ollama-deep-researcher-ts

# Start the services defined in docker-compose.yml
docker-compose up -d

# To view logs
docker-compose logs -f

# To stop the services
docker-compose down
```

This will start:

- The Ollama Deep Researcher server on port 2024
- The Ollama WebUI on port 8080

### Frontend Expert Server

To start the Frontend Expert MCP server:

```bash
# Navigate to the project directory
cd /c/Users/comfy/Projects

# Start the Frontend Expert server
node src/mcp-servers/frontend-expert/frontend-expert-server.js
```

If the server is not yet built, you may need to build it first:

```bash
# Navigate to the project directory
cd /c/Users/comfy/Projects

# Install dependencies if needed
npm install

# Build the project
npm run build

# Start the Frontend Expert server
node dist/mcp-servers/frontend-expert/frontend-expert-server.js
```

The Frontend Expert server will be available on port 3035 by default.

## DevDocs Search Utility

The DevDocs search utility provides a quick way to search DevDocs.io for documentation from the command line.

### Bash Script Version

```bash
# Search for documentation
./tools/devdocs-search.sh javascript Array.prototype.map
./tools/devdocs-search.sh react hooks
./tools/devdocs-search.sh typescript interfaces

# Add an alias for easier access
echo 'alias docs="~/Projects/tools/devdocs-search.sh"' >> ~/.bashrc
source ~/.bashrc

# Then use it like this
docs javascript Array.prototype.map
```

### Node.js Version

```bash
# Install dependencies (first time only)
cd tools
npm install open

# Search for documentation
node devdocs-search.js javascript Array.prototype.map
node devdocs-search.js react hooks
node devdocs-search.js typescript interfaces
```

The utility will open your default browser with the documentation page or search results.

## Common Issues and Fixes

### Windows jq Syntax Error Fix

When activating UI context in Windows, you may encounter jq syntax errors like:

```
jq: error: syntax error, unexpected INVALID_CHARACTER (Windows cmd shell quoting issues?)
```

**Temporary workaround:**

Use the provided fix_ui_context.sh script before activating UI context:

```bash
# First, make the script executable if needed
chmod +x fix_ui_context.sh

# For UI context content files:
./fix_ui_context.sh path/to/content_file.json > fixed_content.json
```

This is a temporary solution until the comprehensive Windows MCP Process Management task is completed.
