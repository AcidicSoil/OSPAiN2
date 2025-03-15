#!/bin/bash

# MicroManager Log Monitor
# This script monitors log directories to ensure proper output from loggers

# Source the logging system to access variables
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/micromanager-logs.sh"

# Configuration
CHECK_INTERVAL=300  # 5 minutes in seconds
MAX_LOG_AGE=604800  # 7 days in seconds
MIN_EXPECTED_ENTRIES=1  # Minimum expected log entries in active files
ALERT_SIZE=10485760  # 10MB - alert if logs exceed this size

# Color codes for output
RED='\033[0;31m'
YELLOW='\033[0;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check log file health
check_log_file() {
  local log_file="$1"
  local log_name="$2"
  local issues=0
  
  echo -e "${BLUE}Checking ${log_name} log file: ${log_file}${NC}"
  
  # Check if file exists
  if [ ! -f "$log_file" ]; then
    echo -e "${RED}ERROR: Log file does not exist!${NC}"
    issues=$((issues + 1))
    return $issues
  fi
  
  # Check file permissions
  if [ ! -r "$log_file" ]; then
    echo -e "${RED}ERROR: Log file is not readable!${NC}"
    issues=$((issues + 1))
  fi
  
  # Check if file is writable
  if [ ! -w "$log_file" ]; then
    echo -e "${RED}ERROR: Log file is not writable!${NC}"
    issues=$((issues + 1))
  fi
  
  # Check file size
  local size=$(stat -c%s "$log_file")
  if [ $size -eq 0 ]; then
    echo -e "${YELLOW}WARNING: Log file is empty!${NC}"
    issues=$((issues + 1))
  elif [ $size -gt $ALERT_SIZE ]; then
    echo -e "${YELLOW}WARNING: Log file is very large ($(numfmt --to=iec-i --suffix=B $size))${NC}"
    issues=$((issues + 1))
  else
    echo -e "${GREEN}Log file size: $(numfmt --to=iec-i --suffix=B $size)${NC}"
  fi
  
  # Check modification time
  local mtime=$(stat -c%Y "$log_file")
  local now=$(date +%s)
  local age=$((now - mtime))
  
  if [ $age -gt $MAX_LOG_AGE ]; then
    echo -e "${YELLOW}WARNING: Log file hasn't been updated in $(($age / 86400)) days${NC}"
    issues=$((issues + 1))
  else
    echo -e "${GREEN}Last updated: $(date -d "@$mtime" "+%Y-%m-%d %H:%M:%S") ($(($age / 60)) minutes ago)${NC}"
  fi
  
  # Check log format and integrity
  if ! head -n 5 "$log_file" | grep -q "MicroManager Log"; then
    echo -e "${YELLOW}WARNING: Log file may not have correct header format${NC}"
    issues=$((issues + 1))
  fi
  
  # Check for minimum expected entries (except for error log which might be empty)
  if [[ "$log_file" != "$ERROR_LOG" ]]; then
    local entries=$(grep -c "[" "$log_file")
    if [ $entries -lt $MIN_EXPECTED_ENTRIES ]; then
      echo -e "${YELLOW}WARNING: Log file has fewer entries ($entries) than expected ($MIN_EXPECTED_ENTRIES)${NC}"
      issues=$((issues + 1))
    else
      echo -e "${GREEN}Log entries: $entries${NC}"
    fi
  fi
  
  # Check for corruption
  if ! tail -n 10 "$log_file" > /dev/null 2>&1; then
    echo -e "${RED}ERROR: Log file appears to be corrupted${NC}"
    issues=$((issues + 1))
  fi
  
  return $issues
}

