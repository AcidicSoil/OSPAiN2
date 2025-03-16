"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateCompletionStats = exports.groupTasksByPeriod = exports.extractDueDates = exports.calculateProcessingTimeByType = void 0;
/**
 * Calculates processing time statistics for each task type
 * @param tasks Array of tasks to analyze
 * @returns Array of processing time statistics by task type
 */
const calculateProcessingTimeByType = (tasks) => {
    const tasksByType = new Map();
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
exports.calculateProcessingTimeByType = calculateProcessingTimeByType;
/**
 * Extracts due date information from tasks
 * @param tasks Array of tasks to analyze
 * @returns Array of task due dates
 */
const extractDueDates = (tasks) => {
    return tasks
        .filter((task) => task.dueDate !== undefined)
        .map((task) => ({
        dueDate: new Date(task.dueDate),
    }));
};
exports.extractDueDates = extractDueDates;
/**
 * Groups tasks by a time period (day, week, month)
 * @param tasks Array of tasks to analyze
 * @param period Time period to group by ('day' | 'week' | 'month')
 * @returns Map of period start timestamp to number of tasks
 */
const groupTasksByPeriod = (tasks, period) => {
    const groupedTasks = new Map();
    tasks.forEach((task) => {
        if (!task.createdAt)
            return;
        const date = new Date(task.createdAt);
        let periodStart;
        switch (period) {
            case "day":
                periodStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                break;
            case "week":
                const dayOfWeek = date.getDay();
                periodStart = new Date(date.getFullYear(), date.getMonth(), date.getDate() - dayOfWeek);
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
exports.groupTasksByPeriod = groupTasksByPeriod;
/**
 * Calculates completion rate statistics
 * @param tasks Array of tasks to analyze
 * @param period Time period to analyze ('day' | 'week' | 'month')
 * @returns Object containing completion rate statistics
 */
const calculateCompletionStats = (tasks, period) => {
    const completedTasks = tasks.filter((task) => task.status === "completed");
    const totalTasks = tasks.length;
    const groupedCompleted = (0, exports.groupTasksByPeriod)(completedTasks, period);
    const groupedTotal = (0, exports.groupTasksByPeriod)(tasks, period);
    const completionRates = new Map();
    groupedTotal.forEach((total, timestamp) => {
        const completed = groupedCompleted.get(timestamp) || 0;
        completionRates.set(timestamp, completed / total);
    });
    return {
        overallCompletionRate: totalTasks > 0 ? completedTasks.length / totalTasks : 0,
        completionRatesByPeriod: completionRates,
    };
};
exports.calculateCompletionStats = calculateCompletionStats;
//# sourceMappingURL=chartDataTransformers.js.map