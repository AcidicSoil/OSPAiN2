import React, { useEffect, useState } from "react";
import { TaskType, TaskPriority, TaskStatus, Task } from "../types/Task";
import taskQueue from "../services/TaskQueue";
import workerManager from "../services/WorkerManager";

interface TaskDashboardProps {
  refreshInterval?: number; // in milliseconds
}

/**
 * Dashboard component for monitoring and managing the task system
 */
export const TaskDashboard: React.FC<TaskDashboardProps> = ({
  refreshInterval = 2000,
}) => {
  // State for tasks and worker stats
  const [tasks, setTasks] = useState<Task[]>([]);
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

  // Initialize services
  useEffect(() => {
    // Subscribe to task queue events
    const handleTaskUpdated = () => refreshTasks();
    taskQueue.on("taskUpdated", handleTaskUpdated);

    // Subscribe to worker manager events
    const handleStatusChanged = () => refreshWorkerStats();
    workerManager.on("statusChanged", handleStatusChanged);

    // Set up periodic refresh
    const intervalId = setInterval(() => {
      refreshTasks();
      refreshWorkerStats();
    }, refreshInterval);

    // Initial load
    refreshTasks();
    refreshWorkerStats();

    // Cleanup
    return () => {
      clearInterval(intervalId);
      taskQueue.off("taskUpdated", handleTaskUpdated);
      workerManager.off("statusChanged", handleStatusChanged);
    };
  }, [refreshInterval]);

  // Refresh task list
  const refreshTasks = async () => {
    let filteredTasks = await taskQueue.getAllTasks();

    // Apply filters
    if (taskFilter.status) {
      filteredTasks = filteredTasks.filter(
        (task: Task) => task.status === taskFilter.status
      );
    }

    if (taskFilter.type) {
      filteredTasks = filteredTasks.filter(
        (task: Task) => task.type === taskFilter.type
      );
    }

    if (taskFilter.priority) {
      filteredTasks = filteredTasks.filter(
        (task: Task) => task.priority === taskFilter.priority
      );
    }

    if (taskFilter.tag) {
      filteredTasks = filteredTasks.filter(
        (task: Task) => task.tags && task.tags.includes(taskFilter.tag!)
      );
    }

    // Sort tasks by priority and creation date
    filteredTasks.sort((a: Task, b: Task) => {
      // First, sort by priority (higher priority first)
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }

      // Then, sort by creation date (oldest first for same priority)
      return a.createdAt.getTime() - b.createdAt.getTime();
    });

    setTasks(filteredTasks);
  };

  // Refresh worker stats
  const refreshWorkerStats = async () => {
    const stats = workerManager.getStatus();

    setWorkerStats({
      total: stats.totalWorkers,
      active: stats.activeWorkers,
      idle: stats.idleWorkers,
      status: workerManager.getRunningStatus() ? "running" : "stopped",
    });
  };

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

  // Render task status badge
  const renderStatusBadge = (status: TaskStatus) => {
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

  // Render priority badge
  const renderPriorityBadge = (priority: TaskPriority) => {
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

  // Render task type badge
  const renderTypeBadge = (type: TaskType) => {
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

  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  // Find selected task
  const selectedTask = selectedTaskId
    ? tasks.find((t) => t.id === selectedTaskId)
    : null;

  // QUESTION: Should we implement virtualization for the task list to improve performance with large numbers of tasks? #performance #medium
  // The current implementation might have performance issues when dealing with hundreds or thousands of tasks.
  // Potential solutions: react-window, react-virtualized, or custom implementation with intersection observer.

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Task Dashboard</h1>

      {/* Worker Stats */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="text-lg font-semibold mb-2">Worker Status</h2>
        <div className="flex space-x-4 mb-4">
          <div className="flex-1 bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-500">Total Workers</div>
            <div className="text-2xl font-semibold">{workerStats.total}</div>
          </div>
          <div className="flex-1 bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-500">Active Workers</div>
            <div className="text-2xl font-semibold">{workerStats.active}</div>
          </div>
          <div className="flex-1 bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-500">Idle Workers</div>
            <div className="text-2xl font-semibold">{workerStats.idle}</div>
          </div>
          <div className="flex-1 bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-500">Status</div>
            <div className="text-2xl font-semibold capitalize">
              {workerStats.status}
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleStartWorkers}
            disabled={
              workerStats.status === "running" ||
              workerStats.status === "starting"
            }
            className="px-4 py-2 bg-green-600 text-white rounded-lg disabled:bg-green-300"
          >
            Start Workers
          </button>
          <button
            onClick={handleStopWorkers}
            disabled={
              workerStats.status === "stopped" ||
              workerStats.status === "stopping"
            }
            className="px-4 py-2 bg-red-600 text-white rounded-lg disabled:bg-red-300"
          >
            Stop Workers
          </button>
        </div>
      </div>

      {/* Task Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="text-lg font-semibold mb-2">Filters</h2>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              className="w-full p-2 border rounded-lg"
              value={taskFilter.status || ""}
              onChange={(e) =>
                setTaskFilter({
                  ...taskFilter,
                  status: e.target.value
                    ? (e.target.value as TaskStatus)
                    : undefined,
                })
              }
            >
              <option value="">All</option>
              {Object.values(TaskStatus).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              className="w-full p-2 border rounded-lg"
              value={taskFilter.type || ""}
              onChange={(e) =>
                setTaskFilter({
                  ...taskFilter,
                  type: e.target.value
                    ? (e.target.value as TaskType)
                    : undefined,
                })
              }
            >
              <option value="">All</option>
              {Object.values(TaskType).map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              className="w-full p-2 border rounded-lg"
              value={taskFilter.priority || ""}
              onChange={(e) =>
                setTaskFilter({
                  ...taskFilter,
                  priority: e.target.value
                    ? (Number(e.target.value) as TaskPriority)
                    : undefined,
                })
              }
            >
              <option value="">All</option>
              {Object.entries(TaskPriority)
                .filter(([key]) => isNaN(Number(key))) // Filter out numeric keys
                .map(([key, value]) => (
                  <option key={key} value={value}>
                    {key}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tag
            </label>
            <input
              type="text"
              className="w-full p-2 border rounded-lg"
              value={taskFilter.tag || ""}
              onChange={(e) =>
                setTaskFilter({
                  ...taskFilter,
                  tag: e.target.value || undefined,
                })
              }
              placeholder="Filter by tag"
            />
          </div>
        </div>
        <div className="mt-3">
          <button
            onClick={() => setTaskFilter({})}
            className="px-3 py-1 bg-gray-200 text-gray-700 rounded"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Task List */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <h2 className="text-lg font-semibold p-4 border-b">
          Tasks ({tasks.length})
        </h2>

        {tasks.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No tasks found matching the current filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tasks.map((task) => (
                  <tr
                    key={task.id}
                    className={`hover:bg-gray-50 cursor-pointer ${
                      selectedTaskId === task.id ? "bg-blue-50" : ""
                    }`}
                    onClick={() => handleSelectTask(task.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono text-gray-900">
                        {task.id.substring(0, 8)}...
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderTypeBadge(task.type)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderStatusBadge(task.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderPriorityBadge(task.priority)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full"
                          style={{ width: `${task.progress || 0}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {task.progress || 0}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(task.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {task.status === TaskStatus.PENDING ||
                      task.status === TaskStatus.RUNNING ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancelTask(task.id);
                          }}
                          className="text-red-600 hover:text-red-900 mr-2"
                        >
                          Cancel
                        </button>
                      ) : null}

                      {task.status === TaskStatus.FAILED ||
                      task.status === TaskStatus.CANCELLED ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRetryTask(task.id);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Retry
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Task Details */}
      {selectedTask && (
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Task Details</h2>
            <button
              onClick={() => setSelectedTaskId(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-sm font-medium text-gray-500">ID</div>
              <div className="font-mono">{selectedTask.id}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Type</div>
              <div>{renderTypeBadge(selectedTask.type)}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Status</div>
              <div>{renderStatusBadge(selectedTask.status)}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Priority</div>
              <div>{renderPriorityBadge(selectedTask.priority)}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Created</div>
              <div>{formatDate(selectedTask.createdAt)}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Attempts</div>
              <div>
                {selectedTask.attempts} / {selectedTask.maxAttempts}
              </div>
            </div>
          </div>

          {selectedTask.tags && selectedTask.tags.length > 0 && (
            <div className="mb-4">
              <div className="text-sm font-medium text-gray-500 mb-1">Tags</div>
              <div className="flex flex-wrap gap-1">
                {selectedTask.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {selectedTask.error && (
            <div className="mb-4">
              <div className="text-sm font-medium text-gray-500 mb-1">
                Error
              </div>
              <div className="p-3 bg-red-50 text-red-700 rounded font-mono text-sm overflow-auto max-h-36">
                {typeof selectedTask.error === "string"
                  ? selectedTask.error
                  : selectedTask.error instanceof Error
                  ? selectedTask.error.message
                  : "Unknown error"}
              </div>
            </div>
          )}

          <div>
            <div className="text-sm font-medium text-gray-500 mb-1">
              Task Data
            </div>
            <pre className="p-3 bg-gray-50 rounded font-mono text-sm overflow-auto max-h-96">
              {JSON.stringify(selectedTask.data, null, 2)}
            </pre>
          </div>

          {selectedTask.result && (
            <div className="mt-4">
              <div className="text-sm font-medium text-gray-500 mb-1">
                Result
              </div>
              <pre className="p-3 bg-gray-50 rounded font-mono text-sm overflow-auto max-h-96">
                {JSON.stringify(selectedTask.result, null, 2)}
              </pre>
            </div>
          )}

          <div className="mt-4 flex space-x-2">
            {(selectedTask.status === TaskStatus.FAILED ||
              selectedTask.status === TaskStatus.CANCELLED) && (
              <button
                onClick={() => handleRetryTask(selectedTask.id)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                Retry Task
              </button>
            )}

            {(selectedTask.status === TaskStatus.PENDING ||
              selectedTask.status === TaskStatus.RUNNING) && (
              <button
                onClick={() => handleCancelTask(selectedTask.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg"
              >
                Cancel Task
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
