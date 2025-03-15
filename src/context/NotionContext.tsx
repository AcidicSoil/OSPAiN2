import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import NotionService, { NotionTask, NotionSyncResult } from '../services/NotionService';

interface NotionContextProps {
  isConnected: boolean;
  isLoading: boolean;
  tasks: NotionTask[];
  syncTasks: (tasks: NotionTask[]) => Promise<NotionSyncResult>;
  checkConnection: () => Promise<boolean>;
  refreshTasks: () => Promise<NotionTask[]>;
  searchNotes: (query: string, limit?: number) => Promise<any[]>;
}

const NotionContext = createContext<NotionContextProps | undefined>(undefined);

interface NotionProviderProps {
  children: ReactNode;
}

export const NotionProvider: React.FC<NotionProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [tasks, setTasks] = useState<NotionTask[]>([]);

  useEffect(() => {
    const initializeNotion = async () => {
      try {
        setIsLoading(true);
        const connected = await NotionService.checkConnection();
        setIsConnected(connected);
        
        if (connected) {
          const notionTasks = await NotionService.getTasks();
          setTasks(notionTasks);
        }
      } catch (error) {
        console.error('Failed to initialize Notion:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeNotion();
  }, []);

  const checkConnection = async (): Promise<boolean> => {
    const connected = await NotionService.checkConnection();
    setIsConnected(connected);
    return connected;
  };

  const refreshTasks = async (): Promise<NotionTask[]> => {
    try {
      setIsLoading(true);
      if (isConnected) {
        const notionTasks = await NotionService.getTasks();
        setTasks(notionTasks);
        return notionTasks;
      }
      return [];
    } catch (error) {
      console.error('Failed to refresh Notion tasks:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const syncTasks = async (tasksToSync: NotionTask[]): Promise<NotionSyncResult> => {
    try {
      setIsLoading(true);
      const result = await NotionService.syncTasks(tasksToSync);
      
      if (result.success && result.tasks) {
        setTasks(result.tasks);
      }
      
      return result;
    } catch (error) {
      console.error('Failed to sync tasks with Notion:', error);
      return {
        success: false,
        error: 'Failed to sync with Notion'
      };
    } finally {
      setIsLoading(false);
    }
  };

  const searchNotes = async (query: string, limit: number = 10): Promise<any[]> => {
    if (!isConnected) {
      return [];
    }
    return NotionService.searchNotes(query, limit);
  };

  const value: NotionContextProps = {
    isConnected,
    isLoading,
    tasks,
    syncTasks,
    checkConnection,
    refreshTasks,
    searchNotes
  };

  return (
    <NotionContext.Provider value={value}>
      {children}
    </NotionContext.Provider>
  );
};

export const useNotion = (): NotionContextProps => {
  const context = useContext(NotionContext);
  if (context === undefined) {
    throw new Error('useNotion must be used within a NotionProvider');
  }
  return context;
};

export default NotionContext; 