# Installation script for Development Modes Framework
# This script sets up the mode switcher CLI and git hooks

# Get the directory of this script
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Output "Installing Development Modes Framework..."

# Create notes directory if it doesn't exist
$NotesDir = Join-Path $ScriptDir "notes"
if (-not (Test-Path $NotesDir)) {
    Write-Output "Creating notes directory..."
    New-Item -Path $NotesDir -ItemType Directory | Out-Null
}

# Install git hooks if in a git repository
try {
    $RepoRoot = git rev-parse --show-toplevel
    $GitDir = git rev-parse --git-dir
    
    if ($GitDir) {
        Write-Output "Installing git hooks..."
        
        # Create hooks directory if it doesn't exist
        $HooksDir = Join-Path $GitDir "hooks"
        if (-not (Test-Path $HooksDir)) {
            New-Item -Path $HooksDir -ItemType Directory | Out-Null
        }
        
        # Copy PowerShell hook script to hooks directory
        $HookTarget = Join-Path $HooksDir "prepare-commit-msg.ps1"
        $HookSource = Join-Path $ScriptDir "git-hooks/prepare-commit-msg.ps1"
        
        Write-Output "Copying prepare-commit-msg.ps1 hook..."
        Copy-Item -Path $HookSource -Destination $HookTarget -Force
        
        # Create a wrapper script to call the PowerShell script
        $WrapperPath = Join-Path $HooksDir "prepare-commit-msg"
        @"
#!/bin/sh
powershell.exe -ExecutionPolicy Bypass -NoProfile -File "$HookTarget" "$@"
"@ | Out-File -FilePath $WrapperPath -Encoding ascii
        
        Write-Output "Git hooks installed successfully!"
        
        # Enable running PowerShell scripts for git hooks
        Write-Output "Configuring Git to use PowerShell hooks..."
        git config core.hooksPath $HooksDir
    } else {
        Write-Output "No Git repository detected. Skipping git hooks installation."
    }
} catch {
    Write-Output "No Git repository detected or Git is not installed. Skipping git hooks installation."
}

# Create .current_mode file if it doesn't exist
$CurrentModeFile = Join-Path $ScriptDir ".current_mode"
if (-not (Test-Path $CurrentModeFile)) {
    "No active mode" | Out-File -FilePath $CurrentModeFile -Encoding utf8
    Write-Output "Created initial .current_mode file."
}

# Create .mode_history file if it doesn't exist
$HistoryFile = Join-Path $ScriptDir ".mode_history"
if (-not (Test-Path $HistoryFile)) {
    "# Mode Transition History" | Out-File -FilePath $HistoryFile -Encoding utf8
    "| Date | Previous Mode | New Mode | Reason |" | Out-File -FilePath $HistoryFile -Append -Encoding utf8
    "|------|--------------|----------|--------|" | Out-File -FilePath $HistoryFile -Append -Encoding utf8
    Write-Output "Created initial .mode_history file."
}

# Create a PowerShell profile if it doesn't exist
$ProfilePath = $PROFILE
if (-not (Test-Path $ProfilePath)) {
    New-Item -Path $ProfilePath -ItemType File -Force | Out-Null
}

# Add function to PowerShell profile
$FunctionDef = @"
# Development Modes Framework function
function m {
    param(
        [Parameter(Position=0)]
        [string]$Command,
        [Parameter(Position=1)]
        [string]$Mode
    )
    
    $script = Join-Path $PSScriptRoot "mode_switcher.ps1"
    
    if ($Command -eq "switch" -and $Mode) {
        & $script $Command $Mode
    } else {
        & $script $Command
    }
}

# Add the function to PowerShell profile if it doesn't exist
$profileContent = Get-Content $PROFILE -ErrorAction SilentlyContinue
if ($profileContent -notlike "*function m*") {
    Add-Content $PROFILE "`n# Development Mode function"
    Add-Content $PROFILE (Get-Content $PSCommandPath | Select-String -Pattern "^function m" -Context 0,99)
    Write-Output "Added 'm' function to PowerShell profile. Please restart PowerShell or run 'Import-Module $PROFILE'."
}

"@

# Check if function already exists in profile
$ProfileContent = Get-Content $ProfilePath -Raw -ErrorAction SilentlyContinue
if (-not $ProfileContent -or -not $ProfileContent.Contains("function m")) {
    Add-Content -Path $ProfilePath -Value $FunctionDef
    Write-Output "Added 'm' function to PowerShell profile."
    Write-Output "Please restart PowerShell or run 'Import-Module $ProfilePath' to use it."
} else {
    Write-Output "'m' function already exists in PowerShell profile."
}

Write-Output ""
Write-Output "Installation completed successfully!"
Write-Output ""
Write-Output "Usage:"
Write-Output "------"
Write-Output "  Mode-Switcher help                       Show help"
Write-Output "  Mode-Switcher current                    Show current mode"
Write-Output "  Mode-Switcher list                       List all modes"
Write-Output "  Mode-Switcher switch MODE               Switch to a different mode"
Write-Output "  Mode-Switcher notes [MODE]               Edit notes for a mode"
Write-Output ""
Write-Output "Run 'Import-Module $ProfilePath' to use the 'm' function immediately." 