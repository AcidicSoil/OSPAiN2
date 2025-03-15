"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const DebugMcpService_1 = __importDefault(require("./DebugMcpService"));
class TaskMaster {
    constructor() {
        this.currentTasks = new Map();
        this.debugService = DebugMcpService_1.default;
        this.initializeLogging();
    }
    static getInstance() {
        if (!TaskMaster.instance) {
            TaskMaster.instance = new TaskMaster();
        }
        return TaskMaster.instance;
    }
    initializeLogging() {
        this.debugService.onLog((log) => {
            if (log.level === "error") {
                this.handleError(log);
            }
        });
    }
    handleError(log) {
        // Create a task to resolve the error
        this.createTask({
            description: `Resolve error: ${log.message}`,
            priority: "high",
            dependencies: [],
        });
    }
    createTask({ description, priority, dependencies = [], }) {
        const id = Date.now().toString();
        const task = {
            id,
            description,
            priority,
            status: "pending",
            dependencies,
            createdAt: new Date(),
        };
        this.currentTasks.set(id, task);
        return id;
    }
    startTask(taskId) {
        const task = this.currentTasks.get(taskId);
        if (task && this.canStartTask(task)) {
            task.status = "in-progress";
            task.startedAt = new Date();
            this.currentTasks.set(taskId, task);
        }
    }
    completeTask(taskId) {
        const task = this.currentTasks.get(taskId);
        if (task) {
            task.status = "completed";
            task.completedAt = new Date();
            this.currentTasks.set(taskId, task);
            this.checkDependentTasks(taskId);
        }
    }
    failTask(taskId) {
        const task = this.currentTasks.get(taskId);
        if (task) {
            task.status = "failed";
            this.currentTasks.set(taskId, task);
        }
    }
    canStartTask(task) {
        if (!task.dependencies?.length)
            return true;
        return task.dependencies.every((depId) => {
            const depTask = this.currentTasks.get(depId);
            return depTask?.status === "completed";
        });
    }
    checkDependentTasks(completedTaskId) {
        this.currentTasks.forEach((task) => {
            if (task.dependencies?.includes(completedTaskId) &&
                this.canStartTask(task)) {
                this.startTask(task.id);
            }
        });
    }
    getNextTask() {
        const pendingTasks = Array.from(this.currentTasks.values())
            .filter((task) => task.status === "pending" && this.canStartTask(task))
            .sort((a, b) => {
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
        return pendingTasks[0] || null;
    }
    getCurrentTasks() {
        return Array.from(this.currentTasks.values());
    }
    // Server monitoring tasks
    async checkLocalServer() {
        try {
            const response = await fetch("http://localhost:3000/health");
            if (!response.ok) {
                this.createTask({
                    description: "Local server health check failed. Server needs attention.",
                    priority: "high",
                });
            }
        }
        catch (error) {
            this.createTask({
                description: "Local server is not running. Start the server.",
                priority: "high",
            });
        }
    }
    // Console error monitoring
    monitorConsoleErrors() {
        const originalConsoleError = console.error;
        console.error = (...args) => {
            this.createTask({
                description: `Console error detected: ${args.join(" ")}`,
                priority: "high",
            });
            originalConsoleError.apply(console, args);
        };
    }
    // Task execution monitoring
    startTaskMonitoring() {
        setInterval(() => {
            const nextTask = this.getNextTask();
            if (nextTask) {
                this.startTask(nextTask.id);
            }
        }, 5000); // Check every 5 seconds
    }
}
exports.default = TaskMaster.getInstance();
//# sourceMappingURL=TaskMaster.js.map