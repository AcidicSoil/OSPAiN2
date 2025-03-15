#!/bin/bash

# MicroManager Integration Script
# This script integrates the MicroManager logging system with the existing mode switching functionality

# Source the logging system
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/micromanager-logs.sh"

# Hook for the t2p m switch command
micromanager_mode_switch_hook() {
  local current_mode="$1"
  local target_mode="$2"
  local reason="$3"
  local feature_name="${4:-unknown}"
  local prompt="t2p m switch $target_mode \"$reason\""
  
  # Validate the mode transition
  validate_mode_transition "$current_mode" "$target_mode" "$feature_name" "$reason" "$prompt"
  return $?
}

# Function to patch the existing mode switch command
patch_mode_switch_command() {
  local mode_switch_file="$1"
  
  if [ ! -f "$mode_switch_file" ]; then
    log_error "Mode switch file not found" "File: $mode_switch_file"
    echo "❌ Could not find the mode switch file: $mode_switch_file"
    return 1
  fi
  
  # Create backup first
  cp "$mode_switch_file" "${mode_switch_file}.bak.$(date +%Y%m%d%H%M%S)"
  
  # Check if already patched
  if grep -q "micromanager_mode_switch_hook" "$mode_switch_file"; then
    echo "ℹ️ Mode switch command already patched with MicroManager hooks."
    return 0
  fi
  
  # Patch the file - this is a simplified example and should be adapted to the actual file format
  # We're adding a hook before the mode switch is performed
  sed -i 's/switch_mode() {/switch_mode() {\n  # MicroManager integration\n  if command -v micromanager_mode_switch_hook >/dev\/null 2>\&1; then\n    micromanager_mode_switch_hook "$CURRENT_MODE" "$1" "$2" "$3" || return $?\n  fi\n/' "$mode_switch_file"
  
  echo "✅ Mode switch command patched with MicroManager hooks."
  return 0
}

# Function to analyze and fix common mode switching errors
analyze_mode_switch_errors() {
  echo "Analyzing mode switching errors..."
  
  # Look for common patterns in failure logs
  local skipped_modes_count=$(grep -c "ERROR: Cannot skip modes" "$FAILURE_LOG" 2>/dev/null || echo "0")
  local unknown_modes_count=$(grep -c "ERROR: Unknown.*mode" "$FAILURE_LOG" 2>/dev/null || echo "0")
  
  echo "Found $skipped_modes_count instances of skipped modes errors"
  echo "Found $unknown_modes_count instances of unknown mode errors"
  
  # Provide recommendations based on analysis
  if [ "$skipped_modes_count" -gt 0 ]; then
    echo "⚠️ Recommendation: Ensure you follow the correct mode sequence:"
    echo "  design → engineering → testing → deployment → maintenance"
    echo "  Use 't2p m mode_sequence' to see the correct order."
  fi
  
  if [ "$unknown_modes_count" -gt 0 ]; then
    echo "⚠️ Recommendation: Use only valid mode names:"
    echo "  - design"
    echo "  - engineering"
    echo "  - testing"
    echo "  - deployment"
    echo "  - maintenance"
  fi
}

# Function to generate a report of mode switching metrics
generate_mode_metrics() {
  local days="${1:-7}"
  
  echo "Mode Switching Metrics (Last $days days)"
  echo "========================================="
  
  if [ ! -f "$INTERACTION_LOG" ]; then
    echo "No interaction logs found."
    return 1
  fi
  
  # Calculate date for filtering
  local filter_date=$(date -d "$days days ago" +"%Y-%m-%d")
  
  # Get metrics for successful transitions
  echo "Successful Mode Transitions:"
  grep "SUCCESS" "$INTERACTION_LOG" | 
    grep -A 0 "\[$filter_date\|$(date +"%Y-%m-%d")" |
    awk '{print $4, "→", $5}' | 
    sort | uniq -c | sort -nr
  
  echo ""
  
  # Get metrics for failed transitions
  echo "Failed Mode Transitions:"
  grep "FAILED" "$INTERACTION_LOG" | 
    grep -A 0 "\[$filter_date\|$(date +"%Y-%m-%d")" |
    awk '{print $4, "→", $5}' | 
    sort | uniq -c | sort -nr
  
  echo ""
  
  # Most common failure reasons
  echo "Common Failure Reasons:"
  grep -A 3 "REASON:" "$FAILURE_LOG" | 
    grep -v "^--$" | 
    grep "REASON:" | 
    sed 's/REASON: //' | 
    sort | uniq -c | sort -nr | head -5
  
  echo "========================================="
}

# Function to export logs to JSON format
export_logs_to_json() {
  local output_file="${1:-micromanager-logs.json}"
  
  {
    echo "{"
    echo "  \"interactions\": ["
    
    # Process interaction logs
    grep -v "^#" "$INTERACTION_LOG" | grep -v "^-" | 
    awk '{
      gsub(/[][]/,"",$2); session=$2;
      gsub(/[][]/,"",$3); action=$3;
      gsub(/[][]/,"",$4); current=$4;
      gsub(/[][]/,"",$5); target=$5;
      gsub(/[][]/,"",$6); result=$6;
      gsub(/[][]/,"",$7); for(i=7;i<=NF;i++) details=details" "$i;
      printf "    {\"timestamp\": \"%s\", \"session\": \"%s\", \"action\": \"%s\", \"current_mode\": \"%s\", \"target_mode\": \"%s\", \"result\": \"%s\", \"details\": \"%s\"},\n", 
        $1, session, action, current, target, result, details;
      details="";
    }' | sed '$ s/,$//'
    
    echo "  ],"
    echo "  \"failures\": ["
    
    # Process failure logs - this is simplified and may need adjustment depending on exact log format
    grep -A 20 "====== FAILURE LOG ENTRY ======" "$FAILURE_LOG" | 
    grep -v "^--$" | 
    awk 'BEGIN {RS="========"; FS="\n"}
    NR>1 {
      printf "    {";
      for(i=1; i<=NF; i++) {
        if ($i ~ /^[A-Z]+:/) {
          split($i, parts, ":");
          key = tolower(parts[1]);
          $i = substr($i, length(parts[1])+2);
          gsub(/"/,"\\\"",$i);
          if (i>1) printf ", ";
          printf "\"%s\": \"%s\"", key, $i;
        }
      }
      printf "},\n";
    }' | sed '$ s/,$//'
    
    echo "  ]"
    echo "}"
  } > "$output_file"
  
  echo "✅ Logs exported to JSON: $output_file"
}

# Main command processing
case "${1:-help}" in
  patch)
    patch_mode_switch_command "${2:-./m_switch.sh}"
    ;;
  analyze)
    analyze_mode_switch_errors
    ;;
  metrics)
    generate_mode_metrics "${2:-7}"
    ;;
  export)
    export_logs_to_json "${2:-micromanager-logs.json}"
    ;;
  help|--help|-h)
    echo "MicroManager Integration"
    echo ""
    echo "Usage:"
    echo "  $0 patch [mode_switch_file]      - Patch the mode switch command with MicroManager hooks"
    echo "  $0 analyze                       - Analyze common mode switching errors"
    echo "  $0 metrics [days]                - Generate mode switching metrics report (default: 7 days)"
    echo "  $0 export [output_file]          - Export logs to JSON format"
    echo ""
    echo "Examples:"
    echo "  $0 patch ./m_switch.sh"
    echo "  $0 metrics 30"
    echo "  $0 export ./reports/metrics.json"
    ;;
  *)
    echo "Unknown command: $1"
    echo "Run '$0 help' for usage information."
    exit 1
    ;;
esac 