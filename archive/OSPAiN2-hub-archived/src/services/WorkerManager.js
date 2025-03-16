"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkerManager = void 0;
const uuid_1 = require("uuid");
const events_1 = require("events");
const TaskQueue_1 = __importDefault(require("./TaskQueue"));
const Task_1 = require("../types/Task");
/**
 * Default worker configuration
 */
const DEFAULT_CONFIG = {
    maxWorkers: Math.max(2, navigator.hardwareConcurrency || 4),
    idleTimeoutMs: 60000, // 1 minute
    taskTimeoutMs: 300000, // 5 minutes
    workerInitTimeoutMs: 10000, // 10 seconds
    pollingIntervalMs: 1000, // 1 second
};
/**
 * WorkerManager Service
 *
 * Manages worker threads and distributes tasks from the queue.
 * Features:
 * - Dynamic worker pool management
 * - Task distribution to available workers
 * - Automatic scaling based on workload
 * - Worker health monitoring
 * - Task timeout handling
 * - Worker recovery from crashes
 */
class WorkerManager extends events_1.EventEmitter {
    /**
     * Private constructor for singleton pattern
     */
    constructor(config = {}) {
        super();
        this.workers = new Map();
        this.pollingInterval = null;
        this.taskTimeouts = new Map();
        this.isRunning = false;
        this.config = { ...DEFAULT_CONFIG, ...config };
    }
    /**
     * Get singleton instance
     */
    static getInstance(config) {
        if (!WorkerManager.instance) {
            WorkerManager.instance = new WorkerManager(config);
        }
        else if (config) {
            // Update config if provided
            WorkerManager.instance.updateConfig(config);
        }
        return WorkerManager.instance;
    }
    /**
     * Start the worker manager
     */
    start() {
        if (this.isRunning)
            return;
        this.isRunning = true;
        // Start polling for tasks
        this.startPolling();
        this.emit("started");
    }
    /**
     * Stop the worker manager
     */
    async stop() {
        if (!this.isRunning)
            return;
        this.isRunning = false;
        // Stop polling
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
        // Clear all task timeouts
        this.taskTimeouts.forEach((timeout) => clearTimeout(timeout));
        this.taskTimeouts.clear();
        // Terminate all workers
        const terminationPromises = Array.from(this.workers.values()).map((workerState) => this.terminateWorker(workerState.id));
        await Promise.all(terminationPromises);
        this.emit("stopped");
    }
    /**
     * Update worker manager configuration
     */
    updateConfig(config) {
        this.config = { ...this.config, ...config };
        // Apply new configuration (e.g., adjust worker pool size)
        this.adjustWorkerPool();
        // Restart polling with new interval if needed
        if (this.isRunning && this.pollingInterval && config.pollingIntervalMs) {
            clearInterval(this.pollingInterval);
            this.startPolling();
        }
        this.emit("config:updated", this.config);
    }
    /**
     * Get worker manager status
     */
    getStatus() {
        const activeWorkers = Array.from(this.workers.values()).filter((w) => w.status === "busy" || w.status === "idle");
        const idleWorkers = activeWorkers.filter((w) => w.status === "idle");
        const busyWorkers = activeWorkers.filter((w) => w.status === "busy");
        return {
            isRunning: this.isRunning,
            totalWorkers: this.workers.size,
            activeWorkers: activeWorkers.length,
            idleWorkers: idleWorkers.length,
            busyWorkers: busyWorkers.length,
            workersStarting: Array.from(this.workers.values()).filter((w) => w.status === "starting").length,
            workersStopping: Array.from(this.workers.values()).filter((w) => w.status === "stopping").length,
            workersInError: Array.from(this.workers.values()).filter((w) => w.status === "error").length,
            totalProcessedTasks: Array.from(this.workers.values()).reduce((sum, w) => sum + w.processedTasks, 0),
            totalFailedTasks: Array.from(this.workers.values()).reduce((sum, w) => sum + w.failedTasks, 0),
            config: this.config,
        };
    }
    /**
     * Check if the worker manager is running
     * @returns boolean indicating if the worker manager is running
     */
    getRunningStatus() {
        return this.isRunning;
    }
    /**
     * Get detailed worker information
     */
    getWorkerStats() {
        return Array.from(this.workers.values()).map((w) => ({
            id: w.id,
            status: w.status,
            currentTaskId: w.currentTaskId,
            uptime: Date.now() - w.startTime.getTime(),
            idleTime: w.status === "idle" ? Date.now() - w.lastActive.getTime() : 0,
            processedTasks: w.processedTasks,
            failedTasks: w.failedTasks,
        }));
    }
    /**
     * Start polling for tasks
     */
    startPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
        }
        this.pollingInterval = setInterval(() => {
            this.pollForTasks();
        }, this.config.pollingIntervalMs);
        // Immediate first poll
        this.pollForTasks();
    }
    /**
     * Poll for tasks and assign to available workers
     */
    pollForTasks() {
        if (!this.isRunning)
            return;
        // Check if we need to adjust the worker pool
        this.adjustWorkerPool();
        // Check for available tasks
        const nextTask = TaskQueue_1.default.getNextTask();
        if (!nextTask)
            return;
        // Find an idle worker
        const idleWorker = Array.from(this.workers.values()).find((w) => w.status === "idle");
        if (!idleWorker) {
            // If no idle workers and we're below max, create a new one
            if (this.workers.size < this.config.maxWorkers) {
                this.createWorker();
            }
            return;
        }
        // Assign task to worker
        this.assignTaskToWorker(nextTask, idleWorker);
    }
    /**
     * Adjust the worker pool based on workload
     */
    adjustWorkerPool() {
        // Current count of active or starting workers
        const activeWorkerCount = Array.from(this.workers.values()).filter((w) => w.status !== "stopping" && w.status !== "error").length;
        // Get count of pending tasks
        const pendingTaskCount = TaskQueue_1.default.getTasksByStatus(Task_1.TaskStatus.PENDING).length;
        // Calculate target worker count based on pending tasks and max workers
        const targetWorkerCount = Math.min(Math.max(1, pendingTaskCount), // At least 1 worker if tasks pending
        this.config.maxWorkers);
        // Adjust worker count
        if (activeWorkerCount < targetWorkerCount) {
            // Need more workers
            const workersToAdd = targetWorkerCount - activeWorkerCount;
            for (let i = 0; i < workersToAdd; i++) {
                this.createWorker();
            }
        }
        else if (activeWorkerCount > targetWorkerCount) {
            // Too many workers, reduce count
            const idleWorkers = Array.from(this.workers.values())
                .filter((w) => w.status === "idle")
                .sort((a, b) => {
                // Terminate workers that have been idle longest
                return b.lastActive.getTime() - a.lastActive.getTime();
            });
            const workersToRemove = activeWorkerCount - targetWorkerCount;
            for (let i = 0; i < Math.min(workersToRemove, idleWorkers.length); i++) {
                this.terminateWorker(idleWorkers[i].id);
            }
        }
        // Check for idle workers that have exceeded timeout
        const now = Date.now();
        Array.from(this.workers.values())
            .filter((w) => w.status === "idle" &&
            now - w.lastActive.getTime() > this.config.idleTimeoutMs &&
            this.workers.size > 1 // Keep at least one worker
        )
            .forEach((w) => this.terminateWorker(w.id));
    }
    /**
     * Create a new worker
     */
    createWorker() {
        const workerId = (0, uuid_1.v4)();
        // In a browser environment, create Web Worker
        // Note: In a Node.js environment, you would use worker_threads
        const worker = new Worker(new URL("../workers/TaskWorker.ts", import.meta.url), {
            type: "module",
        });
        const workerState = {
            id: workerId,
            status: "starting",
            startTime: new Date(),
            lastActive: new Date(),
            processedTasks: 0,
            failedTasks: 0,
            worker,
        };
        // Set up message handler
        worker.onmessage = (event) => this.handleWorkerMessage(workerId, event.data);
        worker.onerror = (error) => this.handleWorkerError(workerId, error);
        this.workers.set(workerId, workerState);
        // Send initialization message
        worker.postMessage({
            type: "initialize",
            workerId,
            config: {
                taskTimeoutMs: this.config.taskTimeoutMs,
            },
        });
        // Set timeout for worker initialization
        setTimeout(() => {
            const currentState = this.workers.get(workerId);
            if (currentState && currentState.status === "starting") {
                // Worker failed to start in time
                currentState.status = "error";
                this.emit("worker:error", {
                    workerId,
                    error: "Worker initialization timeout",
                });
                // Attempt to terminate
                this.terminateWorker(workerId);
            }
        }, this.config.workerInitTimeoutMs);
        this.emit("worker:created", { workerId });
        return workerId;
    }
    /**
     * Terminate a worker
     */
    async terminateWorker(workerId) {
        const workerState = this.workers.get(workerId);
        if (!workerState)
            return;
        // Mark as stopping
        workerState.status = "stopping";
        // Handle any running task
        if (workerState.currentTaskId) {
            const task = TaskQueue_1.default.getTask(workerState.currentTaskId);
            if (task && task.status === Task_1.TaskStatus.RUNNING) {
                // Mark task for retry
                TaskQueue_1.default.failTask(workerState.currentTaskId, "Worker terminated while task was running");
                // Clear any timeout
                const timeout = this.taskTimeouts.get(workerState.currentTaskId);
                if (timeout) {
                    clearTimeout(timeout);
                    this.taskTimeouts.delete(workerState.currentTaskId);
                }
            }
        }
        try {
            // Terminate the worker
            workerState.worker.terminate();
            // Remove from collection
            this.workers.delete(workerId);
            this.emit("worker:terminated", { workerId });
        }
        catch (error) {
            console.error(`Error terminating worker ${workerId}:`, error);
            // Remove from collection even on error
            this.workers.delete(workerId);
            this.emit("worker:error", { workerId, error });
        }
    }
    /**
     * Assign a task to a worker
     */
    assignTaskToWorker(task, workerState) {
        // Update worker state
        workerState.status = "busy";
        workerState.currentTaskId = task.id;
        workerState.lastActive = new Date();
        // Update task status
        TaskQueue_1.default.startTask(task.id, workerState.id);
        // Send task to worker
        workerState.worker.postMessage({
            type: "execute",
            taskId: task.id,
            taskType: task.type,
            taskData: task.data,
        });
        // Set task timeout
        const timeout = setTimeout(() => {
            // Handle task timeout
            if (workerState.currentTaskId === task.id) {
                this.handleTaskTimeout(task.id, workerState.id);
            }
        }, this.config.taskTimeoutMs);
        this.taskTimeouts.set(task.id, timeout);
        this.emit("task:assigned", { taskId: task.id, workerId: workerState.id });
    }
    /**
     * Handle messages from worker
     */
    handleWorkerMessage(workerId, message) {
        const workerState = this.workers.get(workerId);
        if (!workerState)
            return; // Worker no longer exists
        // Update last active timestamp
        workerState.lastActive = new Date();
        switch (message.type) {
            case Task_1.WorkerMessageType.WORKER_READY:
                if (workerState.status === "starting") {
                    workerState.status = "idle";
                    this.emit("worker:ready", { workerId });
                }
                break;
            case Task_1.WorkerMessageType.TASK_COMPLETED:
                if (message.taskId && workerState.currentTaskId === message.taskId) {
                    // Clear task timeout
                    const timeout = this.taskTimeouts.get(message.taskId);
                    if (timeout) {
                        clearTimeout(timeout);
                        this.taskTimeouts.delete(message.taskId);
                    }
                    // Update task status
                    TaskQueue_1.default.completeTask(message.taskId, message.data);
                    // Update worker stats
                    workerState.processedTasks++;
                    workerState.currentTaskId = undefined;
                    workerState.status = "idle";
                    this.emit("task:completed", {
                        taskId: message.taskId,
                        workerId,
                        result: message.data,
                    });
                }
                break;
            case Task_1.WorkerMessageType.TASK_FAILED:
                if (message.taskId && workerState.currentTaskId === message.taskId) {
                    // Clear task timeout
                    const timeout = this.taskTimeouts.get(message.taskId);
                    if (timeout) {
                        clearTimeout(timeout);
                        this.taskTimeouts.delete(message.taskId);
                    }
                    // Update task status
                    TaskQueue_1.default.failTask(message.taskId, message.error || "Task failed");
                    // Update worker stats
                    workerState.failedTasks++;
                    workerState.currentTaskId = undefined;
                    workerState.status = "idle";
                    this.emit("task:failed", {
                        taskId: message.taskId,
                        workerId,
                        error: message.error,
                    });
                }
                break;
            case Task_1.WorkerMessageType.TASK_PROGRESS:
                if (message.taskId && message.progress !== undefined) {
                    // Update task progress
                    TaskQueue_1.default.updateTaskProgress(message.taskId, message.progress);
                    this.emit("task:progress", {
                        taskId: message.taskId,
                        workerId,
                        progress: message.progress,
                    });
                }
                break;
            case Task_1.WorkerMessageType.WORKER_ERROR:
                console.error(`Worker ${workerId} reported error:`, message.error);
                // Mark worker as in error state
                workerState.status = "error";
                // Handle any running task
                if (workerState.currentTaskId) {
                    this.handleTaskTimeout(workerState.currentTaskId, workerId);
                }
                this.emit("worker:error", {
                    workerId,
                    error: message.error,
                });
                // Terminate and replace the worker
                this.terminateWorker(workerId).then(() => this.createWorker());
                break;
        }
    }
    /**
     * Handle worker errors
     */
    handleWorkerError(workerId, error) {
        console.error(`Worker ${workerId} encountered error:`, error);
        const workerState = this.workers.get(workerId);
        if (!workerState)
            return; // Worker no longer exists
        // Mark worker as in error state
        workerState.status = "error";
        // Handle any running task
        if (workerState.currentTaskId) {
            this.handleTaskTimeout(workerState.currentTaskId, workerId);
        }
        this.emit("worker:error", {
            workerId,
            error: error.message || "Unknown worker error",
        });
        // Terminate and replace the worker
        this.terminateWorker(workerId).then(() => this.createWorker());
    }
    /**
     * Handle task timeout
     */
    handleTaskTimeout(taskId, workerId) {
        const workerState = this.workers.get(workerId);
        if (!workerState)
            return; // Worker no longer exists
        // Clear task timeout
        const timeout = this.taskTimeouts.get(taskId);
        if (timeout) {
            clearTimeout(timeout);
            this.taskTimeouts.delete(taskId);
        }
        // Update task status
        TaskQueue_1.default.failTask(taskId, "Task timed out");
        // Update worker stats
        workerState.failedTasks++;
        workerState.currentTaskId = undefined;
        this.emit("task:timeout", { taskId, workerId });
        // Terminate and replace the worker (it might be stuck)
        this.terminateWorker(workerId).then(() => this.createWorker());
    }
}
exports.WorkerManager = WorkerManager;
// Export instance for backward compatibility
const workerManager = WorkerManager.getInstance();
exports.default = workerManager;
//# sourceMappingURL=WorkerManager.js.map