@echo off
setlocal enabledelayedexpansion

echo MCP Server Startup Script (Windows)
echo ===================================

:: Set the working directory to the OSPAiN2 project root
cd %~dp0\..

:: Check if Python is installed
where python >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Error: Python is not installed or not in the PATH.
    echo Please install Python from https://www.python.org/
    exit /b 1
)

:: Create logs directory if it doesn't exist
if not exist "logs" (
    echo Creating logs directory...
    mkdir logs
)

:: Create data directory if it doesn't exist
if not exist "data" (
    echo Creating data directory...
    mkdir data
)

:: Check if mcp_server.py exists
if not exist "mcp_server.py" (
    echo Error: mcp_server.py not found in the project root directory.
    echo Please ensure you're running this script from the correct location.
    exit /b 1
)

:: Start the MCP server
echo Starting MCP server...

:: Check if server is already running
:: We use 'findstr' to find a process with mcp_server.py
set SERVER_RUNNING=0
for /f "tokens=*" %%i in ('tasklist /fi "imagename eq python.exe" /fo csv /nh ^| findstr "mcp_server.py"') do (
    set SERVER_RUNNING=1
)

if !SERVER_RUNNING! equ 1 (
    echo MCP server is already running.
) else (
    :: Run the server in a new window
    echo Starting MCP server in a new window...
    start "MCP Server" cmd /c "python mcp_server.py > logs\mcp-server.log 2>&1"
    
    :: Create a marker file with the window title for later management
    echo MCP Server > data\mcp-server.pid
    
    echo MCP server started.
    echo Logs are being written to: %cd%\logs\mcp-server.log
)

:: Start the browser tools if requested
if "%1"=="with-browser-tools" (
    echo Starting Browser Tools...
    
    :: Check if browser tools script exists
    if exist "start-browser-tools.bat" (
        :: Run browser tools in a new window
        start "Browser Tools" cmd /c "start-browser-tools.bat > logs\browser-tools.log 2>&1"
        echo Browser tools started. Logs are being written to: %cd%\logs\browser-tools.log
    ) else (
        echo Warning: start-browser-tools.bat not found. Skipping browser tools startup.
    )
)

echo MCP server startup completed. 