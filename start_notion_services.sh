#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=====================================${NC}"
echo -e "${BLUE}  OSPAiN2 Notion Integration Startup ${NC}"
echo -e "${BLUE}=====================================${NC}"

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Check for Python
if ! command_exists python3 && ! command_exists python; then
  echo -e "${YELLOW}Python not found. Please install Python 3.6 or higher.${NC}"
  exit 1
fi

PYTHON="python3"
if ! command_exists python3; then
  PYTHON="python"
fi

# Check for required dependencies
echo -e "${BLUE}Checking dependencies...${NC}"
$PYTHON -c "import requests" 2>/dev/null
if [ $? -ne 0 ]; then
  echo -e "${YELLOW}Installing required Python packages...${NC}"
  $PYTHON -m pip install requests
fi

# Check for API key
if [ -z "$NOTION_TOKEN" ]; then
  echo -e "${YELLOW}Warning: NOTION_TOKEN environment variable not set.${NC}"
  echo -e "${YELLOW}Please set your Notion API token:${NC}"
  echo -e "${YELLOW}export NOTION_TOKEN=\"your_token_here\"${NC}"
  read -p "Do you want to continue anyway? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

# Start services in the background
echo -e "${BLUE}Starting Notion API Proxy...${NC}"
$PYTHON notion_proxy.py > notion_proxy_output.log 2>&1 &
PROXY_PID=$!
echo -e "${GREEN}Notion Proxy started with PID $PROXY_PID${NC}"

# Wait a moment for proxy to start
sleep 2

# Start HTTP server for test interface
echo -e "${BLUE}Starting HTTP Server for test interface...${NC}"
$PYTHON -m http.server 8000 > http_server_output.log 2>&1 &
HTTP_PID=$!
echo -e "${GREEN}HTTP Server started with PID $HTTP_PID${NC}"

# Check if notion_databases.json exists
if [ ! -f "notion_databases.json" ]; then
  echo -e "${YELLOW}notion_databases.json not found. Do you want to run the database setup? (y/n)${NC}"
  read -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}Running database setup...${NC}"
    $PYTHON create_notion_database.py
  fi
fi

# Show the URLs
echo -e "${GREEN}Services started successfully!${NC}"
echo -e "${GREEN}Test interface: http://localhost:8000/notion_tests.html${NC}"
echo -e "${GREEN}Notion API Proxy: http://localhost:8001${NC}"

# Display logs in real time
echo -e "${BLUE}Press Ctrl+C to stop all services${NC}"
echo -e "${BLUE}Displaying logs (last 5 lines from each):${NC}"

echo -e "${YELLOW}--- Notion Proxy Log ---${NC}"
tail -n 5 notion_proxy.log
echo

echo -e "${YELLOW}--- HTTP Server Log ---${NC}"
tail -n 5 http_server_output.log
echo

# Handle service cleanup on exit
cleanup() {
  echo -e "${BLUE}Stopping services...${NC}"
  kill $PROXY_PID 2>/dev/null
  kill $HTTP_PID 2>/dev/null
  echo -e "${GREEN}Services stopped.${NC}"
  exit 0
}

trap cleanup INT TERM

# Keep script running to allow for Ctrl+C to stop services
while true; do
  sleep 1
done 