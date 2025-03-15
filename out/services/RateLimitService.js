"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimitService = void 0;
const events_1 = require("events");
class RateLimitService extends events_1.EventEmitter {
    constructor(config) {
        super();
        this.usageHistory = [];
        this.currentMinuteTokens = 0;
        this.currentHourTokens = 0;
        this.currentDayTokens = 0;
        this.config = {
            maxTokensPerMinute: config?.maxTokensPerMinute || 1000,
            maxTokensPerHour: config?.maxTokensPerHour || 10000,
            maxTokensPerDay: config?.maxTokensPerDay || 100000,
            modeSpecificLimits: {
                design: {
                    maxTokensPerMinute: config?.modeSpecificLimits?.design?.maxTokensPerMinute || 800,
                    maxTokensPerHour: config?.modeSpecificLimits?.design?.maxTokensPerHour || 8000,
                },
                engineering: {
                    maxTokensPerMinute: config?.modeSpecificLimits?.engineering?.maxTokensPerMinute || 1200,
                    maxTokensPerHour: config?.modeSpecificLimits?.engineering?.maxTokensPerHour || 12000,
                },
                testing: {
                    maxTokensPerMinute: config?.modeSpecificLimits?.testing?.maxTokensPerMinute || 600,
                    maxTokensPerHour: config?.modeSpecificLimits?.testing?.maxTokensPerHour || 6000,
                },
            },
        };
        // Start cleanup interval
        setInterval(() => this.cleanupOldUsage(), 60000); // Clean up every minute
    }
    async checkRateLimit(tokens, mode) {
        const now = Date.now();
        this.cleanupOldUsage(now);
        // Check global limits
        if (this.currentMinuteTokens + tokens > this.config.maxTokensPerMinute) {
            this.emit("rateLimitExceeded", {
                type: "minute",
                current: this.currentMinuteTokens,
                limit: this.config.maxTokensPerMinute,
                mode,
            });
            return false;
        }
        if (this.currentHourTokens + tokens > this.config.maxTokensPerHour) {
            this.emit("rateLimitExceeded", {
                type: "hour",
                current: this.currentHourTokens,
                limit: this.config.maxTokensPerHour,
                mode,
            });
            return false;
        }
        if (this.currentDayTokens + tokens > this.config.maxTokensPerDay) {
            this.emit("rateLimitExceeded", {
                type: "day",
                current: this.currentDayTokens,
                limit: this.config.maxTokensPerDay,
                mode,
            });
            return false;
        }
        // Check mode-specific limits
        const modeLimits = this.config.modeSpecificLimits[mode];
        const modeMinuteUsage = this.getModeUsage(mode, "minute");
        const modeHourUsage = this.getModeUsage(mode, "hour");
        if (modeMinuteUsage + tokens > modeLimits.maxTokensPerMinute) {
            this.emit("modeRateLimitExceeded", {
                type: "minute",
                mode,
                current: modeMinuteUsage,
                limit: modeLimits.maxTokensPerMinute,
            });
            return false;
        }
        if (modeHourUsage + tokens > modeLimits.maxTokensPerHour) {
            this.emit("modeRateLimitExceeded", {
                type: "hour",
                mode,
                current: modeHourUsage,
                limit: modeLimits.maxTokensPerHour,
            });
            return false;
        }
        return true;
    }
    async recordUsage(tokens, mode) {
        const now = Date.now();
        this.usageHistory.push({ timestamp: now, tokens, mode });
        // Update counters
        this.currentMinuteTokens += tokens;
        this.currentHourTokens += tokens;
        this.currentDayTokens += tokens;
        // Emit usage event
        this.emit("usageRecorded", {
            tokens,
            mode,
            currentMinute: this.currentMinuteTokens,
            currentHour: this.currentHourTokens,
            currentDay: this.currentDayTokens,
        });
    }
    cleanupOldUsage(now = Date.now()) {
        const oneMinuteAgo = now - 60000;
        const oneHourAgo = now - 3600000;
        const oneDayAgo = now - 86400000;
        // Remove old usage records
        this.usageHistory = this.usageHistory.filter((usage) => usage.timestamp > oneDayAgo);
        // Recalculate current usage
        this.currentMinuteTokens = this.usageHistory
            .filter((usage) => usage.timestamp > oneMinuteAgo)
            .reduce((sum, usage) => sum + usage.tokens, 0);
        this.currentHourTokens = this.usageHistory
            .filter((usage) => usage.timestamp > oneHourAgo)
            .reduce((sum, usage) => sum + usage.tokens, 0);
        this.currentDayTokens = this.usageHistory
            .filter((usage) => usage.timestamp > oneDayAgo)
            .reduce((sum, usage) => sum + usage.tokens, 0);
    }
    getModeUsage(mode, period) {
        const now = Date.now();
        const timeAgo = period === "minute" ? 60000 : 3600000;
        return this.usageHistory
            .filter((usage) => usage.mode === mode && usage.timestamp > now - timeAgo)
            .reduce((sum, usage) => sum + usage.tokens, 0);
    }
    // Public methods for monitoring
    getCurrentUsage() {
        return {
            minute: this.currentMinuteTokens,
            hour: this.currentHourTokens,
            day: this.currentDayTokens,
        };
    }
    getModeUsage(mode) {
        return {
            minute: this.getModeUsage(mode, "minute"),
            hour: this.getModeUsage(mode, "hour"),
        };
    }
    getUsageHistory() {
        return [...this.usageHistory];
    }
    async resetUsage() {
        this.usageHistory = [];
        this.currentMinuteTokens = 0;
        this.currentHourTokens = 0;
        this.currentDayTokens = 0;
    }
}
exports.RateLimitService = RateLimitService;
//# sourceMappingURL=RateLimitService.js.map