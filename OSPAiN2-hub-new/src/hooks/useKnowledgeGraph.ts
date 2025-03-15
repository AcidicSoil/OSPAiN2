/**
 * useKnowledgeGraph.ts
 * React hook for using the knowledge graph services in components
 */

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getKnowledgeGraphService,
  getGraphRAGService,
  Document,
  Concept,
  Relationship,
  RAGResult,
  RAGOptions
} from '../services/knowledgeGraph';

// Hook for document operations
export const useDocuments = () => {
  const queryClient = useQueryClient();
  const knowledgeGraphService = getKnowledgeGraphService();
  
  // Query to fetch documents
  const useDocumentsQuery = (limit: number = 10) => {
    return useQuery({
      queryKey: ['documents', limit],
      queryFn: async () => {
        return knowledgeGraphService.findEntities<Document>('document', {}, limit);
      }
    });
  };
  
  // Mutation to add a document
  const useAddDocumentMutation = () => {
    return useMutation({
      mutationFn: async (document: Omit<Document, 'createdAt' | 'updatedAt'>) => {
        return knowledgeGraphService.addDocument(document);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['documents'] });
      }
    });
  };
  
  // Mutation to delete a document
  const useDeleteDocumentMutation = () => {
    return useMutation({
      mutationFn: async (id: string) => {
        return knowledgeGraphService.deleteEntity(id);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['documents'] });
      }
    });
  };
  
  // Document search
  const useSearchDocumentsQuery = (searchTerm: string, limit: number = 10) => {
    return useQuery({
      queryKey: ['documents', 'search', searchTerm, limit],
      queryFn: async () => {
        return knowledgeGraphService.searchDocuments(searchTerm, limit);
      },
      enabled: searchTerm.length > 0
    });
  };
  
  return {
    useDocumentsQuery,
    useAddDocumentMutation,
    useDeleteDocumentMutation,
    useSearchDocumentsQuery
  };
};

// Hook for concept operations
export const useConcepts = () => {
  const queryClient = useQueryClient();
  const knowledgeGraphService = getKnowledgeGraphService();
  
  // Query to fetch concepts
  const useConceptsQuery = (limit: number = 50) => {
    return useQuery({
      queryKey: ['concepts', limit],
      queryFn: async () => {
        return knowledgeGraphService.findEntities<Concept>('concept', {}, limit);
      }
    });
  };
  
  // Mutation to add a concept
  const useAddConceptMutation = () => {
    return useMutation({
      mutationFn: async (concept: Omit<Concept, 'createdAt' | 'updatedAt'>) => {
        return knowledgeGraphService.addConcept(concept);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['concepts'] });
      }
    });
  };
  
  // Mutation to update a concept
  const useUpdateConceptMutation = () => {
    return useMutation({
      mutationFn: async ({ id, properties }: { id: string; properties: Partial<Concept> }) => {
        return knowledgeGraphService.updateEntity<Concept>(id, properties);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['concepts'] });
      }
    });
  };
  
  return {
    useConceptsQuery,
    useAddConceptMutation,
    useUpdateConceptMutation
  };
};

// Hook for GraphRAG operations
export const useGraphRAG = () => {
  const graphRAGService = getGraphRAGService();
  const queryClient = useQueryClient();
  
  // Process text to extract entities
  const useProcessTextMutation = () => {
    return useMutation({
      mutationFn: async ({ 
        text, 
        source, 
        documentId 
      }: { 
        text: string; 
        source: string; 
        documentId?: string 
      }) => {
        return graphRAGService.processText(text, source, documentId);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['documents'] });
        queryClient.invalidateQueries({ queryKey: ['concepts'] });
      }
    });
  };
  
  // Answer a question using GraphRAG
  const useAnswerQuestionQuery = (question: string, options?: RAGOptions) => {
    return useQuery({
      queryKey: ['graphrag', 'answer', question, options],
      queryFn: async () => {
        return graphRAGService.answerQuestion(question, options);
      },
      enabled: question.length > 0
    });
  };
  
  // Find related documents
  const useRelatedDocumentsQuery = (documentId: string, limit: number = 10) => {
    return useQuery({
      queryKey: ['graphrag', 'related', documentId, limit],
      queryFn: async () => {
        return graphRAGService.findRelatedDocuments(documentId, limit);
      },
      enabled: documentId.length > 0
    });
  };
  
  return {
    useProcessTextMutation,
    useAnswerQuestionQuery,
    useRelatedDocumentsQuery
  };
};

// Combined hook for knowledge graph operations
export const useKnowledgeGraph = () => {
  const documents = useDocuments();
  const concepts = useConcepts();
  const graphRAG = useGraphRAG();
  
  // Connection status
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  // Check connection status
  const checkConnection = useCallback(async () => {
    try {
      setIsConnecting(true);
      setConnectionError(null);
      
      const client = getKnowledgeGraphService();
      const pingResult = await client.getEntity('ping-test');
      
      setIsConnected(true);
    } catch (error) {
      setIsConnected(false);
      setConnectionError(`Failed to connect to knowledge graph: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsConnecting(false);
    }
  }, []);
  
  // Initialize connection on mount
  useEffect(() => {
    checkConnection();
  }, [checkConnection]);
  
  return {
    documents,
    concepts,
    graphRAG,
    connection: {
      isConnected,
      isConnecting,
      connectionError,
      checkConnection
    }
  };
};

export default useKnowledgeGraph; 