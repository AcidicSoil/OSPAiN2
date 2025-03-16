/**
 * Task Priority Levels
 */
export enum TaskPriority {
  CRITICAL = 0, // Urgent tasks that must be executed immediately
  HIGH = 1, // Important tasks with high priority
  MEDIUM = 2, // Normal priority tasks
  LOW = 3, // Tasks that can wait if system is under load
  BACKGROUND = 4, // Tasks that should only run when system is idle
}

/**
 * Task Status Values
 */
export enum TaskStatus {
  PENDING = "pending", // Task is waiting to be processed
  RUNNING = "running", // Task is currently being processed
  COMPLETED = "completed", // Task has been successfully completed
  FAILED = "failed", // Task has failed
  CANCELLED = "cancelled", // Task was cancelled before completion
  RETRY = "retry", // Task is scheduled for retry after failure
}

/**
 * Task Type - defines different types of tasks that can be processed
 */
export enum TaskType {
  MODEL_REQUEST = "model_request", // Request to an AI model
  EMBEDDINGS = "embeddings", // Generate embeddings for text
  FILE_OPERATION = "file_operation", // File system operations
  DATA_PROCESSING = "data_processing", // Process data
  EXTERNAL_API = "external_api", // Call to an external API
  CUSTOM = "custom", // Custom task type
}

/**
 * Base Task Interface
 *
 * Defines the common structure for all tasks that can be processed
 * by the worker system.
 */
export interface Task {
  id: string; // Unique identifier for the task
  type: TaskType; // Type of task
  priority: TaskPriority; // Priority level
  status: TaskStatus; // Current status
  data: any; // Task data payload
  createdAt: Date; // When the task was created
  startedAt?: Date; // When the task started processing
  completedAt?: Date; // When the task was completed
  error?: Error | string; // Error information if task failed
  attempts: number; // Number of attempts made
  maxAttempts: number; // Maximum number of retry attempts
  dependencies?: string[]; // IDs of tasks that must complete before this one
  tags?: string[]; // Optional tags for categorization
  workerId?: string; // ID of worker processing this task
  progress?: number; // Progress percentage (0-100)
  result?: any; // Task result data
  processingTime?: number; // Time taken to process the task in milliseconds
  dueDate?: Date; // When the task is due to be completed
}

/**
 * Task Creation Options
 *
 * Options for creating a new task.
 */
export interface TaskOptions {
  type: TaskType;
  priority?: TaskPriority;
  data: any;
  maxAttempts?: number;
  dependencies?: string[];
  tags?: string[];
}

/**
 * Worker Message Types
 */
export enum WorkerMessageType {
  TASK_ASSIGNED = "task_assigned",
  TASK_COMPLETED = "task_completed",
  TASK_FAILED = "task_failed",
  TASK_PROGRESS = "task_progress",
  WORKER_READY = "worker_ready",
  WORKER_BUSY = "worker_busy",
  WORKER_ERROR = "worker_error",
  WORKER_TERMINATED = "worker_terminated",
}

/**
 * Worker Message Interface
 *
 * Used for communication between the manager and worker threads.
 */
export interface WorkerMessage {
  type: WorkerMessageType;
  taskId?: string;
  workerId?: string;
  data?: any;
  progress?: number;
  error?: string;
  timestamp: Date;
}

/**
 * Task Result Interface
 *
 * Standardized format for task results.
 */
export interface TaskResult {
  taskId: string;
  success: boolean;
  data?: any;
  error?: string;
  processingTime?: number; // in milliseconds
}

/**
 * Model Request Task Data
 */
export interface ModelRequestTaskData {
  modelId: string;
  prompt: string;
  temperature?: number;
  maxTokens?: number;
  options?: Record<string, any>;
}

/**
 * Embeddings Task Data
 */
export interface EmbeddingsTaskData {
  texts: string[];
  modelId?: string;
  dimensions?: number;
}

/**
 * File Operation Task Data
 */
export interface FileOperationTaskData {
  operation: "read" | "write" | "delete" | "copy" | "move";
  sourcePath: string;
  destinationPath?: string;
  content?: string;
  options?: Record<string, any>;
}

/**
 * External API Task Data
 */
export interface ExternalApiTaskData {
  url: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}
