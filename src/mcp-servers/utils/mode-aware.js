/**
 * Mode Awareness Utility for MCP Servers
 *
 * This module provides utilities for MCP servers to detect and respond to
 * development mode changes. It handles mode detection, change notifications,
 * and mode-specific optimizations.
 */

const fs = require("fs");
const path = require("path");
const { EventEmitter } = require("events");

// Mode constants
const AVAILABLE_MODES = {
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

class ModeAwareService extends EventEmitter {
  constructor(serverName) {
    super();
    this.serverName = serverName;
    this.currentMode = null;
    this.modeFile = path.join(
      process.cwd(),
      "development-modes",
      ".current_mode"
    );
    this.modeChangeFile = path.join(
      process.cwd(),
      "logs",
      `${serverName}_mode.txt`
    );

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
    } catch (err) {
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
      console.log(
        `[${this.serverName}] Mode ${
          oldMode ? "changed from " + oldMode + " to " : "set to "
        }${mode}`
      );
      this.emit("modeChanged", {
        oldMode,
        newMode: mode,
        modeInfo: AVAILABLE_MODES[mode],
      });
    }
  }

  /**
   * Check if the mode is valid
   */
  isValidMode(mode) {
    return Object.keys(AVAILABLE_MODES).includes(mode);
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
        fs.writeFileSync(
          this.modeChangeFile,
          this.currentMode || "engineering"
        );
      }

      fs.watchFile(this.modeChangeFile, () => {
        this.detectCurrentMode();
      });

      console.log(`[${this.serverName}] Mode change detection enabled`);
    } catch (err) {
      console.error(
        `[${this.serverName}] Error setting up mode watchers:`,
        err
      );
    }
  }

  /**
   * Get current mode information
   */
  getCurrentMode() {
    return {
      mode: this.currentMode,
      ...AVAILABLE_MODES[this.currentMode],
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

module.exports = {
  ModeAwareService,
  AVAILABLE_MODES,
};
