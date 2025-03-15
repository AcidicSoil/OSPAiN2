import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { fetchWithRetry, apiLogger } from '../utils/apiUtils';
import ErrorBoundary from './ErrorBoundary';
import './TodoList.css';

interface TodoCategory {
  name: string;
  priority: number;
  progress: number;
}

interface TodoData {
  content: string;
  metadata?: {
    size: number;
    lastModified: string;
    path: string;
  };
  parsedData: {
    categories: TodoCategory[];
    overallProgress: number;
  };
}

/**
 * TodoList component that fetches and displays todo items from the API
 * with robust error handling and offline support
 */
const TodoList: React.FC = () => {
  const [todoData, setTodoData] = useState<TodoData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Function to fetch todo data with error handling
  const fetchTodoData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      apiLogger.info('Fetching todo data');
      
      const data = await fetchWithRetry<TodoData>('/api/todo', {
        // Optional configuration
        maxRetries: 3,
        cacheDuration: 10 * 60 * 1000, // 10 minutes
        headers: {
          'Cache-Control': 'no-cache',
        }
      });
      
      setTodoData(data);
      setLastUpdated(new Date());
      
      apiLogger.info('Successfully fetched todo data');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      
      apiLogger.error('Failed to fetch todo data', err);
      setError(errorMessage);
      
      // Show error toast
      toast.error(`Error: ${errorMessage}`, {
        position: 'top-right',
        autoClose: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
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
    return (
      <div className="todo-list-container loading">
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Loading tasks...</p>
        </div>
      </div>
    );
  }

  // Render error state if no data is available
  if (error && !todoData) {
    return (
      <div className="todo-list-container error">
        <div className="error-message">
          <h3>Error Loading Tasks</h3>
          <p>{error}</p>
          <button className="retry-button" onClick={fetchTodoData}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Prioritize cached data if available
  const categories = todoData?.parsedData.categories || [];
  const overallProgress = todoData?.parsedData.overallProgress || 0;

  return (
    <div className="todo-list-container">
      <div className="todo-header">
        <h2>Project Tasks</h2>
        {error && (
          <div className="connection-warning">
            <span className="warning-icon">⚠️</span>
            <span>Working with cached data. {error}</span>
          </div>
        )}
        {lastUpdated && (
          <div className="last-updated">
            Last updated: {lastUpdated.toLocaleString()}
          </div>
        )}
        <div className="overall-progress">
          <div className="progress-label">
            <span>Overall Progress</span>
            <span className="progress-percentage">{overallProgress}%</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-bar-fill" 
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="category-list">
        {categories.map((category, index) => (
          <div 
            key={index} 
            className={`category-item priority-${category.priority}`}
          >
            <div className="category-header">
              <h3>{category.name}</h3>
              <span className="priority-badge">P{category.priority}</span>
            </div>
            <div className="category-progress">
              <div className="progress-bar">
                <div 
                  className="progress-bar-fill" 
                  style={{ width: `${category.progress}%` }}
                />
              </div>
              <span className="progress-percentage">{category.progress}%</span>
            </div>
          </div>
        ))}
      </div>

      <div className="actions">
        <button 
          className="refresh-button"
          onClick={fetchTodoData}
          disabled={isLoading}
        >
          {isLoading ? 'Refreshing...' : 'Refresh Tasks'}
        </button>
      </div>
    </div>
  );
};

// Wrap the component with ErrorBoundary
const TodoListWithErrorBoundary: React.FC = () => {
  return (
    <ErrorBoundary
      fallback={
        <div className="todo-list-error-fallback">
          <h3>Something went wrong loading the task list</h3>
          <p>Please try refreshing the page or come back later.</p>
        </div>
      }
    >
      <TodoList />
    </ErrorBoundary>
  );
};

export default TodoListWithErrorBoundary; 