#!/bin/bash

echo "🚀 Starting MCP Servers..."

# Start Knowledge Graph Server (Now includes Titan Memory functionality)
echo "Starting Knowledge Graph Server..."
node ./mcp-knowledge-graph/server.js --with-memory-module true &
KNOWLEDGE_PID=$!

# Start Repository Tools Server
echo "Starting Repository Tools Server..."
node ./mcp-servers/repository-tools/server.js &
REPO_PID=$!

# Start Docker Integration Server
echo "Starting Docker Integration Server..."
node ./mcp-servers/docker-integration/server.js &
DOCKER_PID=$!

# Start Mouse Automation Server
echo "Starting Mouse Automation Server..."
node ./mcp-servers/mouse-automation/server.js &
MOUSE_PID=$!

# Start Prompt Engineering Server
echo "Starting Prompt Engineering Server..."
node ./mcp-servers/prompt-engineering/server.js &
PROMPT_PID=$!

# Start Ollama Tag CLI Server
echo "Starting Ollama Tag CLI Server..."
node ./ollama-tag-cli/dist/index.js &
TAG_PID=$!

echo "All servers started successfully!"
echo "Press CTRL+C to stop all servers"

# Wait for user to press CTRL+C
trap "kill $KNOWLEDGE_PID $REPO_PID $DOCKER_PID $MOUSE_PID $PROMPT_PID $TAG_PID; exit" INT
wait 