# Implementing Additional TodoManager Integrations

This guide outlines how to implement additional integrations for the TodoManager component, similar to the Notion integration.

## Supported Integration Types

The TodoManager can be extended to support several third-party task management services:

1. GitHub Issues
2. Jira Tickets
3. Trello Cards
4. Asana Tasks
5. ClickUp Tasks

## Implementation Pattern

Each integration follows a similar pattern:

1. Create an MCP server for the specific integration
2. Implement a service class in the application
3. Create a context provider component
4. Add UI components to manage the integration

### 1. Create an MCP Server

Start by creating a new MCP server in the `.cursor/mcp-servers` directory:

```bash
mkdir -p .cursor/mcp-servers/[integration-name]
cd .cursor/mcp-servers/[integration-name]
npm init -y
```

The server should implement these primary endpoints:

- `/sse` - Server-sent events endpoint for Cursor
- `/api/status` - Check connection status
- `/api/config` - Configure the integration
- `/api/tasks` - Get all tasks
- `/api/sync/tasks` - Sync tasks bidirectionally

### 2. Implement a Service Class

Create a service class in `src/services/[Integration]Service.ts`:

```typescript
/**
 * Service for interacting with [Integration] through MCP server
 */
class [Integration]Service {
  private static instance: [Integration]Service;
  private eventEmitter = new EventEmitter();
  private isConnected = false;
  private isConfigured = false;
  private baseUrl = "http://localhost:[PORT]";
  
  constructor() {
    if ([Integration]Service.instance) {
      return [Integration]Service.instance;
    }
    [Integration]Service.instance = this;
    this.checkConnection();
  }
  
  // Implement required methods:
  public async checkConnection(): Promise<boolean> { /* ... */ }
  public async configureDatabaseMappings(mappings: Record<string, string>): Promise<boolean> { /* ... */ }
  public async getTasks(): Promise<[Integration]Task[]> { /* ... */ }
  public async syncTasksTo[Integration](tasks: TodoItem[]): Promise<boolean> { /* ... */ }
  public async importTasksFrom[Integration](): Promise<TodoItem[]> { /* ... */ }
  
  // Add subscription for connection changes
  public onConnectionChanged(callback: (status: ConnectionStatus) => void): () => void { /* ... */ }
}

export default new [Integration]Service();
```

### 3. Create a Context Provider

Create a context provider in `src/context/[Integration]Context.tsx`:

```typescript
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import [integration]Service, { [Integration]Task } from '../services/[Integration]Service';
import { TodoItem } from '../services/TodoTrackingService';

interface [Integration]ContextType {
  isConnected: boolean;
  isConfigured: boolean;
  connectionError: any;
  [integration]Tasks: [Integration]Task[];
  // Add other properties and methods
}

const [Integration]Context = createContext<[Integration]ContextType>(/* default values */);

export const use[Integration] = () => useContext([Integration]Context);

export const [Integration]Provider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Implement provider logic
  return (
    <[Integration]Context.Provider value={/* context values */}>
      {children}
    </[Integration]Context.Provider>
  );
};
```

### 4. Integrate with TodoManager

Update the TodoManager component to support the new integration:

1. Add integration-specific state
2. Create dialog components for configuration
3. Add sync functionality
4. Update the UI to show integration status

## Example: GitHub Integration

For GitHub integration:

1. Create `.cursor/mcp-servers/github-integration`
2. Implement OAuth flow for GitHub API
3. Map GitHub Issues to TodoItems
4. Create bidirectional syncing logic
5. Add filtering by GitHub repository

## Security Considerations

When implementing integrations:

1. Store API keys and tokens securely using the `EncryptionService`
2. Never hardcode credentials in source code
3. Implement proper error handling for API failures
4. Add rate limiting to prevent API throttling
5. Include clear documentation on required permissions

## Testing Integrations

To test your integration:

1. Create a dedicated test script in the project root
2. Implement mock responses for offline testing
3. Add error simulation capabilities
4. Test both directions of sync (import and export)
5. Verify conflict resolution behavior

## Documentation

Always include thorough documentation for each integration:

1. Setup instructions
2. Required API permissions
3. Configuration options
4. Limitations and known issues
5. Troubleshooting steps 