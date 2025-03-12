# Development Mode Switcher
# A utility script to switch between different development modes and record transitions

param (
    [Parameter(Position=0)]
    [string]$Command = "help",
    
    [Parameter(Position=1)]
    [string]$Mode,
    
    [Parameter(Position=2, ValueFromRemainingArguments=$true)]
    [string[]]$Reason
)

# Set up paths and variables
$ScriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$CurrentModeFile = Join-Path $ScriptPath ".current_mode"
$HistoryFile = Join-Path $ScriptPath ".mode_history"
$AvailableModes = @("design", "engineering", "testing", "deployment", "maintenance")
$ModeEmojis = @("🎨", "🔧", "🧪", "📦", "🔍")

# Initialize files if they don't exist
if (-not (Test-Path $HistoryFile)) {
    "# Mode Transition History" | Out-File -FilePath $HistoryFile -Encoding utf8
    "| Date | Previous Mode | New Mode | Reason |" | Out-File -FilePath $HistoryFile -Append -Encoding utf8
    "|------|--------------|----------|--------|" | Out-File -FilePath $HistoryFile -Append -Encoding utf8
}

if (-not (Test-Path $CurrentModeFile)) {
    "No active mode" | Out-File -FilePath $CurrentModeFile -Encoding utf8
}

# Function to sync mode across components
function Sync-Mode {
    # Check if we have the TypeScript sync service
    $SyncServiceTs = Join-Path $ScriptPath "mode-sync-service.ts"
    $SyncServiceJs = Join-Path $ScriptPath "mode-sync-service.js"
    
    if (Test-Path $SyncServiceTs) {
        Write-Output "Syncing mode across components..."
        # Try to run with ts-node if available
        try {
            & npx ts-node $SyncServiceTs sync
        }
        catch {
            Write-Warning "Error running sync service with ts-node: $_"
            # Try with node directly if compiled .js exists
            if (Test-Path $SyncServiceJs) {
                try {
                    & node $SyncServiceJs sync
                }
                catch {
                    Write-Warning "Error running sync service with node: $_"
                }
            }
            else {
                Write-Warning "Could not find mode-sync-service.js, please compile the TypeScript file"
            }
        }
    }
    else {
        Write-Warning "Mode sync service not found, components might display different modes"
    }
}

# Function to show the current mode
function Show-CurrentMode {
    if (Test-Path $CurrentModeFile) {
        $current = Get-Content $CurrentModeFile -Raw
        if ($current -eq "No active mode") {
            Write-Output "No active development mode set"
        }
        else {
            $modeIndex = $AvailableModes.IndexOf($current)
            Write-Output "Current mode: $($ModeEmojis[$modeIndex]) $($current.Substring(0,1).ToUpper() + $current.Substring(1))"
            Write-Output ""
            Write-Output "Mode details:"
            $modeContent = Get-Content (Join-Path $ScriptPath $current) -TotalCount 2
            Write-Output $modeContent
            Write-Output "..."
        }
    }
    else {
        Write-Output "No active mode"
    }
}

# Function to list all available modes
function List-Modes {
    Write-Output "Available development modes:"
    Write-Output ""
    
    for ($i = 0; $i -lt $AvailableModes.Length; $i++) {
        $mode = $AvailableModes[$i]
        Write-Output "$($ModeEmojis[$i]) $($mode.Substring(0,1).ToUpper() + $mode.Substring(1))"
        
        $modeFile = Join-Path $ScriptPath $mode
        if (Test-Path $modeFile) {
            $line = (Get-Content $modeFile)[1]
            Write-Output $line
            Write-Output ""
        }
    }
}

