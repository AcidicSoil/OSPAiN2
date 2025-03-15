"use strict";
/**
 * Mode Synchronization Service
 *
 * This service ensures that the development mode is synchronized across all components:
 * - Terminal sessions
 * - Chat windows
 * - IDE components
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
exports.getCurrentMode = getCurrentMode;
exports.setMode = setMode;
exports.syncMode = syncMode;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// Configuration
const CONFIG = {
    modesPath: path.resolve(process.cwd(), "development-modes"),
    currentModeFile: path.resolve(process.cwd(), ".current_mode"),
    chatConfigDir: path.resolve(process.cwd(), ".cursor"),
    chatConfigFile: path.resolve(process.cwd(), ".cursor", "chat_config.json"),
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
};
/**
 * Gets the current active mode
 * @returns The current mode and its emoji
 */
function getCurrentMode() {
    try {
        if (fs.existsSync(CONFIG.currentModeFile)) {
            const mode = fs.readFileSync(CONFIG.currentModeFile, "utf-8").trim();
            if (CONFIG.availableModes.includes(mode)) {
                return {
                    mode,
                    emoji: CONFIG.modeEmojis[mode] || "❓",
                };
            }
        }
        return { mode: "No active mode", emoji: "❓" };
    }
    catch (error) {
        console.error("Error getting current mode:", error);
        return { mode: "Error", emoji: "⚠️" };
    }
}
/**
 * Sets the current mode
 * @param mode The mode to set
 * @returns Success status and message
 */
function setMode(mode) {
    try {
        if (!CONFIG.availableModes.includes(mode)) {
            return {
                success: false,
                message: `Invalid mode: ${mode}. Available modes: ${CONFIG.availableModes.join(", ")}`,
            };
        }
        fs.writeFileSync(CONFIG.currentModeFile, mode);
        updateChatConfig();
        return { success: true, message: `Mode set to ${mode}` };
    }
    catch (error) {
        console.error("Error setting mode:", error);
        return { success: false, message: `Error setting mode: ${error}` };
    }
}
/**
 * Updates the chat configuration based on the current mode
 */
function updateChatConfig() {
    try {
        const { mode, emoji } = getCurrentMode();
        // Create the .cursor directory if it doesn't exist
        if (!fs.existsSync(CONFIG.chatConfigDir)) {
            fs.mkdirSync(CONFIG.chatConfigDir, { recursive: true });
        }
        // Read or create chat config
        let chatConfig = {};
        if (fs.existsSync(CONFIG.chatConfigFile)) {
            const configContent = fs.readFileSync(CONFIG.chatConfigFile, "utf-8");
            try {
                chatConfig = JSON.parse(configContent);
            }
            catch (error) {
                console.warn("Invalid chat config, creating new one");
            }
        }
        // Update the mode in the chat config
        chatConfig.currentMode = mode;
        chatConfig.modeEmoji = emoji;
        chatConfig.lastUpdated = new Date().toISOString();
        // Write the updated config
        fs.writeFileSync(CONFIG.chatConfigFile, JSON.stringify(chatConfig, null, 2), "utf-8");
        console.log(`Chat configuration updated with mode: ${mode} ${emoji}`);
    }
    catch (error) {
        console.error("Error updating chat config:", error);
    }
}
/**
 * Synchronizes the mode across all components
 */
function syncMode() {
    try {
        const { mode, emoji } = getCurrentMode();
        console.log(`Synchronizing mode: ${mode} ${emoji}`);
        // Update chat config
        updateChatConfig();
        // Emit a mode changed event (for future use)
        emitModeChangedEvent(mode, emoji);
        console.log("Mode synchronization completed successfully");
    }
    catch (error) {
        console.error("Error during mode synchronization:", error);
    }
}
/**
 * Emits a mode changed event (placeholder for future implementation)
 */
function emitModeChangedEvent(mode, emoji) {
    // This would be implemented to use an EventEmitter or similar
    // For now, just log the event
    console.log(`Mode changed event: ${mode} ${emoji}`);
}
// Main execution
function main() {
    const args = process.argv.slice(2);
    const command = args[0];
    if (command === "get") {
        const { mode, emoji } = getCurrentMode();
        console.log(`Current mode: ${mode} ${emoji}`);
    }
    else if (command === "set" && args[1]) {
        const result = setMode(args[1]);
        console.log(result.message);
    }
    else if (command === "sync") {
        syncMode();
    }
    else {
        // Default action: sync mode
        syncMode();
    }
}
// Run the main function
main();
//# sourceMappingURL=mode-sync-service.js.map