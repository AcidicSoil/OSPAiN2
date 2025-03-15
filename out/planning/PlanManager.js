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
exports.planManager = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const chokidar_1 = require("chokidar");
class PlanManager {
    constructor(basePath) {
        this.plans = new Map();
        this.planWatchers = new Map();
        this.planPath = path.join(basePath, "docs", "planning");
        // Create directory if it doesn't exist
        if (!fs.existsSync(this.planPath)) {
            fs.mkdirSync(this.planPath, { recursive: true });
        }
        // Load existing plans
        this.loadPlans();
        // Watch for changes
        this.initializeWatcher();
    }
    loadPlans() {
        // ... existing code ...
        // Parse markdown files into structured plan data
        fs.readdirSync(this.planPath)
            .filter((file) => file.endsWith(".md"))
            .forEach((file) => {
            const planId = file.replace(".md", "");
            const content = fs.readFileSync(path.join(this.planPath, file), "utf8");
            this.plans.set(planId, this.parsePlanContent(content));
        });
    }
    initializeWatcher() {
        const watcher = (0, chokidar_1.watch)(this.planPath, {
            persistent: true,
            ignoreInitial: true,
        });
        watcher
            .on("add", (path) => this.handlePlanChange("add", path))
            .on("change", (path) => this.handlePlanChange("change", path))
            .on("unlink", (path) => this.handlePlanChange("remove", path));
    }
    handlePlanChange(event, filePath) {
        const planId = path.basename(filePath).replace(".md", "");
        console.log(`Plan ${event}: ${planId}`);
        if (event === "remove") {
            this.plans.delete(planId);
        }
        else {
            const content = fs.readFileSync(filePath, "utf8");
            this.plans.set(planId, this.parsePlanContent(content));
        }
        // Emit event or notify subscribers about the change
        this.notifyPlanChange(planId);
    }
    // CLI integration methods
    listPlans() {
        return Array.from(this.plans.values());
    }
    getPlanByName(name) {
        return this.plans.get(name);
    }
    getActiveTasks() {
        const allTasks = [];
        this.plans.forEach((planItems) => {
            planItems
                .filter((item) => item.status === "in-progress")
                .forEach((item) => allTasks.push(item));
        });
        return allTasks.sort((a, b) => a.priority - b.priority);
    }
}
exports.planManager = new PlanManager(process.cwd());
//# sourceMappingURL=PlanManager.js.map