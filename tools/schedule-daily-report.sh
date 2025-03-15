#!/bin/bash

# schedule-daily-report.sh
# 
# This script sets up a cron job to run the daily metrics report generator.
# It schedules the report to be generated at midnight every day.
#
# Usage:
#   ./schedule-daily-report.sh [--time HH:MM] [--disable]

# Default values
TIME="00:00"
DISABLE=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --time)
      TIME="$2"
      shift 2
      ;;
    --disable)
      DISABLE=true
      shift
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Validate time format
if ! [[ $TIME =~ ^([0-1][0-9]|2[0-3]):[0-5][0-9]$ ]]; then
  echo "Error: Invalid time format. Please use HH:MM format (24-hour)."
  exit 1
fi

# Extract hours and minutes
HOUR=${TIME%:*}
MINUTE=${TIME#*:}

# Remove leading zeros
HOUR=${HOUR#0}
MINUTE=${MINUTE#0}

# Get the absolute path to the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PARENT_DIR="$(dirname "$SCRIPT_DIR")"
REPORT_SCRIPT="$SCRIPT_DIR/generate-daily-report.js"

# Make sure the report script is executable
chmod +x "$REPORT_SCRIPT"

# Create the cron expression
CRON_EXPRESSION="$MINUTE $HOUR * * * cd $PARENT_DIR && node $REPORT_SCRIPT > $PARENT_DIR/logs/daily-report.log 2>&1"

# Function to add cron job
add_cron_job() {
  # Check if the cron job already exists
  EXISTING_CRON=$(crontab -l 2>/dev/null | grep -F "$REPORT_SCRIPT")
  
  if [[ -n $EXISTING_CRON ]]; then
    echo "Daily report cron job already exists. Updating..."
    (crontab -l 2>/dev/null | grep -v "$REPORT_SCRIPT"; echo "$CRON_EXPRESSION") | crontab -
  else
    echo "Adding new daily report cron job..."
    (crontab -l 2>/dev/null; echo "$CRON_EXPRESSION") | crontab -
  fi
  
  echo "Cron job scheduled to run daily at $TIME."
  echo "Cron expression: $CRON_EXPRESSION"
}

# Function to remove cron job
remove_cron_job() {
  EXISTING_CRON=$(crontab -l 2>/dev/null | grep -F "$REPORT_SCRIPT")
  
  if [[ -n $EXISTING_CRON ]]; then
    echo "Removing daily report cron job..."
    crontab -l 2>/dev/null | grep -v "$REPORT_SCRIPT" | crontab -
    echo "Cron job removed."
  else
    echo "No daily report cron job found."
  fi
}

# Create logs directory if it doesn't exist
mkdir -p "$PARENT_DIR/logs"

# Either add or remove the cron job
if [[ $DISABLE == true ]]; then
  remove_cron_job
else
  add_cron_job
fi

# Final message
if [[ $DISABLE == true ]]; then
  echo "Daily report scheduling has been disabled."
  echo "To re-enable, run: $0"
else
  echo "Daily report has been scheduled."
  echo "To disable, run: $0 --disable"
  echo "To change the time, run: $0 --time HH:MM"
  echo "Reports will be saved to: $PARENT_DIR/reports/daily/"
  echo "Logs will be saved to: $PARENT_DIR/logs/daily-report.log"
fi

# For Windows: Instructions for Task Scheduler
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
  echo ""
  echo "For Windows: Use Task Scheduler instead of cron:"
  echo "1. Open Task Scheduler"
  echo "2. Create a new Basic Task"
  echo "3. Name it 'Daily Metrics Report'"
  echo "4. Select 'Daily' trigger"
  echo "5. Set start time to $TIME"
  echo "6. Select 'Start a program' action"
  echo "7. Program/script: node.exe"
  echo "8. Arguments: $REPORT_SCRIPT"
  echo "9. Start in: $PARENT_DIR"
fi

# For macOS: Instructions for launchd
if [[ "$OSTYPE" == "darwin"* ]]; then
  echo ""
  echo "For macOS: You can also use launchd instead of cron:"
  echo "Create a .plist file in ~/Library/LaunchAgents/"
  echo "Example: com.ollama.dailyreport.plist"
  
  PLIST_PATH="$HOME/Library/LaunchAgents/com.ollama.dailyreport.plist"
  
  read -p "Would you like to create a launchd plist file? (y/n) " CREATE_PLIST
  
  if [[ $CREATE_PLIST == "y" || $CREATE_PLIST == "Y" ]]; then
    cat > "$PLIST_PATH" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.ollama.dailyreport</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/node</string>
        <string>$REPORT_SCRIPT</string>
    </array>
    <key>StartCalendarInterval</key>
    <dict>
        <key>Hour</key>
        <integer>$HOUR</integer>
        <key>Minute</key>
        <integer>$MINUTE</integer>
    </dict>
    <key>WorkingDirectory</key>
    <string>$PARENT_DIR</string>
    <key>StandardOutPath</key>
    <string>$PARENT_DIR/logs/daily-report.log</string>
    <key>StandardErrorPath</key>
    <string>$PARENT_DIR/logs/daily-report.log</string>
</dict>
</plist>
EOF
    
    echo "Created launchd plist at $PLIST_PATH"
    echo "To load: launchctl load $PLIST_PATH"
    echo "To unload: launchctl unload $PLIST_PATH"
  fi
fi

exit 0 