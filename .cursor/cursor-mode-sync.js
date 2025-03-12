/**
 * .cursor/cursor-mode-sync.js
 *
 * Mode synchronization script for Cursor IDE.
 * Integrates with the Development Modes Framework to provide real-time mode awareness.
 */

const fs = require("fs");
const path = require("path");
const { EventEmitter } = require("events");

/**
 * Configuration for the mode synchronization
 */
const config = {
  modesPath: path.join(process.cwd(), "development-modes"),
  currentModeFile: ".current_mode",
  availableModes: [
    "design",
    "engineering",
    "testing",
    "deployment",
    "maintenance",
  ],
  modeEmojis: {
    design: "🎨",
    engineering: "🔧",
    testing: "🧪",
    deployment: "📦",
    maintenance: "🔍",
  },
  descriptions: {
    design: "Design Mode - UI/UX structuring, component architecture",
    engineering: "Engineering Mode - Core functionality, business logic",
    testing: "Testing Mode - Quality assurance, edge cases",
    deployment: "Deployment Mode - Release readiness, CI/CD",
    maintenance: "Maintenance Mode - Ongoing health, improvements",
  },
};

/**
 * Mode Synchronization Service for Cursor IDE
 */
class CursorModeSyncService extends EventEmitter {
  constructor() {
    super();
    this.currentMode = null;
    this.setupWatchers();
    this.detectCurrentMode();

    console.log(`[CursorModeSync] Initialized`);
    console.log(
      `[CursorModeSync] Current mode: ${this.currentMode?.mode || "None"} ${
        this.currentMode?.emoji || ""
      }`
    );
  }

  /**
   * Set up file watchers to detect mode changes
   */
  setupWatchers() {
    try {
      const modeFilePath = path.join(config.modesPath, config.currentModeFile);
      const dirPath = path.dirname(modeFilePath);

      if (fs.existsSync(dirPath)) {
        fs.watch(dirPath, (eventType, filename) => {
          if (filename === config.currentModeFile && eventType === "change") {
            this.handleModeFileChange();
          }
        });

        console.log(`[CursorModeSync] Watching for mode changes in ${dirPath}`);
      } else {
        console.log(`[CursorModeSync] Directory not found: ${dirPath}`);
      }
    } catch (error) {
      console.error(`[CursorModeSync] Error setting up watchers:`, error);
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
        emoji: newMode.emoji,
      });

      console.log(
        `[CursorModeSync] Mode changed from ${oldMode || "none"} to ${
          newMode.mode
        } ${newMode.emoji}`
      );
    }
  }

  /**
   * Detect the current development mode
   */
  detectCurrentMode() {
    try {
      const modeFilePath = path.join(config.modesPath, config.currentModeFile);

      if (fs.existsSync(modeFilePath)) {
        const mode = fs.readFileSync(modeFilePath, "utf8").trim().toLowerCase();

        if (config.availableModes.includes(mode)) {
          this.currentMode = {
            mode,
            emoji: config.modeEmojis[mode],
            description: config.descriptions[mode],
          };
          return this.currentMode;
        }
      }

      // Default to engineering if no valid mode found
      this.currentMode = {
        mode: "engineering",
        emoji: config.modeEmojis["engineering"],
        description: config.descriptions["engineering"],
      };
      return this.currentMode;
    } catch (error) {
      console.error(`[CursorModeSync] Error detecting mode:`, error);
      return { mode: "engineering", emoji: config.modeEmojis["engineering"] };
    }
  }

  /**
   * Get the current mode
   */
  getCurrentMode() {
    return this.detectCurrentMode();
  }

  /**
   * Set the development mode
   */
  setMode(newMode) {
    if (!config.availableModes.includes(newMode)) {
      console.error(`[CursorModeSync] Invalid mode: ${newMode}`);
      return { success: false, message: `Invalid mode: ${newMode}` };
    }

    try {
      const modeFilePath = path.join(config.modesPath, config.currentModeFile);
      fs.writeFileSync(modeFilePath, newMode);

      // We don't need to call detectCurrentMode() or emit events here
      // as the file watcher will detect the change and call handleModeFileChange()

      return {
        success: true,
        message: `Mode set to ${newMode} ${config.modeEmojis[newMode]}`,
      };
    } catch (error) {
      console.error(`[CursorModeSync] Error setting mode:`, error);
      return {
        success: false,
        message: `Error setting mode: ${error.message}`,
      };
    }
  }
}

// Create instance
const cursorModeSync = new CursorModeSyncService();

/**
 * Export MCP service handlers
 */
module.exports = {
  // Event handler
  onModeChanged: (callback) => {
    cursorModeSync.on("modeChanged", callback);
    return () => cursorModeSync.off("modeChanged", callback);
  },

  // Tool handlers
  getCurrentMode: async () => {
    const mode = cursorModeSync.getCurrentMode();
    return {
      mode: mode.mode,
      emoji: mode.emoji,
      description: mode.description,
    };
  },

  setMode: async ({ mode }) => {
    return cursorModeSync.setMode(mode);
  },
};
