@echo off
:: ospain.bat - Unified script for OSPAiN2 management (Windows version)
:: This script consolidates all OSPAiN2 management functionality

setlocal enabledelayedexpansion

:: Base directory is the script's location
set BASE_DIR=%~dp0
set LOGS_DIR=%BASE_DIR%logs
if not exist "%LOGS_DIR%" mkdir "%LOGS_DIR%"

:: Timestamp for logging
set TIMESTAMP=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%
set LOG_FILE=%LOGS_DIR%\ospain_%TIMESTAMP%.log

:: Create log file header
echo ======================================= > "%LOG_FILE%"
echo OSPAiN2 Log - %date% %time% >> "%LOG_FILE%"
echo Script: %~nx0 %* >> "%LOG_FILE%"
echo System: Windows %OS% >> "%LOG_FILE%"
echo ======================================= >> "%LOG_FILE%"
echo. >> "%LOG_FILE%"

:: Logging function - call :log level message
call :log 2 "Starting OSPAiN2 script"

:: Process the command
if "%~1"=="" (
    call :cmd_help
    exit /b 0
)

if "%~1"=="start" (
    call :cmd_start
    exit /b %ERRORLEVEL%
) else if "%~1"=="app" (
    call :cmd_app
    exit /b %ERRORLEVEL%
) else if "%~1"=="status" (
    call :cmd_status
    exit /b %ERRORLEVEL%
) else if "%~1"=="install" (
    call :cmd_install %2
    exit /b %ERRORLEVEL%
) else if "%~1"=="clean" (
    call :cmd_clean %2
    exit /b %ERRORLEVEL%
) else if "%~1"=="help" (
    call :cmd_help
    exit /b 0
) else (
    echo Unknown command: %1
    call :cmd_help
    exit /b 1
)

exit /b 0

:log
setlocal
set LEVEL=%~1
set MSG=%~2
set TIMESTAMP=%date% %time%
set LEVEL_NAME=INFO
if "%LEVEL%"=="1" set LEVEL_NAME=DEBUG
if "%LEVEL%"=="2" set LEVEL_NAME=INFO
if "%LEVEL%"=="3" set LEVEL_NAME=WARN
if "%LEVEL%"=="4" set LEVEL_NAME=ERROR
if "%LEVEL%"=="5" set LEVEL_NAME=FATAL

:: Log to file
echo [%TIMESTAMP%] [%LEVEL_NAME%] %MSG% >> "%LOG_FILE%"

:: Display in console with color
echo [%TIMESTAMP%] [%LEVEL_NAME%] %MSG%
if "%LEVEL%"=="5" (
    exit /b 1
)
endlocal
exit /b 0

:: Function to check if a process is running
:check_process
setlocal
set PROCESS_NAME=%~1
set GREP_PATTERN=%~2
tasklist /FI "IMAGENAME eq %GREP_PATTERN%" 2>NUL | find /I "%GREP_PATTERN%" >NUL
if %ERRORLEVEL% EQU 0 (
    call :log 2 "%PROCESS_NAME% is running"
    endlocal & exit /b 0
) else (
    call :log 3 "%PROCESS_NAME% is not running"
    endlocal & exit /b 1
)

:: Function to check if a port is in use
:check_port
setlocal
set PORT=%~1
set SERVICE_NAME=%~2

netstat -an | find ":%PORT% " | find "LISTENING" >NUL
if %ERRORLEVEL% EQU 0 (
    call :log 2 "%SERVICE_NAME% is listening on port %PORT%"
    endlocal & exit /b 0
) else (
    call :log 3 "%SERVICE_NAME% is not listening on port %PORT%"
    endlocal & exit /b 1
)

:: Command: start - Start OSPAiN2 Hub
:cmd_start
call :log 2 "Starting OSPAiN2 Hub"

:: Change to base directory
cd /d "%BASE_DIR%"
call :log 1 "Working directory: %CD%"

:: Check if Python is installed
python --version >NUL 2>&1
if %ERRORLEVEL% NEQ 0 (
    call :log 4 "Python is not installed. Please install Python."
    exit /b 1
)

