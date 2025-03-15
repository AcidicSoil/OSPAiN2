import { EventEmitter } from 'events';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface CacheOptions {
  maxMemoryItems?: number;
  persistPath?: string;
  ttl?: number; // Time to live in milliseconds
  persistInterval?: number; // How often to persist cache to disk in milliseconds
}

export interface CacheStats {
  memorySize: number;
  diskSize: number;
  memoryHits: number;
  diskHits: number;
  misses: number;
  evictions: number;
}

interface CacheItem<T> {
  value: T;
  expires: number; // Timestamp when this item expires
  lastAccessed: number; // Timestamp when this item was last accessed
}

export class CacheService<T = any> extends EventEmitter {
  private memoryCache: Map<string, CacheItem<T>> = new Map();
  private options: Required<CacheOptions>;
  private stats: CacheStats = {
    memorySize: 0,
    diskSize: 0,
    memoryHits: 0,
    diskHits: 0,
    misses: 0,
    evictions: 0,
  };
  private persistTimer: NodeJS.Timeout | null = null;
  private persistLock = false;

  constructor(options: CacheOptions = {}) {
    super();
    this.options = {
      maxMemoryItems: options.maxMemoryItems || 1000,
      persistPath: options.persistPath || path.join(process.cwd(), '.cache'),
      ttl: options.ttl || 24 * 60 * 60 * 1000, // Default: 24 hours
      persistInterval: options.persistInterval || 5 * 60 * 1000, // Default: 5 minutes
    };

    // Create cache directory if it doesn't exist
    if (!fs.existsSync(this.options.persistPath)) {
      fs.mkdirSync(this.options.persistPath, { recursive: true });
    }

    // Start persistence timer if interval is set
    if (this.options.persistInterval > 0) {
      this.persistTimer = setInterval(() => {
        this.persistCache();
      }, this.options.persistInterval);
    }

    // Clean up on process exit
    process.on('exit', () => {
      this.persistCache();
      if (this.persistTimer) {
        clearInterval(this.persistTimer);
      }
    });
  }

  /**
   * Generate a cache key from the input
   */
  private generateKey(key: string): string {
    return crypto.createHash('md5').update(key).digest('hex');
  }

  /**
   * Get the file path for a cache key
   */
  private getCacheFilePath(key: string): string {
    const hashedKey = this.generateKey(key);
    return path.join(this.options.persistPath, `${hashedKey}.json`);
  }

  /**
   * Get an item from cache (memory first, then disk)
   */
  async get(key: string): Promise<T | null> {
    const hashedKey = this.generateKey(key);
    
    // Check memory cache first
    if (this.memoryCache.has(hashedKey)) {
      const item = this.memoryCache.get(hashedKey)!;
      
      // Check if item has expired
      if (item.expires < Date.now()) {
        this.memoryCache.delete(hashedKey);
        this.stats.evictions++;
        this.emit('evict', { key, location: 'memory', reason: 'expired' });
        return this.getFromDisk(key);
      }
      
      // Update last accessed time
      item.lastAccessed = Date.now();
      this.stats.memoryHits++;
      this.emit('hit', { key, location: 'memory' });
      return item.value;
    }
    
    // If not in memory, try disk
    return this.getFromDisk(key);
  }

  /**
   * Get an item from disk cache
   */
  private async getFromDisk(key: string): Promise<T | null> {
    const filePath = this.getCacheFilePath(key);
    
    try {
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf8');
        const item: CacheItem<T> = JSON.parse(data);
        
        // Check if item has expired
        if (item.expires < Date.now()) {
          fs.unlinkSync(filePath);
          this.stats.evictions++;
          this.emit('evict', { key, location: 'disk', reason: 'expired' });
          this.stats.misses++;
          this.emit('miss', { key });
          return null;
        }
        
        // Promote to memory cache
        this.memoryCache.set(this.generateKey(key), {
          ...item,
          lastAccessed: Date.now()
        });
        
        // Ensure we don't exceed memory limit
        this.enforceMemoryLimit();
        
        this.stats.diskHits++;
        this.emit('hit', { key, location: 'disk' });
        return item.value;
      }
    } catch (error) {
      this.emit('error', { key, error, operation: 'get' });
    }
    
