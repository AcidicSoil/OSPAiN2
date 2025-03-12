/**
 * mcp-servers/shared/cache/memory-cache.ts
 *
 * Memory cache implementation for MCP servers.
 * Provides in-memory caching with TTL (Time-To-Live) support.
 */

interface MemoryCacheOptions {
  ttl?: number; // Time-to-live in seconds (default: 3600 = 1 hour)
  maxSize?: number; // Maximum number of items to store (default: 1000)
}

interface CacheItem<T> {
  value: T;
  expiresAt: number;
}

/**
 * In-memory cache implementation with TTL support
 */
export class MemoryCache {
  private cache: Map<string, CacheItem<any>>;
  private ttl: number;
  private maxSize: number;

  /**
   * Create a new memory cache
   * @param options Cache configuration options
   */
  constructor(options: MemoryCacheOptions = {}) {
    this.cache = new Map<string, CacheItem<any>>();
    this.ttl = options.ttl || 3600; // Default: 1 hour
    this.maxSize = options.maxSize || 1000; // Default: 1000 items

    // Start cleanup interval
    setInterval(() => this.cleanup(), 60 * 1000); // Run cleanup every minute
  }

  /**
   * Get a value from the cache
   * @param key Cache key
   * @returns The cached value or undefined if not found or expired
   */
  public get<T>(key: string): T | undefined {
    const item = this.cache.get(key);

    // Return undefined if item doesn't exist
    if (!item) {
      return undefined;
    }

    // Check if item has expired
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }

    return item.value as T;
  }

  /**
   * Set a value in the cache
   * @param key Cache key
   * @param value Value to cache
   * @param ttl Optional override for TTL in seconds
   */
  public set<T>(key: string, value: T, ttl?: number): void {
    // Check if we need to evict items
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictOldest();
    }

    const itemTtl = ttl || this.ttl;
    const expiresAt = Date.now() + itemTtl * 1000;

    this.cache.set(key, {
      value,
      expiresAt,
    });
  }

  /**
   * Check if a key exists in the cache and is not expired
   * @param key Cache key
   * @returns True if the key exists and is not expired
   */
  public has(key: string): boolean {
    const item = this.cache.get(key);

    if (!item) {
      return false;
    }

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete a key from the cache
   * @param key Cache key
   * @returns True if the key was deleted, false if it didn't exist
   */
  public delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all items from the cache
   */
  public clear(): void {
    this.cache.clear();
  }

  /**
   * Get the number of items in the cache
   */
  public size(): number {
    return this.cache.size;
  }

  /**
   * Clean up expired items
   */
  private cleanup(): void {
    const now = Date.now();

    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Evict the oldest item from the cache
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, item] of this.cache.entries()) {
      if (item.expiresAt < oldestTime) {
        oldestKey = key;
        oldestTime = item.expiresAt;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }
}
