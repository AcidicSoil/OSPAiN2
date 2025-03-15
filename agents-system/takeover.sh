#!/bin/bash
# Complete takeover script for the Ollama ecosystem

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
DATA_DIR="$HOME/ollama-ecosystem/master-player"
CONFIG_FILE=""
VERBOSE=false
FORCE=false

# Display the banner
echo -e "${RED}"
echo "  ___  _   _               _____                        _                   "
echo " / _ \| | | |             |_   _|                      | |                  "
echo "/ /_\ \ |_| | __ _ _ __ ___| | __ _  ___ _ __ _____   _(___ _ __          "
echo "|  _  | __| |/ _\` | '_ \` _ \ |/ _\` |/ _ \ '__/ _ \ \ / / _ \ '__|          "
echo "| | | | |_| | (_| | | | | | | | (_| |  __/ | |  __/\ V /  __/ |           "
echo "\_| |_/\__|_|\__,_|_| |_| |_\_/\__,_|\___|_|  \___| \_/ \___|_|           "
echo "                                                                           "
echo "                      > Master Player Edition <                            "
echo -e "${NC}"
echo -e "${YELLOW}WARNING: This script will execute a complete takeover of the Ollama ecosystem${NC}"
echo -e "${YELLOW}All components will be under the control of the Master Player${NC}"
echo ""

# Function to display help
show_help() {
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  -d, --data-dir DIR   Specify data directory (default: $DATA_DIR)"
    echo "  -c, --config FILE    Specify configuration file"
    echo "  -v, --verbose        Enable verbose output"
    echo "  -f, --force          Skip confirmation prompt"
    echo "  -h, --help           Display this help message"
    echo ""
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -d|--data-dir)
            DATA_DIR="$2"
            shift 2
            ;;
        -c|--config)
            CONFIG_FILE="$2"
            shift 2
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        -f|--force)
            FORCE=true
            shift
            ;;
        *)
            echo "Error: Unknown option $1"
            show_help
            exit 1
            ;;
    esac
done

# Check Python is installed
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Error: Python 3 is required but not installed.${NC}"
    exit 1
fi

# Build command arguments
CMD_ARGS=""
if [ -n "$DATA_DIR" ]; then
    CMD_ARGS="$CMD_ARGS --data-dir \"$DATA_DIR\""
fi
if [ -n "$CONFIG_FILE" ]; then
    CMD_ARGS="$CMD_ARGS --config \"$CONFIG_FILE\""
fi
if [ "$VERBOSE" = true ]; then
    CMD_ARGS="$CMD_ARGS --verbose"
fi

# Confirmation prompt
if [ "$FORCE" != true ]; then
    echo -e "${YELLOW}You are about to execute a complete takeover of the Ollama ecosystem.${NC}"
    echo -e "${YELLOW}This action will establish the Master Player as the complete owner of all components.${NC}"
    echo ""
    echo -e "Data directory: ${BLUE}$DATA_DIR${NC}"
    if [ -n "$CONFIG_FILE" ]; then
        echo -e "Config file: ${BLUE}$CONFIG_FILE${NC}"
    else
        echo -e "Config file: ${BLUE}[Using defaults]${NC}"
    fi
    echo ""
    read -p "Are you sure you want to proceed? (y/N) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}Takeover aborted.${NC}"
        exit 0
    fi
fi

# Create directories if they don't exist
mkdir -p "$DATA_DIR"

echo -e "${GREEN}Initiating complete takeover of the Ollama ecosystem...${NC}"
echo -e "${BLUE}Executing takeover script...${NC}"

# Navigate to the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$SCRIPT_DIR" || { echo -e "${RED}Error: Failed to navigate to script directory.${NC}"; exit 1; }

# Execute the Python script
python3 -m agents_system.takeover $CMD_ARGS

# Check if takeover was successful
if [ $? -eq 0 ]; then
    echo -e "${GREEN}=== TAKEOVER COMPLETE ===${NC}"
    echo -e "${GREEN}The Master Player is now the complete owner of the Ollama ecosystem${NC}"
    echo -e "${GREEN}All systems are under control${NC}"
else
    echo -e "${RED}=== TAKEOVER FAILED ===${NC}"
    echo -e "${RED}Check the logs for more information${NC}"
    exit 1
fi

# Display status file
STATUS_FILE="${DATA_DIR}/takeover_status.txt"
if [ -f "$STATUS_FILE" ]; then
    echo ""
    echo -e "${BLUE}Takeover Status:${NC}"
    cat "$STATUS_FILE"
fi

echo ""
echo -e "${GREEN}Takeover script execution complete.${NC}" 