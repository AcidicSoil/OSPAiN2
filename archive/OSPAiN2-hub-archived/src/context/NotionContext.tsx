import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import notionService, { NotionTask, NotionDatabaseMapping } from '../services/NotionService';
import { TodoItem } from '../services/TodoTrackingService';

interface NotionContextType {
  isConnected: boolean;
  isConfigured: boolean;
  connectionError: any;
  notionTasks: NotionTask[];
  databaseMappings: Record<string, string>;
  isLoading: boolean;
  lastSyncTime: Date | null;
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
  syncError: string | null;
  
  // Connection and configuration
  checkConnection: () => Promise<boolean>;
  configureDatabaseMappings: (mappings: Record<string, string>) => Promise<boolean>;
  
  // Data operations
  importTasksFromNotion: () => Promise<TodoItem[]>;
  syncTasksToNotion: (tasks: TodoItem[]) => Promise<boolean>;
  refreshNotionTasks: () => Promise<void>;
  
  // CRUD operations
  getTaskById: (id: string) => Promise<NotionTask | null>;
  createTask: (task: Omit<NotionTask, 'id' | 'url' | 'lastUpdated'>) => Promise<NotionTask | null>;
  updateTask: (id: string, updates: Partial<NotionTask>) => Promise<NotionTask | null>;
  deleteTask: (id: string) => Promise<boolean>;
}

const defaultContext: NotionContextType = {
  isConnected: false,
  isConfigured: false,
  connectionError: null,
  notionTasks: [],
  databaseMappings: {},
  isLoading: false,
  lastSyncTime: null,
  syncStatus: 'idle',
  syncError: null,
  
  checkConnection: async () => false,
  configureDatabaseMappings: async () => false,
  importTasksFromNotion: async () => [],
  syncTasksToNotion: async () => false,
  refreshNotionTasks: async () => {},
  getTaskById: async () => null,
  createTask: async () => null,
  updateTask: async () => null,
  deleteTask: async () => false,
};

const NotionContext = createContext<NotionContextType>(defaultContext);

export const useNotion = () => useContext(NotionContext);

interface NotionProviderProps {
  children: ReactNode;
  autoSync?: boolean;
  syncInterval?: number; // in milliseconds
}

export const NotionProvider: React.FC<NotionProviderProps> = ({ 
  children,
  autoSync = false,
  syncInterval = 300000 // 5 minutes
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [connectionError, setConnectionError] = useState<any>(null);
  const [notionTasks, setNotionTasks] = useState<NotionTask[]>([]);
  const [databaseMappings, setDatabaseMappings] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [syncError, setSyncError] = useState<string | null>(null);

  useEffect(() => {
    // Check connection on mount
    checkConnection();

    // Subscribe to connection changes
    const unsubscribe = notionService.onConnectionChanged((status) => {
      setIsConnected(status.connected);
      setIsConfigured(status.configured);
      setConnectionError(status.error || null);
    });

    // Set up auto sync if enabled
    let syncTimer: number | null = null;
    
    if (autoSync && syncInterval > 0) {
      syncTimer = window.setInterval(() => {
        if (isConnected && isConfigured) {
          refreshNotionTasks();
        }
      }, syncInterval);
    }

    return () => {
      unsubscribe();
      if (syncTimer) {
        clearInterval(syncTimer);
      }
    };
  }, [autoSync, syncInterval, isConnected, isConfigured]);

  const checkConnection = async () => {
    setIsLoading(true);
    try {
      const connected = await notionService.checkConnection();
      
      // If we're connected and configured, get initial data
      if (connected) {
        refreshNotionTasks();
      }
      
      return connected;
    } catch (error) {
      console.error("Failed to check Notion connection:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const configureDatabaseMappings = async (mappings: Record<string, string>) => {
    setIsLoading(true);
    try {
      const success = await notionService.configureDatabaseMappings(mappings);
      if (success) {
        setDatabaseMappings(mappings);
        setIsConfigured(true);
        
        // Refresh data after successful configuration
        await refreshNotionTasks();
      }
      return success;
    } catch (error) {
      console.error("Failed to configure database mappings:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshNotionTasks = async () => {
    if (!isConnected || !isConfigured) {
      return;
    }
    
    setIsLoading(true);
    setSyncStatus('syncing');
    
    try {
      const tasks = await notionService.getTasks();
      setNotionTasks(tasks);
      setLastSyncTime(new Date());
      setSyncStatus('success');
      setSyncError(null);
    } catch (error) {
      console.error("Failed to refresh Notion tasks:", error);
      setSyncStatus('error');
      setSyncError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsLoading(false);
    }
  };

  const importTasksFromNotion = async () => {
    setIsLoading(true);
    setSyncStatus('syncing');
    
    try {
      const tasks = await notionService.importTasksFromNotion();
      setSyncStatus('success');
      setLastSyncTime(new Date());
      setSyncError(null);
      return tasks;
    } catch (error) {
      console.error("Failed to import tasks from Notion:", error);
      setSyncStatus('error');
      setSyncError(error instanceof Error ? error.message : String(error));
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const syncTasksToNotion = async (tasks: TodoItem[]) => {
    if (!isConnected || !isConfigured) {
      return false;
    }
    
    setIsLoading(true);
    setSyncStatus('syncing');
    
    try {
      const success = await notionService.syncTasksToNotion(tasks);
      setSyncStatus('success');
      setLastSyncTime(new Date());
      setSyncError(null);
      
      if (success) {
        await refreshNotionTasks(); // Refresh tasks after successful sync
      }
      
      return success;
    } catch (error) {
      console.error("Failed to sync tasks to Notion:", error);
      setSyncStatus('error');
      setSyncError(error instanceof Error ? error.message : String(error));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getTaskById = async (id: string) => {
    setIsLoading(true);
    try {
      return await notionService.getTaskById(id);
    } catch (error) {
      console.error(`Failed to get task ${id}:`, error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const createTask = async (task: Omit<NotionTask, 'id' | 'url' | 'lastUpdated'>) => {
    setIsLoading(true);
    try {
      const newTask = await notionService.createTask(task);
      if (newTask) {
        setNotionTasks(prev => [...prev, newTask]);
      }
      return newTask;
    } catch (error) {
      console.error("Failed to create task:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateTask = async (id: string, updates: Partial<NotionTask>) => {
    setIsLoading(true);
    try {
      const updatedTask = await notionService.updateTask(id, updates);
      if (updatedTask) {
        setNotionTasks(prev => 
          prev.map(task => task.id === id ? updatedTask : task)
        );
      }
      return updatedTask;
    } catch (error) {
      console.error(`Failed to update task ${id}:`, error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTask = async (id: string) => {
    setIsLoading(true);
    try {
      const success = await notionService.deleteTask(id);
      if (success) {
        setNotionTasks(prev => prev.filter(task => task.id !== id));
      }
      return success;
    } catch (error) {
      console.error(`Failed to delete task ${id}:`, error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <NotionContext.Provider
      value={{
        isConnected,
        isConfigured,
        connectionError,
        notionTasks,
        databaseMappings,
        isLoading,
        lastSyncTime,
        syncStatus,
        syncError,
        
        // Connection and configuration
        checkConnection,
        configureDatabaseMappings,
        
        // Data operations
        importTasksFromNotion,
        syncTasksToNotion,
        refreshNotionTasks,
        
        // CRUD operations
        getTaskById,
        createTask,
        updateTask,
        deleteTask,
      }}
    >
      {children}
    </NotionContext.Provider>
  );
};

export default NotionProvider; 