# Function to analyze log content for problems
analyze_log_content() {
  local log_file="$1"
  local log_name="$2"
  local issues=0
  
  echo -e "${BLUE}Analyzing ${log_name} log content for issues${NC}"
  
  # Skip if file doesn't exist or is empty
  if [ ! -f "$log_file" ] || [ ! -s "$log_file" ]; then
    echo -e "${YELLOW}Cannot analyze: file doesn't exist or is empty${NC}"
    return 1
  fi
  
  # Look for specific patterns based on log type
  case "$log_name" in
    "interaction")
      # Check for high failure rate
      local total=$(grep -c "\[" "$log_file")
      local failures=$(grep -c "FAILED" "$log_file")
      if [ $total -gt 0 ]; then
        local failure_rate=$(( (failures * 100) / total ))
        if [ $failure_rate -gt 20 ]; then
          echo -e "${RED}High failure rate: ${failure_rate}% (${failures}/${total})${NC}"
          issues=$((issues + 1))
        else
          echo -e "${GREEN}Failure rate: ${failure_rate}% (${failures}/${total})${NC}"
        fi
      fi
      
      # Check for unusual activity spikes
      local recent_entries=$(grep -c "$(date +"%Y-%m-%d")" "$log_file")
      echo -e "${GREEN}Today's activity: ${recent_entries} log entries${NC}"
      ;;
      
    "failure")
      # Extract common failure reasons
      echo -e "${BLUE}Top failure reasons:${NC}"
      grep "REASON:" "$log_file" | sort | uniq -c | sort -nr | head -5 | 
        sed 's/^[ \t]*/  /'
      
      # Check for repeated failures of the same type in short timespan
      local repeated_failures=$(grep -A 1 "TIMESTAMP:" "$log_file" | 
        grep -B 1 "REASON:" | paste - - | sort |
        uniq -c | sort -nr | head -1)
      local repeated_count=$(echo "$repeated_failures" | awk '{print $1}')
      
      if [ "$repeated_count" -gt 5 ]; then
        echo -e "${YELLOW}WARNING: Detected repeated failures of the same type ($repeated_count times)${NC}"
        echo "  $repeated_failures" | sed 's/^[ \t]*/  /'
        issues=$((issues + 1))
      fi
      ;;
      
    "error")
      # Count errors by type
      echo -e "${BLUE}Error types:${NC}"
      grep "ERROR:" "$log_file" | sort | uniq -c | sort -nr | head -5 |
        sed 's/^[ \t]*/  /'
      
      # Check for system errors
      if grep -q "ENVIRONMENT:" "$log_file"; then
        echo -e "${GREEN}Environment information is being captured with errors${NC}"
      else
        echo -e "${YELLOW}WARNING: Environment information missing from error logs${NC}"
        issues=$((issues + 1))
      fi
      ;;
  esac
  
  return $issues
}

# Function to check log directory
check_log_directory() {
  local issues=0
  
  echo -e "${BLUE}Checking log directory: ${LOG_DIR}${NC}"
  
  # Check if directory exists
  if [ ! -d "$LOG_DIR" ]; then
    echo -e "${RED}ERROR: Log directory does not exist!${NC}"
    echo -e "${YELLOW}Attempting to create log directory...${NC}"
    mkdir -p "$LOG_DIR"
    if [ $? -eq 0 ]; then
      echo -e "${GREEN}Successfully created log directory${NC}"
    else
      echo -e "${RED}Failed to create log directory${NC}"
      return 1
    fi
  fi
  
  # Check directory permissions
  if [ ! -r "$LOG_DIR" ] || [ ! -w "$LOG_DIR" ] || [ ! -x "$LOG_DIR" ]; then
    echo -e "${RED}ERROR: Log directory has incorrect permissions!${NC}"
    issues=$((issues + 1))
  fi
  
  # Check for rotated logs and their age
  echo -e "${BLUE}Checking rotated log files:${NC}"
  local rotated_logs=$(find "$LOG_DIR" -name "*.log.*" 2>/dev/null | wc -l)
  echo -e "${GREEN}Found $rotated_logs rotated log files${NC}"
  
  # List rotated logs older than MAX_LOG_AGE
  local old_logs=$(find "$LOG_DIR" -name "*.log.*" -mtime +$((MAX_LOG_AGE / 86400)) 2>/dev/null)
  if [ -n "$old_logs" ]; then
    echo -e "${YELLOW}WARNING: Found old rotated logs that could be archived or deleted:${NC}"
    echo "$old_logs" | sed 's/^/  /'
    issues=$((issues + 1))
  fi
  
  # Check disk space
  local available_space=$(df -k "$LOG_DIR" | awk 'NR==2 {print $4}')
  if [ $available_space -lt 102400 ]; then # Less than 100MB
    echo -e "${RED}WARNING: Low disk space for logs: $(($available_space / 1024))MB available${NC}"
    issues=$((issues + 1))
  else
    echo -e "${GREEN}Available disk space: $(($available_space / 1024))MB${NC}"
  fi
  
  return $issues
}

