"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-restricted-globals */
const Task_1 = require("../types/Task");
// Worker context - not exposed to global scope
let workerId = null;
let isReady = false;
/**
 * Initialize the worker
 */
function initialize(id, workerConfig) {
    workerId = id;
    const config = workerConfig || {};
    isReady = true;
    // Notify manager that worker is ready
    self.postMessage({
        type: Task_1.WorkerMessageType.WORKER_READY,
        workerId: workerId,
        timestamp: new Date(),
    });
}
/**
 * Execute a task
 */
async function executeTask(taskId, taskType, taskData) {
    try {
        // Report progress at 0%
        reportProgress(taskId, 0);
        let result;
        // Execute appropriate task handler based on type
        switch (taskType) {
            case Task_1.TaskType.MODEL_REQUEST:
                result = await handleModelRequest(taskData);
                break;
            case Task_1.TaskType.EMBEDDINGS:
                result = await handleEmbeddings(taskData);
                break;
            case Task_1.TaskType.FILE_OPERATION:
                result = await handleFileOperation(taskData);
                break;
            case Task_1.TaskType.DATA_PROCESSING:
                result = await handleDataProcessing(taskData);
                break;
            case Task_1.TaskType.EXTERNAL_API:
                result = await handleExternalApi(taskData);
                break;
            case Task_1.TaskType.CUSTOM:
                result = await handleCustomTask(taskData);
                break;
            default:
                throw new Error(`Unknown task type: ${taskType}`);
        }
        // Report progress at 100%
        reportProgress(taskId, 100);
        // Report task completion
        self.postMessage({
            type: Task_1.WorkerMessageType.TASK_COMPLETED,
            taskId,
            workerId,
            data: result,
            timestamp: new Date(),
        });
    }
    catch (error) {
        // Report task failure
        self.postMessage({
            type: Task_1.WorkerMessageType.TASK_FAILED,
            taskId,
            workerId,
            error: error instanceof Error ? error.message : String(error),
            timestamp: new Date(),
        });
    }
}
/**
 * Report task progress
 */
function reportProgress(taskId, progress) {
    self.postMessage({
        type: Task_1.WorkerMessageType.TASK_PROGRESS,
        taskId,
        workerId,
        progress,
        timestamp: new Date(),
    });
}
/**
 * Report worker error
 */
function reportError(error) {
    self.postMessage({
        type: Task_1.WorkerMessageType.WORKER_ERROR,
        workerId,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date(),
    });
}
// Setup message handler
self.onmessage = async (event) => {
    const message = event.data;
    try {
        switch (message.type) {
            case "initialize":
                initialize(message.workerId, message.config);
                break;
            case "execute":
                if (!isReady) {
                    throw new Error("Worker not initialized");
                }
                await executeTask(message.taskId, message.taskType, message.taskData);
                break;
            default:
                console.warn(`Unknown message type: ${message.type}`);
                break;
        }
    }
    catch (error) {
        reportError(error);
    }
};
// Task handlers
/**
 * Handle model request task
 */
async function handleModelRequest(data) {
    // Simulate processing time
    await sleep(1000);
    // Mock implementation - in a real app, this would call an AI model
    return {
        text: `Response to prompt: ${data.prompt.substring(0, 50)}...`,
        tokens: data.prompt.length / 4,
        model: data.modelId || "default",
    };
}
/**
 * Handle embeddings task
 */
async function handleEmbeddings(data) {
    // Simulate processing time
    await sleep(Math.min(500 * data.texts.length, 3000));
    // Report progress halfway
    reportProgress(data.taskId, 50);
    // Mock implementation - in a real app, this would generate actual embeddings
    return {
        embeddings: data.texts.map(() => {
            // Generate random embedding vector (mock)
            const dimensions = data.dimensions || 128;
            const vector = new Array(dimensions);
            for (let i = 0; i < dimensions; i++) {
                vector[i] = Math.random() * 2 - 1; // Values between -1 and 1
            }
            return vector;
        }),
    };
}
/**
 * Handle file operation task
 */
async function handleFileOperation(data) {
    // Simulate processing time
    await sleep(500);
    // Report progress halfway
    reportProgress(data.taskId, 50);
    // Mock implementation - in a real app, this would perform actual file operations
    return {
        success: true,
        operation: data.operation,
        path: data.sourcePath,
        timestamp: new Date().toISOString(),
    };
}
/**
 * Handle data processing task
 */
async function handleDataProcessing(data) {
    // Simulate processing time based on data size
    const processingTime = Math.min(data.size || 1000, 5000);
    const steps = 5;
    const stepTime = processingTime / steps;
    for (let i = 1; i <= steps; i++) {
        await sleep(stepTime);
        reportProgress(data.taskId, (i / steps) * 100);
    }
    // Mock implementation - in a real app, this would process actual data
    return {
        processed: true,
        itemsProcessed: data.size || 100,
        duration: processingTime,
        timestamp: new Date().toISOString(),
    };
}
/**
 * Handle external API task
 */
async function handleExternalApi(data) {
    // Simulate network delay
    await sleep(1500);
    // Report progress halfway
    reportProgress(data.taskId, 50);
    // Mock implementation - in a real app, this would make actual API calls
    return {
        success: true,
        url: data.url,
        method: data.method,
        responseCode: 200,
        responseBody: {
            message: "Mock API response",
            timestamp: new Date().toISOString(),
        },
    };
}
/**
 * Handle custom task
 */
async function handleCustomTask(data) {
    // Simulate processing time
    const totalSteps = data.steps || 3;
    for (let i = 1; i <= totalSteps; i++) {
        await sleep(500);
        reportProgress(data.taskId, (i / totalSteps) * 100);
    }
    // Process based on custom task data
    return {
        result: data.expectedResult || "Custom task completed",
        custom: true,
        timestamp: new Date().toISOString(),
    };
}
/**
 * Helper function to sleep for a given time
 */
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
//# sourceMappingURL=TaskWorker.js.map