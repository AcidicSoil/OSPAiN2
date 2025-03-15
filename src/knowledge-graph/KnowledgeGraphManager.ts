import * as vscode from 'vscode';
import { EventEmitter } from 'events';

export interface KnowledgeNode {
  id: string;
  label: string;
  type: string;
  properties: Record<string, any>;
}

export interface KnowledgeRelationship {
  id: string;
  source: string;
  target: string;
  type: string;
  properties: Record<string, any>;
}

// Enhanced interfaces for hybrid search
export interface SearchOptions {
  alpha?: number; // Weight between vector and keyword search (0-1)
  limit?: number; // Maximum results to return
  filters?: Record<string, any>; // Filter criteria
  includeContent?: boolean; // Whether to include full content
  searchMode?: 'hybrid' | 'vector' | 'keyword'; // Search mode
}

export interface SearchResult {
  node: KnowledgeNode;
  score: number;
  vectorScore?: number;
  keywordScore?: number;
  highlights?: string[]; // Highlighted matching sections
}

export class KnowledgeGraphManager extends EventEmitter {
  private context: vscode.ExtensionContext;
  private serverUrl: string;
  private isConnected: boolean = false;
  private refreshInterval: NodeJS.Timeout | null = null;
  private defaultSearchOptions: SearchOptions = {
    alpha: 0.6, // Default weight favoring vector search
    limit: 10,
    includeContent: true,
    searchMode: 'hybrid'
  };

  constructor(context: vscode.ExtensionContext) {
    super();
    this.context = context;
    this.serverUrl = 'http://localhost:3005'; // Default Knowledge Graph MCP server URL
  }

