import { TodoItem } from '../todo/todoStore';
import { NotionTask } from '../NotionService';

// Notion database schema types
export interface NotionDatabaseSchema {
  id: string;
  title: string;
  properties: Record<string, NotionPropertySchema>;
}

export interface NotionPropertySchema {
  id: string;
  name: string;
  type: NotionPropertyType;
  options?: Array<{ id: string; name: string; color: string }>;
}

export type NotionPropertyType = 
  | 'title' 
  | 'rich_text' 
  | 'number' 
  | 'select' 
  | 'multi_select' 
  | 'date' 
  | 'people' 
  | 'files' 
  | 'checkbox' 
  | 'url' 
  | 'email' 
  | 'phone_number' 
  | 'formula' 
  | 'relation' 
  | 'rollup'
  | 'created_time'
  | 'created_by'
  | 'last_edited_time'
  | 'last_edited_by';

// Notion API response types
export interface NotionPage {
  id: string;
  parent: {
    type: 'database_id';
    database_id: string;
  };
  properties: Record<string, NotionProperty>;
  url: string;
  created_time: string;
  last_edited_time: string;
}

export type NotionProperty = 
  | { type: 'title'; title: Array<{ text: { content: string } }> }
  | { type: 'rich_text'; rich_text: Array<{ text: { content: string } }> }
  | { type: 'checkbox'; checkbox: boolean }
  | { type: 'select'; select: { id: string; name: string; color: string } | null }
  | { type: 'multi_select'; multi_select: Array<{ id: string; name: string; color: string }> }
  | { type: 'date'; date: { start: string; end: string | null } | null };

/**
 * Maps between TodoItem and Notion formats
 */
export class NotionMapper {
  // Default property mappings
  private propertyMappings: Record<string, string> = {
    title: 'Title',
    status: 'Status',
    priority: 'Priority',
    category: 'Category',
    tags: 'Tags',
    description: 'Description',
    dateCreated: 'Created Date',
    dateUpdated: 'Last Updated'
  };

  /**
   * Set custom property mappings
   */
  setPropertyMappings(mappings: Record<string, string>): void {
    this.propertyMappings = { ...this.propertyMappings, ...mappings };
  }

  /**
   * Convert TodoItem to Notion page properties
   */
  todoToNotionProperties(todo: TodoItem): Record<string, any> {
    const properties: Record<string, any> = {
      [this.propertyMappings.title]: {
        title: [{ text: { content: todo.title } }]
      },
      [this.propertyMappings.status]: {
        select: { name: this.mapStatusToNotion(todo.status) }
      },
      [this.propertyMappings.priority]: {
        select: { name: this.mapPriorityToNotion(todo.priority) }
      },
      [this.propertyMappings.category]: {
        select: { name: todo.category }
      },
      [this.propertyMappings.tags]: {
        multi_select: todo.tags.map(tag => ({ name: tag }))
      }
    };

    // Add optional properties if they exist
    if (todo.description) {
      properties[this.propertyMappings.description] = {
        rich_text: [{ text: { content: todo.description } }]
      };
    }

    return properties;
  }

  /**
   * Convert Notion page to TodoItem
   */
  notionToTodo(page: NotionPage): TodoItem {
    // Extract basic properties
    const title = this.extractTitle(page.properties[this.propertyMappings.title]);
    const status = this.mapStatusFromNotion(this.extractSelect(page.properties[this.propertyMappings.status]));
    const priority = this.mapPriorityFromNotion(this.extractSelect(page.properties[this.propertyMappings.priority]));
    const category = this.extractSelect(page.properties[this.propertyMappings.category]) || 'Uncategorized';
    const tags = this.extractMultiSelect(page.properties[this.propertyMappings.tags]);
    const description = this.extractRichText(page.properties[this.propertyMappings.description]);

    // Create TodoItem
    return {
      id: page.id,
      title,
      status: status as TodoItem['status'],
      priority: priority as TodoItem['priority'],
      category,
      tags,
      dateCreated: new Date(page.created_time),
      dateUpdated: new Date(page.last_edited_time),
      description,
      subTasks: []
    };
  }

  /**
   * Convert NotionTask to TodoItem
   */
  notionTaskToTodo(task: NotionTask): TodoItem {
    return {
      id: task.id,
      title: task.title,
      status: task.completed ? 'completed' : 'not-started',
      priority: 3, // Default medium priority
      category: 'Notion',
      tags: ['notion'],
      dateCreated: new Date(),
      description: task.description,
      subTasks: []
    };
  }

  /**
   * Convert TodoItem to NotionTask
   */
  todoToNotionTask(todo: TodoItem): NotionTask {
    return {
      id: todo.id,
      title: todo.title,
      description: todo.description,
      completed: todo.status === 'completed',
      source: 'notion'
    };
  }

  // Helper methods for mapping status
  private mapStatusToNotion(status: TodoItem['status']): string {
    const statusMap: Record<TodoItem['status'], string> = {
      'not-started': 'Not Started',
      'in-progress': 'In Progress',
      'blocked': 'Blocked',
      'completed': 'Completed',
      'recurring': 'Recurring'
    };
    return statusMap[status];
  }

  private mapStatusFromNotion(status: string | null): TodoItem['status'] {
    if (!status) return 'not-started';
    
    const statusMap: Record<string, TodoItem['status']> = {
      'Not Started': 'not-started',
      'In Progress': 'in-progress',
      'Blocked': 'blocked',
      'Completed': 'completed',
      'Recurring': 'recurring'
    };
    
    return statusMap[status] || 'not-started';
  }

  // Helper methods for mapping priority
  private mapPriorityToNotion(priority: TodoItem['priority']): string {
    const priorityMap: Record<number, string> = {
      1: 'P1 - Critical',
      2: 'P2 - High',
      3: 'P3 - Medium',
      4: 'P4 - Low',
      5: 'P5 - Optional'
    };
    return priorityMap[priority];
  }

  private mapPriorityFromNotion(priority: string | null): TodoItem['priority'] {
    if (!priority) return 3; // Default to medium
    
    const priorityMap: Record<string, TodoItem['priority']> = {
      'P1 - Critical': 1,
      'P2 - High': 2,
      'P3 - Medium': 3,
      'P4 - Low': 4,
      'P5 - Optional': 5
    };
    
    return priorityMap[priority] || 3;
  }

  // Helper methods for extracting data from Notion properties
  private extractTitle(property: any): string {
    if (!property || property.type !== 'title' || !property.title.length) {
      return 'Untitled';
    }
    return property.title[0].text.content;
  }

  private extractRichText(property: any): string | undefined {
    if (!property || property.type !== 'rich_text' || !property.rich_text.length) {
      return undefined;
    }
    return property.rich_text.map((text: any) => text.text.content).join('');
  }

  private extractSelect(property: any): string | null {
    if (!property || property.type !== 'select' || !property.select) {
      return null;
    }
    return property.select.name;
  }

  private extractMultiSelect(property: any): string[] {
    if (!property || property.type !== 'multi_select') {
      return [];
    }
    return property.multi_select.map((select: any) => select.name);
  }

  private extractDate(property: any): Date | undefined {
    if (!property || property.type !== 'date' || !property.date || !property.date.start) {
      return undefined;
    }
    return new Date(property.date.start);
  }
} 