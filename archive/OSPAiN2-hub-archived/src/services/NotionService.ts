import axios from 'axios';
import { TodoItem } from './TodoTrackingService';

/**
 * Interface representing a Notion task/todo item
 */
export interface NotionTask {
  id: string;
  title: string;
  content?: string;
  status: string;
  priority?: number;
  tags: string[];
  lastUpdated: Date;
  url: string;
  dueDate?: Date;
  category?: string;
}

/**
 * Interface for Notion API response status
 */
export interface NotionConnectionStatus {
  isConnected: boolean;
  lastSynced: Date | null;
  error: string | null;
}

/**
 * Interface for Notion database mapping
 */
export interface NotionDatabaseMapping {
  title: string;
  status: string;
  priority: string;
  tags: string;
  content: string;
  dueDate: string;
  category: string;
}

/**
 * Interface for Notion configuration
 */
export interface NotionConfig {
  apiKey: string;
  databaseId: string;
  mappings?: Record<string, string>;
  autoSync: boolean;
  syncInterval: number; // In minutes
}

/**
 * Interface for Notion sync result
 */
export interface NotionSyncResult {
  success: boolean;
  syncedCount: number;
  results?: {
    created: number;
    updated: number;
    skipped: number;
    failed: number;
  };
  error?: string;
}

/**
 * NotionService
 * 
 * Service for interacting with Notion API through our MCP server
 * Handles tasks, notes, and knowledge graph integration
 */
class NotionService {
  private static instance: NotionService;
  private config: NotionConfig | null = null;
  private status: NotionConnectionStatus = {
    isConnected: false,
    lastSynced: null,
    error: null
  };
  private syncTimer: NodeJS.Timeout | null = null;
  private serverUrl: string = 'http://localhost:3003';

  private constructor() {
    // Load config from localStorage
    const savedConfig = localStorage.getItem('notion_config');
    if (savedConfig) {
      try {
        this.config = JSON.parse(savedConfig);
        this.setupAutoSync();
      } catch (error) {
        console.error('Failed to parse saved Notion config', error);
      }
    }
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): NotionService {
    if (!NotionService.instance) {
      NotionService.instance = new NotionService();
    }
    return NotionService.instance;
  }

  /**
   * Set the server URL for Notion MCP server
   */
  public setServerUrl(url: string): void {
    this.serverUrl = url;
  }

  /**
   * Get the current configuration
   */
  public getConfig(): NotionConfig | null {
    return this.config;
  }

  /**
   * Update the Notion configuration
   */
  public async updateConfig(config: NotionConfig): Promise<boolean> {
    try {
      // Save config to localStorage
      localStorage.setItem('notion_config', JSON.stringify(config));
      this.config = config;
      
      // Test connection with new config
      await this.testConnection(config);
      
      // Setup auto sync if enabled
      this.stopAutoSync();
      if (config.autoSync) {
        this.setupAutoSync();
      }
      
      return true;
    } catch (error) {
      console.error('Failed to update Notion config', error);
      return false;
    }
  }

  /**
   * Test connection to Notion API
   */
  public async testConnection(config?: NotionConfig): Promise<boolean> {
    try {
      const configToTest = config || this.config;
      if (!configToTest) {
        throw new Error('No configuration provided');
      }

      const response = await axios.post(`${this.serverUrl}/api/connect`, {
        apiKey: configToTest.apiKey,
        databaseId: configToTest.databaseId,
        mappings: configToTest.mappings
      });

      if (response.data && response.data.success) {
        this.status = {
          isConnected: true,
          lastSynced: this.status.lastSynced,
          error: null
        };
        return true;
      } else {
        throw new Error(response.data?.error || 'Unknown error');
      }
    } catch (error: any) {
      this.status = {
        isConnected: false,
        lastSynced: this.status.lastSynced,
        error: error.message || 'Connection failed'
      };
      return false;
    }
  }

  /**
   * Get the current connection status
   */
  public getStatus(): NotionConnectionStatus {
    return this.status;
  }

  /**
   * Fetch tasks from Notion
   */
  public async fetchTasks(): Promise<TodoItem[]> {
    try {
      if (!this.config) {
        throw new Error('Notion is not configured');
      }

      const response = await axios.get(`${this.serverUrl}/api/tasks`);
      
      if (response.data && Array.isArray(response.data)) {
        // Transform Notion tasks to TodoItems
        return response.data.map((task: any) => ({
          id: `notion-${task.id}`,
          title: task.title,
          description: task.content,
          status: task.status,
          priority: task.priority,
          tags: task.tags,
          category: task.category,
          dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
          lastUpdated: task.lastUpdated ? new Date(task.lastUpdated) : new Date(),
          source: 'notion',
          sourceUrl: task.url
        }));
      } else {
        throw new Error(response.data?.error || 'Failed to fetch tasks');
      }
    } catch (error: any) {
      this.status.error = error.message || 'Failed to fetch tasks';
      console.error('Error fetching Notion tasks:', error);
      throw error;
    }
  }

