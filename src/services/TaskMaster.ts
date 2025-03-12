import { LogEntry } from "../types/debug";
import DebugMcpService from "./DebugMcpService";

interface TaskInstruction {
  id: string;
  description: string;
  priority: "high" | "medium" | "low";
  status: "pending" | "in-progress" | "completed" | "failed";
  dependencies?: string[];
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

class TaskMaster {
  private static instance: TaskMaster;
  private currentTasks: Map<string, TaskInstruction> = new Map();
  private debugService: typeof DebugMcpService;

  private constructor() {
    this.debugService = DebugMcpService;
    this.initializeLogging();
  }

  static getInstance(): TaskMaster {
    if (!TaskMaster.instance) {
      TaskMaster.instance = new TaskMaster();
    }
    return TaskMaster.instance;
  }

  private initializeLogging(): void {
    this.debugService.onLog((log: LogEntry) => {
      if (log.level === "error") {
        this.handleError(log);
      }
    });
  }

  private handleError(log: LogEntry): void {
    // Create a task to resolve the error
    this.createTask({
      description: `Resolve error: ${log.message}`,
      priority: "high",
      dependencies: [],
    });
  }

  createTask({
    description,
    priority,
    dependencies = [],
  }: {
    description: string;
    priority: "high" | "medium" | "low";
    dependencies?: string[];
  }): string {
    const id = Date.now().toString();
    const task: TaskInstruction = {
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

  startTask(taskId: string): void {
    const task = this.currentTasks.get(taskId);
    if (task && this.canStartTask(task)) {
      task.status = "in-progress";
      task.startedAt = new Date();
      this.currentTasks.set(taskId, task);
    }
  }

  completeTask(taskId: string): void {
    const task = this.currentTasks.get(taskId);
    if (task) {
      task.status = "completed";
      task.completedAt = new Date();
      this.currentTasks.set(taskId, task);
      this.checkDependentTasks(taskId);
    }
  }

  failTask(taskId: string): void {
    const task = this.currentTasks.get(taskId);
    if (task) {
      task.status = "failed";
      this.currentTasks.set(taskId, task);
    }
  }

  private canStartTask(task: TaskInstruction): boolean {
    if (!task.dependencies?.length) return true;
    return task.dependencies.every((depId) => {
      const depTask = this.currentTasks.get(depId);
      return depTask?.status === "completed";
    });
  }

  private checkDependentTasks(completedTaskId: string): void {
    this.currentTasks.forEach((task) => {
      if (
        task.dependencies?.includes(completedTaskId) &&
        this.canStartTask(task)
      ) {
        this.startTask(task.id);
      }
    });
  }

  getNextTask(): TaskInstruction | null {
    const pendingTasks = Array.from(this.currentTasks.values())
      .filter((task) => task.status === "pending" && this.canStartTask(task))
      .sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });

    return pendingTasks[0] || null;
  }

  getCurrentTasks(): TaskInstruction[] {
    return Array.from(this.currentTasks.values());
  }

  // Server monitoring tasks
  async checkLocalServer(): Promise<void> {
    try {
      const response = await fetch("http://localhost:3000/health");
      if (!response.ok) {
        this.createTask({
          description:
            "Local server health check failed. Server needs attention.",
          priority: "high",
        });
      }
    } catch (error) {
      this.createTask({
        description: "Local server is not running. Start the server.",
        priority: "high",
      });
    }
  }

  // Console error monitoring
  monitorConsoleErrors(): void {
    const originalConsoleError = console.error;
    console.error = (...args: any[]) => {
      this.createTask({
        description: `Console error detected: ${args.join(" ")}`,
        priority: "high",
      });
      originalConsoleError.apply(console, args);
    };
  }

  // Task execution monitoring
  startTaskMonitoring(): void {
    setInterval(() => {
      const nextTask = this.getNextTask();
      if (nextTask) {
        this.startTask(nextTask.id);
      }
    }, 5000); // Check every 5 seconds
  }
}

export default TaskMaster.getInstance();
