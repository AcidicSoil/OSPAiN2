#!/bin/bash

# MicroManager Logging System
# This script provides logging functionality for the MicroManager agent

# Configuration
LOG_DIR="./.cursor/logs/micromanager"
INTERACTION_LOG="$LOG_DIR/interactions.log"
FAILURE_LOG="$LOG_DIR/failures.log"
ERROR_LOG="$LOG_DIR/errors.log"
MAX_LOG_SIZE=5242880  # 5MB

# Create log directory if it doesn't exist
mkdir -p "$LOG_DIR"

# Initialize log files if they don't exist
for log_file in "$INTERACTION_LOG" "$FAILURE_LOG" "$ERROR_LOG"; do
  if [ ! -f "$log_file" ]; then
    echo "# MicroManager Log - Created $(date)" > "$log_file"
    echo "# Format: [TIMESTAMP] [SESSION_ID] [ACTION] [CURRENT_MODE] [TARGET_MODE] [RESULT] [DETAILS]" >> "$log_file"
    echo "------------------------------------------------------------" >> "$log_file"
  fi
done

# Rotate log if it exceeds the maximum size
rotate_log() {
  local log_file="$1"
  
  if [ -f "$log_file" ] && [ $(stat -c%s "$log_file") -gt $MAX_LOG_SIZE ]; then
    local timestamp=$(date +%Y%m%d%H%M%S)
    mv "$log_file" "${log_file}.${timestamp}"
    echo "# MicroManager Log - Created $(date)" > "$log_file"
    echo "# Format: [TIMESTAMP] [SESSION_ID] [ACTION] [CURRENT_MODE] [TARGET_MODE] [RESULT] [DETAILS]" >> "$log_file"
    echo "------------------------------------------------------------" >> "$log_file"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [SYSTEM] Log rotated due to size limit" >> "$log_file"
  fi
}

# Generate unique session ID if not already set
if [ -z "$MM_SESSION_ID" ]; then
  export MM_SESSION_ID=$(date +%s)$RANDOM
fi

# Log interaction (both successful and failed)
log_interaction() {
  local current_mode="$1"
  local action="$2"
  local target_mode="$3"
  local result="$4"
  local details="$5"
  
  rotate_log "$INTERACTION_LOG"
  
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] [$MM_SESSION_ID] [$action] [$current_mode] [$target_mode] [$result] [$details]" >> "$INTERACTION_LOG"
}

# Log failure with detailed information
log_failure() {
  local current_mode="$1"
  local action="$2"
  local target_mode="$3"
  local reason="$4"
  local prompt="$5"
  local context="$6"
  
  rotate_log "$FAILURE_LOG"
  
  {
    echo "======== FAILURE LOG ENTRY ========"
    echo "TIMESTAMP: $(date '+%Y-%m-%d %H:%M:%S')"
    echo "SESSION_ID: $MM_SESSION_ID"
    echo "ACTION: $action"
    echo "CURRENT_MODE: $current_mode"
    echo "TARGET_MODE: $target_mode"
    echo "REASON: $reason"
    echo "PROMPT: $prompt"
    echo "CONTEXT: $context"
    echo "ENVIRONMENT:"
    echo "  PWD: $(pwd)"
    echo "  USER: $USER"
    echo "  SHELL: $SHELL"
    echo "  TERM: $TERM"
    echo "REQUIRED TASKS:"
    echo "$(get_mode_requirements "$current_mode" 2>/dev/null || echo "  Unable to retrieve requirements")"
    echo "=================================="
    echo ""
  } >> "$FAILURE_LOG"
  
  # Also log a single line summary to the interaction log
  log_interaction "$current_mode" "$action" "$target_mode" "FAILED" "$reason"
}

# Log error (system or unexpected error)
log_error() {
  local error="$1"
  local details="$2"
  
  rotate_log "$ERROR_LOG"
  
  {
    echo "======== ERROR LOG ENTRY ========"
    echo "TIMESTAMP: $(date '+%Y-%m-%d %H:%M:%S')"
    echo "SESSION_ID: $MM_SESSION_ID"
    echo "ERROR: $error"
    echo "DETAILS: $details"
    echo "TRACEBACK:"
    if [ -n "$BASH_VERSION" ]; then
      # Get bash stack trace if available
      local frame=0
      while caller $frame; do
        ((frame++))
      done
    fi
    echo "ENVIRONMENT:"
    echo "  PWD: $(pwd)"
    echo "  USER: $USER"
    echo "  SHELL: $SHELL"
    echo "  TERM: $TERM"
    echo "==============================="
    echo ""
  } >> "$ERROR_LOG"
}

