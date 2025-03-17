@echo off
echo Registering T2P Architecture Mindmap Generator scheduled task...
schtasks /create /tn "T2PArchitectureMindmapGenerator" /xml "C:\Users\comfy\OSPAiN2\t2p\scripts\mindmap-task.xml" /f
if %ERRORLEVEL% EQU 0 (
  echo Task registered successfully.
) else (
  echo Failed to register task. Please run as administrator.
)
pause