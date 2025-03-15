# Knowledge Graph Service

This module provides a comprehensive knowledge graph implementation for the OSPAiN2 platform, enabling semantic search, document management, entity extraction, and graph visualization.

## Components

### Core Services

- **KnowledgeGraphService**: Main service for interacting with the graph database, managing documents, entities, and relationships.
- **FalkorClient**: Low-level client for communicating with FalkorDB (Neo4j-compatible graph database).
- **GraphRAGService**: Retrieval-Augmented Generation service for answering questions using the knowledge graph.
- **LLMService**: Integration with Large Language Models for entity extraction and answer generation.
- **EmbeddingsService**: Manages vector embeddings for semantic search capabilities.
- **BatchProcessor**: Handles batch processing of documents with progress tracking and error handling.
- **CacheService**: Multi-level caching system for optimizing performance.

### UI Components

- **KnowledgeGraphExplorer**: Main component for exploring and visualizing the knowledge graph.
- **GraphVisualization**: Force-directed graph visualization component using react-force-graph.
- **BatchDocumentImport**: Component for importing and processing batches of documents.
- **BatchProcessingProgress**: Component for displaying batch processing progress and statistics.

## Features

- **Document Management**: Add, update, delete, and search documents in the knowledge graph.
- **Entity Extraction**: Automatically extract entities (concepts, people, organizations, etc.) from documents using LLMs.
- **Relationship Identification**: Identify and create relationships between entities.
- **Semantic Search**: Find documents and entities based on semantic similarity using vector embeddings.
- **Question Answering**: Answer questions using the knowledge graph with RAG techniques.
- **Batch Processing**: Process large sets of documents with progress tracking and error handling.
- **Caching**: Multi-level caching (memory and disk) for optimizing performance.
- **Visualization**: Interactive visualization of the knowledge graph.

## Usage

### Basic Usage

```typescript
// Initialize services
const cacheService = new CacheService();
const llmService = new LLMService({ /* config */ });
const embeddingsService = new EmbeddingsService({ /* config */ });

// Initialize knowledge graph service
const kgService = new KnowledgeGraphService({
  dbUrl: 'bolt://localhost:7687',
  username: 'neo4j',
  password: 'password',
  database: 'neo4j',
  llmService,
  embeddingsService
});

// Add a document
await kgService.addDocument({
  id: 'doc-1',
  title: 'Sample Document',
  content: 'This is a sample document about artificial intelligence and machine learning.',
  source: 'manual',
  timestamp: new Date().toISOString()
});

// Search documents
const results = await kgService.searchDocuments('artificial intelligence', {
  limit: 10,
  useEmbeddings: true
});

// Get entities
const entities = await kgService.getEntities({ type: 'Concept' });

// Answer a question
const graphRAG = new GraphRAGService(kgService, llmService);
const answer = await graphRAG.answerQuestion('What is artificial intelligence?');
```

### Batch Processing

```typescript
// Initialize batch processor
const batchProcessor = new BatchProcessor(kgService);

// Set up event listeners
batchProcessor.on('progress', (progress) => {
  console.log(`Progress: ${progress.stats.processed}/${progress.stats.total}`);
});

batchProcessor.on('complete', (result) => {
  console.log(`Processing complete: ${result.stats.succeeded} succeeded, ${result.stats.failed} failed`);
});

// Process a batch of documents
const documents = [/* array of documents */];
await batchProcessor.processBatch(documents);
```

## Configuration

### KnowledgeGraphService Configuration

```typescript
interface KnowledgeGraphServiceConfig {
  dbUrl: string;
  username: string;
  password: string;
  database?: string;
  llmService?: LLMService;
  embeddingsService?: EmbeddingsService;
}
```

### LLMService Configuration

```typescript
interface LLMServiceConfig {
  provider: 'openai' | 'anthropic' | 'local';
  apiKey: string;
  model: string;
  maxTokens?: number;
  temperature?: number;
}
```

### EmbeddingsService Configuration

```typescript
interface EmbeddingsServiceConfig {
  provider: 'openai' | 'local';
  apiKey: string;
  model: string;
  dimensions?: number;
  cacheService?: CacheService;
}
```

### BatchProcessor Configuration

```typescript
interface BatchProcessingOptions {
  batchSize?: number;
  concurrency?: number;
  retryCount?: number;
  retryDelay?: number;
  timeout?: number;
}
```

### CacheService Configuration

```typescript
interface CacheOptions {
  maxMemoryItems?: number;
  persistPath?: string;
  ttl?: number;
  persistInterval?: number;
}
```

## Data Models

### Document

```typescript
interface Document {
  id: string;
  title: string;
  content: string;
  source?: string;
  url?: string;
  timestamp?: string;
  type?: string;
  metadata?: Record<string, any>;
  embedding?: number[];
}
```

### Entity

```typescript
interface Entity {
  id: string;
  name: string;
  type: string;
  description?: string;
  source?: string;
  metadata?: Record<string, any>;
  embedding?: number[];
}
```

### Relationship

```typescript
interface Relationship {
  id: string;
  source: string;
  target: string;
  type: string;
  weight?: number;
  metadata?: Record<string, any>;
}
```

## Environment Variables

- `REACT_APP_FALKORDB_URL`: URL of the FalkorDB instance
- `REACT_APP_FALKORDB_USERNAME`: Username for FalkorDB
- `REACT_APP_FALKORDB_PASSWORD`: Password for FalkorDB
- `REACT_APP_FALKORDB_DATABASE`: Database name for FalkorDB
- `REACT_APP_OPENAI_API_KEY`: API key for OpenAI
- `REACT_APP_LLM_PROVIDER`: LLM provider (openai, anthropic, local)
- `REACT_APP_LLM_MODEL`: LLM model name

## Dependencies

- FalkorDB (Neo4j-compatible graph database)
- OpenAI API (for LLM and embeddings)
- React Force Graph (for visualization)
- Material-UI (for UI components) 