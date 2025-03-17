#!/bin/bash

echo "Setting up Deep Research Environment"
echo "===================================="

# Check for Ollama
echo "Checking for Ollama..."
if ! command -v ollama &> /dev/null; then
    echo "Ollama not found. Please install Ollama first: https://ollama.ai"
    exit 1
fi

echo "Checking if Ollama is running..."
if ! curl -s http://localhost:11434/api/tags > /dev/null; then
    echo "Ollama is not running. Please start Ollama and try again."
    exit 1
fi

# Check for Tavily API key
if [ ! -f ./ollama-deep-researcher-ts/.env ]; then
    echo "Creating .env file in ollama-deep-researcher-ts..."
    
    # Prompt for Tavily API key
    read -p "Enter your Tavily API key (get one at https://tavily.com): " tavily_key
    
    # Create .env file
    echo "TAVILY_API_KEY=$tavily_key" > ./ollama-deep-researcher-ts/.env
    echo ".env file created."
else
    echo ".env file already exists in ollama-deep-researcher-ts."
fi

# Check for required models
echo "Checking for required LLM models..."
if ! ollama list | grep -q "llama3"; then
    echo "llama3 model not found. Pulling llama3..."
    ollama pull llama3
else
    echo "llama3 model found."
fi

# Set up Docker services
echo "Setting up Docker services..."
if ! command -v docker-compose &> /dev/null; then
    echo "docker-compose not found. Please install Docker and Docker Compose."
    exit 1
fi

# Check if OpenManus has a Dockerfile
if [ ! -f ./research/OpenManus/Dockerfile ]; then
    echo "Creating Dockerfile for OpenManus..."
    
    # Create a simple Dockerfile for OpenManus
    cat > ./research/OpenManus/Dockerfile << EOL
FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends git && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 3006

CMD ["python", "main.py"]
EOL
    
    echo "Dockerfile created for OpenManus."
    
    # Create a simple requirements.txt if it doesn't exist
    if [ ! -f ./research/OpenManus/requirements.txt ]; then
        echo "Creating requirements.txt for OpenManus..."
        cat > ./research/OpenManus/requirements.txt << EOL
fastapi>=0.100.0
uvicorn>=0.23.0
pydantic>=2.0.0
httpx>=0.24.0
EOL
        echo "requirements.txt created for OpenManus."
    fi
fi

# Check for data directory for openweb-ui
if [ ! -d ./data ]; then
    echo "Creating data directory for OpenWeb-UI..."
    mkdir -p ./data
fi

# Start Docker services
echo "Starting Docker services..."
docker-compose -f docker-compose.research.yml down 2>/dev/null  # Ensure everything is stopped
docker-compose -f docker-compose.research.yml up -d

echo "Waiting for services to start..."
sleep 10

# Check if services are running
echo "Checking service health..."
if curl -s http://localhost:2024/health > /dev/null; then
    echo "✅ Deep Researcher service is running"
else
    echo "❌ Deep Researcher service failed to start"
fi

if curl -s http://localhost:3006/health > /dev/null; then
    echo "✅ OpenManus service is running"
else
    echo "❌ OpenManus service failed to start"
fi

if curl -s http://localhost:8080 > /dev/null; then
    echo "✅ OpenWeb-UI is running"
else
    echo "❌ OpenWeb-UI failed to start"
fi

echo "==============================================="
echo "Setup complete! Your research environment is ready."
echo "Access the OpenWeb-UI at http://localhost:8080"
echo "You can use the research component in your React app or via the t2p command:"
echo "t2p research \"your research topic\" [--iterations=3] [--enhance]"
echo "===============================================" 