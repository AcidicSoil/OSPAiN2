#=====================================================================
# GitHub Backup Scheduler - OSPAiN2 Project (PowerShell Version)
# 
# Description: Sets up Windows scheduled tasks for automatic GitHub backups
# Author: OSPAiN2 Team
# Version: 1.0.0
# Created: $(Get-Date -Format "yyyy-MM-dd")
#=====================================================================

# Configuration
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoDir = Split-Path -Parent $ScriptDir
$BackupScript = Join-Path $ScriptDir "github-backup.ps1"
$LogFile = Join-Path $RepoDir "logs\scheduler-setup.log"
$ConfigFile = Join-Path $ScriptDir "backup-config.json"
$TaskName = "OSPAiN2 GitHub Backup"

# Ensure logs directory exists
$LogDir = Join-Path $RepoDir "logs"
if (-not (Test-Path $LogDir)) {
    New-Item -ItemType Directory -Path $LogDir | Out-Null
}

# Function to log messages
function Log-Message {
    param (
        [string]$Message
    )
    $TimeStamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $LogEntry = "[$TimeStamp] $Message"
    Write-Host $LogEntry
    Add-Content -Path $LogFile -Value $LogEntry
}

# Function to read JSON configuration file
function Read-JsonConfig {
    param (
        [string]$FilePath
    )
    
    if (Test-Path $FilePath) {
        try {
            $jsonContent = Get-Content -Path $FilePath -Raw | ConvertFrom-Json
            return $jsonContent
        }
        catch {
            Log-Message "ERROR: Failed to parse JSON configuration file: $_"
            exit 1
        }
    }
    else {
        Log-Message "ERROR: Configuration file not found: $FilePath"
        exit 1
    }
}

Log-Message "==== Starting GitHub backup scheduler setup ===="
Log-Message "Repository directory: $RepoDir"
Log-Message "Backup script: $BackupScript"

# Check if the backup script exists
if (-not (Test-Path $BackupScript)) {
    Log-Message "ERROR: Backup script not found: $BackupScript"
    exit 1
}

# Read configuration
$config = Read-JsonConfig -FilePath $ConfigFile

# Function to create scheduled task
function New-BackupScheduledTask {
    param (
        [string]$Trigger,
        [string]$Description,
        [string]$TaskName
    )
    
    # Delete existing task if it exists
    $existingTask = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
    if ($existingTask) {
        Log-Message "Removing existing scheduled task: $TaskName"
        Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
    }
    
    # Create the scheduled task
    try {
        $action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-ExecutionPolicy Bypass -File `"$BackupScript`"" -WorkingDirectory $RepoDir
        
        # Create the appropriate trigger based on the parameter
        switch ($Trigger) {
            "Hourly" {
                $triggerParams = @{
                    Once = $true
                    At = (Get-Date -Hour (Get-Date).Hour -Minute $config.schedule.hourly.minute -Second 0)
                    RepetitionInterval = (New-TimeSpan -Hours 1)
                }
            }
            "Daily" {
                $triggerParams = @{
                    Daily = $true
                    At = "{0:D2}:{1:D2}" -f $config.schedule.daily.hour, $config.schedule.daily.minute
                }
            }
            "Weekly" {
                $triggerParams = @{
                    Weekly = $true
                    At = "{0:D2}:{1:D2}" -f $config.schedule.weekly.hour, $config.schedule.weekly.minute
                    DaysOfWeek = $config.schedule.weekly.day
                }
            }
        }
        
        $trigger = New-ScheduledTaskTrigger @triggerParams
        $settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
        
        # Register the task
        $taskParams = @{
            Action = $action
            Trigger = $trigger
            TaskName = $TaskName
            Description = $Description
            Settings = $settings
        }
        
        Register-ScheduledTask @taskParams | Out-Null
        Log-Message "Successfully created scheduled task: $TaskName ($Description)"
        return $true
    }
    catch {
        Log-Message "ERROR: Failed to create scheduled task: $_"
        return $false
    }
}

# Create scheduled tasks based on configuration
$tasksCreated = 0

# Setup hourly backup if enabled
if ($config.schedule.hourly.enabled) {
    $hourlyTaskName = "$TaskName - Hourly"
    $success = New-BackupScheduledTask -Trigger "Hourly" -Description "Hourly backup of OSPAiN2 repository to GitHub" -TaskName $hourlyTaskName
    if ($success) { $tasksCreated++ }
}

# Setup daily backup if enabled
if ($config.schedule.daily.enabled) {
    $dailyTaskName = "$TaskName - Daily"
    $success = New-BackupScheduledTask -Trigger "Daily" -Description "Daily backup of OSPAiN2 repository to GitHub" -TaskName $dailyTaskName
    if ($success) { $tasksCreated++ }
}

# Setup weekly backup if enabled
if ($config.schedule.weekly.enabled) {
    $weeklyTaskName = "$TaskName - Weekly"
    $success = New-BackupScheduledTask -Trigger "Weekly" -Description "Weekly backup of OSPAiN2 repository to GitHub" -TaskName $weeklyTaskName
    if ($success) { $tasksCreated++ }
}

if ($tasksCreated -gt 0) {
    Log-Message "Successfully created $tasksCreated scheduled tasks for GitHub backup"
}
else {
    Log-Message "WARNING: No backup schedules were enabled in the configuration"
}

# Verify tasks were created
Log-Message "Verifying scheduled tasks..."
$verificationResults = Get-ScheduledTask | Where-Object {$_.TaskName -like "*$TaskName*"}
if ($verificationResults) {
    Log-Message "Scheduled tasks created successfully:"
    foreach ($task in $verificationResults) {
        Log-Message "  - $($task.TaskName)"
    }
}
else {
    Log-Message "WARNING: No scheduled tasks found with name containing '$TaskName'"
}

Log-Message "==== GitHub backup scheduler setup completed ===="

# Show scheduled tasks
Log-Message "Current scheduled tasks:"
Get-ScheduledTask | Where-Object {$_.TaskName -like "*$TaskName*"} | Format-Table -Property TaskName, State, Description | Out-String | ForEach-Object { Log-Message $_ }

exit 0 