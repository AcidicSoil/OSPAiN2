# ospain.ps1 - Unified script for OSPAiN2 management (PowerShell version)
# This script consolidates all OSPAiN2 management functionality

# Base directory is the script's location
$BASE_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
$LOGS_DIR = Join-Path $BASE_DIR "logs"

# Create logs directory if it doesn't exist
if (-not (Test-Path $LOGS_DIR)) {
    New-Item -Path $LOGS_DIR -ItemType Directory | Out-Null
}

# Timestamp for logging
$TIMESTAMP = Get-Date -Format "yyyyMMdd_HHmmss"
$LOG_FILE = Join-Path $LOGS_DIR "ospain_${TIMESTAMP}.log"

# Log level definitions
$LOG_LEVEL_COLORS = @{
    1 = "Blue"      # DEBUG
    2 = "Green"     # INFO
    3 = "Yellow"    # WARN
    4 = "Red"       # ERROR
    5 = "Magenta"   # FATAL
}

$LOG_LEVEL_NAMES = @{
    1 = "DEBUG"
    2 = "INFO"
    3 = "WARN"
    4 = "ERROR"
    5 = "FATAL"
}

# Create log file header
@"
=======================================
OSPAiN2 Log - $(Get-Date)
Script: $($MyInvocation.MyCommand.Name) $args
System: $((Get-WmiObject -Class Win32_OperatingSystem).Caption)
=======================================

"@ | Out-File -FilePath $LOG_FILE

# Logging function
function Log-Message {
    param (
        [Parameter(Mandatory=$true)]
        [int]$Level,
        
        [Parameter(Mandatory=$true)]
        [string]$Message
    )
    
    # Validate log level
    if ($Level -lt 1 -or $Level -gt 5) {
        $Level = 2
    }
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $levelName = $LOG_LEVEL_NAMES[$Level]
    
    # Format: [TIMESTAMP] [LEVEL] Message
    $logEntry = "[$timestamp] [$levelName] $Message"
    
    # Log to file
    Add-Content -Path $LOG_FILE -Value $logEntry
    
    # Print to console with color
    Write-Host $logEntry -ForegroundColor $LOG_LEVEL_COLORS[$Level]
    
    # For fatal errors, exit the script
    if ($Level -eq 5) {
        exit 1
    }
}

# Function to check if a process is running
function Check-Process {
    param (
        [string]$ProcessName,
        [string]$GrepPattern
    )
    
    $count = (Get-Process | Where-Object { $_.ProcessName -like "*$GrepPattern*" }).Count
    if ($count -gt 0) {
        Log-Message -Level 2 -Message "$ProcessName is running"
        return $true
    } else {
        Log-Message -Level 3 -Message "$ProcessName is not running"
        return $false
    }
}

# Function to check if a port is in use
function Check-Port {
    param (
        [int]$Port,
        [string]$ServiceName
    )
    
    $inUse = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    if ($inUse) {
        Log-Message -Level 2 -Message "$ServiceName is listening on port $Port"
        return $true
    } else {
        Log-Message -Level 3 -Message "$ServiceName is not listening on port $Port"
        return $false
    }
}

