#!/bin/bash
# ospain.sh - Unified script for OSPAiN2 management
# This script consolidates all OSPAiN2 management functionality

# Base directory is the script's location
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOGS_DIR="$BASE_DIR/logs"
mkdir -p "$LOGS_DIR"

# Timestamp for logging
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="$LOGS_DIR/ospain_${TIMESTAMP}.log"

# Log level definitions
LOG_LEVEL_COLORS=("" "\033[34m" "\033[32m" "\033[33m" "\033[31m" "\033[35m")
LOG_LEVEL_NAMES=("" "DEBUG" "INFO" "WARN" "ERROR" "FATAL")

# Create log file header
echo "=======================================" > "$LOG_FILE"
echo "OSPAiN2 Log - $(date)" >> "$LOG_FILE"
echo "Script: $(basename "$0") $*" >> "$LOG_FILE"
echo "System: $(uname -a)" >> "$LOG_FILE"
echo "=======================================" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# Logging function
# log_message level message
log_message() {
  local level=$1
  local message=$2
  local timestamp=$(date +"%Y-%m-%d %H:%M:%S")
  
  # Validate log level
  [[ $level -lt 1 || $level -gt 5 ]] && level=2
  
  # Format: [TIMESTAMP] [LEVEL] Message
  local log_entry="[$timestamp] [${LOG_LEVEL_NAMES[$level]}] $message"
  
  # Log to file
  echo "$log_entry" >> "$LOG_FILE"
  
  # Print to console with color if not running in background
  if [[ -t 1 ]]; then
    echo -e "${LOG_LEVEL_COLORS[$level]}$log_entry\033[0m" >&2
  fi
  
  # For fatal errors, exit the script
  [[ $level -eq 5 ]] && exit 1
}

# Function to check if a process is running
check_process() {
  local process_name=$1
  local grep_pattern=$2
  local count=$(ps aux | grep -v grep | grep -c "$grep_pattern")
  if [ "$count" -gt 0 ]; then
    log_message 2 "$process_name is running"
    return 0
  else
    log_message 3 "$process_name is not running"
    return 1
  fi
}

# Function to check if a port is in use
check_port() {
  local port=$1
  local service_name=$2
  if command -v netstat &> /dev/null; then
    if netstat -tuln | grep -q ":$port "; then
      log_message 2 "$service_name is listening on port $port"
      return 0
    fi
  elif command -v lsof &> /dev/null; then
    if lsof -i ":$port" | grep -q LISTEN; then
      log_message 2 "$service_name is listening on port $port"
      return 0
    fi
  elif command -v ss &> /dev/null; then
    if ss -tuln | grep -q ":$port "; then
      log_message 2 "$service_name is listening on port $port"
      return 0
    fi
  else
    log_message 3 "No tool available to check ports (netstat, lsof, or ss required)"
    return 2
  fi
  
  log_message 3 "$service_name is not listening on port $port"
  return 1
}

# Command: start - Start OSPAiN2 Hub
cmd_start() {
  log_message 2 "Starting OSPAiN2 Hub"
  
  # Change to base directory
  cd "$BASE_DIR"
  log_message 1 "Working directory: $(pwd)"
  
  # Check if Python is installed
  if ! command -v python &> /dev/null; then
    log_message 4 "Python is not installed. Please install Python."
    exit 1
  fi

  # Check if the OSPAiN2-hub-new directory exists
  if [ ! -d "OSPAiN2-hub-new" ]; then
    log_message 4 "OSPAiN2-hub-new directory not found."
    exit 1
  fi

  # Check if package manager is installed
  if command -v pnpm &> /dev/null; then
    PKG_MGR="pnpm"
  elif command -v npm &> /dev/null; then
    PKG_MGR="npm"
  else
    log_message 4 "Neither pnpm nor npm found. Please install one of them."
    exit 1
  fi

  log_message 2 "Using package manager: $PKG_MGR"

  # Start the MCP server
  log_message 2 "Starting MCP server on port 3002"
  python mcp_server.py --port 3002 > "$LOGS_DIR/mcp_server_$(date +%Y%m%d_%H%M%S).log" 2>&1 &
  MCP_PID=$!
  log_message 2 "MCP server started with PID: $MCP_PID"

  # Wait for server to initialize
  log_message 1 "Waiting for server to initialize..."
  sleep 2

  # Verify MCP server is running
  if ! ps -p $MCP_PID > /dev/null; then
    log_message 4 "MCP server failed to start. Check logs/mcp_server_*.log"
    exit 1
  fi

  # Then start the frontend
  log_message 2 "Starting OSPAiN2-hub-new frontend"
  cd OSPAiN2-hub-new || {
    log_message 4 "Failed to change to OSPAiN2-hub-new directory"
    exit 1
  }

  # Check if node_modules exists, if not run install
  if [ ! -d "node_modules" ]; then
    log_message 3 "node_modules not found. Running $PKG_MGR install"
    $PKG_MGR install || {
      log_message 4 "Failed to install dependencies"
      exit 1
    }
  fi

  # Start the development server
  log_message 2 "Starting development server with $PKG_MGR"
  $PKG_MGR run dev

  # This will only execute when dev server terminates
  log_message 2 "Development server stopped"

  # Clean up MCP server process
  if ps -p $MCP_PID > /dev/null; then
    log_message 2 "Stopping MCP server (PID: $MCP_PID)"
    kill $MCP_PID
  fi

  log_message 2 "OSPAiN2 Hub shutdown complete"
}

