/**
 * TodoTrackingService
 *
 * A service that handles real-time tracking of todo items from the master-todo.md file.
 * It provides functionality to parse the todo file, calculate progress, track changes,
 * and notify listeners of updates.
 */

import { EventEmitter } from "events";

export interface TodoItem {
  id: string;
  title: string;
  status: "not-started" | "in-progress" | "blocked" | "completed" | "recurring";
  priority: 1 | 2 | 3 | 4 | 5;
  category: string;
  tags: string[];
  dateCreated: Date;
  dateUpdated: Date;
  description?: string;
  subTasks?: TodoItem[];
}

export interface TodoCategory {
  name: string;
  priority: number;
  progress: number;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  notStartedTasks: number;
  blockedTasks: number;
}

export interface TodoStats {
  categories: Record<string, TodoCategory>;
  overallProgress: number;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  notStartedTasks: number;
  blockedTasks: number;
  highPriorityTasks: number;
  highPriorityCompleted: number;
  recentlyCompletedTasks: TodoItem[];
  upcomingDeadlines: TodoItem[];
  lastUpdated: Date;
  recurringTasks: number;
}

class TodoTrackingService {
  private static instance: TodoTrackingService;
  private todoFilePath: string = "/master-todo.mdc";
  private tasks: TodoItem[] = [];
  private stats: TodoStats = {
    categories: {},
    overallProgress: 0,
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    notStartedTasks: 0,
    blockedTasks: 0,
    highPriorityTasks: 0,
    highPriorityCompleted: 0,
    recentlyCompletedTasks: [],
    upcomingDeadlines: [],
    lastUpdated: new Date(),
    recurringTasks: 0,
  };
  private eventEmitter = new EventEmitter();
  private refreshInterval: NodeJS.Timeout | null = null;
  private isRefreshing = false;

  constructor() {
    if (TodoTrackingService.instance) {
      return TodoTrackingService.instance;
    }
    TodoTrackingService.instance = this;
    this.refreshData();
    this.startRefreshInterval();
  }

