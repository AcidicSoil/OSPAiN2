#!/bin/bash

# Set colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting Notion Integration Tests...${NC}"

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Error: Python 3 is not installed${NC}"
    exit 1
fi

# Check if required packages are installed
echo -e "${YELLOW}Checking required packages...${NC}"
python3 -c "import requests" &> /dev/null || {
    echo -e "${YELLOW}Installing requests package...${NC}"
    pip3 install requests
}

python3 -c "import dotenv" &> /dev/null || {
    echo -e "${YELLOW}Installing python-dotenv package...${NC}"
    pip3 install python-dotenv
}

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${RED}Error: .env file not found. Please create it with NOTION_TOKEN and NOTION_DATABASE_ID${NC}"
    exit 1
fi

# Run the tests
echo -e "${GREEN}Running Notion integration tests...${NC}"
python3 tests/notion_integration_test.py

# Check test result
if [ $? -eq 0 ]; then
    echo -e "${GREEN}All tests passed successfully!${NC}"
else
    echo -e "${RED}Some tests failed. Please check the output above for details.${NC}"
fi 