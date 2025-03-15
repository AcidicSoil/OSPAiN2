/**
 * FalkorClient.ts
 * Core client for interacting with FalkorDB knowledge graph database
 */

import { createClient, RedisClientType } from 'redis';

// Configuration types
export interface FalkorDBConfig {
  host: string;
  port: number;
  password?: string;
  database?: number;
  connectionTimeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

// Query response types
export interface GraphQueryResponse<T = any> {
  results: T[];
  metadata: {
    queryExecutionTime: number;
    nodesCreated: number;
    nodesDeleted: number;
    relationshipsCreated: number;
    relationshipsDeleted: number;
    propertiesSet: number;
    labelsAdded: number;
  };
}

// Error types
export class FalkorDBError extends Error {
  constructor(message: string, public readonly code?: string, public readonly query?: string) {
    super(message);
    this.name = 'FalkorDBError';
  }
}

export class FalkorDBConnectionError extends FalkorDBError {
  constructor(message: string, code?: string) {
    super(message, code);
    this.name = 'FalkorDBConnectionError';
  }
}

export class FalkorDBQueryError extends FalkorDBError {
  constructor(message: string, query: string, code?: string) {
    super(message, code, query);
    this.name = 'FalkorDBQueryError';
  }
}

/**
 * FalkorClient - Core client for interacting with FalkorDB
 */
export class FalkorClient {
  private client: RedisClientType;
  private connected: boolean = false;
  private connecting: boolean = false;
  private retryAttempts: number;
  private retryDelay: number;
  private graphName: string = 'knowledge';
  
  constructor(config: FalkorDBConfig, graphName: string = 'knowledge') {
    const {
      host = 'localhost',
      port = 6379,
      password,
      database = 0,
      connectionTimeout = 5000,
      retryAttempts = 3,
      retryDelay = 1000
    } = config;
    
    this.retryAttempts = retryAttempts;
    this.retryDelay = retryDelay;
    this.graphName = graphName;
    
    // Create Redis client with FalkorDB connection
    this.client = createClient({
      url: `redis://${host}:${port}`,
      password,
      database,
      socket: {
        connectTimeout: connectionTimeout
      }
    });
    
    // Set up event handlers
    this.client.on('error', (err) => {
      console.error('FalkorDB client error:', err);
      this.connected = false;
    });
    
    this.client.on('connect', () => {
      console.log('FalkorDB client connected');
      this.connected = true;
      this.connecting = false;
    });
    
    this.client.on('disconnect', () => {
      console.log('FalkorDB client disconnected');
      this.connected = false;
    });
  }
  
  /**
   * Connect to FalkorDB with retry logic
   */
  async connect(): Promise<void> {
    if (this.connected) return;
    if (this.connecting) {
      console.log('Connection already in progress');
      return;
    }
    
    this.connecting = true;
    
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        await this.client.connect();
        return;
      } catch (error) {
        if (attempt === this.retryAttempts) {
          this.connecting = false;
          throw new FalkorDBConnectionError(
            `Failed to connect to FalkorDB after ${this.retryAttempts} attempts: ${error instanceof Error ? error.message : String(error)}`
          );
        }
        
        console.log(`Connection attempt ${attempt} failed, retrying in ${this.retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
      }
    }
  }
  
  /**
   * Disconnect from FalkorDB
   */
  async disconnect(): Promise<void> {
    if (!this.connected) return;
    
    try {
      await this.client.disconnect();
      this.connected = false;
    } catch (error) {
      console.error('Error disconnecting from FalkorDB:', error);
    }
  }
  
  /**
   * Execute a Cypher query against FalkorDB
   */
  async query<T = any>(cypherQuery: string, params: Record<string, any> = {}): Promise<GraphQueryResponse<T>> {
    if (!this.connected) {
      await this.connect();
    }
    
    try {
      // Execute query using GRAPH.QUERY command
      const result = await this.client.sendCommand([
        'GRAPH.QUERY', 
        this.graphName, 
        cypherQuery,
        '--parameters',
        JSON.stringify(params)
      ]);
      
      // Parse and return result
      return this.parseQueryResult<T>(result);
    } catch (error) {
      throw new FalkorDBQueryError(
        `Query execution failed: ${error instanceof Error ? error.message : String(error)}`,
        cypherQuery
      );
    }
  }
  
  /**
   * Parse query result from FalkorDB response
   */
  private parseQueryResult<T>(result: any): GraphQueryResponse<T> {
    try {
      // For string results, try to parse as JSON
      if (typeof result === 'string') {
        return JSON.parse(result);
      }
      
      // For buffer results, convert to string and parse
      if (Buffer.isBuffer(result)) {
        return JSON.parse(result.toString());
      }
      
      // Process array responses from Redis client
      if (Array.isArray(result)) {
        // Extract headers and results
        const [headers, ...rows] = result;
        
        // Map array data to objects based on headers
        const mapped = rows.map(row => {
          const obj: Record<string, any> = {};
          headers.forEach((header: string, index: number) => {
            obj[header] = row[index];
          });
          return obj;
        });
        
        return {
          results: mapped as T[],
          metadata: {
            queryExecutionTime: 0,
            nodesCreated: 0,
            nodesDeleted: 0,
            relationshipsCreated: 0,
            relationshipsDeleted: 0,
            propertiesSet: 0,
            labelsAdded: 0
          }
        };
      }
      
      // Default fallback
      return {
        results: [] as T[],
        metadata: {
          queryExecutionTime: 0,
          nodesCreated: 0,
          nodesDeleted: 0,
          relationshipsCreated: 0,
          relationshipsDeleted: 0,
          propertiesSet: 0,
          labelsAdded: 0
        }
      };
    } catch (error) {
      throw new FalkorDBError(`Failed to parse query result: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Check if database is available with a simple query
   */
  async ping(): Promise<boolean> {
    try {
      await this.query('RETURN 1 AS ping');
      return true;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Create schema constraints and indexes
   */
  async initializeSchema(): Promise<void> {
    // Create constraints
    await this.query(`CREATE CONSTRAINT ON (n:Entity) ASSERT n.id IS UNIQUE`);
    await this.query(`CREATE CONSTRAINT ON (n:Document) ASSERT n.id IS UNIQUE`);
    await this.query(`CREATE CONSTRAINT ON (n:Concept) ASSERT n.name IS UNIQUE`);
    
    // Create indexes
    await this.query(`CREATE INDEX ON :Entity(type)`);
    await this.query(`CREATE INDEX ON :Document(createdAt)`);
    await this.query(`CREATE INDEX ON :Relation(type)`);
  }
}

export default FalkorClient; 