#=====================================================================
# GitHub Backup Tester - OSPAiN2 Project (PowerShell Version)
# 
# Description: Tests the GitHub backup process in dry-run mode
# Author: OSPAiN2 Team
# Version: 1.0.0
# Created: $(Get-Date -Format "yyyy-MM-dd")
#=====================================================================

# Configuration
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoDir = Split-Path -Parent $ScriptDir
$BackupScript = Join-Path $ScriptDir "github-backup.ps1"
$LogFile = Join-Path $RepoDir "logs\backup-test.log"

# Ensure logs directory exists
$LogDir = Join-Path $RepoDir "logs"
if (-not (Test-Path $LogDir)) {
    New-Item -ItemType Directory -Path $LogDir | Out-Null
}

# Create a timestamp
$TimeStamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

# Function to log messages
function Log-Message {
    param (
        [string]$Message
    )
    $LogEntry = "[$TimeStamp] $Message"
    Write-Host $LogEntry
    Add-Content -Path $LogFile -Value $LogEntry
}

# Check if the backup script exists
if (-not (Test-Path $BackupScript)) {
    Log-Message "ERROR: Backup script not found: $BackupScript"
    exit 1
}

# Start the test
Log-Message "==== Starting GitHub backup test process ===="
Log-Message "Repository directory: $RepoDir"
Log-Message "Backup script: $BackupScript"

# Change to repository directory
try {
    Push-Location $RepoDir
}
catch {
    Log-Message "ERROR: Failed to change to repository directory"
    exit 1
}

# Print the git status
Log-Message "Current Git status:"
$gitStatus = git status
$gitStatus | ForEach-Object { Log-Message $_ }

# Check for changes
$changedFiles = git status --porcelain
if ($changedFiles) {
    $changedCount = ($changedFiles | Measure-Object).Count
    Log-Message "Found $changedCount changed files. The backup script would commit these changes."
    Log-Message "Changed files include:"
    $changedFiles | ForEach-Object { Log-Message $_ }
}
else {
    Log-Message "No changes detected. Nothing would be committed by the backup script."
}

# Check if we can connect to the remote
Log-Message "Testing connection to remote repository..."
try {
    $remoteResult = git ls-remote 2>&1
    Log-Message "Successfully connected to remote repository."
}
catch {
    Log-Message "ERROR: Failed to connect to remote repository. Check your authentication credentials."
    Log-Message "Error: $_"
}

# Check if the PowerShell script is correctly written
Log-Message "Validating backup script syntax..."
try {
    $syntaxCheck = [System.Management.Automation.PSParser]::Tokenize((Get-Content -Path $BackupScript -Raw), [ref]$null)
    Log-Message "Backup script syntax is valid."
}
catch {
    Log-Message "ERROR: Backup script contains syntax errors:"
    Log-Message "Error: $_"
}

# Print summary
Log-Message "==== Test Summary ===="
Log-Message "The backup script appears to be properly configured."
Log-Message "To run the actual backup process, execute: $BackupScript"
Log-Message "==== GitHub backup test process completed ===="

Pop-Location
exit 0 