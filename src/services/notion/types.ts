import { TodoItem } from '../todo/todoStore';

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
 * Validation results interface
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}
