# Tool Call Rate Limit Optimization Guide

This guide explains how to use the unified `RateLimitService` for monitoring, managing, and optimizing tool calls in the OSPAiN2 ecosystem.

## Overview

The `RateLimitService` provides functionality for:

1. Tracking tool call usage
2. Monitoring rate limit status
3. Providing notifications when approaching limits
4. Storing and retrieving rate limit history
5. Implementing bypass methods when limits are reached

## Quick Start

### Using the Context

The easiest way to integrate with the rate limit service is through the `RateLimitContext`:

```tsx
import { useRateLimit } from "../context/RateLimitContext";

const MyComponent = () => {
  const { status, history, settings, recordToolCall, executeBypass } =
    useRateLimit();

  // Now you can use these values and functions
  console.log(
    `Current usage: ${status.current}/${status.limit} (${status.percentage}%)`
  );

  // Record a tool call
  const handleToolCall = () => {
    // Execute your tool call logic here

    // Record the tool call
    recordToolCall("your_tool_name", "success", {
      param1: "value1",
      param2: "value2",
    });
  };

  return (
    <div>
      <p>Tool call status: {status.percentage}%</p>
      <button onClick={handleToolCall}>Execute Tool Call</button>
      {status.isApproachingLimit && (
        <button onClick={executeBypass}>Execute Bypass</button>
      )}
    </div>
  );
};
```

### Direct Service Usage

If you need to use the service outside of React components, you can import it directly:

```ts
import rateLimitService from "../services/RateLimitService";

// Record a tool call
rateLimitService.recordToolCall("your_tool_name", "success", {
  param1: "value1",
});

// Get current status
const status = rateLimitService.getStatus();
console.log(`Current usage: ${status.current}/${status.limit}`);

// Register a listener
const unsubscribe = rateLimitService.registerListener((newStatus) => {
  console.log("Status updated:", newStatus);
  if (newStatus.isApproachingLimit) {
    // Take action
  }
});

// Clean up when done
unsubscribe();
```

## Integrating with Tool Calls

### Manual Integration

To manually integrate the rate limit service with your tool calls:

```ts
// Before executing a tool call
const executeToolCall = async (tool, params) => {
  try {
    // Execute the tool call
    const result = await originalToolCall(tool, params);

    // Record a successful tool call
    rateLimitService.recordToolCall(tool, "success", params);

    return result;
  } catch (error) {
    // Record a failed tool call
    rateLimitService.recordToolCall(tool, "error", params);
    throw error;
  }
};
```

### Wrapper Function

Create a wrapper for common tool calls:

```ts
const withRateLimitTracking = (toolFn, toolName) => {
  return async (...args) => {
    try {
      const result = await toolFn(...args);
      rateLimitService.recordToolCall(toolName, "success", { args });
      return result;
    } catch (error) {
      rateLimitService.recordToolCall(toolName, "error", {
        args,
        error: error.message,
      });
      throw error;
    }
  };
};

// Usage
const trackedReadFile = withRateLimitTracking(readFile, "read_file");
```

## Bypass Methods

The service supports several bypass methods when rate limits are approached:

1. **Session Rotation**: Clears session data and resets the current tool call count
2. **Token Management**: Analyzes tool usage patterns to optimize token usage
3. **Cache Optimization**: Enhances caching for frequently accessed resources
4. **Request Batching**: Combines multiple tool calls into batched requests
5. **Custom Rules**: Executes user-defined bypass logic

To configure the bypass method:

```ts
import rateLimitService from "../services/RateLimitService";

// Update settings
rateLimitService.updateSettings({
  autoBypass: true,
  bypassMethod: "cache-optimization",
  notificationThreshold: 80,
});

// Manually execute bypass
rateLimitService.executeBypass();
```

## Settings Configuration

Available settings:

| Setting                 | Description                                                    | Default                        |
| ----------------------- | -------------------------------------------------------------- | ------------------------------ |
| `toolCallLimit`         | Maximum number of tool calls allowed                           | 25                             |
| `resetIntervalMinutes`  | Minutes until the tool call count resets                       | 180 (3 hours)                  |
| `notificationThreshold` | Percentage at which to notify/execute bypass                   | 75%                            |
| `enableNotifications`   | Whether to show notifications                                  | true                           |
| `autoBypass`            | Whether to automatically execute bypass when threshold reached | true                           |
| `bypassMethod`          | Which bypass method to use                                     | "session-rotation"             |
| `monitorInterval`       | Seconds between status checks                                  | 30                             |
| `excludedTools`         | Tools to exclude from counting                                 | ["web_search", "diff_history"] |
| `customBypassRules`     | Custom JavaScript logic for bypass (if using custom-rules)     | ""                             |

