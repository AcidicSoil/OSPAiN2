#!/bin/bash
# system-file-manager.sh
# H1::P1 - Automated management of system-level MDC files with @ prefix
# 
# This script automates the process of identifying, tagging, and maintaining
# system-level MDC files with the @ prefix convention.

set -e

# Text formatting
bold=$(tput bold)
normal=$(tput sgr0)
green=$(tput setaf 2)
yellow=$(tput setaf 3)
blue=$(tput setaf 4)
red=$(tput setaf 1)

# Configuration
SYSTEM_FILES_MANIFEST="system-files-manifest.json"

function show_help() {
  echo "${bold}SYSTEM FILE MANAGER${normal}"
  echo "Manages system-level MDC files with @ prefix convention"
  echo ""
  echo "${bold}USAGE:${normal}"
  echo "  ${0} [command] [options]"
  echo ""
  echo "${bold}COMMANDS:${normal}"
  echo "  tag <file.mdc>        Add @ prefix to a file and update references"
  echo "  untag <@file.mdc>     Remove @ prefix from a file and update references"
  echo "  list                  List all system files with @ prefix"
  echo "  scan                  Scan for potential system files that should have @ prefix"
  echo "  update-refs           Update all references to system files in the codebase"
  echo "  report                Generate a report of system files status"
  echo "  help                  Show this help message"
  echo ""
  echo "${bold}OPTIONS:${normal}"
  echo "  --dry-run             Show what would be done without making changes"
  echo "  --backup              Create backups of modified files"
  echo "  --force               Force operation without confirmation"
  echo ""
  echo "${bold}EXAMPLES:${normal}"
  echo "  ${0} tag master-todo.mdc"
  echo "  ${0} list"
  echo "  ${0} scan --dry-run"
  echo ""
}

function is_system_file() {
  local file=$1
  
  # Check if file exists
  if [ ! -f "$file" ]; then
    echo "${red}Error: File $file does not exist${normal}" >&2
    return 1
  fi
  
  # Criteria for system files
  local is_system=0
  
  # Check if file has "alwaysApply: true" header
  if grep -q "alwaysApply: true" "$file"; then
    is_system=1
  fi
  
  # Check if file has "todo:: master" header
  if grep -q "todo:: master" "$file"; then
    is_system=1
  fi
  
  # Check if file contains specific system-level indicators
  if grep -q "## High Priority Tasks" "$file" || \
     grep -q "## Status Indicators" "$file" || \
     grep -q "## Development Modes Framework" "$file" || \
     grep -q "## Horizon Management" "$file"; then
    is_system=1
  fi
  
  return $is_system
}

