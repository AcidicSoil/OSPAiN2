"use strict";
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
exports.StatusBarManager = void 0;
const vscode = __importStar(require("vscode"));
class StatusBarManager {
    constructor(context, modeManager) {
        this.context = context;
        this.modeManager = modeManager;
        // Create status bar items
        this.modeStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
        this.tokenStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 99);
        // Add status bar items to subscriptions
        this.context.subscriptions.push(this.modeStatusBarItem);
        this.context.subscriptions.push(this.tokenStatusBarItem);
        // Listen for mode changes
        this.modeManager.on('modeChanged', (event) => {
            this.updateModeStatus(event.current);
        });
    }
    initialize() {
        // Set up initial values
        this.updateModeStatus(this.modeManager.getCurrentMode());
        this.updateTokenStatus();
        // Show status bar items
        this.modeStatusBarItem.show();
        this.tokenStatusBarItem.show();
    }
    updateModeStatus(mode) {
        const icon = this.modeManager.getCurrentModeIcon();
        this.modeStatusBarItem.text = `${icon} ${mode}`;
        this.modeStatusBarItem.tooltip = `Current development mode: ${mode}`;
        this.modeStatusBarItem.command = 'cody.switchMode';
    }
    updateTokenStatus(usagePercentage) {
        if (usagePercentage === undefined) {
            // Don't show until we have data
            this.tokenStatusBarItem.text = `$(sync) API`;
            this.tokenStatusBarItem.tooltip = 'API usage statistics loading...';
            return;
        }
        // Show token usage with icon based on percentage
        let icon = '$(check)';
        if (usagePercentage >= 90) {
            icon = '$(error)';
        }
        else if (usagePercentage >= 75) {
            icon = '$(warning)';
        }
        else if (usagePercentage >= 50) {
            icon = '$(info)';
        }
        this.tokenStatusBarItem.text = `${icon} API: ${usagePercentage.toFixed(0)}%`;
        this.tokenStatusBarItem.tooltip = `API usage: ${usagePercentage.toFixed(1)}% of daily limit`;
    }
    /**
     * Shows a progress notification in the status bar
     */
    async showProgress(title, task) {
        return vscode.window.withProgress({
            location: vscode.ProgressLocation.Window,
            title,
            cancellable: false,
        }, task);
    }
    /**
     * Shows a temporary notification in the status bar
     */
    showTemporaryMessage(message, durationMs = 3000) {
        const tempStatusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 0);
        tempStatusBar.text = message;
        tempStatusBar.show();
        setTimeout(() => {
            tempStatusBar.dispose();
        }, durationMs);
    }
    /**
     * Updates the mode status bar with loading indicator
     */
    showModeLoading(mode) {
        const icon = this.modeManager.getModeIcon(mode);
        this.modeStatusBarItem.text = `$(sync~spin) ${icon} ${mode}`;
        this.modeStatusBarItem.tooltip = `Switching to ${mode} mode...`;
    }
    /**
     * Updates the mode status bar with success indicator and then reverts to normal
     */
    showModeSuccess(mode) {
        const icon = this.modeManager.getModeIcon(mode);
        this.modeStatusBarItem.text = `$(check) ${icon} ${mode}`;
        this.modeStatusBarItem.tooltip = `Successfully switched to ${mode} mode`;
        // Revert to normal after a delay
        setTimeout(() => {
            this.updateModeStatus(mode);
        }, 2000);
    }
    /**
     * Shows error status in the mode status bar and then reverts to normal
     */
    showModeError(mode, error) {
        const icon = this.modeManager.getModeIcon(mode);
        this.modeStatusBarItem.text = `$(error) ${icon} ${mode}`;
        this.modeStatusBarItem.tooltip = `Error switching to ${mode} mode: ${error}`;
        // Revert to normal after a delay
        setTimeout(() => {
            this.updateModeStatus(this.modeManager.getCurrentMode());
        }, 3000);
    }
}
exports.StatusBarManager = StatusBarManager;
//# sourceMappingURL=StatusBarManager.js.map