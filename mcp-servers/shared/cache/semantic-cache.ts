/**
 * mcp-servers/shared/cache/semantic-cache.ts
 *
 * Semantic cache implementation for MCP servers.
 * Provides caching that can find similar (not just identical) requests.
 * Implements the third level of our multi-level caching strategy.
 */

import * as fs from "fs";
import * as path from "path";
import { OllamaService } from "../integrations/ollama-service";
import util from "util";

interface SemanticCacheOptions {
  cachePath: string; // Path to store cache files
  embeddingModel?: string; // Ollama model to use for embeddings (default: "nomic-embed-text")
  similarityThreshold?: number; // Threshold for similarity matching (0-1, default: 0.85)
  ttl?: number; // Time-to-live in milliseconds (default: 7 days)
  maxSize?: number; // Maximum number of items to store (default: 1000)
  ollamaEndpoint?: string; // Endpoint for Ollama API (default: http://localhost:11434)
}

interface CacheItem<T> {
  key: string;
  value: T;
  embedding: number[];
  expiresAt: number;
  createdAt: number;
}

/**
 * Semantic cache implementation
 * Can find similar (not just identical) items based on semantic meaning
 */
export class SemanticCache<T> {
  private cachePath: string;
  private embeddingsPath: string;
  private metadataPath: string;
  private embeddings: Record<string, number[]> = {};
  private metadata: Record<string, { expiresAt: number; createdAt: number }> =
    {};
  private similarityThreshold: number;
  private ttl: number;
  private maxSize: number;
  private ollamaService: OllamaService;
  private embeddingModel: string;
  private cleanupInterval: ReturnType<typeof setInterval>;

  /**
   * Create a new semantic cache
   * @param options Cache configuration options
   */
  constructor(options: SemanticCacheOptions) {
    this.cachePath = options.cachePath;
    this.embeddingsPath = path.join(options.cachePath, "embeddings.json");
    this.metadataPath = path.join(options.cachePath, "metadata.json");
    this.similarityThreshold = options.similarityThreshold || 0.85;
    this.ttl = options.ttl || 7 * 24 * 60 * 60 * 1000; // Default: 7 days
    this.maxSize = options.maxSize || 1000;
    this.embeddingModel = options.embeddingModel || "nomic-embed-text";

    // Initialize Ollama service for embeddings
    this.ollamaService = new OllamaService({
      endpoint: options.ollamaEndpoint || "http://localhost:11434",
      model: this.embeddingModel,
    });

    // Ensure cache directory exists
    this.ensureDirectory();

    // Load existing cache
    this.loadCache();

    // Start cleanup interval
    this.cleanupInterval = setInterval(() => this.cleanup(), 60 * 60 * 1000); // Run cleanup every hour
  }

  /**
   * Find a similar item in the cache
   * @param query The query to find similar items for
   * @param similarityThreshold Optional override for similarity threshold
   * @returns The most similar cached item that meets the threshold, or null if none found
   */
  public async findSimilar(
    query: string,
    similarityThreshold?: number
  ): Promise<{ value: T; similarity: number } | null> {
    const threshold = similarityThreshold || this.similarityThreshold;

    try {
      // Generate embedding for the query
      const queryEmbedding = await this.generateEmbedding(query);

      // Find most similar item
      let mostSimilarKey: string | null = null;
      let highestSimilarity = 0;

      // Check each cached item
      for (const [key, embedding] of Object.entries(this.embeddings)) {
        // Check if item has expired
        const meta = this.metadata[key];
        if (!meta || Date.now() > meta.expiresAt) {
          continue;
        }

        // Calculate cosine similarity
        const similarity = this.cosineSimilarity(queryEmbedding, embedding);

        // Update most similar if this one is better
        if (similarity > highestSimilarity) {
          highestSimilarity = similarity;
          mostSimilarKey = key;
        }
      }

      // Return most similar item if it meets the threshold
      if (mostSimilarKey && highestSimilarity >= threshold) {
        const value = await this.loadValueFromDisk(mostSimilarKey);
        return {
          value,
          similarity: highestSimilarity,
        };
      }

      return null;
    } catch (error) {
      this.logError("Error finding similar cache items:", error);
      return null;
    }
  }

  /**
   * Store an item in the cache
   * @param key Cache key
   * @param value Value to cache
   * @param content Content to generate embedding from (usually the input query)
   * @param ttl Optional override for TTL in milliseconds
   */
  public async set(
    key: string,
    value: T,
    content: string,
    ttl?: number
  ): Promise<void> {
    try {
      // Generate embedding
      const embedding = await this.generateEmbedding(content);

      // Check if we need to evict items
      if (
        Object.keys(this.embeddings).length >= this.maxSize &&
        !this.embeddings[key]
      ) {
        this.evictOldest();
      }

      // Set expiration time
      const itemTtl = ttl || this.ttl;
      const now = Date.now();
      const expiresAt = now + itemTtl;

      // Store embedding and metadata
      this.embeddings[key] = embedding;
      this.metadata[key] = {
        expiresAt,
        createdAt: now,
      };

      // Save value to disk
      await this.saveValueToDisk(key, value);

      // Save updated embeddings and metadata
      this.saveCache();
    } catch (error) {
      this.logError("Error setting cache item:", error);
    }
  }

