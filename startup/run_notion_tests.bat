@echo off
setlocal enabledelayedexpansion

:: Set colors for output
set "GREEN=[32m"
set "RED=[31m"
set "YELLOW=[33m"
set "RESET=[0m"

echo %GREEN%Starting Notion Integration Tests...%RESET%

:: Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo %RED%Error: Python is not installed or not in PATH%RESET%
    exit /b 1
)

:: Check if required packages are installed
echo %YELLOW%Checking required packages...%RESET%
python -c "import requests" >nul 2>&1
if %errorlevel% neq 0 (
    echo %YELLOW%Installing requests package...%RESET%
    pip install requests
)

python -c "import python-dotenv" >nul 2>&1
if %errorlevel% neq 0 (
    echo %YELLOW%Installing python-dotenv package...%RESET%
    pip install python-dotenv
)

:: Check if .env file exists
if not exist ".env" (
    echo %RED%Error: .env file not found. Please create it with NOTION_TOKEN and NOTION_DATABASE_ID%RESET%
    exit /b 1
)

:: Run the tests
echo %GREEN%Running Notion integration tests...%RESET%
python tests/notion_integration_test.py

:: Check test result
if %errorlevel% equ 0 (
    echo %GREEN%All tests passed successfully!%RESET%
) else (
    echo %RED%Some tests failed. Please check the output above for details.%RESET%
)

endlocal 