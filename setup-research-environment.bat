@echo off
echo Setting up Deep Research Environment
echo ====================================

REM Check for Ollama
echo Checking for Ollama...
where ollama >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Ollama not found. Please install Ollama first: https://ollama.ai
    exit /b 1
)

echo Checking if Ollama is running...
curl -s http://localhost:11434/api/tags >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Ollama is not running. Please start Ollama and try again.
    exit /b 1
)

REM Check for Tavily API key
if not exist "ollama-deep-researcher-ts\.env" (
    echo Creating .env file in ollama-deep-researcher-ts...
    
    REM Prompt for Tavily API key
    set /p tavily_key="Enter your Tavily API key (get one at https://tavily.com): "
    
    REM Create .env file
    echo TAVILY_API_KEY=%tavily_key% > ollama-deep-researcher-ts\.env
    echo .env file created.
) else (
    echo .env file already exists in ollama-deep-researcher-ts.
)

REM Check for required models
echo Checking for required LLM models...
ollama list | findstr "llama3" >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo llama3 model not found. Pulling llama3...
    ollama pull llama3
) else (
    echo llama3 model found.
)

REM Set up Docker services
echo Setting up Docker services...
where docker-compose >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo docker-compose not found. Please install Docker and Docker Compose.
    exit /b 1
)

REM Check if OpenManus has a Dockerfile
if not exist "research\OpenManus\Dockerfile" (
    echo Creating Dockerfile for OpenManus...
    
    REM Create a simple Dockerfile for OpenManus
    (
        echo FROM python:3.12-slim
        echo.
        echo WORKDIR /app
        echo.
        echo RUN apt-get update ^&^& apt-get install -y --no-install-recommends git ^&^& rm -rf /var/lib/apt/lists/*
        echo.
        echo COPY requirements.txt .
        echo RUN pip install --no-cache-dir -r requirements.txt
        echo.
        echo COPY . .
        echo.
        echo EXPOSE 3006
        echo.
        echo CMD ["python", "main.py"]
    ) > research\OpenManus\Dockerfile
    
    echo Dockerfile created for OpenManus.
    
    REM Create a simple requirements.txt if it doesn't exist
    if not exist "research\OpenManus\requirements.txt" (
        echo Creating requirements.txt for OpenManus...
        (
            echo fastapi^>=0.100.0
            echo uvicorn^>=0.23.0
            echo pydantic^>=2.0.0
            echo httpx^>=0.24.0
        ) > research\OpenManus\requirements.txt
        echo requirements.txt created for OpenManus.
    )
)

REM Check for data directory for openweb-ui
if not exist "data" (
    echo Creating data directory for OpenWeb-UI...
    mkdir data
)

REM Start Docker services
echo Starting Docker services...
docker-compose -f docker-compose.research.yml down 2>nul
docker-compose -f docker-compose.research.yml up -d

echo Waiting for services to start...
timeout /t 10 /nobreak >nul

REM Check if services are running
echo Checking service health...
curl -s http://localhost:2024/health >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ✓ Deep Researcher service is running
) else (
    echo ✗ Deep Researcher service failed to start
)

curl -s http://localhost:3006/health >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ✓ OpenManus service is running
) else (
    echo ✗ OpenManus service failed to start
)

curl -s http://localhost:8080 >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ✓ OpenWeb-UI is running
) else (
    echo ✗ OpenWeb-UI failed to start
)

echo ===============================================
echo Setup complete! Your research environment is ready.
echo Access the OpenWeb-UI at http://localhost:8080
echo You can use the research component in your React app or via the t2p command:
echo t2p research "your research topic" [--iterations=3] [--enhance]
echo =============================================== 