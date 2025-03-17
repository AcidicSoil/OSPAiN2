@echo off
:: install-dependencies.bat - Install all necessary dependencies for OSPAiN2
setlocal enabledelayedexpansion

:: Set up logging
set TIMESTAMP=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%
set LOGS_DIR=%~dp0logs
if not exist "%LOGS_DIR%" mkdir "%LOGS_DIR%"
set LOG_FILE=%LOGS_DIR%\install-dependencies_%TIMESTAMP%.log

:: Log header
echo ======================================= > "%LOG_FILE%"
echo OSPAiN2 Log - %date% %time% >> "%LOG_FILE%"
echo Script: %~nx0 >> "%LOG_FILE%"
echo System: Windows %OS% >> "%LOG_FILE%"
echo ======================================= >> "%LOG_FILE%"
echo. >> "%LOG_FILE%"

:: Helper function to log messages
call :log 2 "Starting OSPAiN2 dependency installation"

:: Check for Python
call :log 2 "Checking for Python..."
python --version >nul 2>&1
if %ERRORLEVEL% equ 0 (
    for /f "tokens=*" %%a in ('python --version 2^>^&1') do set python_version=%%a
    call :log 2 "Python is already installed: !python_version!"
) else (
    call :log 4 "Python is not installed. Please install Python before continuing."
    exit /b 1
)

:: Check for Node.js
call :log 2 "Checking for Node.js..."
node --version >nul 2>&1
if %ERRORLEVEL% equ 0 (
    for /f "tokens=*" %%a in ('node --version') do set node_version=%%a
    call :log 2 "Node.js is already installed: !node_version!"
) else (
    call :log 4 "Node.js is not installed. Please install Node.js before continuing."
    exit /b 1
)

:: Check for package managers
call :log 2 "Checking for package managers..."
set PKG_MGR=

pnpm --version >nul 2>&1
if %ERRORLEVEL% equ 0 (
    for /f "tokens=*" %%a in ('pnpm --version') do set pnpm_version=%%a
    call :log 2 "pnpm is already installed: !pnpm_version!"
    set PKG_MGR=pnpm
) else (
    npm --version >nul 2>&1
    if %ERRORLEVEL% equ 0 (
        for /f "tokens=*" %%a in ('npm --version') do set npm_version=%%a
        call :log 2 "npm is already installed: !npm_version!"
        set PKG_MGR=npm
        
        :: Try to install pnpm
        call :log 2 "Attempting to install pnpm..."
        npm install -g pnpm
        if %ERRORLEVEL% equ 0 (
            for /f "tokens=*" %%a in ('pnpm --version') do set pnpm_version=%%a
            call :log 2 "Successfully installed pnpm: !pnpm_version!"
            set PKG_MGR=pnpm
        ) else (
            call :log 3 "Failed to install pnpm, continuing with npm"
        )
    ) else (
        call :log 4 "Neither pnpm nor npm found. Please install Node.js with npm."
        exit /b 1
    )
)

:: Install Python dependencies
call :log 2 "Installing Python dependencies..."
python -m pip install --upgrade pip
if %ERRORLEVEL% neq 0 (
    call :log 3 "Failed to upgrade pip, continuing with existing version"
)

if exist requirements.txt (
    python -m pip install -r requirements.txt
    if %ERRORLEVEL% neq 0 (
        call :log 4 "Failed to install Python dependencies"
        exit /b 1
    )
) else (
    call :log 3 "requirements.txt not found, creating minimal version"
    echo requests>=2.25.0 > requirements.txt
    echo websockets>=10.0 >> requirements.txt
    echo python-dotenv>=0.19.0 >> requirements.txt
    echo aiohttp>=3.8.0 >> requirements.txt
    
    python -m pip install -r requirements.txt
    if %ERRORLEVEL% neq 0 (
        call :log 4 "Failed to install Python dependencies"
        exit /b 1
    )
)
call :log 2 "Python dependencies installed successfully"

