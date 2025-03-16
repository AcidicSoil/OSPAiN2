import { TodoTask } from "../components/todo/ProgressTracker";

export interface TaskStatus {
  total: number;
  completed: number;
  inProgress: number;
  notStarted: number;
  blocked: number;
  recurring: number;
  percentComplete: number;
}

export interface CategoryStatus extends TaskStatus {
  category: string;
}

export interface PriorityStatus {
  priority: 1 | 2 | 3 | 4 | 5;
  count: number;
  completed: number;
  percentComplete: number;
}

export interface TodoStatistics {
  overallStatus: TaskStatus;
  categoryStatus: CategoryStatus[];
  priorityStatus: PriorityStatus[];
  recentlyCompleted: TodoTask[];
  upcomingTasks: TodoTask[];
  lastUpdated: Date;
}

class TodoService {
  private static instance: TodoService;
  private todoFilePath: string = "/master-todo.md";
  private statistics: TodoStatistics | null = null;
  private lastRefreshTime: Date = new Date();
  private refreshIntervalMs: number = 30000; // 30 seconds
  private refreshIntervalId: NodeJS.Timeout | null = null;
  private listeners: Array<(stats: TodoStatistics) => void> = [];

  private constructor() {
    // Private constructor for singleton
  }

  public static getInstance(): TodoService {
    if (!TodoService.instance) {
      TodoService.instance = new TodoService();
    }
    return TodoService.instance;
  }

  /**
   * Start monitoring the todo file for changes
   */
  public startMonitoring(refreshInterval: number = 30000): void {
    this.refreshIntervalMs = refreshInterval;

    // Clear any existing interval
    if (this.refreshIntervalId) {
      clearInterval(this.refreshIntervalId);
    }

    // Initial refresh
    this.refreshStatistics();

    // Set up interval for regular refreshes
    this.refreshIntervalId = setInterval(() => {
      this.refreshStatistics();
    }, this.refreshIntervalMs);

    console.log(
      `Todo monitoring started with ${this.refreshIntervalMs}ms interval`
    );
  }

  /**
   * Stop monitoring the todo file
   */
  public stopMonitoring(): void {
    if (this.refreshIntervalId) {
      clearInterval(this.refreshIntervalId);
      this.refreshIntervalId = null;
    }
  }

