@echo off
:: cleanup-logs.bat - Clean up old log files
setlocal enabledelayedexpansion

:: Set up logging
set TIMESTAMP=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%
set LOGS_DIR=%~dp0logs
if not exist "%LOGS_DIR%" mkdir "%LOGS_DIR%"
set LOG_FILE=%LOGS_DIR%\cleanup-logs_%TIMESTAMP%.log

:: Log header
echo ======================================= > "%LOG_FILE%"
echo OSPAiN2 Log - %date% %time% >> "%LOG_FILE%"
echo Script: %~nx0 >> "%LOG_FILE%"
echo System: Windows %OS% >> "%LOG_FILE%"
echo ======================================= >> "%LOG_FILE%"
echo. >> "%LOG_FILE%"

:: Helper function to log messages
call :log 2 "Starting log cleanup"

:: Default to 7 days if not specified
set DAYS=7
if not "%~1"=="" set DAYS=%~1

:: Validate that DAYS is a number
echo %DAYS%|findstr /r "^[1-9][0-9]*$" >nul
if %ERRORLEVEL% neq 0 (
    call :log 4 "Invalid days parameter: %DAYS% (must be a positive number)"
    echo Usage: %0 [days]
    echo   days: Number of days to keep (default: 7)
    exit /b 1
)

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
    
    if %OLD_COUNT% gtr 0 (
        call :log 2 "Deleted %DELETED_COUNT% old log files"
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