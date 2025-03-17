#!/bin/bash
# cleanup-logs.sh - Clean up old log files
# Source the logger
source "$(dirname "$0")/logger.sh"

# Initialize log file
LOG_FILE=$(initialize_log "$0")
log_message "$LOG_FILE" 2 "Starting log cleanup"

# Default to 7 days if not specified
DAYS=${1:-7}

# Validate that DAYS is a number
if ! [[ "$DAYS" =~ ^[0-9]+$ ]]; then
    log_message "$LOG_FILE" 4 "Invalid days parameter: $DAYS (must be a positive number)"
    echo "Usage: $0 [days]"
    echo "  days: Number of days to keep (default: 7)"
    exit 1
fi

log_message "$LOG_FILE" 2 "Will keep logs from the last $DAYS days"

# Check if logs directory exists
LOGS_DIR="$(dirname "$0")/logs"
if [ ! -d "$LOGS_DIR" ]; then
    log_message "$LOG_FILE" 3 "Logs directory does not exist, creating it"
    mkdir -p "$LOGS_DIR"
fi

# Count log files before deletion
BEFORE_COUNT=$(find "$LOGS_DIR" -type f -name "*.log" | wc -l)
log_message "$LOG_FILE" 2 "Found $BEFORE_COUNT log files before cleanup"

# Delete log files older than DAYS days, but keep the current one
CURRENT_LOG=$(basename "$LOG_FILE")
log_message "$LOG_FILE" 1 "Preserving current log: $CURRENT_LOG"

# Use find to identify old log files
OLD_LOGS=$(find "$LOGS_DIR" -type f -name "*.log" -not -name "$CURRENT_LOG" -mtime "+$DAYS")
OLD_COUNT=$(echo "$OLD_LOGS" | grep -v "^$" | wc -l)

if [ "$OLD_COUNT" -gt 0 ]; then
    log_message "$LOG_FILE" 2 "Found $OLD_COUNT log files older than $DAYS days to delete"
    
    # List files that will be deleted (debug level)
    echo "$OLD_LOGS" | while read -r log_file; do
        if [ -n "$log_file" ]; then
            log_message "$LOG_FILE" 1 "Deleting: $(basename "$log_file")"
            rm "$log_file"
        fi
    done
    
    log_message "$LOG_FILE" 2 "Deleted $OLD_COUNT old log files"
else
    log_message "$LOG_FILE" 2 "No log files older than $DAYS days found"
fi

# Count log files after deletion
AFTER_COUNT=$(find "$LOGS_DIR" -type f -name "*.log" | wc -l)
log_message "$LOG_FILE" 2 "Remaining log files: $AFTER_COUNT"

# Calculate disk space used by remaining logs
if command -v du &> /dev/null; then
    DISK_USAGE=$(du -sh "$LOGS_DIR" | cut -f1)
    log_message "$LOG_FILE" 2 "Current log directory size: $DISK_USAGE"
fi

log_message "$LOG_FILE" 2 "Log cleanup completed successfully"