@echo off
:: start-ospain-hub.bat - Start the OSPAiN2 Hub with MCP server and frontend
setlocal enabledelayedexpansion

:: Set up logging
set TIMESTAMP=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%
set LOGS_DIR=%~dp0logs
if not exist "%LOGS_DIR%" mkdir "%LOGS_DIR%"
set LOG_FILE=%LOGS_DIR%\start-ospain-hub_%TIMESTAMP%.log

:: Log header
echo ======================================= > "%LOG_FILE%"
echo OSPAiN2 Log - %date% %time% >> "%LOG_FILE%"
echo Script: %~nx0 >> "%LOG_FILE%"
echo System: Windows %OS% >> "%LOG_FILE%"
echo ======================================= >> "%LOG_FILE%"
echo. >> "%LOG_FILE%"

:: Helper function to log messages
call :log 2 "Starting OSPAiN2 Hub"

:: Check if Python is installed
python --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    call :log 4 "Python is not installed. Please install Python."
    exit /b 1
)

:: Check if the OSPAiN2-hub-new directory exists
if not exist "OSPAiN2-hub-new" (
    call :log 4 "OSPAiN2-hub-new directory not found."
    exit /b 1
)

:: Check for package managers
set PKG_MGR=
where pnpm >nul 2>&1 && set PKG_MGR=pnpm
if "!PKG_MGR!"=="" (
    where npm >nul 2>&1 && set PKG_MGR=npm
)
if "!PKG_MGR!"=="" (
    call :log 4 "Neither pnpm nor npm found. Please install one of them."
    exit /b 1
)

call :log 2 "Using package manager: !PKG_MGR!"

:: Start the MCP server in a separate window
call :log 2 "Starting MCP server on port 3002"
start "OSPAiN2 MCP Server" cmd /c "python %~dp0mcp_server.py --port 3002 > %LOGS_DIR%\mcp_server_%TIMESTAMP%.log 2>&1"
call :log 2 "MCP server started in a separate window"

:: Wait for server to initialize
call :log 1 "Waiting for server to initialize..."
timeout /t 2 > nul

:: Start the frontend
call :log 2 "Starting OSPAiN2-hub-new frontend"
cd OSPAiN2-hub-new
if %ERRORLEVEL% neq 0 (
    call :log 4 "Failed to change to OSPAiN2-hub-new directory"
    exit /b 1
)

:: Check if node_modules exists, if not run install
if not exist "node_modules" (
    call :log 3 "node_modules not found. Running !PKG_MGR! install"
    !PKG_MGR! install
    if %ERRORLEVEL% neq 0 (
        call :log 4 "Failed to install dependencies"
        exit /b 1
    )
)

:: Start the development server
call :log 2 "Starting development server with !PKG_MGR!"
start "OSPAiN2 Frontend" cmd /k "!PKG_MGR! run dev"
call :log 2 "Development server started in a separate window"
call :log 2 "OSPAiN2 Hub startup complete"

goto :eof

:: Log function - :log level message
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
if "%LEVEL%"=="1" echo [%TIMESTAMP%] [%LEVEL_NAME%] %MSG%
if "%LEVEL%"=="2" echo [%TIMESTAMP%] [%LEVEL_NAME%] %MSG%
if "%LEVEL%"=="3" echo [%TIMESTAMP%] [%LEVEL_NAME%] %MSG%
if "%LEVEL%"=="4" echo [%TIMESTAMP%] [%LEVEL_NAME%] %MSG%
if "%LEVEL%"=="5" (
    echo [%TIMESTAMP%] [%LEVEL_NAME%] %MSG%
    exit /b 1
)
endlocal
goto :eof 