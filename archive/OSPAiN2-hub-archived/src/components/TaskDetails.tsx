import React, { useMemo } from "react";
import { Task, TaskStatus } from "../types/Task";

interface TaskDetailsProps {
  task: Task;
  onRetry: (taskId: string) => void;
  onCancel: (taskId: string) => void;
  renderTypeBadge: (type: Task["type"]) => JSX.Element;
  renderStatusBadge: (status: Task["status"]) => JSX.Element;
  renderPriorityBadge: (priority: Task["priority"]) => JSX.Element;
  formatDate: (date: Date) => string;
}

export const TaskDetails: React.FC<TaskDetailsProps> = ({
  task,
  onRetry,
  onCancel,
  renderTypeBadge,
  renderStatusBadge,
  renderPriorityBadge,
  formatDate,
}) => {
  // Memoize stringified data to prevent unnecessary re-renders
  const taskDataString = useMemo(() => {
    try {
      return JSON.stringify(task.data, null, 2);
    } catch (err) {
      return "Error: Unable to stringify task data";
    }
  }, [task.data]);

  const taskResultString = useMemo(() => {
    if (!task.result) return null;
    try {
      return JSON.stringify(task.result, null, 2);
    } catch (err) {
      return "Error: Unable to stringify task result";
    }
  }, [task.result]);

  return (
    <div className="mt-4">
      <div className="text-lg font-semibold mb-4">Task Details</div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-sm font-medium text-gray-500">ID</div>
          <div className="font-mono">{task.id}</div>
        </div>
        <div>
          <div className="text-sm font-medium text-gray-500">Type</div>
          <div>{renderTypeBadge(task.type)}</div>
        </div>
        <div>
          <div className="text-sm font-medium text-gray-500">Status</div>
          <div>{renderStatusBadge(task.status)}</div>
        </div>
        <div>
          <div className="text-sm font-medium text-gray-500">Priority</div>
          <div>{renderPriorityBadge(task.priority)}</div>
        </div>
        <div>
          <div className="text-sm font-medium text-gray-500">Created</div>
          <div>{formatDate(task.createdAt)}</div>
        </div>
        <div>
          <div className="text-sm font-medium text-gray-500">Attempts</div>
          <div>
            {task.attempts} / {task.maxAttempts}
          </div>
        </div>
      </div>

      {task.tags && task.tags.length > 0 && (
        <div className="mb-4">
          <div className="text-sm font-medium text-gray-500 mb-1">Tags</div>
          <div className="flex flex-wrap gap-1">
            {task.tags.map((tag) => (
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

      {task.error && (
        <div className="mb-4">
          <div className="text-sm font-medium text-gray-500 mb-1">Error</div>
          <div className="p-3 bg-red-50 text-red-700 rounded font-mono text-sm overflow-auto max-h-36">
            {typeof task.error === "string"
              ? task.error
              : task.error instanceof Error
              ? task.error.message
              : "Unknown error"}
          </div>
        </div>
      )}

      <div>
        <div className="text-sm font-medium text-gray-500 mb-1">Task Data</div>
        <pre className="p-3 bg-gray-50 rounded font-mono text-sm overflow-auto max-h-96">
          {taskDataString}
        </pre>
      </div>

      {taskResultString && (
        <div className="mt-4">
          <div className="text-sm font-medium text-gray-500 mb-1">Result</div>
          <pre className="p-3 bg-gray-50 rounded font-mono text-sm overflow-auto max-h-96">
            {taskResultString}
          </pre>
        </div>
      )}

      <div className="mt-4 flex space-x-2">
        {(task.status === TaskStatus.FAILED ||
          task.status === TaskStatus.CANCELLED) && (
          <button
            onClick={() => onRetry(task.id)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry Task
          </button>
        )}

        {(task.status === TaskStatus.PENDING ||
          task.status === TaskStatus.RUNNING) && (
          <button
            onClick={() => onCancel(task.id)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Cancel Task
          </button>
        )}
      </div>
    </div>
  );
};
