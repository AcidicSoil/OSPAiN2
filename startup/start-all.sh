#!/bin/bash

# Combined startup script for OSPAiN₂ ecosystem
# This script starts both the OSPAiN₂ server, the Knowledge Graph server, and the MCP server

# ANSI color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}  OSPAiN₂ Ecosystem Startup Script      ${NC}"
echo -e "${BLUE}=========================================${NC}"
echo

# Set the working directory to the OSPAiN2 project root
cd "$(dirname "$0")/.."
ROOT_DIR=$(pwd)

# Start MCP server
echo -e "\n${BLUE}Starting MCP server...${NC}"
./startup/mcp-server-startup.sh
echo -e "${YELLOW}Waiting for MCP server to initialize...${NC}"
sleep 3

# Start Knowledge Graph server
echo -e "\n${BLUE}Starting Knowledge Graph server...${NC}"
./startup/knowledge-graph-startup.sh
echo -e "${YELLOW}Waiting for Knowledge Graph server to initialize...${NC}"
sleep 3

# Start OSPAiN₂ server
echo -e "\n${BLUE}Starting OSPAiN₂ server...${NC}"
cd OSPAiN2-hub && npm start

# If OSPAiN₂ server exits, also terminate the Knowledge Graph and MCP servers
echo -e "\n${YELLOW}OSPAiN₂ server has stopped. Shutting down other servers...${NC}"
kill $KG_PID 2>/dev/null
kill $MCP_PID 2>/dev/null

echo -e "\n${GREEN}All services have been stopped.${NC}" 