"use strict";
/**
 * mcp-servers/utils/mode-aware.ts
 *
 * Mode-aware service for MCP servers that enables mode-specific optimizations
 * and ensures servers respond appropriately to development mode changes.
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
exports.ModeAwareService = exports.AVAILABLE_MODES = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const events_1 = require("events");
/**
 * Available development modes with their emoji and descriptions
 */
exports.AVAILABLE_MODES = {
    design: {
        emoji: "🎨",
        description: "Design Mode - UI/UX structuring, component architecture",
    },
    engineering: {
        emoji: "🔧",
        description: "Engineering Mode - Core functionality, business logic",
    },
    testing: {
        emoji: "🧪",
        description: "Testing Mode - Quality assurance, edge cases",
    },
    deployment: {
        emoji: "📦",
        description: "Deployment Mode - Release readiness, CI/CD",
    },
    maintenance: {
        emoji: "🔍",
        description: "Maintenance Mode - Ongoing health, improvements",
    },
};
/**
 * Mode-aware service for MCP servers
 * Enables servers to adjust their behavior based on the current development mode
 */
class ModeAwareService extends events_1.EventEmitter {
    /**
     * Constructor
     * @param serviceName Name of the service using this mode-aware service
     */
    constructor(serviceName) {
        super();
        this.currentMode = null;
        this.modeFile = path.join(process.cwd(), "development-modes", ".current_mode");
        this.modeChangeFile = path.join(process.cwd(), "development-modes", ".mode_change");
        this.watchers = [];
        this.serviceName = serviceName;
        this.currentMode = this.detectCurrentMode();
        this.setupWatchers();
        console.log(`[ModeAwareService] Initialized for service: ${serviceName}`);
        console.log(`[ModeAwareService] Current mode: ${this.currentMode?.name || "None"}`);
    }
    /**
     * Detect the current development mode from various sources
     */
    detectCurrentMode() {
        // Try environment variable first
        let mode = null;
        // Check environment variable
        if (process.env.DEVELOPMENT_MODE) {
            mode = this.validateMode(process.env.DEVELOPMENT_MODE);
        }
        // Check command line arguments
        if (!mode) {
            const args = process.argv.slice(2);
            const modeArg = args.indexOf("--mode");
            if (modeArg !== -1 && modeArg < args.length - 1) {
                mode = this.validateMode(args[modeArg + 1]);
            }
        }
        // Check mode file
        if (!mode && fs.existsSync(this.modeFile)) {
            try {
                const fileContent = fs.readFileSync(this.modeFile, "utf8").trim();
                mode = this.validateMode(fileContent);
            }
            catch (error) {
                console.error(`[ModeAwareService] Error reading mode file: ${error}`);
            }
        }
        // Check mode change file
        if (!mode && fs.existsSync(this.modeChangeFile)) {
            try {
                const fileContent = fs.readFileSync(this.modeChangeFile, "utf8").trim();
                const changeData = JSON.parse(fileContent);
                mode = this.validateMode(changeData.newMode);
            }
            catch (error) {
                console.error(`[ModeAwareService] Error reading mode change file: ${error}`);
            }
        }
        // Default to engineering if no mode detected
        if (!mode) {
            mode = "engineering";
            console.log(`[ModeAwareService] No mode detected, defaulting to: ${mode}`);
        }
        return {
            mode,
            name: exports.AVAILABLE_MODES[mode].description.split(" - ")[0],
            emoji: exports.AVAILABLE_MODES[mode].emoji,
            description: exports.AVAILABLE_MODES[mode].description,
        };
    }
    /**
     * Validate if a provided mode is valid
     */
    validateMode(mode) {
        if (!mode)
            return null;
        const normalizedMode = mode.toLowerCase().trim();
        if (Object.keys(exports.AVAILABLE_MODES).includes(normalizedMode)) {
            return normalizedMode;
        }
        // Log invalid mode
        console.error(`[ModeAwareService] Invalid mode: ${mode}`);
        return null;
    }
    /**
     * Set up file watchers to detect mode changes
     */
    setupWatchers() {
        try {
            // Watch mode file
            if (fs.existsSync(path.dirname(this.modeFile))) {
                const modeWatcher = fs.watch(path.dirname(this.modeFile), (eventType, filename) => {
                    if (filename === ".current_mode" && eventType === "change") {
                        this.handleModeFileChange();
                    }
                });
                this.watchers.push(modeWatcher);
            }
            console.log(`[ModeAwareService] Set up watchers for mode changes`);
        }
        catch (error) {
            console.error(`[ModeAwareService] Error setting up watchers: ${error}`);
        }
    }
    /**
     * Handle changes to the mode file
     */
    handleModeFileChange() {
        const newMode = this.detectCurrentMode();
        if (this.currentMode?.mode !== newMode.mode && newMode.mode !== null) {
            const oldMode = this.currentMode?.mode;
            this.currentMode = newMode;
            // Emit mode change event
            this.emit("modeChanged", {
                oldMode,
                newMode: newMode.mode,
                modeInfo: newMode,
            });
            console.log(`[ModeAwareService] Mode changed from ${oldMode || "none"} to ${newMode.mode}`);
        }
    }
    /**
     * Get the current mode
     */
    getCurrentMode() {
        // Refresh current mode to ensure it's up to date
        this.currentMode = this.detectCurrentMode();
        return this.currentMode;
    }
    /**
     * Set the current mode
     */
    setMode(mode) {
        const validMode = this.validateMode(mode);
        if (!validMode) {
            console.error(`[ModeAwareService] Cannot set invalid mode: ${mode}`);
            return false;
        }
        // Only emit change if mode is different
        if (this.currentMode?.mode !== validMode) {
            const oldMode = this.currentMode?.mode;
            const newMode = {
                mode: validMode,
                name: exports.AVAILABLE_MODES[validMode].description.split(" - ")[0],
                emoji: exports.AVAILABLE_MODES[validMode].emoji,
                description: exports.AVAILABLE_MODES[validMode].description,
            };
            this.currentMode = newMode;
            // Emit mode change event
            this.emit("modeChanged", {
                oldMode,
                newMode: validMode,
                modeInfo: newMode,
            });
            console.log(`[ModeAwareService] Mode set from ${oldMode || "none"} to ${validMode}`);
            return true;
        }
        return false;
    }
    /**
     * Get optimizations for a specific service based on the current mode
     */
    getOptimizationsForService(serviceName) {
        const mode = this.getCurrentMode().mode || "engineering";
        // Base optimizations that apply to all services and modes
        const baseOptimizations = {
            cachingStrategy: "default",
            verboseLogging: false,
            asyncProcessing: true,
            priorityLevel: 5,
        };
        // Mode-specific optimizations
        const modeOptimizations = {
            design: {
                cachingStrategy: "aggressive",
                priorityLevel: 7,
            },
            engineering: {
                verboseLogging: true,
                priorityLevel: 8,
            },
            testing: {
                cachingStrategy: "minimal",
                verboseLogging: true,
                asyncProcessing: false,
                priorityLevel: 9,
            },
            deployment: {
                cachingStrategy: "aggressive",
                verboseLogging: false,
                priorityLevel: 10,
            },
            maintenance: {
                cachingStrategy: "default",
                verboseLogging: true,
                priorityLevel: 6,
            },
        };
        // Service-specific overrides could be implemented here
        const serviceOverrides = {
            prompt_engineering: {
            // Override specific settings for prompt engineering service
            },
            content_summarizer: {
            // Override specific settings for content summarizer service
            },
        };
        // Combine optimizations with appropriate precedence
        return {
            ...baseOptimizations,
            ...modeOptimizations[mode],
            ...(serviceOverrides[serviceName] || {}),
        };
    }
    /**
     * Apply mode-specific optimizations for a service
     */
    applyModeSpecificOptimizations(serviceName) {
        const optimizations = this.getOptimizationsForService(serviceName);
        console.log(`[ModeAwareService] Applied ${this.currentMode?.name} optimizations for ${serviceName}`);
        console.log(`[ModeAwareService] Caching: ${optimizations.cachingStrategy}, Verbose: ${optimizations.verboseLogging}`);
        return optimizations;
    }
    /**
     * Clean up watchers and resources
     */
    cleanup() {
        // Close all file watchers
        this.watchers.forEach((watcher) => {
            try {
                watcher.close();
            }
            catch (error) {
                console.error(`[ModeAwareService] Error closing watcher: ${error}`);
            }
        });
        this.watchers = [];
        this.removeAllListeners();
        console.log(`[ModeAwareService] Cleaned up resources for service: ${this.serviceName}`);
    }
}
exports.ModeAwareService = ModeAwareService;
//# sourceMappingURL=mode-aware.js.map