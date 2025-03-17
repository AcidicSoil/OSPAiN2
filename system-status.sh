#!/bin/bash
# system-status.sh - Check the status of OSPAiN2 components
# Source the logger
source "$(dirname "$0")/logger.sh"

# Initialize log file
LOG_FILE=$(initialize_log "$0")
log_message "$LOG_FILE" 2 "Checking OSPAiN2 system status"

# Function to check if a process is running
check_process() {
    local process_name=$1
    local grep_pattern=$2
    local count=$(ps aux | grep -v grep | grep -c "$grep_pattern")
    if [ "$count" -gt 0 ]; then
        log_message "$LOG_FILE" 2 "$process_name is running"
        return 0
    else
        log_message "$LOG_FILE" 3 "$process_name is not running"
        return 1
    fi
}

# Function to check if a port is in use
check_port() {
    local port=$1
    local service_name=$2
    if command -v netstat &> /dev/null; then
        if netstat -tuln | grep -q ":$port "; then
            log_message "$LOG_FILE" 2 "$service_name is listening on port $port"
            return 0
        fi
    elif command -v lsof &> /dev/null; then
        if lsof -i ":$port" | grep -q LISTEN; then
            log_message "$LOG_FILE" 2 "$service_name is listening on port $port"
            return 0
        fi
    elif command -v ss &> /dev/null; then
        if ss -tuln | grep -q ":$port "; then
            log_message "$LOG_FILE" 2 "$service_name is listening on port $port"
            return 0
        fi
    else
        log_message "$LOG_FILE" 3 "No tool available to check ports (netstat, lsof, or ss required)"
        return 2
    fi
    
    log_message "$LOG_FILE" 3 "$service_name is not listening on port $port"
    return 1
}

# Check system requirements
log_message "$LOG_FILE" 2 "Checking system requirements"

# Check Python
if command -v python &> /dev/null; then
    python_version=$(python --version 2>&1)
    log_message "$LOG_FILE" 2 "Python is installed: $python_version"
else
    log_message "$LOG_FILE" 4 "Python is not installed"
fi

# Check Node.js
if command -v node &> /dev/null; then
    node_version=$(node --version)
    log_message "$LOG_FILE" 2 "Node.js is installed: $node_version"
else
    log_message "$LOG_FILE" 4 "Node.js is not installed"
fi

# Check package managers
if command -v pnpm &> /dev/null; then
    pnpm_version=$(pnpm --version)
    log_message "$LOG_FILE" 2 "pnpm is installed: $pnpm_version"
else
    log_message "$LOG_FILE" 3 "pnpm is not installed"
fi

if command -v npm &> /dev/null; then
    npm_version=$(npm --version)
    log_message "$LOG_FILE" 2 "npm is installed: $npm_version"
else
    log_message "$LOG_FILE" 3 "npm is not installed"
fi

# Check directory structure
log_message "$LOG_FILE" 2 "Checking directory structure"
if [ -d "OSPAiN2-hub-new" ]; then
    log_message "$LOG_FILE" 2 "OSPAiN2-hub-new directory exists"
else
    log_message "$LOG_FILE" 4 "OSPAiN2-hub-new directory is missing"
fi

# Check if frontend dependencies are installed
if [ -d "OSPAiN2-hub-new/node_modules" ]; then
    log_message "$LOG_FILE" 2 "Frontend dependencies are installed"
else
    log_message "$LOG_FILE" 3 "Frontend dependencies are not installed"
fi

# Check running services
log_message "$LOG_FILE" 2 "Checking running services"

# Check MCP server
check_process "MCP Server" "mcp_server.py"
MCP_RUNNING=$?

# Check frontend development server
check_process "Frontend Dev Server" "vite"
FRONTEND_RUNNING=$?

# Check ports
log_message "$LOG_FILE" 2 "Checking network ports"

# Check MCP server port
check_port 3002 "MCP Server"
MCP_PORT=$?

# Check frontend development server port
check_port 3001 "Frontend Dev Server" 
FRONTEND_PORT=$?

# Check logs
log_message "$LOG_FILE" 2 "Checking log files"
LOGS_DIR="$(dirname "$0")/logs"
if [ -d "$LOGS_DIR" ]; then
    log_message "$LOG_FILE" 2 "Logs directory exists with $(find "$LOGS_DIR" -type f | wc -l) log files"
    
    # Get the newest log file
    newest_log=$(find "$LOGS_DIR" -type f -name "*.log" -printf "%T@ %p\n" | sort -n | tail -1 | cut -f2- -d" ")
    if [ -n "$newest_log" ]; then
        log_message "$LOG_FILE" 2 "Newest log file: $(basename "$newest_log") ($(date -r "$newest_log" '+%Y-%m-%d %H:%M:%S'))"
    fi
else
    log_message "$LOG_FILE" 3 "Logs directory does not exist"
fi

# Summary
log_message "$LOG_FILE" 2 "==== System Status Summary ===="
if [ $MCP_RUNNING -eq 0 ] && [ $MCP_PORT -eq 0 ]; then
    log_message "$LOG_FILE" 2 "✅ MCP Server: Running"
else
    log_message "$LOG_FILE" 3 "❌ MCP Server: Not running"
fi

if [ $FRONTEND_RUNNING -eq 0 ] && [ $FRONTEND_PORT -eq 0 ]; then
    log_message "$LOG_FILE" 2 "✅ Frontend Server: Running"
else
    log_message "$LOG_FILE" 3 "❌ Frontend Server: Not running"
fi

# Check disk space
df_output=$(df -h . | grep -v Filesystem)
disk_usage=$(echo "$df_output" | awk '{print $5}')
disk_available=$(echo "$df_output" | awk '{print $4}')
log_message "$LOG_FILE" 2 "Disk usage: $disk_usage (Available: $disk_available)"

# Final status message
if [ $MCP_RUNNING -eq 0 ] && [ $FRONTEND_RUNNING -eq 0 ]; then
    log_message "$LOG_FILE" 2 "System status: All components are running"
elif [ $MCP_RUNNING -eq 0 ] || [ $FRONTEND_RUNNING -eq 0 ]; then
    log_message "$LOG_FILE" 3 "System status: Some components are running"
else
    log_message "$LOG_FILE" 3 "System status: No components are running"
fi

log_message "$LOG_FILE" 2 "Status check complete" 