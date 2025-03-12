/**
 * mcp-servers/mouse-automation/mouse-automation-server.ts
 *
 * Mouse Automation MCP Server implementation.
 * Provides mouse and keyboard automation capabilities through the mouse_click tool.
 * Uses the robotjs library for cross-platform automation.
 */

import { MCPServer, MCPServerConfig } from "../shared/mcp-server";
import {
  MCPTool,
  MCPToolRequest,
  MCPToolResponse,
  MCPResourceRequest,
  MCPResourceResponse,
  MCPPromptRequest,
  MCPPromptResponse,
  MCPToolParameter,
} from "../shared/mcp-types";

// Dynamically import robotjs to handle potential build issues
let robot: any = null;

try {
  // Note: robotjs requires node-gyp and compilation tools
  // It may not work in all environments without proper setup
  robot = require("robotjs");
  console.log("RobotJS loaded successfully");
} catch (error: any) {
  console.warn("RobotJS not available, using simulation mode:", error.message);
}

/**
 * Mouse Automation Server
 */
export class MouseAutomationServer extends MCPServer {
  private simulationMode: boolean;
  private securityEnabled: boolean;
  private allowedRegions: Array<{
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  }>;

  constructor(
    config: MCPServerConfig & {
      simulationMode?: boolean;
      securityEnabled?: boolean;
      allowedRegions?: Array<{
        x1: number;
        y1: number;
        x2: number;
        y2: number;
      }>;
    }
  ) {
    super(config);

    // Check if we need to use simulation mode
    this.simulationMode = config.simulationMode || !robot;

    // Security settings
    this.securityEnabled = config.securityEnabled !== false;
    this.allowedRegions = config.allowedRegions || [];

    // Register tools
    this.registerMouseClickTool();
    this.registerKeyboardPressTool();

    // Log initialization
    console.log(`[${this.name}] Mouse Automation Server initialized`);
    console.log(
      `[${this.name}] Simulation mode: ${
        this.simulationMode ? "enabled" : "disabled"
      }`
    );
    console.log(
      `[${this.name}] Security checks: ${
        this.securityEnabled ? "enabled" : "disabled"
      }`
    );

    if (this.allowedRegions.length > 0) {
      console.log(
        `[${this.name}] Allowed regions: ${this.allowedRegions.length} defined`
      );
    }
  }

  /**
   * Register the mouse_click tool
   */
  private registerMouseClickTool(): void {
    const parameters: MCPToolParameter[] = [
      {
        name: "x",
        type: "number",
        description: "X coordinate",
        required: true,
      },
      {
        name: "y",
        type: "number",
        description: "Y coordinate",
        required: true,
      },
      {
        name: "button",
        type: "string",
        description: "Mouse button to click",
        default: "left",
      },
      {
        name: "double",
        type: "boolean",
        description: "Whether to perform a double-click",
        default: false,
      },
    ];

    const tool: MCPTool = {
      name: "mouse_click",
      description: "Performs a mouse click at the specified coordinates",
      parameters,
      output: {
        type: "boolean",
        description: "Success status",
      },
    };

    this.registerTool(tool);
  }

  /**
   * Register the keyboard_press tool
   */
  private registerKeyboardPressTool(): void {
    const parameters: MCPToolParameter[] = [
      {
        name: "key",
        type: "string",
        description: 'Key to press (e.g., "a", "enter", "escape", "f1")',
        required: true,
      },
      {
        name: "modifier",
        type: "string",
        description: 'Modifier key (e.g., "ctrl", "alt", "shift", "command")',
        required: false,
      },
      {
        name: "text",
        type: "string",
        description: "Text to type instead of a single key",
        required: false,
      },
    ];

    const tool: MCPTool = {
      name: "keyboard_press",
      description: "Simulates a keyboard key press or types text",
      parameters,
      output: {
        type: "boolean",
        description: "Success status",
      },
    };

    this.registerTool(tool);
  }

  /**
   * Execute a tool
   */
  protected async executeTool(
    request: MCPToolRequest
  ): Promise<MCPToolResponse> {
    const { id, tool, parameters } = request;

    if (tool === "mouse_click") {
      return this.executeMouseClick(id, parameters);
    } else if (tool === "keyboard_press") {
      return this.executeKeyboardPress(id, parameters);
    }

    return {
      id,
      tool,
      success: false,
      error: `Tool '${tool}' not supported by Mouse Automation Server`,
    };
  }

  /**
   * Execute mouse click
   */
  private async executeMouseClick(
    id: string,
    parameters: any
  ): Promise<MCPToolResponse> {
    try {
      const { x, y, button = "left", double = false } = parameters;

      if (typeof x !== "number" || typeof y !== "number") {
        return {
          id,
          tool: "mouse_click",
          success: false,
          error: "Invalid coordinates: x and y must be numbers",
        };
      }

      // Security check for allowed regions
      if (this.securityEnabled && !this.isCoordinateAllowed(x, y)) {
        return {
          id,
          tool: "mouse_click",
          success: false,
          error: "Coordinates outside of allowed regions",
        };
      }

      // Perform the click
      await this.performMouseClick(x, y, button, double);

      return {
        id,
        tool: "mouse_click",
        success: true,
        result: true,
        metadata: {
          x,
          y,
          button,
          double,
          simulation_mode: this.simulationMode,
        },
      };
    } catch (error: any) {
      console.error(`[${this.name}] Mouse click error:`, error);
      return {
        id,
        tool: "mouse_click",
        success: false,
        error: error.message || "Failed to perform mouse click",
      };
    }
  }

