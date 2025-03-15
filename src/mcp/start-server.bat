@echo off
setlocal enabledelayedexpansion

:: Default port
set PORT=3000
set TOOLS_DIR=
set NO_MCP_CONFIG=

:: Determine script directory and root directory
set "SCRIPT_DIR=%~dp0"
set "ROOT_DIR=%SCRIPT_DIR%..\..\"

:: Parse arguments
:parse_args
if "%~1"=="" goto :end_parse_args
if "%~1"=="--port" (
    set "PORT=%~2"
    shift
    shift
    goto :parse_args
)
if "%~1"=="--tools-dir" (
    set "TOOLS_DIR=%~2"
    shift
    shift
    goto :parse_args
)
if "%~1"=="--no-mcp-config" (
    set "NO_MCP_CONFIG=true"
    shift
    goto :parse_args
)
if "%~1"=="--help" (
    echo Usage: start-server.bat [options]
    echo.
    echo Options:
    echo   --port ^<port^>       Port to run the server on (default: 3000)
    echo   --tools-dir ^<dir^>   Directory to load additional tools from
    echo   --no-mcp-config     Don't write mcp.json config for Cursor
    echo   --help              Show this help message
    exit /b 0
)
echo Unknown option: %~1
exit /b 1
shift
goto :parse_args
:end_parse_args

:: Build the project if needed
if not exist "%ROOT_DIR%dist" (
    echo Building project...
    pushd "%ROOT_DIR%"
    call npm run build
    popd
)

:: Check if ts-node is installed
where ts-node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ts-node not found. Installing...
    call npm install -g ts-node typescript
)

:: Start the server
pushd "%ROOT_DIR%"
set "MCP_ARGS=--port %PORT%"

if not "%TOOLS_DIR%"=="" (
    set "MCP_ARGS=!MCP_ARGS! --tools-dir %TOOLS_DIR%"
)

if not "%NO_MCP_CONFIG%"=="" (
    set "MCP_ARGS=!MCP_ARGS! --no-mcp-config"
)

echo Starting MCP server on port %PORT%...

:: Use ts-node during development, or node with compiled JS in production
if exist "%SCRIPT_DIR%cli.ts" (
    call ts-node "%SCRIPT_DIR%cli.ts" %MCP_ARGS%
) else (
    node "%ROOT_DIR%dist\mcp\cli.js" %MCP_ARGS%
)

popd 