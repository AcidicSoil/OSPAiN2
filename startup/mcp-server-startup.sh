#!/bin/bash

echo "MCP Server Startup Script (Git Bash for Windows)"
echo "================================================"

# Set the working directory to the OSPAiN2 project root
cd "$(dirname "$0")/.."
ROOT_DIR=$(pwd)

# Create logs directory if it doesn't exist
mkdir -p "$ROOT_DIR/logs"

# Create data directory if it doesn't exist
mkdir -p "$ROOT_DIR/data"

# Check if server is already running (Windows-compatible approach)
SERVER_RUNNING=0
if netstat -ano | grep ":3002" | grep "LISTENING" > /dev/null; then
  SERVER_RUNNING=1
fi

if [ $SERVER_RUNNING -eq 1 ]; then
  echo "MCP server is already running on port 3002."
else
  # Start the server with explicit port 3002
  echo "Starting MCP server on port 3002..."
  python mcp_server.py --port 3002 > "$ROOT_DIR/logs/mcp-server.log" 2>&1 &
  
  # Save PID
  echo $! > "$ROOT_DIR/data/mcp-server.pid"
  
  echo "MCP server started. PID: $!"
  echo "Logs are being written to: $ROOT_DIR/logs/mcp-server.log"
  
  # Wait a moment to ensure server starts properly
  sleep 2
  
  # Verify server is listening
  if netstat -ano | grep ":3002" | grep "LISTENING" > /dev/null; then
    echo "✅ MCP server successfully listening on port 3002"
  else
    echo "❌ WARNING: MCP server may not be listening on port 3002!"
    echo "Check logs for details: $ROOT_DIR/logs/mcp-server.log"
  fi
fi

echo "MCP server startup completed." 