:: Check if the OSPAiN2-hub-new directory exists
if not exist "OSPAiN2-hub-new" (
    call :log 4 "OSPAiN2-hub-new directory not found."
    exit /b 1
)

:: Check if package manager is installed
set PKG_MGR=npm
pnpm --version >NUL 2>&1
if %ERRORLEVEL% EQU 0 (
    set PKG_MGR=pnpm
) else (
    npm --version >NUL 2>&1
    if %ERRORLEVEL% NEQ 0 (
        call :log 4 "Neither pnpm nor npm found. Please install one of them."
        exit /b 1
    )
)

call :log 2 "Using package manager: %PKG_MGR%"

:: Start the MCP server
call :log 2 "Starting MCP server on port 3002"
set MCP_LOG=%LOGS_DIR%\mcp_server_%TIMESTAMP%.log
start /b cmd /c "python mcp_server.py --port 3002 > "%MCP_LOG%" 2>&1"
:: Store process ID for later cleanup
for /f "tokens=2" %%a in ('tasklist /fi "imagename eq python.exe" /fo list ^| findstr "PID:"') do set MCP_PID=%%a
call :log 2 "MCP server started with PID: %MCP_PID%"

:: Wait for server to initialize
call :log 1 "Waiting for server to initialize..."
timeout /t 2 /nobreak >NUL

:: Verify MCP server is running
tasklist /FI "PID eq %MCP_PID%" 2>NUL | find "%MCP_PID%" >NUL
if %ERRORLEVEL% NEQ 0 (
    call :log 4 "MCP server failed to start. Check logs/mcp_server_*.log"
    exit /b 1
)

:: Then start the frontend
call :log 2 "Starting OSPAiN2-hub-new frontend"
cd OSPAiN2-hub-new
if %ERRORLEVEL% NEQ 0 (
    call :log 4 "Failed to change to OSPAiN2-hub-new directory"
    exit /b 1
)

:: Check if node_modules exists, if not run install
if not exist "node_modules" (
    call :log 3 "node_modules not found. Running %PKG_MGR% install"
    %PKG_MGR% install
    if %ERRORLEVEL% NEQ 0 (
        call :log 4 "Failed to install dependencies"
        exit /b 1
    )
)

:: Start the development server
call :log 2 "Starting development server with %PKG_MGR%"
%PKG_MGR% run dev

:: This will only execute when dev server terminates
call :log 2 "Development server stopped"

:: Clean up MCP server process
tasklist /FI "PID eq %MCP_PID%" 2>NUL | find "%MCP_PID%" >NUL
if %ERRORLEVEL% EQU 0 (
    call :log 2 "Stopping MCP server (PID: %MCP_PID%)"
    taskkill /F /PID %MCP_PID% >NUL 2>&1
)

call :log 2 "OSPAiN2 Hub shutdown complete"
exit /b 0

:: Command: app - Start only the frontend app
:cmd_app
call :log 2 "Starting OSPAiN2 frontend only"

:: Check if the OSPAiN2-hub-new directory exists
if not exist "%BASE_DIR%OSPAiN2-hub-new" (
    call :log 4 "OSPAiN2-hub-new directory not found."
    exit /b 1
)

:: Check if package manager is installed
set PKG_MGR=npm
pnpm --version >NUL 2>&1
if %ERRORLEVEL% EQU 0 (
    set PKG_MGR=pnpm
) else (
    npm --version >NUL 2>&1
    if %ERRORLEVEL% NEQ 0 (
        call :log 4 "Neither pnpm nor npm found. Please install one of them."
        exit /b 1
    )
)

call :log 2 "Using package manager: %PKG_MGR%"

:: Change to the frontend directory
call :log 2 "Changing to OSPAiN2-hub-new directory"
cd /d "%BASE_DIR%OSPAiN2-hub-new"
if %ERRORLEVEL% NEQ 0 (
    call :log 4 "Failed to change to OSPAiN2-hub-new directory"
    exit /b 1
)

