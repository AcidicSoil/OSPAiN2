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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskDetails = void 0;
const react_1 = __importStar(require("react"));
const Task_1 = require("../types/Task");
const TaskDetails = ({ task, onRetry, onCancel, renderTypeBadge, renderStatusBadge, renderPriorityBadge, formatDate, }) => {
    // Memoize stringified data to prevent unnecessary re-renders
    const taskDataString = (0, react_1.useMemo)(() => {
        try {
            return JSON.stringify(task.data, null, 2);
        }
        catch (err) {
            return "Error: Unable to stringify task data";
        }
    }, [task.data]);
    const taskResultString = (0, react_1.useMemo)(() => {
        if (!task.result)
            return null;
        try {
            return JSON.stringify(task.result, null, 2);
        }
        catch (err) {
            return "Error: Unable to stringify task result";
        }
    }, [task.result]);
    return (<div className="mt-4">
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

      {task.tags && task.tags.length > 0 && (<div className="mb-4">
          <div className="text-sm font-medium text-gray-500 mb-1">Tags</div>
          <div className="flex flex-wrap gap-1">
            {task.tags.map((tag) => (<span key={tag} className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                {tag}
              </span>))}
          </div>
        </div>)}

      {task.error && (<div className="mb-4">
          <div className="text-sm font-medium text-gray-500 mb-1">Error</div>
          <div className="p-3 bg-red-50 text-red-700 rounded font-mono text-sm overflow-auto max-h-36">
            {typeof task.error === "string"
                ? task.error
                : task.error instanceof Error
                    ? task.error.message
                    : "Unknown error"}
          </div>
        </div>)}

      <div>
        <div className="text-sm font-medium text-gray-500 mb-1">Task Data</div>
        <pre className="p-3 bg-gray-50 rounded font-mono text-sm overflow-auto max-h-96">
          {taskDataString}
        </pre>
      </div>

      {taskResultString && (<div className="mt-4">
          <div className="text-sm font-medium text-gray-500 mb-1">Result</div>
          <pre className="p-3 bg-gray-50 rounded font-mono text-sm overflow-auto max-h-96">
            {taskResultString}
          </pre>
        </div>)}

      <div className="mt-4 flex space-x-2">
        {(task.status === Task_1.TaskStatus.FAILED ||
            task.status === Task_1.TaskStatus.CANCELLED) && (<button onClick={() => onRetry(task.id)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Retry Task
          </button>)}

        {(task.status === Task_1.TaskStatus.PENDING ||
            task.status === Task_1.TaskStatus.RUNNING) && (<button onClick={() => onCancel(task.id)} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            Cancel Task
          </button>)}
      </div>
    </div>);
};
exports.TaskDetails = TaskDetails;
//# sourceMappingURL=TaskDetails.js.map