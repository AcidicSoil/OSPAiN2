"use strict";
/**
 * mcp-servers/shared/cache/semantic-cache.ts
 *
 * Semantic cache implementation for MCP servers.
 * Provides caching that can find similar (not just identical) requests.
 * Implements the third level of our multi-level caching strategy.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SemanticCache = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const ollama_service_1 = require("../integrations/ollama-service");
/**
 * Semantic cache implementation
 * Can find similar (not just identical) items based on semantic meaning
 */
class SemanticCache {
    /**
     * Create a new semantic cache
     * @param options Cache configuration options
     */
    constructor(options) {
        this.embeddings = {};
        this.metadata = {};
        this.cachePath = options.cachePath;
        this.embeddingsPath = path.join(options.cachePath, "embeddings.json");
        this.metadataPath = path.join(options.cachePath, "metadata.json");
        this.similarityThreshold = options.similarityThreshold || 0.85;
        this.ttl = options.ttl || 7 * 24 * 60 * 60 * 1000; // Default: 7 days
        this.maxSize = options.maxSize || 1000;
        this.embeddingModel = options.embeddingModel || "nomic-embed-text";
        // Initialize Ollama service for embeddings
        this.ollamaService = new ollama_service_1.OllamaService({
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
    async findSimilar(query, similarityThreshold) {
        const threshold = similarityThreshold || this.similarityThreshold;
        try {
            // Generate embedding for the query
            const queryEmbedding = await this.generateEmbedding(query);
            // Find most similar item
            let mostSimilarKey = null;
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
        }
        catch (error) {
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
    async set(key, value, content, ttl) {
        try {
            // Generate embedding
            const embedding = await this.generateEmbedding(content);
            // Check if we need to evict items
            if (Object.keys(this.embeddings).length >= this.maxSize &&
                !this.embeddings[key]) {
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
        }
        catch (error) {
            this.logError("Error setting cache item:", error);
        }
    }
    /**
     * Get a value from the cache by exact key
     * @param key Cache key
     * @returns The cached value or undefined if not found or expired
     */
    async get(key) {
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
        }
        catch (error) {
            this.logError("Error loading cache item:", error);
            return undefined;
        }
    }
    /**
     * Delete an item from the cache
     * @param key Cache key
     */
    delete(key) {
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
    clear() {
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
    size() {
        return Object.keys(this.embeddings).length;
    }
    /**
     * Clean up expired items
     */
    cleanup() {
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
    evictOldest() {
        let oldestKey = null;
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
    async generateEmbedding(text) {
        try {
            // Check if Ollama is available
            const isAvailable = await this.ollamaService.isAvailable();
            if (!isAvailable) {
                throw new Error("Ollama service is not available for generating embeddings");
            }
            // Generate embedding - use generateEmbeddings method
            return await this.ollamaService.generateEmbeddings(text);
        }
        catch (error) {
            this.logError("Error generating embedding:", error);
            // Return a fallback embedding (all zeros)
            return new Array(384).fill(0);
        }
    }
    /**
     * Calculate cosine similarity between two embeddings
     */
    cosineSimilarity(a, b) {
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
    ensureDirectory() {
        if (!fs.existsSync(this.cachePath)) {
            fs.mkdirSync(this.cachePath, { recursive: true });
        }
    }
    /**
     * Save the cache to disk
     */
    saveCache() {
        try {
            fs.writeFileSync(this.embeddingsPath, JSON.stringify(this.embeddings));
            fs.writeFileSync(this.metadataPath, JSON.stringify(this.metadata));
        }
        catch (error) {
            this.logError("Error saving cache:", error);
        }
    }
    /**
     * Load the cache from disk
     */
    loadCache() {
        try {
            if (fs.existsSync(this.embeddingsPath)) {
                this.embeddings = JSON.parse(fs.readFileSync(this.embeddingsPath, "utf-8"));
            }
            if (fs.existsSync(this.metadataPath)) {
                this.metadata = JSON.parse(fs.readFileSync(this.metadataPath, "utf-8"));
            }
        }
        catch (error) {
            this.logError("Error loading cache:", error);
            this.embeddings = {};
            this.metadata = {};
        }
    }
    /**
     * Get the file path for a value
     */
    getValueFilePath(key) {
        const safeKey = this.getSafeKey(key);
        return path.join(this.cachePath, `${safeKey}.json`);
    }
    /**
     * Save a value to disk
     */
    async saveValueToDisk(key, value) {
        try {
            const filePath = this.getValueFilePath(key);
            fs.writeFileSync(filePath, JSON.stringify(value));
        }
        catch (error) {
            this.logError("Error saving value to disk:", error);
        }
    }
    /**
     * Load a value from disk
     */
    async loadValueFromDisk(key) {
        try {
            const filePath = this.getValueFilePath(key);
            return JSON.parse(fs.readFileSync(filePath, "utf-8"));
        }
        catch (error) {
            throw new Error(`Error loading value from disk: ${error}`);
        }
    }
    /**
     * Convert a key to a safe filename
     */
    getSafeKey(key) {
        return Buffer.from(key).toString("base64").replace(/[/+=]/g, "_");
    }
    /**
     * Log an error message
     */
    logError(message, error) {
        if (typeof console !== "undefined") {
            console.error(`[SemanticCache] ${message}`, error);
        }
    }
}
exports.SemanticCache = SemanticCache;
//# sourceMappingURL=semantic-cache.js.map