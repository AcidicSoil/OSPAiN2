/**
 * GraphRAGService.ts
 * Service for GraphRAG (Graph Retrieval Augmented Generation) capabilities
 */

import KnowledgeGraphService, { Document, Entity, Concept } from './KnowledgeGraphService';
import { FalkorDBConfig } from './FalkorClient';
import LLMService, { LLMConfig, EntityExtractionResult } from './LLMService';

// Question answering types
export interface RAGResult {
  answer: string;
  context: string[];
  sources: Document[];
  entities: Concept[];
  confidence: number;
}

export interface RAGOptions {
  maxDocuments?: number;
  maxEntities?: number;
  includeSourceText?: boolean;
  similarityThreshold?: number;
  maxHops?: number;
}

/**
 * GraphRAGService - Service for LLM integration with knowledge graph
 */
export class GraphRAGService {
  private knowledgeGraphService: KnowledgeGraphService;
  private llmService: LLMService;
  
  constructor(
    config: FalkorDBConfig, 
    graphName: string = 'knowledge',
    llmConfig?: LLMConfig
  ) {
    this.knowledgeGraphService = new KnowledgeGraphService(config, graphName);
    
    // Use provided LLM config or default to Ollama
    this.llmService = new LLMService(llmConfig || {
      provider: 'ollama',
      model: 'llama3',
      apiEndpoint: 'http://localhost:11434/api/generate'
    });
  }
  
