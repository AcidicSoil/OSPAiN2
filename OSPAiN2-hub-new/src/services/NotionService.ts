import axios from "axios";

// Define interfaces for Notion API
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

export interface NotionDatabase {
  id: string;
  title: string;
  description?: string;
}

export interface NotionPage {
  id: string;
  title: string;
  url: string;
  lastEdited: string;
  content?: string;
  properties?: Record<string, any>;
}

/**
 * Service for interacting with the Notion API
 */
export class NotionService {
  private static instance: NotionService;
  private baseUrl: string;
  private token: string | null = null;
  private databaseId: string | null = null;

  private constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  }

  public static getInstance(): NotionService {
    if (!NotionService.instance) {
      NotionService.instance = new NotionService();
    }
    return NotionService.instance;
  }

  public setToken(token: string): void {
    this.token = token;
    localStorage.setItem('notion_token', token);
  }

  public getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('notion_token');
    }
    return this.token;
  }

  public setDatabaseId(id: string): void {
    this.databaseId = id;
    localStorage.setItem('notion_database_id', id);
  }

  public getDatabaseId(): string | null {
    if (!this.databaseId) {
      this.databaseId = localStorage.getItem('notion_database_id');
    }
    return this.databaseId;
  }

  /**
   * Check if the Notion API is connected and configured
   */
  async checkConnection(): Promise<boolean> {
    const token = this.getToken();
    if (!token) return false;

    try {
      const response = await axios.get(`${this.baseUrl}/api/notion/user`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.status === 200;
    } catch (error) {
      console.error('Failed to check Notion connection:', error);
      return false;
    }
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): boolean {
    return this.checkConnection();
  }

  /**
   * Get available databases
   */
  async getDatabases(): Promise<NotionDatabase[]> {
    const token = this.getToken();
    if (!token) return [];

    try {
      const response = await axios.get(`${this.baseUrl}/api/notion/databases`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data.results.map((db: any) => ({
        id: db.id,
        title: db.title[0]?.plain_text || 'Untitled',
        description: db.description?.[0]?.plain_text
      }));
    } catch (error) {
      console.error('Failed to fetch Notion databases:', error);
      return [];
    }
  }

  /**
   * Search Notion for notes and pages
   */
  async searchNotes(query: string): Promise<any[]> {
    const token = this.getToken();
    if (!token) return [];

    try {
      const response = await axios.post(
        `${this.baseUrl}/api/notion/search`,
        { query },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data.results.map((page: any) => ({
        id: page.id,
        title: this.extractTitle(page),
        url: page.url,
        lastEdited: page.last_edited_time
      }));
    } catch (error) {
      console.error('Failed to search Notion:', error);
      return [];
    }
  }

  public async getPages(databaseId?: string): Promise<NotionPage[]> {
    const token = this.getToken();
    const dbId = databaseId || this.getDatabaseId();
    
    if (!token || !dbId) return [];

    try {
      const response = await axios.get(`${this.baseUrl}/api/notion/database/${dbId}/query`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.data.results.map((page: any) => ({
        id: page.id,
        title: this.extractTitle(page),
        url: page.url,
        lastEdited: page.last_edited_time,
        properties: page.properties
      }));
    } catch (error) {
      console.error('Failed to fetch Notion pages:', error);
      return [];
    }
  }

  public async getPage(pageId: string): Promise<NotionPage | null> {
    const token = this.getToken();
    if (!token) return null;

    try {
      const response = await axios.get(`${this.baseUrl}/api/notion/page/${pageId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const page = response.data;
      const blocks = await this.getPageBlocks(pageId);
      
      return {
        id: page.id,
        title: this.extractTitle(page),
        url: page.url,
        lastEdited: page.last_edited_time,
        content: this.formatBlocks(blocks),
        properties: page.properties
      };
    } catch (error) {
      console.error('Failed to fetch Notion page:', error);
      return null;
    }
  }

  public async getPageBlocks(pageId: string): Promise<any[]> {
    const token = this.getToken();
    if (!token) return [];

    try {
      const response = await axios.get(`${this.baseUrl}/api/notion/blocks/${pageId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.data.results;
    } catch (error) {
      console.error('Failed to fetch Notion page blocks:', error);
      return [];
    }
  }

  private extractTitle(page: any): string {
    // For pages from databases
    if (page.properties) {
      // Try to find title property
      const titleProp = Object.values(page.properties).find(
        (prop: any) => prop.type === 'title'
      ) as any;
      
      if (titleProp?.title?.[0]?.plain_text) {
        return titleProp.title[0].plain_text;
      }
    }
    
    // For pages with direct title
    if (page.title) {
      if (Array.isArray(page.title)) {
        return page.title[0]?.plain_text || 'Untitled';
      }
      return page.title;
    }
    
    return 'Untitled';
  }

  private formatBlocks(blocks: any[]): string {
    let content = '';
    
    for (const block of blocks) {
      if (block.type === 'paragraph') {
        const text = block.paragraph.rich_text.map((t: any) => t.plain_text).join('');
        content += text + '\n\n';
      } else if (block.type === 'heading_1') {
        const text = block.heading_1.rich_text.map((t: any) => t.plain_text).join('');
        content += '# ' + text + '\n\n';
      } else if (block.type === 'heading_2') {
        const text = block.heading_2.rich_text.map((t: any) => t.plain_text).join('');
        content += '## ' + text + '\n\n';
      } else if (block.type === 'heading_3') {
        const text = block.heading_3.rich_text.map((t: any) => t.plain_text).join('');
        content += '### ' + text + '\n\n';
      } else if (block.type === 'bulleted_list_item') {
        const text = block.bulleted_list_item.rich_text.map((t: any) => t.plain_text).join('');
        content += '• ' + text + '\n';
      } else if (block.type === 'numbered_list_item') {
        const text = block.numbered_list_item.rich_text.map((t: any) => t.plain_text).join('');
        content += '1. ' + text + '\n';
      } else if (block.type === 'code') {
        const text = block.code.rich_text.map((t: any) => t.plain_text).join('');
        content += '```' + block.code.language + '\n' + text + '\n```\n\n';
      } else if (block.type === 'quote') {
        const text = block.quote.rich_text.map((t: any) => t.plain_text).join('');
        content += '> ' + text + '\n\n';
      } else if (block.type === 'divider') {
        content += '---\n\n';
      }
    }
    
    return content;
  }
}

export const getNotionService = (): NotionService => {
  return NotionService.getInstance();
}; 