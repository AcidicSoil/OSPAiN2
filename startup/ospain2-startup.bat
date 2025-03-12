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

:: Check if package.json exists
cd OSPAiN2-hub
if not exist "package.json" (
    echo Error: package.json not found in OSPAiN2-hub directory.
    exit /b 1
)

:: Check if we're using Next.js by looking for .next directory or next.config.js
set NEXT_JS=false
if exist ".next" set NEXT_JS=true
if exist "next.config.js" set NEXT_JS=true

:: Check if we should run in development mode
if "%1"=="dev" (
    echo Running in development mode...
    
    if "%NEXT_JS%"=="true" (
        echo Detected Next.js project, using dev command...
        npm run dev
    ) else (
        echo Using React start command...
        npm start
    )
) else (
    :: Check if dependencies are installed
    if not exist "node_modules" (
        echo Installing dependencies for the first time...
        call npm install
    ) else (
        echo Using existing dependencies...
    )
    
    :: If Next.js, check for build
    if "%NEXT_JS%"=="true" (
        if not exist ".next" (
            echo Building Next.js project...
            call npm run build
        )
        echo Starting Next.js server...
        npm start
    ) else (
        echo Starting React development server...
        npm start
    )
)

:: Script should not reach here unless server crashed
echo.
echo OSPAiN2 server stopped or crashed. See logs above for details.
echo To restart the server, run this script again.
pause 