/**
 * Mode Awareness Utility for MCP Servers
 *
 * This module provides utilities for MCP servers to detect and respond to
 * development mode changes. It handles mode detection, change notifications,
 * and mode-specific optimizations.
 */

import * as fs from "fs";
import * as path from "path";
import { EventEmitter } from "events";

export interface ModeInfo {
  emoji: string;
  name: string;
  description: string;
}

export type DevelopmentMode =
  | "design"
  | "engineering"
  | "testing"
  | "deployment"
  | "maintenance";

export interface ModeChangeEvent {
  oldMode: DevelopmentMode | null;
  newMode: DevelopmentMode;
  modeInfo: ModeInfo;
}

export interface Optimizations {
  cachingStrategy:
    | "default"
    | "aggressive"
    | "minimal"
    | "persistent"
    | "analytics";
  priorityLevel: "normal" | "high" | "low";
  verboseLogging: boolean;
  resourceAllocation:
    | "balanced"
    | "user-interface"
    | "computation"
    | "efficiency"
    | "diagnostic";
}

// Mode constants
export const AVAILABLE_MODES: Record<DevelopmentMode, ModeInfo> = {
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

export class ModeAwareService extends EventEmitter {
  private serverName: string;
  private currentMode: DevelopmentMode | null = null;
  private modeFile: string;
  private modeChangeFile: string;

  constructor(serverName: string) {
    super();
    this.serverName = serverName;
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
  public detectCurrentMode(): void {
    try {
      // Check environment variable first
      if (process.env.DEVELOPMENT_MODE) {
        const envMode = process.env.DEVELOPMENT_MODE.toLowerCase();
        if (this.isValidMode(envMode)) {
          this.setMode(envMode as DevelopmentMode);
          return;
        }
      }

      // Check command line arguments
      const modeIndex = process.argv.indexOf("--mode");
      if (modeIndex !== -1 && modeIndex < process.argv.length - 1) {
        const argMode = process.argv[modeIndex + 1].toLowerCase();
        if (this.isValidMode(argMode)) {
          this.setMode(argMode as DevelopmentMode);
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
          this.setMode(fileMode as DevelopmentMode);
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
          this.setMode(changeFileMode as DevelopmentMode);
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
  public setMode(mode: DevelopmentMode): void {
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
      } as ModeChangeEvent);
    }
  }

  /**
   * Check if the mode is valid
   */
  public isValidMode(mode: string): boolean {
    return Object.keys(AVAILABLE_MODES).includes(mode);
  }

  /**
   * Set up file watchers to detect mode changes
   */
  private setupWatchers(): void {
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
  public getCurrentMode(): { mode: DevelopmentMode } & ModeInfo {
    if (!this.currentMode) {
      return {
        mode: "engineering",
        ...AVAILABLE_MODES.engineering,
      };
    }

    return {
      mode: this.currentMode,
      ...AVAILABLE_MODES[this.currentMode],
    };
  }

  /**
   * Apply mode-specific optimizations for a service
   */
  public getOptimizationsForService(serviceName: string): Optimizations {
    if (!this.currentMode) {
      return {
        cachingStrategy: "default",
        priorityLevel: "normal",
        verboseLogging: false,
        resourceAllocation: "balanced",
      };
    }

    const optimizations: Optimizations = {
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
  public cleanup(): void {
    fs.unwatchFile(this.modeFile);
    fs.unwatchFile(this.modeChangeFile);
  }
}
