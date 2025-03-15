#!/bin/bash

# This script starts the Notion MCP server

echo "Starting Notion Integration MCP Server..."
cd .cursor/mcp-servers/notion-integration || { echo "Directory not found!"; exit 1; }

# Check if .env file exists
if [ ! -f .env ]; then
  echo "ERROR: .env file not found!"
  echo "Please create a .env file based on the .env.template file."
  echo "See README-notion-integration.md for instructions."
  exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
  echo "ERROR: Node.js is not installed!"
  echo "Please install Node.js to run the Notion MCP server."
  exit 1
fi

# Start the server
node index.js 