# Command: app - Start only the frontend app
cmd_app() {
  log_message 2 "Starting OSPAiN2 frontend only"

  # Check if the OSPAiN2-hub-new directory exists
  if [ ! -d "$BASE_DIR/OSPAiN2-hub-new" ]; then
    log_message 4 "OSPAiN2-hub-new directory not found."
    exit 1
  fi

  # Check if package manager is installed
  if command -v pnpm &> /dev/null; then
    PKG_MGR="pnpm"
  elif command -v npm &> /dev/null; then
    PKG_MGR="npm"
  else
    log_message 4 "Neither pnpm nor npm found. Please install one of them."
    exit 1
  fi

  log_message 2 "Using package manager: $PKG_MGR"

  # Change to the frontend directory
  log_message 2 "Changing to OSPAiN2-hub-new directory"
  cd "$BASE_DIR/OSPAiN2-hub-new" || {
    log_message 4 "Failed to change to OSPAiN2-hub-new directory"
    exit 1
  }

  # Check if node_modules exists, if not run install
  if [ ! -d "node_modules" ]; then
    log_message 3 "node_modules not found. Running $PKG_MGR install"
    $PKG_MGR install || {
      log_message 4 "Failed to install dependencies"
      exit 1
    }
  fi

  # Start the frontend development server
  log_message 2 "Starting frontend development server with $PKG_MGR"
  $PKG_MGR run dev || {
    log_message 4 "Failed to start development server"
    exit 1
  }

  # This point is reached when the development server is stopped
  log_message 2 "Frontend development server has stopped"
}