:: Install Node.js dependencies for the project
if exist OSPAiN2-hub-new (
    call :log 2 "Installing OSPAiN2-hub-new dependencies..."
    cd OSPAiN2-hub-new
    if %ERRORLEVEL% neq 0 (
        call :log 4 "Failed to change to OSPAiN2-hub-new directory"
        exit /b 1
    )
    
    :: Remove node_modules if clean install is needed
    if "%1"=="--clean" (
        call :log 2 "Removing existing node_modules for clean install"
        if exist node_modules rmdir /s /q node_modules
    )
    
    :: Install dependencies
    !PKG_MGR! install
    if %ERRORLEVEL% neq 0 (
        call :log 4 "Failed to install frontend dependencies"
        exit /b 1
    )
    call :log 2 "Frontend dependencies installed successfully"
    
    :: Return to original directory
    cd ..
) else (
    call :log 4 "OSPAiN2-hub-new directory not found"
    exit /b 1
)

:: Install global tools
call :log 2 "Installing global tools..."

:: Check if TypeScript is installed globally
where tsc >nul 2>&1
if %ERRORLEVEL% neq 0 (
    call :log 2 "Installing TypeScript globally..."
    npm install -g typescript
    if %ERRORLEVEL% neq 0 (
        call :log 3 "Failed to install TypeScript globally"
    )
) else (
    for /f "tokens=*" %%a in ('tsc --version') do set tsc_version=%%a
    call :log 2 "TypeScript is already installed globally: !tsc_version!"
)

:: Check if Vite is installed globally
where vite >nul 2>&1
if %ERRORLEVEL% neq 0 (
    call :log 2 "Installing Vite globally..."
    npm install -g vite
    if %ERRORLEVEL% neq 0 (
        call :log 3 "Failed to install Vite globally"
    )
) else (
    for /f "tokens=*" %%a in ('vite --version 2^>^&1') do set vite_version=%%a
    call :log 2 "Vite is already installed globally: !vite_version!"
)

:: Create an empty .env file if it doesn't exist
if not exist .env (
    call :log 2 "Creating empty .env file..."
    echo # OSPAiN2 Environment Configuration > .env
    echo # Created by install-dependencies.bat on %date% >> .env
    echo. >> .env
    echo # MCP Server Configuration >> .env
    echo MCP_SERVER_PORT=3002 >> .env
    echo. >> .env
    echo # Frontend Configuration >> .env
    echo VITE_API_URL=http://localhost:3002 >> .env
    call :log 2 "Empty .env file created"
)

:: Install t2p tools if not available
where t2p >nul 2>&1
if %ERRORLEVEL% neq 0 (
    call :log 2 "Installing t2p tools..."
    if exist t2p (
        cd t2p
        if %ERRORLEVEL% neq 0 (
            call :log 4 "Failed to change to t2p directory"
            exit /b 1
        )
        !PKG_MGR! install
        if %ERRORLEVEL% neq 0 (
            call :log 3 "Failed to install t2p dependencies"
        )
        !PKG_MGR! link
        if %ERRORLEVEL% neq 0 (
            call :log 3 "Failed to link t2p globally"
        )
        cd ..
    ) else (
        call :log 3 "t2p directory not found, skipping installation"
    )
) else (
    call :log 2 "t2p tools are already installed"
)

:: Create logs directory if it doesn't exist
if not exist logs mkdir logs
call :log 2 "Created logs directory (if it didn't exist)"

:: Final summary
call :log 2 "==== Installation Summary ===="
for /f "tokens=*" %%a in ('python --version 2^>^&1') do call :log 2 "Python version: %%a"
for /f "tokens=*" %%a in ('node --version') do call :log 2 "Node.js version: %%a"
call :log 2 "Package manager: !PKG_MGR! version !%PKG_MGR%_version!"
call :log 2 "Frontend dependencies: Installed in OSPAiN2-hub-new"
call :log 2 "Environment setup: .env file available"

:: Show next steps
call :log 2 "OSPAiN2 dependency installation complete"
call :log 2 ""
call :log 2 "Next steps:"
call :log 2 "1. Start the server: start-ospain-hub.bat"
call :log 2 "2. Check system status: system-status.bat"

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