#!/bin/bash

# Source the jq_windows fix script
source "/c/Users/comfy/OSPAiN2/development-modes/fix_jq_windows.sh"

#
# Mode Context Script
# Outputs the current development mode context
#

# Function to handle jq syntax issues in Windows
jq_windows() {
  if [[ "$(uname -s)" == *"MINGW"* ]] || [[ "$(uname -s)" == *"MSYS"* ]]; then
    # Special handling for Windows Git Bash
    local filter="$1"
    shift
    filter=$(echo "$filter" | sed 's/'''/\\'''/g')
    if [ -n "$1" ]; then
      local tmpfile=$(mktemp -t jq_windows_XXXXXX)
      cat "$1" > "$tmpfile"
      jq "$filter" "$tmpfile"
      local result=$?
      rm -f "$tmpfile"
      return $result
    else
      local tmpfile=$(mktemp -t jq_windows_XXXXXX)
      cat > "$tmpfile"
      jq "$filter" "$tmpfile"
      local result=$?
      rm -f "$tmpfile"
      return $result
    fi
  else
    # Just use regular jq on non-Windows systems
    jq "$@"
  fi
}


SCRIPT_DIR="$(dirname "$(readlink -f "$0")")"
CONTEXT_JS="$SCRIPT_DIR/mode-context.js"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is required to run this script"
    exit 1
fi

# Ensure the mode-context.js file exists
if [[ ! -f "$CONTEXT_JS" ]]; then
    echo "Error: mode-context.js not found at $CONTEXT_JS"
    exit 1
fi

# Parse command line options
FORMAT="full"
CLIPBOARD=false

function print_help {
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  -s, --short     Display short context format"
    echo "  -c, --copy      Copy context to clipboard"
    echo "  -h, --help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0              # Display full context"
    echo "  $0 --short      # Display short context"
    echo "  $0 --copy       # Copy full context to clipboard"
    echo "  $0 -s -c        # Copy short context to clipboard"
    exit 0
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -s|--short)
            FORMAT="short"
            shift
            ;;
        -c|--copy)
            CLIPBOARD=true
            shift
            ;;
        -h|--help)
            print_help
            ;;
        *)
            echo "Error: Unknown option $1"
            print_help
            ;;
    esac
done

# Get the context based on format
if [[ "$FORMAT" == "short" ]]; then
    CONTEXT=$(node -e "console.log(require('$CONTEXT_JS').getShortModeContext())")
else
    CONTEXT=$(node -e "console.log(require('$CONTEXT_JS').generateModeContext())")
fi

# Output the context
echo "$CONTEXT"

# Copy to clipboard if requested
if [[ "$CLIPBOARD" == true ]]; then
    # Try different clipboard commands based on OS
    if command -v xclip &> /dev/null; then
        echo "$CONTEXT" | xclip -selection clipboard
        echo "Context copied to clipboard using xclip"
    elif command -v xsel &> /dev/null; then
        echo "$CONTEXT" | xsel -ib
        echo "Context copied to clipboard using xsel"
    elif command -v pbcopy &> /dev/null; then
        echo "$CONTEXT" | pbcopy
        echo "Context copied to clipboard using pbcopy"
    elif command -v clip.exe &> /dev/null; then
        echo "$CONTEXT" | clip.exe
        echo "Context copied to clipboard using clip.exe"
    else
        echo "Warning: Could not copy to clipboard. No supported clipboard utility found."
    fi
fi

exit 0 