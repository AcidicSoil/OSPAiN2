# Mode Context Script
# Outputs the current development mode context

param (
    [switch]$Short,
    [switch]$Copy,
    [switch]$Help
)

# Get the directory of this script
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ContextJs = Join-Path $ScriptDir "mode-context.js"

# Check if Node.js is installed
$NodeInstalled = $null -ne (Get-Command node -ErrorAction SilentlyContinue)
if (-not $NodeInstalled) {
    Write-Error "Node.js is required to run this script"
    exit 1
}

# Ensure the mode-context.js file exists
if (-not (Test-Path $ContextJs)) {
    Write-Error "mode-context.js not found at $ContextJs"
    exit 1
}

# Display help if requested
function Show-Help {
    Write-Output "Usage: $(Split-Path -Leaf $MyInvocation.MyCommand.Path) [options]"
    Write-Output ""
    Write-Output "Options:"
    Write-Output "  -Short     Display short context format"
    Write-Output "  -Copy      Copy context to clipboard"
    Write-Output "  -Help      Show this help message"
    Write-Output ""
    Write-Output "Examples:"
    Write-Output "  .\$(Split-Path -Leaf $MyInvocation.MyCommand.Path)            # Display full context"
    Write-Output "  .\$(Split-Path -Leaf $MyInvocation.MyCommand.Path) -Short     # Display short context"
    Write-Output "  .\$(Split-Path -Leaf $MyInvocation.MyCommand.Path) -Copy      # Copy full context to clipboard"
    Write-Output "  .\$(Split-Path -Leaf $MyInvocation.MyCommand.Path) -Short -Copy # Copy short context to clipboard"
    exit 0
}

if ($Help) {
    Show-Help
}

# Get the context based on format
if ($Short) {
    $Context = node -e "console.log(require('$ContextJs'.replace(/\\/g, '\\\\')).__proto__.constructor.name === 'String' ? require('$ContextJs'.replace(/\\/g, '\\\\')).getShortModeContext() : require('$ContextJs'.replace(/\\/g, '\\\\')).getShortModeContext())"
} else {
    $Context = node -e "console.log(require('$ContextJs'.replace(/\\/g, '\\\\')).__proto__.constructor.name === 'String' ? require('$ContextJs'.replace(/\\/g, '\\\\')).generateModeContext() : require('$ContextJs'.replace(/\\/g, '\\\\')).generateModeContext())"
}

# Output the context
Write-Output $Context

# Copy to clipboard if requested
if ($Copy) {
    $Context | Set-Clipboard
    Write-Output "Context copied to clipboard"
}

exit 0 