#!/bin/bash
# start-ospain-hub.sh - Start the OSPAiN2 Hub with MCP server and frontend
# Source the logger
source "$(dirname "$0")/logger.sh"

# Initialize log file
LOG_FILE=$(initialize_log "$0")
log_message "$LOG_FILE" 2 "Starting OSPAiN2 Hub"

# Change to script directory
cd "$(dirname "$0")"
log_message "$LOG_FILE" 1 "Working directory: $(pwd)"

# Check if Python is installed
if ! command -v python &> /dev/null; then
    log_message "$LOG_FILE" 4 "Python is not installed. Please install Python."
    exit 1
fi

# Check if the OSPAiN2-hub-new directory exists
if [ ! -d "OSPAiN2-hub-new" ]; then
    log_message "$LOG_FILE" 4 "OSPAiN2-hub-new directory not found."
    exit 1
fi

# Check if package manager is installed
if command -v pnpm &> /dev/null; then
    PKG_MGR="pnpm"
elif command -v npm &> /dev/null; then
    PKG_MGR="npm"
else
    log_message "$LOG_FILE" 4 "Neither pnpm nor npm found. Please install one of them."
    exit 1
fi

log_message "$LOG_FILE" 2 "Using package manager: $PKG_MGR"

# Start the MCP server
log_message "$LOG_FILE" 2 "Starting MCP server on port 3002"
python mcp_server.py --port 3002 > "logs/mcp_server_$(date +%Y%m%d_%H%M%S).log" 2>&1 &
MCP_PID=$!
log_message "$LOG_FILE" 2 "MCP server started with PID: $MCP_PID"

# Wait for server to initialize
log_message "$LOG_FILE" 1 "Waiting for server to initialize..."
sleep 2

# Verify MCP server is running
if ! ps -p $MCP_PID > /dev/null; then
    log_message "$LOG_FILE" 4 "MCP server failed to start. Check logs/mcp_server_*.log"
    exit 1
fi

# Then start the frontend
log_message "$LOG_FILE" 2 "Starting OSPAiN2-hub-new frontend"
cd OSPAiN2-hub-new || {
    log_message "$LOG_FILE" 4 "Failed to change to OSPAiN2-hub-new directory"
    exit 1
}

# Check if node_modules exists, if not run install
if [ ! -d "node_modules" ]; then
    log_message "$LOG_FILE" 3 "node_modules not found. Running $PKG_MGR install"
    $PKG_MGR install || {
        log_message "$LOG_FILE" 4 "Failed to install dependencies"
        exit 1
    }
fi

# Start the development server
log_message "$LOG_FILE" 2 "Starting development server with $PKG_MGR"
$PKG_MGR run dev

# This will only execute when dev server terminates
log_message "$LOG_FILE" 2 "Development server stopped"

# Clean up MCP server process
if ps -p $MCP_PID > /dev/null; then
    log_message "$LOG_FILE" 2 "Stopping MCP server (PID: $MCP_PID)"
    kill $MCP_PID
fi

log_message "$LOG_FILE" 2 "OSPAiN2 Hub shutdown complete" 