## Advanced: Interception Strategy

For a more integrated approach, consider implementing tool call interception:

```ts
// Global interception setup
if (typeof window !== "undefined") {
  // Store original methods
  const originalToolCalls = { ...window.__cursorToolCalls };

  // Create proxied versions
  const proxiedToolCalls = {};

  Object.keys(originalToolCalls).forEach((toolName) => {
    proxiedToolCalls[toolName] = async (...args) => {
      try {
        // Execute original tool call
        const result = await originalToolCalls[toolName](...args);

        // Record successful tool call
        rateLimitService.recordToolCall(toolName, "success", { args });

        return result;
      } catch (error) {
        // Record failed tool call
        rateLimitService.recordToolCall(toolName, "error", {
          args,
          error: error.message,
        });

        throw error;
      }
    };
  });

  // Replace with proxied versions
  window.__cursorToolCalls = proxiedToolCalls;
}
```

## Best Practices

1. **Record All Tool Calls**: Ensure all tool calls are recorded for accurate tracking
2. **Use Appropriate Status**: Record 'success', 'warning', or 'error' status
3. **Include Parameters**: Record parameters for better analysis
4. **Set Realistic Thresholds**: Configure thresholds based on your usage patterns
5. **Choose Appropriate Bypass Method**: Different methods work better for different scenarios
6. **Listen for Status Changes**: Register listeners to react to changing status
7. **Clean Up Listeners**: Always unsubscribe listeners when components unmount
8. **Test in Development**: Use the simulate tool calls feature to test bypass methods
9. **Monitor Performance**: Keep an eye on the impact of bypass methods on performance
10. **Regularly Review History**: Analyze tool call history to optimize usage patterns

## Troubleshooting

**Rate Limit Not Tracking Accurately**

- Ensure all tool calls are being recorded
- Check if excluded tools list is appropriate

**Bypass Not Working**

- Verify bypass method is configured correctly
- Check console for errors during bypass execution
- Try a different bypass method

**High Memory Usage**

- Tool call history is limited to 100 entries by default
- Consider clearing history periodically with `localStorage.removeItem('rateLimitToolCallHistory')`

## API Reference

### RateLimitService

```ts
// Main service functions
recordToolCall(tool: string, status?: "success" | "warning" | "error", parameters?: Record<string, any>): void
getStatus(): RateLimitStatus
getHistory(limit?: number): ToolCallRecord[]
getSettings(): RateLimitSettings
updateSettings(newSettings: Partial<RateLimitSettings>): void
resetSettings(): void
registerListener(callback: (status: RateLimitStatus) => void): () => void
executeBypass(): void
forceReset(): void
startMonitoring(): void
stopMonitoring(): void
```

### RateLimitContext

```ts
// Context functions
status: RateLimitStatus
history: ToolCallRecord[]
settings: RateLimitSettings
updateSettings: (newSettings: Partial<RateLimitSettings>) => void
executeBypass: () => void
resetSettings: () => void
recordToolCall: (tool: string, status?: "success" | "warning" | "error", parameters?: Record<string, any>) => void
simulateToolCalls: (count: number) => void
forceReset: () => void
```

### Types

```ts
interface RateLimitSettings {
  toolCallLimit: number;
  resetIntervalMinutes: number;
  notificationThreshold: number;
  enableNotifications: boolean;
  autoBypass: boolean;
  bypassMethod:
    | "session-rotation"
    | "token-management"
    | "cache-optimization"
    | "request-batching"
    | "custom-rules";
  monitorInterval: number;
  excludedTools: string[];
  customBypassRules?: string;
}

interface ToolCallRecord {
  id: string;
  tool: string;
  timestamp: string;
  parameters?: Record<string, any>;
  status: "success" | "warning" | "error";
  bypassApplied?: boolean;
  bypassMethod?: string;
}

interface RateLimitStatus {
  current: number;
  limit: number;
  percentage: number;
  nextReset: string;
  isApproachingLimit: boolean;
  bypassStatus: "inactive" | "active" | "pending";
  currentMethod?: string;
  predictedTimeToLimit?: string;
}
```
