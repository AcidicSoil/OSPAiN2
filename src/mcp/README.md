# MCP Server Implementation

This directory contains the Model Context Protocol (MCP) server implementation for the Ollama Ecosystem. The MCP server enables bidirectional communication between tools and reduces context window limitations.

## Features

- **WebSocket-based communication**: Real-time bidirectional communication with clients
- **Tool registration system**: Easily add new tools to extend functionality
- **Mode-aware context**: Automatically optimizes operations based on the current development mode
- **Knowledge Graph integration**: Enhances search and retrieval capabilities
- **Error handling**: Comprehensive error handling with fallbacks
- **Standalone operation**: Can run independently from VS Code for testing and development
- **Timeout management**: Prevents hanging operations with configurable timeouts
- **Batch processing**: Support for batching similar operations to improve efficiency

## Files

- `local-server.ts`: Core MCP server implementation with WebSocket support
- `client.ts`: Client for connecting to the MCP server
- `index.ts`: Main entry point for VS Code extension integration
- `cli.ts`: Command-line interface for standalone operation
- `tools/`: Directory containing tool implementations
  - `knowledge-graph-tool.ts`: Tool for interacting with the Knowledge Graph
- `start-server.sh`: Shell script to start the server on Unix-like systems
- `start-server.bat`: Batch script to start the server on Windows

## Integration with Ecosystem

The MCP server integrates with:

1. **Knowledge Graph Manager**: Enables semantic search and context-aware retrieval
2. **Development Mode Manager**: Optimizes operations based on the current mode
3. **Context Manager**: Enhances context awareness across tools
4. **Cursor IDE**: Provides configuration for Cursor to use the MCP server

## Usage

### Starting the Server

#### From VS Code Extension

```typescript
import { startMCPServer } from './mcp';

export function activate(context: vscode.ExtensionContext) {
  // Start the MCP server
  startMCPServer(context).then((server) => {
    console.log('MCP server started');
  });
}
```

#### Standalone (Command Line)

**Unix-like systems**:
```bash
./start-server.sh --port 3000
```

**Windows**:
```
start-server.bat --port 3000
```

### Connecting to the Server

```typescript
import { MCPClient } from './mcp/client';

// Create and connect the client
const client = new MCPClient({
  url: 'ws://localhost:3000',
  verbose: true
});

await client.connect();

// Call a tool
const result = await client.callTool('knowledgeGraph', {
  operation: 'search',
  query: 'typescript websocket'
});

console.log('Search results:', result);
```

### Adding a New Tool

1. Create a new file in the `tools/` directory:

```typescript
// tools/my-custom-tool.ts
import { ToolImplementation, ToolSchema } from '../local-server';

export class MyCustomTool implements ToolImplementation {
  public schema: ToolSchema = {
    name: 'myCustomTool',
    description: 'A custom tool for specific functionality',
    parameters: {
      properties: {
        param1: {
          type: 'string',
          description: 'First parameter'
        },
        param2: {
          type: 'number',
          description: 'Second parameter'
        }
      },
      required: ['param1']
    },
    required: ['param1']
  };

  public async execute(args: Record<string, any>): Promise<any> {
    const { param1, param2 } = args;
    
    // Tool implementation
    return {
      result: `Processed ${param1} with ${param2 || 'default value'}`
    };
  }
}
```

2. Register the tool with the server:

```typescript
import { MyCustomTool } from './tools/my-custom-tool';

// In your server setup
const myTool = new MyCustomTool();
server.registerTool(myTool);
```

## Configuration

### MCP Server Options

The server can be configured with the following options:

- `port`: The port to run the server on (default: 3000)
- `toolTimeoutMs`: Timeout for tool operations in milliseconds (default: 10000)

### Client Options

The client can be configured with:

- `url`: WebSocket URL to connect to
- `reconnectInterval`: Time between reconnection attempts in milliseconds (default: 3000)
- `maxReconnectAttempts`: Maximum number of reconnection attempts (default: 10)
- `verbose`: Whether to log detailed information (default: false)

## Development

### Prerequisites

- Node.js 14+
- TypeScript 4.4+
- VS Code (for extension integration)

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the project:
   ```bash
   npm run build
   ```

3. Start the server in development mode:
   ```bash
   npm run start:mcp
   ```

### Running Tests

```bash
npm test
```

## Cursor IDE Integration

The MCP server automatically creates a configuration file for Cursor IDE integration. The file is located at `.cursor/mcp.json` in your workspace root.

Example configuration:

```json
{
  "version": 1,
  "servers": [
    {
      "name": "knowledge-graph",
      "description": "Knowledge Graph MCP server for enhanced content search and retrieval",
      "url": "ws://localhost:3000",
      "events": ["tool_call", "tool_response", "error"],
      "tools": [
        {
          "name": "knowledgeGraph",
          "description": "Tool for interacting with the Knowledge Graph"
        }
      ]
    }
  ]
}
```

## Troubleshooting

### Server Won't Start

- Check if the port is already in use
- Ensure you have the necessary permissions
- Verify that Node.js and TypeScript are properly installed

### Client Can't Connect

- Ensure the server is running
- Check that the URL is correct
- Verify that no firewall is blocking the connection

### Tool Execution Fails

- Check the server logs for errors
- Ensure the tool is properly registered
- Verify that all required parameters are provided

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. 