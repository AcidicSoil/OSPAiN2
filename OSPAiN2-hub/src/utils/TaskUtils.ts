import { v4 as uuidv4 } from "uuid";
import {
  TaskType,
  TaskPriority,
  TaskStatus,
  TaskOptions,
  Task,
  ModelRequestTaskData,
  EmbeddingsTaskData,
  FileOperationTaskData,
  ExternalApiTaskData,
} from "../types/Task";
import taskQueue from "../services/TaskQueue";
import workerManager from "../services/WorkerManager";

// Extended TaskOptions interface to include optional id
interface ExtendedTaskOptions extends TaskOptions {
  id?: string;
}

// Extended model request options
interface ModelRequestOptions extends Partial<TaskOptions> {
  contextItems?: any[];
}

/**
 * Utility class providing helper methods for working with tasks
 */
export class TaskUtils {
  /**
   * Create a model request task
   *
   * @param prompt The prompt to send to the model
   * @param options Additional task options
   * @returns The created task ID
   */
  static async createModelRequest(
    prompt: string,
    modelId: string, // Make modelId required
    options?: ModelRequestOptions // Use extended options
  ): Promise<string> {
    const taskData: ModelRequestTaskData = {
      prompt,
      modelId,
      // Store context items in options property which exists in ModelRequestTaskData
      options: {
        contextItems: options?.contextItems || [],
      },
    };

    return this.createTask({
      type: TaskType.MODEL_REQUEST,
      priority: options?.priority || TaskPriority.HIGH,
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
  static async createEmbeddingsTask(
    texts: string[],
    dimensions?: number,
    options?: Partial<TaskOptions> & { model?: string } // Add model to options
  ): Promise<string> {
    const taskData: EmbeddingsTaskData = {
      texts,
      dimensions: dimensions || 1536,
      modelId: options?.model || "default-embedding-model",
    };

    return this.createTask({
      type: TaskType.EMBEDDINGS,
      priority: options?.priority || TaskPriority.MEDIUM,
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
  static async createFileOperation(
    operation: "read" | "write" | "delete" | "copy" | "move",
    sourcePath: string,
    destinationPath?: string,
    content?: string,
    options?: Partial<TaskOptions>
  ): Promise<string> {
    const taskData: FileOperationTaskData = {
      operation,
      sourcePath,
      destinationPath,
      content,
    };

    return this.createTask({
      type: TaskType.FILE_OPERATION,
      priority: options?.priority || TaskPriority.MEDIUM,
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
  static async createDataProcessingTask(
    processorName: string,
    data: any,
    size?: number,
    options?: Partial<TaskOptions>
  ): Promise<string> {
    const taskData = {
      processorName,
      data,
      size:
        size ||
        (typeof data === "object"
          ? JSON.stringify(data).length
          : String(data).length),
    };

    return this.createTask({
      type: TaskType.DATA_PROCESSING,
      priority: options?.priority || TaskPriority.MEDIUM,
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
  static async createExternalApiTask(
    url: string,
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
    headers?: Record<string, string>,
    body?: any,
    options?: Partial<TaskOptions>
  ): Promise<string> {
    const taskData: ExternalApiTaskData = {
      url,
      method,
      headers: headers || {},
      body,
    };

    return this.createTask({
      type: TaskType.EXTERNAL_API,
      priority: options?.priority || TaskPriority.MEDIUM,
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
  static async createCustomTask(
    customType: string,
    data: any,
    options?: Partial<TaskOptions>
  ): Promise<string> {
    return this.createTask({
      type: TaskType.CUSTOM,
      priority: options?.priority || TaskPriority.MEDIUM,
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
  static async createTask(options: ExtendedTaskOptions): Promise<string> {
    // Create a unique ID for the task
    const taskId = options.id || uuidv4();

    // Create the task object
    const task: Task = {
      id: taskId,
      type: options.type,
      priority: options.priority || TaskPriority.MEDIUM,
      status: TaskStatus.PENDING,
      data: options.data || {},
      createdAt: new Date(),
      attempts: 0,
      maxAttempts: options.maxAttempts || 1,
      tags: options.tags || [],
      dependencies: options.dependencies || [],
      progress: 0,
    };

    // Add the task to the queue
    await taskQueue.addTask(task);

    // Start the worker manager if it's not already running
    const workerStatus = workerManager.getStatus();
    if (!workerStatus.isRunning) {
      await workerManager.start();
    }

    return taskId;
  }

  /**
   * Cancel a task by ID
   *
   * @param taskId The ID of the task to cancel
   * @returns Whether the task was successfully cancelled
   */
  static async cancelTask(taskId: string): Promise<boolean> {
    const task = await taskQueue.cancelTask(taskId);
    // Convert Task to boolean return value - true if task was found and canceled
    return !!task;
  }

  /**
   * Get a task by ID
   *
   * @param taskId The ID of the task to retrieve
   * @returns The task, or null if not found
   */
  static async getTask(taskId: string): Promise<Task | null> {
    const task = await taskQueue.getTask(taskId);
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
  static async waitForTask(
    taskId: string,
    timeoutMs: number = 30000
  ): Promise<Task | null> {
    const task = await taskQueue.getTask(taskId);

    if (!task) {
      return null;
    }

    // If task is already completed, failed, or cancelled, return it immediately
    if (
      task.status === TaskStatus.COMPLETED ||
      task.status === TaskStatus.FAILED ||
      task.status === TaskStatus.CANCELLED
    ) {
      return task;
    }

    // Wait for task to complete
    return new Promise((resolve) => {
      const startTime = Date.now();

      // Function to check task status
      const checkStatus = async () => {
        const currentTask = await taskQueue.getTask(taskId);

        // If task doesn't exist anymore, return null
        if (!currentTask) {
          return resolve(null);
        }

        // If task is completed, failed, or cancelled, return it
        if (
          currentTask.status === TaskStatus.COMPLETED ||
          currentTask.status === TaskStatus.FAILED ||
          currentTask.status === TaskStatus.CANCELLED
        ) {
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
