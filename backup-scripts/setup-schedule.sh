#!/bin/bash

#=====================================================================
# GitHub Backup Scheduler - OSPAiN2 Project
# 
# Description: Sets up cron jobs for automatic GitHub backups
# Author: OSPAiN2 Team
# Version: 1.0.0
# Created: $(date +"%Y-%m-%d")
#=====================================================================

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKUP_SCRIPT="$SCRIPT_DIR/github-backup.sh"
LOG_FILE="$REPO_DIR/logs/scheduler-setup.log"
CONFIG_FILE="$SCRIPT_DIR/backup-config.json"

# Ensure the backup script is executable
chmod +x "$BACKUP_SCRIPT"

# Create logs directory if it doesn't exist
mkdir -p "$REPO_DIR/logs"

# Function to log messages
log_message() {
    local message="$1"
    local timestamp=$(date +"%Y-%m-%d %H:%M:%S")
    echo "[$timestamp] $message" | tee -a "$LOG_FILE"
}

# Function to read JSON value
read_json_value() {
    local file=$1
    local property=$2
    
    # Check if jq is installed
    if ! command -v jq &> /dev/null; then
        log_message "WARNING: jq is not installed. Using fallback method to parse JSON."
        # Simple grep/sed fallback for basic JSON parsing
        local value=$(grep -o "\"$property\"[[:space:]]*:[[:space:]]*[^\,}]*" "$file" | sed -E 's/"[^"]*"[[:space:]]*:[[:space:]]*//' | sed -E 's/[[:space:]]*"([^"]*)"[[:space:]]*/\1/')
        echo "$value"
    else
        jq -r "$property" "$file"
    fi
}

# Function to setup cron job
setup_cron() {
    local schedule="$1"
    local current_crontab=$(crontab -l 2>/dev/null || echo "")
    local cron_entry="$schedule bash $BACKUP_SCRIPT"
    
    # Remove any existing entries for our backup script
    current_crontab=$(echo "$current_crontab" | grep -v "$BACKUP_SCRIPT")
    
    # Add our new entry
    echo "$current_crontab" > /tmp/crontab.tmp
    echo "$cron_entry" >> /tmp/crontab.tmp
    
    # Install new crontab
    crontab /tmp/crontab.tmp
    rm /tmp/crontab.tmp
    
    log_message "Cron job set up with schedule: $schedule"
}

log_message "==== Starting GitHub backup scheduler setup ===="
log_message "Repository directory: $REPO_DIR"
log_message "Backup script: $BACKUP_SCRIPT"

# Check if config file exists
if [ ! -f "$CONFIG_FILE" ]; then
    log_message "ERROR: Configuration file not found: $CONFIG_FILE"
    exit 1
fi

# Read configuration settings
if command -v jq &> /dev/null; then
    # Using jq if available
    HOURLY_ENABLED=$(jq -r '.schedule.hourly.enabled' "$CONFIG_FILE")
    HOURLY_MINUTE=$(jq -r '.schedule.hourly.minute' "$CONFIG_FILE")
    
    DAILY_ENABLED=$(jq -r '.schedule.daily.enabled' "$CONFIG_FILE")
    DAILY_HOUR=$(jq -r '.schedule.daily.hour' "$CONFIG_FILE")
    DAILY_MINUTE=$(jq -r '.schedule.daily.minute' "$CONFIG_FILE")
    
    WEEKLY_ENABLED=$(jq -r '.schedule.weekly.enabled' "$CONFIG_FILE")
    WEEKLY_DAY=$(jq -r '.schedule.weekly.day' "$CONFIG_FILE")
    WEEKLY_HOUR=$(jq -r '.schedule.weekly.hour' "$CONFIG_FILE")
    WEEKLY_MINUTE=$(jq -r '.schedule.weekly.minute' "$CONFIG_FILE")
else
    # Fallback method
    HOURLY_ENABLED=$(read_json_value "$CONFIG_FILE" "schedule.hourly.enabled")
    HOURLY_MINUTE=$(read_json_value "$CONFIG_FILE" "schedule.hourly.minute")
    
    DAILY_ENABLED=$(read_json_value "$CONFIG_FILE" "schedule.daily.enabled")
    DAILY_HOUR=$(read_json_value "$CONFIG_FILE" "schedule.daily.hour")
    DAILY_MINUTE=$(read_json_value "$CONFIG_FILE" "schedule.daily.minute")
    
    WEEKLY_ENABLED=$(read_json_value "$CONFIG_FILE" "schedule.weekly.enabled")
    WEEKLY_DAY=$(read_json_value "$CONFIG_FILE" "schedule.weekly.day")
    WEEKLY_HOUR=$(read_json_value "$CONFIG_FILE" "schedule.weekly.hour")
    WEEKLY_MINUTE=$(read_json_value "$CONFIG_FILE" "schedule.weekly.minute")
fi

# Map day name to number for cron (0=Sunday, 1=Monday, etc.)
day_to_number() {
    case "${1,,}" in
        "sunday") echo "0" ;;
        "monday") echo "1" ;;
        "tuesday") echo "2" ;;
        "wednesday") echo "3" ;;
        "thursday") echo "4" ;;
        "friday") echo "5" ;;
        "saturday") echo "6" ;;
        *) echo "0" ;; # Default to Sunday
    esac
}

# Initialize the crontab entries
CRON_ENTRIES=""

# Setup hourly backup if enabled
if [[ "$HOURLY_ENABLED" == "true" ]]; then
    HOURLY_SCHEDULE="$HOURLY_MINUTE * * * *"
    log_message "Setting up hourly backup at minute $HOURLY_MINUTE"
    setup_cron "$HOURLY_SCHEDULE $BACKUP_SCRIPT"
fi

# Setup daily backup if enabled
if [[ "$DAILY_ENABLED" == "true" ]]; then
    DAILY_SCHEDULE="$DAILY_MINUTE $DAILY_HOUR * * *"
    log_message "Setting up daily backup at $DAILY_HOUR:$DAILY_MINUTE"
    setup_cron "$DAILY_SCHEDULE $BACKUP_SCRIPT"
fi

# Setup weekly backup if enabled
if [[ "$WEEKLY_ENABLED" == "true" ]]; then
    WEEKLY_DAY_NUM=$(day_to_number "$WEEKLY_DAY")
    WEEKLY_SCHEDULE="$WEEKLY_MINUTE $WEEKLY_HOUR * * $WEEKLY_DAY_NUM"
    log_message "Setting up weekly backup on $WEEKLY_DAY at $WEEKLY_HOUR:$WEEKLY_MINUTE"
    setup_cron "$WEEKLY_SCHEDULE $BACKUP_SCRIPT"
fi

log_message "Verifying crontab setup..."
crontab -l | grep "$BACKUP_SCRIPT" || log_message "WARNING: Backup script not found in crontab. There may have been an issue."

log_message "==== GitHub backup scheduler setup completed ===="

# Show current crontab
log_message "Current crontab entries:"
crontab -l | tee -a "$LOG_FILE"

exit 0 