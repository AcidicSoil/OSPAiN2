@echo off
setlocal enabledelayedexpansion

:: Combined startup script for OSPAiN₂ ecosystem
:: This script starts the OSPAiN₂ server, the Knowledge Graph server, and the MCP server

echo =========================================
echo   OSPAiN₂ Ecosystem Startup Script
echo =========================================
echo.

:: Check if development mode is requested
set DEV_MODE=false
if "%1"=="dev" (
    set DEV_MODE=true
    echo Starting in DEVELOPMENT mode
) else (
    echo Starting in PRODUCTION mode
)

:: Create logs directory if it doesn't exist
if not exist logs mkdir logs

:: Start the MCP server in a new window
echo.
echo Starting MCP server...
start "MCP Server" cmd /c "startup\mcp-server-startup.bat"

:: Give MCP server time to start
echo Waiting for MCP server to initialize...
timeout /t 3 /nobreak > nul

:: Start the Knowledge Graph server in a new window
echo.
echo Starting Knowledge Graph server...
start "Knowledge Graph Server" cmd /c "startup\knowledge-graph-startup.bat"

:: Give Knowledge Graph server time to start
echo Waiting for Knowledge Graph server to initialize...
timeout /t 5 /nobreak > nul

:: Start the OSPAiN₂ server
echo.
echo Starting OSPAiN₂ server...
if "%DEV_MODE%"=="true" (
    call startup\ospain2-startup.bat dev
) else (
    call startup\ospain2-startup.bat
)

:: Start Notion services and run tests
echo Starting Notion services and running integration tests...
call startup\notion-integration-startup.bat

:: Run Notion integration tests
if exist ".env" (
    echo Running Notion integration tests...
    call startup\run_notion_tests.bat
) else (
    echo Warning: .env file not found. Skipping Notion integration tests.
)

:: When OSPAiN₂ server stops, inform the user that other servers are still running
echo.
echo OSPAiN₂ server has stopped. Knowledge Graph and MCP servers are still running in separate windows.
echo You can close them manually or restart all servers using this script.

pause 