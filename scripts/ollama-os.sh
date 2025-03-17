#!/bin/bash

# ollama-os.sh - Shell wrapper for the OllamaOS system
# This script provides a convenient way to execute the OllamaOS system commands

# Get script directory (handles symlinks too)
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Set colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check if Node.js is installed
check_node() {
  if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is required but not installed.${NC}"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
  fi
}

# Function to check if the script file exists
check_script() {
  local js_script="${SCRIPT_DIR}/ollama-os.js"
  if [ ! -f "$js_script" ]; then
    echo -e "${RED}Error: OllamaOS script not found at ${js_script}${NC}"
    exit 1
  fi
}

# Function to make the script executable if it's not already
ensure_executable() {
  local js_script="${SCRIPT_DIR}/ollama-os.js"
  if [ ! -x "$js_script" ]; then
    chmod +x "$js_script"
    echo -e "${BLUE}Made OllamaOS script executable${NC}"
  fi
}

# Main execution
check_node
check_script
ensure_executable

# Pass all arguments to the Node.js script
echo -e "${GREEN}OllamaOS${NC} - Agent Operating System"
node "${SCRIPT_DIR}/ollama-os.js" "$@" 