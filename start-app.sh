#!/bin/bash
# start-app.sh - Start only the OSPAiN2 frontend application
# Source the logger
source "$(dirname "$0")/logger.sh"

# Initialize log file
LOG_FILE=$(initialize_log "$0")
log_message "$LOG_FILE" 2 "Starting OSPAiN2 frontend only"

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

# Change to the frontend directory
log_message "$LOG_FILE" 2 "Changing to OSPAiN2-hub-new directory"
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

# Start the frontend development server
log_message "$LOG_FILE" 2 "Starting frontend development server with $PKG_MGR"
$PKG_MGR run dev || {
    log_message "$LOG_FILE" 4 "Failed to start development server"
    exit 1
}

# This point is reached when the development server is stopped
log_message "$LOG_FILE" 2 "Frontend development server has stopped" 