# Command: status - Check OSPAiN2 system status
cmd_status() {
  log_message 2 "Checking OSPAiN2 system status"

  # Check system requirements
  log_message 2 "Checking system requirements"

  # Check Python
  if command -v python &> /dev/null; then
    python_version=$(python --version 2>&1)
    log_message 2 "Python is installed: $python_version"
  else
    log_message 4 "Python is not installed"
  fi

  # Check Node.js
  if command -v node &> /dev/null; then
    node_version=$(node --version)
    log_message 2 "Node.js is installed: $node_version"
  else
    log_message 4 "Node.js is not installed"
  fi

  # Check package managers
  if command -v pnpm &> /dev/null; then
    pnpm_version=$(pnpm --version)
    log_message 2 "pnpm is installed: $pnpm_version"
  else
    log_message 3 "pnpm is not installed"
  fi

  if command -v npm &> /dev/null; then
    npm_version=$(npm --version)
    log_message 2 "npm is installed: $npm_version"
  else
    log_message 3 "npm is not installed"
  fi

  # Check directory structure
  log_message 2 "Checking directory structure"
  if [ -d "$BASE_DIR/OSPAiN2-hub-new" ]; then
    log_message 2 "OSPAiN2-hub-new directory exists"
  else
    log_message 4 "OSPAiN2-hub-new directory is missing"
  fi

  # Check if frontend dependencies are installed
  if [ -d "$BASE_DIR/OSPAiN2-hub-new/node_modules" ]; then
    log_message 2 "Frontend dependencies are installed"
  else
    log_message 3 "Frontend dependencies are not installed"
  fi

  # Check running services
  log_message 2 "Checking running services"

  # Check MCP server
  check_process "MCP Server" "mcp_server.py"
  MCP_RUNNING=$?

  # Check frontend development server
  check_process "Frontend Dev Server" "vite"
  FRONTEND_RUNNING=$?

  # Check ports
  log_message 2 "Checking network ports"

  # Check MCP server port
  check_port 3002 "MCP Server"
  MCP_PORT=$?

  # Check frontend development server port
  check_port 3001 "Frontend Dev Server" 
  FRONTEND_PORT=$?

  # Check logs
  log_message 2 "Checking log files"
  if [ -d "$LOGS_DIR" ]; then
    log_message 2 "Logs directory exists with $(find "$LOGS_DIR" -type f | wc -l) log files"
    
    # Get the newest log file
    newest_log=$(find "$LOGS_DIR" -type f -name "*.log" -printf "%T@ %p\n" | sort -n | tail -1 | cut -f2- -d" ")
    if [ -n "$newest_log" ]; then
      log_message 2 "Newest log file: $(basename "$newest_log") ($(date -r "$newest_log" '+%Y-%m-%d %H:%M:%S'))"
    fi
  else
    log_message 3 "Logs directory does not exist"
  fi

  # Summary
  log_message 2 "==== System Status Summary ===="
  if [ $MCP_RUNNING -eq 0 ] && [ $MCP_PORT -eq 0 ]; then
    log_message 2 "✅ MCP Server: Running"
  else
    log_message 3 "❌ MCP Server: Not running"
  fi

  if [ $FRONTEND_RUNNING -eq 0 ] && [ $FRONTEND_PORT -eq 0 ]; then
    log_message 2 "✅ Frontend Server: Running"
  else
    log_message 3 "❌ Frontend Server: Not running"
  fi

  # Check disk space
  df_output=$(df -h . | grep -v Filesystem)
  disk_usage=$(echo "$df_output" | awk '{print $5}')
  disk_available=$(echo "$df_output" | awk '{print $4}')
  log_message 2 "Disk usage: $disk_usage (Available: $disk_available)"

  # Final status message
  if [ $MCP_RUNNING -eq 0 ] && [ $FRONTEND_RUNNING -eq 0 ]; then
    log_message 2 "System status: All components are running"
  elif [ $MCP_RUNNING -eq 0 ] || [ $FRONTEND_RUNNING -eq 0 ]; then
    log_message 3 "System status: Some components are running"
  else
    log_message 3 "System status: No components are running"
  fi

  log_message 2 "Status check complete"
}

