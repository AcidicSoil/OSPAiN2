#!/bin/bash
# logger.sh - Comprehensive logging utility for OSPAiN2 scripts
# Created: $(date +"%Y-%m-%d")

# Base directory for logs
LOGS_DIR="$(dirname "$0")/logs"
mkdir -p "$LOGS_DIR"

# Log file naming
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_LEVEL_COLORS=("" "\033[34m" "\033[32m" "\033[33m" "\033[31m" "\033[35m")
LOG_LEVEL_NAMES=("" "DEBUG" "INFO" "WARN" "ERROR" "FATAL")

# Create the log file with headers
initialize_log() {
  local script_name=$1
  local log_file="$LOGS_DIR/${script_name%.sh}_${TIMESTAMP}.log"
  
  echo "=======================================" > "$log_file"
  echo "OSPAiN2 Log - $(date)" >> "$log_file"
  echo "Script: $script_name" >> "$log_file"
  echo "System: $(uname -a)" >> "$log_file"
  echo "=======================================" >> "$log_file"
  echo "" >> "$log_file"
  
  echo "$log_file"
}

# Log function with severity levels
# Usage: log_message log_file level message
# Levels: 1=DEBUG, 2=INFO, 3=WARN, 4=ERROR, 5=FATAL
log_message() {
  local log_file=$1
  local level=$2
  local message=$3
  local timestamp=$(date +"%Y-%m-%d %H:%M:%S")
  
  # Validate log level
  [[ $level -lt 1 || $level -gt 5 ]] && level=2
  
  # Format: [TIMESTAMP] [LEVEL] Message
  local log_entry="[$timestamp] [${LOG_LEVEL_NAMES[$level]}] $message"
  
  # Log to file
  echo "$log_entry" >> "$log_file"
  
  # Print to console with color if not running in background
  if [[ -t 1 ]]; then
    echo -e "${LOG_LEVEL_COLORS[$level]}$log_entry\033[0m" >&2
  fi
  
  # For fatal errors, exit the script
  [[ $level -eq 5 ]] && exit 1
}

# Export functions for sourcing
export -f initialize_log
export -f log_message

# Main function when script is executed directly
if [[ "${BASH_SOURCE[0]}" == "$0" ]]; then
  echo "OSPAiN2 Logger Utility"
  echo "This script is meant to be sourced by other scripts."
  echo "Usage example:"
  echo "  source ./logger.sh"
  echo "  LOG_FILE=\$(initialize_log \"\$0\")"
  echo "  log_message \"\$LOG_FILE\" 2 \"Script started\""
fi 