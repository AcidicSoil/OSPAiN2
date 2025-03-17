@echo off
:: ollama-os.bat - Windows batch wrapper for the OllamaOS system
:: This script provides a convenient way to execute the OllamaOS system commands

:: Get script directory 
set "SCRIPT_DIR=%~dp0"

:: Set colors for output
set "GREEN=[32m"
set "BLUE=[34m"
set "YELLOW=[33m"
set "RED=[31m"
set "NC=[0m"

:: Function to check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
  echo %RED%Error: Node.js is required but not installed.%NC%
  echo Please install Node.js from https://nodejs.org/
  exit /b 1
)

:: Check if the script file exists
set "JS_SCRIPT=%SCRIPT_DIR%ollama-os.js"
if not exist "%JS_SCRIPT%" (
  echo %RED%Error: OllamaOS script not found at %JS_SCRIPT%%NC%
  exit /b 1
)

:: Main execution
echo %GREEN%OllamaOS%NC% - Agent Operating System

:: Pass all arguments to the Node.js script
node "%JS_SCRIPT%" %* 