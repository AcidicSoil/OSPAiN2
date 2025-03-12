import React, { useEffect, useState } from "react";
import todoTrackingService, {
  TodoStats,
} from "../../services/TodoTrackingService";

interface TodoProgressProps {
  compact?: boolean;
  showCategories?: boolean;
  categoryFilter?: string[];
  className?: string;
}

/**
 * TodoProgress Component
 *
 * Displays real-time progress of todo items from the master-todo.md file.
 * Shows overall progress and can optionally show progress by category.
 */
export const TodoProgress: React.FC<TodoProgressProps> = ({
  compact = false,
  showCategories = true,
  categoryFilter = [],
  className = "",
}) => {
  const [stats, setStats] = useState<TodoStats>(todoTrackingService.getStats());

  useEffect(() => {
    // Subscribe to todo updates
    const unsubscribe = todoTrackingService.onTodoUpdated((newStats) => {
      setStats(newStats);
    });

    // Manual refresh on mount
    todoTrackingService.refreshData();

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, []);

  // Get color class based on progress percentage
  const getColorClass = (percentage: number): string => {
    if (percentage < 25) return "bg-red-500";
    if (percentage < 50) return "bg-yellow-500";
    if (percentage < 75) return "bg-blue-500";
    return "bg-green-500";
  };

  // Get filtered categories
  const getFilteredCategories = () => {
    const categories = Object.values(stats.categories);

    // Sort by priority (lowest first) then by name
    categories.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      return a.name.localeCompare(b.name);
    });

    // Apply filter if provided
    if (categoryFilter.length > 0) {
      return categories.filter((category) =>
        categoryFilter.includes(category.name)
      );
    }

    return categories;
  };

  // Compact display version
  if (compact) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="w-24 bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 overflow-hidden">
          <div
            className={`h-2.5 rounded-full ${getColorClass(
              stats.overallProgress
            )}`}
            style={{ width: `${stats.overallProgress}%` }}
          ></div>
        </div>
        <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
          {stats.overallProgress}%
        </span>
      </div>
    );
  }

  // Full display version
  return (
    <div
      className={`p-4 bg-white rounded-lg shadow dark:bg-gray-800 ${className}`}
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          Project Progress
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Updated: {stats.lastUpdated.toLocaleTimeString()}
        </span>
      </div>

      {/* Overall Progress */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Overall Progress
          </span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {stats.overallProgress}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
          <div
            className={`h-2.5 rounded-full transition-all duration-500 ${getColorClass(
              stats.overallProgress
            )}`}
            style={{ width: `${stats.overallProgress}%` }}
          ></div>
        </div>
      </div>

      {/* Task Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
          <div className="text-xs text-gray-500 dark:text-gray-400">Total</div>
          <div className="text-lg font-semibold">{stats.totalTasks}</div>
        </div>
        <div className="bg-green-50 dark:bg-green-900 p-2 rounded">
          <div className="text-xs text-green-600 dark:text-green-300">
            Completed
          </div>
          <div className="text-lg font-semibold text-green-700 dark:text-green-400">
            {stats.completedTasks}
          </div>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900 p-2 rounded">
          <div className="text-xs text-yellow-600 dark:text-yellow-300">
            In Progress
          </div>
          <div className="text-lg font-semibold text-yellow-700 dark:text-yellow-400">
            {stats.inProgressTasks}
          </div>
        </div>
        <div className="bg-red-50 dark:bg-red-900 p-2 rounded">
          <div className="text-xs text-red-600 dark:text-red-300">
            Not Started
          </div>
          <div className="text-lg font-semibold text-red-700 dark:text-red-400">
            {stats.notStartedTasks}
          </div>
        </div>
      </div>

      {/* High Priority Summary */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            P1 (Critical) Tasks
          </span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {stats.highPriorityCompleted} / {stats.highPriorityTasks}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
          <div
            className="h-2.5 rounded-full transition-all duration-500 bg-red-600"
            style={{
              width: `${
                stats.highPriorityTasks > 0
                  ? (stats.highPriorityCompleted / stats.highPriorityTasks) *
                    100
                  : 0
              }%`,
            }}
          ></div>
        </div>
      </div>

      {/* Categories */}
      {showCategories && (
        <div className="mt-6">
          <h4 className="text-md font-semibold text-gray-800 dark:text-white mb-2">
            Progress by Category
          </h4>
          <div className="space-y-3">
            {getFilteredCategories().map((category) => (
              <div key={category.name}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                    <span className="inline-block w-4 h-4 mr-2 rounded-full bg-gray-300 text-xs text-center leading-4">
                      {category.priority}
                    </span>
                    {category.name}
                  </span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {category.progress}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${getColorClass(
                      category.progress
                    )}`}
                    style={{ width: `${category.progress}%` }}
                  ></div>
                </div>
                <div className="flex text-xs text-gray-500 dark:text-gray-400 mt-1 space-x-2">
                  <span>{category.completedTasks} completed</span>
                  <span>•</span>
                  <span>{category.inProgressTasks} in progress</span>
                  <span>•</span>
                  <span>{category.notStartedTasks} not started</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recently Completed */}
      {stats.recentlyCompletedTasks.length > 0 && (
        <div className="mt-6">
          <h4 className="text-md font-semibold text-gray-800 dark:text-white mb-2">
            Recently Completed
          </h4>
          <div className="space-y-2">
            {stats.recentlyCompletedTasks.slice(0, 3).map((task) => (
              <div
                key={task.id}
                className="bg-green-50 dark:bg-green-900 p-2 rounded text-sm"
              >
                <div className="flex justify-between">
                  <span className="font-medium text-green-800 dark:text-green-200">
                    {task.title}
                  </span>
                  <span className="text-xs text-green-600 dark:text-green-400">
                    P{task.priority}
                  </span>
                </div>
                <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                  {task.category}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Refresh Button */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={() => todoTrackingService.refreshData()}
          className="px-3 py-1 text-xs font-medium text-center text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-800"
        >
          Refresh
        </button>
      </div>
    </div>
  );
};

export default TodoProgress;
