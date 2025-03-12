# Tool Call Counter for OSPAiN2

A utility for tracking and managing Cursor IDE tool calls to prevent rate-limit errors and provide automated recovery mechanisms.

## Features

- **Tool Call Tracking**: Count and log API calls to identify when approaching limits
- **Automatic Warning**: Get notifications when nearing the 25-call limit
- **Rate-Limit Detection**: Analyze screenshots to detect rate-limit error patterns
- **Automated Recovery**: Use RobotJS to automatically resolve rate-limit errors
- **Detailed Statistics**: View usage patterns and tool call distribution
- **MCP Integration**: Automatically track all MCP tool calls

## Installation

```bash
# Install dependencies
cd tools
npm install --no-optional # Basic installation
npm install # Full installation with RobotJS and image processing

# Build TypeScript version
npm run build
```

## Usage

### Basic Usage

```bash
# Show current counter status
node tool_counter_cli.js

# Manually increment the counter
node tool_counter_cli.js increment api_name

# Reset the counter
node tool_counter_cli.js reset

# View detailed statistics
node tool_counter_cli.js stats
```

### Testing Rate-Limit Handling

```bash
# Simulate approaching the rate limit
node tool_counter_cli.js simulate
```

### Using in Your Code

```javascript
// JavaScript
const toolCounter = require("./tools/tool_call_counter");

// Track a tool call
toolCounter.trackToolCall("my_api_call");

// Check current status
const status = toolCounter.getStatus();
if (status.isWarning) {
  console.warn("Approaching tool call limit!");
}

// Reset the counter
toolCounter.resetCounter();
```

```typescript
// TypeScript
import {
  trackToolCall,
  resetToolCounter,
  getStatus,
} from "./tools/tool_call_counter";

// Track a tool call
trackToolCall("my_api_call");

// Get current status
const status = getStatus();
if (status.isWarning) {
  console.warn("Approaching tool call limit!");
}
```

## MCP Integration

To automatically track all MCP tool calls, add this to your MCP server initialization:

```javascript
const mcpServer = require("./path/to/mcp_server");
const toolCounter = require("./tools/mcp_tool_counter");

// Patch the MCP server to track all tool calls
toolCounter.patchMCPServer(mcpServer);
```

## Rate-Limit Detection & Recovery

The system can detect rate-limit errors through screenshot analysis and attempt automated recovery:

1. When approaching the tool call limit (20+ calls), the system begins monitoring for errors
2. If a rate-limit error is detected in a screenshot, recovery actions are initiated
3. Mouse automation is used to:
   - Locate UI elements like "Try Again" or "Retry" buttons
   - Perform click operations to resolve the error
   - Return to the previous state

## Configuration

Edit the CONFIG object in `tool_call_counter.js` to customize:

- `maxToolCalls`: Maximum number of tool calls (default: 25)
- `warningThreshold`: When to start showing warnings (default: 20)
- `resetOnExceeded`: Whether to reset counter when limit is reached (default: true)
- `logEnabled`: Enable/disable logging (default: true)
- `counterFile`: Path to store counter state (default: `../logs/tool_call_count.json`)

## Logs and Data

- Counter state: `logs/tool_call_count.json`
- MCP counter logs: `logs/mcp_counter.log`
- Screenshot analyzer logs: `logs/screenshot_analyzer.log`
- Error screenshots: `logs/screenshots/error_*`

## Dependencies

- **Required**:
  - Node.js 14+
  - fs, path (built-in)
- **Optional**:
  - RobotJS (for mouse automation)
  - Jimp (for image processing)
  - screenshot-desktop (for capturing screenshots)

## Limitations

- RobotJS requires native build tools
- Some screenshot methods may require system permissions
- Mouse automation works best with consistent UI layouts

## License

MIT
