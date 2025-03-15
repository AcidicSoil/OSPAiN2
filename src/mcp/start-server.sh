#!/bin/bash

# Determine script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
ROOT_DIR="$(dirname "$(dirname "$SCRIPT_DIR")")"

# Default port
PORT=3000

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --port)
      PORT="$2"
      shift 2
      ;;
    --tools-dir)
      TOOLS_DIR="$2"
      shift 2
      ;;
    --no-mcp-config)
      NO_MCP_CONFIG="true"
      shift
      ;;
    --help)
      echo "Usage: start-server.sh [options]"
      echo ""
      echo "Options:"
      echo "  --port <port>       Port to run the server on (default: 3000)"
      echo "  --tools-dir <dir>   Directory to load additional tools from"
      echo "  --no-mcp-config     Don't write mcp.json config for Cursor"
      echo "  --help              Show this help message"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Build the project if needed
if [ ! -d "$ROOT_DIR/dist" ]; then
  echo "Building project..."
  cd "$ROOT_DIR"
  npm run build
fi

# Check if ts-node is installed
if ! command -v ts-node &> /dev/null; then
  echo "ts-node not found. Installing..."
  npm install -g ts-node typescript
fi

# Start the server
cd "$ROOT_DIR"
MCP_ARGS="--port $PORT"

if [ ! -z "$TOOLS_DIR" ]; then
  MCP_ARGS="$MCP_ARGS --tools-dir $TOOLS_DIR"
fi

if [ ! -z "$NO_MCP_CONFIG" ]; then
  MCP_ARGS="$MCP_ARGS --no-mcp-config"
fi

echo "Starting MCP server on port $PORT..."

# Use ts-node during development, or node with compiled JS in production
if [ -f "$SCRIPT_DIR/cli.ts" ]; then
  ts-node "$SCRIPT_DIR/cli.ts" $MCP_ARGS
else
  node "$ROOT_DIR/dist/mcp/cli.js" $MCP_ARGS
fi 