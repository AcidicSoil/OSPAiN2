/**
 * development-modes/test-mode-sync.js
 *
 * Test script for validating the mode synchronization system.
 * This script allows you to test mode detection, switching, and synchronization.
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Import the mode-aware service
let ModeAwareService;
try {
  // Try to import the TypeScript version using ts-node
  ModeAwareService =
    require("../mcp-servers/utils/mode-aware").ModeAwareService;
  console.log("Using TypeScript ModeAwareService implementation");
} catch (error) {
  console.error("Error importing TypeScript ModeAwareService:", error.message);
  console.log("Falling back to direct implementation...");

  // Simplified mode-aware service for testing
  const EventEmitter = require("events");

  class ModeAwareService extends EventEmitter {
    constructor(serviceName) {
      super();
      this.serviceName = serviceName;
      this.modesPath = path.join(process.cwd(), "development-modes");
      this.modeFile = path.join(this.modesPath, ".current_mode");
      console.log(`Initialized test mode service for: ${serviceName}`);
    }

    getCurrentMode() {
      try {
        if (fs.existsSync(this.modeFile)) {
          const mode = fs.readFileSync(this.modeFile, "utf8").trim();
          return {
            mode,
            name: this.getModeName(mode),
            emoji: this.getModeEmoji(mode),
          };
        }
      } catch (error) {
        console.error("Error reading mode file:", error);
      }
      return { mode: "engineering", name: "Engineering", emoji: "🔧" };
    }

    getModeName(mode) {
      const names = {
        design: "Design",
        engineering: "Engineering",
        testing: "Testing",
        deployment: "Deployment",
        maintenance: "Maintenance",
      };
      return names[mode] || "Unknown";
    }

    getModeEmoji(mode) {
      const emojis = {
        design: "🎨",
        engineering: "🔧",
        testing: "🧪",
        deployment: "📦",
        maintenance: "🔍",
      };
      return emojis[mode] || "❓";
    }
  }
}

/**
 * Test functions
 */
