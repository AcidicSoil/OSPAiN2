import React, { useEffect, useState, useCallback, useMemo } from "react";
import { TaskType, TaskPriority, TaskStatus, Task } from "../types/Task";
import taskQueue from "../services/TaskQueue";
import workerManager from "../services/WorkerManager";
import { toast } from "react-toastify";
import { VirtualizedTaskList } from "./VirtualizedTaskList";
import { TaskDetails } from "./TaskDetails";
import TaskStatistics from "./visualization/TaskStatistics";
import { Box, Tabs, Tab, Paper } from "@mui/material";

interface TaskDashboardProps {
  refreshInterval?: number; // in milliseconds
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`task-tabpanel-${index}`}
      aria-labelledby={`task-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `task-tab-${index}`,
    "aria-controls": `task-tabpanel-${index}`,
  };
}

/**
 * Dashboard component for monitoring and managing the task system
 * Implements local-first task management with error handling and state persistence
 */
export const TaskDashboard: React.FC<TaskDashboardProps> = ({
  refreshInterval = 2000,
}) => {
  // State for tasks and worker stats
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workerStats, setWorkerStats] = useState<{
    total: number;
    active: number;
    idle: number;
    status: "running" | "stopped" | "starting" | "stopping";
  }>({
    total: 0,
    active: 0,
    idle: 0,
    status: "stopped",
  });
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [taskFilter, setTaskFilter] = useState<{
    status?: TaskStatus;
    type?: TaskType;
    priority?: TaskPriority;
    tag?: string;
  }>({});

  // Memoized refresh functions
  const refreshTasks = useCallback(async () => {
    try {
      setError(null);
      const updatedTasks = await taskQueue.getAllTasks();
      setTasks(updatedTasks);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch tasks";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  }, []);

  const refreshWorkerStats = useCallback(async () => {
    try {
      const stats = await workerManager.getStatus();
      setWorkerStats({
        total: stats.totalWorkers,
        active: stats.activeWorkers,
        idle: stats.idleWorkers,
        status: stats.status,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch worker stats";
      toast.error(errorMessage);
    }
  }, []);

  // Initialize services and set up event listeners
  useEffect(() => {
    let isSubscribed = true;

    const initialize = async () => {
      try {
        setIsLoading(true);
        await Promise.all([refreshTasks(), refreshWorkerStats()]);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to initialize dashboard";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        if (isSubscribed) {
          setIsLoading(false);
        }
      }
    };

    // Subscribe to task queue events
    const handleTaskUpdated = () => {
      if (isSubscribed) {
        refreshTasks();
      }
    };
    taskQueue.on("taskUpdated", handleTaskUpdated);

    // Subscribe to worker manager events
    const handleStatusChanged = () => {
      if (isSubscribed) {
        refreshWorkerStats();
      }
    };
    workerManager.on("statusChanged", handleStatusChanged);

    // Set up periodic refresh
    const intervalId = setInterval(() => {
      if (isSubscribed) {
        refreshTasks();
        refreshWorkerStats();
      }
    }, refreshInterval);

    // Initialize
    initialize();

    // Cleanup function
    return () => {
      isSubscribed = false;
      clearInterval(intervalId);
      taskQueue.off("taskUpdated", handleTaskUpdated);
      workerManager.off("statusChanged", handleStatusChanged);
    };
  }, [refreshInterval, refreshTasks, refreshWorkerStats]);

  // Handle starting worker manager
  const handleStartWorkers = async () => {
    await workerManager.start();
    refreshWorkerStats();
  };

  // Handle stopping worker manager
  const handleStopWorkers = async () => {
    await workerManager.stop();
    refreshWorkerStats();
  };

  // Handle cancelling a task
  const handleCancelTask = async (taskId: string) => {
    await taskQueue.cancelTask(taskId);
    refreshTasks();
  };

  // Handle retrying a failed task
  const handleRetryTask = async (taskId: string) => {
    const task = await taskQueue.getTask(taskId);

    if (
      task &&
      (task.status === TaskStatus.FAILED ||
        task.status === TaskStatus.CANCELLED)
    ) {
      task.status = TaskStatus.PENDING;
      task.attempts = 0;
      task.error = undefined;
      await taskQueue.updateTask(task);
      refreshTasks();
    }
  };

  // Handle selecting a task for details
  const handleSelectTask = (taskId: string) => {
    setSelectedTaskId(taskId === selectedTaskId ? null : taskId);
  };

  // Memoized filtered tasks
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        if (taskFilter.status && task.status !== taskFilter.status)
          return false;
        if (taskFilter.type && task.type !== taskFilter.type) return false;
        if (taskFilter.priority && task.priority !== taskFilter.priority)
          return false;
        if (
          taskFilter.tag &&
          (!task.tags || !task.tags.includes(taskFilter.tag))
        )
          return false;
        return true;
      })
      .sort((a, b) => {
        // Sort by priority first
        if (a.priority !== b.priority) {
          return a.priority - b.priority;
        }
        // Then by creation date
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
  }, [tasks, taskFilter]);

  // Memoized badge rendering functions
  const renderStatusBadge = useMemo(() => {
    return (status: TaskStatus) => {
      let colorClass = "";
      switch (status) {
        case TaskStatus.PENDING:
          colorClass = "bg-yellow-100 text-yellow-800";
          break;
        case TaskStatus.RUNNING:
          colorClass = "bg-blue-100 text-blue-800";
          break;
        case TaskStatus.COMPLETED:
          colorClass = "bg-green-100 text-green-800";
          break;
        case TaskStatus.FAILED:
          colorClass = "bg-red-100 text-red-800";
          break;
        case TaskStatus.CANCELLED:
          colorClass = "bg-gray-100 text-gray-800";
          break;
        case TaskStatus.RETRY:
          colorClass = "bg-purple-100 text-purple-800";
          break;
      }
      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}
        >
          {status}
        </span>
      );
    };
  }, []);

  const renderPriorityBadge = useMemo(() => {
    return (priority: TaskPriority) => {
      let label = "";
      let colorClass = "";
      switch (priority) {
        case TaskPriority.CRITICAL:
          label = "Critical";
          colorClass = "bg-red-100 text-red-800";
          break;
        case TaskPriority.HIGH:
          label = "High";
          colorClass = "bg-orange-100 text-orange-800";
          break;
        case TaskPriority.MEDIUM:
          label = "Medium";
          colorClass = "bg-yellow-100 text-yellow-800";
          break;
        case TaskPriority.LOW:
          label = "Low";
          colorClass = "bg-green-100 text-green-800";
          break;
        case TaskPriority.BACKGROUND:
          label = "Background";
          colorClass = "bg-gray-100 text-gray-800";
          break;
      }
      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}
        >
          {label}
        </span>
      );
    };
  }, []);

  const renderTypeBadge = useMemo(() => {
    return (type: TaskType) => {
      let label = "";
      let colorClass = "";
      switch (type) {
        case TaskType.MODEL_REQUEST:
          label = "Model";
          colorClass = "bg-indigo-100 text-indigo-800";
          break;
        case TaskType.EMBEDDINGS:
          label = "Embeddings";
          colorClass = "bg-purple-100 text-purple-800";
          break;
        case TaskType.FILE_OPERATION:
          label = "File";
          colorClass = "bg-blue-100 text-blue-800";
          break;
        case TaskType.DATA_PROCESSING:
          label = "Data";
          colorClass = "bg-green-100 text-green-800";
          break;
        case TaskType.EXTERNAL_API:
          label = "API";
          colorClass = "bg-yellow-100 text-yellow-800";
          break;
        case TaskType.CUSTOM:
          label = "Custom";
          colorClass = "bg-gray-100 text-gray-800";
          break;
      }
      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}
        >
          {label}
        </span>
      );
    };
  }, []);

  // Memoized date formatter
  const formatDate = useMemo(() => {
    return (date: Date) => new Date(date).toLocaleString();
  }, []);

  // Find selected task
  const selectedTask = selectedTaskId
    ? tasks.find((t) => t.id === selectedTaskId)
    : null;

  // QUESTION: Should we implement virtualization for the task list to improve performance with large numbers of tasks? #performance #medium
  // The current implementation might have performance issues when dealing with hundreds or thousands of tasks.
  // Potential solutions: react-window, react-virtualized, or custom implementation with intersection observer.

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="text-red-500 mb-4">{error}</div>
          <button
            onClick={() => {
              setIsLoading(true);
              setError(null);
              Promise.all([refreshTasks(), refreshWorkerStats()]).finally(() =>
                setIsLoading(false)
              );
            }}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          {/* Worker Controls */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold">Task Dashboard</h2>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Workers:</span>
                <span
                  className={`px-2 py-1 rounded text-sm ${
                    workerStats.status === "running"
                      ? "bg-green-100 text-green-800"
                      : workerStats.status === "stopped"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {workerStats.status}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                {workerStats.active}/{workerStats.total} active
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleStartWorkers}
                disabled={workerStats.status === "running"}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Start Workers
              </button>
              <button
                onClick={handleStopWorkers}
                disabled={workerStats.status === "stopped"}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Stop Workers
              </button>
            </div>
          </div>

          {/* Task Filters */}
          <div className="mb-6 grid grid-cols-4 gap-4">
            <select
              value={taskFilter.status || ""}
              onChange={(e) =>
                setTaskFilter({
                  ...taskFilter,
                  status: e.target.value as TaskStatus,
                })
              }
              className="form-select"
            >
              <option value="">All Statuses</option>
              {Object.values(TaskStatus).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <select
              value={taskFilter.type || ""}
              onChange={(e) =>
                setTaskFilter({
                  ...taskFilter,
                  type: e.target.value as TaskType,
                })
              }
              className="form-select"
            >
              <option value="">All Types</option>
              {Object.values(TaskType).map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <select
              value={taskFilter.priority || ""}
              onChange={(e) =>
                setTaskFilter({
                  ...taskFilter,
                  priority: Number(e.target.value) as TaskPriority,
                })
              }
              className="form-select"
            >
              <option value="">All Priorities</option>
              {Object.values(TaskPriority)
                .filter((p) => !isNaN(Number(p)))
                .map((priority) => (
                  <option key={priority} value={priority}>
                    P{priority}
                  </option>
                ))}
            </select>
            <input
              type="text"
              value={taskFilter.tag || ""}
              onChange={(e) =>
                setTaskFilter({ ...taskFilter, tag: e.target.value })
              }
              placeholder="Filter by tag..."
              className="form-input"
            />
          </div>

          {/* Task List Header */}
          <div className="overflow-x-auto">
            <div className="min-w-full">
              <div className="bg-gray-50 border-b border-gray-200">
                <div className="flex">
                  <div className="flex-1 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </div>
                  <div className="flex-1 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </div>
                  <div className="flex-1 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </div>
                  <div className="flex-1 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </div>
                  <div className="flex-1 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </div>
                  <div className="flex-1 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </div>
                  <div className="flex-1 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </div>
                </div>
              </div>

              {/* Virtualized Task List */}
              <VirtualizedTaskList
                tasks={filteredTasks}
                selectedTaskId={selectedTaskId}
                onSelectTask={handleSelectTask}
                onCancelTask={handleCancelTask}
                onRetryTask={handleRetryTask}
                renderTypeBadge={renderTypeBadge}
                renderStatusBadge={renderStatusBadge}
                renderPriorityBadge={renderPriorityBadge}
                formatDate={formatDate}
              />
            </div>
          </div>

          {/* Task Details */}
          {selectedTask && (
            <TaskDetails
              task={selectedTask}
              onRetry={handleRetryTask}
              onCancel={handleCancelTask}
              renderTypeBadge={renderTypeBadge}
              renderStatusBadge={renderStatusBadge}
              renderPriorityBadge={renderPriorityBadge}
              formatDate={formatDate}
            />
          )}
        </>
      )}
    </div>
  );
};
