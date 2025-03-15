#!/bin/bash

# Test the Notion MCP server connection

echo "Running Notion connection test..."

# Ensure axios is installed
if ! npm list axios > /dev/null 2>&1; then
  echo "Installing axios..."
  npm install --no-save axios
fi

# Run the test script
node test-notion-connection.js 