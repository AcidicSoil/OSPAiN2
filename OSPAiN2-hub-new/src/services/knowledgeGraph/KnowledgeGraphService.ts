/**
 * KnowledgeGraphService.ts
 * Service layer for knowledge graph operations with domain-specific logic
 */

import FalkorClient, { FalkorDBConfig } from './FalkorClient';
import EmbeddingsService, { EmbeddingsConfig } from './EmbeddingsService';

// Entity types
export interface Entity {
  id: string;
  type: string;
  properties: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface Document extends Entity {
  type: 'document';
  content: string;
  source: string;
  embedding?: number[];
}

export interface Concept extends Entity {
  type: 'concept';
  name: string;
  description: string;
}

// Relationship types
export interface Relationship {
  id: string;
  type: string;
  properties: Record<string, any>;
  source: string;
  target: string;
  createdAt: string;
}

// Graph traversal options
export interface TraversalOptions {
  maxDepth?: number;
  relationshipTypes?: string[];
  direction?: 'OUTGOING' | 'INCOMING' | 'BOTH';
  limit?: number;
}

// Search options
export interface SearchOptions {
  limit?: number;
  offset?: number;
  minSimilarity?: number;
  useEmbeddings?: boolean;
}

// Connection pool management
class ConnectionPool {
  private static instance: ConnectionPool;
  private clients: Map<string, FalkorClient> = new Map();
  private config: FalkorDBConfig;

  private constructor(config: FalkorDBConfig) {
    this.config = config;
  }

  public static getInstance(config: FalkorDBConfig): ConnectionPool {
    if (!ConnectionPool.instance) {
      ConnectionPool.instance = new ConnectionPool(config);
    }
    return ConnectionPool.instance;
  }

  public async getClient(graphName: string = 'knowledge'): Promise<FalkorClient> {
    const key = `${this.config.host}:${this.config.port}/${graphName}`;
    
    if (!this.clients.has(key)) {
      const client = new FalkorClient(this.config, graphName);
      await client.connect();
      this.clients.set(key, client);
    }
    
    return this.clients.get(key)!;
  }

  public async disconnect(): Promise<void> {
    const disconnectPromises = Array.from(this.clients.values()).map(client => client.disconnect());
    await Promise.all(disconnectPromises);
    this.clients.clear();
  }
}

/**
 * KnowledgeGraphService - Service for interacting with knowledge graph
 */
export class KnowledgeGraphService {
  private connectionPool: ConnectionPool;
  private graphName: string;
  private embeddingsService?: EmbeddingsService;
  
  constructor(
    config: FalkorDBConfig, 
    graphName: string = 'knowledge',
    embeddingsConfig?: EmbeddingsConfig
  ) {
    this.connectionPool = ConnectionPool.getInstance(config);
    this.graphName = graphName;
    
    // Initialize embeddings service if config is provided
    if (embeddingsConfig) {
      this.embeddingsService = new EmbeddingsService(embeddingsConfig);
    }
  }
  
  /**
   * Set embeddings service configuration
   */
  setEmbeddingsConfig(config: EmbeddingsConfig): void {
    this.embeddingsService = new EmbeddingsService(config);
  }
  
  /**
   * Get the FalkorDB client from connection pool
   */
  private async getClient(): Promise<FalkorClient> {
    return this.connectionPool.getClient(this.graphName);
  }
  
  /**
   * Initialize the knowledge graph schema
   */
  async initializeSchema(): Promise<void> {
    const client = await this.getClient();
    await client.initializeSchema();
  }
  
  /**
   * Create an entity in the knowledge graph
   */
  async createEntity<T extends Entity>(entity: Omit<T, 'createdAt' | 'updatedAt'>): Promise<T> {
    const client = await this.getClient();
    
    const now = new Date().toISOString();
    const entityWithDates = {
      ...entity,
      createdAt: now,
      updatedAt: now
    };
    
    const labels = ['Entity', entityWithDates.type.charAt(0).toUpperCase() + entityWithDates.type.slice(1)];
    const labelString = labels.map(l => `:${l}`).join('');
    
    const query = `
      CREATE (e${labelString} $entity)
      RETURN e
    `;
    
    const result = await client.query<T>(query, { entity: entityWithDates });
    return result.results[0];
  }
  
