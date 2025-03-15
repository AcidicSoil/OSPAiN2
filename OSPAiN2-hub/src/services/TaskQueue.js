"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskQueue = void 0;
const uuid_1 = require("uuid");
const events_1 = require("events");
const Task_1 = require("../types/Task");
/**
 * TaskQueue Service
 *
 * Manages a queue of tasks with persistence to disk.
 * Features:
 * - Add, update, and remove tasks
 * - Prioritize tasks based on importance
 * - Get next task for processing
 * - Persist tasks to disk
 * - Load tasks from disk on startup
 * - Event-based communication
 */
class TaskQueue extends events_1.EventEmitter {
    /**
     * Private constructor for singleton pattern
     */
    constructor() {
        super();
        this.tasks = new Map();
        this.queue = []; // Task IDs ordered by priority
        this.persistenceInterval = null;
        this.persistencePath = "./task-queue-data.json";
        this.autoSave = true;
        this.isInitialized = false;
        // Initialize persistence
        this.loadFromDisk();
        this.setupAutoPersistence(60000); // Save every minute
    }
    /**
     * Get singleton instance
     */
    static getInstance() {
        if (!TaskQueue.instance) {
            TaskQueue.instance = new TaskQueue();
        }
        return TaskQueue.instance;
    }
    /**
     * Initialize the queue
     */
    async initialize() {
        if (this.isInitialized)
            return;
        try {
            await this.loadFromDisk();
            this.setupAutoPersistence();
            this.isInitialized = true;
            this.emit("initialized");
        }
        catch (error) {
            console.error("Failed to initialize task queue:", error);
            throw error;
        }
    }
    /**
     * Add a new task to the queue
     */
    addTask(options) {
        const taskId = (0, uuid_1.v4)();
        const now = new Date();
        const task = {
            id: taskId,
            type: options.type,
            priority: options.priority ?? Task_1.TaskPriority.MEDIUM,
            status: Task_1.TaskStatus.PENDING,
            data: options.data,
            createdAt: now,
            attempts: 0,
            maxAttempts: options.maxAttempts ?? 3,
            dependencies: options.dependencies ?? [],
            tags: options.tags ?? [],
        };
        this.tasks.set(taskId, task);
        this.insertIntoQueue(taskId, task.priority);
        if (this.autoSave) {
            this.saveToDisk();
        }
        this.emit("task:added", task);
        return task;
    }
    /**
     * Get the next task for processing
     */
    getNextTask() {
        // Filter out tasks that can't be processed yet
        const availableTasks = this.queue.filter((taskId) => {
            const task = this.tasks.get(taskId);
            if (!task)
                return false;
            // Skip tasks that aren't pending
            if (task.status !== Task_1.TaskStatus.PENDING)
                return false;
            // Skip tasks with dependencies that aren't completed
            if (task.dependencies && task.dependencies.length > 0) {
                const hasPendingDependencies = task.dependencies.some((depId) => {
                    const depTask = this.tasks.get(depId);
                    return !depTask || depTask.status !== Task_1.TaskStatus.COMPLETED;
                });
                if (hasPendingDependencies)
                    return false;
            }
            return true;
        });
        if (availableTasks.length === 0)
            return undefined;
        // Get the highest priority task (lowest priority value)
        const nextTaskId = availableTasks[0];
        const nextTask = this.tasks.get(nextTaskId);
        return nextTask;
    }
    /**
     * Start processing a task by marking it as running
     */
    startTask(taskId, workerId) {
        const task = this.tasks.get(taskId);
        if (!task)
            return undefined;
        task.status = Task_1.TaskStatus.RUNNING;
        task.startedAt = new Date();
        task.workerId = workerId;
        task.attempts++;
        this.tasks.set(taskId, task);
        if (this.autoSave) {
            this.saveToDisk();
        }
        this.emit("task:started", task);
        return task;
    }
    /**
     * Complete a task with result
     */
    completeTask(taskId, result) {
        const task = this.tasks.get(taskId);
        if (!task)
            return undefined;
        task.status = Task_1.TaskStatus.COMPLETED;
        task.completedAt = new Date();
        task.result = result;
        task.progress = 100;
        this.tasks.set(taskId, task);
        this.removeFromQueue(taskId);
        if (this.autoSave) {
            this.saveToDisk();
        }
        this.emit("task:completed", task);
        return task;
    }
    /**
     * Mark a task as failed
     */
    failTask(taskId, error) {
        const task = this.tasks.get(taskId);
        if (!task)
            return undefined;
        if (task.attempts < task.maxAttempts) {
            task.status = Task_1.TaskStatus.RETRY;
            task.error = error;
            // Re-add to the queue with same priority
            this.insertIntoQueue(taskId, task.priority);
        }
        else {
            task.status = Task_1.TaskStatus.FAILED;
            task.completedAt = new Date();
            task.error = error;
            this.removeFromQueue(taskId);
        }
        this.tasks.set(taskId, task);
        if (this.autoSave) {
            this.saveToDisk();
        }
        this.emit("task:failed", task);
        return task;
    }
    /**
     * Cancel a task
     */
    cancelTask(taskId) {
        const task = this.tasks.get(taskId);
        if (!task)
            return undefined;
        task.status = Task_1.TaskStatus.CANCELLED;
        task.completedAt = new Date();
        this.tasks.set(taskId, task);
        this.removeFromQueue(taskId);
        if (this.autoSave) {
            this.saveToDisk();
        }
        this.emit("task:cancelled", task);
        return task;
    }
    /**
     * Update task progress
     */
    updateTaskProgress(taskId, progress) {
        const task = this.tasks.get(taskId);
        if (!task)
            return undefined;
        task.progress = Math.min(Math.max(0, progress), 100);
        this.tasks.set(taskId, task);
        this.emit("task:progress", task);
        return task;
    }
    /**
     * Get a task by ID
     */
    getTask(taskId) {
        return this.tasks.get(taskId);
    }
    /**
     * Get all tasks
     */
    getAllTasks() {
        return Array.from(this.tasks.values());
    }
    /**
     * Get tasks by status
     */
    getTasksByStatus(status) {
        return Array.from(this.tasks.values()).filter((task) => task.status === status);
    }
    /**
     * Get tasks by type
     */
    getTasksByType(type) {
        return Array.from(this.tasks.values()).filter((task) => task.type === type);
    }
    /**
     * Get tasks by tag
     */
    getTasksByTag(tag) {
        return Array.from(this.tasks.values()).filter((task) => task.tags?.includes(tag));
    }
    /**
     * Get queue stats
     */
    getStats() {
        const all = this.getAllTasks();
        return {
            total: all.length,
            pending: all.filter((t) => t.status === Task_1.TaskStatus.PENDING).length,
            running: all.filter((t) => t.status === Task_1.TaskStatus.RUNNING).length,
            completed: all.filter((t) => t.status === Task_1.TaskStatus.COMPLETED).length,
            failed: all.filter((t) => t.status === Task_1.TaskStatus.FAILED).length,
            cancelled: all.filter((t) => t.status === Task_1.TaskStatus.CANCELLED).length,
            retry: all.filter((t) => t.status === Task_1.TaskStatus.RETRY).length,
            byPriority: {
                critical: all.filter((t) => t.priority === Task_1.TaskPriority.CRITICAL)
                    .length,
                high: all.filter((t) => t.priority === Task_1.TaskPriority.HIGH).length,
                medium: all.filter((t) => t.priority === Task_1.TaskPriority.MEDIUM).length,
                low: all.filter((t) => t.priority === Task_1.TaskPriority.LOW).length,
                background: all.filter((t) => t.priority === Task_1.TaskPriority.BACKGROUND)
                    .length,
            },
            byType: Object.values(Task_1.TaskType).reduce((acc, type) => {
                acc[type] = all.filter((t) => t.type === type).length;
                return acc;
            }, {}),
        };
    }
    /**
     * Clear completed and failed tasks older than the specified age
     */
    cleanupOldTasks(maxAgeMs = 24 * 60 * 60 * 1000) {
        const now = new Date().getTime();
        let removedCount = 0;
        Array.from(this.tasks.values())
            .filter((task) => (task.status === Task_1.TaskStatus.COMPLETED ||
            task.status === Task_1.TaskStatus.FAILED ||
            task.status === Task_1.TaskStatus.CANCELLED) &&
            task.completedAt &&
            now - task.completedAt.getTime() > maxAgeMs)
            .forEach((task) => {
            this.tasks.delete(task.id);
            this.removeFromQueue(task.id);
            removedCount++;
        });
        if (removedCount > 0 && this.autoSave) {
            this.saveToDisk();
        }
        return removedCount;
    }
    /**
     * Clear all tasks
     */
    clearAllTasks() {
        this.tasks.clear();
        this.queue = [];
        if (this.autoSave) {
            this.saveToDisk();
        }
        this.emit("queue:cleared");
    }
    /**
     * Save the task queue to disk
     */
    saveToDisk() {
        try {
            const data = {
                tasks: Array.from(this.tasks.values()),
                queue: this.queue,
            };
            // In a real implementation, this would use Node.js fs to write to file
            // Since we're in a browser environment, we'll use localStorage
            localStorage.setItem(this.persistencePath, JSON.stringify(data));
            this.emit("queue:saved");
        }
        catch (error) {
            console.error("Failed to persist task queue:", error);
            this.emit("error", error);
        }
    }
    /**
     * Load the task queue from disk
     */
    async loadFromDisk() {
        try {
            // In a real implementation, this would use Node.js fs to read from file
            // Since we're in a browser environment, we'll use localStorage
            const dataStr = localStorage.getItem(this.persistencePath);
            if (!dataStr)
                return;
            const data = JSON.parse(dataStr);
            // Reset current data
            this.tasks.clear();
            this.queue = [];
            // Restore tasks
            if (data.tasks && Array.isArray(data.tasks)) {
                data.tasks.forEach((task) => {
                    // Convert string dates back to Date objects
                    task.createdAt = new Date(task.createdAt);
                    if (task.startedAt)
                        task.startedAt = new Date(task.startedAt);
                    if (task.completedAt)
                        task.completedAt = new Date(task.completedAt);
                    this.tasks.set(task.id, task);
                });
            }
            // Restore queue
            if (data.queue && Array.isArray(data.queue)) {
                this.queue = data.queue;
            }
            else {
                // Rebuild queue if not found
                this.rebuildQueue();
            }
            this.emit("queue:loaded");
        }
        catch (error) {
            console.error("Failed to load task queue from disk:", error);
            this.emit("error", error);
        }
    }
    /**
     * Set up automatic persistence
     */
    setupAutoPersistence(intervalMs = 60000) {
        if (this.persistenceInterval) {
            clearInterval(this.persistenceInterval);
        }
        this.persistenceInterval = setInterval(() => {
            this.saveToDisk();
        }, intervalMs);
    }
    /**
     * Rebuild the priority queue from tasks
     */
    rebuildQueue() {
        // Get all pending and retry tasks
        const pendingTasks = Array.from(this.tasks.values()).filter((task) => task.status === Task_1.TaskStatus.PENDING || task.status === Task_1.TaskStatus.RETRY);
        // Sort by priority (lower value = higher priority)
        pendingTasks.sort((a, b) => a.priority - b.priority);
        // Rebuild the queue
        this.queue = pendingTasks.map((task) => task.id);
    }
    /**
     * Insert a task into the priority queue
     */
    insertIntoQueue(taskId, priority) {
        // Remove if already in queue
        this.removeFromQueue(taskId);
        // Find insertion point based on priority
        let insertIndex = this.queue.findIndex((id) => {
            const task = this.tasks.get(id);
            return task && task.priority > priority;
        });
        if (insertIndex === -1) {
            // Add to end if no higher priority task found
            this.queue.push(taskId);
        }
        else {
            // Insert at the right position
            this.queue.splice(insertIndex, 0, taskId);
        }
    }
    /**
     * Remove a task from the queue
     */
    removeFromQueue(taskId) {
        const index = this.queue.indexOf(taskId);
        if (index !== -1) {
            this.queue.splice(index, 1);
        }
    }
    /**
     * Update a task
     */
    updateTask(task) {
        if (!this.tasks.has(task.id))
            return undefined;
        this.tasks.set(task.id, task);
        if (this.autoSave) {
            this.saveToDisk();
        }
        this.emit("task:updated", task);
        return task;
    }
}
exports.TaskQueue = TaskQueue;
// Export instance for backward compatibility
const taskQueue = TaskQueue.getInstance();
exports.default = taskQueue;
//# sourceMappingURL=TaskQueue.js.map