@echo off
:: schedule-daily-report.bat
::
:: This script sets up a scheduled task to run the daily metrics report generator.
:: It schedules the report to be generated at midnight every day.
::
:: Usage:
::   schedule-daily-report.bat [/time HH:MM] [/disable]

setlocal enabledelayedexpansion

:: Default values
set "TIME=00:00"
set "DISABLE=false"

:: Parse command line arguments
:parse_args
if "%~1"=="" goto :end_parse_args
if /i "%~1"=="/time" (
    set "TIME=%~2"
    shift
    shift
    goto :parse_args
)
if /i "%~1"=="/disable" (
    set "DISABLE=true"
    shift
    goto :parse_args
)
echo Unknown option: %~1
exit /b 1

:end_parse_args

:: Validate time format
echo %TIME% | findstr /r "^[0-2][0-9]:[0-5][0-9]$" >nul
if errorlevel 1 (
    echo Error: Invalid time format. Please use HH:MM format ^(24-hour^).
    exit /b 1
)

:: Extract hours and minutes
for /f "tokens=1,2 delims=:" %%a in ("%TIME%") do (
    set "HOUR=%%a"
    set "MINUTE=%%b"
)

:: Remove leading zeros
if "%HOUR:~0,1%"=="0" set "HOUR=%HOUR:~1%"
if "%MINUTE:~0,1%"=="0" set "MINUTE=%MINUTE:~1%"

:: Get the absolute path to the script directory
set "SCRIPT_DIR=%~dp0"
set "PARENT_DIR=%SCRIPT_DIR:~0,-1%\.."
set "REPORT_SCRIPT=%SCRIPT_DIR%generate-daily-report.js"

:: Create logs directory if it doesn't exist
if not exist "%PARENT_DIR%\logs" mkdir "%PARENT_DIR%\logs"

:: Create reports directory if it doesn't exist
if not exist "%PARENT_DIR%\reports\daily" mkdir "%PARENT_DIR%\reports\daily"

:: Check if we're disabling or enabling
if "%DISABLE%"=="true" (
    goto :disable_task
) else (
    goto :enable_task
)

:disable_task
schtasks /query /tn "OllamaEcosystem\DailyMetricsReport" >nul 2>&1
if errorlevel 1 (
    echo No daily report scheduled task found.
) else (
    echo Removing scheduled task for daily report...
    schtasks /delete /tn "OllamaEcosystem\DailyMetricsReport" /f
    echo Scheduled task removed.
)
goto :end_script

:enable_task
:: First, make sure the task folder exists
schtasks /query /fo LIST /tn "OllamaEcosystem" >nul 2>&1
if errorlevel 1 (
    echo Creating OllamaEcosystem task folder...
    schtasks /create /tn "OllamaEcosystem" /tr "cmd.exe" /sc once /st 00:00 /sd 01/01/2099 >nul
    schtasks /delete /tn "OllamaEcosystem" /f >nul
    ::Create folder only - deleted the dummy task
)

echo Creating scheduled task for daily metrics report...

:: Check for existing task
schtasks /query /tn "OllamaEcosystem\DailyMetricsReport" >nul 2>&1
if not errorlevel 1 (
    echo Task already exists. Updating...
    schtasks /delete /tn "OllamaEcosystem\DailyMetricsReport" /f
)

