import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import NotionService, { NotionConfig, NotionConnectionStatus, NotionSyncResult } from '../services/NotionService';
import { TodoItem } from '../services/TodoTrackingService';

// Define the context value type
interface NotionContextType {
  // Configuration
  config: NotionConfig | null;
  updateConfig: (config: NotionConfig) => Promise<boolean>;
  
  // Connection status
  status: NotionConnectionStatus;
  testConnection: (config?: NotionConfig) => Promise<boolean>;
  
  // Task operations
  fetchTasks: () => Promise<TodoItem[]>;
  syncTasks: (tasks: TodoItem[]) => Promise<NotionSyncResult>;
  createTask: (task: TodoItem) => Promise<TodoItem>;
  updateTask: (task: TodoItem) => Promise<TodoItem>;
  deleteTask: (taskId: string) => Promise<boolean>;
  
  // State management
  isSyncing: boolean;
  lastSyncResult: NotionSyncResult | null;
  lastSyncError: string | null;
}

// Create the context with a default value
const NotionContext = createContext<NotionContextType | null>(null);

// Provider component
export const NotionProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  // Configuration state
  const [config, setConfig] = useState<NotionConfig | null>(NotionService.getConfig());
  
  // Connection status state
  const [status, setStatus] = useState<NotionConnectionStatus>(NotionService.getStatus());
  
  // Sync state
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncResult, setLastSyncResult] = useState<NotionSyncResult | null>(null);
  const [lastSyncError, setLastSyncError] = useState<string | null>(null);

  // Update status from service periodically
  useEffect(() => {
    const updateStatus = () => {
      setStatus(NotionService.getStatus());
    };

    // Initial update
    updateStatus();

    // Set up interval for updates
    const intervalId = setInterval(updateStatus, 30000); // Every 30 seconds

    // Listen for auto sync events
    const handleAutoSync = async () => {
      // Your autosync logic will be implemented elsewhere
      console.log('Auto sync triggered by timer');
    };
    
    window.addEventListener('notion:autosync', handleAutoSync);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('notion:autosync', handleAutoSync);
    };
  }, []);

  // Update config in the service
  const updateConfig = useCallback(async (newConfig: NotionConfig): Promise<boolean> => {
    const success = await NotionService.updateConfig(newConfig);
    if (success) {
      setConfig(newConfig);
      setStatus(NotionService.getStatus());
    }
    return success;
  }, []);

  // Test connection to Notion
  const testConnection = useCallback(async (testConfig?: NotionConfig): Promise<boolean> => {
    const success = await NotionService.testConnection(testConfig);
    setStatus(NotionService.getStatus());
    return success;
  }, []);

  // Fetch tasks from Notion
  const fetchTasks = useCallback(async (): Promise<TodoItem[]> => {
    try {
      return await NotionService.fetchTasks();
    } catch (error) {
      setStatus(NotionService.getStatus());
      throw error;
    }
  }, []);

  // Sync tasks with Notion
  const syncTasks = useCallback(async (tasks: TodoItem[]): Promise<NotionSyncResult> => {
    setIsSyncing(true);
    setLastSyncError(null);
    
    try {
      const result = await NotionService.syncTasks(tasks);
      setLastSyncResult(result);
      setStatus(NotionService.getStatus());
      return result;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to sync with Notion';
      setLastSyncError(errorMessage);
      setLastSyncResult({
        success: false,
        syncedCount: 0,
        error: errorMessage
      });
      setStatus(NotionService.getStatus());
      throw error;
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Create a task in Notion
  const createTask = useCallback(async (task: TodoItem): Promise<TodoItem> => {
    try {
      const createdTask = await NotionService.createTask(task);
      setStatus(NotionService.getStatus());
      return createdTask;
    } catch (error) {
      setStatus(NotionService.getStatus());
      throw error;
    }
  }, []);

  // Update a task in Notion
  const updateTask = useCallback(async (task: TodoItem): Promise<TodoItem> => {
    try {
      const updatedTask = await NotionService.updateTask(task);
      setStatus(NotionService.getStatus());
      return updatedTask;
    } catch (error) {
      setStatus(NotionService.getStatus());
      throw error;
    }
  }, []);

  // Delete a task in Notion
  const deleteTask = useCallback(async (taskId: string): Promise<boolean> => {
    try {
      const success = await NotionService.deleteTask(taskId);
      setStatus(NotionService.getStatus());
      return success;
    } catch (error) {
      setStatus(NotionService.getStatus());
      throw error;
    }
  }, []);

  // Context value
  const contextValue: NotionContextType = {
    config,
    updateConfig,
    status,
    testConnection,
    fetchTasks,
    syncTasks,
    createTask,
    updateTask,
    deleteTask,
    isSyncing,
    lastSyncResult,
    lastSyncError
  };

  return (
    <NotionContext.Provider value={contextValue}>
      {children}
    </NotionContext.Provider>
  );
};

// Custom hook to use the Notion context
export const useNotion = (): NotionContextType => {
  const context = useContext(NotionContext);
  if (!context) {
    throw new Error('useNotion must be used within a NotionProvider');
  }
  return context;
};

export default NotionContext; 