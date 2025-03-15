#!/bin/bash

echo "Knowledge Graph Server Startup Script (Git Bash for Windows)"
echo "==========================================================="

# Set the working directory to the OSPAiN2 project root
cd "$(dirname "$0")/.."
ROOT_DIR=$(pwd)

# Create logs and data directories with proper error handling
echo "Creating required directories..."
if ! mkdir -p "$ROOT_DIR/logs" 2>/dev/null; then
    echo "Error: Failed to create logs directory"
    exit 1
fi

if ! mkdir -p "$ROOT_DIR/data" 2>/dev/null; then
    echo "Error: Failed to create data directory"
    exit 1
fi

# Function to check if a port is in use
check_port() {
    local port=$1
    if command -v nc >/dev/null 2>&1; then
        nc -z localhost $port >/dev/null 2>&1
        return $?
    else
        # Fallback to node if nc is not available
        node -e "const net=require('net');const s=net.createServer();s.listen($port,'localhost',()=>{s.close();process.exit(0)}).on('error',()=>{process.exit(1)})" >/dev/null 2>&1
        return $?
    fi
}

# Function to find an available port
find_available_port() {
    local base_port=$1
    local max_attempts=100
    local port=$base_port

    for ((i=0; i<max_attempts; i++)); do
        if ! check_port $port; then
            echo $port
            return 0
        fi
        ((port++))
    done
    return 1
}

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
    if ! mkdir -p data; then
        echo "Error: Failed to create data directory"
        exit 1
    fi
fi

# Check if Knowledge Graph server is installed
if [ ! -d "mcp-knowledge-graph" ]; then
    echo "Knowledge Graph server not found. Attempting to install..."
    
    if [ -d "mcp-servers" ]; then
        cd mcp-servers || exit 1
    fi
    
    # Clone the Knowledge Graph repository
    if ! git clone https://github.com/shaneholloman/mcp-knowledge-graph.git; then
        echo "Failed to clone Knowledge Graph repository."
        echo "You can install it manually following these steps:"
        echo "1. git clone https://github.com/shaneholloman/mcp-knowledge-graph.git"
        echo "2. cd mcp-knowledge-graph"
        echo "3. npm install"
        echo "4. npm run build"
        exit 1
    fi
    
    # Install dependencies and build
    cd mcp-knowledge-graph || exit 1
    if ! npm install; then
        echo "Failed to install dependencies"
        exit 1
    fi
    if ! npm run build; then
        echo "Failed to build the project"
        exit 1
    fi
    
    cd ../.. || exit 1
else
    echo "Knowledge Graph server already installed."
fi

# Start the Knowledge Graph server
echo "Starting Knowledge Graph server..."

if [ -d "mcp-knowledge-graph" ]; then
    cd mcp-knowledge-graph || exit 1
elif [ -d "mcp-servers/mcp-knowledge-graph" ]; then
    cd mcp-servers/mcp-knowledge-graph || exit 1
else
    echo "Error: Cannot find Knowledge Graph server directory."
    exit 1
fi

# Check if server is already running
if pgrep -f "node.*dist/index.js.*memory-path" > /dev/null 2>&1; then
    echo "Knowledge Graph server is already running."
    exit 0
fi

# Check if the dist directory exists
if [ ! -d "dist" ]; then
    echo "Building Knowledge Graph server..."
    if ! npm run build; then
        echo "Failed to build the project"
        exit 1
    fi
fi

# Find an available port starting from 3004
PORT=$(find_available_port 3004)
if [ $? -ne 0 ]; then
    echo "Error: Could not find an available port"
    exit 1
fi

# Create necessary directories
if ! mkdir -p ../../data ../../logs; then
    echo "Error: Failed to create necessary directories"
    exit 1
fi

# Run the server in the background with the available port
echo "Starting Knowledge Graph server on port $PORT..."
nohup node dist/index.js --memory-path ../../data/memory.jsonl --port $PORT > ../../logs/knowledge-graph.log 2>&1 &

# Save the PID to a file for later management
echo $! > ../../data/knowledge-graph.pid

echo "Knowledge Graph server started. PID: $!"
echo "Logs are being written to: $(pwd)/../../logs/knowledge-graph.log"
echo "Server is running on port: $PORT"

echo "Knowledge Graph server startup completed." 