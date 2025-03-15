import { KnowledgeGraphManager, SearchOptions } from '../../knowledge-graph/KnowledgeGraphManager';
import { ToolImplementation, ToolSchema } from '../local-server';

/**
 * Tool implementation for interacting with the Knowledge Graph
 */
export class KnowledgeGraphTool implements ToolImplementation {
  // The schema for the knowledge graph tool
  public schema: ToolSchema = {
    name: 'knowledgeGraph',
    description: 'Tool for interacting with the Knowledge Graph to enhance content search and retrieval',
    parameters: {
      properties: {
        operation: {
          type: 'string',
          description: 'The operation to perform: search, hybridSearch, getRelatedNodes, addContent, or searchByMode',
          enum: ['search', 'hybridSearch', 'getRelatedNodes', 'addContent', 'searchByMode']
        },
        query: {
          type: 'string',
          description: 'The search query (required for search/hybridSearch operations)'
        },
        nodeId: {
          type: 'string',
          description: 'Node ID for getRelatedNodes operation'
        },
        content: {
          type: 'string',
          description: 'Content to add to the knowledge graph (for addContent operation)'
        },
        metadata: {
          type: 'object',
          description: 'Metadata for the content (for addContent operation)'
        },
        options: {
          type: 'object',
          description: 'Search options for customizing the search behavior'
        },
        modeContext: {
          type: 'object',
          description: 'Current development mode context (added automatically by the server)'
        }
      },
      required: ['operation']
    },
    required: ['operation']
  };

  constructor(private knowledgeGraph: KnowledgeGraphManager) {}

  /**
   * Execute the knowledge graph tool
   */
  public async execute(args: Record<string, any>): Promise<any> {
    const { operation } = args;

    // Apply mode-specific optimizations if mode context is provided
    if (args.modeContext) {
      this.applyModeContext(args);
    }

    switch (operation) {
      case 'search':
        return this.search(args.query, args.options);
      case 'hybridSearch':
        return this.hybridSearch(args.query, args.options);
      case 'getRelatedNodes':
        return this.getRelatedNodes(args.nodeId);
      case 'addContent':
        return this.addContent(args.content, args.metadata);
      case 'searchByMode':
        return this.searchByMode(args.query, args.modeContext, args.options);
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  }

  /**
   * Apply development mode context to optimize search
   */
  private applyModeContext(args: Record<string, any>): void {
    if (!args.options) {
      args.options = {};
    }

    // Apply mode-specific search alpha if not explicitly provided
    if (args.modeContext.mode && !args.options.alpha) {
      // These values would come from DevelopmentModeManager normally
      const modeSearchAlpha: Record<string, number> = {
        design: 0.4,
        engineering: 0.6,
        testing: 0.5,
        deployment: 0.4,
        maintenance: 0.5
      };

      args.options.alpha = modeSearchAlpha[args.modeContext.mode] || 0.6;
    }

    // Apply mode-specific filters
    if (args.modeContext.priorities && !args.options.filters) {
      args.options.filters = {
        priorities: args.modeContext.priorities
      };
    }
  }

  /**
   * Search the knowledge graph
   */
  private async search(query: string, options?: any): Promise<any> {
    if (!query) {
      throw new Error('Query is required for search operation');
    }

    const results = await this.knowledgeGraph.searchGraph(query);
    return {
      type: 'search',
      query,
      results,
      count: results.length
    };
  }

  /**
   * Perform a hybrid search using vector and keyword matching
   */
  private async hybridSearch(query: string, options?: SearchOptions): Promise<any> {
    if (!query) {
      throw new Error('Query is required for hybridSearch operation');
    }

    const results = await this.knowledgeGraph.hybridSearch(query, options);
    return {
      type: 'hybridSearch',
      query,
      options,
      results,
      count: results.length
    };
  }

  /**
   * Get nodes related to the given node ID
   */
  private async getRelatedNodes(nodeId: string): Promise<any> {
    if (!nodeId) {
      throw new Error('Node ID is required for getRelatedNodes operation');
    }

    const related = await this.knowledgeGraph.getRelatedNodes(nodeId);
    return {
      type: 'relatedNodes',
      nodeId,
      nodes: related.nodes,
      relationships: related.relationships,
      count: related.nodes.length
    };
  }

  /**
   * Add content to the knowledge graph
   */
  private async addContent(content: string, metadata: Record<string, any>): Promise<any> {
    if (!content) {
      throw new Error('Content is required for addContent operation');
    }

    // Create a mock document to add to the graph
    // In a real implementation, this would use proper VS Code API types
    const mockDocument = {
      getText: () => content,
      uri: { toString: () => metadata?.uri || 'unknown://uri' },
      fileName: metadata?.fileName || 'unknown',
    };

    // Add document to graph using the existing method
    await this.knowledgeGraph.addDocumentToGraph(mockDocument as any);

    return {
      type: 'contentAdded',
      success: true,
      metadata
    };
  }

  /**
   * Perform a search optimized for the current development mode
   */
  private async searchByMode(
    query: string, 
    modeContext: any, 
    options?: SearchOptions
  ): Promise<any> {
    if (!query) {
      throw new Error('Query is required for searchByMode operation');
    }

    if (!modeContext || !modeContext.mode) {
      throw new Error('Mode context is required for searchByMode operation');
    }

    // Merge options with mode-specific settings
    const mergedOptions: SearchOptions = {
      ...(options || {}),
      // Use mode-specific alpha from the context
      alpha: options?.alpha || this.getModeSearchAlpha(modeContext.mode),
      // Add mode-specific filters
      filters: {
        ...(options?.filters || {}),
        mode: modeContext.mode,
        priorities: modeContext.priorities
      }
    };

    // Use hybridSearch with mode-optimized options
    const results = await this.knowledgeGraph.hybridSearch(query, mergedOptions);

    return {
      type: 'modeSearch',
      mode: modeContext.mode,
      query,
      options: mergedOptions,
      results,
      count: results.length
    };
  }

  /**
   * Get appropriate search alpha for the given mode
   */
  private getModeSearchAlpha(mode: string): number {
    const alphaByMode: Record<string, number> = {
      design: 0.4,     // Design mode favors keyword search slightly
      engineering: 0.6, // Engineering mode favors vector search slightly
      testing: 0.5,     // Testing mode uses balanced search
      deployment: 0.4,  // Deployment mode favors keyword search slightly
      maintenance: 0.5  // Maintenance mode uses balanced search
    };

    return alphaByMode[mode] || 0.5; // Default to balanced
  }
} 