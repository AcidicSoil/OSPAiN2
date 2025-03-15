"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskDashboard = void 0;
const react_1 = __importStar(require("react"));
const Task_1 = require("../types/Task");
const TaskQueue_1 = __importDefault(require("../services/TaskQueue"));
const WorkerManager_1 = __importDefault(require("../services/WorkerManager"));
const react_toastify_1 = require("react-toastify");
const VirtualizedTaskList_1 = require("./VirtualizedTaskList");
const TaskDetails_1 = require("./TaskDetails");
const material_1 = require("@mui/material");
function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (<div role="tabpanel" hidden={value !== index} id={`task-tabpanel-${index}`} aria-labelledby={`task-tab-${index}`} {...other}>
      {value === index && <material_1.Box sx={{ p: 3 }}>{children}</material_1.Box>}
    </div>);
}
function a11yProps(index) {
    return {
        id: `task-tab-${index}`,
        "aria-controls": `task-tabpanel-${index}`,
    };
}
/**
 * Dashboard component for monitoring and managing the task system
 * Implements local-first task management with error handling and state persistence
 */
const TaskDashboard = ({ refreshInterval = 2000, }) => {
    // State for tasks and worker stats
    const [tasks, setTasks] = (0, react_1.useState)([]);
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    const [workerStats, setWorkerStats] = (0, react_1.useState)({
        total: 0,
        active: 0,
        idle: 0,
        status: "stopped",
    });
    const [selectedTaskId, setSelectedTaskId] = (0, react_1.useState)(null);
    const [taskFilter, setTaskFilter] = (0, react_1.useState)({});
    // Memoized refresh functions
    const refreshTasks = (0, react_1.useCallback)(async () => {
        try {
            setError(null);
            const updatedTasks = await TaskQueue_1.default.getAllTasks();
            setTasks(updatedTasks);
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to fetch tasks";
            setError(errorMessage);
            react_toastify_1.toast.error(errorMessage);
        }
    }, []);
    const refreshWorkerStats = (0, react_1.useCallback)(async () => {
        try {
            const stats = await WorkerManager_1.default.getStatus();
            setWorkerStats({
                total: stats.totalWorkers,
                active: stats.activeWorkers,
                idle: stats.idleWorkers,
                status: stats.status,
            });
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to fetch worker stats";
            react_toastify_1.toast.error(errorMessage);
        }
    }, []);
    // Initialize services and set up event listeners
    (0, react_1.useEffect)(() => {
        let isSubscribed = true;
        const initialize = async () => {
            try {
                setIsLoading(true);
                await Promise.all([refreshTasks(), refreshWorkerStats()]);
            }
            catch (err) {
                const errorMessage = err instanceof Error ? err.message : "Failed to initialize dashboard";
                setError(errorMessage);
                react_toastify_1.toast.error(errorMessage);
            }
            finally {
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
        TaskQueue_1.default.on("taskUpdated", handleTaskUpdated);
        // Subscribe to worker manager events
        const handleStatusChanged = () => {
            if (isSubscribed) {
                refreshWorkerStats();
            }
        };
        WorkerManager_1.default.on("statusChanged", handleStatusChanged);
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
            TaskQueue_1.default.off("taskUpdated", handleTaskUpdated);
            WorkerManager_1.default.off("statusChanged", handleStatusChanged);
        };
    }, [refreshInterval, refreshTasks, refreshWorkerStats]);
    // Handle starting worker manager
    const handleStartWorkers = async () => {
        await WorkerManager_1.default.start();
        refreshWorkerStats();
    };
    // Handle stopping worker manager
    const handleStopWorkers = async () => {
        await WorkerManager_1.default.stop();
        refreshWorkerStats();
    };
    // Handle cancelling a task
    const handleCancelTask = async (taskId) => {
        await TaskQueue_1.default.cancelTask(taskId);
        refreshTasks();
    };
    // Handle retrying a failed task
    const handleRetryTask = async (taskId) => {
        const task = await TaskQueue_1.default.getTask(taskId);
        if (task &&
            (task.status === Task_1.TaskStatus.FAILED ||
                task.status === Task_1.TaskStatus.CANCELLED)) {
            task.status = Task_1.TaskStatus.PENDING;
            task.attempts = 0;
            task.error = undefined;
            await TaskQueue_1.default.updateTask(task);
            refreshTasks();
        }
    };
    // Handle selecting a task for details
    const handleSelectTask = (taskId) => {
        setSelectedTaskId(taskId === selectedTaskId ? null : taskId);
    };
    // Memoized filtered tasks
    const filteredTasks = (0, react_1.useMemo)(() => {
        return tasks
            .filter((task) => {
            if (taskFilter.status && task.status !== taskFilter.status)
                return false;
            if (taskFilter.type && task.type !== taskFilter.type)
                return false;
            if (taskFilter.priority && task.priority !== taskFilter.priority)
                return false;
            if (taskFilter.tag &&
                (!task.tags || !task.tags.includes(taskFilter.tag)))
                return false;
            return true;
        })
            .sort((a, b) => {
            // Sort by priority first
            if (a.priority !== b.priority) {
                return a.priority - b.priority;
            }
            // Then by creation date
            return (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        });
    }, [tasks, taskFilter]);
    // Memoized badge rendering functions
    const renderStatusBadge = (0, react_1.useMemo)(() => {
        return (status) => {
            let colorClass = "";
            switch (status) {
                case Task_1.TaskStatus.PENDING:
                    colorClass = "bg-yellow-100 text-yellow-800";
                    break;
                case Task_1.TaskStatus.RUNNING:
                    colorClass = "bg-blue-100 text-blue-800";
                    break;
                case Task_1.TaskStatus.COMPLETED:
                    colorClass = "bg-green-100 text-green-800";
                    break;
                case Task_1.TaskStatus.FAILED:
                    colorClass = "bg-red-100 text-red-800";
                    break;
                case Task_1.TaskStatus.CANCELLED:
                    colorClass = "bg-gray-100 text-gray-800";
                    break;
                case Task_1.TaskStatus.RETRY:
                    colorClass = "bg-purple-100 text-purple-800";
                    break;
            }
            return (<span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
          {status}
        </span>);
        };
    }, []);
    const renderPriorityBadge = (0, react_1.useMemo)(() => {
        return (priority) => {
            let label = "";
            let colorClass = "";
            switch (priority) {
                case Task_1.TaskPriority.CRITICAL:
                    label = "Critical";
                    colorClass = "bg-red-100 text-red-800";
                    break;
                case Task_1.TaskPriority.HIGH:
                    label = "High";
                    colorClass = "bg-orange-100 text-orange-800";
                    break;
                case Task_1.TaskPriority.MEDIUM:
                    label = "Medium";
                    colorClass = "bg-yellow-100 text-yellow-800";
                    break;
                case Task_1.TaskPriority.LOW:
                    label = "Low";
                    colorClass = "bg-green-100 text-green-800";
                    break;
                case Task_1.TaskPriority.BACKGROUND:
                    label = "Background";
                    colorClass = "bg-gray-100 text-gray-800";
                    break;
            }
            return (<span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
          {label}
        </span>);
        };
    }, []);
    const renderTypeBadge = (0, react_1.useMemo)(() => {
        return (type) => {
            let label = "";
            let colorClass = "";
            switch (type) {
                case Task_1.TaskType.MODEL_REQUEST:
                    label = "Model";
                    colorClass = "bg-indigo-100 text-indigo-800";
                    break;
                case Task_1.TaskType.EMBEDDINGS:
                    label = "Embeddings";
                    colorClass = "bg-purple-100 text-purple-800";
                    break;
                case Task_1.TaskType.FILE_OPERATION:
                    label = "File";
                    colorClass = "bg-blue-100 text-blue-800";
                    break;
                case Task_1.TaskType.DATA_PROCESSING:
                    label = "Data";
                    colorClass = "bg-green-100 text-green-800";
                    break;
                case Task_1.TaskType.EXTERNAL_API:
                    label = "API";
                    colorClass = "bg-yellow-100 text-yellow-800";
                    break;
                case Task_1.TaskType.CUSTOM:
                    label = "Custom";
                    colorClass = "bg-gray-100 text-gray-800";
                    break;
            }
            return (<span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
          {label}
        </span>);
        };
    }, []);
    // Memoized date formatter
    const formatDate = (0, react_1.useMemo)(() => {
        return (date) => new Date(date).toLocaleString();
    }, []);
    // Find selected task
    const selectedTask = selectedTaskId
        ? tasks.find((t) => t.id === selectedTaskId)
        : null;
    // QUESTION: Should we implement virtualization for the task list to improve performance with large numbers of tasks? #performance #medium
    // The current implementation might have performance issues when dealing with hundreds or thousands of tasks.
    // Potential solutions: react-window, react-virtualized, or custom implementation with intersection observer.
    return (<div className="p-4 bg-white rounded-lg shadow">
      {isLoading ? (<div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>) : error ? (<div className="flex flex-col items-center justify-center h-64">
          <div className="text-red-500 mb-4">{error}</div>
          <button onClick={() => {
                setIsLoading(true);
                setError(null);
                Promise.all([refreshTasks(), refreshWorkerStats()]).finally(() => setIsLoading(false));
            }} className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors">
            Retry
          </button>
        </div>) : (<>
          {/* Worker Controls */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold">Task Dashboard</h2>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Workers:</span>
                <span className={`px-2 py-1 rounded text-sm ${workerStats.status === "running"
                ? "bg-green-100 text-green-800"
                : workerStats.status === "stopped"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"}`}>
                  {workerStats.status}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                {workerStats.active}/{workerStats.total} active
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button onClick={handleStartWorkers} disabled={workerStats.status === "running"} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                Start Workers
              </button>
              <button onClick={handleStopWorkers} disabled={workerStats.status === "stopped"} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                Stop Workers
              </button>
            </div>
          </div>

          {/* Task Filters */}
          <div className="mb-6 grid grid-cols-4 gap-4">
            <select value={taskFilter.status || ""} onChange={(e) => setTaskFilter({
                ...taskFilter,
                status: e.target.value,
            })} className="form-select">
              <option value="">All Statuses</option>
              {Object.values(Task_1.TaskStatus).map((status) => (<option key={status} value={status}>
                  {status}
                </option>))}
            </select>
            <select value={taskFilter.type || ""} onChange={(e) => setTaskFilter({
                ...taskFilter,
                type: e.target.value,
            })} className="form-select">
              <option value="">All Types</option>
              {Object.values(Task_1.TaskType).map((type) => (<option key={type} value={type}>
                  {type}
                </option>))}
            </select>
            <select value={taskFilter.priority || ""} onChange={(e) => setTaskFilter({
                ...taskFilter,
                priority: Number(e.target.value),
            })} className="form-select">
              <option value="">All Priorities</option>
              {Object.values(Task_1.TaskPriority)
                .filter((p) => !isNaN(Number(p)))
                .map((priority) => (<option key={priority} value={priority}>
                    P{priority}
                  </option>))}
            </select>
            <input type="text" value={taskFilter.tag || ""} onChange={(e) => setTaskFilter({ ...taskFilter, tag: e.target.value })} placeholder="Filter by tag..." className="form-input"/>
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
              <VirtualizedTaskList_1.VirtualizedTaskList tasks={filteredTasks} selectedTaskId={selectedTaskId} onSelectTask={handleSelectTask} onCancelTask={handleCancelTask} onRetryTask={handleRetryTask} renderTypeBadge={renderTypeBadge} renderStatusBadge={renderStatusBadge} renderPriorityBadge={renderPriorityBadge} formatDate={formatDate}/>
            </div>
          </div>

          {/* Task Details */}
          {selectedTask && (<TaskDetails_1.TaskDetails task={selectedTask} onRetry={handleRetryTask} onCancel={handleCancelTask} renderTypeBadge={renderTypeBadge} renderStatusBadge={renderStatusBadge} renderPriorityBadge={renderPriorityBadge} formatDate={formatDate}/>)}
        </>)}
    </div>);
};
exports.TaskDashboard = TaskDashboard;
//# sourceMappingURL=TaskDashboard.js.map