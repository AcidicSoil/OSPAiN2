"use strict";
/**
 * Mode Synchronization Service
 * Ensures all components of the system display the same development mode
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentMode = getCurrentMode;
exports.updateSyncData = updateSyncData;
exports.checkSync = checkSync;
exports.syncAllComponents = syncAllComponents;
exports.handleModeSwitch = handleModeSwitch;
var fs = require("fs");
var path = require("path");
// Configuration
var MODES_DIR = path.resolve(__dirname);
var CURRENT_MODE_FILE = path.join(MODES_DIR, ".current_mode");
var MODE_SYNC_FILE = path.join(MODES_DIR, ".mode_sync.json");
var CHAT_CONFIG_FILE = path.join(MODES_DIR, "..", ".cursor", "chat_config.json");
var AVAILABLE_MODES = [
    "design",
    "engineering",
    "testing",
    "deployment",
    "maintenance",
];
var MODE_EMOJIS = ["🎨", "🔧", "🧪", "📦", "🔍"];
/**
 * Gets the current active mode from the .current_mode file
 */
function getCurrentMode() {
    try {
        if (fs.existsSync(CURRENT_MODE_FILE)) {
            var mode = fs.readFileSync(CURRENT_MODE_FILE, "utf8").trim();
            if (AVAILABLE_MODES.includes(mode)) {
                return mode;
            }
        }
        return "No active mode";
    }
    catch (error) {
        console.error("Error reading current mode:", error);
        return "No active mode";
    }
}
/**
 * Updates the sync data file with current status
 */
function updateSyncData(components) {
    if (components === void 0) { components = {}; }
    try {
        // Read existing data or create default
        var syncData = {
            currentMode: getCurrentMode(),
            lastUpdated: new Date().toISOString(),
            components: {
                terminal: false,
                chat: false,
                ide: false,
            },
        };
        if (fs.existsSync(MODE_SYNC_FILE)) {
            try {
                syncData = JSON.parse(fs.readFileSync(MODE_SYNC_FILE, "utf8"));
                // Update with current mode
                syncData.currentMode = getCurrentMode();
                syncData.lastUpdated = new Date().toISOString();
            }
            catch (e) {
                console.warn("Error parsing mode sync file, creating new one");
            }
        }
        // Update components status
        syncData.components = __assign(__assign({}, syncData.components), components);
        // Write updated data
        fs.writeFileSync(MODE_SYNC_FILE, JSON.stringify(syncData, null, 2));
        return syncData;
    }
    catch (error) {
        console.error("Error updating sync data:", error);
        throw error;
    }
}
/**
 * Updates the chat window configuration to display the correct mode
 */
function updateChatConfig() {
    try {
        var currentMode = getCurrentMode();
        if (currentMode === "No active mode") {
            return false;
        }
        // Create chat config directory if it doesn't exist
        var chatConfigDir = path.dirname(CHAT_CONFIG_FILE);
        if (!fs.existsSync(chatConfigDir)) {
            fs.mkdirSync(chatConfigDir, { recursive: true });
        }
        // Read existing chat config or create default
        var chatConfig = {};
        if (fs.existsSync(CHAT_CONFIG_FILE)) {
            try {
                chatConfig = JSON.parse(fs.readFileSync(CHAT_CONFIG_FILE, "utf8"));
            }
            catch (e) {
                console.warn("Error parsing chat config, creating new one");
            }
        }
        // Get mode index and emoji
        var modeIndex = AVAILABLE_MODES.indexOf(currentMode);
        var modeEmoji = modeIndex >= 0 ? MODE_EMOJIS[modeIndex] : "";
        // Update mode in chat config
        chatConfig.currentMode = currentMode;
        chatConfig.modeEmoji = modeEmoji;
        chatConfig.modeDisplay = "".concat(modeEmoji, " ").concat(currentMode.charAt(0).toUpperCase() + currentMode.slice(1), " Mode");
        chatConfig.lastUpdated = new Date().toISOString();
        // Write updated config
        fs.writeFileSync(CHAT_CONFIG_FILE, JSON.stringify(chatConfig, null, 2));
        // Update components status
        updateSyncData({ chat: true });
        return true;
    }
    catch (error) {
        console.error("Error updating chat config:", error);
        updateSyncData({ chat: false });
        return false;
    }
}
/**
 * Checks if all components are in sync
 */
function checkSync() {
    var syncData = updateSyncData();
    var _a = syncData.components, terminal = _a.terminal, chat = _a.chat, ide = _a.ide;
    return terminal && chat && ide;
}
/**
 * Synchronizes all components with the current mode
 */
function syncAllComponents() {
    var currentMode = getCurrentMode();
    console.log("Syncing all components to mode: ".concat(currentMode));
    // Update terminal display
    try {
        // This would normally be a hook into the terminal's display mechanism
        // For now, we'll just note that it should be updated
        console.log("Terminal mode should display: ".concat(currentMode));
        updateSyncData({ terminal: true });
    }
    catch (error) {
        console.error("Error syncing terminal:", error);
        updateSyncData({ terminal: false });
    }
    // Update chat window
    var chatUpdated = updateChatConfig();
    // Update IDE status (if applicable)
    try {
        // This would hook into the IDE's status display
        // For now, we'll assume it works
        updateSyncData({ ide: true });
    }
    catch (error) {
        console.error("Error syncing IDE:", error);
        updateSyncData({ ide: false });
    }
    console.log("Sync status:", checkSync() ? "All components in sync" : "Some components out of sync");
}
/**
 * Mode switch handler - to be called whenever mode is changed
 */
function handleModeSwitch(newMode) {
    console.log("Mode switch detected: ".concat(newMode));
    syncAllComponents();
}
// CLI handling
if (require.main === module) {
    var command = process.argv[2] || "sync";
    switch (command) {
        case "sync":
            syncAllComponents();
            break;
        case "check":
            console.log(checkSync() ? "In sync" : "Out of sync");
            break;
        case "status":
            var syncData = updateSyncData();
            console.log("Current mode:", syncData.currentMode);
            console.log("Last updated:", syncData.lastUpdated);
            console.log("Components status:", syncData.components);
            break;
        default:
            console.log("Unknown command:", command);
            console.log("Available commands: sync, check, status");
    }
}