:: Create XML for the task
set "XML_FILE=%TEMP%\daily_report_task.xml"
echo ^<?xml version="1.0" encoding="UTF-16"?^> > "%XML_FILE%"
echo ^<Task version="1.2" xmlns="http://schemas.microsoft.com/windows/2004/02/mit/task"^> >> "%XML_FILE%"
echo   ^<RegistrationInfo^> >> "%XML_FILE%"
echo     ^<Description^>Generates daily metrics report for Ollama Ecosystem^</Description^> >> "%XML_FILE%"
echo   ^</RegistrationInfo^> >> "%XML_FILE%"
echo   ^<Triggers^> >> "%XML_FILE%"
echo     ^<CalendarTrigger^> >> "%XML_FILE%"
echo       ^<StartBoundary^>2022-01-01T%TIME%:00^</StartBoundary^> >> "%XML_FILE%"
echo       ^<Enabled^>true^</Enabled^> >> "%XML_FILE%"
echo       ^<ScheduleByDay^> >> "%XML_FILE%"
echo         ^<DaysInterval^>1^</DaysInterval^> >> "%XML_FILE%"
echo       ^</ScheduleByDay^> >> "%XML_FILE%"
echo     ^</CalendarTrigger^> >> "%XML_FILE%"
echo   ^</Triggers^> >> "%XML_FILE%"
echo   ^<Principals^> >> "%XML_FILE%"
echo     ^<Principal id="Author"^> >> "%XML_FILE%"
echo       ^<LogonType^>InteractiveToken^</LogonType^> >> "%XML_FILE%"
echo       ^<RunLevel^>LeastPrivilege^</RunLevel^> >> "%XML_FILE%"
echo     ^</Principal^> >> "%XML_FILE%"
echo   ^</Principals^> >> "%XML_FILE%"
echo   ^<Settings^> >> "%XML_FILE%"
echo     ^<MultipleInstancesPolicy^>IgnoreNew^</MultipleInstancesPolicy^> >> "%XML_FILE%"
echo     ^<DisallowStartIfOnBatteries^>false^</DisallowStartIfOnBatteries^> >> "%XML_FILE%"
echo     ^<StopIfGoingOnBatteries^>false^</StopIfGoingOnBatteries^> >> "%XML_FILE%"
echo     ^<AllowHardTerminate^>true^</AllowHardTerminate^> >> "%XML_FILE%"
echo     ^<StartWhenAvailable^>true^</StartWhenAvailable^> >> "%XML_FILE%"
echo     ^<RunOnlyIfNetworkAvailable^>false^</RunOnlyIfNetworkAvailable^> >> "%XML_FILE%"
echo     ^<IdleSettings^> >> "%XML_FILE%"
echo       ^<StopOnIdleEnd^>false^</StopOnIdleEnd^> >> "%XML_FILE%"
echo       ^<RestartOnIdle^>false^</RestartOnIdle^> >> "%XML_FILE%"
echo     ^</IdleSettings^> >> "%XML_FILE%"
echo     ^<AllowStartOnDemand^>true^</AllowStartOnDemand^> >> "%XML_FILE%"
echo     ^<Enabled^>true^</Enabled^> >> "%XML_FILE%"
echo     ^<Hidden^>false^</Hidden^> >> "%XML_FILE%"
echo     ^<RunOnlyIfIdle^>false^</RunOnlyIfIdle^> >> "%XML_FILE%"
echo     ^<WakeToRun^>false^</WakeToRun^> >> "%XML_FILE%"
echo     ^<ExecutionTimeLimit^>PT1H^</ExecutionTimeLimit^> >> "%XML_FILE%"
echo     ^<Priority^>7^</Priority^> >> "%XML_FILE%"
echo   ^</Settings^> >> "%XML_FILE%"
echo   ^<Actions Context="Author"^> >> "%XML_FILE%"
echo     ^<Exec^> >> "%XML_FILE%"
echo       ^<Command^>node.exe^</Command^> >> "%XML_FILE%"
echo       ^<Arguments^>"%REPORT_SCRIPT%"^</Arguments^> >> "%XML_FILE%"
echo       ^<WorkingDirectory^>%PARENT_DIR%^</WorkingDirectory^> >> "%XML_FILE%"
echo     ^</Exec^> >> "%XML_FILE%"
echo   ^</Actions^> >> "%XML_FILE%"
echo ^</Task^> >> "%XML_FILE%"

:: Create the task
schtasks /create /tn "OllamaEcosystem\DailyMetricsReport" /xml "%XML_FILE%" /f
if errorlevel 1 (
    echo Error creating scheduled task.
    del "%XML_FILE%" >nul
    exit /b 1
)

:: Clean up
del "%XML_FILE%" >nul

echo Scheduled task created to run daily at %TIME%.
echo Reports will be saved to: %PARENT_DIR%\reports\daily\

:end_script
:: Final messaging
if "%DISABLE%"=="true" (
    echo Daily report scheduling has been disabled.
    echo To re-enable, run: %~nx0
) else (
    echo Daily report has been scheduled.
    echo To disable, run: %~nx0 /disable
    echo To change the time, run: %~nx0 /time HH:MM
    echo Reports will be saved to: %PARENT_DIR%\reports\daily\
    echo Logs will be saved to: %PARENT_DIR%\logs\daily-report.log
)

endlocal
exit /b 0 