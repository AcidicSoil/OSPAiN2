import { NotionTask } from '../NotionService';
import { TodoItem } from '../todo/todoStore';
import { NotionPage, NotionProperty } from './NotionMapper';

/**
 * Validation results interface
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validates Notion data structures
 */
export class NotionValidator {
  /**
   * Validate a TodoItem before converting to Notion format
   */
  validateTodoItem(item: TodoItem): ValidationResult {
    const errors: string[] = [];

    if (!item.id) {
      errors.push('Todo item is missing ID');
    }

    if (!item.title) {
      errors.push('Todo item is missing title');
    }

    if (!['not-started', 'in-progress', 'blocked', 'completed', 'recurring'].includes(item.status)) {
      errors.push(`Invalid status: ${item.status}`);
    }

    if (![1, 2, 3, 4, 5].includes(item.priority)) {
      errors.push(`Invalid priority: ${item.priority}`);
    }

    if (!item.dateCreated) {
      errors.push('Todo item is missing creation date');
    }

    if (!Array.isArray(item.tags)) {
      errors.push('Tags must be an array');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate a Notion page before converting to TodoItem
   */
  validateNotionPage(page: NotionPage): ValidationResult {
    const errors: string[] = [];

    if (!page.id) {
      errors.push('Notion page is missing ID');
    }

    if (!page.properties) {
      errors.push('Notion page is missing properties');
    } else {
      // Check for required properties
      const requiredProps = ['Title'];
      for (const prop of requiredProps) {
        if (!page.properties[prop]) {
          errors.push(`Missing required property: ${prop}`);
        }
      }

      // Validate title property type
      const titleProp = page.properties['Title'];
      if (titleProp && titleProp.type !== 'title') {
        errors.push('Title property is not of type "title"');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate a Notion property value
   */
  validatePropertyValue(property: NotionProperty | undefined, expectedType: string): ValidationResult {
    const errors: string[] = [];
    
    if (!property) {
      errors.push('Property is undefined');
      return { valid: false, errors };
    }
    
    if (property.type !== expectedType) {
      errors.push(`Expected property type "${expectedType}", got "${property.type}"`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate a NotionTask
   */
  validateNotionTask(task: NotionTask): ValidationResult {
    const errors: string[] = [];

    if (!task.id) {
      errors.push('Task is missing ID');
    }

    if (!task.title) {
      errors.push('Task is missing title');
    }

    if (typeof task.completed !== 'boolean') {
      errors.push('Task completion status must be a boolean');
    }

    if (task.source !== 'notion') {
      errors.push('Task source must be "notion"');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate database schema for compatibility with TodoItem structure
   */
  validateDatabaseSchema(properties: Record<string, any>): ValidationResult {
    const errors: string[] = [];
    const requiredProperties = [
      { name: 'Title', type: 'title' },
      { name: 'Status', type: 'select' },
      { name: 'Priority', type: 'select' }
    ];

    for (const reqProp of requiredProperties) {
      const prop = Object.entries(properties).find(([_, p]) => p.name === reqProp.name);
      
      if (!prop) {
        errors.push(`Missing required property: ${reqProp.name}`);
      } else if (prop[1].type !== reqProp.type) {
        errors.push(`Property ${reqProp.name} should be type "${reqProp.type}", got "${prop[1].type}"`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
} 