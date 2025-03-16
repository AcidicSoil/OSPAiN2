import axios from 'axios';

// Define the entity types
export interface Entity {
  id: string;
  type: string;
  name: string;
  description?: string;
  properties?: Record<string, any>;
  created?: string;
  updated?: string;
}

export interface Document extends Entity {
  type: 'document';
  content?: string;
  url?: string;
  tags?: string[];
  source?: string;
}

export interface Concept extends Entity {
  type: 'concept';
  related?: string[];
  importance?: number;
}

export interface Relationship {
  id: string;
  source: string;
  target: string;
  type: string;
  properties?: Record<string, any>;
}

export interface NeighborsResult {
  entities: Entity[];
  relationships: Relationship[];
}

export interface SearchOptions {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface GraphOptions {
  maxDepth?: number;
  limit?: number;
  relationshipTypes?: string[];
  entityTypes?: string[];
}

/**
 * Service for interacting with the Knowledge Graph
 */
class KnowledgeGraphService {
  private baseUrl: string;
  
  constructor(baseUrl = '/api/knowledge-graph') {
    this.baseUrl = baseUrl;
  }
  
  /**
   * Get an entity by ID
   */
  async getEntity<T extends Entity = Entity>(id: string): Promise<T | null> {
    try {
      const response = await axios.get<T>(`${this.baseUrl}/entities/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching entity:', error);
      return null;
    }
  }
  
  /**
   * Find entities by type and query
   */
  async findEntities<T extends Entity = Entity>(
    type?: string,
    query: Record<string, any> = {},
    limit = 20
  ): Promise<T[]> {
    try {
      const params = { type, ...query, limit };
      const response = await axios.get<T[]>(`${this.baseUrl}/entities`, { params });
      return response.data;
    } catch (error) {
      console.error('Error finding entities:', error);
      return [];
    }
  }
  
  /**
   * Search for documents by text content
   */
  async searchDocuments(query: string, options: SearchOptions = {}): Promise<Document[]> {
    try {
      const params = { query, ...options };
      const response = await axios.get<Document[]>(`${this.baseUrl}/search/documents`, { params });
      return response.data;
    } catch (error) {
      console.error('Error searching documents:', error);
      return [];
    }
  }
  
  /**
   * Get neighbors of an entity
   */
  async getNeighbors(
    entityId: string,
    options: GraphOptions = {}
  ): Promise<NeighborsResult> {
    try {
      const params = { ...options };
      const response = await axios.get<NeighborsResult>(
        `${this.baseUrl}/entities/${entityId}/neighbors`,
        { params }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching neighbors:', error);
      return { entities: [], relationships: [] };
    }
  }
  
  /**
   * Create a new entity
   */
  async createEntity<T extends Entity>(entity: Omit<T, 'id'>): Promise<T | null> {
    try {
      const response = await axios.post<T>(`${this.baseUrl}/entities`, entity);
      return response.data;
    } catch (error) {
      console.error('Error creating entity:', error);
      return null;
    }
  }
  
  /**
   * Create a new relationship
   */
  async createRelationship(relationship: Omit<Relationship, 'id'>): Promise<Relationship | null> {
    try {
      const response = await axios.post<Relationship>(`${this.baseUrl}/relationships`, relationship);
      return response.data;
    } catch (error) {
      console.error('Error creating relationship:', error);
      return null;
    }
  }
  
  /**
   * Delete an entity
   */
  async deleteEntity(id: string): Promise<boolean> {
    try {
      await axios.delete(`${this.baseUrl}/entities/${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting entity:', error);
      return false;
    }
  }
  
  /**
   * Delete a relationship
   */
  async deleteRelationship(id: string): Promise<boolean> {
    try {
      await axios.delete(`${this.baseUrl}/relationships/${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting relationship:', error);
      return false;
    }
  }
}

// Singleton instance
let service: KnowledgeGraphService | null = null;

/**
 * Get the knowledge graph service instance
 */
export function getKnowledgeGraphService(): KnowledgeGraphService {
  if (!service) {
    service = new KnowledgeGraphService();
  }
  return service;
}

export default KnowledgeGraphService; 