  public async initialize(): Promise<void> {
    const config = vscode.workspace.getConfiguration('cody');
    this.serverUrl = config.get<string>('knowledgeGraph.serverUrl', this.serverUrl);
    const syncInterval = config.get<number>('knowledgeGraph.syncInterval', 300) * 1000;
    
    // Initialize default search options from config
    this.defaultSearchOptions = {
      alpha: config.get<number>('knowledgeGraph.searchAlpha', 0.6),
      limit: config.get<number>('knowledgeGraph.searchLimit', 10),
      includeContent: config.get<boolean>('knowledgeGraph.includeContent', true),
      searchMode: config.get<'hybrid' | 'vector' | 'keyword'>('knowledgeGraph.searchMode', 'hybrid')
    };

    try {
      await this.connect();
      this.setupRefreshInterval(syncInterval);

      // Listen for configuration changes
      vscode.workspace.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration('cody.knowledgeGraph')) {
          this.updateConfiguration();
        }
      });

      // Listen for file system changes
      vscode.workspace.onDidSaveTextDocument((doc) => {
        this.addDocumentToGraph(doc);
      });

      return Promise.resolve();
    } catch (err) {
      return Promise.reject(err);
    }
  }

  private async connect(): Promise<void> {
    try {
      // For simplicity, we're just checking if the server is accessible
      const response = await this.makeRequest('/status', 'GET');
      this.isConnected = response && response.status === 'ok';

      if (this.isConnected) {
        console.log('Successfully connected to Knowledge Graph server');
      } else {
        throw new Error('Failed to connect to Knowledge Graph server');
      }
    } catch (err) {
      console.error('Error connecting to Knowledge Graph server:', err);
      this.isConnected = false;
      throw err;
    }
  }

  private updateConfiguration(): void {
    const config = vscode.workspace.getConfiguration('cody');
    this.serverUrl = config.get<string>('knowledgeGraph.serverUrl', this.serverUrl);
    const syncInterval = config.get<number>('knowledgeGraph.syncInterval', 300) * 1000;

    // Reset refresh interval
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }

    this.setupRefreshInterval(syncInterval);
  }

  private setupRefreshInterval(interval: number): void {
    this.refreshInterval = setInterval(async () => {
      try {
        if (this.isConnected) {
          await this.syncGraph();
        } else {
          await this.connect();
        }
      } catch (err) {
        console.error('Error during graph refresh:', err);
      }
    }, interval);
  }

  private async syncGraph(): Promise<void> {
    try {
      const response = await this.makeRequest('/sync', 'POST', {
        workspace: vscode.workspace.name,
        timestamp: new Date().toISOString(),
      });

      console.log('Graph sync completed:', response);
      this.emit('graphSynced', response);
    } catch (err) {
      console.error('Error syncing graph:', err);
    }
  }

  private async addDocumentToGraph(document: vscode.TextDocument): Promise<void> {
    try {
      if (!this.isConnected) {
        return;
      }

      const fileContent = document.getText();
      const fileUri = document.uri.toString();
      const fileName = document.fileName;
      const fileExtension = fileName.split('.').pop() || '';

      const response = await this.makeRequest('/document/add', 'POST', {
        uri: fileUri,
        fileName,
        extension: fileExtension,
        content: fileContent,
        timestamp: new Date().toISOString(),
      });

      console.log('Document added to graph:', response);
    } catch (err) {
      console.error('Error adding document to graph:', err);
    }
  }

  public async searchGraph(query: string): Promise<KnowledgeNode[]> {
    try {
      if (!this.isConnected) {
        await this.connect();
      }

      const response = await this.makeRequest('/search', 'POST', { query });
      return response.nodes || [];
    } catch (err) {
      console.error('Error searching graph:', err);
      return [];
    }
  }

  public async getRelatedNodes(
    nodeId: string,
  ): Promise<{ nodes: KnowledgeNode[]; relationships: KnowledgeRelationship[] }> {
    try {
      if (!this.isConnected) {
        await this.connect();
      }

      const response = await this.makeRequest(`/nodes/${nodeId}/related`, 'GET');
      return {
        nodes: response.nodes || [],
        relationships: response.relationships || [],
      };
    } catch (err) {
      console.error('Error getting related nodes:', err);
      return { nodes: [], relationships: [] };
    }
  }

  private async makeRequest(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    data?: any,
  ): Promise<any> {
    // This is a simplified implementation. In a real extension, you would use
    // the appropriate HTTP client library like axios or node-fetch
    return new Promise((resolve, reject) => {
      try {
        // Mock response for development purposes
        if (endpoint === '/status') {
          resolve({ status: 'ok' });
        } else if (endpoint === '/sync') {
          resolve({ status: 'ok', nodesUpdated: 5, relationshipsUpdated: 8 });
        } else if (endpoint === '/document/add') {
          resolve({ status: 'ok', nodeId: '123', added: true });
        } else if (endpoint === '/search') {
          resolve({
            nodes: [
              { id: '1', label: 'File', type: 'file', properties: { path: '/src/index.ts' } },
              { id: '2', label: 'Function', type: 'function', properties: { name: 'activate' } },
            ],
          });
        } else if (endpoint.includes('/related')) {
          resolve({
            nodes: [
              { id: '3', label: 'Function', type: 'function', properties: { name: 'deactivate' } },
            ],
            relationships: [{ id: '101', source: '2', target: '3', type: 'CALLS', properties: {} }],
          });
        } else {
          reject(new Error(`Unknown endpoint: ${endpoint}`));
        }
      } catch (err) {
        reject(err);
      }
    });
  }

  public dispose(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  /**
   * Performs a hybrid search combining vector and keyword approaches
   * @param query The search query
   * @param options Search options to customize behavior
   */
  public async hybridSearch(query: string, options?: Partial<SearchOptions>): Promise<SearchResult[]> {
    const mergedOptions = { ...this.defaultSearchOptions, ...options };
    
    try {
      const endpoint = '/search/hybrid';
      const results = await this.makeRequest(endpoint, 'POST', {
        query,
        options: mergedOptions
      });
      
      return results.map((result: any) => ({
        node: result.node,
        score: result.score,
        vectorScore: result.vectorScore,
        keywordScore: result.keywordScore,
        highlights: result.highlights
      }));
    } catch (error) {
      console.error('Hybrid search failed:', error);
      // Fallback to standard search if hybrid search fails
      return this.searchGraph(query).then(nodes => 
        nodes.map(node => ({ node, score: 1.0 }))
      );
    }
  }
  
  /**
   * Intelligently chunks content before adding to the graph
   * @param content The content to chunk
   * @param metadata Metadata about the content
   */
  private async semanticChunking(content: string, metadata: Record<string, any>): Promise<string[]> {
    try {
      const endpoint = '/process/chunk';
      const result = await this.makeRequest(endpoint, 'POST', {
        content,
        metadata,
        options: {
          preserveBoundaries: true,
          overlapSize: 50, // 50 token overlap between chunks
          chunkSize: metadata.fileType === 'code' ? 150 : 300 // Different sizes for different content types
        }
      });
      
      return result.chunks;
    } catch (error) {
      console.error('Semantic chunking failed:', error);
      // Simple fallback chunking by paragraphs if server chunking fails
      return content.split('\n\n').filter(chunk => chunk.trim().length > 0);
    }
  }

  /**
   * Updates the search configuration
   */
  private updateSearchConfiguration(): void {
    const config = vscode.workspace.getConfiguration('cody');
    this.defaultSearchOptions = {
      alpha: config.get<number>('knowledgeGraph.searchAlpha', 0.6),
      limit: config.get<number>('knowledgeGraph.searchLimit', 10),
      includeContent: config.get<boolean>('knowledgeGraph.includeContent', true),
      searchMode: config.get<'hybrid' | 'vector' | 'keyword'>('knowledgeGraph.searchMode', 'hybrid')
    };
  }
}