  /**
   * Sync tasks with Notion
   */
  public async syncTasks(tasks: TodoItem[]): Promise<NotionSyncResult> {
    try {
      if (!this.config) {
        throw new Error('Notion is not configured');
      }

      // Format tasks for Notion
      const formattedTasks = tasks.map(task => ({
        id: task.id?.startsWith('notion-') ? task.id : undefined,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        tags: task.tags,
        category: task.category,
        dueDate: task.dueDate?.toISOString()
      }));

      const response = await axios.post(`${this.serverUrl}/api/sync`, {
        tasks: formattedTasks
      });
      
      if (response.data && response.data.success) {
        // Update status
        this.status = {
          isConnected: true,
          lastSynced: new Date(),
          error: null
        };
        
        return {
          success: true,
          syncedCount: response.data.syncedCount,
          results: response.data.results
        };
      } else {
        throw new Error(response.data?.error || 'Failed to sync tasks');
      }
    } catch (error: any) {
      this.status.error = error.message || 'Failed to sync tasks';
      console.error('Error syncing tasks with Notion:', error);
      
      return {
        success: false,
        syncedCount: 0,
        error: error.message || 'Failed to sync tasks'
      };
    }
  }

  /**
   * Create a task in Notion
   */
  public async createTask(task: TodoItem): Promise<TodoItem> {
    try {
      if (!this.config) {
        throw new Error('Notion is not configured');
      }

      const formattedTask = {
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        tags: task.tags,
        category: task.category,
        dueDate: task.dueDate?.toISOString()
      };

      const response = await axios.post(`${this.serverUrl}/api/tasks`, {
        task: formattedTask
      });
      
      if (response.data) {
        // Update status
        this.status.isConnected = true;
        this.status.error = null;
        
        // Return created task with Notion ID and URL
        return {
          ...task,
          id: `notion-${response.data.id}`,
          source: 'notion',
          sourceUrl: response.data.url,
          lastUpdated: new Date()
        };
      } else {
        throw new Error(response.data?.error || 'Failed to create task');
      }
    } catch (error: any) {
      this.status.error = error.message || 'Failed to create task';
      console.error('Error creating task in Notion:', error);
      throw error;
    }
  }

  /**
   * Update a task in Notion
   */
  public async updateTask(task: TodoItem): Promise<TodoItem> {
    try {
      if (!this.config || !task.id?.startsWith('notion-')) {
        throw new Error('Cannot update task: Invalid ID or Notion not configured');
      }

      const notionId = task.id.replace('notion-', '');
      const updates = {
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        tags: task.tags,
        category: task.category,
        dueDate: task.dueDate?.toISOString()
      };

      const response = await axios.put(`${this.serverUrl}/api/tasks/${notionId}`, {
        updates
      });
      
      if (response.data) {
        // Update status
        this.status.isConnected = true;
        this.status.error = null;
        
        return {
          ...task,
          lastUpdated: new Date()
        };
      } else {
        throw new Error(response.data?.error || 'Failed to update task');
      }
    } catch (error: any) {
      this.status.error = error.message || 'Failed to update task';
      console.error('Error updating task in Notion:', error);
      throw error;
    }
  }

  /**
   * Delete a task in Notion
   */
  public async deleteTask(taskId: string): Promise<boolean> {
    try {
      if (!this.config || !taskId.startsWith('notion-')) {
        throw new Error('Cannot delete task: Invalid ID or Notion not configured');
      }

      const notionId = taskId.replace('notion-', '');
      const response = await axios.delete(`${this.serverUrl}/api/tasks/${notionId}`);
      
      if (response.data && response.data.success) {
        // Update status
        this.status.isConnected = true;
        this.status.error = null;
        
        return true;
      } else {
        throw new Error(response.data?.error || 'Failed to delete task');
      }
    } catch (error: any) {
      this.status.error = error.message || 'Failed to delete task';
      console.error('Error deleting task in Notion:', error);
      throw error;
    }
  }

  /**
   * Setup auto sync timer
   */
  private setupAutoSync(): void {
    if (this.config?.autoSync && this.config.syncInterval > 0) {
      // Convert minutes to milliseconds
      const interval = this.config.syncInterval * 60 * 1000;
      
      this.syncTimer = setInterval(async () => {
        try {
          // Auto sync logic will be implemented by consumers
          const event = new CustomEvent('notion:autosync');
          window.dispatchEvent(event);
        } catch (error) {
          console.error('Auto sync error:', error);
        }
      }, interval);
    }
  }

  /**
   * Stop auto sync timer
   */
  private stopAutoSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
  }
}

export default NotionService.getInstance(); 