# Sovereign Agent

A Socratic-Stoic framework for building virtuous and reflective agent systems. This framework embodies philosophical wisdom to guide agent decisions, enhance responses with context, and process errors with Stoic resilience.

## Overview

The Sovereign Agent framework provides a philosophical foundation for building agent systems that balance:

- Capability with wisdom
- Effectiveness with virtue
- Technical excellence with human benefit

By implementing Socratic questioning and Stoic principles, this framework enables agent systems to engage in reflective practice, ethical decision-making, and wisdom-guided interactions.

## Core Components

1. **Agent Creed** - Philosophical foundation with core principles, virtues, and cognitive protocols
2. **Decision Evaluation** - Tools for assessing proposed actions against virtue alignment
3. **Contextual Creed Generation** - Dynamic creation of situation-specific guiding principles
4. **Error Processing** - Stoic approach to handling errors with acceptance and learning
5. **Response Enhancement** - Methods to inject philosophical wisdom into responses
6. **Reflection System** - Periodic analysis of interactions to identify patterns and improvements
7. **Virtualization Tools** - Components for visualizing virtue alignment and creed principles
8. **Integration Methods** - Express middleware, MCP server, and React components for easy deployment

## Basic Usage

```javascript
const { SovereignAgentCreed } = require('./agent-creed');

// Initialize the agent with optional configuration
const agent = new SovereignAgentCreed({
  reflectionFrequency: 10,  // Perform reflection every 10 interactions
  virtueThreshold: 0.7,     // Minimum virtue score for aligned decisions
  introspectionDepth: 3     // Depth of interaction analysis
});

// Evaluate a proposed decision
const decision = agent.evaluateDecision(
  "Reply to the user with technical jargon without explaining it",
  ["Reply with clear language suitable for the user's level", "Ask clarifying questions"]
);

console.log(`Decision aligned with virtue: ${decision.isAligned}`);
console.log(`Primary virtue: ${decision.virtueAlignment.primaryVirtue}`);
console.log(`Recommendations: ${decision.recommendations.join(", ")}`);

// Generate a contextual creed
const creed = agent.generateContextualCreed("responding to a frustrated user");
console.log(`Contextual creed: ${creed}`);

// Process an error with Stoic wisdom
const error = new Error("Failed to retrieve data");
const recovery = agent.processError(error);
console.log(`Acceptance: ${recovery.acceptance}`);
console.log(`Alternative perspective: ${recovery.perspective}`);
console.log(`Path forward: ${recovery.action}`);

// Enhance a response with philosophical context
const enhancedResponse = agent.enhanceWithContext(
  "I don't have that information."
);
console.log(`Enhanced response: ${enhancedResponse}`);

// Record interactions
agent.recordInteraction({
  input: "Why is this not working?",
  response: "Let me help you troubleshoot this issue...",
  timestamp: new Date(),
  context: "technical support"
});

// Perform reflection after sufficient interactions
const reflection = agent.performReflection();
console.log(`Patterns observed: ${reflection.patterns}`);
console.log(`Areas for improvement: ${reflection.improvement}`);
console.log(`Philosophical insight: ${reflection.philosophicalInsight}`);
```

## Integration with Express.js

The framework can be easily integrated into Express.js applications using the provided middleware:

```javascript
const express = require('express');
const { sovereignAgentMiddleware } = require('./integration/express-middleware');

const app = express();

// Add the middleware to your Express application
app.use(sovereignAgentMiddleware({
  reflectionFrequency: 10,
  virtueThreshold: 0.7,
  introspectionDepth: 3
}));

// Your routes will now have access to the Sovereign Agent
app.get('/api/wisdom', (req, res) => {
  // Access the agent via req.sovereignAgent
  const creed = req.sovereignAgent.generateContextualCreed('API request handling');
  
  res.json({
    message: 'Here is your wisdom',
    creed: creed
  });
});

app.listen(3000);
```

## Integration with Model Context Protocol (MCP)

For integration with the Cursor IDE, the framework provides an MCP server:

```javascript
const { startMCPServer } = require('./integration/mcp-server');

// Start the MCP server
startMCPServer({
  port: 3030,
  reflectionFrequency: 10,
  virtueThreshold: 0.7,
  introspectionDepth: 3
});
```

This enables the use of tools such as `evaluate_decision`, `generate_contextual_creed`, and `process_error` directly within the IDE.

## Integration with React Applications

For building React applications with Sovereign Agent capabilities, the framework provides React UI components:

```jsx
import React from 'react';
import { 
  CreedProvider, 
  SovereignChatWindow, 
  VirtueEvaluationButton 
} from './integration/react-components';

function MyApp() {
  return (
    <div>
      <h1>Socratic Chat Application</h1>
      
      <CreedProvider>
        {/* Complete chat window with built-in buttons */}
        <SovereignChatWindow 
          initialMessages={[
            { content: "Welcome to the Socratic chat!", isUser: false }
          ]}
          customButtons={[
            {
              label: "Ask for Wisdom",
              onClick: () => alert("Custom action triggered!"),
              type: "tertiary"
            }
          ]}
          theme="light"
        />
      </CreedProvider>
    </div>
  );
}
```

## Core Virtues

The framework is built around four core virtues derived from Stoic philosophy:

| Virtue | Description | Manifestation in Agents |
|--------|-------------|------------------------|
| Wisdom | Knowledge and good judgment | Understanding context, providing relevant information |
| Justice | Fairness and treating others well | Unbiased responses, respecting user autonomy |
| Courage | Facing challenges with fortitude | Acknowledging limitations, addressing difficult topics |
| Temperance | Self-control and moderation | Balanced responses, avoiding extremes |

## Configuration Options

| Option | Description | Default |
|--------|-------------|---------|
| `reflectionFrequency` | Number of interactions before automatic reflection | 10 |
| `virtueThreshold` | Minimum virtue alignment score (0-1) for decisions | 0.7 |
| `introspectionDepth` | How many past interactions to consider in reflections | 3 |

## Integration with Ollama Ecosystem

This framework is designed to integrate with the broader Ollama ecosystem:

- **Development Mode Framework**: Supports the 🔧 Engineering Mode approach
- **Horizon Management**: Currently classified as [H3] Future implementation
- **Knowledge Graph**: Connects with the semantic understanding components
- **Context Management**: Enhances the context understanding capabilities

## Implementation Status

- ✅ Core Agent Creed System
- ✅ Decision Evaluation
- ✅ Contextual Creed Generation
- ✅ Error Processing
- ✅ Response Enhancement
- ✅ Reflection System
- ✅ Express Middleware
- ✅ MCP Server Integration
- ✅ UI Visualization Components 
- ✅ React Component Library
- ⬜ CLI Tools
- ⬜ VS Code Extension

## Next Steps

To fully implement this framework:

1. Complete the test suite for core functionality
2. Add comprehensive documentation with examples
3. Create a demo application showcasing integration methods
4. Develop additional visualization tools
5. Implement metrics collection for virtue alignment

## Demo

For a demonstration of the framework's capabilities, run:

```bash
node demo.js
```

## See Also

- [Integration Guide](./integration/README.md) - Detailed documentation on integration methods
- [Visualization Tools](./visualization.js) - Utility functions for visualizing framework components
- [Demo Implementation](./demo.js) - Interactive showcase of framework capabilities

## License

MIT 