    this.stats.misses++;
    this.emit('miss', { key });
    return null;
  }

  /**
   * Set an item in cache (both memory and disk)
   */
  async set(key: string, value: T, ttl?: number): Promise<void> {
    const hashedKey = this.generateKey(key);
    const expires = Date.now() + (ttl || this.options.ttl);
    
    // Add to memory cache
    this.memoryCache.set(hashedKey, {
      value,
      expires,
      lastAccessed: Date.now()
    });
    
    this.stats.memorySize = this.memoryCache.size;
    this.emit('set', { key, location: 'memory' });
    
    // Ensure we don't exceed memory limit
    this.enforceMemoryLimit();
    
    // Write to disk asynchronously
    this.persistToDisk(key, {
      value,
      expires,
      lastAccessed: Date.now()
    }).catch(error => {
      this.emit('error', { key, error, operation: 'set' });
    });
  }

  /**
   * Persist an item to disk
   */
  private async persistToDisk(key: string, item: CacheItem<T>): Promise<void> {
    const filePath = this.getCacheFilePath(key);
    
    try {
      await fs.promises.writeFile(
        filePath,
        JSON.stringify(item),
        'utf8'
      );
      this.stats.diskSize++;
      this.emit('set', { key, location: 'disk' });
    } catch (error) {
      this.emit('error', { key, error, operation: 'persist' });
      throw error;
    }
  }

  /**
   * Enforce memory cache size limit by removing least recently used items
   */
  private enforceMemoryLimit(): void {
    if (this.memoryCache.size <= this.options.maxMemoryItems) {
      return;
    }
    
    // Get all entries sorted by last accessed time (oldest first)
    const entries = Array.from(this.memoryCache.entries())
      .sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
    
    // Calculate how many items to remove
    const removeCount = this.memoryCache.size - this.options.maxMemoryItems;
    
    // Remove oldest items
    for (let i = 0; i < removeCount; i++) {
      if (i < entries.length) {
        const [key] = entries[i];
        this.memoryCache.delete(key);
        this.stats.evictions++;
        this.emit('evict', { key, location: 'memory', reason: 'lru' });
      }
    }
    
    this.stats.memorySize = this.memoryCache.size;
  }

  /**
   * Remove an item from cache (both memory and disk)
   */
  async delete(key: string): Promise<boolean> {
    const hashedKey = this.generateKey(key);
    let deleted = false;
    
    // Remove from memory
    if (this.memoryCache.has(hashedKey)) {
      this.memoryCache.delete(hashedKey);
      this.stats.memorySize = this.memoryCache.size;
      deleted = true;
    }
    
    // Remove from disk
    const filePath = this.getCacheFilePath(key);
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        this.stats.diskSize--;
        deleted = true;
      }
    } catch (error) {
      this.emit('error', { key, error, operation: 'delete' });
    }
    
    if (deleted) {
      this.emit('delete', { key });
    }
    
    return deleted;
  }

  /**
   * Clear all cache items (both memory and disk)
   */
  async clear(): Promise<void> {
    // Clear memory cache
    this.memoryCache.clear();
    this.stats.memorySize = 0;
    
    // Clear disk cache
    try {
      const files = fs.readdirSync(this.options.persistPath);
      for (const file of files) {
        if (file.endsWith('.json')) {
          fs.unlinkSync(path.join(this.options.persistPath, file));
        }
      }
      this.stats.diskSize = 0;
    } catch (error) {
      this.emit('error', { error, operation: 'clear' });
    }
    
    this.emit('clear');
  }

  /**
   * Persist the entire memory cache to disk
   */
  async persistCache(): Promise<void> {
    if (this.persistLock) return;
    
    this.persistLock = true;
    try {
      const promises: Promise<void>[] = [];
      
      for (const [hashedKey, item] of this.memoryCache.entries()) {
        // Skip items that are about to expire
        if (item.expires < Date.now() + 60000) { // Skip if expires in less than a minute
          continue;
        }
        
        // Extract original key from hashed key (not possible, but we persist by hashed key)
        promises.push(
          this.persistToDisk(hashedKey, item).catch(error => {
            this.emit('error', { key: hashedKey, error, operation: 'persistCache' });
          })
        );
      }
      
      await Promise.all(promises);
      this.emit('persist', { count: promises.length });
    } finally {
      this.persistLock = false;
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Check if an item exists in cache and is not expired
   */
  async has(key: string): Promise<boolean> {
    const hashedKey = this.generateKey(key);
    
    // Check memory first
    if (this.memoryCache.has(hashedKey)) {
      const item = this.memoryCache.get(hashedKey)!;
      if (item.expires > Date.now()) {
        return true;
      }
      
      // If expired, remove it
      this.memoryCache.delete(hashedKey);
      this.stats.evictions++;
    }
    
    // Check disk
    const filePath = this.getCacheFilePath(key);
    try {
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf8');
        const item: CacheItem<T> = JSON.parse(data);
        
        if (item.expires > Date.now()) {
          return true;
        }
        
        // If expired, remove it
        fs.unlinkSync(filePath);
        this.stats.evictions++;
      }
    } catch (error) {
      this.emit('error', { key, error, operation: 'has' });
    }
    
    return false;
  }

  /**
   * Clean up expired items from both memory and disk cache
   */
  async cleanup(): Promise<{ memory: number; disk: number }> {
    const now = Date.now();
    let memoryRemoved = 0;
    let diskRemoved = 0;
    
    // Clean memory cache
    for (const [key, item] of this.memoryCache.entries()) {
      if (item.expires < now) {
        this.memoryCache.delete(key);
        memoryRemoved++;
        this.stats.evictions++;
      }
    }
    
    this.stats.memorySize = this.memoryCache.size;
    
    // Clean disk cache
    try {
      const files = fs.readdirSync(this.options.persistPath);
      for (const file of files) {
        if (!file.endsWith('.json')) continue;
        
        const filePath = path.join(this.options.persistPath, file);
        try {
          const data = fs.readFileSync(filePath, 'utf8');
          const item: CacheItem<T> = JSON.parse(data);
          
          if (item.expires < now) {
            fs.unlinkSync(filePath);
            diskRemoved++;
            this.stats.evictions++;
            this.stats.diskSize--;
          }
        } catch (error) {
          // If we can't read the file, just delete it
          try {
            fs.unlinkSync(filePath);
            diskRemoved++;
          } catch (e) {
            // Ignore errors when deleting
          }
        }
      }
    } catch (error) {
      this.emit('error', { error, operation: 'cleanup' });
    }
    
    this.emit('cleanup', { memory: memoryRemoved, disk: diskRemoved });
    return { memory: memoryRemoved, disk: diskRemoved };
  }
} 