"use strict";
/**
 * TodoTrackingService
 *
 * A service that handles real-time tracking of todo items from the master-todo.md file.
 * It provides functionality to parse the todo file, calculate progress, track changes,
 * and notify listeners of updates.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
class TodoTrackingService {
    constructor() {
        this.todoFilePath = "/@master-todo.mdc";
        this.tasks = [];
        this.stats = {
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
        this.eventEmitter = new events_1.EventEmitter();
        this.refreshInterval = null;
        this.isRefreshing = false;
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
    startRefreshInterval(intervalMs = 60000) {
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
    stopRefreshInterval() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }
    /**
     * Gets the current stats object
     */
    getStats() {
        return this.stats;
    }
    /**
     * Gets all tasks from the service
     */
    getAllTasks() {
        return [...this.tasks];
    }
    /**
     * Get a single task by ID
     */
    getTaskById(id) {
        return this.tasks.find((task) => task.id === id);
    }
    /**
     * Updates an existing task
     */
    async updateTask(task) {
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
    async createTask(task) {
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
    async deleteTask(id) {
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
    async refreshData() {
        if (this.isRefreshing)
            return;
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
        }
        catch (error) {
            console.error("Error refreshing todo data:", error);
        }
        finally {
            this.isRefreshing = false;
        }
    }
    /**
     * Subscribe to todo updates
     */
    onTodoUpdated(callback) {
        this.eventEmitter.on("todoUpdated", callback);
        return () => {
            this.eventEmitter.off("todoUpdated", callback);
        };
    }
    /**
     * Notify all listeners of updates
     */
    notifyListeners() {
        this.eventEmitter.emit("todoUpdated", this.stats);
    }
    /**
     * Calculate stats from tasks
     */
    calculateStats() {
        const categories = {};
        let totalTasks = 0;
        let completedTasks = 0;
        let inProgressTasks = 0;
        let notStartedTasks = 0;
        let blockedTasks = 0;
        let recurringTasks = 0;
        const upcomingDeadlines = [];
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
        this.stats.recentlyCompletedTasks.sort((a, b) => b.dateUpdated.getTime() - a.dateUpdated.getTime());
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
    parseTodoFile(text) {
        const tasks = [];
        const lines = text.split("\n");
        let currentTask = null;
        let currentSubTasks = [];
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            // Task line: - 🔴 [H1] **P1**: Task title
            const taskMatch = line.match(/^- (🔴|🟡|🔵|🟢|📌) \[(H[123])\] \*\*P([12345])\*\*: (.+)$/);
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
                    priority: parseInt(priority),
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
                    if (description)
                        description += "\n";
                    description += lines[j].trim();
                    j++;
                }
                if (description) {
                    currentTask.description = description;
                }
                // Look for subtasks
                while (j < lines.length) {
                    const subtaskMatch = lines[j].match(/^\s{2,}- \[([ xX])\] (.+)$/);
                    if (!subtaskMatch)
                        break;
                    const [, statusMark, subtaskTitle] = subtaskMatch;
                    currentSubTasks.push({
                        id: this.generateId(),
                        title: subtaskTitle.trim(),
                        status: statusMark.toLowerCase() === "x" ? "completed" : "not-started",
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
    createTaskFromParsed(task, subTasks) {
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
            subTasks: subTasks.length > 0 ? subTasks : undefined,
        };
    }
    /**
     * Convert emoji to status
     */
    emojiToStatus(emoji) {
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
    determineCategory(line, lines, currentIndex) {
        // Look for section headings above the current line
        for (let i = currentIndex - 1; i >= 0; i--) {
            const headerMatch = lines[i].match(/^#{2,3}\s+(.+?)$/);
            if (headerMatch) {
                // Skip certain headers that aren't categories
                const header = headerMatch[1];
                if (header === "Current Active Tasks" ||
                    header === "Recently Completed Tasks" ||
                    header === "Progress Tracking" ||
                    header === "CURRENT HORIZONS" ||
                    header === "#LEARNINGS") {
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
    generateId() {
        return "task_" + Math.random().toString(36).substring(2, 15);
    }
    /**
     * Sync tasks back to the file
     * Note: This is a placeholder - in a real implementation, this would use an API to update the file
     */
    async syncToFile() {
        // In a real implementation, this would update the @master-todo.mdc file
        console.log("Syncing tasks to file (placeholder)");
        // For now, only update the in-memory representation
        // The real implementation would call an API endpoint to update the file
        // TODO: Implement actual file sync
        return Promise.resolve();
    }
}
// Export singleton instance
const todoTrackingService = new TodoTrackingService();
exports.default = todoTrackingService;
//# sourceMappingURL=TodoTrackingService.js.map