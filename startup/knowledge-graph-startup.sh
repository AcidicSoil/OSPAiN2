#!/bin/bash

echo "Knowledge Graph Server Startup Script (Git Bash for Windows)"
echo "==========================================================="

# Set the working directory to the OSPAiN2 project root
cd "$(dirname "$0")/.."
ROOT_DIR=$(pwd)

# Create logs and data directories
mkdir -p "$ROOT_DIR/logs"
mkdir -p "$ROOT_DIR/data"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed or not in the PATH."
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check for npm
if ! command -v npm &> /dev/null; then
    echo "Error: npm is not installed or not in the PATH."
    exit 1
fi

# Create data directory if it doesn't exist
if [ ! -d "data" ]; then
    echo "Creating data directory for Knowledge Graph storage..."
    mkdir -p data
fi

# Check if Knowledge Graph server is installed
if [ ! -d "mcp-knowledge-graph" ]; then
    echo "Knowledge Graph server not found. Attempting to install..."
    
    if [ -d "mcp-servers" ]; then
        cd mcp-servers
    fi
    
    # Clone the Knowledge Graph repository
    git clone https://github.com/shaneholloman/mcp-knowledge-graph.git
    
    if [ $? -ne 0 ]; then
        echo "Failed to clone Knowledge Graph repository."
        echo "You can install it manually following these steps:"
        echo "1. git clone https://github.com/shaneholloman/mcp-knowledge-graph.git"
        echo "2. cd mcp-knowledge-graph"
        echo "3. npm install"
        echo "4. npm run build"
        exit 1
    fi
    
    # Install dependencies and build
    cd mcp-knowledge-graph
    npm install
    npm run build
    
    cd ../..
else
    echo "Knowledge Graph server already installed."
fi

# Start the Knowledge Graph server
echo "Starting Knowledge Graph server..."

if [ -d "mcp-knowledge-graph" ]; then
    cd mcp-knowledge-graph
elif [ -d "mcp-servers/mcp-knowledge-graph" ]; then
    cd mcp-servers/mcp-knowledge-graph
else
    echo "Error: Cannot find Knowledge Graph server directory."
    exit 1
fi

# Check if server is already running
if pgrep -f "node.*dist/index.js.*memory-path" > /dev/null; then
    echo "Knowledge Graph server is already running."
else
    # Check if the dist directory exists
    if [ ! -d "dist" ]; then
        echo "Building Knowledge Graph server..."
        npm run build
    fi
    
    # Run the server in the background
    echo "Starting Knowledge Graph server in the background..."
    nohup node dist/index.js --memory-path ../../data/memory.jsonl > ../../logs/knowledge-graph.log 2>&1 &
    
    # Save the PID to a file for later management
    echo $! > ../../data/knowledge-graph.pid
    
    echo "Knowledge Graph server started. PID: $!"
    echo "Logs are being written to: $(pwd)/../../logs/knowledge-graph.log"
fi

echo "Knowledge Graph server startup completed." 