:: Check if node_modules exists, if not run install
if not exist "node_modules" (
    call :log 3 "node_modules not found. Running %PKG_MGR% install"
    %PKG_MGR% install
    if %ERRORLEVEL% NEQ 0 (
        call :log 4 "Failed to install dependencies"
        exit /b 1
    )
)

:: Start the frontend development server
call :log 2 "Starting frontend development server with %PKG_MGR%"
%PKG_MGR% run dev
if %ERRORLEVEL% NEQ 0 (
    call :log 4 "Failed to start development server"
    exit /b 1
)

:: This point is reached when the development server is stopped
call :log 2 "Frontend development server has stopped"
exit /b 0

:: Command: status - Check OSPAiN2 system status
:cmd_status
call :log 2 "Checking OSPAiN2 system status"

:: Check system requirements
call :log 2 "Checking system requirements"

:: Check Python
python --version >NUL 2>&1
if %ERRORLEVEL% EQU 0 (
    for /f "tokens=*" %%a in ('python --version 2^>^&1') do set PYTHON_VERSION=%%a
    call :log 2 "Python is installed: !PYTHON_VERSION!"
) else (
    call :log 4 "Python is not installed"
)

:: Check Node.js
node --version >NUL 2>&1
if %ERRORLEVEL% EQU 0 (
    for /f "tokens=*" %%a in ('node --version') do set NODE_VERSION=%%a
    call :log 2 "Node.js is installed: !NODE_VERSION!"
) else (
    call :log 4 "Node.js is not installed"
)

:: Check package managers
pnpm --version >NUL 2>&1
if %ERRORLEVEL% EQU 0 (
    for /f "tokens=*" %%a in ('pnpm --version') do set PNPM_VERSION=%%a
    call :log 2 "pnpm is installed: !PNPM_VERSION!"
) else (
    call :log 3 "pnpm is not installed"
)

npm --version >NUL 2>&1
if %ERRORLEVEL% EQU 0 (
    for /f "tokens=*" %%a in ('npm --version') do set NPM_VERSION=%%a
    call :log 2 "npm is installed: !NPM_VERSION!"
) else (
    call :log 3 "npm is not installed"
)

:: Check directory structure
call :log 2 "Checking directory structure"
if exist "%BASE_DIR%OSPAiN2-hub-new" (
    call :log 2 "OSPAiN2-hub-new directory exists"
) else (
    call :log 4 "OSPAiN2-hub-new directory is missing"
)

:: Check if frontend dependencies are installed
if exist "%BASE_DIR%OSPAiN2-hub-new\node_modules" (
    call :log 2 "Frontend dependencies are installed"
) else (
    call :log 3 "Frontend dependencies are not installed"
)

:: Check running services
call :log 2 "Checking running services"

:: Check MCP server process
set MCP_RUNNING=1
tasklist | find /i "python.exe" > nul
if %ERRORLEVEL% EQU 0 (
    call :log 2 "MCP Server is running"
    set MCP_RUNNING=0
) else (
    call :log 3 "MCP Server is not running"
    set MCP_RUNNING=1
)

:: Check frontend development server
set FRONTEND_RUNNING=1
tasklist | find /i "node.exe" > nul
if %ERRORLEVEL% EQU 0 (
    call :log 2 "Frontend Dev Server is running"
    set FRONTEND_RUNNING=0
) else (
    call :log 3 "Frontend Dev Server is not running"
    set FRONTEND_RUNNING=1
)

:: Check ports
call :log 2 "Checking network ports"

:: Check MCP server port
set MCP_PORT=1
netstat -ano | find ":3002" | find "LISTENING" > nul
if %ERRORLEVEL% EQU 0 (
    call :log 2 "MCP Server is listening on port 3002"
    set MCP_PORT=0
) else (
    call :log 3 "MCP Server is not listening on port 3002"
    set MCP_PORT=1
)

:: Check frontend development server port
set FRONTEND_PORT=1
netstat -ano | find ":3001" | find "LISTENING" > nul
if %ERRORLEVEL% EQU 0 (
    call :log 2 "Frontend Dev Server is listening on port 3001"
    set FRONTEND_PORT=0
) else (
    call :log 3 "Frontend Dev Server is not listening on port 3001"
    set FRONTEND_PORT=1
)

