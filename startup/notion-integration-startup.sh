#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=====================================${NC}"
echo -e "${BLUE}  Notion Integration Startup Script   ${NC}"
echo -e "${BLUE}=====================================${NC}"

# Function to check if a port is in use
check_port() {
    local port=$1
    if command -v nc >/dev/null 2>&1; then
        nc -z localhost $port >/dev/null 2>&1
        return $?
    else
        node -e "const net=require('net');const s=net.createServer();s.listen($port,'localhost',()=>{s.close();process.exit(0)}).on('error',()=>{process.exit(1)})" >/dev/null 2>&1
        return $?
    fi
}

# Function to wait for service health
wait_for_health() {
    local service=$1
    local url=$2
    local max_attempts=30
    local attempt=1

    echo -n "Waiting for $service to be healthy"
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url/health" | grep -q "healthy"; then
            echo -e "\n${GREEN}$service is healthy!${NC}"
            return 0
        fi
        echo -n "."
        sleep 1
        ((attempt++))
    done
    
    echo -e "\n${RED}$service failed to become healthy within $max_attempts seconds${NC}"
    return 1
}

# Create logs directory
mkdir -p logs

# Check for Python
if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
    echo -e "${RED}Error: Python not found. Please install Python 3.6 or higher.${NC}"
    exit 1
fi

PYTHON="python3"
if ! command -v python3 &> /dev/null; then
    PYTHON="python"
fi

# Check for required dependencies
echo -e "${BLUE}Checking dependencies...${NC}"
$PYTHON -c "import requests" 2>/dev/null
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}Installing required Python packages...${NC}"
    $PYTHON -m pip install requests
fi

# Verify environment variables
if [ -z "$NOTION_TOKEN" ]; then
    echo -e "${YELLOW}Warning: NOTION_TOKEN environment variable not set${NC}"
    echo -e "${YELLOW}Please set your Notion API token:${NC}"
    echo -e "${YELLOW}export NOTION_TOKEN=\"your_token_here\"${NC}"
    read -p "Do you want to continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Start Notion API Proxy
echo -e "${BLUE}Starting Notion API Proxy...${NC}"
$PYTHON notion_proxy.py > logs/notion_proxy.log 2>&1 &
PROXY_PID=$!

# Wait for proxy to initialize
sleep 2

# Verify proxy is running
if ! ps -p $PROXY_PID > /dev/null; then
    echo -e "${RED}Error: Notion Proxy failed to start. Check logs/notion_proxy.log for details${NC}"
    exit 1
fi

# Start test interface server
echo -e "${BLUE}Starting HTTP Server for test interface...${NC}"
$PYTHON -m http.server 8000 > logs/http_server.log 2>&1 &
HTTP_PID=$!

# Run connection test
echo -e "${BLUE}Running connection tests...${NC}"
node test-notion-connection.js

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

# Show service status
echo -e "\n${GREEN}Services started successfully!${NC}"
echo -e "${GREEN}Test interface: http://localhost:8000/notion_tests.html${NC}"
echo -e "${GREEN}Notion API Proxy: http://localhost:8001${NC}"

# Monitor logs
echo -e "\n${BLUE}Press Ctrl+C to stop all services${NC}"
echo -e "${BLUE}Monitoring logs (last 5 lines from each):${NC}"

tail -f -n 5 logs/notion_proxy.log logs/http_server.log &
TAIL_PID=$!

# Cleanup function
cleanup() {
    echo -e "\n${BLUE}Stopping services...${NC}"
    kill $PROXY_PID $HTTP_PID $TAIL_PID 2>/dev/null
    echo -e "${GREEN}Services stopped.${NC}"
    exit 0
}

trap cleanup INT TERM

# Keep script running
while true; do sleep 1; done 