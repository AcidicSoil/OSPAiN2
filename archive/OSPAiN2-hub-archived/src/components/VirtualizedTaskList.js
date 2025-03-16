"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VirtualizedTaskList = void 0;
const react_1 = __importDefault(require("react"));
const react_window_1 = require("react-window");
const Task_1 = require("../types/Task");
const ITEM_HEIGHT = 64; // Height of each row in pixels
const VirtualizedTaskList = ({ tasks, selectedTaskId, onSelectTask, onCancelTask, onRetryTask, renderTypeBadge, renderStatusBadge, renderPriorityBadge, formatDate, }) => {
    const Row = react_1.default.memo(({ index, style }) => {
        const task = tasks[index];
        return (<div style={style} className={`flex items-center border-b border-gray-200 hover:bg-gray-50 cursor-pointer ${selectedTaskId === task.id ? "bg-blue-50" : ""}`} onClick={() => onSelectTask(task.id)}>
          <div className="flex-1 px-6 py-4 whitespace-nowrap">
            <span className="text-sm font-mono text-gray-900">
              {task.id.substring(0, 8)}...
            </span>
          </div>
          <div className="flex-1 px-6 py-4 whitespace-nowrap">
            {renderTypeBadge(task.type)}
          </div>
          <div className="flex-1 px-6 py-4 whitespace-nowrap">
            {renderStatusBadge(task.status)}
          </div>
          <div className="flex-1 px-6 py-4 whitespace-nowrap">
            {renderPriorityBadge(task.priority)}
          </div>
          <div className="flex-1 px-6 py-4 whitespace-nowrap">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${task.progress || 0}%` }}></div>
            </div>
            <span className="text-xs text-gray-500">{task.progress || 0}%</span>
          </div>
          <div className="flex-1 px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {formatDate(task.createdAt)}
          </div>
          <div className="flex-1 px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            {task.status === Task_1.TaskStatus.PENDING ||
                task.status === Task_1.TaskStatus.RUNNING ? (<button onClick={(e) => {
                    e.stopPropagation();
                    onCancelTask(task.id);
                }} className="text-red-600 hover:text-red-900 mr-2">
                Cancel
              </button>) : null}

            {task.status === Task_1.TaskStatus.FAILED ||
                task.status === Task_1.TaskStatus.CANCELLED ? (<button onClick={(e) => {
                    e.stopPropagation();
                    onRetryTask(task.id);
                }} className="text-blue-600 hover:text-blue-900">
                Retry
              </button>) : null}
          </div>
        </div>);
    });
    return (<react_window_1.FixedSizeList height={Math.min(tasks.length * ITEM_HEIGHT, 600)} // Max height of 600px
     itemCount={tasks.length} itemSize={ITEM_HEIGHT} width="100%" className="overflow-x-auto">
      {Row}
    </react_window_1.FixedSizeList>);
};
exports.VirtualizedTaskList = VirtualizedTaskList;
//# sourceMappingURL=VirtualizedTaskList.js.map