# Command: start - Start OSPAiN2 Hub
function Start-OSPAiN {
    Log-Message -Level 2 -Message "Starting OSPAiN2 Hub"
    
    # Change to base directory
    Set-Location -Path $BASE_DIR
    Log-Message -Level 1 -Message "Working directory: $(Get-Location)"
    
    # Check if Python is installed
    try {
        $pythonVersion = (python --version) 2>&1
        Log-Message -Level 2 -Message "Python is installed: $pythonVersion"
    } catch {
        Log-Message -Level 4 -Message "Python is not installed. Please install Python."
        return
    }
    
    # Check if the OSPAiN2-hub-new directory exists
    if (-not (Test-Path "OSPAiN2-hub-new")) {
        Log-Message -Level 4 -Message "OSPAiN2-hub-new directory not found."
        return
    }
    
    # Check if package manager is installed
    $PKG_MGR = "npm"
    try {
        pnpm --version | Out-Null
        $PKG_MGR = "pnpm"
    } catch {
        try {
            npm --version | Out-Null
        } catch {
            Log-Message -Level 4 -Message "Neither pnpm nor npm found. Please install one of them."
            return
        }
    }
    
    Log-Message -Level 2 -Message "Using package manager: $PKG_MGR"
    
    # Start the MCP server
    Log-Message -Level 2 -Message "Starting MCP server on port 3002"
    $mcpLogFile = Join-Path $LOGS_DIR "mcp_server_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"
    $mcpJob = Start-Job -ScriptBlock {
        param($pythonPath, $logPath)
        & python $pythonPath --port 3002 *> $logPath
    } -ArgumentList (Join-Path $BASE_DIR "mcp_server.py"), $mcpLogFile
    
    Log-Message -Level 2 -Message "MCP server started with Job ID: $($mcpJob.Id)"
    
    # Wait for server to initialize
    Log-Message -Level 1 -Message "Waiting for server to initialize..."
    Start-Sleep -Seconds 2
    
    # Verify MCP server is running
    if ($mcpJob.State -ne "Running") {
        Log-Message -Level 4 -Message "MCP server failed to start. Check logs/mcp_server_*.log"
        return
    }
    
    # Then start the frontend
    Log-Message -Level 2 -Message "Starting OSPAiN2-hub-new frontend"
    Set-Location -Path (Join-Path $BASE_DIR "OSPAiN2-hub-new")
    
    # Check if node_modules exists, if not run install
    if (-not (Test-Path "node_modules")) {
        Log-Message -Level 3 -Message "node_modules not found. Running $PKG_MGR install"
        try {
            & $PKG_MGR install
        } catch {
            Log-Message -Level 4 -Message "Failed to install dependencies"
            return
        }
    }
    
    # Start the development server
    Log-Message -Level 2 -Message "Starting development server with $PKG_MGR"
    try {
        & $PKG_MGR run dev
    } catch {
        Log-Message -Level 4 -Message "Failed to start development server: $_"
    }
    
    # This will only execute when dev server terminates
    Log-Message -Level 2 -Message "Development server stopped"
    
    # Clean up MCP server process
    if ($mcpJob.State -eq "Running") {
        Log-Message -Level 2 -Message "Stopping MCP server (Job ID: $($mcpJob.Id))"
        Stop-Job -Job $mcpJob
        Remove-Job -Job $mcpJob
    }
    
    Log-Message -Level 2 -Message "OSPAiN2 Hub shutdown complete"
}

# Command: app - Start only the frontend app
function Start-OSPAiNApp {
    Log-Message -Level 2 -Message "Starting OSPAiN2 frontend only"
    
    # Check if the OSPAiN2-hub-new directory exists
    $frontendDir = Join-Path $BASE_DIR "OSPAiN2-hub-new"
    if (-not (Test-Path $frontendDir)) {
        Log-Message -Level 4 -Message "OSPAiN2-hub-new directory not found."
        return
    }
    
    # Check if package manager is installed
    $PKG_MGR = "npm"
    try {
        pnpm --version | Out-Null
        $PKG_MGR = "pnpm"
    } catch {
        try {
            npm --version | Out-Null
        } catch {
            Log-Message -Level 4 -Message "Neither pnpm nor npm found. Please install one of them."
            return
        }
    }
    
    Log-Message -Level 2 -Message "Using package manager: $PKG_MGR"
    
    # Change to the frontend directory
    Log-Message -Level 2 -Message "Changing to OSPAiN2-hub-new directory"
    Set-Location -Path $frontendDir
    
    # Check if node_modules exists, if not run install
    if (-not (Test-Path "node_modules")) {
        Log-Message -Level 3 -Message "node_modules not found. Running $PKG_MGR install"
        try {
            & $PKG_MGR install
        } catch {
            Log-Message -Level 4 -Message "Failed to install dependencies"
            return
        }
    }
    
    # Start the frontend development server
    Log-Message -Level 2 -Message "Starting frontend development server with $PKG_MGR"
    try {
        & $PKG_MGR run dev
    } catch {
        Log-Message -Level 4 -Message "Failed to start development server: $_"
        return
    }
    
    # This point is reached when the development server is stopped
    Log-Message -Level 2 -Message "Frontend development server has stopped"
}