function tag_file() {
  local file=$1
  local dry_run=${2:-false}
  local backup=${3:-false}
  
  # Remove @ prefix if it exists
  local base_name=$(basename "$file")
  local dir_name=$(dirname "$file")
  base_name=${base_name#@}
  
  # Target file name with @ prefix
  local target="$dir_name/@$base_name"
  
  # Check if file exists
  if [ ! -f "$file" ]; then
    echo "${red}Error: File $file does not exist${normal}" >&2
    return 1
  fi
  
  # Check if already has @ prefix
  if [[ "$file" == *"@"* ]]; then
    echo "${yellow}File $file already has @ prefix${normal}" >&2
    return 0
  fi
  
  # Verify it's a system file
  if ! is_system_file "$file"; then
    echo "${yellow}Warning: $file doesn't appear to be a system file${normal}" >&2
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      return 1
    fi
  fi
  
  echo "Tagging $file as system file..."
  
  # Create backup if requested
  if [ "$backup" = true ]; then
    if [ "$dry_run" = false ]; then
      cp "$file" "$file.bak"
      echo "${blue}Created backup: $file.bak${normal}"
    else
      echo "${blue}[DRY RUN] Would create backup: $file.bak${normal}"
    fi
  fi
  
  # Perform the tagging
  if [ "$dry_run" = false ]; then
    cp "$file" "$target"
    echo "${green}Created $target${normal}"
    
    # Update references in codebase
    echo "Updating references in codebase..."
    find . -type f -not -path "*/node_modules/*" -not -path "*/.git/*" \
      -not -path "*/dist/*" -not -path "*/build/*" \
      -exec grep -l "$base_name" {} \; | while read -r ref_file; do
      # Skip the file itself and its backup
      if [[ "$ref_file" != "$file" && "$ref_file" != "$file.bak" && "$ref_file" != "$target" ]]; then
        if [ "$backup" = true ]; then
          cp "$ref_file" "$ref_file.bak"
        fi
        sed -i "s|$base_name|@$base_name|g" "$ref_file"
        echo "  Updated references in $ref_file"
      fi
    done
    
    # Add to manifest
    update_manifest "$target" "add"
  else
    echo "${blue}[DRY RUN] Would create $target${normal}"
    echo "${blue}[DRY RUN] Would update references in codebase${normal}"
  fi
}

function untag_file() {
  local file=$1
  local dry_run=${2:-false}
  local backup=${3:-false}
  
  # Check if file has @ prefix
  if [[ "$file" != *"@"* ]]; then
    echo "${red}Error: File $file doesn't have @ prefix${normal}" >&2
    return 1
  fi
  
  # Get base name without @ prefix
  local base_name=$(basename "$file")
  local dir_name=$(dirname "$file")
  base_name=${base_name#@}
  
  # Target file name without @ prefix
  local target="$dir_name/$base_name"
  
  # Perform the untagging
  if [ "$dry_run" = false ]; then
    # Create backup if requested
    if [ "$backup" = true ]; then
      cp "$file" "$file.bak"
      echo "${blue}Created backup: $file.bak${normal}"
    fi
    
    cp "$file" "$target"
    echo "${green}Created $target${normal}"
    
    # Update references in codebase
    echo "Updating references in codebase..."
    find . -type f -not -path "*/node_modules/*" -not -path "*/.git/*" \
      -not -path "*/dist/*" -not -path "*/build/*" \
      -exec grep -l "@$base_name" {} \; | while read -r ref_file; do
      # Skip the file itself and its backup
      if [[ "$ref_file" != "$file" && "$ref_file" != "$file.bak" && "$ref_file" != "$target" ]]; then
        if [ "$backup" = true ]; then
          cp "$ref_file" "$ref_file.bak"
        fi
        sed -i "s|@$base_name|$base_name|g" "$ref_file"
        echo "  Updated references in $ref_file"
      fi
    done
    
    # Remove from manifest
    update_manifest "$file" "remove"
  else
    echo "${blue}[DRY RUN] Would create $target${normal}"
    echo "${blue}[DRY RUN] Would update references in codebase${normal}"
  fi
}

function list_system_files() {
  echo "${bold}SYSTEM FILES (@-prefixed)${normal}"
  echo "--------------------------"
  
  # Find all files with @ prefix
  find . -type f -name "@*.mdc" -not -path "*/node_modules/*" -not -path "*/.git/*" | sort | while read -r file; do
    echo "$(basename "$file")"
  done
}

function scan_potential_system_files() {
  echo "${bold}POTENTIAL SYSTEM FILES${normal}"
  echo "----------------------"
  
  # Find all .mdc files without @ prefix
  find . -type f -name "*.mdc" -not -name "@*.mdc" \
    -not -path "*/node_modules/*" -not -path "*/.git/*" | sort | while read -r file; do
    
    if is_system_file "$file"; then
      echo "${yellow}$(basename "$file")${normal} - Appears to be a system file and could be tagged with @"
    fi
  done
}

function update_manifest() {
  local file=$1
  local action=$2
  
  # Create manifest if it doesn't exist
  if [ ! -f "$SYSTEM_FILES_MANIFEST" ]; then
    echo '{"system_files": []}' > "$SYSTEM_FILES_MANIFEST"
  fi
  
  # Read manifest
  local manifest=$(cat "$SYSTEM_FILES_MANIFEST")
  
  if [ "$action" = "add" ]; then
    # Add file to manifest if not already present
    local basename=$(basename "$file")
    if ! echo "$manifest" | grep -q "\"$basename\""; then
      manifest=$(echo "$manifest" | jq ".system_files += [\"$basename\"]")
      echo "$manifest" > "$SYSTEM_FILES_MANIFEST"
    fi
  elif [ "$action" = "remove" ]; then
    # Remove file from manifest
    local basename=$(basename "$file")
    manifest=$(echo "$manifest" | jq ".system_files -= [\"$basename\"]")
    echo "$manifest" > "$SYSTEM_FILES_MANIFEST"
  fi
}

function generate_report() {
  echo "${bold}SYSTEM FILES REPORT${normal}"
  echo "-------------------"
  
  # Count system files
  local system_files_count=$(find . -type f -name "@*.mdc" -not -path "*/node_modules/*" -not -path "*/.git/*" | wc -l)
  echo "Total system files: $system_files_count"
  
  # Check for consistency issues
  echo "Checking for consistency issues..."
  
  # Find references to system files without @ prefix
  find . -type f -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/dist/*" -not -path "*/build/*" | while read -r file; do
    find . -type f -name "@*.mdc" -not -path "*/node_modules/*" -not -path "*/.git/*" | while read -r system_file; do
      base_name=$(basename "$system_file")
      base_name=${base_name#@}
      
      if grep -q "$base_name" "$file" && ! grep -q "@$base_name" "$file"; then
        echo "${yellow}Warning: $file contains references to $base_name without @ prefix${normal}"
      fi
    done
  done
}

# Main logic
if [ $# -eq 0 ]; then
  show_help
  exit 0
fi

# Parse command and options
command=$1
shift

dry_run=false
backup=false
force=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run)
      dry_run=true
      shift
      ;;
    --backup)
      backup=true
      shift
      ;;
    --force)
      force=true
      shift
      ;;
    *)
      # Assume it's a file parameter
      file=$1
      shift
      ;;
  esac
done

# Execute command
case "$command" in
  tag)
    if [ -z "$file" ]; then
      echo "${red}Error: Missing file parameter${normal}" >&2
      exit 1
    fi
    tag_file "$file" "$dry_run" "$backup"
    ;;
  untag)
    if [ -z "$file" ]; then
      echo "${red}Error: Missing file parameter${normal}" >&2
      exit 1
    fi
    untag_file "$file" "$dry_run" "$backup"
    ;;
  list)
    list_system_files
    ;;
  scan)
    scan_potential_system_files
    ;;
  update-refs)
    echo "Updating all references to system files..."
    # Implementation for update-refs
    ;;
  report)
    generate_report
    ;;
  help)
    show_help
    ;;
  *)
    echo "${red}Error: Unknown command $command${normal}" >&2
    show_help
    exit 1
    ;;
esac

exit 0 