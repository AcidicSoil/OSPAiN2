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

# Change to hub directory
cd OSPAiN2-hub

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "Error: package.json not found in OSPAiN2-hub directory."
    exit 1
fi

# Check if we're using Next.js by looking for .next directory or next.config.js
NEXT_JS=false
if [ -d ".next" ] || [ -f "next.config.js" ]; then
    NEXT_JS=true
fi

# Check if we should run in development mode
if [ "$1" == "dev" ]; then
    echo "Running in development mode..."
    
    if [ "$NEXT_JS" == "true" ]; then
        echo "Detected Next.js project, using dev command..."
        npm run dev
    else
        echo "Using React start command..."
        npm start
    fi
else
    # Check if dependencies are installed
    if [ ! -d "node_modules" ]; then
        echo "Installing dependencies for the first time..."
        npm install
    else
        echo "Using existing dependencies..."
    fi
    
    # If Next.js, check for build
    if [ "$NEXT_JS" == "true" ]; then
        if [ ! -d ".next" ]; then
            echo "Building Next.js project..."
            npm run build
        fi
        echo "Starting Next.js server..."
        npm start
    else
        echo "Starting React development server..."
        npm start
    fi
fi

# Script should not reach here unless server crashed
echo
echo "OSPAiN2 server stopped or crashed. See logs above for details."
echo "To restart the server, run this script again." 