# Command: status - Check OSPAiN2 system status
function Get-OSPAiNStatus {
    Log-Message -Level 2 -Message "Checking OSPAiN2 system status"
    
    # Check system requirements
    Log-Message -Level 2 -Message "Checking system requirements"
    
    # Check Python
    try {
        $pythonVersion = (python --version) 2>&1
        Log-Message -Level 2 -Message "Python is installed: $pythonVersion"
    } catch {
        Log-Message -Level 4 -Message "Python is not installed"
    }
    
    # Check Node.js
    try {
        $nodeVersion = node --version
        Log-Message -Level 2 -Message "Node.js is installed: $nodeVersion"
    } catch {
        Log-Message -Level 4 -Message "Node.js is not installed"
    }
    
    # Check package managers
    try {
        $pnpmVersion = pnpm --version
        Log-Message -Level 2 -Message "pnpm is installed: $pnpmVersion"
    } catch {
        Log-Message -Level 3 -Message "pnpm is not installed"
    }
    
    try {
        $npmVersion = npm --version
        Log-Message -Level 2 -Message "npm is installed: $npmVersion"
    } catch {
        Log-Message -Level 3 -Message "npm is not installed"
    }
    
    # Check directory structure
    Log-Message -Level 2 -Message "Checking directory structure"
    $frontendDir = Join-Path $BASE_DIR "OSPAiN2-hub-new"
    if (Test-Path $frontendDir) {
        Log-Message -Level 2 -Message "OSPAiN2-hub-new directory exists"
    } else {
        Log-Message -Level 4 -Message "OSPAiN2-hub-new directory is missing"
    }
    
    # Check if frontend dependencies are installed
    $nodeModulesDir = Join-Path $frontendDir "node_modules"
    if (Test-Path $nodeModulesDir) {
        Log-Message -Level 2 -Message "Frontend dependencies are installed"
    } else {
        Log-Message -Level 3 -Message "Frontend dependencies are not installed"
    }
    
    # Check running services
    Log-Message -Level 2 -Message "Checking running services"
    
    # Check MCP server
    $mcpRunning = Check-Process -ProcessName "MCP Server" -GrepPattern "python"
    
    # Check frontend development server
    $frontendRunning = Check-Process -ProcessName "Frontend Dev Server" -GrepPattern "node"
    
    # Check ports
    Log-Message -Level 2 -Message "Checking network ports"
    
    # Check MCP server port
    $mcpPort = Check-Port -Port 3002 -ServiceName "MCP Server"
    
    # Check frontend development server port
    $frontendPort = Check-Port -Port 3001 -ServiceName "Frontend Dev Server"
    
    # Check logs
    Log-Message -Level 2 -Message "Checking log files"
    if (Test-Path $LOGS_DIR) {
        $logFiles = Get-ChildItem -Path $LOGS_DIR -Filter "*.log"
        Log-Message -Level 2 -Message "Logs directory exists with $($logFiles.Count) log files"
        
        # Get the newest log file
        if ($logFiles.Count -gt 0) {
            $newestLog = $logFiles | Sort-Object LastWriteTime -Descending | Select-Object -First 1
            Log-Message -Level 2 -Message "Newest log file: $($newestLog.Name) ($($newestLog.LastWriteTime))"
        }
    } else {
        Log-Message -Level 3 -Message "Logs directory does not exist"
    }
    
    # Summary
    Log-Message -Level 2 -Message "==== System Status Summary ===="
    if ($mcpRunning -and $mcpPort) {
        Log-Message -Level 2 -Message "✅ MCP Server: Running"
    } else {
        Log-Message -Level 3 -Message "❌ MCP Server: Not running"
    }
    
    if ($frontendRunning -and $frontendPort) {
        Log-Message -Level 2 -Message "✅ Frontend Server: Running"
    } else {
        Log-Message -Level 3 -Message "❌ Frontend Server: Not running"
    }
    
    # Check disk space
    $drive = (Get-Item $BASE_DIR).PSDrive
    $freeSpace = [math]::Round($drive.Free / 1GB, 2)
    $totalSpace = [math]::Round(($drive.Free + $drive.Used) / 1GB, 2)
    $usedPercentage = [math]::Round(($drive.Used / ($drive.Free + $drive.Used)) * 100, 2)
    
    Log-Message -Level 2 -Message "Disk usage: $usedPercentage% (Available: $freeSpace GB of $totalSpace GB)"
    
    # Final status message
    if ($mcpRunning -and $frontendRunning) {
        Log-Message -Level 2 -Message "System status: All components are running"
    } elseif ($mcpRunning -or $frontendRunning) {
        Log-Message -Level 3 -Message "System status: Some components are running"
    } else {
        Log-Message -Level 3 -Message "System status: No components are running"
    }
    
    Log-Message -Level 2 -Message "Status check complete"
}

