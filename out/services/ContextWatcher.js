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
exports.contextWatcher = exports.ContextWatcher = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const chokidar_1 = require("chokidar");
const events_1 = require("events");
class ContextWatcher extends events_1.EventEmitter {
    constructor(projectRoot, plansDir = path.join(projectRoot, "docs", "planning"), srcDir = path.join(projectRoot, "src")) {
        super();
        this.projectRoot = projectRoot;
        this.plansDir = plansDir;
        this.srcDir = srcDir;
        this.currentMode = "unknown";
        this.activeContexts = new Map();
        this.initialize();
    }
    initialize() {
        // Watch plan files
        this.planWatcher = (0, chokidar_1.watch)(this.plansDir, {
            persistent: true,
            ignoreInitial: true,
        });
        this.planWatcher
            .on("add", (path) => this.handlePlanChange("add", path))
            .on("change", (path) => this.handlePlanChange("change", path));
        // Watch for mode changes
        fs.watchFile(path.join(this.projectRoot, ".mode"), () => {
            this.updateCurrentMode();
        });
        // Initial mode detection
        this.updateCurrentMode();
        // Load initial plans
        this.loadPlans();
    }
    loadPlans() {
        if (!fs.existsSync(this.plansDir))
            return;
        fs.readdirSync(this.plansDir)
            .filter((file) => file.endsWith(".md"))
            .forEach((file) => {
            const planId = file.replace(".md", "");
            const content = fs.readFileSync(path.join(this.plansDir, file), "utf8");
            this.updatePlanContext(planId, content);
        });
    }
    updateCurrentMode() {
        try {
            if (fs.existsSync(path.join(this.projectRoot, ".mode"))) {
                const modeContent = fs.readFileSync(path.join(this.projectRoot, ".mode"), "utf8");
                const newMode = modeContent.trim();
                if (this.currentMode !== newMode) {
                    const oldMode = this.currentMode;
                    this.currentMode = newMode;
                    this.emit("modeChange", { oldMode, newMode });
                }
            }
        }
        catch (error) {
            console.error("Error updating mode:", error);
        }
    }
    handlePlanChange(event, filePath) {
        const planId = path.basename(filePath).replace(".md", "");
        if (event === "add" || event === "change") {
            const content = fs.readFileSync(filePath, "utf8");
            this.updatePlanContext(planId, content);
        }
    }
    updatePlanContext(planId, content) {
        // Extract context information from plan
        const context = this.parsePlanContent(content);
        this.activeContexts.set(planId, context);
        this.emit("contextUpdate", {
            type: "plan",
            id: planId,
            context,
        });
    }
    parsePlanContent(content) {
        // Parse markdown content to extract:
        // - Current priorities
        // - In-progress tasks
        // - Completion status
        // ...implementation details...
        // This is a simplified example
        const priorities = [];
        const inProgress = [];
        const lines = content.split("\n");
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            // Extract priorities
            if (line.match(/^##\s+🔧|🧠|🏗️|🔌|📝/)) {
                priorities.push(line.substring(line.indexOf(" ")).trim());
            }
            // Extract in-progress items
            if (line.includes("🟡 In Progress")) {
                inProgress.push(line.substring(line.indexOf("]") + 1).trim());
            }
        }
        return {
            priorities,
            inProgress,
        };
    }
    // Public API
    getCurrentMode() {
        return this.currentMode;
    }
    getActiveContexts() {
        return new Map(this.activeContexts);
    }
    getActivePriorities() {
        const allPriorities = [];
        this.activeContexts.forEach((context) => {
            if (context.priorities && context.priorities.length > 0) {
                allPriorities.push(...context.priorities);
            }
        });
        return allPriorities;
    }
    getInProgressTasks() {
        const allTasks = [];
        this.activeContexts.forEach((context) => {
            if (context.inProgress && context.inProgress.length > 0) {
                allTasks.push(...context.inProgress);
            }
        });
        return allTasks;
    }
}
exports.ContextWatcher = ContextWatcher;
// Singleton instance
exports.contextWatcher = new ContextWatcher(process.cwd());
//# sourceMappingURL=ContextWatcher.js.map