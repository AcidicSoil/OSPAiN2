"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DebugMcpService {
    constructor() {
        this.currentSession = null;
        this.logListeners = [];
        this.isInitialized = false;
    }
    static getInstance() {
        if (!DebugMcpService.instance) {
            DebugMcpService.instance = new DebugMcpService();
        }
        return DebugMcpService.instance;
    }
    initialize() {
        if (this.isInitialized)
            return;
        this.isInitialized = true;
        this.startNewSession();
    }
    shutdown() {
        this.isInitialized = false;
        this.currentSession = null;
    }
    getCurrentSession() {
        return this.currentSession;
    }
    startNewSession() {
        const session = {
            id: Date.now().toString(),
            startTime: new Date(),
            logs: [],
        };
        this.currentSession = session;
        return session;
    }
    endCurrentSession() {
        if (this.currentSession) {
            this.currentSession.endTime = new Date();
        }
        this.currentSession = null;
    }
    async getLogs({ sessionId }) {
        const sessions = await this.getSessions();
        const session = sessions.find((s) => s.id === sessionId);
        return session?.logs || [];
    }
    async getSessions() {
        // In a real implementation, this would fetch from storage
        return this.currentSession ? [this.currentSession] : [];
    }
    onLog(callback) {
        this.logListeners.push(callback);
        return () => {
            this.logListeners = this.logListeners.filter((cb) => cb !== callback);
        };
    }
    async setupTurboPack() {
        // Implementation for turbopack setup
        console.log("Setting up TurboPack...");
    }
}
exports.default = DebugMcpService.getInstance();
//# sourceMappingURL=DebugMcpService.js.map