#!/bin/bash

#=====================================================================
# GitHub Connection Tester - OSPAiN2 Project
# 
# Description: Tests the connection to the specified GitHub repository
# Author: OSPAiN2 Team
# Version: 1.0.0
# Created: $(date +"%Y-%m-%d")
#=====================================================================

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
CONFIG_FILE="$SCRIPT_DIR/backup-config.json"
LOG_FILE="$REPO_DIR/logs/github-connection-test.log"

# Ensure logs directory exists
mkdir -p "$REPO_DIR/logs"

# Create a timestamp
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")

# Function to log messages
log_message() {
    local message="$1"
    echo "[$TIMESTAMP] $message" | tee -a "$LOG_FILE"
}

# Function to handle errors
handle_error() {
    local error_message="$1"
    log_message "ERROR: $error_message"
    exit 1
}

# Function to read repository URL from config
read_repo_url() {
    if command -v jq &> /dev/null; then
        if [ -f "$CONFIG_FILE" ]; then
            REPO_URL=$(jq -r '.github.repository_url' "$CONFIG_FILE")
            if [ "$REPO_URL" = "null" ] || [ -z "$REPO_URL" ]; then
                handle_error "Repository URL not found in config file"
            fi
            return 0
        else
            handle_error "Config file not found: $CONFIG_FILE"
        fi
    else
        log_message "jq not installed, trying alternative method"
        if [ -f "$CONFIG_FILE" ]; then
            REPO_URL=$(grep -o '"repository_url"[[:space:]]*:[[:space:]]*"[^"]*"' "$CONFIG_FILE" | sed -E 's/"repository_url"[[:space:]]*:[[:space:]]*"([^"]*)"[[:space:]]*/\1/')
            if [ -z "$REPO_URL" ]; then
                handle_error "Failed to extract repository URL from config file"
            fi
            return 0
        else
            handle_error "Config file not found: $CONFIG_FILE"
        fi
    fi
}

# Start the test
log_message "==== Starting GitHub connection test ===="

# Read repository URL from config
read_repo_url
log_message "Testing connection to: $REPO_URL"

# Test if Git is installed
if ! command -v git &> /dev/null; then
    handle_error "Git is not installed. Please install Git first."
fi
log_message "Git is installed: $(git --version)"

# Test SSH connection if it's an SSH URL
if [[ "$REPO_URL" == git@* ]]; then
    log_message "Testing SSH connection to GitHub..."
    ssh -T git@github.com -o BatchMode=yes &> /dev/null
    SSH_RESULT=$?
    if [ $SSH_RESULT -eq 1 ]; then
        log_message "✅ SSH connection to GitHub successful (exit code 1 means authentication succeeded but shell access denied, which is normal)"
    elif [ $SSH_RESULT -eq 0 ]; then
        log_message "✅ SSH connection to GitHub successful"
    else
        log_message "❌ SSH connection failed (exit code $SSH_RESULT)"
        log_message "Please check your SSH keys and GitHub configuration"
    fi
fi

# Test HTTP/HTTPS connection
log_message "Testing HTTP/HTTPS connection to GitHub..."
if curl -s https://github.com > /dev/null; then
    log_message "✅ HTTPS connection to GitHub successful"
else
    log_message "❌ HTTPS connection to GitHub failed"
    log_message "Please check your internet connection and proxy settings"
fi

# Test repository access
log_message "Testing access to repository: $REPO_URL"
TEMP_DIR=$(mktemp -d)
cd "$TEMP_DIR" || handle_error "Failed to change to temporary directory"

# Try to clone (with depth=1 and quiet for speed/less output)
if git clone --depth=1 "$REPO_URL" repo-test &> /dev/null; then
    log_message "✅ Successfully cloned repository"
    
    # Check if we can push (dry run)
    cd repo-test || handle_error "Failed to enter cloned repository"
    if git push --dry-run origin &> /dev/null; then
        log_message "✅ Push access confirmed (dry run successful)"
    else
        log_message "❌ Push access failed"
        log_message "You have read access but may not have write access to the repository"
    fi
else
    log_message "❌ Failed to clone repository"
    log_message "Please check your credentials and repository permissions"
fi

# Clean up
cd "$REPO_DIR" || true
rm -rf "$TEMP_DIR"

# Print summary
log_message "==== Connection Test Summary ===="
log_message "Repository URL: $REPO_URL"
log_message "Configuration file: $CONFIG_FILE"
log_message "See the log file for detailed results: $LOG_FILE"
log_message "==== GitHub connection test completed ===="

exit 0 