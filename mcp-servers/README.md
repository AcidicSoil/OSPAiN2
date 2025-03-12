# Ollama Ecosystem MCP Servers

## Overview

This directory contains Model Context Protocol (MCP) server implementations for the Ollama Ecosystem. MCP servers provide a standardized way for AI models to interact with external tools, resources, and services while maintaining the sovereign AI principles of local-first, user-controlled computing.

## Core Principles

- **Local-First**: All MCP servers prioritize local execution and data storage
- **User Sovereignty**: Users maintain complete control over their data and computation
- **Modular Design**: Servers follow a modular architecture for extensibility
- **Secure By Default**: Implement robust security measures to protect user data
- **Efficient Resource Usage**: Optimize for performance on consumer hardware
- **Offline Capability**: Core functionality works without internet connectivity
- **Transparent Operation**: Clear logging and visibility into server operations

## Directory Structure

```
mcp-servers/
├── shared/                 # Shared components and utilities
│   ├── mcp-server.ts       # Base MCP server implementation
│   ├── mcp-types.ts        # Type definitions for MCP
│   ├── sse-server.ts       # Base SSE server implementation
│   ├── cache/              # Caching implementations
│   ├── resource/           # Resource management
│   ├── security/           # Security utilities
│   └── integrations/       # Ecosystem integrations
├── docker-integration/     # Docker integration server
├── knowledge-graph/        # Knowledge graph server
├── mouse-automation/       # Mouse automation server
├── prompt-engineering/     # Prompt engineering assistant server
├── repository-tools/       # Repository tools server
└── template/               # Template server for new implementations
```

## Available Servers

### Content Summarizer

MCP server for text summarization with various styles and local LLM integration.

- **Port**: 3004
- **URL**: http://localhost:3004/sse
- **Tools**:
  - `summarize`: Summarize text with various style options (default, technical, executive, bullet, tldr, academic, critical, eli5)

### Prompt Engineering Assistant

MCP server for prompt engineering and text summarization.

- **Port**: 3001
- **URL**: http://localhost:3001/sse
- **Tools**:
  - `summarize_text`: Summarize text content
  - `optimize_prompt`: Optimize a prompt for better results
  - `extract_keywords`: Extract keywords from text

### Docker Integration

MCP server for Docker container interactions.

- **Port**: 3002
- **URL**: http://localhost:3002/sse
- **Tools**:
  - `docker_exec`: Execute Docker commands
  - `container_logs`: Get container logs
  - `container_stats`: Get container statistics

### Mouse Automation

MCP server for mouse and keyboard automation.

- **Port**: 3003
- **URL**: http://localhost:3003/sse
- **Tools**:
  - `move_mouse`: Move the mouse to coordinates
  - `click_mouse`: Click the mouse at coordinates
  - `type_text`: Type text at the current cursor position

### Knowledge Graph

MCP server for knowledge graph and entity relationship management.

- **Port**: 3005
- **URL**: http://localhost:3005/sse
- **Tools**:
  - `create_entity`: Create a new entity
  - `create_relation`: Create a relation between entities
  - `query_graph`: Query the knowledge graph

### Repository Tools

MCP server for repository ingestion and context generation.

- **Port**: 3006
- **URL**: http://localhost:3006/sse
- **Tools**:
  - `pack_repository`: Pack a Git repository into an AI-friendly format
  - `analyze_repository`: Analyze a Git repository to extract insights
  - `fetch_code`: Fetch code from a repository with context

## Mode-Aware Integration

All MCP servers are now integrated with the Development Modes Framework, allowing them to adjust their behavior based on the current development mode. This enables optimized performance and features for specific tasks.

### How Mode Awareness Works

1. The MCP servers detect the current development mode (design, engineering, testing, etc.)
2. They apply mode-specific optimizations and configurations
3. When the mode changes, servers automatically reconfigure themselves

### Mode-Specific Optimizations

Each development mode provides different optimization profiles:

- **Design Mode** (🎨): Aggressive caching for UI/UX-focused tasks
- **Engineering Mode** (🔧): Detailed logging and high-priority processing
- **Testing Mode** (🧪): Minimal caching with verbose output for verification
- **Deployment Mode** (📦): Optimized for performance and reliability
- **Maintenance Mode** (🔍): Balanced approach with detailed diagnostics

### Integration Components

- `utils/mode-aware.ts`: TypeScript utility for mode awareness
- `mcp_server.py`: Enhanced server manager that applies mode-specific configurations
- Individual server implementations with mode-specific features

## Running Servers

### Starting a Single Server

```bash
cd mcp-servers
npm start -- --server prompt-engineering --port 3001 --mode engineering
```

Available options:

- `--server`: Server name to start
- `--port`: Port number (defaults to server-specific port)
- `--mode`: Development mode (design, engineering, testing, deployment, maintenance)
- `--verbose`: Enable verbose logging

### Starting All Servers

```bash
cd mcp-servers
npm run start-all -- --mode engineering
```

## Development

### Creating a New Server

1. Create a new directory in `mcp-servers` for your server
2. Extend the `MCPServer` class from `shared/mcp-server.ts`
3. Implement the required methods for your server
4. Add mode-specific optimizations using the `ModeAwareService`

### Testing Mode Integration

To test mode-specific behavior:

```bash
# Set the development mode
cd development-modes
./mode-switch.sh engineering

# Start the server with mode detection
cd ../mcp-servers
npm start -- --server prompt-engineering

# Change the mode while server is running
cd ../development-modes
./mode-switch.sh design
```

## API Reference

### Base MCP Server

The `MCPServer` class provides the following capabilities:

- SSE-based event communication
- Tool registration and execution
- Resource management
- Prompt handling

### Mode-Aware Integration

The `ModeAwareService` provides:

- Current mode detection from multiple sources
- Mode change notifications via events
- Mode-specific optimization profiles
- File watching for real-time mode changes

## Technical Requirements

- Node.js (v14+)
- TypeScript (v4.5+)
- Express (v4.17+)
- Additional dependencies as listed in package.json

## Best Practices

- Follow the TypeScript strict mode guidelines
- Use async/await for asynchronous operations
- Implement proper error handling
- Add comprehensive logging
- Document all public APIs
- Include usage examples
- Test thoroughly
- Monitor performance
- Implement graceful degradation
- Support offline operation when possible
- Respect user privacy and data sovereignty

## Contributing

1. Fork the repository
2. Create a new branch for your feature
3. Implement your changes
4. Add tests for your changes
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
