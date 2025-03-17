@echo off
SETLOCAL EnableDelayedExpansion

echo =====================================
echo   OSPAiN2 Notion Integration Startup 
echo =====================================
echo.

REM Check for Python
where python >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Python not found. Please install Python 3.6 or higher.
    exit /b 1
)

REM Check for required dependencies
echo Checking dependencies...
python -c "import requests" 2>nul
if %ERRORLEVEL% neq 0 (
    echo Installing required Python packages...
    python -m pip install requests
)

REM Check for API key
if "%NOTION_TOKEN%"=="" (
    echo Warning: NOTION_TOKEN environment variable not set.
    echo Please set your Notion API token:
    echo set NOTION_TOKEN="your_token_here"
    set /p CONTINUE="Do you want to continue anyway? (y/n) "
    if /i not "!CONTINUE!"=="y" (
        exit /b 1
    )
)

REM Start services in the background
echo Starting Notion API Proxy...
start /B python notion_proxy.py > notion_proxy_output.log 2>&1
set PROXY_PID=!ERRORLEVEL!
echo Notion Proxy started.

REM Wait a moment for proxy to start
timeout /t 2 /nobreak >nul

REM Start HTTP server for test interface
echo Starting HTTP Server for test interface...
start /B python -m http.server 8000 > http_server_output.log 2>&1
set HTTP_PID=!ERRORLEVEL!
echo HTTP Server started.

REM Check if notion_databases.json exists
if not exist "notion_databases.json" (
    echo notion_databases.json not found. Do you want to run the database setup? (y/n)
    set /p SETUP=
    if /i "!SETUP!"=="y" (
        echo Running database setup...
        python create_notion_database.py
    )
)

REM Show the URLs
echo.
echo Services started successfully!
echo Test interface: http://localhost:8000/notion_tests.html
echo Notion API Proxy: http://localhost:8001
echo.

REM Display logs in real time
echo Press Ctrl+C to stop all services
echo Displaying logs (last 5 lines from each):
echo.

echo --- Notion Proxy Log ---
if exist notion_proxy.log (
    type notion_proxy.log | findstr /n "^" | findstr /b "1: 2: 3: 4: 5:" | findstr /v /b "[0-9]*:$"
)
echo.

echo --- HTTP Server Log ---
if exist http_server_output.log (
    type http_server_output.log | findstr /n "^" | findstr /b "1: 2: 3: 4: 5:" | findstr /v /b "[0-9]*:$"
)
echo.

echo Services are running in the background.
echo Press any key to stop all services...
pause >nul

REM Handle service cleanup
echo Stopping services...
taskkill /F /FI "WINDOWTITLE eq python*notion_proxy.py*" >nul 2>nul
taskkill /F /FI "WINDOWTITLE eq python*http.server*" >nul 2>nul
echo Services stopped.

ENDLOCAL 