  /**
   * Parse the master-todo.md file and calculate statistics
   */
  private async refreshStatistics(): Promise<void> {
    try {
      // In a real implementation, this would read and parse the master-todo.md file
      // For now, we'll use mock data

      const mockTasks: TodoTask[] = [
        {
          id: "1",
          title: "Implement TodoManager component",
          description:
            "Create a component for managing todos with progress tracking",
          priority: 1,
          status: "completed",
          category: "Frontend Implementation",
          addedDate: "2023-11-01",
          completedDate: "2023-11-10",
        },
        {
          id: "2",
          title: "Create master-todo.md parser",
          description: "Develop a parser for the master-todo.md file format",
          priority: 2,
          status: "completed",
          category: "Development Tools",
          addedDate: "2023-11-02",
          completedDate: "2023-11-08",
        },
        {
          id: "3",
          title: "Implement real-time progress tracking",
          description: "Add functionality to track progress in real-time",
          priority: 1,
          status: "in-progress",
          category: "Frontend Implementation",
          addedDate: "2023-11-05",
        },
        {
          id: "4",
          title: "Set up CI/CD pipeline for testing",
          description: "Configure automated testing in the CI/CD pipeline",
          priority: 2,
          status: "not-started",
          category: "Development Tools",
          addedDate: "2023-11-07",
        },
        {
          id: "5",
          title: "Implement Knowledge Graph MCP Server",
          description: "Create server for knowledge graph integration",
          priority: 1,
          status: "blocked",
          category: "AI Infrastructure",
          addedDate: "2023-10-25",
        },
        {
          id: "6",
          title: "Regular code cleanup",
          description: "Perform regular code cleanup with Knip",
          priority: 3,
          status: "recurring",
          category: "Code Quality",
          addedDate: "2023-10-10",
        },
      ];

      // Calculate overall statistics
      const total = mockTasks.length;
      const completed = mockTasks.filter(
        (t) => t.status === "completed"
      ).length;
      const inProgress = mockTasks.filter(
        (t) => t.status === "in-progress"
      ).length;
      const notStarted = mockTasks.filter(
        (t) => t.status === "not-started"
      ).length;
      const blocked = mockTasks.filter((t) => t.status === "blocked").length;
      const recurring = mockTasks.filter(
        (t) => t.status === "recurring"
      ).length;

      const overallStatus: TaskStatus = {
        total,
        completed,
        inProgress,
        notStarted,
        blocked,
        recurring,
        percentComplete: total > 0 ? Math.round((completed / total) * 100) : 0,
      };

      // Calculate category statistics
      const categories = Array.from(new Set(mockTasks.map((t) => t.category)));

      const categoryStatus: CategoryStatus[] = categories.map((category) => {
        const categoryTasks = mockTasks.filter((t) => t.category === category);
        const categoryTotal = categoryTasks.length;
        const categoryCompleted = categoryTasks.filter(
          (t) => t.status === "completed"
        ).length;
        const categoryInProgress = categoryTasks.filter(
          (t) => t.status === "in-progress"
        ).length;
        const categoryNotStarted = categoryTasks.filter(
          (t) => t.status === "not-started"
        ).length;
        const categoryBlocked = categoryTasks.filter(
          (t) => t.status === "blocked"
        ).length;
        const categoryRecurring = categoryTasks.filter(
          (t) => t.status === "recurring"
        ).length;

        return {
          category,
          total: categoryTotal,
          completed: categoryCompleted,
          inProgress: categoryInProgress,
          notStarted: categoryNotStarted,
          blocked: categoryBlocked,
          recurring: categoryRecurring,
          percentComplete:
            categoryTotal > 0
              ? Math.round((categoryCompleted / categoryTotal) * 100)
              : 0,
        };
      });

      // Calculate priority statistics
      const priorities: (1 | 2 | 3 | 4 | 5)[] = [1, 2, 3, 4, 5];

      const priorityStatus: PriorityStatus[] = priorities.map((priority) => {
        const priorityTasks = mockTasks.filter((t) => t.priority === priority);
        const priorityCount = priorityTasks.length;
        const priorityCompleted = priorityTasks.filter(
          (t) => t.status === "completed"
        ).length;

        return {
          priority,
          count: priorityCount,
          completed: priorityCompleted,
          percentComplete:
            priorityCount > 0
              ? Math.round((priorityCompleted / priorityCount) * 100)
              : 0,
        };
      });

      // Get recently completed tasks (within the last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recentlyCompleted = mockTasks
        .filter((t) => t.status === "completed" && t.completedDate)
        .sort((a, b) => {
          const dateA = new Date(a.completedDate || "");
          const dateB = new Date(b.completedDate || "");
          return dateB.getTime() - dateA.getTime();
        })
        .slice(0, 5); // Get top 5

      // Get upcoming tasks (high priority non-completed tasks)
      const upcomingTasks = mockTasks
        .filter((t) => t.status !== "completed" && t.priority <= 2) // Priority 1 and 2
        .sort((a, b) => a.priority - b.priority)
        .slice(0, 5); // Get top 5

      // Update statistics
      this.statistics = {
        overallStatus,
        categoryStatus,
        priorityStatus,
        recentlyCompleted,
        upcomingTasks,
        lastUpdated: new Date(),
      };

      // Notify listeners
      this.notifyListeners();
    } catch (error) {
      console.error("Error refreshing todo statistics:", error);
    }
  }

  /**
   * Force a refresh of the statistics
   */
  public async forceRefresh(): Promise<TodoStatistics | null> {
    await this.refreshStatistics();
    return this.statistics;
  }

  /**
   * Get the current statistics
   */
  public getStatistics(): TodoStatistics | null {
    return this.statistics;
  }

  /**
   * Register a listener for statistics updates
   * Returns an unsubscribe function
   */
  public registerListener(
    callback: (stats: TodoStatistics) => void
  ): () => void {
    this.listeners.push(callback);

    // If we already have statistics, call the callback immediately
    if (this.statistics) {
      callback(this.statistics);
    }

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(
        (listener) => listener !== callback
      );
    };
  }

  /**
   * Notify all listeners of statistics updates
   */
  private notifyListeners(): void {
    if (!this.statistics) return;

    this.listeners.forEach((listener) => {
      try {
        listener(this.statistics!);
      } catch (error) {
        console.error("Error in todo statistics listener:", error);
      }
    });
  }

  /**
   * Eventually implement: Parse the master-todo.md file
   * This would extract all tasks, categories, priorities, etc.
   */
  private async parseTodoFile(): Promise<TodoTask[]> {
    try {
      // Placeholder for actual implementation
      // In a real implementation, this would:
      // 1. Fetch the master-todo.md file
      // 2. Parse the markdown format
      // 3. Extract tasks, categories, priorities, statuses, etc.
      // 4. Return structured data

      // For now we return an empty array
      return [];
    } catch (error) {
      console.error("Error parsing todo file:", error);
      return [];
    }
  }
}

// Export singleton instance
const todoService = TodoService.getInstance();
export default todoService;