  /**
   * Get a value from the cache by exact key
   * @param key Cache key
   * @returns The cached value or undefined if not found or expired
   */
  public async get(key: string): Promise<T | undefined> {
    const meta = this.metadata[key];

    // Return undefined if item doesn't exist
    if (!meta) {
      return undefined;
    }

    // Check if item has expired
    if (Date.now() > meta.expiresAt) {
      this.delete(key);
      return undefined;
    }

    try {
      // Load value from disk
      return await this.loadValueFromDisk(key);
    } catch (error) {
      this.logError("Error loading cache item:", error);
      return undefined;
    }
  }

  /**
   * Delete an item from the cache
   * @param key Cache key
   */
  public delete(key: string): boolean {
    const exists = !!this.metadata[key];

    if (exists) {
      // Delete from memory
      delete this.embeddings[key];
      delete this.metadata[key];

      // Delete from disk
      const filePath = this.getValueFilePath(key);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      // Save updated cache
      this.saveCache();
    }

    return exists;
  }

  /**
   * Clear all items from the cache
   */
  public clear(): void {
    // Clear memory
    this.embeddings = {};
    this.metadata = {};

    // Clear disk
    if (fs.existsSync(this.cachePath)) {
      const files = fs.readdirSync(this.cachePath);
      for (const file of files) {
        const filePath = path.join(this.cachePath, file);
        if (fs.statSync(filePath).isFile()) {
          fs.unlinkSync(filePath);
        }
      }
    }

    // Save empty cache
    this.saveCache();
  }

  /**
   * Get the size of the cache
   */
  public size(): number {
    return Object.keys(this.embeddings).length;
  }

  /**
   * Clean up expired items
   */
  private cleanup(): void {
    const now = Date.now();
    let hasChanges = false;

    for (const [key, meta] of Object.entries(this.metadata)) {
      if (now > meta.expiresAt) {
        delete this.embeddings[key];
        delete this.metadata[key];

        // Delete from disk
        const filePath = this.getValueFilePath(key);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }

        hasChanges = true;
      }
    }

    if (hasChanges) {
      this.saveCache();
    }
  }

  /**
   * Evict the oldest item from the cache
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, meta] of Object.entries(this.metadata)) {
      if (meta.createdAt < oldestTime) {
        oldestKey = key;
        oldestTime = meta.createdAt;
      }
    }

    if (oldestKey) {
      this.delete(oldestKey);
    }
  }

  /**
   * Generate an embedding for a text
   */
  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      // Check if Ollama is available
      const isAvailable = await this.ollamaService.isAvailable();
      if (!isAvailable) {
        throw new Error(
          "Ollama service is not available for generating embeddings"
        );
      }

      // Generate embedding - use generateEmbeddings method
      return await this.ollamaService.generateEmbeddings(text);
    } catch (error) {
      this.logError("Error generating embedding:", error);
      // Return a fallback embedding (all zeros)
      return new Array(384).fill(0);
    }
  }

  /**
   * Calculate cosine similarity between two embeddings
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error("Embeddings must have the same dimensions");
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (normA * normB);
  }

  /**
   * Ensure cache directory exists
   */
  private ensureDirectory(): void {
    if (!fs.existsSync(this.cachePath)) {
      fs.mkdirSync(this.cachePath, { recursive: true });
    }
  }

  /**
   * Save the cache to disk
   */
  private saveCache(): void {
    try {
      fs.writeFileSync(this.embeddingsPath, JSON.stringify(this.embeddings));
      fs.writeFileSync(this.metadataPath, JSON.stringify(this.metadata));
    } catch (error) {
      this.logError("Error saving cache:", error);
    }
  }

  /**
   * Load the cache from disk
   */
  private loadCache(): void {
    try {
      if (fs.existsSync(this.embeddingsPath)) {
        this.embeddings = JSON.parse(
          fs.readFileSync(this.embeddingsPath, "utf-8")
        );
      }

      if (fs.existsSync(this.metadataPath)) {
        this.metadata = JSON.parse(fs.readFileSync(this.metadataPath, "utf-8"));
      }
    } catch (error) {
      this.logError("Error loading cache:", error);
      this.embeddings = {};
      this.metadata = {};
    }
  }

  /**
   * Get the file path for a value
   */
  private getValueFilePath(key: string): string {
    const safeKey = this.getSafeKey(key);
    return path.join(this.cachePath, `${safeKey}.json`);
  }

  /**
   * Save a value to disk
   */
  private async saveValueToDisk(key: string, value: T): Promise<void> {
    try {
      const filePath = this.getValueFilePath(key);
      fs.writeFileSync(filePath, JSON.stringify(value));
    } catch (error) {
      this.logError("Error saving value to disk:", error);
    }
  }

  /**
   * Load a value from disk
   */
  private async loadValueFromDisk(key: string): Promise<T> {
    try {
      const filePath = this.getValueFilePath(key);
      return JSON.parse(fs.readFileSync(filePath, "utf-8"));
    } catch (error) {
      throw new Error(`Error loading value from disk: ${error}`);
    }
  }

  /**
   * Convert a key to a safe filename
   */
  private getSafeKey(key: string): string {
    return Buffer.from(key).toString("base64").replace(/[/+=]/g, "_");
  }

  /**
   * Log an error message
   */
  private logError(message: string, error?: unknown): void {
    if (typeof console !== "undefined") {
      console.error(`[SemanticCache] ${message}`, error);
    }
  }
}