# Command: install - Install all dependencies
function Install-OSPAiNDependencies {
    param (
        [switch]$Clean
    )
    
    Log-Message -Level 2 -Message "Starting OSPAiN2 dependency installation"
    
    # Check if running as administrator
    $isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")
    if (-not $isAdmin) {
        Log-Message -Level 3 -Message "Script is not running as Administrator. Some operations might fail."
    }
    
    # Check for Python
    Log-Message -Level 2 -Message "Checking for Python..."
    try {
        $pythonVersion = (python --version) 2>&1
        Log-Message -Level 2 -Message "Python is already installed: $pythonVersion"
    } catch {
        Log-Message -Level 4 -Message "Python is not installed. Please install Python before continuing."
        return
    }
    
    # Check for Node.js
    Log-Message -Level 2 -Message "Checking for Node.js..."
    try {
        $nodeVersion = node --version
        Log-Message -Level 2 -Message "Node.js is already installed: $nodeVersion"
    } catch {
        Log-Message -Level 4 -Message "Node.js is not installed. Please install Node.js before continuing."
        return
    }
    
    # Check for package managers
    Log-Message -Level 2 -Message "Checking for package managers..."
    $PKG_MGR = "npm"
    try {
        $pnpmVersion = pnpm --version
        Log-Message -Level 2 -Message "pnpm is already installed: $pnpmVersion"
        $PKG_MGR = "pnpm"
    } catch {
        try {
            $npmVersion = npm --version
            Log-Message -Level 2 -Message "npm is already installed: $npmVersion"
            
            # Try to install pnpm
            Log-Message -Level 2 -Message "Attempting to install pnpm..."
            try {
                npm install -g pnpm
                $pnpmVersion = pnpm --version
                Log-Message -Level 2 -Message "Successfully installed pnpm: $pnpmVersion"
                $PKG_MGR = "pnpm"
            } catch {
                Log-Message -Level 3 -Message "Failed to install pnpm, continuing with npm"
            }
        } catch {
            Log-Message -Level 4 -Message "Neither pnpm nor npm found. Please install Node.js with npm."
            return
        }
    }
    
    # Install Python dependencies
    Log-Message -Level 2 -Message "Installing Python dependencies..."
    try {
        python -m pip install --upgrade pip
    } catch {
        Log-Message -Level 3 -Message "Failed to upgrade pip, continuing with existing version"
    }
    
    $requirementsFile = Join-Path $BASE_DIR "requirements.txt"
    if (Test-Path $requirementsFile) {
        try {
            python -m pip install -r $requirementsFile
        } catch {
            Log-Message -Level 4 -Message "Failed to install Python dependencies"
            return
        }
    } else {
        Log-Message -Level 3 -Message "requirements.txt not found, creating minimal version"
        @"
requests>=2.25.0
websockets>=10.0
python-dotenv>=0.19.0
aiohttp>=3.8.0
"@ | Out-File -FilePath $requirementsFile -Encoding UTF8
        
        try {
            python -m pip install -r $requirementsFile
        } catch {
            Log-Message -Level 4 -Message "Failed to install Python dependencies"
            return
        }
    }
    Log-Message -Level 2 -Message "Python dependencies installed successfully"
    
    # Install Node.js dependencies for the project
    $frontendDir = Join-Path $BASE_DIR "OSPAiN2-hub-new"
    if (Test-Path $frontendDir) {
        Log-Message -Level 2 -Message "Installing OSPAiN2-hub-new dependencies..."
        Set-Location -Path $frontendDir
        
        # Remove node_modules if clean install is needed
        if ($Clean) {
            Log-Message -Level 2 -Message "Removing existing node_modules for clean install"
            if (Test-Path "node_modules") {
                Remove-Item -Path "node_modules" -Recurse -Force
            }
        }
        
        # Install dependencies
        try {
            & $PKG_MGR install
        } catch {
            Log-Message -Level 4 -Message "Failed to install frontend dependencies"
            return
        }
        Log-Message -Level 2 -Message "Frontend dependencies installed successfully"
        
        # Return to original directory
        Set-Location -Path $BASE_DIR
    } else {
        Log-Message -Level 4 -Message "OSPAiN2-hub-new directory not found"
        return
    }
    
    # Install global tools
    Log-Message -Level 2 -Message "Installing global tools..."
    
    # Check if TypeScript is installed globally
    try {
        $tscVersion = tsc --version
        Log-Message -Level 2 -Message "TypeScript is already installed globally: $tscVersion"
    } catch {
        Log-Message -Level 2 -Message "Installing TypeScript globally..."
        try {
            npm install -g typescript
        } catch {
            Log-Message -Level 3 -Message "Failed to install TypeScript globally"
        }
    }
    
    # Check if Vite is installed globally
    try {
        $viteVersion = vite --version
        Log-Message -Level 2 -Message "Vite is already installed globally: $viteVersion"
    } catch {
        Log-Message -Level 2 -Message "Installing Vite globally..."
        try {
            npm install -g vite
        } catch {
            Log-Message -Level 3 -Message "Failed to install Vite globally"
        }
    }
    
    # Create an empty .env file if it doesn't exist
    $envFile = Join-Path $BASE_DIR ".env"
    if (-not (Test-Path $envFile)) {
        Log-Message -Level 2 -Message "Creating empty .env file..."
        @"
# OSPAiN2 Environment Configuration
# Created by ospain.ps1 install on $(Get-Date)

# MCP Server Configuration
MCP_SERVER_PORT=3002

# Frontend Configuration
VITE_API_URL=http://localhost:3002
"@ | Out-File -FilePath $envFile -Encoding UTF8
        Log-Message -Level 2 -Message "Empty .env file created"
    }
    
    # Create logs directory if it doesn't exist
    if (-not (Test-Path $LOGS_DIR)) {
        New-Item -Path $LOGS_DIR -ItemType Directory | Out-Null
    }
    Log-Message -Level 2 -Message "Created logs directory (if it didn't exist)"
    
    # Final summary
    Log-Message -Level 2 -Message "==== Installation Summary ===="
    try {
        $pythonVersion = (python --version) 2>&1
        Log-Message -Level 2 -Message "Python version: $pythonVersion"
    } catch {}
    
    try {
        $nodeVersion = node --version
        Log-Message -Level 2 -Message "Node.js version: $nodeVersion"
    } catch {}
    
    try {
        $pkgVersion = & $PKG_MGR --version
        Log-Message -Level 2 -Message "Package manager: $PKG_MGR version $pkgVersion"
    } catch {}
    
    Log-Message -Level 2 -Message "Frontend dependencies: Installed in OSPAiN2-hub-new"
    Log-Message -Level 2 -Message "Environment setup: .env file available"
    
    # Show next steps
    Log-Message -Level 2 -Message "OSPAiN2 dependency installation complete"
    Log-Message -Level 2 -Message ""
    Log-Message -Level 2 -Message "Next steps:"
    Log-Message -Level 2 -Message "1. Start the server: .\ospain.ps1 start"
    Log-Message -Level 2 -Message "2. Check system status: .\ospain.ps1 status"
}

