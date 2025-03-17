# Cursor IDE MCP Integration

This document explains how the CLI tool integrates with Cursor IDE using the Model Context Protocol (MCP).

## Overview

The Model Context Protocol (MCP) is a communication protocol that allows external applications to interact with Cursor IDE's AI features. This CLI tool uses MCP to send prompts to Cursor IDE chat windows.

## Protocol Details

The CLI tool communicates with Cursor IDE using WebSockets. The default connection is established to `ws://localhost:8765`, but this can be configured.

### Message Format

Messages sent to Cursor IDE follow this format:

```json
{
  "type": "prompt",
  "payload": {
    "text": "The prompt text",
    "window": "default"
  }
}
```

### Message Types

- `prompt`: Sends a prompt to a specific chat window
- `command`: Executes a command in Cursor IDE

## Configuration

The CLI tool can be configured using:

1. Command line arguments
2. Environment variables
3. Configuration file (`~/.config/cursor-cli/config.json`)

### Configuration Options

- `host`: Cursor IDE host address (default: `localhost`)
- `port`: Cursor IDE port number (default: `8765`)
- `defaultWindow`: Default chat window to use (default: `default`)

## Setting Up Cursor IDE

To enable MCP in Cursor IDE:

1. Open Cursor IDE
2. Go to Settings
3. Navigate to the "Features" section
4. Enable "MCP Servers"
5. Add a new MCP server with the following configuration:
   - Name: `cursor-cli`
   - Type: `websocket`
   - Server URL: `ws://localhost:8765`

## Troubleshooting

If you encounter issues connecting to Cursor IDE:

1. Ensure Cursor IDE is running
2. Check that MCP is enabled in Cursor IDE settings
3. Verify the host and port configuration
4. Check for firewall or network restrictions

## References

- [Cursor IDE Documentation](https://cursor.sh/docs)
- [Model Context Protocol Specification](https://cursor.sh/docs/mcp) 