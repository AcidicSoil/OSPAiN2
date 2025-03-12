# MCP Server Implementation Guide

## Overview

This document outlines the implementation guidelines for Model Context Protocol (MCP) servers within the Ollama Ecosystem. MCP servers provide a standardized way for AI models to interact with external tools, resources, and services while maintaining the sovereign AI principles of local-first, user-controlled computing.

## Core Principles

- **Local-First**: All MCP servers should prioritize local execution and data storage
- **User Sovereignty**: Users maintain complete control over their data and computation
- **Modular Design**: Servers should follow a modular architecture for extensibility
- **Secure By Default**: Implement robust security measures to protect user data
- **Efficient Resource Usage**: Optimize for performance on consumer hardware
- **Offline Capability**: Core functionality should work without internet connectivity
- **Transparent Operation**: Clear logging and visibility into server operations

## Technical Architecture

### Base Server Implementation

All MCP servers should extend the base `MCPServer` class which provides:

- Server-Sent Events (SSE) for real-time communication
- Standardized endpoint structure
- Common request/response handling
- Error management and logging
- Connection lifecycle management

```typescript
/**
 * Example MCP Server implementation
 */
export class CustomMCPServer extends MCPServer {
  constructor(config: MCPServerConfig) {
    super(config);

    // Register tools, resources, and prompts
    this.registerTools();
    this.registerResources();
    this.registerPrompts();

    // Initialize any additional services
    this.initializeServices();
  }

  protected registerTools(): void {
    // Register tools with proper validation and security checks
  }

  protected registerResources(): void {
    // Register resources with appropriate caching strategies
  }

  protected registerPrompts(): void {
    // Register prompts with context-aware templates
  }

  protected initializeServices(): void {
    // Initialize any additional services required by this server
  }

  // Implement abstract methods from MCPServer
  protected async executeTool(
    request: MCPToolRequest
  ): Promise<MCPToolResponse> {
    // Implement tool execution with proper error handling
  }

  protected async getResource(
    request: MCPResourceRequest
  ): Promise<MCPResourceResponse> {
    // Implement resource retrieval with caching
  }

  protected async executePrompt(
    request: MCPPromptRequest
  ): Promise<MCPPromptResponse> {
    // Implement prompt execution with context awareness
  }
}
```

### Multi-Level Caching

Implement a caching strategy that includes:

1. **Memory Cache**: For frequently accessed data
2. **Disk Cache**: For persistence across sessions
3. **Semantic Cache**: For similar (not just identical) requests

```typescript
class MCPCache {
  private memoryCache: Map<string, any>;
  private diskCache: DiskCacheProvider;
  private semanticCache: SemanticCacheProvider;

  constructor() {
    this.memoryCache = new Map();
    this.diskCache = new DiskCacheProvider("./cache");
    this.semanticCache = new SemanticCacheProvider();
  }

  async get(key: string, semanticQuery?: string): Promise<any> {
    // Check memory cache first (fastest)
    if (this.memoryCache.has(key)) {
      return this.memoryCache.get(key);
    }

    // Check disk cache next
    const diskResult = await this.diskCache.get(key);
    if (diskResult) {
      // Promote to memory cache
      this.memoryCache.set(key, diskResult);
      return diskResult;
    }

    // Try semantic cache if query provided
    if (semanticQuery) {
      const semanticResult = await this.semanticCache.findSimilar(
        semanticQuery
      );
      if (semanticResult) {
        return semanticResult.value;
      }
    }

    return null;
  }

  async set(key: string, value: any, semanticKey?: string): Promise<void> {
    // Update all cache levels
    this.memoryCache.set(key, value);
    await this.diskCache.set(key, value);

    if (semanticKey) {
      await this.semanticCache.set(semanticKey, value);
    }
  }
}
```

### Resource Management

Implement adaptive resource management to ensure servers run efficiently on various hardware:

```typescript
class ResourceManager {
  private maxMemoryUsage: number;
  private cpuThreshold: number;
  private resourceMonitorInterval: NodeJS.Timeout | null = null;

  constructor(config: ResourceConfig) {
    this.maxMemoryUsage = config.maxMemoryUsage || 1024 * 1024 * 512; // 512MB default
    this.cpuThreshold = config.cpuThreshold || 80; // 80% CPU usage threshold

    // Start resource monitoring
    this.startMonitoring();
  }

  private startMonitoring(): void {
    this.resourceMonitorInterval = setInterval(() => {
      const memoryUsage = process.memoryUsage().heapUsed;

      // Check if memory usage exceeds threshold
      if (memoryUsage > this.maxMemoryUsage) {
        this.reclaimResources();
      }

      // CPU monitoring would be implemented here
    }, 30000); // Check every 30 seconds
  }

  private async reclaimResources(): Promise<void> {
    // Implement resource reclamation strategies
    // - Clear caches
    // - Unload unused modules
    // - Trigger garbage collection
  }
}
```