# Function to switch to a new mode
function Switch-Mode {
    param (
        [string]$NewMode,
        [string]$ReasonText
    )
    
    # Validate mode
    $validMode = $false
    foreach ($mode in $AvailableModes) {
        if ($mode -eq $NewMode) {
            $validMode = $true
            break
        }
    }
    
    if (-not $validMode) {
        Write-Error "Error: '$NewMode' is not a valid mode."
        Write-Output "Available modes: $($AvailableModes -join ', ')"
        return
    }
    
    # Get current mode
    $current = Get-Content $CurrentModeFile -Raw
    if ($current -eq $NewMode) {
        Write-Output "Already in $NewMode mode."
        # Even if already in this mode, sync to ensure all components display it correctly
        Sync-Mode
        return
    }
    
    # Update current mode
    $NewMode | Out-File -FilePath $CurrentModeFile -Encoding utf8
    
    # Record transition in history
    $date = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "| $date | $current | $NewMode | $ReasonText |" | Out-File -FilePath $HistoryFile -Append -Encoding utf8
    
    # Get emoji for new mode
    $modeIndex = $AvailableModes.IndexOf($NewMode)
    
    Write-Output "Switched to $($ModeEmojis[$modeIndex]) $($NewMode.Substring(0,1).ToUpper() + $NewMode.Substring(1)) mode"
    Write-Output "Reason: $ReasonText"
    
    # Sync mode across components
    Sync-Mode
    
    # Show transition criteria from previous mode if applicable
    if ($current -ne "No active mode") {
        foreach ($mode in $AvailableModes) {
            if ($mode -eq $current) {
                Write-Output ""
                Write-Output "Transition criteria from previous mode ($($current.Substring(0,1).ToUpper() + $current.Substring(1))):"
                
                $modeFile = Join-Path $ScriptPath $current
                $inSection = $false
                $content = Get-Content $modeFile
                
                foreach ($line in $content) {
                    if ($line -match "^## Transition Criteria") {
                        $inSection = $true
                        continue
                    }
                    
                    if ($inSection -and $line -match "^## ") {
                        $inSection = $false
                        break
                    }
                    
                    if ($inSection -and $line -and $line -notmatch "^## ") {
                        Write-Output $line
                    }
                }
                break
            }
        }
    }
    
    # Show objectives for new mode
    Write-Output ""
    Write-Output "Objectives for $($NewMode.Substring(0,1).ToUpper() + $NewMode.Substring(1)) mode:"
    
    $modeFile = Join-Path $ScriptPath $NewMode
    $inSection = $false
    $content = Get-Content $modeFile
    
    foreach ($line in $content) {
        if ($line -match "^## Objectives") {
            $inSection = $true
            continue
        }
        
        if ($inSection -and $line -match "^## ") {
            $inSection = $false
            break
        }
        
        if ($inSection -and $line -and $line -notmatch "^## ") {
            Write-Output $line
        }
    }
}

# Function to show mode history
function Show-History {
    if (Test-Path $HistoryFile) {
        Get-Content $HistoryFile
    }
    else {
        Write-Output "No mode transition history available."
    }
}

