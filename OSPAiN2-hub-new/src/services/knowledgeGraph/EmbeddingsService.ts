/**
 * EmbeddingsService.ts
 * Service for generating and managing embeddings for semantic search
 */

// Embeddings configuration
export interface EmbeddingsConfig {
  provider: 'openai' | 'ollama' | 'huggingface' | 'localai' | 'transformers.js';
  model: string;
  apiKey?: string;
  apiEndpoint?: string;
  dimension?: number;
  batchSize?: number;
  cacheSize?: number;
}

// Vector search options
export interface VectorSearchOptions {
  limit?: number;
  minSimilarity?: number;
}

/**
 * EmbeddingsService - Service for generating and searching vector embeddings
 */
export class EmbeddingsService {
  private config: EmbeddingsConfig;
  private cache: Map<string, number[]> = new Map();
  private maxCacheSize: number;
  private dimension: number;
  
  constructor(config: EmbeddingsConfig) {
    this.config = {
      batchSize: 32,
      dimension: 384, // Default to all-MiniLM-L6-v2 size
      ...config
    };
    this.dimension = this.config.dimension || 384;
    this.maxCacheSize = this.config.cacheSize || 10000;
  }
  
  /**
   * Generate embeddings for a text or array of texts
   */
  async generateEmbeddings(texts: string | string[]): Promise<number[] | number[][]> {
    const textArray = Array.isArray(texts) ? texts : [texts];
    
    // Process in batches to avoid overwhelming the API
    const batchSize = this.config.batchSize || 32;
    const batches: string[][] = [];
    
    for (let i = 0; i < textArray.length; i += batchSize) {
      batches.push(textArray.slice(i, i + batchSize));
    }
    
    // Cache lookup and identify missing texts
    const results: (number[] | null)[] = textArray.map(text => {
      const cacheKey = this.getCacheKey(text);
      return this.cache.has(cacheKey) ? this.cache.get(cacheKey)! : null;
    });
    
    // Find indices of texts that need embedding
    const missingIndices: number[] = [];
    const missingTexts: string[] = [];
    
    results.forEach((result, index) => {
      if (result === null) {
        missingIndices.push(index);
        missingTexts.push(textArray[index]);
      }
    });
    
    // Generate embeddings for missing texts
    if (missingTexts.length > 0) {
      const batchResults: number[][] = [];
      
      for (const batch of batches) {
        // Skip batch if all texts in this batch are cached
        const batchNeedsProcessing = batch.some(text => {
          const cacheKey = this.getCacheKey(text);
          return !this.cache.has(cacheKey);
        });
        
        if (batchNeedsProcessing) {
          const embeddings = await this.callEmbeddingsAPI(batch);
          batchResults.push(...embeddings);
          
          // Update cache
          batch.forEach((text, idx) => {
            const cacheKey = this.getCacheKey(text);
            this.cache.set(cacheKey, embeddings[idx]);
          });
        }
      }
      
      // Fill in the missing results
      missingIndices.forEach((index, arrayIndex) => {
        results[index] = batchResults[arrayIndex];
      });
    }
    
    // Clean up cache if it's too large
    if (this.cache.size > this.maxCacheSize) {
      this.pruneCache();
    }
    
    // Return single embedding or array based on input
    return Array.isArray(texts) ? results as number[][] : results[0] as number[];
  }
  