## Security Considerations

### Input Validation

All MCP servers must implement thorough input validation:

```typescript
function validateToolParameters(
  params: any,
  schema: ParameterSchema
): ValidationResult {
  // Implement JSON schema validation
  // Check for injection attacks
  // Sanitize inputs
  // Validate parameter types and constraints
}
```

### Command Execution Safety

When executing system commands:

```typescript
async function safeExecuteCommand(
  command: string,
  args: string[]
): Promise<CommandResult> {
  // Validate command against allowlist
  if (!ALLOWED_COMMANDS.has(command)) {
    throw new SecurityError(`Command not allowed: ${command}`);
  }

  // Sanitize arguments
  const sanitizedArgs = args.map(sanitizeArgument);

  // Use spawn instead of exec when possible
  // Set appropriate timeout
  // Capture and limit output
  // Handle errors properly
}
```

### Authentication and Authorization

Implement proper authentication for MCP servers:

```typescript
class MCPAuthManager {
  validateRequest(req: Request): AuthResult {
    // Validate API keys or tokens
    // Check permissions
    // Rate limiting
    // IP restrictions if needed
  }
}
```

## Mode-Specific Optimizations

### Design Mode

- Prioritize UI component generation tools
- Cache design patterns and templates
- Optimize for visual feedback and rendering

### Engineering Mode

- Focus on code analysis and generation tools
- Implement intelligent code completion
- Provide debugging and performance analysis tools

### Testing Mode

- Prioritize test generation and validation
- Implement coverage analysis tools
- Support automated test execution

### Deployment Mode

- Focus on build and packaging tools
- Provide documentation generation capabilities
- Support deployment verification

### Maintenance Mode

- Prioritize issue analysis and debugging tools
- Implement monitoring and alerting capabilities
- Support log analysis and performance profiling

## Integration with Ollama Ecosystem

### Tag System Integration

MCP servers should integrate with the tag system:

```typescript
class TagSystemIntegration {
  async getRelevantTags(query: string): Promise<Tag[]> {
    // Query the tag system for relevant tags
    // Filter by category and relevance
    // Return structured tag data
  }

  async addTag(tag: Tag): Promise<void> {
    // Add a new tag to the system
    // Validate tag structure
    // Update tag relationships
  }
}
```

### Knowledge Graph Integration

Connect MCP servers to the knowledge graph:

```typescript
class KnowledgeGraphClient {
  async queryEntities(query: string): Promise<Entity[]> {
    // Query the knowledge graph for entities
    // Process and structure results
    // Cache frequent queries
  }

  async addEntity(entity: Entity): Promise<void> {
    // Add a new entity to the knowledge graph
    // Validate entity structure
    // Update entity relationships
  }
}
```

## Implementation Checklist

When implementing a new MCP server, ensure:

- [ ] Extends the base MCPServer class
- [ ] Implements all required abstract methods
- [ ] Registers tools, resources, and prompts
- [ ] Implements proper error handling
- [ ] Includes comprehensive logging
- [ ] Implements caching strategies
- [ ] Includes resource management
- [ ] Follows security best practices
- [ ] Integrates with the tag system
- [ ] Connects to the knowledge graph when appropriate
- [ ] Includes comprehensive documentation
- [ ] Provides usage examples
- [ ] Includes unit and integration tests

## Example Servers

The Ollama Ecosystem includes these reference MCP server implementations:

1. **Prompt Engineering Assistant**: Text summarization and prompt optimization
2. **Docker Integration**: Container management and orchestration
3. **Mouse Automation**: UI automation and testing
4. **Knowledge Graph**: Entity and relationship management
5. **Repository Tools**: Code repository analysis and context generation

## Configuration

MCP servers are configured in `.cursor/mcp.json`:

```json
{
  "servers": [
    {
      "name": "Server Name",
      "type": "sse",
      "url": "http://localhost:3001/sse",
      "description": "Server description"
    }
  ]
}
```

## Development Workflow

1. Create a new directory in `mcp-servers/` for your server
2. Implement the server extending the base MCPServer class
3. Register tools, resources, and prompts
4. Implement abstract methods
5. Add tests in the `tests/` directory
6. Add documentation in the `docs/` directory
7. Register the server in `.cursor/mcp.json`
8. Test the server with the Cursor IDE

## Best Practices

- Follow the TypeScript strict mode guidelines
- Use async/await for asynchronous operations
- Implement proper error handling
- Add comprehensive logging
- Document all public APIs
- Include usage examples
- Test thoroughly
- Monitor performance
- Implement graceful degradation
- Support offline operation when possible
- Respect user privacy and data sovereignty

By following these guidelines, your MCP server will integrate seamlessly with the Ollama Ecosystem while maintaining the principles of sovereign AI and local-first computing.
