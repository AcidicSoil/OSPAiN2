#!/bin/bash

#=====================================================================
# GitHub Auto Backup Script - OSPAiN2 Project
# 
# Description: Automatically commits and pushes changes to GitHub
# Author: OSPAiN2 Team
# Version: 1.0.0
# Created: $(date +"%Y-%m-%d")
#=====================================================================

# Configuration variables
REPO_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CONFIG_FILE="$REPO_PATH/backup-scripts/backup-config.json"
BACKUP_BRANCH="main"
COMMIT_PREFIX="[Auto Backup]"
LOG_FILE="${REPO_PATH}/logs/github-backup.log"
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
BACKUP_INTERVAL="daily" # Options: hourly, daily, weekly
GIT_USER_NAME="OSPAiN2 Backup"
GIT_USER_EMAIL="ospain2-backup@example.com"
REPOSITORY_URL=""

# Ensure log directory exists
mkdir -p "${REPO_PATH}/logs"

# Function to log messages
log_message() {
    local message="$1"
    echo "[${TIMESTAMP}] $message" | tee -a "$LOG_FILE"
}

# Function to handle errors
handle_error() {
    local error_message="$1"
    log_message "ERROR: $error_message"
    exit 1
}

# Function to read from JSON config if jq is available
read_config() {
    if command -v jq &> /dev/null; then
        log_message "Using jq to read configuration"
        BACKUP_BRANCH=$(jq -r '.github.backup_branch' "$CONFIG_FILE")
        COMMIT_PREFIX=$(jq -r '.github.commit_prefix' "$CONFIG_FILE")
        BACKUP_INTERVAL=$(jq -r '.github.backup_interval' "$CONFIG_FILE")
        GIT_USER_NAME=$(jq -r '.github.git_user.name' "$CONFIG_FILE")
        GIT_USER_EMAIL=$(jq -r '.github.git_user.email' "$CONFIG_FILE")
        REPOSITORY_URL=$(jq -r '.github.repository_url' "$CONFIG_FILE")
    else
        log_message "jq not available, using default configuration"
        # Using defaults defined above
    fi
}

# Initialize script
log_message "==== Starting GitHub backup process ===="
log_message "Repository path: $REPO_PATH"

# Read configuration if config file exists
if [ -f "$CONFIG_FILE" ]; then
    read_config
else
    log_message "Configuration file not found, using defaults"
fi

log_message "Using GitHub repository: $REPOSITORY_URL"

# Change to repository directory
cd "$REPO_PATH" || handle_error "Failed to change to repository directory: $REPO_PATH"

# Configure git user if provided
if [ -n "$GIT_USER_NAME" ] && [ -n "$GIT_USER_EMAIL" ]; then
    git config user.name "$GIT_USER_NAME" || handle_error "Failed to set git user name"
    git config user.email "$GIT_USER_EMAIL" || handle_error "Failed to set git user email"
    log_message "Git user configured: $GIT_USER_NAME <$GIT_USER_EMAIL>"
fi

# Check if git repository exists
if [ ! -d ".git" ]; then
    log_message "Git repository not found, initializing one"
    git init || handle_error "Failed to initialize git repository"
    
    # Check if repository URL is provided
    if [ -n "$REPOSITORY_URL" ]; then
        log_message "Adding remote origin: $REPOSITORY_URL"
        git remote add origin "$REPOSITORY_URL" || handle_error "Failed to add remote"
    else
        handle_error "Repository URL not specified in configuration"
    fi
fi

# Verify remote or update it if needed
CURRENT_REMOTE=$(git remote get-url origin 2>/dev/null || echo "")
if [ -z "$CURRENT_REMOTE" ]; then
    if [ -n "$REPOSITORY_URL" ]; then
        log_message "Setting remote origin: $REPOSITORY_URL"
        git remote add origin "$REPOSITORY_URL" || handle_error "Failed to add remote"
    else
        handle_error "Repository URL not specified in configuration"
    fi
elif [ -n "$REPOSITORY_URL" ] && [ "$CURRENT_REMOTE" != "$REPOSITORY_URL" ]; then
    log_message "Updating remote origin from $CURRENT_REMOTE to $REPOSITORY_URL"
    git remote set-url origin "$REPOSITORY_URL" || handle_error "Failed to update remote URL"
fi

# Fetch the latest changes
log_message "Fetching latest changes from remote repository..."
git fetch origin "$BACKUP_BRANCH" || log_message "Warning: Failed to fetch from remote repository, will create branch if needed"

# Check if branch exists locally or remotely
BRANCH_EXISTS=$(git branch -a | grep -E "($BACKUP_BRANCH|remotes/origin/$BACKUP_BRANCH)" || echo "")
if [ -z "$BRANCH_EXISTS" ]; then
    log_message "Branch $BACKUP_BRANCH doesn't exist, creating it"
    git checkout -b "$BACKUP_BRANCH" || handle_error "Failed to create branch: $BACKUP_BRANCH"
else
    # Check if we're on the backup branch, if not switch to it
    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
    if [ "$CURRENT_BRANCH" != "$BACKUP_BRANCH" ]; then
        log_message "Switching to branch: $BACKUP_BRANCH"
        git checkout "$BACKUP_BRANCH" || handle_error "Failed to switch to branch: $BACKUP_BRANCH"
    fi
    
    # Pull latest changes if the branch exists remotely
    REMOTE_BRANCH_EXISTS=$(git branch -r | grep "origin/$BACKUP_BRANCH" || echo "")
    if [ -n "$REMOTE_BRANCH_EXISTS" ]; then
        log_message "Pulling latest changes from remote repository..."
        git pull origin "$BACKUP_BRANCH" || log_message "Warning: Failed to pull from remote repository, continuing anyway..."
    fi
fi

# Check for changes
git status --porcelain > /dev/null
if [ -n "$(git status --porcelain)" ]; then
    # Get list of changed files
    CHANGED_FILES=$(git status --porcelain | wc -l)
    FILE_LIST=$(git status --porcelain | awk '{print $2}' | head -5)
    
    # Create descriptive commit message
    COMMIT_DATE=$(date +"%Y-%m-%d %H:%M")
    COMMIT_MESSAGE="${COMMIT_PREFIX} ${BACKUP_INTERVAL^} backup - ${COMMIT_DATE} - ${CHANGED_FILES} files changed"
    
    # Add changed files to staging
    log_message "Adding changes to git staging..."
    git add . || handle_error "Failed to add changes to git staging"
    
    # Commit changes
    log_message "Committing ${CHANGED_FILES} changes with message: \"${COMMIT_MESSAGE}\""
    log_message "Changed files include: ${FILE_LIST}..."
    git commit -m "$COMMIT_MESSAGE" || handle_error "Failed to commit changes"
    
    # Push changes
    log_message "Pushing changes to remote repository..."
    git push -u origin "$BACKUP_BRANCH" || handle_error "Failed to push changes to remote repository"
    
    log_message "✅ Backup completed successfully!"
else
    log_message "No changes detected. Nothing to commit."
fi

log_message "==== GitHub backup process finished ===="
exit 0 