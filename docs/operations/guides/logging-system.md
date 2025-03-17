# OSPAiN2 Logging System

## Overview

The OSPAiN2 Logging System provides comprehensive logging capabilities for all scripts in the OSPAiN2 ecosystem. It features both console output with color-coding and persistent log files for later analysis. The system is implemented in both Bash (for Linux/macOS) and PowerShell/Batch (for Windows) to ensure cross-platform compatibility.

## Components

The logging system consists of:

1. **Logging Utilities**:
   - `logger.sh` - Bash utility for Linux/macOS
   - `logger.ps1` - PowerShell utility for Windows

2. **Enhanced Scripts**:
   - `start-ospain-hub.sh/.bat` - Start both MCP server and frontend
   - `start-app.sh/.bat` - Start only the frontend
   - `system-status.sh/.bat` - Check the system status
   - `install-dependencies.sh/.bat` - Install required dependencies

3. **Log Storage**:
   - All logs are stored in the `logs` directory in the project root
   - Each log file is named with the script name and timestamp
   - Log files include detailed information about script execution

## Log Levels

The logging system supports five severity levels:

| Level | Name | Description | Color |
|-------|------|-------------|-------|
| 1 | DEBUG | Detailed information for debugging | Blue |
| 2 | INFO | Normal operational messages | Green |
| 3 | WARN | Warning messages that don't stop execution | Yellow |
| 4 | ERROR | Error messages that affect execution | Red |
| 5 | FATAL | Critical errors that cause script termination | Magenta |

## Usage in Bash Scripts

To use the logging system in your own Bash scripts:

```bash
#!/bin/bash
# Source the logger
source "$(dirname "$0")/logger.sh"

# Initialize log file
LOG_FILE=$(initialize_log "$0")
log_message "$LOG_FILE" 2 "Script started"

# Log different severity levels
log_message "$LOG_FILE" 1 "This is a debug message"
log_message "$LOG_FILE" 2 "This is an info message"
log_message "$LOG_FILE" 3 "This is a warning message"
log_message "$LOG_FILE" 4 "This is an error message"
log_message "$LOG_FILE" 5 "This is a fatal message (will exit script)"
```

## Usage in Batch Scripts

To use the logging system in your own Windows Batch scripts:

```batch
@echo off
:: Set up logging
set TIMESTAMP=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%
set LOGS_DIR=%~dp0logs
if not exist "%LOGS_DIR%" mkdir "%LOGS_DIR%"
set LOG_FILE=%LOGS_DIR%\script-name_%TIMESTAMP%.log

:: Log header
echo ======================================= > "%LOG_FILE%"
echo OSPAiN2 Log - %date% %time% >> "%LOG_FILE%"
echo Script: %~nx0 >> "%LOG_FILE%"
echo System: Windows %OS% >> "%LOG_FILE%"
echo ======================================= >> "%LOG_FILE%"
echo. >> "%LOG_FILE%"

:: Log using :log function
call :log 2 "Script started"

:: Rest of your script here...
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
```

## System Status Checks

The `system-status.sh/.bat` scripts provide comprehensive system checks:

1. **System Requirements**:
   - Python installation
   - Node.js installation
   - Package manager availability (pnpm/npm)

2. **Directory Structure**:
   - Verification of OSPAiN2-hub-new directory
   - Check for installed dependencies

3. **Running Services**:
   - MCP server status
   - Frontend development server status

4. **Network Ports**:
   - MCP server port (3002) status
   - Frontend development server port (3001) status

5. **Logs**:
   - Check for existing log files
   - Show information about the most recent log

6. **Summary**:
   - Overall system status
   - Available disk space
   - Running components

## Installation Script Features

The `install-dependencies.sh/.bat` scripts provide:

1. **Environment Checks**:
   - Python installation verification
   - Node.js installation verification
   - Package manager detection

2. **Package Installation**:
   - Python dependencies installation
   - Frontend dependencies installation
   - Global tools installation (TypeScript, Vite)

3. **Environment Setup**:
   - .env file creation (if needed)
   - t2p tools installation
   - Logs directory creation

4. **Configuration**:
   - Support for clean installation (--clean parameter)
   - Dynamic package manager selection
   - Cross-platform compatibility

## Best Practices

1. **Always use appropriate log levels**:
   - Use DEBUG (1) for detailed diagnostic information
   - Use INFO (2) for normal operation messages
   - Use WARN (3) for non-critical issues
   - Use ERROR (4) for failures that don't stop execution
   - Use FATAL (5) only for critical failures that require termination

2. **Include contextual information in log messages**:
   - What operation was being performed
   - What caused an error
   - Any relevant variables or states

3. **Log at key points in your script**:
   - Script start and end
   - Before and after critical operations
   - When detecting and handling errors
   - When making significant state changes

4. **Review logs regularly**:
   - Check logs for patterns of warnings or errors
   - Use logs for debugging issues
   - Archive old logs periodically

## Maintenance

The logging system is designed to be low-maintenance:

- Log files are automatically created with timestamped names
- Each script manages its own log files
- The system handles directory creation automatically

To clean up old logs, you can use a simple command:

```bash
# Keep only logs from the last 7 days
find logs -type f -name "*.log" -mtime +7 -delete
```

For Windows:

```batch
forfiles /p logs /s /m *.log /d -7 /c "cmd /c del @path"
```