:: Check logs
call :log 2 "Checking log files"
if exist "%LOGS_DIR%" (
    dir /b "%LOGS_DIR%\*.log" > nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        for /f %%a in ('dir /b "%LOGS_DIR%\*.log" ^| find /c /v ""') do set LOG_COUNT=%%a
        call :log 2 "Logs directory exists with !LOG_COUNT! log files"
    ) else (
        call :log 2 "Logs directory exists but contains no log files"
    )
) else (
    call :log 3 "Logs directory does not exist"
)

:: Summary
call :log 2 "==== System Status Summary ===="
if %MCP_RUNNING% EQU 0 if %MCP_PORT% EQU 0 (
    call :log 2 "✅ MCP Server: Running"
) else (
    call :log 3 "❌ MCP Server: Not running"
)

if %FRONTEND_RUNNING% EQU 0 if %FRONTEND_PORT% EQU 0 (
    call :log 2 "✅ Frontend Server: Running"
) else (
    call :log 3 "❌ Frontend Server: Not running"
)

:: Check disk space
for /f "tokens=3" %%a in ('dir /-c /w "%BASE_DIR%" ^| findstr "bytes free"') do set DISK_AVAILABLE=%%a
call :log 2 "Available disk space: %DISK_AVAILABLE% bytes"

:: Final status message
if %MCP_RUNNING% EQU 0 if %FRONTEND_RUNNING% EQU 0 (
    call :log 2 "System status: All components are running"
) else if %MCP_RUNNING% EQU 0 (
    call :log 3 "System status: Only MCP server is running"
) else if %FRONTEND_RUNNING% EQU 0 (
    call :log 3 "System status: Only Frontend server is running"
) else (
    call :log 3 "System status: No components are running"
)

call :log 2 "Status check complete"
exit /b 0

:: Command: install - Install all dependencies
:cmd_install
call :log 2 "Starting OSPAiN2 dependency installation"

:: Check for Python
call :log 2 "Checking for Python..."
python --version >NUL 2>&1
if %ERRORLEVEL% EQU 0 (
    for /f "tokens=*" %%a in ('python --version 2^>^&1') do set PYTHON_VERSION=%%a
    call :log 2 "Python is already installed: !PYTHON_VERSION!"
) else (
    call :log 4 "Python is not installed. Please install Python before continuing."
    exit /b 1
)

:: Check for Node.js
call :log 2 "Checking for Node.js..."
node --version >NUL 2>&1
if %ERRORLEVEL% EQU 0 (
    for /f "tokens=*" %%a in ('node --version') do set NODE_VERSION=%%a
    call :log 2 "Node.js is already installed: !NODE_VERSION!"
) else (
    call :log 4 "Node.js is not installed. Please install Node.js before continuing."
    exit /b 1
)

:: Check for package managers
call :log 2 "Checking for package managers..."
set PKG_MGR=npm
pnpm --version >NUL 2>&1
if %ERRORLEVEL% EQU 0 (
    for /f "tokens=*" %%a in ('pnpm --version') do set PNPM_VERSION=%%a
    call :log 2 "pnpm is already installed: !PNPM_VERSION!"
    set PKG_MGR=pnpm
) else (
    npm --version >NUL 2>&1
    if %ERRORLEVEL% EQU 0 (
        for /f "tokens=*" %%a in ('npm --version') do set NPM_VERSION=%%a
        call :log 2 "npm is already installed: !NPM_VERSION!"
        
        :: Try to install pnpm
        call :log 2 "Attempting to install pnpm..."
        npm install -g pnpm
        pnpm --version >NUL 2>&1
        if %ERRORLEVEL% EQU 0 (
            for /f "tokens=*" %%a in ('pnpm --version') do set PNPM_VERSION=%%a
            call :log 2 "Successfully installed pnpm: !PNPM_VERSION!"
            set PKG_MGR=pnpm
        ) else (
            call :log 3 "Failed to install pnpm, continuing with npm"
        )
    ) else (
        call :log 4 "Neither pnpm nor npm found. Please install Node.js with npm."
        exit /b 1
    )
)

