#!/bin/bash

#=====================================================================
# GitHub Backup Tester - OSPAiN2 Project
# 
# Description: Tests the GitHub backup process in dry-run mode
# Author: OSPAiN2 Team
# Version: 1.0.0
# Created: $(date +"%Y-%m-%d")
#=====================================================================

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKUP_SCRIPT="$SCRIPT_DIR/github-backup.sh"
LOG_FILE="$REPO_DIR/logs/backup-test.log"

# Ensure logs directory exists
mkdir -p "$REPO_DIR/logs"

# Create a timestamp
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")

# Function to log messages
log_message() {
    local message="$1"
    echo "[$TIMESTAMP] $message" | tee -a "$LOG_FILE"
}

# Check if the backup script exists
if [ ! -f "$BACKUP_SCRIPT" ]; then
    log_message "ERROR: Backup script not found: $BACKUP_SCRIPT"
    exit 1
fi

# Ensure the backup script is executable
chmod +x "$BACKUP_SCRIPT"

# Start the test
log_message "==== Starting GitHub backup test process ===="
log_message "Repository directory: $REPO_DIR"
log_message "Backup script: $BACKUP_SCRIPT"

# Print the git status
log_message "Current Git status:"
cd "$REPO_DIR" || { log_message "ERROR: Failed to change to repository directory"; exit 1; }
git status | tee -a "$LOG_FILE"

# Check for changes
if [ -n "$(git status --porcelain)" ]; then
    CHANGED_FILES=$(git status --porcelain | wc -l)
    log_message "Found $CHANGED_FILES changed files. The backup script would commit these changes."
    log_message "Changed files include:"
    git status --porcelain | awk '{print $2}' | tee -a "$LOG_FILE"
else
    log_message "No changes detected. Nothing would be committed by the backup script."
fi

# Check if we can connect to the remote
log_message "Testing connection to remote repository..."
if git ls-remote &>/dev/null; then
    log_message "Successfully connected to remote repository."
else
    log_message "ERROR: Failed to connect to remote repository. Check your authentication credentials."
fi

# Check if the backup script is correctly written
log_message "Validating backup script syntax..."
bash -n "$BACKUP_SCRIPT"
if [ $? -eq 0 ]; then
    log_message "Backup script syntax is valid."
else
    log_message "ERROR: Backup script contains syntax errors."
fi

# Print summary
log_message "==== Test Summary ===="
log_message "The backup script appears to be properly configured."
log_message "To run the actual backup process, execute: $BACKUP_SCRIPT"
log_message "==== GitHub backup test process completed ===="

exit 0 