  /**
   * Get an entity by ID
   */
  async getEntity<T extends Entity>(id: string): Promise<T | null> {
    const client = await this.getClient();
    
    const query = `
      MATCH (e:Entity {id: $id})
      RETURN e
    `;
    
    const result = await client.query<T>(query, { id });
    return result.results.length > 0 ? result.results[0] : null;
  }
  
  /**
   * Update an entity
   */
  async updateEntity<T extends Entity>(id: string, properties: Partial<T>): Promise<T> {
    const client = await this.getClient();
    
    const updateProperties = {
      ...properties,
      updatedAt: new Date().toISOString()
    };
    
    const query = `
      MATCH (e:Entity {id: $id})
      SET e += $properties
      RETURN e
    `;
    
    const result = await client.query<T>(query, { 
      id, 
      properties: updateProperties 
    });
    
    return result.results[0];
  }
  
  /**
   * Delete an entity
   */
  async deleteEntity(id: string): Promise<boolean> {
    const client = await this.getClient();
    
    const query = `
      MATCH (e:Entity {id: $id})
      DETACH DELETE e
      RETURN count(e) as deleted
    `;
    
    const result = await client.query<{ deleted: number }>(query, { id });
    return result.results[0]?.deleted > 0;
  }
  
  /**
   * Create a relationship between entities
   */
  async createRelationship(
    sourceId: string,
    targetId: string,
    type: string,
    properties: Record<string, any> = {}
  ): Promise<Relationship> {
    const client = await this.getClient();
    
    const relationshipId = `${sourceId}_${type}_${targetId}`;
    const now = new Date().toISOString();
    
    const relationshipProperties = {
      id: relationshipId,
      type,
      ...properties,
      createdAt: now
    };
    
    const query = `
      MATCH (source:Entity {id: $sourceId})
      MATCH (target:Entity {id: $targetId})
      CREATE (source)-[r:${type} $properties]->(target)
      RETURN source, r, target
    `;
    
    const result = await client.query(query, { 
      sourceId, 
      targetId, 
      properties: relationshipProperties 
    });
    
    // Construct relationship from results
    return {
      id: relationshipId,
      type,
      properties: relationshipProperties,
      source: sourceId,
      target: targetId,
      createdAt: now
    };
  }
  
  /**
   * Find entities by type and properties
   */
  async findEntities<T extends Entity>(
    type: string, 
    properties: Record<string, any> = {},
    limit: number = 100
  ): Promise<T[]> {
    const client = await this.getClient();
    
    // Build property conditions
    const conditions = Object.entries(properties)
      .map(([key, value]) => `e.${key} = $properties.${key}`)
      .join(' AND ');
    
    const whereClause = conditions ? `WHERE ${conditions}` : '';
    
    const query = `
      MATCH (e:Entity:${type.charAt(0).toUpperCase() + type.slice(1)})
      ${whereClause}
      RETURN e
      LIMIT ${limit}
    `;
    
    const result = await client.query<T>(query, { properties });
    return result.results;
  }
  