:: Install Python dependencies
call :log 2 "Installing Python dependencies..."
python -m pip install --upgrade pip
if %ERRORLEVEL% NEQ 0 (
    call :log 3 "Failed to upgrade pip, continuing with existing version"
)

if exist "%BASE_DIR%requirements.txt" (
    python -m pip install -r "%BASE_DIR%requirements.txt"
    if %ERRORLEVEL% NEQ 0 (
        call :log 4 "Failed to install Python dependencies"
        exit /b 1
    )
) else (
    call :log 3 "requirements.txt not found, creating minimal version"
    (
        echo requests^>=2.25.0
        echo websockets^>=10.0
        echo python-dotenv^>=0.19.0
        echo aiohttp^>=3.8.0
    ) > "%BASE_DIR%requirements.txt"
    
    python -m pip install -r "%BASE_DIR%requirements.txt"
    if %ERRORLEVEL% NEQ 0 (
        call :log 4 "Failed to install Python dependencies"
        exit /b 1
    )
)
call :log 2 "Python dependencies installed successfully"

:: Install Node.js dependencies for the project
if exist "%BASE_DIR%OSPAiN2-hub-new" (
    call :log 2 "Installing OSPAiN2-hub-new dependencies..."
    cd /d "%BASE_DIR%OSPAiN2-hub-new"
    if %ERRORLEVEL% NEQ 0 (
        call :log 4 "Failed to change to OSPAiN2-hub-new directory"
        exit /b 1
    )
    
    :: Remove node_modules if clean install is needed
    if "%~1"=="--clean" (
        call :log 2 "Removing existing node_modules for clean install"
        if exist "node_modules" rmdir /s /q node_modules
    )
    
    :: Install dependencies
    %PKG_MGR% install
    if %ERRORLEVEL% NEQ 0 (
        call :log 4 "Failed to install frontend dependencies"
        exit /b 1
    )
    call :log 2 "Frontend dependencies installed successfully"
    
    :: Return to original directory
    cd /d "%BASE_DIR%"
) else (
    call :log 4 "OSPAiN2-hub-new directory not found"
    exit /b 1
)

:: Install global tools
call :log 2 "Installing global tools..."

:: Check if TypeScript is installed globally
tsc --version >NUL 2>&1
if %ERRORLEVEL% NEQ 0 (
    call :log 2 "Installing TypeScript globally..."
    npm install -g typescript
    if %ERRORLEVEL% NEQ 0 (
        call :log 3 "Failed to install TypeScript globally"
    )
) else (
    for /f "tokens=*" %%a in ('tsc --version') do set TSC_VERSION=%%a
    call :log 2 "TypeScript is already installed globally: !TSC_VERSION!"
)

:: Check if Vite is installed globally
vite --version >NUL 2>&1
if %ERRORLEVEL% NEQ 0 (
    call :log 2 "Installing Vite globally..."
    npm install -g vite
    if %ERRORLEVEL% NEQ 0 (
        call :log 3 "Failed to install Vite globally"
    )
) else (
    for /f "tokens=*" %%a in ('vite --version 2^>^&1') do set VITE_VERSION=%%a
    call :log 2 "Vite is already installed globally: !VITE_VERSION!"
)

:: Create an empty .env file if it doesn't exist
if not exist "%BASE_DIR%.env" (
    call :log 2 "Creating empty .env file..."
    (
        echo # OSPAiN2 Environment Configuration
        echo # Created by ospain.bat install on %date%
        echo.
        echo # MCP Server Configuration
        echo MCP_SERVER_PORT=3002
        echo.
        echo # Frontend Configuration
        echo VITE_API_URL=http://localhost:3002
    ) > "%BASE_DIR%.env"
    call :log 2 "Empty .env file created"
)

:: Create logs directory if it doesn't exist
if not exist "%LOGS_DIR%" mkdir "%LOGS_DIR%"
call :log 2 "Created logs directory (if it didn't exist)"