# Get mode requirements
get_mode_requirements() {
  local mode="$1"
  
  case "$mode" in
    design)
      echo "  - Create mockups and wireframes"
      echo "  - Define component architecture"
      echo "  - Document UI/UX requirements"
      echo "  - Establish design patterns"
      echo "  - Review accessibility considerations"
      ;;
    engineering)
      echo "  - Implement core functionality"
      echo "  - Build business logic"
      echo "  - Connect data flows"
      echo "  - Handle error cases"
      echo "  - Document technical decisions"
      ;;
    testing)
      echo "  - Write unit tests"
      echo "  - Create integration tests"
      echo "  - Test edge cases"
      echo "  - Verify accessibility"
      echo "  - Performance testing"
      ;;
    deployment)
      echo "  - Optimize build process"
      echo "  - Generate documentation"
      echo "  - Prepare release notes"
      echo "  - Configure environment settings"
      echo "  - Set up monitoring"
      ;;
    maintenance)
      echo "  - Address feedback"
      echo "  - Implement improvements"
      echo "  - Fix bugs"
      echo "  - Update documentation"
      echo "  - Review performance metrics"
      ;;
    *)
      echo "  - Unknown mode requirements"
      ;;
  esac
}

# Check and parse validation errors
check_mode_validation() {
  local current_mode="$1"
  local target_mode="$2"
  local feature_name="$3"
  
  # This is a placeholder - in a real implementation, we would validate that all 
  # required tasks for the current mode are completed before allowing transition
  
  # For now, just return an error if trying to skip modes (enforcing sequential progression)
  local mode_order="design engineering testing deployment maintenance"
  
  # Check if current_mode and target_mode exist in mode_order
  if [[ ! "$mode_order" == *"$current_mode"* ]]; then
    echo "ERROR: Unknown current mode: $current_mode"
    return 1
  fi
  
  if [[ ! "$mode_order" == *"$target_mode"* ]]; then
    echo "ERROR: Unknown target mode: $target_mode"
    return 1
  fi
  
  # Check if skipping modes
  local current_pos=$(echo "$mode_order" | grep -o ".*$current_mode" | wc -w)
  local target_pos=$(echo "$mode_order" | grep -o ".*$target_mode" | wc -w)
  
  if [ $((target_pos - current_pos)) -gt 1 ]; then
    echo "ERROR: Cannot skip modes. Must progress sequentially."
    return 1
  fi
  
  if [ $((target_pos - current_pos)) -lt 0 ]; then
    # Going backward is allowed, but log it
    log_interaction "$current_mode" "mode_regression" "$target_mode" "WARNING" "Regressing to previous mode"
    return 0
  fi
  
  # Add feature-specific validation here
  # ...
  
  return 0
}

# Example command: mode transition validation
validate_mode_transition() {
  local current_mode="$1"
  local target_mode="$2"
  local feature_name="$3"
  local reason="$4"
  local prompt="$5"
  
  # Capture current context (could be expanded to include more)
  local context="Feature: $feature_name, Reason: $reason"
  
  # Validate the mode transition
  validation_result=$(check_mode_validation "$current_mode" "$target_mode" "$feature_name")
  validation_code=$?
  
  if [ $validation_code -ne 0 ]; then
    # Log the failure with details
    log_failure "$current_mode" "mode_transition" "$target_mode" "$validation_result" "$prompt" "$context"
    echo "❌ Mode transition failed: $validation_result"
    echo "👉 See detailed log at: $FAILURE_LOG"
    return 1
  else
    # Log successful interaction
    log_interaction "$current_mode" "mode_transition" "$target_mode" "SUCCESS" "$reason"
    return 0
  fi
}

# Function to display recent failures
show_recent_failures() {
  local count="${1:-5}"
  
  if [ -f "$FAILURE_LOG" ]; then
    echo "=== Recent Failure Logs (last $count) ==="
    grep -A 20 "====== FAILURE LOG ENTRY ======" "$FAILURE_LOG" | 
      grep -v "^--$" | tail -n $(($count * 20)) |
      grep -B 19 -A 0 "TIMESTAMP:" | 
      sed 's/^/  /'
    echo "===================================="
  else
    echo "No failure logs found."
  fi
}

# Function to query logs
query_logs() {
  local search_term="$1"
  local log_file="${2:-$INTERACTION_LOG}"
  
  if [ -f "$log_file" ]; then
    echo "=== Log Query Results ==="
    echo "Search Term: $search_term"
    echo "Log File: $log_file"
    echo "--------------------------"
    grep -i "$search_term" "$log_file" | tail -n 50
    echo "=========================="
  else
    echo "Log file not found: $log_file"
  fi
}

# Main CLI interface
case "${1:-help}" in
  validate)
    validate_mode_transition "$2" "$3" "$4" "$5" "$6"
    ;;
  failures)
    show_recent_failures "${2:-5}"
    ;;
  query)
    query_logs "$2" "$3"
    ;;
  help|--help|-h)
    echo "MicroManager Logging System"
    echo ""
    echo "Usage:"
    echo "  $0 validate [current_mode] [target_mode] [feature_name] [reason] [prompt]"
    echo "  $0 failures [count]"
    echo "  $0 query [search_term] [log_file]"
    echo ""
    echo "Examples:"
    echo "  $0 validate design engineering todo-manager \"Implementing core functionality\" \"t2p m switch engineering\""
    echo "  $0 failures 10"
    echo "  $0 query \"mode_transition failed\""
    ;;
  *)
    echo "Unknown command: $1"
    echo "Run '$0 help' for usage information."
    exit 1
    ;;
esac 