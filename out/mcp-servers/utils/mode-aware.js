"use strict";
/**
 * Mode Awareness Utility for MCP Servers
 *
 * This module provides utilities for MCP servers to detect and respond to
 * development mode changes. It handles mode detection, change notifications,
 * and mode-specific optimizations.
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
// Mode constants
exports.AVAILABLE_MODES = {
    design: {
        emoji: "🎨",
        name: "Design Mode",
        description: "Focus on UI/UX structuring, component architecture",
    },
    engineering: {
        emoji: "🔧",
        name: "Engineering Mode",
        description: "Focus on core functionality, business logic",
    },
    testing: {
        emoji: "🧪",
        name: "Testing Mode",
        description: "Focus on quality assurance, edge cases",
    },
    deployment: {
        emoji: "📦",
        name: "Deployment Mode",
        description: "Focus on release readiness, CI/CD",
    },
    maintenance: {
        emoji: "🔍",
        name: "Maintenance Mode",
        description: "Focus on ongoing health, improvements",
    },
};
class ModeAwareService extends events_1.EventEmitter {
    constructor(serverName) {
        super();
        this.currentMode = null;
        this.serverName = serverName;
        this.modeFile = path.join(process.cwd(), "development-modes", ".current_mode");
        this.modeChangeFile = path.join(process.cwd(), "logs", `${serverName}_mode.txt`);
        // Initialize mode
        this.detectCurrentMode();
        // Set up file watchers
        this.setupWatchers();
    }
    /**
     * Detect the current development mode from environment or files
     */
    detectCurrentMode() {
        try {
            // Check environment variable first
            if (process.env.DEVELOPMENT_MODE) {
                const envMode = process.env.DEVELOPMENT_MODE.toLowerCase();
                if (this.isValidMode(envMode)) {
                    this.setMode(envMode);
                    return;
                }
            }
            // Check command line arguments
            const modeIndex = process.argv.indexOf("--mode");
            if (modeIndex !== -1 && modeIndex < process.argv.length - 1) {
                const argMode = process.argv[modeIndex + 1].toLowerCase();
                if (this.isValidMode(argMode)) {
                    this.setMode(argMode);
                    return;
                }
            }
            // Check mode file
            if (fs.existsSync(this.modeFile)) {
                const fileMode = fs
                    .readFileSync(this.modeFile, "utf8")
                    .trim()
                    .toLowerCase();
                if (this.isValidMode(fileMode)) {
                    this.setMode(fileMode);
                    return;
                }
            }
            // Check mode change file
            if (fs.existsSync(this.modeChangeFile)) {
                const changeFileMode = fs
                    .readFileSync(this.modeChangeFile, "utf8")
                    .trim()
                    .toLowerCase();
                if (this.isValidMode(changeFileMode)) {
                    this.setMode(changeFileMode);
                    return;
                }
            }
            // Default to engineering mode if not found
            this.setMode("engineering");
        }
        catch (err) {
            console.error(`[${this.serverName}] Error detecting mode:`, err);
            this.setMode("engineering"); // Default fallback
        }
    }
    /**
     * Set the current mode and emit change event if different
     */
    setMode(mode) {
        if (this.currentMode !== mode) {
            const oldMode = this.currentMode;
            this.currentMode = mode;
            console.log(`[${this.serverName}] Mode ${oldMode ? "changed from " + oldMode + " to " : "set to "}${mode}`);
            this.emit("modeChanged", {
                oldMode,
                newMode: mode,
                modeInfo: exports.AVAILABLE_MODES[mode],
            });
        }
    }
    /**
     * Check if the mode is valid
     */
    isValidMode(mode) {
        return Object.keys(exports.AVAILABLE_MODES).includes(mode);
    }
    /**
     * Set up file watchers to detect mode changes
     */
    setupWatchers() {
        try {
            // Check if the main mode file exists, if not, ensure the directory exists
            const modeDir = path.dirname(this.modeFile);
            if (!fs.existsSync(modeDir)) {
                fs.mkdirSync(modeDir, { recursive: true });
            }
            // Check if logs directory exists
            const logDir = path.dirname(this.modeChangeFile);
            if (!fs.existsSync(logDir)) {
                fs.mkdirSync(logDir, { recursive: true });
            }
            // Watch the mode file for changes
            if (fs.existsSync(this.modeFile)) {
                fs.watchFile(this.modeFile, () => {
                    this.detectCurrentMode();
                });
            }
            // Watch the mode change file for this server
            if (!fs.existsSync(this.modeChangeFile)) {
                fs.writeFileSync(this.modeChangeFile, this.currentMode || "engineering");
            }
            fs.watchFile(this.modeChangeFile, () => {
                this.detectCurrentMode();
            });
            console.log(`[${this.serverName}] Mode change detection enabled`);
        }
        catch (err) {
            console.error(`[${this.serverName}] Error setting up mode watchers:`, err);
        }
    }
    /**
     * Get current mode information
     */
    getCurrentMode() {
        if (!this.currentMode) {
            return {
                mode: "engineering",
                ...exports.AVAILABLE_MODES.engineering,
            };
        }
        return {
            mode: this.currentMode,
            ...exports.AVAILABLE_MODES[this.currentMode],
        };
    }
    /**
     * Apply mode-specific optimizations for a service
     */
    getOptimizationsForService(serviceName) {
        if (!this.currentMode) {
            return {
                cachingStrategy: "default",
                priorityLevel: "normal",
                verboseLogging: false,
                resourceAllocation: "balanced",
            };
        }
        const optimizations = {
            cachingStrategy: "default",
            priorityLevel: "normal",
            verboseLogging: false,
            resourceAllocation: "balanced",
        };
        switch (this.currentMode) {
            case "design":
                // Design mode optimizations
                optimizations.cachingStrategy = serviceName.includes("prompt")
                    ? "aggressive"
                    : "default";
                optimizations.priorityLevel = serviceName.includes("prompt")
                    ? "high"
                    : "normal";
                optimizations.resourceAllocation = "user-interface";
                break;
            case "engineering":
                // Engineering mode optimizations
                optimizations.cachingStrategy = "aggressive";
                optimizations.priorityLevel = "high";
                optimizations.resourceAllocation = "computation";
                break;
            case "testing":
                // Testing mode optimizations
                optimizations.verboseLogging = true;
                optimizations.cachingStrategy = "minimal";
                optimizations.resourceAllocation = "balanced";
                break;
            case "deployment":
                // Deployment mode optimizations
                optimizations.cachingStrategy = "persistent";
                optimizations.verboseLogging = false;
                optimizations.resourceAllocation = "efficiency";
                break;
            case "maintenance":
                // Maintenance mode optimizations
                optimizations.verboseLogging = true;
                optimizations.cachingStrategy = "analytics";
                optimizations.resourceAllocation = "diagnostic";
                break;
        }
        return optimizations;
    }
    /**
     * Clean up resources on shutdown
     */
    cleanup() {
        fs.unwatchFile(this.modeFile);
        fs.unwatchFile(this.modeChangeFile);
    }
}
exports.ModeAwareService = ModeAwareService;
//# sourceMappingURL=mode-aware.js.map