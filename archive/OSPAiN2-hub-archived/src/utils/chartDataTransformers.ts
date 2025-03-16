import { Task } from "../types/Task";

export interface ProcessingTimeData {
  type: string;
  averageTime: number;
  minTime: number;
  maxTime: number;
}

export interface DueDateData {
  dueDate: Date;
}

/**
 * Calculates processing time statistics for each task type
 * @param tasks Array of tasks to analyze
 * @returns Array of processing time statistics by task type
 */
export const calculateProcessingTimeByType = (
  tasks: Task[]
): ProcessingTimeData[] => {
  const tasksByType = new Map<string, number[]>();

  // Group processing times by task type
  tasks.forEach((task) => {
    if (task.processingTime !== undefined) {
      const times = tasksByType.get(task.type) || [];
      times.push(task.processingTime);
      tasksByType.set(task.type, times);
    }
  });

  // Calculate statistics for each type
  return Array.from(tasksByType.entries()).map(([type, times]) => ({
    type,
    averageTime: times.reduce((sum, time) => sum + time, 0) / times.length,
    minTime: Math.min(...times),
    maxTime: Math.max(...times),
  }));
};

/**
 * Extracts due date information from tasks
 * @param tasks Array of tasks to analyze
 * @returns Array of task due dates
 */
export const extractDueDates = (tasks: Task[]): DueDateData[] => {
  return tasks
    .filter((task) => task.dueDate !== undefined)
    .map((task) => ({
      dueDate: new Date(task.dueDate!),
    }));
};

/**
 * Groups tasks by a time period (day, week, month)
 * @param tasks Array of tasks to analyze
 * @param period Time period to group by ('day' | 'week' | 'month')
 * @returns Map of period start timestamp to number of tasks
 */
export const groupTasksByPeriod = (
  tasks: Task[],
  period: "day" | "week" | "month"
): Map<number, number> => {
  const groupedTasks = new Map<number, number>();

  tasks.forEach((task) => {
    if (!task.createdAt) return;

    const date = new Date(task.createdAt);
    let periodStart: Date;

    switch (period) {
      case "day":
        periodStart = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate()
        );
        break;
      case "week":
        const dayOfWeek = date.getDay();
        periodStart = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate() - dayOfWeek
        );
        break;
      case "month":
        periodStart = new Date(date.getFullYear(), date.getMonth(), 1);
        break;
    }

    const timestamp = periodStart.getTime();
    groupedTasks.set(timestamp, (groupedTasks.get(timestamp) || 0) + 1);
  });

  return groupedTasks;
};

/**
 * Calculates completion rate statistics
 * @param tasks Array of tasks to analyze
 * @param period Time period to analyze ('day' | 'week' | 'month')
 * @returns Object containing completion rate statistics
 */
export const calculateCompletionStats = (
  tasks: Task[],
  period: "day" | "week" | "month"
) => {
  const completedTasks = tasks.filter((task) => task.status === "completed");
  const totalTasks = tasks.length;

  const groupedCompleted = groupTasksByPeriod(completedTasks, period);
  const groupedTotal = groupTasksByPeriod(tasks, period);

  const completionRates = new Map<number, number>();

  groupedTotal.forEach((total, timestamp) => {
    const completed = groupedCompleted.get(timestamp) || 0;
    completionRates.set(timestamp, completed / total);
  });

  return {
    overallCompletionRate:
      totalTasks > 0 ? completedTasks.length / totalTasks : 0,
    completionRatesByPeriod: completionRates,
  };
};
