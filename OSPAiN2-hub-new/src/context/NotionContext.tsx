import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { NotionService, getNotionService, NotionDatabase } from '../services/NotionService';

interface NotionContextType {
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  databases: NotionDatabase[];
  selectedDatabase: NotionDatabase | null;
  checkConnection: () => Promise<boolean>;
  selectDatabase: (database: NotionDatabase) => void;
  refreshDatabases: () => Promise<NotionDatabase[]>;
  search: (query: string) => Promise<any[]>;
}

const NotionContext = createContext<NotionContextType | undefined>(undefined);

export const useNotion = () => {
  const context = useContext(NotionContext);
  if (context === undefined) {
    throw new Error('useNotion must be used within a NotionProvider');
  }
  return context;
};

interface NotionProviderProps {
  children: ReactNode;
}

export const NotionProvider: React.FC<NotionProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [databases, setDatabases] = useState<NotionDatabase[]>([]);
  const [selectedDatabase, setSelectedDatabase] = useState<NotionDatabase | null>(null);

  const notionService = getNotionService();

  const checkConnection = async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const connected = await notionService.checkConnection();
      setIsConnected(connected);
      
      if (connected) {
        await refreshDatabases();
      }
      
      return connected;
    } catch (err) {
      setError('Failed to connect to Notion service');
      console.error(err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshDatabases = async (): Promise<NotionDatabase[]> => {
    try {
      const dbs = await notionService.getDatabases();
      setDatabases(dbs);
      return dbs;
    } catch (err) {
      setError('Failed to fetch Notion databases');
      console.error(err);
      return [];
    }
  };

  const selectDatabase = (database: NotionDatabase) => {
    setSelectedDatabase(database);
    notionService.setDatabaseId(database.id);
  };

  const search = async (query: string): Promise<any[]> => {
    try {
      return await notionService.searchNotes(query);
    } catch (err) {
      setError('Failed to search Notion');
      console.error(err);
      return [];
    }
  };

  // Initialize connection on component mount
  useEffect(() => {
    checkConnection();
  }, []);

  const value = {
    isConnected,
    isLoading,
    error,
    databases,
    selectedDatabase,
    checkConnection,
    selectDatabase,
    refreshDatabases,
    search
  };

  return (
    <NotionContext.Provider value={value}>
      {children}
    </NotionContext.Provider>
  );
}; 