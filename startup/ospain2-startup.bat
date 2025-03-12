@echo off
setlocal enabledelayedexpansion

echo OSPAiN2 Server Startup Script (Windows)
echo ======================================

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

:: Check if the OSPAiN2-hub directory exists
if not exist "OSPAiN2-hub" (
    echo Error: OSPAiN2-hub directory not found.
    echo Please run this script from the OSPAiN2 project root.
    exit /b 1
)

echo Starting OSPAiN2 server...
echo.

:: Check if we should run in development mode
if "%1"=="dev" (
    echo Running in development mode...
    cd OSPAiN2-hub
    npm run dev
) else (
    :: Check if the project has been built
    if not exist "OSPAiN2-hub/.next" (
        echo Building OSPAiN2 for the first time...
        cd OSPAiN2-hub
        call npm install
        call npm run build
    ) else (
        echo Using existing build...
        cd OSPAiN2-hub
    )
    
    :: Start the server
    npm start
)

:: Script should not reach here unless server crashed
echo.
echo OSPAiN2 server stopped or crashed. See logs above for details.
echo To restart the server, run this script again.
pause 