# Command: clean - Clean up old log files
function Clear-OSPAiNLogs {
    param (
        [int]$Days = 7
    )
    
    # Validate that DAYS is a positive number
    if ($Days -lt 1) {
        Log-Message -Level 4 -Message "Invalid days parameter: $Days (must be a positive number)"
        Write-Host "Usage: .\ospain.ps1 clean [Days]"
        Write-Host "  Days: Number of days to keep (default: 7)"
        return
    }
    
    Log-Message -Level 2 -Message "Starting log cleanup"
    Log-Message -Level 2 -Message "Will keep logs from the last $Days days"
    
    # Check if logs directory exists
    if (-not (Test-Path $LOGS_DIR)) {
        Log-Message -Level 3 -Message "Logs directory does not exist, creating it"
        New-Item -Path $LOGS_DIR -ItemType Directory | Out-Null
    }
    
    # Count log files before deletion
    $logFiles = Get-ChildItem -Path $LOGS_DIR -Filter "*.log"
    $beforeCount = $logFiles.Count
    Log-Message -Level 2 -Message "Found $beforeCount log files before cleanup"
    
    # Get current log filename to preserve it
    $currentLog = Split-Path -Leaf $LOG_FILE
    Log-Message -Level 1 -Message "Preserving current log: $currentLog"
    
    # Delete log files older than DAYS days
    Log-Message -Level 2 -Message "Finding log files older than $Days days..."
    
    # Find files to delete (excluding current log)
    $cutoffDate = (Get-Date).AddDays(-$Days)
    $oldFiles = $logFiles | Where-Object { 
        ($_.LastWriteTime -lt $cutoffDate) -and ($_.Name -ne $currentLog)
    }
    
    $oldCount = $oldFiles.Count
    
    if ($oldCount -gt 0) {
        # Delete the files
        Log-Message -Level 2 -Message "Deleting $oldCount old log files"
        try {
            $oldFiles | Remove-Item -Force
            Log-Message -Level 2 -Message "Successfully deleted old log files"
        } catch {
            Log-Message -Level 3 -Message "Some files could not be deleted: $_"
        }
    } else {
        Log-Message -Level 2 -Message "No log files older than $Days days found"
    }
    
    # Count log files after deletion
    $afterCount = (Get-ChildItem -Path $LOGS_DIR -Filter "*.log").Count
    Log-Message -Level 2 -Message "Remaining log files: $afterCount"
    
    # Calculate disk space
    $folderSize = (Get-ChildItem -Path $LOGS_DIR -Recurse | Measure-Object -Property Length -Sum).Sum
    $formattedSize = if ($folderSize -gt 1MB) {
        "{0:N2} MB" -f ($folderSize / 1MB)
    } elseif ($folderSize -gt 1KB) {
        "{0:N2} KB" -f ($folderSize / 1KB)
    } else {
        "$folderSize bytes"
    }
    Log-Message -Level 2 -Message "Current log directory size: $formattedSize"
    
    Log-Message -Level 2 -Message "Log cleanup completed successfully"
}

