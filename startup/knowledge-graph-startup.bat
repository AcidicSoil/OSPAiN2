@echo off
setlocal enabledelayedexpansion

echo Knowledge Graph Server Startup Script (Windows)
echo ================================================

:: Set the working directory to the OSPAiN2 project root
cd %~dp0\..

:: Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Error: Node.js is not installed or not in the PATH.
    echo Please install Node.js from https://nodejs.org/
    exit /b 1
)

:: Check for npm
where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Error: npm is not installed or not in the PATH.
    exit /b 1
)

:: Create data directory if it doesn't exist
if not exist "data" (
    echo Creating data directory for Knowledge Graph storage...
    mkdir data
)

:: Create logs directory if it doesn't exist
if not exist "logs" (
    echo Creating logs directory...
    mkdir logs
)

:: Check if Knowledge Graph server is installed
if not exist "mcp-knowledge-graph" (
    echo Knowledge Graph server not found. Attempting to install...
    
    if exist "mcp-servers" (
        cd mcp-servers
    )
    
    :: Clone the Knowledge Graph repository
    git clone https://github.com/shaneholloman/mcp-knowledge-graph.git
    
    if %ERRORLEVEL% neq 0 (
        echo Failed to clone Knowledge Graph repository.
        echo You can install it manually following these steps:
        echo 1. git clone https://github.com/shaneholloman/mcp-knowledge-graph.git
        echo 2. cd mcp-knowledge-graph
        echo 3. npm install
        echo 4. npm run build
        exit /b 1
    )
    
    :: Install dependencies and build
    cd mcp-knowledge-graph
    call npm install
    call npm run build
    
    cd ..\..
) else (
    echo Knowledge Graph server already installed.
)

:: Start the Knowledge Graph server
echo Starting Knowledge Graph server...

:: Determine the Knowledge Graph server location
if exist "mcp-knowledge-graph" (
    cd mcp-knowledge-graph
) else if exist "mcp-servers\mcp-knowledge-graph" (
    cd mcp-servers\mcp-knowledge-graph
) else (
    echo Error: Cannot find Knowledge Graph server directory.
    exit /b 1
)

:: Check if the dist directory exists
if not exist "dist" (
    echo Building Knowledge Graph server...
    call npm run build
)

:: Check if server is already running
:: We use 'findstr' to find a process with the memory-path parameter
:: which is specific to the Knowledge Graph server
set SERVER_RUNNING=0
for /f "tokens=2" %%i in ('tasklist /fi "imagename eq node.exe" /fo csv /nh ^| findstr "memory-path"') do (
    set SERVER_RUNNING=1
)

if !SERVER_RUNNING! equ 1 (
    echo Knowledge Graph server is already running.
) else (
    :: Run the server in a new window
    echo Starting Knowledge Graph server in a new window...
    start "Knowledge Graph Server" cmd /c "node dist\index.js --memory-path ..\..\data\memory.jsonl > ..\..\logs\knowledge-graph.log 2>&1"
    
    :: Create a PID file with the window title for later management
    echo Knowledge Graph Server > ..\..\data\knowledge-graph.pid
    
    echo Knowledge Graph server started.
    echo Logs are being written to: %cd%\..\..\logs\knowledge-graph.log
)

echo Knowledge Graph server startup completed. 