  /**
   * Start automatic refresh interval
   */
  private startRefreshInterval(intervalMs: number = 60000): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    this.refreshInterval = setInterval(() => {
      this.refreshData();
    }, intervalMs);
  }

  /**
   * Stop automatic refresh interval
   */
  private stopRefreshInterval(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  /**
   * Gets the current stats object
   */
  getStats(): TodoStats {
    return this.stats;
  }

  /**
   * Gets all tasks from the service
   */
  getAllTasks(): TodoItem[] {
    return [...this.tasks];
  }

  /**
   * Get a single task by ID
   */
  getTaskById(id: string): TodoItem | undefined {
    return this.tasks.find((task) => task.id === id);
  }

  /**
   * Updates an existing task
   */
  async updateTask(task: TodoItem): Promise<TodoItem> {
    const taskIndex = this.tasks.findIndex((t) => t.id === task.id);
    if (taskIndex === -1) {
      throw new Error(`Task with ID ${task.id} not found`);
    }

    // Update the dateUpdated field
    task.dateUpdated = new Date();

    // Replace the task in the array
    this.tasks[taskIndex] = task;

    // Sync changes to file
    await this.syncToFile();

    // Update stats and notify listeners
    this.calculateStats();
    this.notifyListeners();

    return task;
  }

  /**
   * Creates a new task
   */
  async createTask(task: TodoItem): Promise<TodoItem> {
    // Generate ID if not provided
    if (!task.id) {
      task.id = this.generateId();
    }

    // Set timestamps
    task.dateCreated = task.dateCreated || new Date();
    task.dateUpdated = new Date();

    // Add to tasks array
    this.tasks.push(task);

    // Sync changes to file
    await this.syncToFile();

    // Update stats and notify listeners
    this.calculateStats();
    this.notifyListeners();

    return task;
  }

  /**
   * Deletes a task by ID
   */
  async deleteTask(id: string): Promise<boolean> {
    const taskIndex = this.tasks.findIndex((t) => t.id === id);
    if (taskIndex === -1) {
      throw new Error(`Task with ID ${id} not found`);
    }

    // Remove from array
    this.tasks.splice(taskIndex, 1);

    // Sync changes to file
    await this.syncToFile();

    // Update stats and notify listeners
    this.calculateStats();
    this.notifyListeners();

    return true;
  }

  /**
   * Refreshes data from the todo file
   */
  async refreshData(): Promise<void> {
    if (this.isRefreshing) return;

    this.isRefreshing = true;
    try {
      // Fetch the todo file
      const response = await fetch(this.todoFilePath);
      if (!response.ok) {
        throw new Error(`Failed to fetch todo file: ${response.statusText}`);
      }

      const text = await response.text();

      // Parse the todo file
      this.tasks = this.parseTodoFile(text);

      // Calculate stats
      this.calculateStats();

      // Update last refresh time
      this.stats.lastUpdated = new Date();

      // Notify listeners
      this.notifyListeners();
    } catch (error) {
      console.error("Error refreshing todo data:", error);
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * Subscribe to todo updates
   */
  onTodoUpdated(callback: (stats: TodoStats) => void): () => void {
    this.eventEmitter.on("todoUpdated", callback);
    return () => {
      this.eventEmitter.off("todoUpdated", callback);
    };
  }

  /**
   * Notify all listeners of updates
   */
  private notifyListeners(): void {
    this.eventEmitter.emit("todoUpdated", this.stats);
  }

  /**
   * Calculate stats from tasks
   */
  private calculateStats(): void {
    const categories: Record<string, TodoCategory> = {};
    let totalTasks = 0;
    let completedTasks = 0;
    let inProgressTasks = 0;
    let notStartedTasks = 0;
    let blockedTasks = 0;
    let recurringTasks = 0;
    const upcomingDeadlines: TodoItem[] = [];

    // Process all tasks
    for (const task of this.tasks) {
      totalTasks++;

      // Update status counts
      switch (task.status) {
        case "completed":
          completedTasks++;
          break;
        case "in-progress":
          inProgressTasks++;
          break;
        case "not-started":
          notStartedTasks++;
          break;
        case "blocked":
          blockedTasks++;
          break;
        case "recurring":
          recurringTasks++;
          break;
      }

      // Process category
      if (task.category) {
        if (!categories[task.category]) {
          categories[task.category] = {
            name: task.category,
            priority: 0,
            progress: 0,
            totalTasks: 0,
            completedTasks: 0,
            inProgressTasks: 0,
            notStartedTasks: 0,
            blockedTasks: 0,
          };
        }

        const category = categories[task.category];
        category.totalTasks++;

        // Update category status counts
        switch (task.status) {
          case "completed":
            category.completedTasks++;
            break;
          case "in-progress":
            category.inProgressTasks++;
            break;
          case "not-started":
            category.notStartedTasks++;
            break;
          case "blocked":
            category.blockedTasks++;
            break;
        }

        // Calculate category progress
        category.progress =
          category.totalTasks > 0
            ? (category.completedTasks / category.totalTasks) * 100
            : 0;
      }

      // Track high priority tasks (P1)
      if (task.priority === 1) {
        this.stats.highPriorityTasks++;
        if (task.status === "completed") {
          this.stats.highPriorityCompleted++;
        }
      }

      // Track recently completed tasks (last 7 days)
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      if (task.status === "completed" && task.dateUpdated > oneWeekAgo) {
        this.stats.recentlyCompletedTasks.push(task);
      }

      // Check for deadlines (This would use a separate deadline field in a real implementation)
      // For now, just add high priority in-progress tasks
      if (task.priority <= 2 && task.status === "in-progress") {
        upcomingDeadlines.push(task);
      }
    }

    // Calculate overall progress
    this.stats.overallProgress =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Sort recently completed tasks by date (newest first)
    this.stats.recentlyCompletedTasks.sort(
      (a, b) => b.dateUpdated.getTime() - a.dateUpdated.getTime()
    );

    // Update stats
    this.stats = {
      categories,
      overallProgress: this.stats.overallProgress,
      totalTasks,
      completedTasks,
      inProgressTasks,
      notStartedTasks,
      blockedTasks,
      highPriorityTasks: this.stats.highPriorityTasks,
      highPriorityCompleted: this.stats.highPriorityCompleted,
      recentlyCompletedTasks: this.stats.recentlyCompletedTasks,
      upcomingDeadlines,
      lastUpdated: new Date(),
      recurringTasks,
    };
  }

  /**
   * Parse the todo file into tasks
   */
  private parseTodoFile(text: string): TodoItem[] {
    const tasks: TodoItem[] = [];
    const lines = text.split("\n");

    let currentTask: Partial<TodoItem> | null = null;
    let currentSubTasks: Partial<TodoItem>[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Task line: - 🔴 [H1] **P1**: Task title
      const taskMatch = line.match(
        /^- (🔴|🟡|🔵|🟢|📌) \[(H[123])\] \*\*P([12345])\*\*: (.+)$/
      );
      if (taskMatch) {
        // Save previous task if exists
        if (currentTask && currentTask.title) {
          tasks.push(this.createTaskFromParsed(currentTask, currentSubTasks));
          currentSubTasks = [];
        }

        // Parse new task
        const [, statusEmoji, horizon, priority, title] = taskMatch;

        currentTask = {
          id: this.generateId(),
          title: title.trim(),
          status: this.emojiToStatus(statusEmoji),
          priority: parseInt(priority) as 1 | 2 | 3 | 4 | 5,
          tags: [horizon],
          category: this.determineCategory(line, lines, i),
          dateCreated: new Date(),
          dateUpdated: new Date(),
        };

        // Add description if next lines are indented
        let description = "";
        let j = i + 1;
        while (j < lines.length && lines[j].match(/^\s{2,}/)) {
          // Skip if it's a subtask
          if (lines[j].match(/^\s{2,}- \[ \]/)) {
            break;
          }
          if (description) description += "\n";
          description += lines[j].trim();
          j++;
        }

        if (description) {
          currentTask.description = description;
        }

        // Look for subtasks
        while (j < lines.length) {
          const subtaskMatch = lines[j].match(/^\s{2,}- \[([ xX])\] (.+)$/);
          if (!subtaskMatch) break;

          const [, statusMark, subtaskTitle] = subtaskMatch;

          currentSubTasks.push({
            id: this.generateId(),
            title: subtaskTitle.trim(),
            status:
              statusMark.toLowerCase() === "x" ? "completed" : "not-started",
            priority: currentTask.priority,
            category: currentTask.category,
            tags: [...(currentTask.tags || [])],
            dateCreated: new Date(),
            dateUpdated: new Date(),
          });

          j++;
        }
      }
    }

    // Add the last task if exists
    if (currentTask && currentTask.title) {
      tasks.push(this.createTaskFromParsed(currentTask, currentSubTasks));
    }

    return tasks;
  }

  /**
   * Creates a TodoItem from parsed task data
   */
  private createTaskFromParsed(
    task: Partial<TodoItem>,
    subTasks: Partial<TodoItem>[]
  ): TodoItem {
    return {
      id: task.id || this.generateId(),
      title: task.title || "",
      status: task.status || "not-started",
      priority: task.priority || 3,
      category: task.category || "Uncategorized",
      tags: task.tags || [],
      dateCreated: task.dateCreated || new Date(),
      dateUpdated: task.dateUpdated || new Date(),
      description: task.description,
      subTasks: subTasks.length > 0 ? (subTasks as TodoItem[]) : undefined,
    };
  }

  /**
   * Convert emoji to status
   */
  private emojiToStatus(emoji: string): TodoItem["status"] {
    switch (emoji) {
      case "🔴":
        return "not-started";
      case "🟡":
        return "in-progress";
      case "🔵":
        return "blocked";
      case "🟢":
        return "completed";
      case "📌":
        return "recurring";
      default:
        return "not-started";
    }
  }

  /**
   * Determine category from context
   */
  private determineCategory(
    line: string,
    lines: string[],
    currentIndex: number
  ): string {
    // Look for section headings above the current line
    for (let i = currentIndex - 1; i >= 0; i--) {
      const headerMatch = lines[i].match(/^#{2,3}\s+(.+?)$/);
      if (headerMatch) {
        // Skip certain headers that aren't categories
        const header = headerMatch[1];
        if (
          header === "Current Active Tasks" ||
          header === "Recently Completed Tasks" ||
          header === "Progress Tracking" ||
          header === "CURRENT HORIZONS" ||
          header === "#LEARNINGS"
        ) {
          continue;
        }
        return header;
      }
    }
    return "Uncategorized";
  }

  /**
   * Generate a unique ID
   */
  private generateId(): string {
    return "task_" + Math.random().toString(36).substring(2, 15);
  }

  /**
   * Sync tasks back to the file
   * Note: This is a placeholder - in a real implementation, this would use an API to update the file
   */
  private async syncToFile(): Promise<void> {
    // In a real implementation, this would update the master-todo.mdc file
    console.log("Syncing tasks to file (placeholder)");

    // For now, only update the in-memory representation
    // The real implementation would call an API endpoint to update the file

    // TODO: Implement actual file sync
    return Promise.resolve();
  }
}

// Export singleton instance
const todoTrackingService = new TodoTrackingService();
export default todoTrackingService;
