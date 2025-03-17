# Sovereign Agent Framework - Integration Guides

This directory contains integration modules that enable the Sovereign Agent framework to be incorporated into different applications and environments. The framework is designed to be highly adaptable, providing a philosophical foundation for virtuous, reflective decision-making in various contexts.

## Available Integrations

The Sovereign Agent framework currently supports the following integration methods:

### Express Middleware (`express-middleware.js`)

A middleware for Express web applications that adds Socratic-Stoic philosophy to HTTP request/response handling.

- Evaluates API requests against virtuous principles
- Enhances API responses with philosophical context
- Tracks interaction metrics and virtuous alignment scores
- Provides visualization dashboards for reflections and metrics
- Processes errors through a Stoic lens

### Model Context Protocol Server (`mcp-server.js`)

An MCP server implementation that enables Large Language Models to access the Sovereign Agent framework via the Model Context Protocol, providing LLMs with tools for virtuous decision-making.

- Exposes framework tools via MCP protocol
- Enables LLMs to evaluate decisions against virtuous principles
- Allows generation of contextual creeds for specific situations
- Provides tools for processing errors through Stoic philosophy
- Supports visualization of virtue alignment and reflections

### React Components

The React components integration provides ready-to-use UI components for building React applications with Sovereign Agent functionality.

- Chat window with custom buttons
- Virtue alignment visualization
- Decision evaluation components
- Context Provider for easy framework access
- Themed components (light/dark mode)
- Customizable styling

## Integration Examples

### Express Middleware Example

```javascript
const express = require('express');
const { createSovereignAgentMiddleware } = require('./express-middleware');

const app = express();

// Create and apply the middleware
const sovereignAgent = createSovereignAgentMiddleware({
  reflectionFrequency: 5,
  virtueThreshold: 0.6,
  excludePaths: ['/health', '/public'],
  enhanceResponses: true
});

app.use(sovereignAgent);

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to the Sovereign Agent-enhanced application');
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

### MCP Server Example

```javascript
const { createSovereignAgentMCP } = require('./mcp-server');

// Create and start the MCP server
const server = createSovereignAgentMCP({
  reflectionFrequency: 5,
  virtueThreshold: 0.7
});

server.start({ port: 3030 });
```

### React Components Example

```jsx
import React, { useState } from 'react';
import { 
  CreedProvider, 
  SovereignChatWindow, 
  VirtueEvaluationButton 
} from './react-components';

function MyApp() {
  const [evaluationResult, setEvaluationResult] = useState(null);
  
  // Custom button example
  const customButtons = [
    {
      label: "Ask for Wisdom",
      onClick: () => alert("Wisdom requested!"),
      type: "tertiary"
    }
  ];
  
  return (
    <div>
      <h1>My Virtuous Chat App</h1>
      
      <CreedProvider reflectionFrequency={5} virtueThreshold={0.7}>
        <SovereignChatWindow 
          initialMessages={[
            { content: "Welcome to my virtuous chat app!", isUser: false }
          ]}
          customButtons={customButtons}
          theme="light"
          onSendMessage={async (message) => {
            // Custom message handler
            return `You said: "${message}". Let me respond thoughtfully...`;
          }}
        />
        
        <div style={{ marginTop: '24px' }}>
          <h3>Evaluate an Action</h3>
          <VirtueEvaluationButton 
            actionToEvaluate="Listen carefully before responding"
            onResult={setEvaluationResult}
            type="primary"
          >
            Evaluate This Action
          </VirtueEvaluationButton>
          
          {evaluationResult && (
            <div>
              Result: {evaluationResult.isAligned ? "✅ Virtuous" : "⚠️ Needs improvement"}
            </div>
          )}
        </div>
      </CreedProvider>
    </div>
  );
}
```

## Configuration Options

All integrations support the following core configuration options:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `reflectionFrequency` | Number | 10 | How many interactions before performing reflection |
| `virtueThreshold` | Number | 0.7 | Minimum score for an action to be considered virtuous |
| `introspectionDepth` | Number | 3 | How deeply to analyze patterns during reflection |
| `creedOptions` | Object | {} | Additional options for the SovereignAgentCreed instance |

Each integration method also has its own specific configuration options detailed in their respective file documentation.

## Adding New Integrations

To create a new integration for the Sovereign Agent framework:

1. Import the core components:
   ```javascript
   const { SovereignAgentCreed } = require('../agent-creed');
   const { SovereignAgentViz } = require('../visualization');
   ```

2. Initialize the creed with appropriate configuration
3. Implement platform-specific adapters for the framework's capabilities
4. Record interactions and trigger reflections at appropriate intervals
5. Export your integration as a module

## Integration Architecture

All integrations follow a common pattern:

1. **Initialization**: Create instances of `SovereignAgentCreed` and `SovereignAgentViz`
2. **Integration**: Adapt the framework to the target platform's paradigms
3. **Recording**: Track interactions to enable meaningful reflections
4. **Reflection**: Periodically trigger reflections to improve future interactions
5. **Visualization**: Provide ways to visualize virtue alignment and reflections

## Contributing

When adding new integrations, please follow these guidelines:

- Implement all core capabilities of the framework
- Maintain consistent configuration option names across integrations
- Include comprehensive documentation and examples
- Add appropriate context references to connect with the broader ecosystem
- Follow the existing code style and patterns

## Future Integrations

Planned future integrations include:

- CLI tools for terminal applications
- WebSocket server for real-time applications
- Discord/Slack bot integration
- Jupyter notebook extension
- Browser extension

## References

- [Sovereign Agent Framework](../README.md) - Core framework documentation
- [Express.js](https://expressjs.com/) - Web framework for Node.js
- [Model Context Protocol](https://glama.ai/mcp/servers/un2zatig9e/blob/master/README.md) - Protocol for LLM context management
- [React Components](./react-components.md) - Documentation for React components 