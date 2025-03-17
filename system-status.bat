@echo off
:: system-status.bat - Check the status of OSPAiN2 components
setlocal enabledelayedexpansion

:: Set up logging
set TIMESTAMP=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%
set LOGS_DIR=%~dp0logs
if not exist "%LOGS_DIR%" mkdir "%LOGS_DIR%"
set LOG_FILE=%LOGS_DIR%\system-status_%TIMESTAMP%.log

:: Log header
echo ======================================= > "%LOG_FILE%"
echo OSPAiN2 Log - %date% %time% >> "%LOG_FILE%"
echo Script: %~nx0 >> "%LOG_FILE%"
echo System: Windows %OS% >> "%LOG_FILE%"
echo ======================================= >> "%LOG_FILE%"
echo. >> "%LOG_FILE%"

:: Helper function to log messages
call :log 2 "Checking OSPAiN2 system status"

:: Check system requirements
call :log 2 "Checking system requirements"

:: Check Python
python --version >nul 2>&1
if %ERRORLEVEL% equ 0 (
    for /f "tokens=*" %%a in ('python --version 2^>^&1') do set python_version=%%a
    call :log 2 "Python is installed: !python_version!"
) else (
    call :log 4 "Python is not installed"
)

:: Check Node.js
node --version >nul 2>&1
if %ERRORLEVEL% equ 0 (
    for /f "tokens=*" %%a in ('node --version') do set node_version=%%a
    call :log 2 "Node.js is installed: !node_version!"
) else (
    call :log 4 "Node.js is not installed"
)

:: Check package managers
pnpm --version >nul 2>&1
if %ERRORLEVEL% equ 0 (
    for /f "tokens=*" %%a in ('pnpm --version') do set pnpm_version=%%a
    call :log 2 "pnpm is installed: !pnpm_version!"
) else (
    call :log 3 "pnpm is not installed"
)

npm --version >nul 2>&1
if %ERRORLEVEL% equ 0 (
    for /f "tokens=*" %%a in ('npm --version') do set npm_version=%%a
    call :log 2 "npm is installed: !npm_version!"
) else (
    call :log 3 "npm is not installed"
)

:: Check directory structure
call :log 2 "Checking directory structure"
if exist "OSPAiN2-hub-new" (
    call :log 2 "OSPAiN2-hub-new directory exists"
) else (
    call :log 4 "OSPAiN2-hub-new directory is missing"
)

:: Check if frontend dependencies are installed
if exist "OSPAiN2-hub-new\node_modules" (
    call :log 2 "Frontend dependencies are installed"
) else (
    call :log 3 "Frontend dependencies are not installed"
)

:: Check running services
call :log 2 "Checking running services"

:: Check MCP server
set MCP_RUNNING=1
for /f "tokens=*" %%a in ('tasklist /fi "imagename eq python.exe" /v ^| find "mcp_server.py" /c') do (
    if %%a gtr 0 (
        call :log 2 "MCP Server is running"
        set MCP_RUNNING=0
    ) else (
        call :log 3 "MCP Server is not running"
    )
)

:: Check frontend development server
set FRONTEND_RUNNING=1
for /f "tokens=*" %%a in ('tasklist /fi "imagename eq node.exe" /v ^| find "vite" /c') do (
    if %%a gtr 0 (
        call :log 2 "Frontend Dev Server is running"
        set FRONTEND_RUNNING=0
    ) else (
        call :log 3 "Frontend Dev Server is not running"
    )
)

:: Check ports (using netstat)
call :log 2 "Checking network ports"

:: Check MCP server port
set MCP_PORT=1
netstat -an | find ":3002" | find "LISTENING" >nul 2>&1
if %ERRORLEVEL% equ 0 (
    call :log 2 "MCP Server is listening on port 3002"
    set MCP_PORT=0
) else (
    call :log 3 "MCP Server is not listening on port 3002"
)

:: Check frontend development server port
set FRONTEND_PORT=1
netstat -an | find ":3001" | find "LISTENING" >nul 2>&1
if %ERRORLEVEL% equ 0 (
    call :log 2 "Frontend Dev Server is listening on port 3001"
    set FRONTEND_PORT=0
) else (
    call :log 3 "Frontend Dev Server is not listening on port 3001"
)

:: Check logs
call :log 2 "Checking log files"
if exist "%LOGS_DIR%" (
    set count=0
    for %%f in (%LOGS_DIR%\*.log) do set /a count+=1
    call :log 2 "Logs directory exists with !count! log files"
    
    :: Find newest log file (Windows batch version)
    set "newest_time=0"
    set "newest_file="
    for %%f in (%LOGS_DIR%\*.log) do (
        for /f "tokens=1,2" %%a in ('dir /tc "%%f" ^| findstr /i /c:"%%f"') do (
            set "current_file=%%f"
            set "current_time=%%a %%b"
            if "!current_time!" gtr "!newest_time!" (
                set "newest_time=!current_time!"
                set "newest_file=!current_file!"
            )
        )
    )
    
    if not "!newest_file!"=="" (
        for %%F in ("!newest_file!") do set newest_filename=%%~nxF
        call :log 2 "Newest log file: !newest_filename! (!newest_time!)"
    )
) else (
    call :log 3 "Logs directory does not exist"
)

:: Summary
call :log 2 "==== System Status Summary ===="
if %MCP_RUNNING% equ 0 if %MCP_PORT% equ 0 (
    call :log 2 "✓ MCP Server: Running"
) else (
    call :log 3 "✗ MCP Server: Not running"
)

if %FRONTEND_RUNNING% equ 0 if %FRONTEND_PORT% equ 0 (
    call :log 2 "✓ Frontend Server: Running"
) else (
    call :log 3 "✗ Frontend Server: Not running"
)

:: Check disk space
for /f "tokens=3" %%a in ('dir /-c 2^>nul ^| findstr /c:"bytes free"') do set disk_free=%%a
call :log 2 "Disk space available: !disk_free! bytes free"

:: Final status message
if %MCP_RUNNING% equ 0 if %FRONTEND_RUNNING% equ 0 (
    call :log 2 "System status: All components are running"
) else if %MCP_RUNNING% equ 0 (
    call :log 3 "System status: MCP Server is running, Frontend is not running"
) else if %FRONTEND_RUNNING% equ 0 (
    call :log 3 "System status: Frontend is running, MCP Server is not running"
) else (
    call :log 3 "System status: No components are running"
)

call :log 2 "Status check complete"
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
echo [%TIMESTAMP%] [%LEVEL_NAME%] %MSG%
if "%LEVEL%"=="5" (
    exit /b 1
)
endlocal
goto :eof 