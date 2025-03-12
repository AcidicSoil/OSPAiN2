/**
 * mcp-servers/shared/cache/disk-cache.ts
 *
 * Disk cache implementation for MCP servers.
 * Provides persistent caching with TTL (Time-To-Live) support.
 */

import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";

interface DiskCacheOptions {
  directory: string; // Directory to store cache files
  ttl?: number; // Time-to-live in seconds (default: 86400 = 24 hours)
  extension?: string; // File extension for cache files (default: '.cache')
}

interface CacheMetadata {
  key: string;
  expiresAt: number;
  createdAt: number;
}

/**
 * Disk-based cache implementation with TTL support
 */
export class DiskCache {
  private directory: string;
  private ttl: number;
  private extension: string;

  /**
   * Create a new disk cache
   * @param options Cache configuration options
   */
  constructor(options: DiskCacheOptions) {
    this.directory = options.directory;
    this.ttl = options.ttl || 86400; // Default: 24 hours
    this.extension = options.extension || ".cache";

    // Ensure cache directory exists
    this.ensureDirectory();

    // Schedule cleanup
    setInterval(() => this.cleanup(), 30 * 60 * 1000); // Run cleanup every 30 minutes
  }

  /**
   * Get a value from the cache
   * @param key Cache key
   * @returns The cached value or undefined if not found or expired
   */
  public get<T>(key: string): T | undefined {
    const filePath = this.getFilePath(key);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return undefined;
    }

    try {
      // Read metadata and data
      const data = fs.readFileSync(filePath, "utf8");
      const parts = data.split("\n");

      if (parts.length < 2) {
        // Invalid format, remove the file
        fs.unlinkSync(filePath);
        return undefined;
      }

      // Parse metadata
      const metadata: CacheMetadata = JSON.parse(parts[0]);

      // Check if expired
      if (Date.now() > metadata.expiresAt) {
        // Expired, remove the file
        fs.unlinkSync(filePath);
        return undefined;
      }

      // Parse value
      const value: T = JSON.parse(parts.slice(1).join("\n"));
      return value;
    } catch (error) {
      // Error reading or parsing, remove the file
      try {
        fs.unlinkSync(filePath);
      } catch {
        // Ignore errors when deleting
      }

      return undefined;
    }
  }

  /**
   * Set a value in the cache
   * @param key Cache key
   * @param value Value to cache
   * @param ttl Optional override for TTL in seconds
   */
  public set<T>(key: string, value: T, ttl?: number): void {
    const filePath = this.getFilePath(key);
    const itemTtl = ttl || this.ttl;

    // Create metadata
    const metadata: CacheMetadata = {
      key,
      expiresAt: Date.now() + itemTtl * 1000,
      createdAt: Date.now(),
    };

    // Serialize data
    const metadataStr = JSON.stringify(metadata);
    const valueStr = JSON.stringify(value);
    const data = `${metadataStr}\n${valueStr}`;

    // Ensure directory exists
    this.ensureDirectory();

    // Write to file
    try {
      fs.writeFileSync(filePath, data, "utf8");
    } catch (error) {
      console.error(`[DiskCache] Error writing to cache:`, error);
    }
  }

  /**
   * Check if a key exists in the cache and is not expired
   * @param key Cache key
   * @returns True if the key exists and is not expired
   */
  public has(key: string): boolean {
    const filePath = this.getFilePath(key);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return false;
    }

    try {
      // Read metadata only
      const data = fs.readFileSync(filePath, "utf8");
      const parts = data.split("\n");

      if (parts.length < 1) {
        // Invalid format, remove the file
        fs.unlinkSync(filePath);
        return false;
      }

      // Parse metadata
      const metadata: CacheMetadata = JSON.parse(parts[0]);

      // Check if expired
      if (Date.now() > metadata.expiresAt) {
        // Expired, remove the file
        fs.unlinkSync(filePath);
        return false;
      }

      return true;
    } catch (error) {
      // Error reading or parsing, remove the file
      try {
        fs.unlinkSync(filePath);
      } catch {
        // Ignore errors when deleting
      }

      return false;
    }
  }

  /**
   * Delete a key from the cache
   * @param key Cache key
   * @returns True if the key was deleted, false if it didn't exist
   */
  public delete(key: string): boolean {
    const filePath = this.getFilePath(key);

    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        return true;
      } catch {
        return false;
      }
    }

    return false;
  }

  /**
   * Clear all items from the cache
   */
  public clear(): void {
    if (!fs.existsSync(this.directory)) {
      return;
    }

    try {
      const files = fs.readdirSync(this.directory);

      for (const file of files) {
        if (file.endsWith(this.extension)) {
          fs.unlinkSync(path.join(this.directory, file));
        }
      }
    } catch (error) {
      console.error(`[DiskCache] Error clearing cache:`, error);
    }
  }

  /**
   * Close the cache (clean up resources)
   */
  public close(): void {
    // Nothing to do for disk cache
  }

  /**
   * Clean up expired items
   */
  private cleanup(): void {
    if (!fs.existsSync(this.directory)) {
      return;
    }

    try {
      const files = fs.readdirSync(this.directory);
      const now = Date.now();

      for (const file of files) {
        if (!file.endsWith(this.extension)) {
          continue;
        }

        const filePath = path.join(this.directory, file);

        try {
          // Read just the first line for metadata
          const data = fs.readFileSync(filePath, "utf8");
          const metadataStr = data.split("\n")[0];
          const metadata: CacheMetadata = JSON.parse(metadataStr);

          if (now > metadata.expiresAt) {
            fs.unlinkSync(filePath);
          }
        } catch {
          // If we can't read the file, delete it
          try {
            fs.unlinkSync(filePath);
          } catch {
            // Ignore deletion errors
          }
        }
      }
    } catch (error) {
      console.error(`[DiskCache] Error cleaning up cache:`, error);
    }
  }

  /**
   * Ensure the cache directory exists
   */
  private ensureDirectory(): void {
    if (!fs.existsSync(this.directory)) {
      try {
        fs.mkdirSync(this.directory, { recursive: true });
      } catch (error) {
        console.error(`[DiskCache] Error creating directory:`, error);
        throw new Error(`Failed to create cache directory: ${this.directory}`);
      }
    }
  }

  /**
   * Get the file path for a cache key
   * @param key Cache key
   * @returns Path to the cache file
   */
  private getFilePath(key: string): string {
    // Hash the key to ensure valid filename
    const hash = crypto.createHash("md5").update(key).digest("hex");
    return path.join(this.directory, `${hash}${this.extension}`);
  }
}
