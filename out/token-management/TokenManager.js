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
exports.TokenManager = void 0;
const vscode = __importStar(require("vscode"));
const events_1 = require("events");
class TokenManager extends events_1.EventEmitter {
    constructor(context) {
        super();
        this.monitorInterval = null;
        this.lastRequestTime = 0;
        this.requestCount = 0;
        this.DEFAULT_RATE_LIMIT = 50; // requests per minute
        this.DEFAULT_TOKEN_LIMIT = 5000; // tokens per day
        this.context = context;
        this.usage = this.loadUsageFromStorage();
    }
    initialize() {
        // Set up monitoring interval
        const config = vscode.workspace.getConfiguration('cody');
        const monitorInterval = config.get('tokenManagement.monitorInterval', 30) * 1000;
        this.monitorInterval = setInterval(() => {
            this.checkUsage();
        }, monitorInterval);
        // Listen for configuration changes
        vscode.workspace.onDidChangeConfiguration((e) => {
            if (e.affectsConfiguration('cody.tokenManagement')) {
                this.updateConfiguration();
            }
        });
        // Check if we need to reset the daily counter
        this.checkDailyReset();
    }
    loadUsageFromStorage() {
        const storedUsage = this.context.globalState.get('cody.tokenUsage');
        if (storedUsage) {
            return {
                ...storedUsage,
                reset: new Date(storedUsage.reset),
            };
        }
        // Default initial state
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        return {
            total: this.DEFAULT_TOKEN_LIMIT,
            available: this.DEFAULT_TOKEN_LIMIT,
            usedToday: 0,
            reset: tomorrow,
        };
    }
    saveUsageToStorage() {
        this.context.globalState.update('cody.tokenUsage', this.usage);
    }
    updateConfiguration() {
        const config = vscode.workspace.getConfiguration('cody');
        const monitorInterval = config.get('tokenManagement.monitorInterval', 30) * 1000;
        // Update monitor interval
        if (this.monitorInterval) {
            clearInterval(this.monitorInterval);
        }
        this.monitorInterval = setInterval(() => {
            this.checkUsage();
        }, monitorInterval);
    }
    checkDailyReset() {
        const now = new Date();
        if (now >= this.usage.reset) {
            // Reset daily counter
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);
            this.usage.available = this.usage.total;
            this.usage.usedToday = 0;
            this.usage.reset = tomorrow;
            this.saveUsageToStorage();
            this.emit('usage-reset');
        }
    }
    checkUsage() {
        // Check daily reset
        this.checkDailyReset();
        // Check if we're approaching limits
        const config = vscode.workspace.getConfiguration('cody');
        const notificationThreshold = config.get('tokenManagement.notificationThreshold', 80);
        const usagePercentage = (this.usage.usedToday / this.usage.total) * 100;
        if (usagePercentage >= notificationThreshold) {
            vscode.window.showWarningMessage(`Token usage alert: You've used ${usagePercentage.toFixed(1)}% of your daily token limit.`);
            this.emit('limit-approaching', { percentage: usagePercentage });
        }
    }
    /**
     * Records token usage for a request
     */
    recordUsage(tokenCount) {
        this.usage.usedToday += tokenCount;
        this.usage.available = Math.max(0, this.usage.total - this.usage.usedToday);
        this.saveUsageToStorage();
        this.emit('usage-updated', this.getUsage());
        // Track request for rate limiting
        const now = Date.now();
        this.lastRequestTime = now;
        this.requestCount++;
        // Reset request count after 1 minute
        setTimeout(() => {
            this.requestCount--;
        }, 60000);
        this.checkUsage();
    }
    /**
     * Checks if a request can be made within rate limits
     */
    canMakeRequest() {
        const config = vscode.workspace.getConfiguration('cody');
        const rateLimit = config.get('tokenManagement.rateLimit', this.DEFAULT_RATE_LIMIT);
        return this.requestCount < rateLimit && this.usage.available > 0;
    }
    /**
     * Gets the current token usage
     */
    getUsage() {
        return { ...this.usage };
    }
    /**
     * Gets the time to wait before making another request (in ms)
     */
    getWaitTime() {
        if (this.canMakeRequest()) {
            return 0;
        }
        // If we're rate limited, calculate wait time based on last request
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        const waitTime = Math.max(0, 60000 - timeSinceLastRequest);
        return waitTime;
    }
    /**
     * Tries to auto-bypass rate limiting if enabled
     */
    async tryBypass() {
        const config = vscode.workspace.getConfiguration('cody');
        const autoBypass = config.get('tokenManagement.autoBypass', false);
        if (!autoBypass) {
            return false;
        }
        const bypassMethod = config.get('tokenManagement.bypassMethod', 'cache-optimization');
        switch (bypassMethod) {
            case 'cache-optimization':
                // Implement cache optimization logic
                this.emit('bypass-attempt', { method: bypassMethod, success: true });
                return true;
            case 'rate-adjust':
                // Implement rate adjustment logic
                this.emit('bypass-attempt', { method: bypassMethod, success: true });
                return true;
            default:
                this.emit('bypass-attempt', { method: bypassMethod, success: false });
                return false;
        }
    }
    /**
     * Manually resets token usage (for testing or emergency reset)
     */
    async manualReset() {
        const confirm = await vscode.window.showWarningMessage('Are you sure you want to reset token usage statistics?', { modal: true }, 'Reset');
        if (confirm === 'Reset') {
            // Reset usage
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);
            this.usage.available = this.usage.total;
            this.usage.usedToday = 0;
            this.usage.reset = tomorrow;
            this.saveUsageToStorage();
            this.emit('manual-reset');
            vscode.window.showInformationMessage('Token usage statistics have been reset.');
        }
    }
    dispose() {
        if (this.monitorInterval) {
            clearInterval(this.monitorInterval);
        }
    }
}
exports.TokenManager = TokenManager;
//# sourceMappingURL=TokenManager.js.map