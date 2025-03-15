"use strict";
/**
 * mcp-servers/shared/cache/memory-cache.ts
 *
 * Memory cache implementation for MCP servers.
 * Provides in-memory caching with TTL (Time-To-Live) support.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryCache = void 0;
/**
 * In-memory cache implementation with TTL support
 */
class MemoryCache {
    /**
     * Create a new memory cache
     * @param options Cache configuration options
     */
    constructor(options = {}) {
        this.cache = new Map();
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
    get(key) {
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
        return item.value;
    }
    /**
     * Set a value in the cache
     * @param key Cache key
     * @param value Value to cache
     * @param ttl Optional override for TTL in seconds
     */
    set(key, value, ttl) {
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
    has(key) {
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
    delete(key) {
        return this.cache.delete(key);
    }
    /**
     * Clear all items from the cache
     */
    clear() {
        this.cache.clear();
    }
    /**
     * Get the number of items in the cache
     */
    size() {
        return this.cache.size;
    }
    /**
     * Clean up expired items
     */
    cleanup() {
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
    evictOldest() {
        let oldestKey = null;
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
exports.MemoryCache = MemoryCache;
//# sourceMappingURL=memory-cache.js.map