/**
 * Knowledge Graph Services Index
 * Exports the knowledge graph services and factory methods
 */

import FalkorClient, { FalkorDBConfig } from './FalkorClient';
import KnowledgeGraphService from './KnowledgeGraphService';
import GraphRAGService from './GraphRAGService';

// Re-export all types and classes
export * from './FalkorClient';
export * from './KnowledgeGraphService';
export * from './GraphRAGService';

// Default export of all services
export { 
  FalkorClient,
  KnowledgeGraphService,
  GraphRAGService
};

// Environment-based configuration
const getDefaultConfig = (): FalkorDBConfig => {
  return {
    host: process.env.FALKORDB_HOST || 'localhost',
    port: parseInt(process.env.FALKORDB_PORT || '6379', 10),
    password: process.env.FALKORDB_PASSWORD || 'falkordb',
    database: parseInt(process.env.FALKORDB_DATABASE || '0', 10),
    connectionTimeout: parseInt(process.env.FALKORDB_CONNECTION_TIMEOUT || '5000', 10),
    retryAttempts: parseInt(process.env.FALKORDB_RETRY_ATTEMPTS || '3', 10),
    retryDelay: parseInt(process.env.FALKORDB_RETRY_DELAY || '1000', 10)
  };
};

// Factory methods for easy service instantiation
export const createFalkorClient = (
  config: Partial<FalkorDBConfig> = {},
  graphName: string = 'knowledge'
): FalkorClient => {
  return new FalkorClient({
    ...getDefaultConfig(),
    ...config
  }, graphName);
};

export const createKnowledgeGraphService = (
  config: Partial<FalkorDBConfig> = {},
  graphName: string = 'knowledge'
): KnowledgeGraphService => {
  return new KnowledgeGraphService({
    ...getDefaultConfig(),
    ...config
  }, graphName);
};

export const createGraphRAGService = (
  config: Partial<FalkorDBConfig> = {},
  graphName: string = 'knowledge'
): GraphRAGService => {
  return new GraphRAGService({
    ...getDefaultConfig(),
    ...config
  }, graphName);
};

// Singleton instances for use throughout the application
let knowledgeGraphServiceInstance: KnowledgeGraphService | null = null;
let graphRAGServiceInstance: GraphRAGService | null = null;

// Get singleton knowledge graph service
export const getKnowledgeGraphService = (
  config: Partial<FalkorDBConfig> = {},
  graphName: string = 'knowledge'
): KnowledgeGraphService => {
  if (!knowledgeGraphServiceInstance) {
    knowledgeGraphServiceInstance = createKnowledgeGraphService(config, graphName);
  }
  return knowledgeGraphServiceInstance;
};

// Get singleton GraphRAG service
export const getGraphRAGService = (
  config: Partial<FalkorDBConfig> = {},
  graphName: string = 'knowledge'
): GraphRAGService => {
  if (!graphRAGServiceInstance) {
    graphRAGServiceInstance = createGraphRAGService(config, graphName);
  }
  return graphRAGServiceInstance;
};

// Default instance of the knowledge graph service
export default getKnowledgeGraphService(); 