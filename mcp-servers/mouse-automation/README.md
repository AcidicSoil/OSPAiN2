# Enhanced Mouse Automation MCP Server

An MCP (Model Context Protocol) server for mouse and keyboard automation with enhanced features, improved control, and robust security.

## Features

- **Comprehensive Mouse Control**: Click, move, drag, and perform complex sequences of operations
- **Keyboard Automation**: Key press, modifier keys, and text typing with customizable delays
- **Enhanced Security**: Define allowed screen regions to prevent unwanted actions
- **Detailed Logging**: Track all operations with timestamps and success status
- **Simulation Mode**: Test automation scripts without actually moving the mouse
- **Sequence Operations**: Chain multiple operations together for complex interactions
- **Screen Information**: Get current screen size and mouse position
- **Configurable Settings**: Customize almost every aspect of the automation behavior

## Prerequisites

This server requires the [RobotJS](https://robotjs.io/) library for actual mouse and keyboard control. If RobotJS is not available, the server will run in simulation mode.

RobotJS requires:

- Node.js (>=12.0.0)
- Node-gyp and compilation tools (Visual Studio, GCC, or XCode depending on platform)

## Installation

```bash
# Install dependencies
npm install

# Build the server
npm run build
```

## Configuration

The server can be configured through environment variables:

| Variable                | Description                                                      | Default |
| ----------------------- | ---------------------------------------------------------------- | ------- |
| `MOUSE_AUTOMATION_PORT` | Port for the server                                              | 3003    |
| `SIMULATION_MODE`       | Run in simulation mode (no actual mouse movement)                | false   |
| `SECURITY_ENABLED`      | Enable security features like region restrictions                | true    |
| `CLICK_DELAY`           | Delay in ms between clicks for double-click                      | 200     |
| `DRAG_ENABLED`          | Enable or disable drag operations                                | true    |
| `ACCELERATED_MODE`      | Move mouse directly to target position (faster but less natural) | false   |
| `MAX_SEQUENCE_LENGTH`   | Maximum number of operations in a sequence                       | 10      |
| `DEBUG`                 | Enable debug mode with predefined allowed regions                | false   |

## Starting the Server

```bash
# Start in production mode
npm run start:mouse

# Start in development mode
npm run dev:mouse

# Start with custom options
SIMULATION_MODE=true CLICK_DELAY=300 npm run dev:mouse
```

## Supported Tools

### 1. Mouse Click (`mouse_click`)

Performs a mouse click at specified coordinates.

**Parameters:**

- `x` (number, required): X coordinate
- `y` (number, required): Y coordinate
- `button` (string): Mouse button to click (left, right, middle)
- `double` (boolean): Whether to perform a double-click
- `delay` (number): Delay in ms between clicks for double-click

**Example:**

```json
{
  "tool": "mouse_click",
  "parameters": {
    "x": 500,
    "y": 300,
    "button": "left",
    "double": true,
    "delay": 250
  }
}
```

### 2. Keyboard Press (`keyboard_press`)

Simulates keyboard input, either a single key press or typing text.

**Parameters:**

- `key` (string): Key to press (e.g., "a", "enter", "escape", "f1")
- `modifier` (string): Modifier key (e.g., "ctrl", "alt", "shift", "command")
- `text` (string): Text to type instead of a single key
- `delay` (number): Delay in ms between keystrokes when typing text

**Example:**

```json
{
  "tool": "keyboard_press",
  "parameters": {
    "key": "a",
    "modifier": "ctrl"
  }
}
```

```json
{
  "tool": "keyboard_press",
  "parameters": {
    "text": "Hello, world!",
    "delay": 50
  }
}
```

### 3. Mouse Move (`mouse_move`)

Moves the mouse cursor to specified coordinates.

**Parameters:**

- `x` (number, required): X coordinate to move to
- `y` (number, required): Y coordinate to move to
- `speed` (number): Movement speed (1-10, where 10 is fastest)

**Example:**

```json
{
  "tool": "mouse_move",
  "parameters": {
    "x": 800,
    "y": 600,
    "speed": 7
  }
}
```

### 4. Mouse Drag (`mouse_drag`)

Performs a mouse drag operation from start to end coordinates.

**Parameters:**

- `startX` (number, required): Starting X coordinate
- `startY` (number, required): Starting Y coordinate
- `endX` (number, required): Ending X coordinate
- `endY` (number, required): Ending Y coordinate
- `button` (string): Mouse button for dragging (left, right, middle)
- `steps` (number): Number of steps for the drag operation

**Example:**

```json
{
  "tool": "mouse_drag",
  "parameters": {
    "startX": 100,
    "startY": 100,
    "endX": 300,
    "endY": 300,
    "button": "left",
    "steps": 20
  }
}
```

### 5. Mouse Sequence (`mouse_sequence`)

Performs a sequence of mouse operations.

**Parameters:**

- `sequence` (array, required): Array of operations to perform
- `delayBetweenOperations` (number): Delay in ms between operations

**Example:**

```json
{
  "tool": "mouse_sequence",
  "parameters": {
    "sequence": [
      {
        "type": "move",
        "x": 500,
        "y": 300,
        "speed": 5
      },
      {
        "type": "click",
        "x": 500,
        "y": 300,
        "button": "left",
        "double": false
      },
      {
        "type": "delay",
        "ms": 1000
      },
      {
        "type": "keypress",
        "text": "Hello"
      }
    ],
    "delayBetweenOperations": 500
  }
}
```

### 6. Screen Info (`screen_info`)

Returns information about the screen size and current mouse position.

**Parameters:** None

**Example:**

```json
{
  "tool": "screen_info"
}
```

## Available Resources

### 1. Operations Log (`operations_log`)

Retrieves the log of recent operations.

**Example:**

```json
{
  "resource": "operations_log"
}
```

### 2. Allowed Regions (`allowed_regions`)

Retrieves the currently configured allowed regions.

**Example:**

```json
{
  "resource": "allowed_regions"
}
```

## Security Features

### Allowed Regions

By default, the mouse automation server allows operations anywhere on the screen. For enhanced security, you can define specific regions where operations are allowed.

Regions are defined as objects with:

- `name`: Human-readable name for the region
- `x1`, `y1`: Top-left coordinates
- `x2`, `y2`: Bottom-right coordinates

Any operation outside these regions will be rejected.

Example configuration for allowed regions:

```javascript
const allowedRegions = [
  {
    name: "Application Window",
    x1: 100,
    y1: 100,
    x2: 900,
    y2: 700,
  },
  {
    name: "Menu Bar",
    x1: 0,
    y1: 0,
    x2: 1920,
    y2: 50,
  },
];
```

## Common Use Cases

1. **UI Testing**: Automate interaction with UI elements for testing
2. **Demo Recordings**: Create perfect demonstrations of application features
3. **Automation Scripts**: Automate repetitive tasks
4. **Remote Control**: Control a computer remotely through API calls
5. **AI-Driven Interactions**: Allow AI models to interact with applications

## Troubleshooting

### Mouse Operations Not Working

1. Verify RobotJS is properly installed: `npm list robotjs`
2. Check if you're running in simulation mode: `SIMULATION_MODE=false`
3. Ensure coordinates are within defined allowed regions
4. Check system permissions for input control

### Mouse Moving to Wrong Coordinates

1. Check screen resolution and scaling settings
2. Verify allowed regions configuration
3. Ensure other applications aren't intercepting input

### Security Restrictions

If operations are being rejected due to security constraints:

1. Add the required regions to the allowed regions list
2. For testing only, disable security: `SECURITY_ENABLED=false`

## License

This software is released under the MIT License.