  /**
   * Get neighbors of an entity
   */
  async getNeighbors(
    entityId: string,
    options: TraversalOptions = {}
  ): Promise<{
    entities: Entity[];
    relationships: Relationship[];
  }> {
    const client = await this.getClient();
    
    const {
      maxDepth = 1,
      relationshipTypes = [],
      direction = 'BOTH',
      limit = 100
    } = options;
    
    // Build relationship type filter
    const relTypeFilter = relationshipTypes.length > 0
      ? `:${relationshipTypes.join('|')}`
      : '';
    
    // Build direction pattern
    let directionPattern;
    switch (direction) {
      case 'OUTGOING':
        directionPattern = `-[r${relTypeFilter}]->`;
        break;
      case 'INCOMING':
        directionPattern = `<-[r${relTypeFilter}]-`;
        break;
      case 'BOTH':
      default:
        directionPattern = `-[r${relTypeFilter}]-`;
        break;
    }
    
    // For depth > 1, use variable length path
    const pathPattern = maxDepth > 1
      ? `${directionPattern.slice(0, -1)}*1..${maxDepth}${directionPattern.slice(-1)}`
      : directionPattern;
    
    const query = `
      MATCH (source:Entity {id: $entityId})
      MATCH (source)${pathPattern}(target:Entity)
      WHERE source <> target
      RETURN DISTINCT source, r, target
      LIMIT ${limit}
    `;
    
    const result = await client.query(query, { entityId });
    
    // Process results
    const entities: Entity[] = [];
    const relationships: Relationship[] = [];
    const processedEntityIds = new Set<string>();
    const processedRelationshipIds = new Set<string>();
    
    // Process each result row
    for (const row of result.results) {
      // Add target entity if not already processed
      if (row.target && row.target.id && !processedEntityIds.has(row.target.id)) {
        entities.push(row.target);
        processedEntityIds.add(row.target.id);
      }
      
      // Add relationship if present and not already processed
      if (row.r && row.r.id && !processedRelationshipIds.has(row.r.id)) {
        relationships.push({
          id: row.r.id,
          type: row.r.type,
          properties: row.r.properties || {},
          source: row.source.id,
          target: row.target.id,
          createdAt: row.r.createdAt || new Date().toISOString()
        });
        processedRelationshipIds.add(row.r.id);
      }
    }
    
    return { entities, relationships };
  }
  
  /**
   * Add a document to the knowledge graph
   */
  async addDocument(document: Omit<Document, 'createdAt' | 'updatedAt'>): Promise<Document> {
    // Generate embeddings if embeddings service is available
    if (this.embeddingsService && !document.embedding) {
      try {
        document.embedding = await this.embeddingsService.generateEmbeddings(document.content) as number[];
      } catch (error) {
        console.error('Error generating embeddings:', error);
        // Continue without embeddings if there's an error
      }
    }
    
    return this.createEntity<Document>(document);
  }
  
  /**
   * Add a concept to the knowledge graph
   */
  async addConcept(concept: Omit<Concept, 'createdAt' | 'updatedAt'>): Promise<Concept> {
    return this.createEntity<Concept>(concept);
  }
  
  /**
   * Search for documents by text content
   * Uses embeddings for semantic search if available
   */
  async searchDocuments(
    searchTerm: string, 
    options: SearchOptions = {}
  ): Promise<Document[]> {
    const { 
      limit = 10, 
      minSimilarity = 0.7,
      useEmbeddings = true
    } = options;
    
    // Use semantic search if embeddings service is available and enabled
    if (this.embeddingsService && useEmbeddings) {
      return this.semanticSearchDocuments(searchTerm, { 
        limit, 
        minSimilarity 
      });
    }
    
    // Fall back to text-based search
    const client = await this.getClient();
    
    // Simple text-based search using contains
    const query = `
      MATCH (d:Entity:Document)
      WHERE d.content CONTAINS $searchTerm
      RETURN d
      LIMIT ${limit}
    `;
    
    const result = await client.query<Document>(query, { searchTerm });
    return result.results;
  }
  
  /**
   * Semantic search for documents using embeddings
   */
  private async semanticSearchDocuments(
    searchTerm: string,
    options: { limit: number; minSimilarity: number; }
  ): Promise<Document[]> {
    if (!this.embeddingsService) {
      throw new Error('Embeddings service not configured');
    }
    
    const { limit, minSimilarity } = options;
    
    // 1. Get all documents from the knowledge graph
    const allDocuments = await this.findEntities<Document>('document', {}, 1000);
    
    // 2. Extract document content
    const documentContents = allDocuments.map(doc => doc.content);
    
    // 3. Perform semantic search
    const searchResults = await this.embeddingsService.searchSimilar(
      searchTerm,
      documentContents,
      { limit, minSimilarity }
    );
    
    // 4. Map results back to documents
    return searchResults.map(result => allDocuments[result.index]);
  }
  
