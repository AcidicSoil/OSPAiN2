"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const RateLimitBypassService_1 = __importDefault(require("../../services/RateLimitBypassService"));
/**
 * ToolCallHistory Component
 *
 * Displays a history of tool calls, including:
 * - Tool name
 * - Timestamp
 * - Status (success, warning, error)
 * - Bypass method used (if applicable)
 *
 * Can be configured to show a limited number of entries
 * and to include/exclude certain information.
 */
const ToolCallHistory = ({ limit = 10, showHeader = true, showTimestamp = true, className = "", }) => {
    const [history, setHistory] = (0, react_1.useState)(RateLimitBypassService_1.default.getHistory(limit));
    (0, react_1.useEffect)(() => {
        // Use an interval to periodically refresh the history
        const interval = setInterval(() => {
            setHistory(RateLimitBypassService_1.default.getHistory(limit));
        }, 5000);
        // Initial load
        setHistory(RateLimitBypassService_1.default.getHistory(limit));
        // Cleanup interval on unmount
        return () => clearInterval(interval);
    }, [limit]);
    // Helper function to get status color class
    const getStatusColorClass = (status) => {
        switch (status) {
            case "success":
                return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
            case "warning":
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
            case "error":
                return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
        }
    };
    if (history.length === 0) {
        return (<div className={`p-4 bg-white rounded-lg shadow dark:bg-gray-800 ${className}`}>
        {showHeader && (<h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            Tool Call History
          </h3>)}
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No tool calls recorded yet.
        </p>
      </div>);
    }
    return (<div className={`p-4 bg-white rounded-lg shadow dark:bg-gray-800 ${className}`}>
      {showHeader && (<h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
          Tool Call History
        </h3>)}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                Tool
              </th>
              {showTimestamp && (<th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Time
                </th>)}
              <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                Status
              </th>
              <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                Method
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
            {history.map((call) => (<tr key={call.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                  {call.tool}
                </td>
                {showTimestamp && (<td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {call.timestamp}
                  </td>)}
                <td className="px-3 py-2 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColorClass(call.status)}`}>
                    {call.status}
                  </span>
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {call.bypassMethod || "none"}
                </td>
              </tr>))}
          </tbody>
        </table>
      </div>
    </div>);
};
exports.default = ToolCallHistory;
//# sourceMappingURL=ToolCallHistory.js.map