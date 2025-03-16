/**
 * TodoTrackingService
 *
 * A service that handles real-time tracking of todo items from the master-todo.md file.
 * It provides functionality to parse the todo file, calculate progress, track changes,
 * and notify listeners of updates.
 */

import { EventEmitter } from "events";

/**
 * Interface representing a todo item
 */
export interface TodoItem {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: number;
  category: string;
  tags: string[];
  horizon?: string;
  dateCreated?: Date;
  lastUpdated: Date;
  dueDate?: Date;
  source?: 'local' | 'notion' | 'github' | 'other';
  sourceUrl?: string;
  customFields?: Record<string, any>;
}

/**
 * Interface representing task statistics
 */
export interface TodoStats {
  total: number;
  byStatus: Record<string, number>;
  byPriority: Record<number, number>;
  byHorizon: Record<string, number>;
  byCategory: Record<string, number>;
  byTag: Record<string, number>;
}

class TodoTrackingService {
  private static instance: TodoTrackingService;
  private todoFilePath: string = "/@master-todo.mdc";
  private tasks: TodoItem[] = [];
  private stats: TodoStats = {
    total: 0,
    byStatus: {},
    byPriority: {},
    byHorizon: {},
    byCategory: {},
    byTag: {},
  };
  private eventEmitter = new EventEmitter();
  private refreshInterval: NodeJS.Timeout | null = null;
  private isRefreshing = false;
  private categories: string[] = [];
  private tags: string[] = [];
  private statuses: string[] = ['not-started', 'in-progress', 'completed', 'blocked', 'recurring'];
  private horizons: string[] = ['H1', 'H2', 'H3'];

