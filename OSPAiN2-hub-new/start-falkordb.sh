#!/bin/bash
# Start FalkorDB service for OSPAiN2-hub

# Set default password if not provided
export FALKORDB_PASSWORD=${FALKORDB_PASSWORD:-falkordb}

# Print banner
echo "========================================"
echo "  Starting FalkorDB for OSPAiN2-hub"
echo "========================================"
echo "Host: localhost"
echo "Port: 6379"
echo "Password: [configured]"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "Error: Docker is not running or not installed."
  echo "Please start Docker and try again."
  exit 1
fi

# Check if FalkorDB is already running
if docker ps --format '{{.Names}}' | grep -q "ospain2-falkordb"; then
  echo "FalkorDB is already running."
  echo "To restart it, run: docker-compose -f docker-compose.falkordb.yml down && ./start-falkordb.sh"
  exit 0
fi

# Start FalkorDB using Docker Compose
echo "Starting FalkorDB..."
docker-compose -f docker-compose.falkordb.yml up -d

# Check if FalkorDB started successfully
if docker ps --format '{{.Names}}' | grep -q "ospain2-falkordb"; then
  echo "FalkorDB started successfully."
  echo "Connected to port 6379"
  echo ""
  echo "To stop it later, run: docker-compose -f docker-compose.falkordb.yml down"
else
  echo "Error: Failed to start FalkorDB."
  echo "Check Docker logs for more information: docker logs ospain2-falkordb"
  exit 1
fi

echo ""
echo "FalkorDB is now running. You can use it with the knowledge graph services in OSPAiN2-hub." 