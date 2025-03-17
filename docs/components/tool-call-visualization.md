# Tool Call Visualization

## Overview

The Tool Call Visualization components provide real-time monitoring and tracking of tool calls in the Ollama ecosystem. This feature helps developers understand current tool usage patterns, track API limits, and debug tool call execution.

## Components

### `ToolCallWindow`

A comprehensive visualization component for tool calls with filtering and analytics capabilities. This component provides a detailed view of all tool calls, their parameters, results, and status.

```jsx
import { ToolCallWindow } from '../components/visualization/ToolCallWindow';

<ToolCallWindow 
  maxCalls={25}
  showAnalytics={true}
  height="400px"
  width="100%"
/>
```

### `ToolCallBubble`

A compact, floating bubble for visualizing tool calls in chat windows. This component is designed to be minimally invasive while providing essential information about tool call status.

```jsx
import ToolCallBubble from '../components/visualization/ToolCallBubble';

<ToolCallBubble 
  position="bottom-right"
  theme="light"
  floating={true}
  offset={20}
/>
```

### `OllamaToolCallIntegration`

An integration component that connects the tool call visualization with VS Code/Cursor IDE and OllamaOS.

```jsx
import OllamaToolCallIntegration from '../components/integration/OllamaToolCallIntegration';

<OllamaToolCallIntegration 
  showInChat={true}
  position="bottom-right"
  theme="light"
/>
```

## OllamaOS Integration

The tool call visualization components integrate directly with OllamaOS through the `ToolCallMonitor` class. This integration provides:

- Command-line access to tool call statistics via `ollama-os.sh toolcall status`
- Automatic tracking of tool call limits
- Session persistence for analysis and debugging
- Warning notifications when approaching API limits

### Command Line Usage

```bash
# Show tool call status
./scripts/ollama-os.sh toolcall status

# Clear tool call session
./scripts/ollama-os.sh toolcall clear

# Show help
./scripts/ollama-os.sh toolcall
```

## VS Code/Cursor IDE Integration

The tool call visualization components integrate with VS Code/Cursor IDE through the WebView API, providing:

- Real-time visualization of tool calls in the IDE chat window
- Floating bubble indicator that shows tool call count
- Expandable detailed view for debugging
- Warning indicators when approaching API limits

## Usage

### In React Applications

```jsx
import { ToolCallWindow } from '../components/visualization/ToolCallWindow';
import ToolCallBubble from '../components/visualization/ToolCallBubble';
import toolCallService from '../services/toolCallService';

// Track a tool call
const callId = toolCallService.trackCall('read_file', { path: 'example.txt' });

// Update status when completed
toolCallService.updateCallStatus(callId, 'completed', 'File content here');

// Update status on error
toolCallService.updateCallStatus(callId, 'failed', null, 'File not found');

// Render visualization
return (
  <>
    <ToolCallWindow maxCalls={25} />
    <ToolCallBubble position="bottom-right" />
  </>
);
```

### In OllamaOS Scripts

```javascript
const { initializeToolCallMonitor } = require('./ollama-os-tool-call-monitor');
const ollamaOS = new OllamaOS();

// Initialize tool call monitoring
const monitor = initializeToolCallMonitor(ollamaOS);

// Track a tool call
const callId = monitor.trackCall('read_file', { path: 'example.txt' });

// Update status when completed
monitor.updateCallStatus(callId, 'completed', 'File content here');

// Check status
monitor.showStatus();
```

## Benefits

- **Visibility**: Real-time visibility into tool call usage and status
- **Debugging**: Easily trace tool call execution and identify failures
- **Limit Management**: Visual indicators when approaching API limits
- **Analytics**: Track tool usage patterns and performance metrics
- **Cross-platform**: Works in both web applications and VS Code/Cursor IDE

## Technical Details

The tool call visualization feature consists of:

1. **Service Layer**: `toolCallService` for tracking and managing tool calls
2. **UI Components**: `ToolCallWindow` and `ToolCallBubble` for visualization
3. **Integration Layer**: `OllamaToolCallIntegration` for connecting with VS Code/Cursor
4. **OllamaOS Integration**: `ToolCallMonitor` for CLI and system-level integration

All components follow a consistent data model defined in the `toolcalls.ts` type definition file.