  /**
   * Calculate cosine similarity between two vectors
   */
  calculateSimilarity(vec1: number[], vec2: number[]): number {
    if (vec1.length !== vec2.length) {
      throw new Error(`Vector dimensions don't match: ${vec1.length} vs ${vec2.length}`);
    }
    
    let dotProduct = 0;
    let mag1 = 0;
    let mag2 = 0;
    
    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i];
      mag1 += vec1[i] * vec1[i];
      mag2 += vec2[i] * vec2[i];
    }
    
    mag1 = Math.sqrt(mag1);
    mag2 = Math.sqrt(mag2);
    
    if (mag1 === 0 || mag2 === 0) {
      return 0;
    }
    
    return dotProduct / (mag1 * mag2);
  }
  
  /**
   * Search for similar texts given a query and corpus
   */
  async searchSimilar(
    query: string, 
    corpus: string[], 
    options: VectorSearchOptions = {}
  ): Promise<Array<{ text: string; similarity: number; index: number }>> {
    const { limit = 5, minSimilarity = 0.7 } = options;
    
    // Generate embeddings for query and corpus
    const queryEmbedding = await this.generateEmbeddings(query) as number[];
    const corpusEmbeddings = await this.generateEmbeddings(corpus) as number[][];
    
    // Calculate similarities
    const similarities = corpusEmbeddings.map((embedding, index) => ({
      text: corpus[index],
      similarity: this.calculateSimilarity(queryEmbedding, embedding),
      index
    }));
    
    // Sort by similarity and filter
    return similarities
      .filter(item => item.similarity >= minSimilarity)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }
  
  /**
   * Create cache key from text
   */
  private getCacheKey(text: string): string {
    // Use a hash of the text as the cache key
    // In a production system, consider a more robust hashing method
    return `emb:${Buffer.from(text).toString('base64').substring(0, 40)}`;
  }
  
  /**
   * Prune cache when it gets too large
   */
  private pruneCache(): void {
    // Simple strategy: remove random 25% of entries
    // In a production system, use LRU or other caching strategy
    const keysToRemove = Array.from(this.cache.keys())
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(this.cache.size * 0.25));
    
    keysToRemove.forEach(key => this.cache.delete(key));
  }
  
  /**
   * Call embeddings API based on provider
   */
  private async callEmbeddingsAPI(texts: string[]): Promise<number[][]> {
    switch (this.config.provider) {
      case 'openai':
        return this.callOpenAIEmbeddings(texts);
      case 'ollama':
        return this.callOllamaEmbeddings(texts);
      case 'huggingface':
        return this.callHuggingFaceEmbeddings(texts);
      case 'localai':
        return this.callLocalAIEmbeddings(texts);
      case 'transformers.js':
        return this.callTransformersJsEmbeddings(texts);
      default:
        throw new Error(`Unsupported embeddings provider: ${this.config.provider}`);
    }
  }
  
  /**
   * Call OpenAI embeddings API
   */
  private async callOpenAIEmbeddings(texts: string[]): Promise<number[][]> {
    try {
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          model: this.config.model || 'text-embedding-3-small',
          input: texts
        })
      });
      
      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.data.map((item: any) => item.embedding);
    } catch (error) {
      throw new Error(`OpenAI embeddings API call failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Call Ollama embeddings API
   */
  private async callOllamaEmbeddings(texts: string[]): Promise<number[][]> {
    try {
      const endpoint = this.config.apiEndpoint || 'http://localhost:11434/api/embeddings';
      const results: number[][] = [];
      
      // Ollama API doesn't support batch embedding, so we do one at a time
      for (const text of texts) {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: this.config.model || 'llama3',
            prompt: text
          })
        });
        
        if (!response.ok) {
          throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        results.push(data.embedding);
      }
      
      return results;
    } catch (error) {
      throw new Error(`Ollama embeddings API call failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Call HuggingFace embeddings API
   */
  private async callHuggingFaceEmbeddings(texts: string[]): Promise<number[][]> {
    // Placeholder for HuggingFace implementation
    return texts.map(() => Array(this.dimension).fill(0));
  }
  
  /**
   * Call LocalAI embeddings API
   */
  private async callLocalAIEmbeddings(texts: string[]): Promise<number[][]> {
    // Placeholder for LocalAI implementation
    return texts.map(() => Array(this.dimension).fill(0));
  }
  
  /**
   * Generate embeddings using transformers.js
   */
  private async callTransformersJsEmbeddings(texts: string[]): Promise<number[][]> {
    // Placeholder for transformers.js implementation
    // This would use the transformers.js library for in-browser embedding generation
    return texts.map(() => Array(this.dimension).fill(0));
  }
}

// Factory method for easy service instantiation
export const createEmbeddingsService = (config: EmbeddingsConfig): EmbeddingsService => {
  return new EmbeddingsService(config);
};

// Default export
export default EmbeddingsService; 