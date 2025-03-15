"use strict";
/**
 * mcp-servers/mouse-automation/mouse-automation-server.ts
 *
 * Enhanced Mouse Automation MCP Server implementation.
 * Provides mouse and keyboard automation capabilities with improved control and security.
 * Uses the robotjs library for cross-platform automation with fallback to simulation mode.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.MouseAutomationServer = void 0;
const mcp_server_1 = require("../shared/mcp-server");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// Dynamically import robotjs to handle potential build issues
let robot = null;
try {
    // robotjs requires node-gyp and compilation tools
    robot = require("robotjs");
    console.log("RobotJS loaded successfully");
}
catch (error) {
    console.warn("RobotJS not available, using simulation mode:", error.message);
}
/**
 * Enhanced Mouse Automation Server
 */
class MouseAutomationServer extends mcp_server_1.MCPServer {
    constructor(config) {
        super(config);
        this.operationLog = [];
        // Check if we need to use simulation mode
        this.simulationMode = config.simulationMode || !robot;
        // Security settings
        this.securityEnabled = config.securityEnabled !== false;
        this.allowedRegions = config.allowedRegions || [];
        // Enhanced configuration options
        this.logDirectory =
            config.logDirectory ||
                path.join(process.cwd(), "logs", "mouse-automation");
        this.clickDelay = config.clickDelay || 200;
        this.dragEnabled = config.dragEnabled !== false;
        this.acceleratedMode = config.acceleratedMode || false;
        this.maxSequenceLength = config.maxSequenceLength || 10;
        // Ensure log directory exists
        if (!this.simulationMode) {
            try {
                if (!fs.existsSync(this.logDirectory)) {
                    fs.mkdirSync(this.logDirectory, { recursive: true });
                }
            }
            catch (error) {
                console.warn(`[${this.name}] Failed to create log directory:`, error);
            }
        }
        // Get screen size if robot is available
        this.screenSize = { width: 1920, height: 1080 }; // Default size
        if (robot) {
            try {
                this.screenSize = robot.getScreenSize();
            }
            catch (error) {
                console.warn(`[${this.name}] Failed to get screen size:`, error);
            }
        }
        // Register tools
        this.registerMouseClickTool();
        this.registerKeyboardPressTool();
        this.registerMouseMoveTool();
        this.registerMouseDragTool();
        this.registerMouseSequenceTool();
        this.registerScreenInfoTool();
        // Log initialization
        console.log(`[${this.name}] Enhanced Mouse Automation Server initialized`);
        console.log(`[${this.name}] Simulation mode: ${this.simulationMode ? "enabled" : "disabled"}`);
        console.log(`[${this.name}] Security checks: ${this.securityEnabled ? "enabled" : "disabled"}`);
        console.log(`[${this.name}] Screen size: ${this.screenSize.width}x${this.screenSize.height}`);
        console.log(`[${this.name}] Click delay: ${this.clickDelay}ms`);
        console.log(`[${this.name}] Drag enabled: ${this.dragEnabled}`);
        console.log(`[${this.name}] Accelerated mode: ${this.acceleratedMode}`);
        if (this.allowedRegions.length > 0) {
            console.log(`[${this.name}] Allowed regions: ${this.allowedRegions.length} defined`);
            this.allowedRegions.forEach((region) => {
                console.log(`[${this.name}]   - ${region.name}: (${region.x1},${region.y1}) to (${region.x2},${region.y2})`);
            });
        }
    }
    /**
     * Register the mouse_click tool
     */
    registerMouseClickTool() {
        const parameters = [
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
                description: "Mouse button to click (left, right, middle)",
                default: "left",
            },
            {
                name: "double",
                type: "boolean",
                description: "Whether to perform a double-click",
                default: false,
            },
            {
                name: "delay",
                type: "number",
                description: "Delay in ms between clicks for double-click (overrides default)",
                required: false,
            },
        ];
        const tool = {
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
    registerKeyboardPressTool() {
        const parameters = [
            {
                name: "key",
                type: "string",
                description: 'Key to press (e.g., "a", "enter", "escape", "f1")',
                required: false,
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
            {
                name: "delay",
                type: "number",
                description: "Delay in ms between keystrokes when typing text",
                default: 0,
            },
        ];
        const tool = {
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
     * Register the mouse_move tool
     */
    registerMouseMoveTool() {
        const parameters = [
            {
                name: "x",
                type: "number",
                description: "X coordinate to move to",
                required: true,
            },
            {
                name: "y",
                type: "number",
                description: "Y coordinate to move to",
                required: true,
            },
            {
                name: "speed",
                type: "number",
                description: "Movement speed (1-10, where 10 is fastest)",
                default: 5,
            },
        ];
        const tool = {
            name: "mouse_move",
            description: "Moves the mouse cursor to the specified coordinates",
            parameters,
            output: {
                type: "boolean",
                description: "Success status",
            },
        };
        this.registerTool(tool);
    }
    /**
     * Register the mouse_drag tool
     */
    registerMouseDragTool() {
        const parameters = [
            {
                name: "startX",
                type: "number",
                description: "Starting X coordinate",
                required: true,
            },
            {
                name: "startY",
                type: "number",
                description: "Starting Y coordinate",
                required: true,
            },
            {
                name: "endX",
                type: "number",
                description: "Ending X coordinate",
                required: true,
            },
            {
                name: "endY",
                type: "number",
                description: "Ending Y coordinate",
                required: true,
            },
            {
                name: "button",
                type: "string",
                description: "Mouse button for dragging (left, right, middle)",
                default: "left",
            },
            {
                name: "steps",
                type: "number",
                description: "Number of steps for the drag operation",
                default: 10,
            },
        ];
        const tool = {
            name: "mouse_drag",
            description: "Performs a mouse drag operation from start to end coordinates",
            parameters,
            output: {
                type: "boolean",
                description: "Success status",
            },
        };
        this.registerTool(tool);
    }
    /**
     * Register the mouse_sequence tool
     */
    registerMouseSequenceTool() {
        const parameters = [
            {
                name: "sequence",
                type: "array",
                description: "Array of mouse operations to perform in sequence",
                required: true,
            },
            {
                name: "delayBetweenOperations",
                type: "number",
                description: "Delay in ms between operations",
                default: 500,
            },
        ];
        const tool = {
            name: "mouse_sequence",
            description: "Performs a sequence of mouse operations",
            parameters,
            output: {
                type: "object",
                description: "Results of the sequence operations",
            },
        };
        this.registerTool(tool);
    }
    /**
     * Register the screen_info tool
     */
    registerScreenInfoTool() {
        const tool = {
            name: "screen_info",
            description: "Returns information about the screen size and mouse position",
            parameters: [],
            output: {
                type: "object",
                description: "Screen information",
            },
        };
        this.registerTool(tool);
    }
    /**
     * Execute a tool
     */
    async executeTool(request) {
        const { id, tool, parameters } = request;
        switch (tool) {
            case "mouse_click":
                return this.executeMouseClick(id, parameters);
            case "keyboard_press":
                return this.executeKeyboardPress(id, parameters);
            case "mouse_move":
                return this.executeMouseMove(id, parameters);
            case "mouse_drag":
                return this.executeMouseDrag(id, parameters);
            case "mouse_sequence":
                return this.executeMouseSequence(id, parameters);
            case "screen_info":
                return this.executeScreenInfo(id, parameters);
            default:
                return {
                    id,
                    tool,
                    success: false,
                    error: `Tool '${tool}' not supported by Mouse Automation Server`,
                };
        }
    }
    /**
     * Execute mouse click
     */
    async executeMouseClick(id, parameters) {
        try {
            const { x, y, button = "left", double = false, delay } = parameters;
            const clickDelay = delay || this.clickDelay;
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
            await this.performMouseClick(x, y, button, double, clickDelay);
            // Log the operation
            this.logOperation("mouse_click", { x, y, button, double, delay: clickDelay }, true);
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
                    delay: clickDelay,
                    simulation_mode: this.simulationMode,
                },
            };
        }
        catch (error) {
            console.error(`[${this.name}] Mouse click error:`, error);
            this.logOperation("mouse_click", parameters, false);
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
    async executeKeyboardPress(id, parameters) {
        try {
            const { key, modifier, text, delay = 0 } = parameters;
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
                    console.log(`[${this.name}] Simulating typing text: "${text}" with delay ${delay}ms`);
                }
                else if (modifier) {
                    console.log(`[${this.name}] Simulating key press: ${modifier}+${key}`);
                }
                else {
                    console.log(`[${this.name}] Simulating key press: ${key}`);
                }
                this.logOperation("keyboard_press", { key, modifier, text, delay }, true);
                return {
                    id,
                    tool: "keyboard_press",
                    success: true,
                    result: true,
                    metadata: {
                        key,
                        modifier,
                        text,
                        delay,
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
                if (delay > 0) {
                    // Type with delay between characters
                    for (let i = 0; i < text.length; i++) {
                        robot.typeString(text[i]);
                        await new Promise((resolve) => setTimeout(resolve, delay));
                    }
                }
                else {
                    robot.typeString(text);
                }
            }
            else {
                // Handle key press
                if (modifier) {
                    robot.keyToggle(modifier.toLowerCase(), "down");
                    robot.keyTap(key.toLowerCase());
                    robot.keyToggle(modifier.toLowerCase(), "up");
                }
                else {
                    robot.keyTap(key.toLowerCase());
                }
            }
            this.logOperation("keyboard_press", { key, modifier, text, delay }, true);
            return {
                id,
                tool: "keyboard_press",
                success: true,
                result: true,
                metadata: {
                    key,
                    modifier,
                    text,
                    delay,
                    simulation_mode: false,
                },
            };
        }
        catch (error) {
            console.error(`[${this.name}] Keyboard press error:`, error);
            this.logOperation("keyboard_press", parameters, false);
            return {
                id,
                tool: "keyboard_press",
                success: false,
                error: error.message || "Failed to perform keyboard press",
            };
        }
    }
    /**
     * Execute mouse move
     */
    async executeMouseMove(id, parameters) {
        try {
            const { x, y, speed = 5 } = parameters;
            if (typeof x !== "number" || typeof y !== "number") {
                return {
                    id,
                    tool: "mouse_move",
                    success: false,
                    error: "Invalid coordinates: x and y must be numbers",
                };
            }
            // Security check for allowed regions
            if (this.securityEnabled && !this.isCoordinateAllowed(x, y)) {
                return {
                    id,
                    tool: "mouse_move",
                    success: false,
                    error: "Coordinates outside of allowed regions",
                };
            }
            // Perform the move
            await this.performMouseMove(x, y, speed);
            this.logOperation("mouse_move", { x, y, speed }, true);
            return {
                id,
                tool: "mouse_move",
                success: true,
                result: true,
                metadata: {
                    x,
                    y,
                    speed,
                    simulation_mode: this.simulationMode,
                },
            };
        }
        catch (error) {
            console.error(`[${this.name}] Mouse move error:`, error);
            this.logOperation("mouse_move", parameters, false);
            return {
                id,
                tool: "mouse_move",
                success: false,
                error: error.message || "Failed to move mouse",
            };
        }
    }
    /**
     * Execute mouse drag
     */
    async executeMouseDrag(id, parameters) {
        try {
            const { startX, startY, endX, endY, button = "left", steps = 10, } = parameters;
            if (!this.dragEnabled) {
                return {
                    id,
                    tool: "mouse_drag",
                    success: false,
                    error: "Drag operations are disabled",
                };
            }
            if (typeof startX !== "number" ||
                typeof startY !== "number" ||
                typeof endX !== "number" ||
                typeof endY !== "number") {
                return {
                    id,
                    tool: "mouse_drag",
                    success: false,
                    error: "Invalid coordinates: all coordinates must be numbers",
                };
            }
            // Security check for allowed regions
            if (this.securityEnabled) {
                if (!this.isCoordinateAllowed(startX, startY)) {
                    return {
                        id,
                        tool: "mouse_drag",
                        success: false,
                        error: "Start coordinates outside of allowed regions",
                    };
                }
                if (!this.isCoordinateAllowed(endX, endY)) {
                    return {
                        id,
                        tool: "mouse_drag",
                        success: false,
                        error: "End coordinates outside of allowed regions",
                    };
                }
            }
            // Perform the drag
            await this.performMouseDrag(startX, startY, endX, endY, button, steps);
            this.logOperation("mouse_drag", { startX, startY, endX, endY, button, steps }, true);
            return {
                id,
                tool: "mouse_drag",
                success: true,
                result: true,
                metadata: {
                    startX,
                    startY,
                    endX,
                    endY,
                    button,
                    steps,
                    simulation_mode: this.simulationMode,
                },
            };
        }
        catch (error) {
            console.error(`[${this.name}] Mouse drag error:`, error);
            this.logOperation("mouse_drag", parameters, false);
            return {
                id,
                tool: "mouse_drag",
                success: false,
                error: error.message || "Failed to perform mouse drag",
            };
        }
    }
    /**
     * Execute mouse sequence
     */
    async executeMouseSequence(id, parameters) {
        try {
            const { sequence, delayBetweenOperations = 500 } = parameters;
            if (!Array.isArray(sequence)) {
                return {
                    id,
                    tool: "mouse_sequence",
                    success: false,
                    error: "Sequence must be an array of operations",
                };
            }
            if (sequence.length > this.maxSequenceLength) {
                return {
                    id,
                    tool: "mouse_sequence",
                    success: false,
                    error: `Sequence length exceeds maximum allowed (${this.maxSequenceLength})`,
                };
            }
            const results = [];
            let failedOperation = null;
            // Execute each operation in sequence
            for (let i = 0; i < sequence.length; i++) {
                const operation = sequence[i];
                const { type, ...params } = operation;
                if (!type) {
                    failedOperation = {
                        index: i,
                        error: "Operation missing type",
                    };
                    break;
                }
                try {
                    let result;
                    switch (type) {
                        case "click":
                            result = await this.performMouseClick(params.x, params.y, params.button || "left", params.double || false, params.delay || this.clickDelay);
                            break;
                        case "move":
                            result = await this.performMouseMove(params.x, params.y, params.speed || 5);
                            break;
                        case "drag":
                            result = await this.performMouseDrag(params.startX, params.startY, params.endX, params.endY, params.button || "left", params.steps || 10);
                            break;
                        case "keypress":
                            // Handle key press
                            if (!robot) {
                                throw new Error("RobotJS not available");
                            }
                            if (params.text) {
                                robot.typeString(params.text);
                            }
                            else if (params.key) {
                                if (params.modifier) {
                                    robot.keyToggle(params.modifier.toLowerCase(), "down");
                                    robot.keyTap(params.key.toLowerCase());
                                    robot.keyToggle(params.modifier.toLowerCase(), "up");
                                }
                                else {
                                    robot.keyTap(params.key.toLowerCase());
                                }
                            }
                            else {
                                throw new Error("Missing key or text for keypress operation");
                            }
                            break;
                        case "delay":
                            await new Promise((resolve) => setTimeout(resolve, params.ms || 1000));
                            break;
                        default:
                            throw new Error(`Unknown operation type: ${type}`);
                    }
                    results.push({
                        index: i,
                        type,
                        success: true,
                        params,
                    });
                    // Delay between operations
                    if (i < sequence.length - 1) {
                        await new Promise((resolve) => setTimeout(resolve, delayBetweenOperations));
                    }
                }
                catch (error) {
                    failedOperation = {
                        index: i,
                        type,
                        error: error.message,
                    };
                    break;
                }
            }
            this.logOperation("mouse_sequence", {
                sequenceLength: sequence.length,
                delayBetweenOperations,
                completed: !failedOperation,
            }, !failedOperation);
            return {
                id,
                tool: "mouse_sequence",
                success: !failedOperation,
                result: {
                    operations: results,
                    completed: !failedOperation,
                    totalOperations: sequence.length,
                    completedOperations: results.length,
                    failedOperation,
                },
                error: failedOperation
                    ? `Sequence failed at operation ${failedOperation.index}: ${failedOperation.error}`
                    : undefined,
            };
        }
        catch (error) {
            console.error(`[${this.name}] Mouse sequence error:`, error);
            this.logOperation("mouse_sequence", parameters, false);
            return {
                id,
                tool: "mouse_sequence",
                success: false,
                error: error.message || "Failed to execute mouse sequence",
            };
        }
    }
    /**
     * Execute screen info
     */
    async executeScreenInfo(id, parameters) {
        try {
            let currentPosition = { x: 0, y: 0 };
            if (!this.simulationMode && robot) {
                try {
                    currentPosition = robot.getMousePos();
                }
                catch (error) {
                    console.warn(`[${this.name}] Failed to get mouse position:`, error);
                }
            }
            return {
                id,
                tool: "screen_info",
                success: true,
                result: {
                    screen: {
                        width: this.screenSize.width,
                        height: this.screenSize.height,
                    },
                    mouse: {
                        x: currentPosition.x,
                        y: currentPosition.y,
                    },
                    simulationMode: this.simulationMode,
                    allowedRegions: this.securityEnabled ? this.allowedRegions : [],
                },
            };
        }
        catch (error) {
            console.error(`[${this.name}] Screen info error:`, error);
            return {
                id,
                tool: "screen_info",
                success: false,
                error: error.message || "Failed to get screen information",
            };
        }
    }
    /**
     * Check if coordinates are within allowed regions
     */
    isCoordinateAllowed(x, y) {
        // If no regions are defined, allow all coordinates
        if (this.allowedRegions.length === 0) {
            return true;
        }
        // Check if coordinates are within any of the allowed regions
        return this.allowedRegions.some((region) => {
            return (x >= region.x1 && x <= region.x2 && y >= region.y1 && y <= region.y2);
        });
    }
    /**
     * Perform mouse click using robotjs or simulation
     */
    async performMouseClick(x, y, button, doubleClick, delay) {
        if (this.simulationMode) {
            console.log(`[${this.name}] Simulating mouse click: x=${x}, y=${y}, button=${button}, double=${doubleClick}, delay=${delay}ms`);
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
                await new Promise((resolve) => setTimeout(resolve, delay));
                robot.mouseClick(robotButton);
            }
            else {
                robot.mouseClick(robotButton);
            }
        }
        catch (error) {
            console.error(`[${this.name}] RobotJS error:`, error);
            throw new Error(`Failed to perform mouse click: ${error.message}`);
        }
    }
    /**
     * Perform mouse move using robotjs or simulation
     */
    async performMouseMove(x, y, speed) {
        if (this.simulationMode) {
            console.log(`[${this.name}] Simulating mouse move: x=${x}, y=${y}, speed=${speed}`);
            return;
        }
        try {
            // Verify robotjs is available
            if (!robot) {
                throw new Error("RobotJS not available");
            }
            if (this.acceleratedMode) {
                // Just move directly to the position
                robot.moveMouse(x, y);
                return;
            }
            // Get current position
            const currentPos = robot.getMousePos();
            const startX = currentPos.x;
            const startY = currentPos.y;
            // Calculate distance
            const distance = Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2));
            // Determine number of steps based on speed
            // Higher speed = fewer steps
            const steps = Math.max(Math.floor(distance / (speed * 2)), 5);
            const stepDuration = 5 + (11 - speed); // 6-15ms based on speed
            // Move in steps
            for (let i = 1; i <= steps; i++) {
                const progress = i / steps;
                const currentX = Math.round(startX + (x - startX) * progress);
                const currentY = Math.round(startY + (y - startY) * progress);
                robot.moveMouse(currentX, currentY);
                await new Promise((resolve) => setTimeout(resolve, stepDuration));
            }
            // Ensure we end at the exact target
            robot.moveMouse(x, y);
        }
        catch (error) {
            console.error(`[${this.name}] RobotJS error:`, error);
            throw new Error(`Failed to move mouse: ${error.message}`);
        }
    }
    /**
     * Perform mouse drag using robotjs or simulation
     */
    async performMouseDrag(startX, startY, endX, endY, button, steps) {
        if (this.simulationMode) {
            console.log(`[${this.name}] Simulating mouse drag: from (${startX},${startY}) to (${endX},${endY}), button=${button}, steps=${steps}`);
            return;
        }
        try {
            // Verify robotjs is available
            if (!robot) {
                throw new Error("RobotJS not available");
            }
            // Move to start position
            robot.moveMouse(startX, startY);
            // Press mouse button down
            robot.mouseToggle("down", button.toLowerCase());
            // Move in steps
            for (let i = 1; i <= steps; i++) {
                const progress = i / steps;
                const currentX = Math.round(startX + (endX - startX) * progress);
                const currentY = Math.round(startY + (endY - startY) * progress);
                robot.moveMouse(currentX, currentY);
                await new Promise((resolve) => setTimeout(resolve, 10));
            }
            // Make sure we are at the exact end position
            robot.moveMouse(endX, endY);
            // Release mouse button
            robot.mouseToggle("up", button.toLowerCase());
        }
        catch (error) {
            console.error(`[${this.name}] RobotJS error:`, error);
            // Try to release the mouse button in case of error
            try {
                if (robot) {
                    robot.mouseToggle("up", button.toLowerCase());
                }
            }
            catch { }
            throw new Error(`Failed to perform mouse drag: ${error.message}`);
        }
    }
    /**
     * Log an operation
     */
    logOperation(operation, parameters, success) {
        const logEntry = {
            timestamp: Date.now(),
            operation,
            parameters,
            success,
        };
        this.operationLog.push(logEntry);
        // Trim log if it gets too large
        if (this.operationLog.length > 1000) {
            this.operationLog = this.operationLog.slice(-500);
        }
        // Write to file if not in simulation mode
        if (!this.simulationMode) {
            try {
                const logFile = path.join(this.logDirectory, `mouse-automation-${new Date().toISOString().split("T")[0]}.log`);
                fs.appendFileSync(logFile, JSON.stringify(logEntry) + "\n", {
                    encoding: "utf8",
                });
            }
            catch (error) {
                console.warn(`[${this.name}] Failed to write to log file:`, error);
            }
        }
    }
    /**
     * Get a resource
     */
    async getResource(request) {
        if (request.resource === "operations_log") {
            return {
                id: request.id,
                resource: request.resource,
                success: true,
                data: this.operationLog,
            };
        }
        if (request.resource === "allowed_regions") {
            return {
                id: request.id,
                resource: request.resource,
                success: true,
                data: this.allowedRegions,
            };
        }
        return {
            id: request.id,
            resource: request.resource,
            success: false,
            error: `Resource '${request.resource}' not available`,
        };
    }
    /**
     * Execute a prompt
     */
    async executePrompt(request) {
        // This server doesn't provide prompts
        return {
            id: request.id,
            prompt: request.prompt,
            success: false,
            error: "Prompts not implemented in Mouse Automation Server",
        };
    }
}
exports.MouseAutomationServer = MouseAutomationServer;
/**
 * Start the server if run directly
 */
if (require.main === module) {
    const port = parseInt(process.env.MOUSE_AUTOMATION_PORT || "3003", 10);
    // Define some allowed regions (for development/testing)
    const allowedRegions = [];
    // If running in debug mode, add some predefined regions
    if (process.env.DEBUG === "true") {
        allowedRegions.push({
            name: "Full Screen",
            x1: 0,
            y1: 0,
            x2: 1920, // Will be adjusted by screen size
            y2: 1080, // Will be adjusted by screen size
        }, {
            name: "Top Menu Bar",
            x1: 0,
            y1: 0,
            x2: 1920, // Will be adjusted by screen size
            y2: 100,
        });
    }
    // Create and start the server
    const server = new MouseAutomationServer({
        name: "Enhanced Mouse Automation",
        port,
        version: "2.0.0",
        description: "Enhanced MCP server for mouse and keyboard automation",
        verbose: process.env.VERBOSE === "true",
        simulationMode: process.env.SIMULATION_MODE === "true",
        securityEnabled: process.env.SECURITY_ENABLED !== "false",
        allowedRegions,
        clickDelay: parseInt(process.env.CLICK_DELAY || "200", 10),
        dragEnabled: process.env.DRAG_ENABLED !== "false",
        acceleratedMode: process.env.ACCELERATED_MODE === "true",
        maxSequenceLength: parseInt(process.env.MAX_SEQUENCE_LENGTH || "10", 10),
    });
    server.start();
}
//# sourceMappingURL=mouse-automation-server.js.map