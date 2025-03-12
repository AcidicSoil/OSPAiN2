#!/bin/bash

echo "OSPAiN2 Server Startup Script (Unix/Linux)"
echo "=========================================="

# Determine the script directory and change to project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

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

# Check if the OSPAiN2-hub directory exists
if [ ! -d "OSPAiN2-hub" ]; then
    echo "Error: OSPAiN2-hub directory not found."
    echo "Please run this script from the OSPAiN2 project root."
    exit 1
fi

echo "Starting OSPAiN2 server..."
echo

# Check if we should run in development mode
if [ "$1" == "dev" ]; then
    echo "Running in development mode..."
    cd OSPAiN2-hub
    npm run dev
else
    # Check if the project has been built
    if [ ! -d "OSPAiN2-hub/.next" ]; then
        echo "Building OSPAiN2 for the first time..."
        cd OSPAiN2-hub
        npm install
        npm run build
    else
        echo "Using existing build..."
        cd OSPAiN2-hub
    fi
    
    # Start the server
    npm start
fi

# Script should not reach here unless server crashed
echo
echo "OSPAiN2 server stopped or crashed. See logs above for details."
echo "To restart the server, run this script again." 