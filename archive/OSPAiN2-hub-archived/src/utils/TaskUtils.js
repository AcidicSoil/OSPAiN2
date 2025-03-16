"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskUtils = void 0;
const uuid_1 = require("uuid");
const Task_1 = require("../types/Task");
const TaskQueue_1 = __importDefault(require("../services/TaskQueue"));
const WorkerManager_1 = __importDefault(require("../services/WorkerManager"));
/**
 * Utility class providing helper methods for working with tasks
 */
class TaskUtils {
    /**
     * Create a model request task
     *
     * @param prompt The prompt to send to the model
     * @param options Additional task options
     * @returns The created task ID
     */
    static async createModelRequest(prompt, modelId, // Make modelId required
    options // Use extended options
    ) {
        const taskData = {
            prompt,
            modelId,
            // Store context items in options property which exists in ModelRequestTaskData
            options: {
                contextItems: options?.contextItems || [],
            },
        };
        return this.createTask({
            type: Task_1.TaskType.MODEL_REQUEST,
            priority: options?.priority || Task_1.TaskPriority.HIGH,
            data: taskData,
            tags: options?.tags || ["model-request"],
            maxAttempts: options?.maxAttempts,
            dependencies: options?.dependencies,
        });
    }
    /**
     * Create an embeddings task
     *
     * @param texts The texts to generate embeddings for
     * @param options Additional task options
     * @returns The created task ID
     */
    static async createEmbeddingsTask(texts, dimensions, options // Add model to options
    ) {
        const taskData = {
            texts,
            dimensions: dimensions || 1536,
            modelId: options?.model || "default-embedding-model",
        };
        return this.createTask({
            type: Task_1.TaskType.EMBEDDINGS,
            priority: options?.priority || Task_1.TaskPriority.MEDIUM,
            data: taskData,
            tags: options?.tags || ["embeddings"],
            maxAttempts: options?.maxAttempts,
            dependencies: options?.dependencies,
        });
    }
    /**
     * Create a file operation task
     *
     * @param operation The operation to perform (read, write, delete, etc.)
     * @param sourcePath The source file path
     * @param options Additional task options
     * @returns The created task ID
     */
    static async createFileOperation(operation, sourcePath, destinationPath, content, options) {
        const taskData = {
            operation,
            sourcePath,
            destinationPath,
            content,
        };
        return this.createTask({
            type: Task_1.TaskType.FILE_OPERATION,
            priority: options?.priority || Task_1.TaskPriority.MEDIUM,
            data: taskData,
            tags: options?.tags || ["file-operation", operation],
            maxAttempts: options?.maxAttempts || 3,
            dependencies: options?.dependencies,
        });
    }
    /**
     * Create a data processing task
     *
     * @param processorName The name of the processor to use
     * @param data The data to process
     * @param options Additional task options
     * @returns The created task ID
     */
    static async createDataProcessingTask(processorName, data, size, options) {
        const taskData = {
            processorName,
            data,
            size: size ||
                (typeof data === "object"
                    ? JSON.stringify(data).length
                    : String(data).length),
        };
        return this.createTask({
            type: Task_1.TaskType.DATA_PROCESSING,
            priority: options?.priority || Task_1.TaskPriority.MEDIUM,
            data: taskData,
            tags: options?.tags || ["data-processing", processorName],
            maxAttempts: options?.maxAttempts || 2,
            dependencies: options?.dependencies,
        });
    }
    /**
     * Create an external API task
     *
     * @param url The API endpoint URL
     * @param method The HTTP method to use
     * @param options Additional task options
     * @returns The created task ID
     */
    static async createExternalApiTask(url, method, headers, body, options) {
        const taskData = {
            url,
            method,
            headers: headers || {},
            body,
        };
        return this.createTask({
            type: Task_1.TaskType.EXTERNAL_API,
            priority: options?.priority || Task_1.TaskPriority.MEDIUM,
            data: taskData,
            tags: options?.tags || ["external-api"],
            maxAttempts: options?.maxAttempts || 3,
            dependencies: options?.dependencies,
        });
    }
    /**
     * Create a custom task
     *
     * @param customType Custom task identifier
     * @param data Custom task data
     * @param options Additional task options
     * @returns The created task ID
     */
    static async createCustomTask(customType, data, options) {
        return this.createTask({
            type: Task_1.TaskType.CUSTOM,
            priority: options?.priority || Task_1.TaskPriority.MEDIUM,
            data: {
                customType,
                ...data,
            },
            tags: options?.tags || ["custom", customType],
            maxAttempts: options?.maxAttempts,
            dependencies: options?.dependencies,
        });
    }
    /**
     * Create a new task with the given options
     *
     * @param options Task creation options
     * @returns The created task ID
     */
    static async createTask(options) {
        // Create a unique ID for the task
        const taskId = options.id || (0, uuid_1.v4)();
        // Create the task object
        const task = {
            id: taskId,
            type: options.type,
            priority: options.priority || Task_1.TaskPriority.MEDIUM,
            status: Task_1.TaskStatus.PENDING,
            data: options.data || {},
            createdAt: new Date(),
            attempts: 0,
            maxAttempts: options.maxAttempts || 1,
            tags: options.tags || [],
            dependencies: options.dependencies || [],
            progress: 0,
        };
        // Add the task to the queue
        await TaskQueue_1.default.addTask(task);
        // Start the worker manager if it's not already running
        const workerStatus = WorkerManager_1.default.getStatus();
        if (!workerStatus.isRunning) {
            await WorkerManager_1.default.start();
        }
        return taskId;
    }
    /**
     * Cancel a task by ID
     *
     * @param taskId The ID of the task to cancel
     * @returns Whether the task was successfully cancelled
     */
    static async cancelTask(taskId) {
        const task = await TaskQueue_1.default.cancelTask(taskId);
        // Convert Task to boolean return value - true if task was found and canceled
        return !!task;
    }
    /**
     * Get a task by ID
     *
     * @param taskId The ID of the task to retrieve
     * @returns The task, or null if not found
     */
    static async getTask(taskId) {
        const task = await TaskQueue_1.default.getTask(taskId);
        // Convert undefined to null if task not found
        return task || null;
    }
    /**
     * Wait for a task to complete
     *
     * @param taskId The ID of the task to wait for
     * @param timeoutMs Maximum time to wait in milliseconds
     * @returns The completed task, or null if timed out
     */
    static async waitForTask(taskId, timeoutMs = 30000) {
        const task = await TaskQueue_1.default.getTask(taskId);
        if (!task) {
            return null;
        }
        // If task is already completed, failed, or cancelled, return it immediately
        if (task.status === Task_1.TaskStatus.COMPLETED ||
            task.status === Task_1.TaskStatus.FAILED ||
            task.status === Task_1.TaskStatus.CANCELLED) {
            return task;
        }
        // Wait for task to complete
        return new Promise((resolve) => {
            const startTime = Date.now();
            // Function to check task status
            const checkStatus = async () => {
                const currentTask = await TaskQueue_1.default.getTask(taskId);
                // If task doesn't exist anymore, return null
                if (!currentTask) {
                    return resolve(null);
                }
                // If task is completed, failed, or cancelled, return it
                if (currentTask.status === Task_1.TaskStatus.COMPLETED ||
                    currentTask.status === Task_1.TaskStatus.FAILED ||
                    currentTask.status === Task_1.TaskStatus.CANCELLED) {
                    return resolve(currentTask);
                }
                // Check if we've exceeded timeout
                if (Date.now() - startTime > timeoutMs) {
                    return resolve(null);
                }
                // Check again after a short delay
                setTimeout(checkStatus, 200);
            };
            // Start checking
            checkStatus();
        });
    }
}
exports.TaskUtils = TaskUtils;
//# sourceMappingURL=TaskUtils.js.map