  /**
   * Create a document with extracted entities for GraphRAG
   */
  async createGraphRAGDocument(
    document: Omit<Document, 'createdAt' | 'updatedAt'>,
    entities: Array<{ name: string; type: string; description?: string; }>
  ): Promise<{ document: Document; extractedEntities: Concept[] }> {
    // 1. Add document to knowledge graph
    const createdDocument = await this.addDocument(document);
    
    // 2. Create or get concepts for each entity
    const extractedEntities: Concept[] = [];
    
    for (const entity of entities) {
      // Check if concept already exists
      const existingConcepts = await this.findEntities<Concept>(
        'concept',
        { name: entity.name }
      );
      
      let concept: Concept;
      
      if (existingConcepts.length > 0) {
        // Use existing concept
        concept = existingConcepts[0];
      } else {
        // Create new concept
        concept = await this.addConcept({
          id: `concept_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          type: 'concept',
          name: entity.name,
          description: entity.description || entity.name,
          properties: {
            entityType: entity.type
          }
        });
      }
      
      // 3. Create relationship between document and concept
      await this.createRelationship(
        createdDocument.id,
        concept.id,
        'MENTIONS',
        { confidence: 1.0 }
      );
      
      extractedEntities.push(concept);
    }
    
    return { document: createdDocument, extractedEntities };
  }
  
  /**
   * Extract documents that contain similar embeddings
   */
  async findSimilarDocuments(
    contentOrEmbedding: string | number[],
    options: SearchOptions = {}
  ): Promise<Document[]> {
    if (!this.embeddingsService) {
      throw new Error('Embeddings service not configured');
    }
    
    const { 
      limit = 10, 
      minSimilarity = 0.7 
    } = options;
    
    // Get embedding for the content if string is provided
    const embedding = typeof contentOrEmbedding === 'string'
      ? await this.embeddingsService.generateEmbeddings(contentOrEmbedding) as number[]
      : contentOrEmbedding;
    
    // Get all documents
    const allDocuments = await this.findEntities<Document>('document', {}, 1000);
    
    // Filter documents that have embeddings
    const documentsWithEmbeddings = allDocuments.filter(doc => doc.embedding && doc.embedding.length > 0);
    
    if (documentsWithEmbeddings.length === 0) {
      return [];
    }
    
    // Calculate similarity for each document
    const similarities = documentsWithEmbeddings.map(doc => ({
      document: doc,
      similarity: this.embeddingsService!.calculateSimilarity(embedding, doc.embedding!)
    }));
    
    // Sort by similarity and filter by threshold
    return similarities
      .filter(item => item.similarity >= minSimilarity)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
      .map(item => item.document);
  }
  
  /**
   * Batch process documents to add embeddings
   */
  async batchAddEmbeddings(documentIds: string[] = []): Promise<number> {
    if (!this.embeddingsService) {
      throw new Error('Embeddings service not configured');
    }
    
    // If no document IDs provided, get all documents without embeddings
    let documents: Document[];
    
    if (documentIds.length > 0) {
      // Get specified documents
      documents = await Promise.all(
        documentIds.map(id => this.getEntity<Document>(id))
      ).then(results => results.filter(Boolean) as Document[]);
    } else {
      // Get all documents without embeddings
      const allDocuments = await this.findEntities<Document>('document', {}, 1000);
      documents = allDocuments.filter(doc => !doc.embedding);
    }
    
    if (documents.length === 0) {
      return 0;
    }
    
    // Extract content
    const contents = documents.map(doc => doc.content);
    
    // Generate embeddings in batch
    const embeddings = await this.embeddingsService.generateEmbeddings(contents) as number[][];
    
    // Update documents with embeddings
    const updatePromises = documents.map((doc, index) => 
      this.updateEntity(doc.id, { embedding: embeddings[index] })
    );
    
    await Promise.all(updatePromises);
    
    return documents.length;
  }
}

// Factory method for easy service instantiation
export const createKnowledgeGraphService = (
  config: FalkorDBConfig, 
  graphName: string = 'knowledge',
  embeddingsConfig?: EmbeddingsConfig
): KnowledgeGraphService => {
  return new KnowledgeGraphService(config, graphName, embeddingsConfig);
};

// Default export
export default KnowledgeGraphService; 