  /**
   * Execute keyboard press
   */
  private async executeKeyboardPress(
    id: string,
    parameters: any
  ): Promise<MCPToolResponse> {
    try {
      const { key, modifier, text } = parameters;

      if (!key && !text) {
        return {
          id,
          tool: "keyboard_press",
          success: false,
          error: "Either key or text must be provided",
        };
      }

      if (this.simulationMode) {
        if (text) {
          console.log(`[${this.name}] Simulating typing text: "${text}"`);
        } else if (modifier) {
          console.log(
            `[${this.name}] Simulating key press: ${modifier}+${key}`
          );
        } else {
          console.log(`[${this.name}] Simulating key press: ${key}`);
        }

        return {
          id,
          tool: "keyboard_press",
          success: true,
          result: true,
          metadata: {
            key,
            modifier,
            text,
            simulation_mode: true,
          },
        };
      }

      // Verify robotjs is available
      if (!robot) {
        throw new Error("RobotJS not available");
      }

      // Handle text typing
      if (text) {
        robot.typeString(text);
      } else {
        // Handle key press
        if (modifier) {
          robot.keyToggle(modifier.toLowerCase(), "down");
          robot.keyTap(key.toLowerCase());
          robot.keyToggle(modifier.toLowerCase(), "up");
        } else {
          robot.keyTap(key.toLowerCase());
        }
      }

      return {
        id,
        tool: "keyboard_press",
        success: true,
        result: true,
        metadata: {
          key,
          modifier,
          text,
          simulation_mode: false,
        },
      };
    } catch (error: any) {
      console.error(`[${this.name}] Keyboard press error:`, error);
      return {
        id,
        tool: "keyboard_press",
        success: false,
        error: error.message || "Failed to perform keyboard press",
      };
    }
  }

  /**
   * Check if coordinates are within allowed regions
   */
  private isCoordinateAllowed(x: number, y: number): boolean {
    // If no regions are defined, allow all coordinates
    if (this.allowedRegions.length === 0) {
      return true;
    }

    // Check if coordinates are within any of the allowed regions
    return this.allowedRegions.some((region) => {
      return (
        x >= region.x1 && x <= region.x2 && y >= region.y1 && y <= region.y2
      );
    });
  }

  /**
   * Perform mouse click using robotjs or simulation
   */
  private async performMouseClick(
    x: number,
    y: number,
    button: string,
    doubleClick: boolean
  ): Promise<void> {
    if (this.simulationMode) {
      console.log(
        `[${this.name}] Simulating mouse click: x=${x}, y=${y}, button=${button}, double=${doubleClick}`
      );
      return;
    }

    try {
      // Verify robotjs is available
      if (!robot) {
        throw new Error("RobotJS not available");
      }

      // Move the mouse to the target position
      robot.moveMouse(x, y);

      // Convert button name to robotjs format if needed
      const robotButton = button.toLowerCase();

      // Perform the click
      if (doubleClick) {
        robot.mouseClick(robotButton);

        // Small delay between clicks
        await new Promise((resolve) => setTimeout(resolve, 100));

        robot.mouseClick(robotButton);
      } else {
        robot.mouseClick(robotButton);
      }
    } catch (error: any) {
      console.error(`[${this.name}] RobotJS error:`, error);
      throw new Error(`Failed to perform mouse click: ${error.message}`);
    }
  }

  /**
   * Get a resource
   */
  protected async getResource(
    request: MCPResourceRequest
  ): Promise<MCPResourceResponse> {
    // This server doesn't provide resources
    return {
      id: request.id,
      resource: request.resource,
      success: false,
      error: "Resources not implemented in Mouse Automation Server",
    };
  }

  /**
   * Execute a prompt
   */
  protected async executePrompt(
    request: MCPPromptRequest
  ): Promise<MCPPromptResponse> {
    // This server doesn't provide prompts
    return {
      id: request.id,
      prompt: request.prompt,
      success: false,
      error: "Prompts not implemented in Mouse Automation Server",
    };
  }
}

/**
 * Start the server if run directly
 */
if (require.main === module) {
  const port = parseInt(process.env.MOUSE_AUTOMATION_PORT || "3003", 10);

  const server = new MouseAutomationServer({
    name: "Mouse Automation",
    port,
    version: "1.0.0",
    description: "MCP server for mouse and keyboard automation",
    verbose: process.env.VERBOSE === "true",
    simulationMode: process.env.SIMULATION_MODE === "true",
    securityEnabled: process.env.SECURITY_ENABLED !== "false",
  });

  server.start();
}
