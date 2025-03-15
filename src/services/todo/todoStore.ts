import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Todo item interface representing a task
 */
export interface TodoItem {
  id: string;
  title: string;
  status: "not-started" | "in-progress" | "blocked" | "completed" | "recurring";
  priority: 1 | 2 | 3 | 4 | 5;
  category: string;
  tags: string[];
  dateCreated: Date;
  dateUpdated?: Date;
  description?: string;
  subTasks?: TodoItem[];
}

/**
 * Category stats for todos
 */
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

/**
 * Overall statistics for the todo items
 */
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

/**
 * Store state interface
 */
interface TodoState {
  tasks: TodoItem[];
  stats: TodoStats;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchTasks: () => Promise<void>;
  addTask: (task: Omit<TodoItem, 'id' | 'dateCreated'>) => Promise<TodoItem>;
  updateTask: (task: TodoItem) => Promise<TodoItem>;
  deleteTask: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

/**
 * Generate a unique ID
 */
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

/**
 * Calculate statistics based on current tasks
 */
const calculateStats = (tasks: TodoItem[]): TodoStats => {
  const stats: TodoStats = {
    categories: {},
    overallProgress: 0,
    totalTasks: tasks.length,
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

  // Count tasks by status
  tasks.forEach(task => {
    // Track by status
    if (task.status === 'completed') {
      stats.completedTasks++;
      
      // Track recently completed (last 7 days)
      const completedDate = task.dateUpdated || new Date();
      const daysSinceCompletion = Math.floor((new Date().getTime() - completedDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceCompletion <= 7) {
        stats.recentlyCompletedTasks.push(task);
      }
    } else if (task.status === 'in-progress') {
      stats.inProgressTasks++;
    } else if (task.status === 'not-started') {
      stats.notStartedTasks++;
    } else if (task.status === 'blocked') {
      stats.blockedTasks++;
    } else if (task.status === 'recurring') {
      stats.recurringTasks++;
    }

    // Track high priority tasks
    if (task.priority <= 2) {
      stats.highPriorityTasks++;
      if (task.status === 'completed') {
        stats.highPriorityCompleted++;
      }
    }

    // Track by category
    if (task.category) {
      if (!stats.categories[task.category]) {
        stats.categories[task.category] = {
          name: task.category,
          priority: 0, // Will calculate average later
          progress: 0,
          totalTasks: 0,
          completedTasks: 0,
          inProgressTasks: 0,
          notStartedTasks: 0,
          blockedTasks: 0,
        };
      }

      const category = stats.categories[task.category];
      category.totalTasks++;
      category.priority += task.priority; // Sum for average

      if (task.status === 'completed') {
        category.completedTasks++;
      } else if (task.status === 'in-progress') {
        category.inProgressTasks++;
      } else if (task.status === 'not-started') {
        category.notStartedTasks++;
      } else if (task.status === 'blocked') {
        category.blockedTasks++;
      }
    }
  });

  // Calculate overall progress
  if (stats.totalTasks > 0) {
    stats.overallProgress = (stats.completedTasks / stats.totalTasks) * 100;
  }

  // Calculate category averages and progress
  Object.values(stats.categories).forEach(category => {
    // Calculate average priority
    if (category.totalTasks > 0) {
      category.priority = Math.round(category.priority / category.totalTasks);
      category.progress = (category.completedTasks / category.totalTasks) * 100;
    }
  });

  return stats;
};

/**
 * Parse a todo file from markdown format
 */
const parseTodoFile = async (url: string): Promise<TodoItem[]> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch todo file: ${response.statusText}`);
    }

    const text = await response.text();
    const lines = text.split('\n');
    const tasks: TodoItem[] = [];
    let currentTask: Partial<TodoItem> | null = null;
    let currentSubTasks: Partial<TodoItem>[] = [];
    let currentCategory = "Uncategorized";

    // Helper to create a task
    const finalizeTask = () => {
      if (currentTask && currentTask.title) {
        const task: TodoItem = {
          id: currentTask.id || generateId(),
          title: currentTask.title,
          status: currentTask.status || "not-started",
          priority: currentTask.priority || 3,
          category: currentTask.category || currentCategory,
          tags: currentTask.tags || [],
          dateCreated: currentTask.dateCreated || new Date(),
          dateUpdated: currentTask.dateUpdated,
          description: currentTask.description,
          subTasks: currentSubTasks.length > 0 ? currentSubTasks.map(st => ({
            id: st.id || generateId(),
            title: st.title || '',
            status: st.status || "not-started",
            priority: st.priority || 3,
            category: currentTask.category || currentCategory,
            tags: st.tags || [],
            dateCreated: st.dateCreated || new Date(),
            dateUpdated: st.dateUpdated,
          } as TodoItem)) : undefined
        };

        tasks.push(task);
      }

      // Reset for next task
      currentTask = null;
      currentSubTasks = [];
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Skip empty lines
      if (!line) continue;

      // Category headers (look for markdown headers)
      if (line.startsWith('###')) {
        if (currentTask) finalizeTask();
        currentCategory = line.replace(/^###\s+/, '').trim();
        continue;
      }

      // Task entries (look for list items with status emojis)
      const taskMatch = line.match(/^-\s+([🔴🟡🔵🟢📌])\s+(?:\[([H\d])\])?\s+(?:\*\*P(\d)\*\*)?:?\s+(.*)/);
      if (taskMatch) {
        if (currentTask) finalizeTask();

        const [, statusEmoji, horizon, priority, title] = taskMatch;
        currentTask = {
          title: title.trim(),
          status: emojiToStatus(statusEmoji),
          priority: priority ? parseInt(priority) as 1 | 2 | 3 | 4 | 5 : 3,
          tags: horizon ? [horizon] : [],
        };
        continue;
      }

      // Subtasks (look for indented lists)
      const subtaskMatch = line.match(/^\s+-\s+\[([ x])\]\s+(.*)/);
      if (subtaskMatch && currentTask) {
        const [, checkboxStatus, subtaskTitle] = subtaskMatch;
        currentSubTasks.push({
          title: subtaskTitle.trim(),
          status: checkboxStatus === 'x' ? 'completed' : 'not-started',
        });
        continue;
      }

      // Descriptions (anything indented under a task)
      if (line.startsWith('  ') && currentTask && !line.startsWith('  -')) {
        if (!currentTask.description) currentTask.description = '';
        currentTask.description += (currentTask.description ? '\n' : '') + line.trim();
      }
    }

    // Finalize the last task if there is one
    if (currentTask) finalizeTask();

    return tasks;
  } catch (error) {
    console.error("Error parsing todo file:", error);
    return [];
  }
};

/**
 * Convert emoji to status string
 */
const emojiToStatus = (emoji: string): TodoItem['status'] => {
  switch (emoji) {
    case '🔴': return 'not-started';
    case '🟡': return 'in-progress';
    case '🔵': return 'blocked';
    case '🟢': return 'completed';
    case '📌': return 'recurring';
    default: return 'not-started';
  }
};

/**
 * Create the todo store with Zustand
 */
export const useTodoStore = create<TodoState>()(
  persist(
    (set, get) => ({
      tasks: [],
      stats: {
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
      },
      isLoading: false,
      error: null,

      // Fetch tasks from the todo file
      fetchTasks: async () => {
        set({ isLoading: true, error: null });
        try {
          const tasks = await parseTodoFile('/@master-todo.mdc');
          const stats = calculateStats(tasks);
          set({ tasks, stats, isLoading: false });
        } catch (error) {
          console.error('Error fetching tasks:', error);
          set({ error: 'Failed to load tasks', isLoading: false });
        }
      },

      // Add a new task
      addTask: async (taskData) => {
        const newTask: TodoItem = {
          id: generateId(),
          dateCreated: new Date(),
          ...taskData,
        };

        set(state => {
          const updatedTasks = [...state.tasks, newTask];
          return {
            tasks: updatedTasks,
            stats: calculateStats(updatedTasks),
          };
        });

        return newTask;
      },

      // Update an existing task
      updateTask: async (updatedTask) => {
        set(state => {
          const taskIndex = state.tasks.findIndex(t => t.id === updatedTask.id);
          if (taskIndex === -1) {
            throw new Error(`Task with ID ${updatedTask.id} not found`);
          }

          // Update the task with new values and updated timestamp
          const newTask = {
            ...updatedTask,
            dateUpdated: new Date()
          };

          const updatedTasks = [...state.tasks];
          updatedTasks[taskIndex] = newTask;

          return {
            tasks: updatedTasks,
            stats: calculateStats(updatedTasks),
          };
        });

        return updatedTask;
      },

      // Delete a task
      deleteTask: async (id) => {
        set(state => {
          const updatedTasks = state.tasks.filter(t => t.id !== id);
          return {
            tasks: updatedTasks,
            stats: calculateStats(updatedTasks),
          };
        });
      },

      // Refresh data from the source
      refreshData: async () => {
        await get().fetchTasks();
      },
    }),
    {
      name: 'todo-storage',
      // Only persist tasks, not loading states
      partialize: (state) => ({ tasks: state.tasks }),
    }
  )
);

// Export default for convenience
export default useTodoStore; 