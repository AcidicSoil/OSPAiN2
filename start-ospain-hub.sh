#!/bin/bash
# Start the MCP server first
cd "$(dirname "$0")" && python mcp_server.py --port 3002 &
# Wait for server to initialize
sleep 2
# Then start the frontend
cd OSPAiN2-hub && npm start 