# Command: help - Show usage information
function Show-OSPAiNHelp {
    Write-Host "OSPAiN2 Management Script (PowerShell Version)"
    Write-Host ""
    Write-Host "Usage: .\ospain.ps1 <command> [options]"
    Write-Host ""
    Write-Host "Commands:"
    Write-Host "  start                   Start OSPAiN2 Hub (MCP server and frontend)"
    Write-Host "  app                     Start only the frontend app"
    Write-Host "  status                  Check OSPAiN2 system status"
    Write-Host "  install [-Clean]        Install all dependencies (-Clean for fresh install)"
    Write-Host "  clean [Days]            Clean up log files older than [Days] days (default: 7)"
    Write-Host "  help                    Show this help message"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  .\ospain.ps1 start                Start OSPAiN2 Hub"
    Write-Host "  .\ospain.ps1 status               Check system status"
    Write-Host "  .\ospain.ps1 install -Clean       Perform a clean install of dependencies"
    Write-Host "  .\ospain.ps1 clean 14             Clean up logs older than 14 days"
}

# Main script logic
Log-Message -Level 2 "Starting OSPAiN2 script"

if ($args.Count -eq 0) {
    Show-OSPAiNHelp
    exit 0
}

# Process the command
switch ($args[0].ToLower()) {
    "start" {
        Start-OSPAiN
    }
    "app" {
        Start-OSPAiNApp
    }
    "status" {
        Get-OSPAiNStatus
    }
    "install" {
        $clean = $args.Contains("-Clean")
        Install-OSPAiNDependencies -Clean:$clean
    }
    "clean" {
        $days = 7
        if ($args.Count -gt 1 -and $args[1] -match '^\d+$') {
            $days = [int]$args[1]
        }
        Clear-OSPAiNLogs -Days $days
    }
    "help" {
        Show-OSPAiNHelp
    }
    default {
        Write-Host "Unknown command: $($args[0])"
        Show-OSPAiNHelp
        exit 1
    }
} 