:: Final summary
call :log 2 "==== Installation Summary ===="
for /f "tokens=*" %%a in ('python --version 2^>^&1') do call :log 2 "Python version: %%a"
for /f "tokens=*" %%a in ('node --version') do call :log 2 "Node.js version: %%a"
call :log 2 "Package manager: %PKG_MGR% version %PNPM_VERSION%%NPM_VERSION%"
call :log 2 "Frontend dependencies: Installed in OSPAiN2-hub-new"
call :log 2 "Environment setup: .env file available"

:: Show next steps
call :log 2 "OSPAiN2 dependency installation complete"
call :log 2 ""
call :log 2 "Next steps:"
call :log 2 "1. Start the server: ospain.bat start"
call :log 2 "2. Check system status: ospain.bat status"
exit /b 0

:: Command: clean - Clean up old log files
:cmd_clean
:: Default to 7 days if not specified
set DAYS=7
if not "%~1"=="" set DAYS=%~1

:: Validate that DAYS is a number
echo %DAYS%|findstr /r "^[1-9][0-9]*$" >nul
if %ERRORLEVEL% neq 0 (
    call :log 4 "Invalid days parameter: %DAYS% (must be a positive number)"
    echo Usage: %0 clean [days]
    echo   days: Number of days to keep (default: 7)
    exit /b 1
)

call :log 2 "Starting log cleanup"
call :log 2 "Will keep logs from the last %DAYS% days"

:: Check if logs directory exists
if not exist "%LOGS_DIR%" (
    call :log 3 "Logs directory does not exist, creating it"
    mkdir "%LOGS_DIR%"
)

:: Count log files before deletion
set BEFORE_COUNT=0
for %%f in ("%LOGS_DIR%\*.log") do set /a BEFORE_COUNT+=1
call :log 2 "Found %BEFORE_COUNT% log files before cleanup"

:: Get current log filename to preserve it
for %%F in ("%LOG_FILE%") do set CURRENT_LOG=%%~nxF
call :log 1 "Preserving current log: %CURRENT_LOG%"

:: Delete log files older than DAYS days using forfiles
call :log 2 "Finding log files older than %DAYS% days..."

set OLD_COUNT=0
set DELETED_COUNT=0

:: Use forfiles to find and delete old files
if %BEFORE_COUNT% gtr 0 (
    forfiles /p "%LOGS_DIR%" /s /m *.log /d -%DAYS% /c "cmd /c if @file NEQ \"%CURRENT_LOG%\" (echo @path & set /a OLD_COUNT+=1 & del @path & set /a DELETED_COUNT+=1)" 2>nul
    
    if !OLD_COUNT! gtr 0 (
        call :log 2 "Deleted !DELETED_COUNT! old log files"
    ) else (
        call :log 2 "No log files older than %DAYS% days found"
    )
) else (
    call :log 2 "No log files found to process"
)

:: Count log files after deletion
set AFTER_COUNT=0
for %%f in ("%LOGS_DIR%\*.log") do set /a AFTER_COUNT+=1
call :log 2 "Remaining log files: %AFTER_COUNT%"

:: Calculate disk space (Windows version)
set SIZE=0
for /f "tokens=3" %%a in ('dir %LOGS_DIR% /-c ^| findstr "bytes"') do set SIZE=%%a
call :log 2 "Current log directory size: approximately %SIZE% bytes"

call :log 2 "Log cleanup completed successfully"
exit /b 0

:: Command: help - Show usage information
:cmd_help
echo OSPAiN2 Management Script (Windows Version)
echo.
echo Usage: %0 ^<command^> [options]
echo.
echo Commands:
echo   start                   Start OSPAiN2 Hub (MCP server and frontend)
echo   app                     Start only the frontend app
echo   status                  Check OSPAiN2 system status
echo   install [--clean]       Install all dependencies (--clean for fresh install)
echo   clean [days]            Clean up log files older than [days] days (default: 7)
echo   help                    Show this help message
echo.
echo Examples:
echo   %0 start                Start OSPAiN2 Hub
echo   %0 status               Check system status
echo   %0 install --clean      Perform a clean install of dependencies
echo   %0 clean 14             Clean up logs older than 14 days
exit /b 0 