# Function to edit mode-specific notes
function Edit-ModeNotes {
    param (
        [string]$TargetMode
    )
    
    # If no mode is specified, use current mode
    if (-not $TargetMode) {
        if (Test-Path $CurrentModeFile) {
            $TargetMode = Get-Content $CurrentModeFile -Raw
            $TargetMode = $TargetMode.Trim()
            if ($TargetMode -eq "No active mode") {
                Write-Error "Error: No active mode. Please specify a mode to edit notes for."
                Write-Output "Usage: .\$(Split-Path -Leaf $MyInvocation.MyCommand.Path) notes MODE"
                return
            }
        }
        else {
            Write-Error "Error: No active mode. Please specify a mode to edit notes for."
            Write-Output "Usage: .\$(Split-Path -Leaf $MyInvocation.MyCommand.Path) notes MODE"
            return
        }
    }
    
    # Validate mode
    $validMode = $false
    foreach ($mode in $AvailableModes) {
        if ($mode -eq $TargetMode) {
            $validMode = $true
            break
        }
    }
    
    if (-not $validMode) {
        Write-Error "Error: '$TargetMode' is not a valid mode."
        Write-Output "Available modes: $($AvailableModes -join ', ')"
        return
    }
    
    # Determine emoji for the mode
    $modeIndex = $AvailableModes.IndexOf($TargetMode)
    
    # Create mode notes directory if it doesn't exist
    $NotesDir = Join-Path $ScriptPath "notes"
    if (-not (Test-Path $NotesDir)) {
        New-Item -Path $NotesDir -ItemType Directory | Out-Null
    }
    
    # Create notes file if it doesn't exist
    $NotesFile = Join-Path $NotesDir "${TargetMode}_notes.md"
    if (-not (Test-Path $NotesFile)) {
        "# $($ModeEmojis[$modeIndex]) $($TargetMode.Substring(0,1).ToUpper() + $TargetMode.Substring(1)) Mode Notes" | Out-File -FilePath $NotesFile -Encoding utf8
        "" | Out-File -FilePath $NotesFile -Append -Encoding utf8
        "## Overview" | Out-File -FilePath $NotesFile -Append -Encoding utf8
        "" | Out-File -FilePath $NotesFile -Append -Encoding utf8
        "Add your notes for $($TargetMode.Substring(0,1).ToUpper() + $TargetMode.Substring(1)) mode here." | Out-File -FilePath $NotesFile -Append -Encoding utf8
        "" | Out-File -FilePath $NotesFile -Append -Encoding utf8
        "## Current Tasks" | Out-File -FilePath $NotesFile -Append -Encoding utf8
        "" | Out-File -FilePath $NotesFile -Append -Encoding utf8
        "- [ ] Task 1" | Out-File -FilePath $NotesFile -Append -Encoding utf8
        "- [ ] Task 2" | Out-File -FilePath $NotesFile -Append -Encoding utf8
        "" | Out-File -FilePath $NotesFile -Append -Encoding utf8
        "## Important Decisions" | Out-File -FilePath $NotesFile -Append -Encoding utf8
        "" | Out-File -FilePath $NotesFile -Append -Encoding utf8
        "Document any important decisions made during $($TargetMode.Substring(0,1).ToUpper() + $TargetMode.Substring(1)) mode here." | Out-File -FilePath $NotesFile -Append -Encoding utf8
        "" | Out-File -FilePath $NotesFile -Append -Encoding utf8
        "## Resources" | Out-File -FilePath $NotesFile -Append -Encoding utf8
        "" | Out-File -FilePath $NotesFile -Append -Encoding utf8
        "List any helpful resources for $($TargetMode.Substring(0,1).ToUpper() + $TargetMode.Substring(1)) mode here." | Out-File -FilePath $NotesFile -Append -Encoding utf8
    }
    
    # Edit the notes file
    Write-Output "Editing notes for $($ModeEmojis[$modeIndex]) $($TargetMode.Substring(0,1).ToUpper() + $TargetMode.Substring(1)) mode..."
    
    # Try to use common editors
    $editorFound = $false
    
    # Check for VS Code
    if (Get-Command code -ErrorAction SilentlyContinue) {
        Start-Process code -ArgumentList $NotesFile -NoNewWindow
        $editorFound = $true
    }
    # Check for notepad
    elseif (Get-Command notepad -ErrorAction SilentlyContinue) {
        Start-Process notepad -ArgumentList $NotesFile -NoNewWindow
        $editorFound = $true
    }
    # Use PowerShell ISE as last resort
    else {
        powershell_ise.exe $NotesFile
        $editorFound = $true
    }
    
    if (-not $editorFound) {
        Write-Output "No suitable editor found. Please open the notes file manually:"
        Write-Output $NotesFile
    }
    else {
        Write-Output ""
        Write-Output "Notes saved to: $NotesFile"
    }
}

# Function to show help
function Show-Help {
    Write-Output "Development Mode Switcher"
    Write-Output "Usage: .\$(Split-Path -Leaf $MyInvocation.MyCommand.Path) [command] [options]"
    Write-Output ""
    Write-Output "Commands:"
    Write-Output "  current                   Show the current development mode"
    Write-Output "  list                      List all available development modes"
    Write-Output "  switch MODE 'REASON'      Switch to a different development mode with reason"
    Write-Output "  history                   Show mode transition history"
    Write-Output "  notes [MODE]              Edit notes for the specified mode or current mode"
    Write-Output "  help                      Show this help message"
}

# Main command processing
switch ($Command.ToLower()) {
    "current" {
        Show-CurrentMode
    }
    "list" {
        List-Modes
    }
    "switch" {
        if (-not $Mode) {
            Write-Error "Error: MODE parameter is required."
            Write-Output "Usage: .\$(Split-Path -Leaf $MyInvocation.MyCommand.Path) switch MODE 'REASON'"
            return
        }
        
        if (-not $Reason -or $Reason.Count -eq 0) {
            Write-Error "Error: REASON parameter is required."
            Write-Output "Usage: .\$(Split-Path -Leaf $MyInvocation.MyCommand.Path) switch MODE 'REASON'"
            return
        }
        
        $reasonText = $Reason -join " "
        Switch-Mode -NewMode $Mode -ReasonText $reasonText
    }
    "history" {
        Show-History
    }
    "notes" {
        Edit-ModeNotes -TargetMode $Mode
    }
    default {
        Show-Help
    }
} 