const tests = {
  detectCurrentMode: () => {
    const service = new ModeAwareService("test-script");
    const currentMode = service.getCurrentMode();
    console.log("\n=== Current Mode ===");
    console.log(`Mode: ${currentMode.mode}`);
    console.log(`Name: ${currentMode.name}`);
    console.log(`Emoji: ${currentMode.emoji}`);
    return currentMode;
  },

  testModeSwitch: async (newMode) => {
    console.log(`\n=== Switching Mode to ${newMode} ===`);

    // Get current mode before switch
    const service = new ModeAwareService("test-script");
    const beforeMode = service.getCurrentMode();
    console.log(`Before: ${beforeMode.mode} ${beforeMode.emoji}`);

    // Set up event listener
    const modeChanged = new Promise((resolve) => {
      service.once("modeChanged", (change) => {
        console.log("Mode change detected by event listener!");
        console.log(`From: ${change.oldMode || "none"}`);
        console.log(`To: ${change.newMode} ${service.getCurrentMode().emoji}`);
        resolve(change);
      });

      // Timeout after 5 seconds
      setTimeout(() => resolve(null), 5000);
    });

    // Switch mode based on OS
    const isWindows = process.platform === "win32";
    try {
      if (isWindows) {
        console.log("Using PowerShell mode switcher...");
        execSync(
          `powershell -File "${path.join(
            process.cwd(),
            "development-modes",
            "mode-switch.ps1"
          )}" ${newMode}`,
          {
            stdio: "inherit",
          }
        );
      } else {
        console.log("Using Bash mode switcher...");
        execSync(
          `bash "${path.join(
            process.cwd(),
            "development-modes",
            "mode-switch.sh"
          )}" ${newMode}`,
          {
            stdio: "inherit",
          }
        );
      }
      console.log("Mode switch command completed");
    } catch (error) {
      console.error("Error switching mode:", error.message);
    }

    // Wait for event or timeout
    const changeEvent = await modeChanged;
    if (!changeEvent) {
      console.log("No mode change event detected after 5 seconds");
    }

    // Get current mode after switch
    const afterMode = service.getCurrentMode();
    console.log(`After: ${afterMode.mode} ${afterMode.emoji}`);

    return {
      success: beforeMode.mode !== afterMode.mode && afterMode.mode === newMode,
      beforeMode,
      afterMode,
      eventDetected: !!changeEvent,
    };
  },

  testCursorIntegration: async () => {
    console.log("\n=== Testing Cursor IDE Integration ===");

    try {
      const cursorSyncPath = path.join(
        process.cwd(),
        ".cursor",
        "cursor-mode-sync.js"
      );
      if (!fs.existsSync(cursorSyncPath)) {
        console.log("Cursor mode sync script not found at:", cursorSyncPath);
        return { success: false, error: "Script not found" };
      }

      console.log("Loading Cursor mode sync script...");
      const cursorSync = require(cursorSyncPath);

      // Get mode from Cursor integration
      const cursorMode = await cursorSync.getCurrentMode();
      console.log("Cursor reports mode as:", cursorMode);

      // Compare with our direct detection
      const directMode = tests.detectCurrentMode();

      const isMatch = cursorMode.mode === directMode.mode;
      console.log(
        `Mode match between direct detection and Cursor: ${
          isMatch ? "YES ✅" : "NO ❌"
        }`
      );

      return {
        success: isMatch,
        cursorMode,
        directMode,
      };
    } catch (error) {
      console.error("Error testing Cursor integration:", error);
      return { success: false, error: error.message };
    }
  },

  runAllTests: async () => {
    console.log("=== Mode Synchronization System Test ===");
    console.log("Running comprehensive test suite...");

    // Test current mode detection
    console.log("\n--- Test 1: Current Mode Detection ---");
    const currentMode = tests.detectCurrentMode();

    // Test mode switching to each available mode
    const availableModes = [
      "design",
      "engineering",
      "testing",
      "deployment",
      "maintenance",
    ];
    let allSwitchesSuccessful = true;

    for (const mode of availableModes) {
      if (mode === currentMode.mode) continue; // Skip current mode

      console.log(
        `\n--- Test 2.${
          availableModes.indexOf(mode) + 1
        }: Switch to ${mode} ---`
      );
      const switchResult = await tests.testModeSwitch(mode);

      if (!switchResult.success) {
        allSwitchesSuccessful = false;
        console.log(`❌ Switch to ${mode} failed!`);
      } else {
        console.log(`✅ Switch to ${mode} successful!`);
      }
    }

    // Switch back to the original mode
    console.log("\n--- Test 3: Switch back to original mode ---");
    const switchBackResult = await tests.testModeSwitch(currentMode.mode);

    // Test Cursor integration
    console.log("\n--- Test 4: Cursor Integration ---");
    const cursorResult = await tests.testCursorIntegration();

    // Summary
    console.log("\n=== Test Summary ===");
    console.log(
      `Mode detection: ${
        currentMode.mode !== null ? "✅ Success" : "❌ Failed"
      }`
    );
    console.log(
      `Mode switching: ${
        allSwitchesSuccessful ? "✅ All successful" : "❌ Some failed"
      }`
    );
    console.log(
      `Switch back to original: ${
        switchBackResult.success ? "✅ Success" : "❌ Failed"
      }`
    );
    console.log(
      `Cursor integration: ${cursorResult.success ? "✅ Success" : "❌ Failed"}`
    );

    return {
      overallSuccess:
        currentMode.mode !== null &&
        allSwitchesSuccessful &&
        switchBackResult.success &&
        cursorResult.success,
      currentMode,
      switchResults: { allSwitchesSuccessful, switchBackResult },
      cursorResult,
    };
  },
};

/**
 * Command line argument processing
 */
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log(`
Mode Synchronization Test Script
--------------------------------
Usage:
  node test-mode-sync.js [command]

Commands:
  detect         - Detect and show current mode
  switch <mode>  - Switch to specified mode
  cursor         - Test Cursor IDE integration
  all            - Run all tests
  
Available modes: design, engineering, testing, deployment, maintenance
`);
} else {
  const command = args[0];
  switch (command) {
    case "detect":
      tests.detectCurrentMode();
      break;

    case "switch":
      if (args.length < 2) {
        console.log("Error: No mode specified for switch command");
        console.log("Usage: node test-mode-sync.js switch <mode>");
      } else {
        tests.testModeSwitch(args[1]);
      }
      break;

    case "cursor":
      tests.testCursorIntegration();
      break;

    case "all":
      tests.runAllTests();
      break;

    default:
      console.log(`Unknown command: ${command}`);
      break;
  }
}
