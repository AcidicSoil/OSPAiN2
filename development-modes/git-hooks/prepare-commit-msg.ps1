# Git pre-commit hook to include the current development mode in commit messages
# Install this hook by setting core.hooksPath to the hooks directory or manually copying to .git/hooks/
# You'll need to configure Git to run PowerShell scripts as hooks:
# git config --global core.hooksPath "<path-to-hooks-dir>"
# git config --global core.hookspath "$((Get-Item (Join-Path $PSScriptRoot '..')).FullName)/git-hooks"

param (
    [Parameter(Position=0, Mandatory=$true)]
    [string]$CommitMsgFile,
    
    [Parameter(Position=1)]
    [string]$CommitSource
)

# Exit if this is not a user-created commit
if ($CommitSource -eq "message") {
    exit 0
}

# Find the development-modes directory
$RepoRoot = & git rev-parse --show-toplevel
$ModesDir = Join-Path $RepoRoot "development-modes"
$CurrentModeFile = Join-Path $ModesDir ".current_mode"

# If the current mode file exists and we're in a mode, add it to the commit message
if (Test-Path $CurrentModeFile) {
    $CurrentMode = Get-Content $CurrentModeFile -Raw
    $CurrentMode = $CurrentMode.Trim()
    
    # Only add mode if it's not "No active mode"
    if ($CurrentMode -ne "No active mode") {
        # Determine emoji for the mode
        $Emoji = ""
        switch ($CurrentMode) {
            "design" { $Emoji = "🎨" }
            "engineering" { $Emoji = "🔧" }
            "testing" { $Emoji = "🧪" }
            "deployment" { $Emoji = "📦" }
            "maintenance" { $Emoji = "🔍" }
        }
        
        # Read the existing commit message
        $TempMsg = Get-Content $CommitMsgFile -Raw
        
        # Check if the message already starts with the mode prefix
        $ModePrefix = "[$Emoji $CurrentMode] "
        if (-not $TempMsg.StartsWith($ModePrefix)) {
            # Add the mode prefix to the commit message
            "$ModePrefix$TempMsg" | Set-Content $CommitMsgFile -Encoding utf8 -NoNewline
        }
    }
}

exit 0 