# Command: install - Install all dependencies
cmd_install() {
  log_message 2 "Starting OSPAiN2 dependency installation"

  # Check if running as root/admin (might be needed for some package installations)
  if [ "$(id -u)" -eq 0 ]; then
    log_message 3 "Script is running as root. This might cause permission issues with npm/pnpm."
  fi

  # Check for Python
  log_message 2 "Checking for Python..."
  if command -v python &> /dev/null; then
    python_version=$(python --version 2>&1)
    log_message 2 "Python is already installed: $python_version"
  else
    log_message 4 "Python is not installed. Please install Python before continuing."
    exit 1
  fi

  # Check for Node.js
  log_message 2 "Checking for Node.js..."
  if command -v node &> /dev/null; then
    node_version=$(node --version)
    log_message 2 "Node.js is already installed: $node_version"
  else
    log_message 4 "Node.js is not installed. Please install Node.js before continuing."
    exit 1
  fi

  # Check for package managers
  log_message 2 "Checking for package managers..."
  if command -v pnpm &> /dev/null; then
    pnpm_version=$(pnpm --version)
    log_message 2 "pnpm is already installed: $pnpm_version"
    PKG_MGR="pnpm"
  elif command -v npm &> /dev/null; then
    npm_version=$(npm --version)
    log_message 2 "npm is already installed: $npm_version"
    PKG_MGR="npm"
    
    # Try to install pnpm
    log_message 2 "Attempting to install pnpm..."
    npm install -g pnpm
    if command -v pnpm &> /dev/null; then
      pnpm_version=$(pnpm --version)
      log_message 2 "Successfully installed pnpm: $pnpm_version"
      PKG_MGR="pnpm"
    else
      log_message 3 "Failed to install pnpm, continuing with npm"
    fi
  else
    log_message 4 "Neither pnpm nor npm found. Please install Node.js with npm."
    exit 1
  fi

  # Install Python dependencies
  log_message 2 "Installing Python dependencies..."
  python -m pip install --upgrade pip || {
    log_message 3 "Failed to upgrade pip, continuing with existing version"
  }

  python -m pip install -r "$BASE_DIR/requirements.txt" || {
    # Try creating a minimal requirements file if the original doesn't exist
    if [ ! -f "$BASE_DIR/requirements.txt" ]; then
      log_message 3 "requirements.txt not found, creating minimal version"
      cat > "$BASE_DIR/requirements.txt" << EOF
requests>=2.25.0
websockets>=10.0
python-dotenv>=0.19.0
aiohttp>=3.8.0
EOF
      python -m pip install -r "$BASE_DIR/requirements.txt" || {
        log_message 4 "Failed to install Python dependencies"
        exit 1
      }
    else
      log_message 4 "Failed to install Python dependencies"
      exit 1
    fi
  }
  log_message 2 "Python dependencies installed successfully"

  # Install Node.js dependencies for the project
  if [ -d "$BASE_DIR/OSPAiN2-hub-new" ]; then
    log_message 2 "Installing OSPAiN2-hub-new dependencies..."
    cd "$BASE_DIR/OSPAiN2-hub-new" || {
      log_message 4 "Failed to change to OSPAiN2-hub-new directory"
      exit 1
    }
    
    # Remove node_modules if clean install is needed
    if [ "$1" = "--clean" ]; then
      log_message 2 "Removing existing node_modules for clean install"
      rm -rf node_modules
    fi
    
    # Install dependencies
    $PKG_MGR install || {
      log_message 4 "Failed to install frontend dependencies"
      exit 1
    }
    log_message 2 "Frontend dependencies installed successfully"
    
    # Return to original directory
    cd "$BASE_DIR" || {
      log_message 3 "Failed to return to original directory"
    }
  else
    log_message 4 "OSPAiN2-hub-new directory not found"
    exit 1
  fi

  # Install global tools
  log_message 2 "Installing global tools..."

  # Check if TypeScript is installed globally
  if ! command -v tsc &> /dev/null; then
    log_message 2 "Installing TypeScript globally..."
    npm install -g typescript || {
      log_message 3 "Failed to install TypeScript globally"
    }
  else
    tsc_version=$(tsc --version)
    log_message 2 "TypeScript is already installed globally: $tsc_version"
  fi

  # Check if Vite is installed globally
  if ! command -v vite &> /dev/null; then
    log_message 2 "Installing Vite globally..."
    npm install -g vite || {
      log_message 3 "Failed to install Vite globally"
    }
  else
    vite_version=$(vite --version 2>&1)
    log_message 2 "Vite is already installed globally: $vite_version"
  fi

  # Create an empty .env file if it doesn't exist
  if [ ! -f "$BASE_DIR/.env" ]; then
    log_message 2 "Creating empty .env file..."
    cat > "$BASE_DIR/.env" << EOF
# OSPAiN2 Environment Configuration
# Created by ospain.sh install on $(date)

# MCP Server Configuration
MCP_SERVER_PORT=3002

# Frontend Configuration
VITE_API_URL=http://localhost:3002
EOF
    log_message 2 "Empty .env file created"
  fi

  # Install t2p tools if not available
  if ! command -v t2p &> /dev/null; then
    log_message 2 "Installing t2p tools..."
    if [ -d "$BASE_DIR/t2p" ]; then
      cd "$BASE_DIR/t2p" || {
        log_message 4 "Failed to change to t2p directory"
        exit 1
      }
      $PKG_MGR install || {
        log_message 3 "Failed to install t2p dependencies"
      }
      $PKG_MGR link || {
        log_message 3 "Failed to link t2p globally"
      }
      cd "$BASE_DIR" || {
        log_message 3 "Failed to return to original directory"
      }
    else
      log_message 3 "t2p directory not found, skipping installation"
    fi
  else
    log_message 2 "t2p tools are already installed"
  fi

  # Create logs directory if it doesn't exist
  mkdir -p "$LOGS_DIR"
  log_message 2 "Created logs directory (if it didn't exist)"

  # Final summary
  log_message 2 "==== Installation Summary ===="
  log_message 2 "Python version: $(python --version 2>&1)"
  log_message 2 "Node.js version: $(node --version)"
  log_message 2 "Package manager: $PKG_MGR version $(eval "$PKG_MGR --version")"
  log_message 2 "Frontend dependencies: Installed in OSPAiN2-hub-new"
  log_message 2 "Environment setup: .env file available"

  # Show next steps
  log_message 2 "OSPAiN2 dependency installation complete"
  log_message 2 ""
  log_message 2 "Next steps:"
  log_message 2 "1. Start the server: ./ospain.sh start"
  log_message 2 "2. Check system status: ./ospain.sh status"
}

