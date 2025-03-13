Write-Host "🚀 Starting MCP Servers..." -ForegroundColor Cyan

# Function to start a server
function Start-McpServer {
    param (
        [string]$Name,
        [string]$Command,
        [string[]]$Arguments
    )
    
    Write-Host "Starting $Name Server..." -ForegroundColor Yellow
    Start-Process -FilePath $Command -ArgumentList $Arguments -NoNewWindow
}

# Start Knowledge Graph Server
Start-McpServer -Name "Knowledge Graph" -Command "node" -Arguments "./mcp-knowledge-graph/server.js"

# Start Titan Memory Server
Start-McpServer -Name "Titan Memory" -Command "node" -Arguments "./titanmemory/mcp-titan/server.js"

# Start Repository Tools Server
Start-McpServer -Name "Repository Tools" -Command "node" -Arguments "./mcp-servers/repository-tools/server.js"

# Start Docker Integration Server
Start-McpServer -Name "Docker Integration" -Command "node" -Arguments "./mcp-servers/docker-integration/server.js"

# Start Mouse Automation Server
Start-McpServer -Name "Mouse Automation" -Command "node" -Arguments "./mcp-servers/mouse-automation/server.js"

# Start Prompt Engineering Server
Start-McpServer -Name "Prompt Engineering" -Command "node" -Arguments "./mcp-servers/prompt-engineering/server.js"

# Start Ollama Tag CLI Server
Start-McpServer -Name "Ollama Tag CLI" -Command "node" -Arguments "./ollama-tag-cli/dist/index.js"

Write-Host "All servers started successfully!" -ForegroundColor Green
Write-Host "These are running as background processes. Use Task Manager to stop them if needed." -ForegroundColor Yellow 