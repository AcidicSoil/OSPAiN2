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
const react_1 = __importStar(require("react"));
const react_toastify_1 = require("react-toastify");
const apiUtils_1 = require("../utils/apiUtils");
const ErrorBoundary_1 = __importDefault(require("./ErrorBoundary"));
require("./TodoList.css");
/**
 * TodoList component that fetches and displays todo items from the API
 * with robust error handling and offline support
 */
const TodoList = () => {
    const [todoData, setTodoData] = (0, react_1.useState)(null);
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    const [lastUpdated, setLastUpdated] = (0, react_1.useState)(null);
    // Function to fetch todo data with error handling
    const fetchTodoData = async () => {
        try {
            setIsLoading(true);
            setError(null);
            apiUtils_1.apiLogger.info('Fetching todo data');
            const data = await (0, apiUtils_1.fetchWithRetry)('/api/todo', {
                // Optional configuration
                maxRetries: 3,
                cacheDuration: 10 * 60 * 1000, // 10 minutes
                headers: {
                    'Cache-Control': 'no-cache',
                }
            });
            setTodoData(data);
            setLastUpdated(new Date());
            apiUtils_1.apiLogger.info('Successfully fetched todo data');
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            apiUtils_1.apiLogger.error('Failed to fetch todo data', err);
            setError(errorMessage);
            // Show error toast
            react_toastify_1.toast.error(`Error: ${errorMessage}`, {
                position: 'top-right',
                autoClose: 5000,
            });
        }
        finally {
            setIsLoading(false);
        }
    };
    // Fetch data on component mount
    (0, react_1.useEffect)(() => {
        fetchTodoData();
        // Setup polling to check for updates periodically (every 5 minutes)
        const pollingInterval = setInterval(() => {
            if (navigator.onLine) {
                fetchTodoData();
            }
        }, 5 * 60 * 1000);
        // Cleanup interval on component unmount
        return () => clearInterval(pollingInterval);
    }, []);
    // Render loading state
    if (isLoading && !todoData) {
        return (<div className="todo-list-container loading">
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Loading tasks...</p>
        </div>
      </div>);
    }
    // Render error state if no data is available
    if (error && !todoData) {
        return (<div className="todo-list-container error">
        <div className="error-message">
          <h3>Error Loading Tasks</h3>
          <p>{error}</p>
          <button className="retry-button" onClick={fetchTodoData}>
            Try Again
          </button>
        </div>
      </div>);
    }
    // Prioritize cached data if available
    const categories = todoData?.parsedData.categories || [];
    const overallProgress = todoData?.parsedData.overallProgress || 0;
    return (<div className="todo-list-container">
      <div className="todo-header">
        <h2>Project Tasks</h2>
        {error && (<div className="connection-warning">
            <span className="warning-icon">⚠️</span>
            <span>Working with cached data. {error}</span>
          </div>)}
        {lastUpdated && (<div className="last-updated">
            Last updated: {lastUpdated.toLocaleString()}
          </div>)}
        <div className="overall-progress">
          <div className="progress-label">
            <span>Overall Progress</span>
            <span className="progress-percentage">{overallProgress}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: `${overallProgress}%` }}/>
          </div>
        </div>
      </div>

      <div className="category-list">
        {categories.map((category, index) => (<div key={index} className={`category-item priority-${category.priority}`}>
            <div className="category-header">
              <h3>{category.name}</h3>
              <span className="priority-badge">P{category.priority}</span>
            </div>
            <div className="category-progress">
              <div className="progress-bar">
                <div className="progress-bar-fill" style={{ width: `${category.progress}%` }}/>
              </div>
              <span className="progress-percentage">{category.progress}%</span>
            </div>
          </div>))}
      </div>

      <div className="actions">
        <button className="refresh-button" onClick={fetchTodoData} disabled={isLoading}>
          {isLoading ? 'Refreshing...' : 'Refresh Tasks'}
        </button>
      </div>
    </div>);
};
// Wrap the component with ErrorBoundary
const TodoListWithErrorBoundary = () => {
    return (<ErrorBoundary_1.default fallback={<div className="todo-list-error-fallback">
          <h3>Something went wrong loading the task list</h3>
          <p>Please try refreshing the page or come back later.</p>
        </div>}>
      <TodoList />
    </ErrorBoundary_1.default>);
};
exports.default = TodoListWithErrorBoundary;
//# sourceMappingURL=TodoList.js.map