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
}

class TodoTrackingService extends EventEmitter {
  private static instance: TodoTrackingService;
  private todoItems: TodoItem[] = [];
  private todoStats: TodoStats = {
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
  };
  private refreshInterval: NodeJS.Timeout | null = null;
  private refreshRate: number = 30000; // 30 seconds default

  private constructor() {
    super();
    this.loadInitialData();
    this.startAutoRefresh();
  }

  /**
   * Get the singleton instance of TodoTrackingService
   */
  public static getInstance(): TodoTrackingService {
    if (!TodoTrackingService.instance) {
      TodoTrackingService.instance = new TodoTrackingService();
    }
    return TodoTrackingService.instance;
  }

  /**
   * Load initial data from master-todo.md or localStorage cache
   */
  private async loadInitialData(): Promise<void> {
    try {
      // First try to load from localStorage for immediate display
      const cachedData = localStorage.getItem("todoTracking");
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        this.todoStats = parsed.stats;
        this.todoItems = parsed.items;
      }

      // Then refresh from the actual file
      await this.refreshData();
    } catch (error) {
      console.error("Error loading todo tracking data:", error);
    }
  }

  /**
   * Start auto-refresh of todo data
   */
  public startAutoRefresh(intervalMs: number = this.refreshRate): void {
    this.stopAutoRefresh();
    this.refreshRate = intervalMs;
    this.refreshInterval = setInterval(() => {
      this.refreshData();
    }, intervalMs);
  }

  /**
   * Stop auto-refresh of todo data
   */
  public stopAutoRefresh(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  /**
   * Refresh todo data from master-todo.md
   */
  public async refreshData(): Promise<void> {
    try {
      // In a real implementation, this would read the master-todo.md file
      // For now, we'll simulate it with some sample data
      await this.fetchTodoFileContent();
      this.calculateStats();
      this.emit("todoUpdated", this.todoStats);
      this.saveToLocalStorage();
    } catch (error) {
      console.error("Error refreshing todo data:", error);
    }
  }

  /**
   * Fetch the content of the master-todo.md file
   */
  private async fetchTodoFileContent(): Promise<void> {
    try {
      // In a real implementation, this would fetch the actual file
      // For now, we'll use mock data based on the structure we expect

      // Mock implementation for development purposes
      const response = await fetch("/api/todo");

      if (response.ok) {
        const todoData = await response.json();
        this.parseTodoData(todoData.content);
      } else {
        // If API fails, use mock data
        this.mockTodoData();
      }
    } catch (error) {
      console.error("Error fetching todo file:", error);
      // Fallback to mock data
      this.mockTodoData();
    }
  }

  /**
   * Parse the todo file content and extract todo items
   */
  private parseTodoData(content: string): void {
    // Reset the todo items
    this.todoItems = [];

    // Parse the content and extract todo items
    // This is a simplified implementation
    const lines = content.split("\n");
    let currentCategory = "";
    let currentPriority = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Check for category headers
      if (line.startsWith("##") && !line.startsWith("###")) {
        currentCategory = line.replace(/^##\s+/, "").trim();
        if (currentCategory.includes("Priority 1")) {
          currentPriority = 1;
        } else if (currentCategory.includes("Priority 2")) {
          currentPriority = 2;
        } else if (currentCategory.includes("Priority 3")) {
          currentPriority = 3;
        } else if (currentCategory.includes("Priority 4")) {
          currentPriority = 4;
        } else {
          // Try to extract priority from category (P1, P2, etc.)
          const priorityMatch = currentCategory.match(/\(P(\d+)\)/);
          if (priorityMatch) {
            currentPriority = parseInt(priorityMatch[1]);
          }
        }
      }

      // Check for todo items
      const todoItemMatch = line.match(
        /^-\s+(\🔴|\🟡|\🔵|\🟢|\📌)\s+(?:\*\*(P\d+)\*\*:)?\s+(.*)/
      );
      if (todoItemMatch) {
        const status = this.parseStatus(todoItemMatch[1]);
        const priority = todoItemMatch[2]
          ? parseInt(todoItemMatch[2].replace("P", ""))
          : currentPriority;
        const title = todoItemMatch[3].trim();

        const todoItem: TodoItem = {
          id: `todo-${this.todoItems.length + 1}`,
          title,
          status,
          priority: priority as 1 | 2 | 3 | 4 | 5,
          category: currentCategory,
          tags: [],
          dateCreated: new Date(),
          dateUpdated: new Date(),
        };

        this.todoItems.push(todoItem);
      }
    }
  }

  /**
   * Create mock todo data for development
   */
  private mockTodoData(): void {
    // Create some mock todo items based on the categories in our priority system
    const categories = [
      { name: "AI Infrastructure", priority: 1 },
      { name: "Agent Framework", priority: 1 },
      { name: "Development Tools", priority: 1 },
      { name: "Continuity System", priority: 2 },
      { name: "Mode Orchestration", priority: 2 },
      { name: "Frontend Implementation", priority: 3 },
      { name: "Backend Development", priority: 3 },
      { name: "Mobile Support", priority: 4 },
      { name: "Security & Compliance", priority: 4 },
    ];

    const statuses = [
      "not-started",
      "in-progress",
      "blocked",
      "completed",
      "recurring",
    ];
    const todoItems: TodoItem[] = [];

    // Generate 5-10 tasks per category
    categories.forEach((category) => {
      const taskCount = 5 + Math.floor(Math.random() * 5);
      for (let i = 0; i < taskCount; i++) {
        const randomStatus = statuses[
          Math.floor(Math.random() * statuses.length)
        ] as any;
        todoItems.push({
          id: `todo-${todoItems.length + 1}`,
          title: `${category.name} Task ${i + 1}`,
          status: randomStatus,
          priority: category.priority as 1 | 2 | 3 | 4 | 5,
          category: category.name,
          tags: [`${category.name.toLowerCase().replace(/\s+/g, "-")}`],
          dateCreated: new Date(
            Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
          ),
          dateUpdated: new Date(
            Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
          ),
        });
      }
    });

    this.todoItems = todoItems;
  }

  /**
   * Parse status emoji into status string
   */
  private parseStatus(
    emoji: string
  ): "not-started" | "in-progress" | "blocked" | "completed" | "recurring" {
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
   * Calculate statistics based on todo items
   */
  private calculateStats(): void {
    const stats: TodoStats = {
      categories: {},
      overallProgress: 0,
      totalTasks: this.todoItems.length,
      completedTasks: 0,
      inProgressTasks: 0,
      notStartedTasks: 0,
      blockedTasks: 0,
      highPriorityTasks: 0,
      highPriorityCompleted: 0,
      recentlyCompletedTasks: [],
      upcomingDeadlines: [],
      lastUpdated: new Date(),
    };

    // Process each todo item
    this.todoItems.forEach((item) => {
      // Update category stats
      if (!stats.categories[item.category]) {
        stats.categories[item.category] = {
          name: item.category,
          priority: item.priority,
          progress: 0,
          totalTasks: 0,
          completedTasks: 0,
          inProgressTasks: 0,
          notStartedTasks: 0,
          blockedTasks: 0,
        };
      }

      const category = stats.categories[item.category];
      category.totalTasks++;

      // Update overall counters
      switch (item.status) {
        case "completed":
          stats.completedTasks++;
          category.completedTasks++;
          break;
        case "in-progress":
          stats.inProgressTasks++;
          category.inProgressTasks++;
          break;
        case "not-started":
          stats.notStartedTasks++;
          category.notStartedTasks++;
          break;
        case "blocked":
          stats.blockedTasks++;
          category.blockedTasks++;
          break;
      }

      // Track high priority tasks (P1)
      if (item.priority === 1) {
        stats.highPriorityTasks++;
        if (item.status === "completed") {
          stats.highPriorityCompleted++;
        }
      }

      // Track recently completed tasks (last 7 days)
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      if (item.status === "completed" && item.dateUpdated > oneWeekAgo) {
        stats.recentlyCompletedTasks.push(item);
      }
    });

    // Calculate progress percentages for each category
    Object.values(stats.categories).forEach((category) => {
      category.progress =
        category.totalTasks > 0
          ? Math.round((category.completedTasks / category.totalTasks) * 100)
          : 0;
    });

    // Calculate overall progress
    stats.overallProgress =
      stats.totalTasks > 0
        ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
        : 0;

    // Sort recently completed tasks by date (newest first)
    stats.recentlyCompletedTasks.sort(
      (a, b) => b.dateUpdated.getTime() - a.dateUpdated.getTime()
    );

    this.todoStats = stats;
  }

  /**
   * Save tracking data to localStorage
   */
  private saveToLocalStorage(): void {
    try {
      localStorage.setItem(
        "todoTracking",
        JSON.stringify({
          stats: this.todoStats,
          items: this.todoItems,
        })
      );
    } catch (error) {
      console.error("Error saving todo tracking data:", error);
    }
  }

  /**
   * Get current todo statistics
   */
  public getStats(): TodoStats {
    return this.todoStats;
  }

  /**
   * Get todo items with optional filtering
   */
  public getTodoItems(filter?: {
    category?: string;
    status?:
      | "not-started"
      | "in-progress"
      | "blocked"
      | "completed"
      | "recurring";
    priority?: 1 | 2 | 3 | 4 | 5;
    tag?: string;
  }): TodoItem[] {
    if (!filter) {
      return this.todoItems;
    }

    return this.todoItems.filter((item) => {
      if (filter.category && item.category !== filter.category) {
        return false;
      }
      if (filter.status && item.status !== filter.status) {
        return false;
      }
      if (filter.priority && item.priority !== filter.priority) {
        return false;
      }
      if (filter.tag && !item.tags.includes(filter.tag)) {
        return false;
      }
      return true;
    });
  }

  /**
   * Register a listener for todo updates
   */
  public onTodoUpdated(callback: (stats: TodoStats) => void): () => void {
    this.on("todoUpdated", callback);
    return () => {
      this.off("todoUpdated", callback);
    };
  }
}

// Export singleton instance
export default TodoTrackingService.getInstance();
