"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextManager = void 0;
const events_1 = require("events");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
class ContextManager extends events_1.EventEmitter {
    constructor(contextDir = path_1.default.join(process.cwd(), ".cursor", "contexts")) {
        super();
        this.contextStore = new Map();
        this.contextDir = contextDir;
        this.initializeContextDir();
    }
    async initializeContextDir() {
        try {
            await fs_1.promises.mkdir(this.contextDir, { recursive: true });
            await this.loadPersistedContexts();
        }
        catch (error) {
            console.error("Failed to initialize context directory:", error);
            throw new Error("Context initialization failed");
        }
    }
    async loadPersistedContexts() {
        try {
            const files = await fs_1.promises.readdir(this.contextDir);
            for (const file of files) {
                if (file.endsWith(".json")) {
                    const contextId = path_1.default.basename(file, ".json");
                    const content = await fs_1.promises.readFile(path_1.default.join(this.contextDir, file), "utf-8");
                    const context = JSON.parse(content);
                    this.contextStore.set(contextId, context);
                }
            }
        }
        catch (error) {
            console.error("Failed to load persisted contexts:", error);
            throw new Error("Context loading failed");
        }
    }
    async persistContext(contextId, context) {
        try {
            const filePath = path_1.default.join(this.contextDir, `${contextId}.json`);
            await fs_1.promises.writeFile(filePath, JSON.stringify(context, null, 2));
        }
        catch (error) {
            console.error("Failed to persist context:", error);
            throw new Error("Context persistence failed");
        }
    }
    async preserveContext(fromMode) {
        try {
            const context = {
                timestamp: Date.now(),
                mode: fromMode,
                activeFiles: await this.getActiveFiles(),
                workspaceState: await this.captureWorkspaceState(),
                aiContext: await this.captureAIContext(),
                metadata: {
                    lastModified: Date.now(),
                    contextId: `${fromMode}-${Date.now()}`,
                    parentContextId: this.currentContextId,
                },
            };
            const contextId = context.metadata.contextId;
            this.contextStore.set(contextId, context);
            await this.persistContext(contextId, context);
            this.currentContextId = contextId;
            this.emit("contextPreserved", { contextId, fromMode });
            return contextId;
        }
        catch (error) {
            console.error("Failed to preserve context:", error);
            throw new Error("Context preservation failed");
        }
    }
    async restoreContext(toMode, contextId) {
        try {
            const context = this.contextStore.get(contextId);
            if (!context) {
                throw new Error(`Context ${contextId} not found`);
            }
            // Apply context to new mode
            await this.applyWorkspaceState(context.workspaceState);
            await this.openRelevantFiles(context.activeFiles);
            await this.restoreAIContext(context.aiContext);
            this.currentContextId = contextId;
            this.emit("contextRestored", { contextId, toMode });
            return true;
        }
        catch (error) {
            console.error("Failed to restore context:", error);
            throw new Error("Context restoration failed");
        }
    }
    async getActiveFiles() {
        // Implementation will depend on the IDE integration
        // For now, return empty array as placeholder
        return [];
    }
    async captureWorkspaceState() {
        // Implementation will depend on the IDE integration
        // For now, return empty object as placeholder
        return {
            openFiles: [],
            cursorPositions: {},
            selections: {},
        };
    }
    async captureAIContext() {
        // Implementation will depend on the AI system integration
        // For now, return empty object as placeholder
        return {
            recentPrompts: [],
            modelConfigurations: {},
            cachedResults: {},
        };
    }
    async applyWorkspaceState(state) {
        // Implementation will depend on the IDE integration
        // For now, do nothing as placeholder
    }
    async openRelevantFiles(files) {
        // Implementation will depend on the IDE integration
        // For now, do nothing as placeholder
    }
    async restoreAIContext(context) {
        // Implementation will depend on the AI system integration
        // For now, do nothing as placeholder
    }
    getCurrentContextId() {
        return this.currentContextId;
    }
    getContext(contextId) {
        return this.contextStore.get(contextId);
    }
    async deleteContext(contextId) {
        try {
            const filePath = path_1.default.join(this.contextDir, `${contextId}.json`);
            await fs_1.promises.unlink(filePath);
            this.contextStore.delete(contextId);
            if (this.currentContextId === contextId) {
                this.currentContextId = undefined;
            }
            this.emit("contextDeleted", { contextId });
        }
        catch (error) {
            console.error("Failed to delete context:", error);
            throw new Error("Context deletion failed");
        }
    }
}
exports.ContextManager = ContextManager;
//# sourceMappingURL=ContextManager.js.map