# Function to create a health dashboard
generate_health_dashboard() {
  local output_file="${1:-$LOG_DIR/health_report.html}"
  
  echo -e "${BLUE}Generating health dashboard to ${output_file}${NC}"
  
  # Basic statistics
  local total_interactions=$(grep -c "[" "$INTERACTION_LOG" 2>/dev/null || echo "0")
  local total_failures=$(grep -c "FAILURE LOG ENTRY" "$FAILURE_LOG" 2>/dev/null || echo "0")
  local total_errors=$(grep -c "ERROR LOG ENTRY" "$ERROR_LOG" 2>/dev/null || echo "0")
  
  local interaction_size=$(stat -c%s "$INTERACTION_LOG" 2>/dev/null || echo "0")
  local failure_size=$(stat -c%s "$FAILURE_LOG" 2>/dev/null || echo "0")
  local error_size=$(stat -c%s "$ERROR_LOG" 2>/dev/null || echo "0")
  
  # Generate HTML report
  {
    echo "<!DOCTYPE html>"
    echo "<html><head><title>MicroManager Log Health Report</title>"
    echo "<style>"
    echo "body { font-family: Arial, sans-serif; margin: 20px; }"
    echo "h1, h2 { color: #333; }"
    echo ".dashboard { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }"
    echo ".card { border: 1px solid #ddd; border-radius: 5px; padding: 15px; }"
    echo ".success { background-color: #d4edda; }"
    echo ".warning { background-color: #fff3cd; }"
    echo ".error { background-color: #f8d7da; }"
    echo ".stat { font-size: 24px; font-weight: bold; margin: 10px 0; }"
    echo "table { width: 100%; border-collapse: collapse; }"
    echo "table, th, td { border: 1px solid #ddd; }"
    echo "th, td { padding: 8px; text-align: left; }"
    echo "th { background-color: #f2f2f2; }"
    echo "</style>"
    echo "</head><body>"
    echo "<h1>MicroManager Log Health Report</h1>"
    echo "<p>Generated on $(date)</p>"
    
    echo "<div class='dashboard'>"
    # Interaction log card
    echo "<div class='card'>"
    echo "<h2>Interaction Log</h2>"
    echo "<div class='stat'>$total_interactions entries</div>"
    echo "<p>Size: $(numfmt --to=iec-i --suffix=B $interaction_size)</p>"
    if [ $total_interactions -gt 0 ]; then
      echo "<p>Last entry: $(tail -n 1 "$INTERACTION_LOG" | cut -d ']' -f 1,2,3,4,5,6 | tr -d '[]')</p>"
    fi
    echo "</div>"
    
    # Failure log card
    local card_class="card"
    [ $total_failures -gt 10 ] && card_class="card warning"
    [ $total_failures -gt 50 ] && card_class="card error"
    echo "<div class='$card_class'>"
    echo "<h2>Failure Log</h2>"
    echo "<div class='stat'>$total_failures entries</div>"
    echo "<p>Size: $(numfmt --to=iec-i --suffix=B $failure_size)</p>"
    if [ $total_failures -gt 0 ]; then
      echo "<h3>Top Failure Reasons:</h3>"
      echo "<ul>"
      grep "REASON:" "$FAILURE_LOG" 2>/dev/null | sort | uniq -c | sort -nr | head -3 | 
        while read count reason; do
          echo "<li>$reason ($count times)</li>"
        done
      echo "</ul>"
    fi
    echo "</div>"
    
    # Error log card
    card_class="card"
    [ $total_errors -gt 5 ] && card_class="card warning"
    [ $total_errors -gt 20 ] && card_class="card error"
    echo "<div class='$card_class'>"
    echo "<h2>Error Log</h2>"
    echo "<div class='stat'>$total_errors entries</div>"
    echo "<p>Size: $(numfmt --to=iec-i --suffix=B $error_size)</p>"
    if [ $total_errors -gt 0 ]; then
      echo "<h3>Recent Errors:</h3>"
      echo "<ul>"
      grep -A 1 "ERROR LOG ENTRY" "$ERROR_LOG" 2>/dev/null | grep "ERROR:" | tail -3 | 
        while read line; do
          echo "<li>${line#ERROR: }</li>"
        done
      echo "</ul>"
    fi
    echo "</div>"
    echo "</div>"
    
    # Mode transitions table
    echo "<h2>Mode Transitions (Last 10)</h2>"
    echo "<table>"
    echo "<tr><th>Timestamp</th><th>From</th><th>To</th><th>Result</th><th>Reason</th></tr>"
    grep "mode_transition" "$INTERACTION_LOG" 2>/dev/null | tail -10 |
      while read line; do
        timestamp=$(echo "$line" | cut -d '[' -f 2 | cut -d ']' -f 1)
        from=$(echo "$line" | cut -d '[' -f 5 | cut -d ']' -f 1)
        to=$(echo "$line" | cut -d '[' -f 6 | cut -d ']' -f 1)
        result=$(echo "$line" | cut -d '[' -f 7 | cut -d ']' -f 1)
        reason=$(echo "$line" | cut -d '[' -f 8 | cut -d ']' -f 1)
        
        result_class=""
        [ "$result" = "SUCCESS" ] && result_class="success"
        [ "$result" = "FAILED" ] && result_class="error"
        [ "$result" = "WARNING" ] && result_class="warning"
        
        echo "<tr><td>$timestamp</td><td>$from</td><td>$to</td><td class='$result_class'>$result</td><td>$reason</td></tr>"
      done
    echo "</table>"
    
    echo "<h2>System Information</h2>"
    echo "<ul>"
    echo "<li><strong>Log Directory:</strong> $LOG_DIR</li>"
    echo "<li><strong>Disk Space Available:</strong> $(df -h "$LOG_DIR" | awk 'NR==2 {print $4}')</li>"
    echo "<li><strong>Log Rotation Size:</strong> $(numfmt --to=iec-i --suffix=B $MAX_LOG_SIZE)</li>"
    echo "<li><strong>Rotated Log Files:</strong> $(find "$LOG_DIR" -name "*.log.*" 2>/dev/null | wc -l)</li>"
    echo "</ul>"
    
    echo "</body></html>"
  } > "$output_file"
  
  echo -e "${GREEN}Health dashboard generated: $output_file${NC}"
}

