import { API_URL } from '../config';

export interface GraphNode {
  id: string;
  name: string;
  type: string;
  properties?: Record<string, any>;
  color?: string;
  val?: number;
}

export interface GraphLink {
  source: string;
  target: string;
  type: string;
  properties?: Record<string, any>;
  value?: number;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export interface ProcessingStatus {
  id: string;
  filename: string;
  progress: number;
  status: 'waiting' | 'processing' | 'completed' | 'error' | 'paused';
  startTime?: string;
  endTime?: string;
  fileType: string;
  fileSize: number;
  error?: string;
  details?: string[];
}

/**
 * Service for interacting with the Knowledge Graph API
 */
class KnowledgeGraphService {
  private baseUrl: string;
  
  constructor() {
    this.baseUrl = `${API_URL}/api/knowledge-graph`;
  }
  
  /**
   * Retrieve the graph data for visualization
   */
  async getGraphData(): Promise<GraphData> {
    try {
      // For now, return mock data until API is available
      return this.getMockGraphData();
      
      // When API is ready:
      // const response = await fetch(`${this.baseUrl}/graph`);
      // if (!response.ok) throw new Error('Failed to retrieve graph data');
      // return await response.json();
    } catch (error) {
      console.error('Error fetching graph data:', error);
      return { nodes: [], links: [] };
    }
  }
  
  /**
   * Upload documents to the knowledge graph for processing
   */
  async uploadDocuments(files: File[]): Promise<string[]> {
    try {
      // For now, return mock response until API is available
      return files.map(file => file.name);
      
      // When API is ready:
      // const formData = new FormData();
      // files.forEach(file => formData.append('files', file));
      // 
      // const response = await fetch(`${this.baseUrl}/upload`, {
      //   method: 'POST',
      //   body: formData
      // });
      // 
      // if (!response.ok) throw new Error('Failed to upload documents');
      // return await response.json();
    } catch (error) {
      console.error('Error uploading documents:', error);
      throw error;
    }
  }
  
  /**
   * Get the status of document processing jobs
   */
  async getProcessingStatus(): Promise<ProcessingStatus[]> {
    try {
      // For now, return mock data until API is available
      return this.getMockProcessingStatus();
      
      // When API is ready:
      // const response = await fetch(`${this.baseUrl}/processing/status`);
      // if (!response.ok) throw new Error('Failed to retrieve processing status');
      // return await response.json();
    } catch (error) {
      console.error('Error fetching processing status:', error);
      return [];
    }
  }
  
  /**
   * Search the knowledge graph
   */
  async searchGraph(query: string): Promise<GraphData> {
    try {
      // For now, return mock data until API is available
      return this.getMockGraphData();
      
      // When API is ready:
      // const response = await fetch(`${this.baseUrl}/search?q=${encodeURIComponent(query)}`);
      // if (!response.ok) throw new Error('Failed to search graph');
      // return await response.json();
    } catch (error) {
      console.error('Error searching graph:', error);
      return { nodes: [], links: [] };
    }
  }
  
  /**
   * Generate mock graph data for development
   */
  private getMockGraphData(): GraphData {
    // Mock data generator
    const nodes: GraphNode[] = [];
    const links: GraphLink[] = [];
    
    // Create some mock nodes
    for (let i = 1; i <= 20; i++) {
      nodes.push({
        id: `node${i}`,
        name: `Concept ${i}`,
        type: i % 3 === 0 ? 'entity' : i % 3 === 1 ? 'concept' : 'document',
        color: i % 3 === 0 ? '#4caf50' : i % 3 === 1 ? '#2196f3' : '#ff9800',
        val: 1 + Math.floor(Math.random() * 10)
      });
    }
    
    // Create some mock links
    for (let i = 1; i <= 30; i++) {
      const source = `node${1 + Math.floor(Math.random() * 20)}`;
      let target = `node${1 + Math.floor(Math.random() * 20)}`;
      
      // Ensure no self-links
      while (source === target) {
        target = `node${1 + Math.floor(Math.random() * 20)}`;
      }
      
      links.push({
        source,
        target,
        type: i % 4 === 0 ? 'related' : i % 4 === 1 ? 'contains' : i % 4 === 2 ? 'references' : 'similar',
        value: 1 + Math.floor(Math.random() * 5)
      });
    }
    
    return { nodes, links };
  }
  
  /**
   * Generate mock processing status for development
   */
  private getMockProcessingStatus(): ProcessingStatus[] {
    return [
      {
        id: 'job1',
        filename: 'research-paper.pdf',
        progress: 100,
        status: 'completed',
        startTime: new Date(Date.now() - 3600000).toISOString(),
        endTime: new Date(Date.now() - 3540000).toISOString(),
        fileType: 'pdf',
        fileSize: 1540000,
        details: ['Extracted 24 concepts', 'Created 38 relationships']
      },
      {
        id: 'job2',
        filename: 'dataset.csv',
        progress: 72,
        status: 'processing',
        startTime: new Date(Date.now() - 1200000).toISOString(),
        fileType: 'csv',
        fileSize: 4230000,
        details: ['Processing rows 7,200/10,000']
      },
      {
        id: 'job3',
        filename: 'documentation.docx',
        progress: 0,
        status: 'waiting',
        fileType: 'docx',
        fileSize: 2800000
      },
      {
        id: 'job4',
        filename: 'corrupted-file.pdf',
        progress: 23,
        status: 'error',
        startTime: new Date(Date.now() - 7200000).toISOString(),
        endTime: new Date(Date.now() - 7150000).toISOString(),
        fileType: 'pdf',
        fileSize: 890000,
        error: 'File is corrupted or password protected',
        details: ['Failed at initial parsing step']
      }
    ];
  }
}

// Export a singleton instance
const knowledgeGraphService = new KnowledgeGraphService();
export default knowledgeGraphService; 