# Command: clean - Clean up old log files
cmd_clean() {
  # Default to 7 days if not specified
  DAYS=${1:-7}
  
  # Validate that DAYS is a number
  if ! [[ "$DAYS" =~ ^[0-9]+$ ]]; then
    log_message 4 "Invalid days parameter: $DAYS (must be a positive number)"
    echo "Usage: $0 clean [days]"
    echo "  days: Number of days to keep (default: 7)"
    exit 1
  fi
  
  log_message 2 "Starting log cleanup"
  log_message 2 "Will keep logs from the last $DAYS days"
  
  # Check if logs directory exists
  if [ ! -d "$LOGS_DIR" ]; then
    log_message 3 "Logs directory does not exist, creating it"
    mkdir -p "$LOGS_DIR"
  fi
  
  # Count log files before deletion
  BEFORE_COUNT=$(find "$LOGS_DIR" -name "*.log" | wc -l)
  log_message 2 "Found $BEFORE_COUNT log files before cleanup"
  
  # Get current log filename to preserve it
  CURRENT_LOG=$(basename "$LOG_FILE")
  log_message 1 "Preserving current log: $CURRENT_LOG"
  
  # Delete log files older than DAYS days
  log_message 2 "Finding log files older than $DAYS days..."
  
  # First, find files that would be deleted (excluding current log)
  OLD_FILES=$(find "$LOGS_DIR" -name "*.log" -type f -mtime +$DAYS -not -name "$CURRENT_LOG")
  OLD_COUNT=$(echo "$OLD_FILES" | grep -v '^$' | wc -l)
  
  if [ $OLD_COUNT -gt 0 ]; then
    # Delete the files
    log_message 2 "Deleting $OLD_COUNT old log files"
    find "$LOGS_DIR" -name "*.log" -type f -mtime +$DAYS -not -name "$CURRENT_LOG" -delete
    DELETED_COUNT=$?
    
    if [ $DELETED_COUNT -eq 0 ]; then
      log_message 2 "Successfully deleted old log files"
    else
      log_message 3 "Some files could not be deleted"
    fi
  else
    log_message 2 "No log files older than $DAYS days found"
  fi
  
  # Count log files after deletion
  AFTER_COUNT=$(find "$LOGS_DIR" -name "*.log" | wc -l)
  log_message 2 "Remaining log files: $AFTER_COUNT"
  
  # Calculate disk space
  DISK_SPACE=$(du -sh "$LOGS_DIR" | cut -f1)
  log_message 2 "Current log directory size: $DISK_SPACE"
  
  log_message 2 "Log cleanup completed successfully"
}

# Command: help - Show usage information
cmd_help() {
  cat << EOF
OSPAiN2 Management Script

Usage: $0 <command> [options]

Commands:
  start                   Start OSPAiN2 Hub (MCP server and frontend)
  app                     Start only the frontend app
  status                  Check OSPAiN2 system status
  install [--clean]       Install all dependencies (--clean for fresh install)
  clean [days]            Clean up log files older than [days] days (default: 7)
  help                    Show this help message

Examples:
  $0 start                Start OSPAiN2 Hub
  $0 status               Check system status
  $0 install --clean      Perform a clean install of dependencies
  $0 clean 14             Clean up logs older than 14 days
EOF
}

# Main script logic
if [ $# -eq 0 ]; then
  cmd_help
  exit 0
fi

# Process the command
case "$1" in
  start)
    cmd_start
    ;;
  app)
    cmd_app
    ;;
  status)
    cmd_status
    ;;
  install)
    cmd_install "$2"
    ;;
  clean)
    cmd_clean "$2"
    ;;
  help)
    cmd_help
    ;;
  *)
    echo "Unknown command: $1"
    cmd_help
    exit 1
    ;;
esac

exit 0 