# logger.ps1 - Comprehensive logging utility for OSPAiN2 scripts
# Created: $(Get-Date -Format "yyyy-MM-dd")

# Base directory for logs
$SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
$LOGS_DIR = Join-Path -Path $SCRIPT_DIR -ChildPath "logs"

# Create logs directory if it doesn't exist
if (-not (Test-Path -Path $LOGS_DIR)) {
    New-Item -ItemType Directory -Path $LOGS_DIR -Force | Out-Null
}

# Log level definitions
$LOG_LEVEL_NAMES = @("", "DEBUG", "INFO", "WARN", "ERROR", "FATAL")
$LOG_LEVEL_COLORS = @("", "Blue", "Green", "Yellow", "Red", "Magenta")

# Create the log file with headers
function Initialize-Log {
    param (
        [string]$ScriptName
    )
    
    $Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $ScriptBaseName = [System.IO.Path]::GetFileNameWithoutExtension($ScriptName)
    $LogFile = Join-Path -Path $LOGS_DIR -ChildPath "${ScriptBaseName}_${Timestamp}.log"
    
    "=======================================" | Out-File -FilePath $LogFile
    "OSPAiN2 Log - $(Get-Date)" | Out-File -FilePath $LogFile -Append
    "Script: $ScriptName" | Out-File -FilePath $LogFile -Append
    "System: $([System.Environment]::OSVersion.VersionString)" | Out-File -FilePath $LogFile -Append
    "=======================================" | Out-File -FilePath $LogFile -Append
    "" | Out-File -FilePath $LogFile -Append
    
    return $LogFile
}

# Log function with severity levels
# Usage: Write-LogMessage -LogFile $logFile -Level 2 -Message "Info message"
# Levels: 1=DEBUG, 2=INFO, 3=WARN, 4=ERROR, 5=FATAL
function Write-LogMessage {
    param (
        [string]$LogFile,
        [int]$Level,
        [string]$Message
    )
    
    # Validate log level
    if ($Level -lt 1 -or $Level -gt 5) {
        $Level = 2
    }
    
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $LogEntry = "[$Timestamp] [$($LOG_LEVEL_NAMES[$Level])] $Message"
    
    # Log to file
    $LogEntry | Out-File -FilePath $LogFile -Append
    
    # Print to console with color
    Write-Host $LogEntry -ForegroundColor $LOG_LEVEL_COLORS[$Level]
    
    # For fatal errors, exit the script
    if ($Level -eq 5) {
        exit 1
    }
}

# Example usage when script is run directly
if ($MyInvocation.InvocationName -eq $MyInvocation.MyCommand.Name) {
    Write-Host "OSPAiN2 Logger Utility"
    Write-Host "This script is meant to be imported by other scripts."
    Write-Host "Usage example:"
    Write-Host "  . ./logger.ps1"
    Write-Host "  `$LogFile = Initialize-Log -ScriptName `$MyInvocation.MyCommand.Name"
    Write-Host "  Write-LogMessage -LogFile `$LogFile -Level 2 -Message 'Script started'"
}

# Export functions for importing
Export-ModuleMember -Function Initialize-Log, Write-LogMessage 