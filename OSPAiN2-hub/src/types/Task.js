"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkerMessageType = exports.TaskType = exports.TaskStatus = exports.TaskPriority = void 0;
/**
 * Task Priority Levels
 */
var TaskPriority;
(function (TaskPriority) {
    TaskPriority[TaskPriority["CRITICAL"] = 0] = "CRITICAL";
    TaskPriority[TaskPriority["HIGH"] = 1] = "HIGH";
    TaskPriority[TaskPriority["MEDIUM"] = 2] = "MEDIUM";
    TaskPriority[TaskPriority["LOW"] = 3] = "LOW";
    TaskPriority[TaskPriority["BACKGROUND"] = 4] = "BACKGROUND";
})(TaskPriority || (exports.TaskPriority = TaskPriority = {}));
/**
 * Task Status Values
 */
var TaskStatus;
(function (TaskStatus) {
    TaskStatus["PENDING"] = "pending";
    TaskStatus["RUNNING"] = "running";
    TaskStatus["COMPLETED"] = "completed";
    TaskStatus["FAILED"] = "failed";
    TaskStatus["CANCELLED"] = "cancelled";
    TaskStatus["RETRY"] = "retry";
})(TaskStatus || (exports.TaskStatus = TaskStatus = {}));
/**
 * Task Type - defines different types of tasks that can be processed
 */
var TaskType;
(function (TaskType) {
    TaskType["MODEL_REQUEST"] = "model_request";
    TaskType["EMBEDDINGS"] = "embeddings";
    TaskType["FILE_OPERATION"] = "file_operation";
    TaskType["DATA_PROCESSING"] = "data_processing";
    TaskType["EXTERNAL_API"] = "external_api";
    TaskType["CUSTOM"] = "custom";
})(TaskType || (exports.TaskType = TaskType = {}));
/**
 * Worker Message Types
 */
var WorkerMessageType;
(function (WorkerMessageType) {
    WorkerMessageType["TASK_ASSIGNED"] = "task_assigned";
    WorkerMessageType["TASK_COMPLETED"] = "task_completed";
    WorkerMessageType["TASK_FAILED"] = "task_failed";
    WorkerMessageType["TASK_PROGRESS"] = "task_progress";
    WorkerMessageType["WORKER_READY"] = "worker_ready";
    WorkerMessageType["WORKER_BUSY"] = "worker_busy";
    WorkerMessageType["WORKER_ERROR"] = "worker_error";
    WorkerMessageType["WORKER_TERMINATED"] = "worker_terminated";
})(WorkerMessageType || (exports.WorkerMessageType = WorkerMessageType = {}));
//# sourceMappingURL=Task.js.map