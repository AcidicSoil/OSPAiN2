@echo off
setlocal enabledelayedexpansion

echo OSPAiN2 Windows Task Scheduler Setup
echo ====================================

:: Get the current directory and convert to absolute path
set "SCRIPT_DIR=%~dp0"
set "PROJECT_ROOT=%SCRIPT_DIR%.."
cd /d "%PROJECT_ROOT%"
set "PROJECT_ROOT=%cd%"
set "STARTUP_SCRIPT=%PROJECT_ROOT%\startup\ospain2-startup.bat"

:: Admin check
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: This script requires administrator privileges.
    echo Please right-click on the script and select "Run as administrator".
    pause
    exit /b 1
)

echo Creating scheduled task for OSPAiN2 server...

:: Create the task
schtasks /Create /F /TN "OSPAiN2\ServerStartup" ^
    /TR "'%STARTUP_SCRIPT%'" ^
    /SC ONLOGON ^
    /RU "%USERNAME%" ^
    /IT ^
    /RL HIGHEST ^
    /DELAY 0001:00 ^
    /HRESULT

if %errorlevel% equ 0 (
    echo.
    echo Task created successfully!
    echo OSPAiN2 server will start automatically on user login.
    echo.
    echo You can manage this task in the Windows Task Scheduler:
    echo 1. Search for "Task Scheduler" in the Start menu
    echo 2. Look for the "OSPAiN2\ServerStartup" task
    echo.
) else (
    echo.
    echo Failed to create scheduled task. Error code: %errorlevel%
    echo.
    echo You can manually create a task with these settings:
    echo - Program/script: %STARTUP_SCRIPT%
    echo - Start in: %PROJECT_ROOT%
    echo - Run with highest privileges: Yes
    echo - Trigger: At log on
    echo.
)

pause 