# Function to run all checks
run_health_check() {
  local total_issues=0
  local issues=0
  
  echo "===========================================" 
  echo "MicroManager Log Health Check: $(date)"
  echo "===========================================" 
  
  # Check log directory
  check_log_directory
  issues=$?
  total_issues=$((total_issues + issues))
  
  # Check individual log files
  check_log_file "$INTERACTION_LOG" "interaction"
  issues=$?
  total_issues=$((total_issues + issues))
  
  check_log_file "$FAILURE_LOG" "failure"
  issues=$?
  total_issues=$((total_issues + issues))
  
  check_log_file "$ERROR_LOG" "error"
  issues=$?
  total_issues=$((total_issues + issues))
  
  # Analyze log content
  analyze_log_content "$INTERACTION_LOG" "interaction"
  issues=$?
  total_issues=$((total_issues + issues))
  
  analyze_log_content "$FAILURE_LOG" "failure"
  issues=$?
  total_issues=$((total_issues + issues))
  
  analyze_log_content "$ERROR_LOG" "error"
  issues=$?
  total_issues=$((total_issues + issues))
  
  # Generate health dashboard
  generate_health_dashboard
  
  echo "===========================================" 
  if [ $total_issues -eq 0 ]; then
    echo -e "${GREEN}No issues found! All logs are healthy.${NC}"
  else
    echo -e "${YELLOW}Found $total_issues potential issues that require attention.${NC}"
  fi
  echo "===========================================" 
  
  return $total_issues
}

# Main command processing
case "${1:-help}" in
  check)
    run_health_check
    ;;
  monitor)
    echo "Starting continuous monitoring (interval: ${CHECK_INTERVAL}s). Press Ctrl+C to stop."
    while true; do
      run_health_check
      sleep $CHECK_INTERVAL
    done
    ;;
  dashboard)
    generate_health_dashboard "${2:-$LOG_DIR/health_report.html}"
    ;;
  help|--help|-h)
    echo "MicroManager Log Monitor"
    echo ""
    echo "Usage:"
    echo "  $0 check              - Run a single health check on all logs"
    echo "  $0 monitor            - Continuously monitor logs every ${CHECK_INTERVAL}s"
    echo "  $0 dashboard [file]   - Generate an HTML health dashboard"
    echo ""
    echo "Examples:"
    echo "  $0 check"
    echo "  $0 dashboard ./public/log_health.html"
    ;;
  *)
    echo "Unknown command: $1"
    echo "Run '$0 help' for usage information."
    exit 1
    ;;
esac 