  /**
   * Process text to extract entities and relationships
   * This calls an LLM to extract entities
   */
  async processText(
    text: string, 
    source: string,
    documentId?: string
  ): Promise<{ document: Document, extractedEntities: Concept[] }> {
    // Create unique document ID if not provided
    const id = documentId || `doc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Use LLM to extract entities
    const extractionResult = await this.llmService.extractEntities(text);
    
    // Convert extracted entities to the format expected by createGraphRAGDocument
    const extractedEntities = extractionResult.entities.map(entity => ({
      name: entity.name,
      type: entity.type,
      description: entity.description || ''
    }));
    
    // Create document with extracted entities
    return this.knowledgeGraphService.createGraphRAGDocument(
      {
        id,
        type: 'document',
        content: text,
        source,
        properties: {
          contentLength: text.length,
          language: 'en',
          processingMethod: 'llm'
        }
      },
      extractedEntities
    );
  }
  
  /**
   * Answer a question using GraphRAG
   */
  async answerQuestion(
    question: string, 
    options: RAGOptions = {}
  ): Promise<RAGResult> {
    const {
      maxDocuments = 5,
      maxEntities = 10,
      includeSourceText = true,
      similarityThreshold = 0.7,
      maxHops = 2
    } = options;
    
    // 1. Search for relevant documents using text search
    const relevantDocuments = await this.knowledgeGraphService.searchDocuments(question, maxDocuments);
    
    // 2. Extract entities from the question using LLM
    const extractionResult = await this.llmService.extractEntities(question);
    const questionEntities = extractionResult.entities.map(entity => ({
      name: entity.name,
      type: entity.type
    }));
    
    // 3. Find related concepts in the knowledge graph
    const relatedEntities: Concept[] = [];
    
    for (const entity of questionEntities) {
      const concepts = await this.knowledgeGraphService.findEntities<Concept>(
        'concept',
        { name: entity.name }
      );
      
      if (concepts.length > 0) {
        relatedEntities.push(...concepts);
        
        // 4. Get connected entities within maxHops
        const { entities } = await this.knowledgeGraphService.getNeighbors(
          concepts[0].id,
          {
            maxDepth: maxHops,
            limit: maxEntities
          }
        );
        
        // Filter to only get concepts
        const connectedConcepts = entities.filter(e => e.type === 'concept') as Concept[];
        relatedEntities.push(...connectedConcepts);
      }
    }
    
    // 5. Get documents related to the found entities
    const entityRelatedDocs: Document[] = [];
    
    for (const entity of relatedEntities.slice(0, maxEntities)) {
      const { entities } = await this.knowledgeGraphService.getNeighbors(
        entity.id,
        {
          relationshipTypes: ['MENTIONS'],
          direction: 'INCOMING',
          limit: 5
        }
      );
      
      // Filter to only get documents
      const connectedDocs = entities.filter(e => e.type === 'document') as Document[];
      entityRelatedDocs.push(...connectedDocs);
    }
    
    // 6. Combine and deduplicate all relevant documents
    const allDocuments = [...relevantDocuments, ...entityRelatedDocs];
    const uniqueDocIds = new Set<string>();
    const uniqueDocs: Document[] = [];
    
    for (const doc of allDocuments) {
      if (!uniqueDocIds.has(doc.id)) {
        uniqueDocIds.add(doc.id);
        uniqueDocs.push(doc);
      }
    }
    
    // Sort documents by relevance (in a real implementation, use embeddings similarity)
    const sortedDocs = uniqueDocs.slice(0, maxDocuments);
    
    // 7. Extract context from documents
    const context = sortedDocs.map(doc => doc.content);
    
    // 8. Generate an answer using the LLM with context
    const answerResult = await this.llmService.generateAnswer(
      question, 
      context, 
      relatedEntities.slice(0, maxEntities)
    );
    
    return {
      answer: answerResult.answer,
      context: includeSourceText ? context : [],
      sources: sortedDocs,
      entities: relatedEntities.slice(0, maxEntities),
      confidence: answerResult.confidence
    };
  }
  
  /**
   * Add a document to the knowledge graph with GraphRAG processing
   */
  async addDocumentWithRAG(text: string, source: string, documentId?: string): Promise<Document> {
    const { document } = await this.processText(text, source, documentId);
    return document;
  }
  
  /**
   * Find related documents for a given document
   */
  async findRelatedDocuments(documentId: string, limit: number = 10): Promise<Document[]> {
    const document = await this.knowledgeGraphService.getEntity<Document>(documentId);
    
    if (!document) {
      throw new Error(`Document with ID ${documentId} not found`);
    }
    
    // 1. Get concepts mentioned in the document
    const { entities } = await this.knowledgeGraphService.getNeighbors(
      documentId,
      {
        relationshipTypes: ['MENTIONS'],
        direction: 'OUTGOING',
        limit: 100
      }
    );
    
    // Filter to only get concepts
    const mentionedConcepts = entities.filter(e => e.type === 'concept');
    
    // 2. For each concept, find other documents that mention it
    const relatedDocIds = new Set<string>();
    const relatedDocs: Document[] = [];
    
    for (const concept of mentionedConcepts) {
      const { entities } = await this.knowledgeGraphService.getNeighbors(
        concept.id,
        {
          relationshipTypes: ['MENTIONS'],
          direction: 'INCOMING',
          limit: 5
        }
      );
      
      // Filter to only get documents
      const connectedDocs = entities.filter(e => e.type === 'document') as Document[];
      
      for (const doc of connectedDocs) {
        if (doc.id !== documentId && !relatedDocIds.has(doc.id)) {
          relatedDocIds.add(doc.id);
          relatedDocs.push(doc);
          
          if (relatedDocs.length >= limit) {
            return relatedDocs;
          }
        }
      }
    }
    
    return relatedDocs;
  }
  
  /**
   * Build a knowledge graph from multiple documents
   */
  async buildKnowledgeGraph(documents: Array<{ text: string; source: string; id?: string }>): Promise<void> {
    for (const doc of documents) {
      await this.addDocumentWithRAG(doc.text, doc.source, doc.id);
    }
  }
  
  /**
   * Set the LLM service configuration
   */
  setLLMConfig(config: LLMConfig): void {
    this.llmService = new LLMService(config);
  }
}

// Default export
export default GraphRAGService; 