  constructor() {
    if (TodoTrackingService.instance) {
      return TodoTrackingService.instance;
    }
    TodoTrackingService.instance = this;
    this.refreshData();
    this.startRefreshInterval();
    this.loadSampleData(); // Load sample data for development
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
    task.lastUpdated = new Date();

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
    task.lastUpdated = new Date();

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
    const categories: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    const byPriority: Record<number, number> = {};
    const byHorizon: Record<string, number> = {};
    const byTag: Record<string, number> = {};
    let total = 0;

    // Process all tasks
    for (const task of this.tasks) {
      total++;

      // Update status counts
      if (task.status) {
        byStatus[task.status] = (byStatus[task.status] || 0) + 1;
      }

      // Process priority
      if (task.priority) {
        byPriority[task.priority] = (byPriority[task.priority] || 0) + 1;
      }

      // Process horizon
      if (task.horizon) {
        byHorizon[task.horizon] = (byHorizon[task.horizon] || 0) + 1;
      }

      // Process category
      if (task.category) {
        categories[task.category] = (categories[task.category] || 0) + 1;
      }

      // Process tags
      if (task.tags && Array.isArray(task.tags)) {
        task.tags.forEach(tag => {
          byTag[tag] = (byTag[tag] || 0) + 1;
        });
      }
    }

    // Update stats
    this.stats = {
      total,
      byStatus,
      byPriority,
      byHorizon,
      byCategory: categories,
      byTag,
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
          lastUpdated: new Date(),
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
            lastUpdated: new Date(),
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
      lastUpdated: task.lastUpdated || new Date(),
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
    // In a real implementation, this would update the @master-todo.mdc file
    console.log("Syncing tasks to file (placeholder)");

    // For now, only update the in-memory representation
    // The real implementation would call an API endpoint to update the file

    // TODO: Implement actual file sync
    return Promise.resolve();
  }

  /**
   * Get available categories
   */
  public getCategories(): string[] {
    return [...this.categories];
  }

  /**
   * Get available tags
   */
  public getTags(): string[] {
    return [...this.tags];
  }

  /**
   * Get available statuses
   */
  public getStatuses(): string[] {
    return [...this.statuses];
  }

  /**
   * Get available horizons
   */
  public getHorizons(): string[] {
    return [...this.horizons];
  }

  /**
   * Add a new task
   */
  public async addTask(task: Omit<TodoItem, 'id' | 'dateCreated' | 'lastUpdated'>): Promise<TodoItem> {
    const now = new Date();
    const newTask: TodoItem = {
      id: `task-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      dateCreated: now,
      lastUpdated: now,
      source: 'local',
      ...task,
    };
    
    this.tasks.push(newTask);
    this.updateMetadata();
    this.emitChange();
    
    return newTask;
  }

  /**
   * Update metadata from tasks
   */
  private updateMetadata(): void {
    const categoriesSet = new Set<string>();
    const tagsSet = new Set<string>();
    const statusesSet = new Set<string>(this.statuses);
    const horizonsSet = new Set<string>(this.horizons);
    
    this.tasks.forEach(task => {
      if (task.category) {
        categoriesSet.add(task.category);
      }
      
      if (task.tags && Array.isArray(task.tags)) {
        task.tags.forEach(tag => tagsSet.add(tag));
      }
      
      if (task.status) {
        statusesSet.add(task.status);
      }
      
      if (task.horizon) {
        horizonsSet.add(task.horizon);
      }
    });
    
    this.categories = Array.from(categoriesSet);
    this.tags = Array.from(tagsSet);
    this.statuses = Array.from(statusesSet);
    this.horizons = Array.from(horizonsSet);
  }

  /**
   * Emit change event
   */
  private emitChange(): void {
    this.eventEmitter.emit('change');
  }

  /**
   * Load sample data
   */
  private loadSampleData(): void {
    const sampleTasks: TodoItem[] = [
      {
        id: 'task-1',
        title: 'Implement Notion Integration',
        description: 'Integrate TodoManager with Notion to sync tasks between the app and Notion databases.',
        status: 'in-progress',
        priority: 1,
        category: 'Development',
        tags: ['notion', 'integration', 'sync'],
        horizon: 'H1',
        dateCreated: new Date(Date.now() - 86400000 * 3), // 3 days ago
        lastUpdated: new Date(),
        source: 'local',
      },
      {
        id: 'task-2',
        title: 'Create UI Components',
        description: 'Design and implement reusable UI components for the application.',
        status: 'completed',
        priority: 2,
        category: 'UI/UX',
        tags: ['ui', 'components', 'design'],
        horizon: 'H1',
        dateCreated: new Date(Date.now() - 86400000 * 5), // 5 days ago
        lastUpdated: new Date(Date.now() - 86400000), // 1 day ago
        source: 'local',
      },
      {
        id: 'task-3',
        title: 'Implement Task Filtering',
        description: 'Add ability to filter tasks by status, priority, tags, and other criteria.',
        status: 'not-started',
        priority: 3,
        category: 'Development',
        tags: ['filtering', 'search'],
        horizon: 'H2',
        dateCreated: new Date(Date.now() - 86400000 * 2), // 2 days ago
        lastUpdated: new Date(Date.now() - 86400000 * 2), // 2 days ago
        source: 'local',
      },
      {
        id: 'task-4',
        title: 'Add Sync Status Indicators',
        description: 'Show sync status indicators for tasks that are synced with external services.',
        status: 'not-started',
        priority: 2,
        category: 'UI/UX',
        tags: ['sync', 'ui'],
        horizon: 'H1',
        dateCreated: new Date(Date.now() - 86400000), // 1 day ago
        lastUpdated: new Date(Date.now() - 86400000), // 1 day ago
        source: 'local',
      },
      {
        id: 'notion-1',
        title: 'Sample Notion Task',
        description: 'This is a sample task that would be synced from Notion.',
        status: 'not-started',
        priority: 2,
        category: 'Documentation',
        tags: ['notion', 'sample'],
        horizon: 'H2',
        dateCreated: new Date(Date.now() - 86400000 * 4), // 4 days ago
        lastUpdated: new Date(Date.now() - 86400000 * 2), // 2 days ago
        source: 'notion',
        sourceUrl: 'https://www.notion.so/sample-page',
      },
    ];
    
    this.tasks = sampleTasks;
    this.updateMetadata();
  }
}

// Export singleton instance
const todoTrackingService = new TodoTrackingService();
export default todoTrackingService;
