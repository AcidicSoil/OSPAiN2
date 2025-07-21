#=====================================================================
# GitHub Auto Backup Script - OSPAiN2 Project (PowerShell Version)
# 
# Description: Automatically commits and pushes changes to GitHub
# Author: OSPAiN2 Team
# Version: 1.0.0
# Created: $(Get-Date -Format "yyyy-MM-dd")
#=====================================================================

# Configuration variables
$RepoPath = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$ConfigFile = Join-Path $RepoPath "backup-scripts\backup-config.json"
$BackupBranch = "main"
$CommitPrefix = "[Auto Backup]"
$LogFile = Join-Path $RepoPath "logs\github-backup.log"
$TimeStamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$BackupInterval = "daily" # Options: hourly, daily, weekly
$GitUserName = "OSPAiN2 Backup"
$GitUserEmail = "ospain2-backup@example.com"
$RepositoryUrl = ""

# Ensure log directory exists
$LogDir = Join-Path $RepoPath "logs"
if (-not (Test-Path $LogDir)) {
    New-Item -ItemType Directory -Path $LogDir | Out-Null
}

# Function to log messages
function Log-Message {
    param (
        [string]$Message
    )
    $LogEntry = "[$TimeStamp] $Message"
    Write-Host $LogEntry
    Add-Content -Path $LogFile -Value $LogEntry
}

# Function to handle errors
function Handle-Error {
    param (
        [string]$ErrorMessage
    )
    Log-Message "ERROR: $ErrorMessage"
    exit 1
}

# Function to read configuration from JSON file
function Read-ConfigFile {
    if (Test-Path $ConfigFile) {
        try {
            $config = Get-Content -Path $ConfigFile -Raw | ConvertFrom-Json
            
            # Update variables from config
            $script:BackupBranch = $config.github.backup_branch
            $script:CommitPrefix = $config.github.commit_prefix
            $script:BackupInterval = $config.github.backup_interval
            $script:GitUserName = $config.github.git_user.name
            $script:GitUserEmail = $config.github.git_user.email
            $script:RepositoryUrl = $config.github.repository_url
            
            Log-Message "Configuration loaded from $ConfigFile"
        }
        catch {
            Log-Message "WARNING: Failed to parse configuration file: $_"
            Log-Message "Using default configuration values"
        }
    }
    else {
        Log-Message "Configuration file not found, using defaults"
    }
}

# Initialize script
Log-Message "==== Starting GitHub backup process ===="
Log-Message "Repository path: $RepoPath"

# Read configuration
Read-ConfigFile

Log-Message "Using GitHub repository: $RepositoryUrl"

# Change to repository directory
try {
    Push-Location $RepoPath
}
catch {
    Handle-Error "Failed to change to repository directory: $RepoPath"
}

# Configure git user if provided
if ($GitUserName -and $GitUserEmail) {
    try {
        git config user.name "$GitUserName"
        git config user.email "$GitUserEmail"
        Log-Message "Git user configured: $GitUserName <$GitUserEmail>"
    }
    catch {
        Handle-Error "Failed to configure git user"
    }
}

# Check if git repository exists
if (-not (Test-Path ".git")) {
    Log-Message "Git repository not found, initializing one"
    try {
        git init
        Log-Message "Git repository initialized"
        
        # Check if repository URL is provided
        if ($RepositoryUrl) {
            Log-Message "Adding remote origin: $RepositoryUrl"
            git remote add origin $RepositoryUrl
        }
        else {
            Handle-Error "Repository URL not specified in configuration"
        }
    }
    catch {
        Handle-Error "Failed to initialize git repository: $_"
    }
}

# Verify remote or update it if needed
try {
    $currentRemote = git remote get-url origin 2>$null
    if (-not $currentRemote) {
        if ($RepositoryUrl) {
            Log-Message "Setting remote origin: $RepositoryUrl"
            git remote add origin $RepositoryUrl
        }
        else {
            Handle-Error "Repository URL not specified in configuration"
        }
    }
    elseif ($RepositoryUrl -and ($currentRemote -ne $RepositoryUrl)) {
        Log-Message "Updating remote origin from $currentRemote to $RepositoryUrl"
        git remote set-url origin $RepositoryUrl
    }
}
catch {
    Log-Message "WARNING: Error checking remote: $_"
}

# Fetch the latest changes
Log-Message "Fetching latest changes from remote repository..."
try {
    git fetch origin $BackupBranch
}
catch {
    Log-Message "Warning: Failed to fetch from remote repository, will create branch if needed"
}

# Check if branch exists locally or remotely
try {
    $branchList = git branch -a
    $branchExists = $branchList | Where-Object { $_ -match "^\*?\s+$BackupBranch$" -or $_ -match "remotes/origin/$BackupBranch$" }
    
    if (-not $branchExists) {
        Log-Message "Branch $BackupBranch doesn't exist, creating it"
        git checkout -b $BackupBranch
    }
    else {
        # Check if we're on the backup branch, if not switch to it
        $CurrentBranch = git rev-parse --abbrev-ref HEAD
        if ($CurrentBranch -ne $BackupBranch) {
            Log-Message "Switching to branch: $BackupBranch"
            git checkout $BackupBranch
        }
        
        # Pull latest changes if the branch exists remotely
        $remoteBranchExists = $branchList | Where-Object { $_ -match "remotes/origin/$BackupBranch$" }
        if ($remoteBranchExists) {
            Log-Message "Pulling latest changes from remote repository..."
            try {
                git pull origin $BackupBranch
            }
            catch {
                Log-Message "Warning: Failed to pull from remote repository, continuing anyway..."
            }
        }
    }
}
catch {
    Handle-Error "Failed to check or create branch: $_"
}

# Check for changes
$ChangedFiles = git status --porcelain
if ($ChangedFiles) {
    # Get list of changed files
    $ChangedCount = ($ChangedFiles | Measure-Object).Count
    $FileList = ($ChangedFiles | ForEach-Object { $_.Substring(3) } | Select-Object -First 5) -join ", "
    
    # Create descriptive commit message
    $CommitDate = Get-Date -Format "yyyy-MM-dd HH:mm"
    $BackupIntervalFormatted = $BackupInterval.Substring(0,1).ToUpper() + $BackupInterval.Substring(1)
    $CommitMessage = "$CommitPrefix $BackupIntervalFormatted backup - $CommitDate - $ChangedCount files changed"
    
    # Add changed files to staging
    Log-Message "Adding changes to git staging..."
    try {
        git add .
    }
    catch {
        Handle-Error "Failed to add changes to git staging: $_"
    }
    
    # Commit changes
    Log-Message "Committing $ChangedCount changes with message: '$CommitMessage'"
    Log-Message "Changed files include: $FileList..."
    try {
        git commit -m "$CommitMessage"
    }
    catch {
        Handle-Error "Failed to commit changes: $_"
    }
    
    # Push changes
    Log-Message "Pushing changes to remote repository..."
    try {
        git push -u origin $BackupBranch
    }
    catch {
        Handle-Error "Failed to push changes to remote repository: $_"
    }
    
    Log-Message "✅ Backup completed successfully!"
}
else {
    Log-Message "No changes detected. Nothing to commit."
}

Log-Message "==== GitHub backup process finished ===="
Pop-Location
exit 0 