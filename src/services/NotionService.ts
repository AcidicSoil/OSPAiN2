import axios from 'axios';
import { TodoItem } from './todo/todoStore';
import { 
  notionMapper, 
  notionValidator, 
  notionSchemaManager,
  NotionPage
} from './notion';

export interface NotionTask {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: string;
  source: 'notion';
}

export interface NotionSyncResult {
  success: boolean;
  tasks?: NotionTask[];
  error?: string;
}

/**
 * Service for interacting with the Notion API through the MCP server
 */
export class NotionService {
  private baseUrl: string = 'http://localhost:8589';
  private isConnected: boolean = false;
  private databaseId: string | null = null;

  /**
   * Check if the Notion API is connected and configured
   */
  async checkConnection(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/status`);
      this.isConnected = response.data.success && response.data.status === 'connected';
      return this.isConnected;
    } catch (error) {
      this.isConnected = false;
      console.error('Failed to connect to Notion MCP:', error);
      return false;
    }
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  /**
   * Set the database ID for todo operations
   */
  setDatabaseId(databaseId: string): void {
    this.databaseId = databaseId;
  }

  /**
   * Get the database ID being used
   */
  getDatabaseId(): string | null {
    return this.databaseId;
  }

  /**
   * Get all tasks from Notion
   */
  async getTasks(): Promise<TodoItem[]> {
    if (!this.databaseId) {
      throw new Error('Database ID not set. Call setDatabaseId() first.');
    }

    try {
      const response = await axios.get(`${this.baseUrl}/api/database/${this.databaseId}/pages`);
      if (!response.data.success) {
        return [];
      }

      const notionPages = response.data.pages as NotionPage[];
      const todoItems: TodoItem[] = [];

      for (const page of notionPages) {
        const validationResult = notionValidator.validateNotionPage(page);
        if (validationResult.valid) {
          try {
            const todoItem = notionMapper.notionToTodo(page);
            todoItems.push(todoItem);
          } catch (error) {
            console.error('Error mapping Notion page to TodoItem:', error);
          }
        } else {
          console.warn('Invalid Notion page:', validationResult.errors);
        }
      }

      return todoItems;
    } catch (error) {
      console.error('Failed to fetch Notion tasks:', error);
      throw new Error('Failed to fetch tasks from Notion');
    }
  }

  /**
   * Create a todo item in Notion
   */
  async createTodo(todo: TodoItem): Promise<TodoItem | null> {
    if (!this.databaseId) {
      throw new Error('Database ID not set. Call setDatabaseId() first.');
    }

    // Validate the todo item
    const validationResult = notionValidator.validateTodoItem(todo);
    if (!validationResult.valid) {
      console.error('Invalid TodoItem:', validationResult.errors);
      throw new Error(`Invalid TodoItem: ${validationResult.errors.join(', ')}`);
    }

    try {
      // Convert TodoItem to Notion properties
      const properties = notionMapper.todoToNotionProperties(todo);
      
      // Create the page in Notion
      const response = await axios.post(`${this.baseUrl}/api/pages`, {
        parent: { database_id: this.databaseId },
        properties
      });

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to create page in Notion');
      }

      // Map the created page back to a TodoItem
      return notionMapper.notionToTodo(response.data.page);
    } catch (error) {
      console.error('Failed to create todo in Notion:', error);
      return null;
    }
  }

  /**
   * Update a todo item in Notion
   */
  async updateTodo(todo: TodoItem): Promise<TodoItem | null> {
    // Validate the todo item
    const validationResult = notionValidator.validateTodoItem(todo);
    if (!validationResult.valid) {
      console.error('Invalid TodoItem:', validationResult.errors);
      throw new Error(`Invalid TodoItem: ${validationResult.errors.join(', ')}`);
    }

    try {
      // Convert TodoItem to Notion properties
      const properties = notionMapper.todoToNotionProperties(todo);
      
      // Update the page in Notion
      const response = await axios.patch(`${this.baseUrl}/api/pages/${todo.id}`, {
        properties
      });

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to update page in Notion');
      }

      // Map the updated page back to a TodoItem
      return notionMapper.notionToTodo(response.data.page);
    } catch (error) {
      console.error('Failed to update todo in Notion:', error);
      return null;
    }
  }

  /**
   * Delete a todo item in Notion
   */
  async deleteTodo(id: string): Promise<boolean> {
    try {
      const response = await axios.delete(`${this.baseUrl}/api/pages/${id}`);
      return response.data.success;
    } catch (error) {
      console.error('Failed to delete todo in Notion:', error);
      return false;
    }
  }

  /**
   * Sync tasks with Notion
   * @param tasks - Tasks to sync with Notion
   */
  async syncTasks(tasks: TodoItem[]): Promise<{ success: boolean; tasks: TodoItem[]; errors: string[] }> {
    if (!this.databaseId) {
      throw new Error('Database ID not set. Call setDatabaseId() first.');
    }

    const errors: string[] = [];
    const updatedTasks: TodoItem[] = [];

    try {
      // Get existing tasks from Notion
      const existingTasks = await this.getTasks();
      const existingTaskMap = new Map(existingTasks.map(task => [task.id, task]));
      
      // Process each task
      for (const task of tasks) {
        try {
          const validationResult = notionValidator.validateTodoItem(task);
          if (!validationResult.valid) {
            errors.push(`Invalid task ${task.id}: ${validationResult.errors.join(', ')}`);
            continue;
          }

          let updatedTask: TodoItem | null;
          
          if (existingTaskMap.has(task.id)) {
            // Update existing task
            updatedTask = await this.updateTodo(task);
          } else {
            // Create new task
            updatedTask = await this.createTodo(task);
          }

          if (updatedTask) {
            updatedTasks.push(updatedTask);
          }
        } catch (error) {
          errors.push(`Error syncing task ${task.id}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }

      return {
        success: errors.length === 0,
        tasks: updatedTasks,
        errors
      };
    } catch (error) {
      console.error('Failed to sync tasks with Notion:', error);
      return {
        success: false,
        tasks: [],
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  /**
   * Search Notion for notes and pages
   * @param query - Search query
   * @param limit - Maximum number of results
   */
  async searchNotes(query: string, limit: number = 10): Promise<any[]> {
    try {
      const response = await axios.post(`${this.baseUrl}/api/search`, { query, limit });
      if (response.data.success) {
        return response.data.results;
      }
      return [];
    } catch (error) {
      console.error('Failed to search Notion:', error);
      throw new Error('Failed to search Notion');
    }
  }

  /**
   * Check if a database is compatible with TodoItems and update it if necessary
   */
  async setupDatabase(databaseId: string): Promise<boolean> {
    try {
      // Set schema manager base URL
      notionSchemaManager.setBaseUrl(this.baseUrl);
      
      // Check compatibility
      const compatibility = await notionSchemaManager.checkDatabaseCompatibility(databaseId);
      
      if (compatibility.compatible) {
        // Database is already compatible
        this.databaseId = databaseId;
        return true;
      }
      
      // Try to update the database schema
      const updated = await notionSchemaManager.updateDatabaseSchema(databaseId);
      
      if (updated) {
        this.databaseId = databaseId;
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to setup database:', error);
      return false;
    }
  }

  /**
   * Create a new database for TodoItems
   */
  async createTodoDatabase(parentPageId: string, title: string): Promise<string | null> {
    try {
      // Set schema manager base URL
      notionSchemaManager.setBaseUrl(this.baseUrl);
      
      // Create database
      const databaseId = await notionSchemaManager.createTodoDatabase(parentPageId, title);
      
      if (databaseId) {
        this.databaseId = databaseId;
      }
      
      return databaseId;
    } catch (error) {
      console.error('Failed to create todo database:', error);
      return null;
    }
  }
}

export default new NotionService(); 