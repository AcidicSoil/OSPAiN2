"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnhancedContextManager = void 0;
const events_1 = require("events");
class EnhancedContextManager extends events_1.EventEmitter {
    constructor(knowledgeGraph, rateLimitService, config) {
        super();
        this.tokenUsage = new Map();
        this.contextCache = new Map();
        this.usageHistory = new Map();
        // Multi-level cache
        this.memoryCache = new Map();
        this.persistentCacheKeys = new Set(); // Keys of items stored in persistent cache
        this.semanticCache = new Map(); // Key -> embedding vector
        this.knowledgeGraph = knowledgeGraph;
        this.rateLimitService = rateLimitService;
        this.config = {
            maxTokens: config?.maxTokens || 8192,
            minContextRatio: config?.minContextRatio || 0.2,
            maxContextRatio: config?.maxContextRatio || 0.8,
            compressionThreshold: config?.compressionThreshold || 0.7,
            cacheTTL: config?.cacheTTL || 1000 * 60 * 60, // 1 hour default TTL
            cacheMaxSize: config?.cacheMaxSize || 100, // Default max cache size
            semanticThreshold: config?.semanticThreshold || 0.85, // Default similarity threshold
            modeSpecificLimits: {
                design: config?.modeSpecificLimits?.design || 0.6,
                engineering: config?.modeSpecificLimits?.engineering || 0.7,
                testing: config?.modeSpecificLimits?.testing || 0.5,
                deployment: config?.modeSpecificLimits?.deployment || 0.6,
                maintenance: config?.modeSpecificLimits?.maintenance || 0.5
            },
        };
        // Initialize caches
        this.initializeCaches();
    }
    /**
     * Initialize the cache systems
     */
    async initializeCaches() {
        // Load any persisted cache entries
        try {
            await this.loadPersistentCache();
        }
        catch (error) {
            console.error('Failed to load persistent cache:', error);
        }
        // Set up cache cleanup interval
        setInterval(() => {
            this.cleanupCaches();
        }, 60000); // Clean every minute
    }
    /**
     * Get from the multi-level cache
     * @param key The cache key
     * @param semanticQuery Optional semantic query for similarity matching
     */
    async getFromCache(key, semanticQuery) {
        // Check memory cache first (L1)
        if (this.memoryCache.has(key)) {
            const entry = this.memoryCache.get(key);
            // Update access stats
            entry.accessCount++;
            entry.lastAccessed = Date.now();
            return entry.value;
        }
        // Check persistent cache (L2)
        if (this.persistentCacheKeys.has(key)) {
            try {
                const value = await this.getFromPersistentCache(key);
                if (value) {
                    // Promote to memory cache
                    this.memoryCache.set(key, {
                        value,
                        timestamp: Date.now(),
                        accessCount: 1,
                        lastAccessed: Date.now(),
                        priority: 0.5, // Medium priority for promoted items
                    });
                    return value;
                }
            }
            catch (error) {
                console.error('Failed to retrieve from persistent cache:', error);
            }
        }
        // Check semantic cache if query provided (L3)
        if (semanticQuery) {
            const similarItem = await this.findSimilarInCache(semanticQuery);
            if (similarItem) {
                return similarItem;
            }
        }
        return null;
    }
    /**
     * Find semantically similar content in cache
     * @param query The query to find similar items for
     */
    async findSimilarInCache(query) {
        try {
            // Generate embedding for query
            const queryEmbedding = await this.knowledgeGraph.generateEmbedding(query);
            let bestMatch = null;
            // Compare with all embeddings in semantic cache
            for (const [key, embedding] of this.semanticCache.entries()) {
                const similarity = this.computeCosineSimilarity(queryEmbedding, embedding);
                if (similarity > this.config.semanticThreshold &&
                    (!bestMatch || similarity > bestMatch.similarity)) {
                    bestMatch = { key, similarity };
                }
            }
            if (bestMatch) {
                // Get the actual value using the key
                return await this.getFromCache(bestMatch.key);
            }
            return null;
        }
        catch (error) {
            console.error('Error finding similar in cache:', error);
            return null;
        }
    }
    /**
     * Compute cosine similarity between two vectors
     */
    computeCosineSimilarity(a, b) {
        if (a.length !== b.length) {
            throw new Error('Vectors must have the same length');
        }
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        for (let i = 0; i < a.length; i++) {
            dotProduct += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }
    /**
     * Add to the multi-level cache
     * @param key The cache key
     * @param value The value to cache
     * @param priority Priority of the item (0-1)
     */
    async addToCache(key, value, priority = 0.5) {
        // Add to memory cache (L1)
        this.memoryCache.set(key, {
            value,
            timestamp: Date.now(),
            accessCount: 0,
            lastAccessed: Date.now(),
            priority
        });
        // Check if cache exceeded max size
        if (this.memoryCache.size > this.config.cacheMaxSize) {
            this.evictFromMemoryCache();
        }
        // Add to persistent cache (L2) for important items
        if (priority > 0.7) {
            try {
                await this.addToPersistentCache(key, value);
                this.persistentCacheKeys.add(key);
            }
            catch (error) {
                console.error('Failed to add to persistent cache:', error);
            }
        }
        // Add to semantic cache (L3)
        try {
            const embedding = await this.knowledgeGraph.generateEmbedding(value);
            this.semanticCache.set(key, embedding);
        }
        catch (error) {
            console.error('Failed to add to semantic cache:', error);
        }
    }
    /**
     * Get from persistent cache
     */
    async getFromPersistentCache(key) {
        // Implementation would depend on the persistence method
        // For example, using the extension's storage
        try {
            const globalState = await this.knowledgeGraph.getContext().globalState.get('contextCache', {});
            return globalState[key] || null;
        }
        catch (error) {
            console.error('Failed to get from persistent cache:', error);
            return null;
        }
    }
    /**
     * Add to persistent cache
     */
    async addToPersistentCache(key, value) {
        // Implementation would depend on the persistence method
        try {
            const globalState = await this.knowledgeGraph.getContext().globalState.get('contextCache', {});
            globalState[key] = value;
            await this.knowledgeGraph.getContext().globalState.update('contextCache', globalState);
        }
        catch (error) {
            console.error('Failed to add to persistent cache:', error);
        }
    }
    /**
     * Load persistent cache on startup
     */
    async loadPersistentCache() {
        try {
            const globalState = await this.knowledgeGraph.getContext().globalState.get('contextCache', {});
            this.persistentCacheKeys = new Set(Object.keys(globalState));
        }
        catch (error) {
            console.error('Failed to load persistent cache:', error);
        }
    }
    /**
     * Evict least valuable items from memory cache
     */
    evictFromMemoryCache() {
        // Calculate score for each item based on recency, frequency, and priority
        const scores = new Map();
        const now = Date.now();
        for (const [key, entry] of this.memoryCache.entries()) {
            const age = now - entry.timestamp;
            const recency = now - entry.lastAccessed;
            // Score formula: priority * (accessCount / age) * (1 / recency)
            // This favors: high priority, frequently accessed, recently used items
            const score = entry.priority * (entry.accessCount / age) * (1 / recency);
            scores.set(key, score);
        }
        // Sort by score ascending (lowest score first for removal)
        const sortedEntries = [...scores.entries()].sort((a, b) => a[1] - b[1]);
        // Remove 1/4 of the items with lowest scores
        const removeCount = Math.ceil(this.memoryCache.size / 4);
        for (let i = 0; i < removeCount && i < sortedEntries.length; i++) {
            this.memoryCache.delete(sortedEntries[i][0]);
        }
    }
    /**
     * Clean up expired cache entries
     */
    cleanupCaches() {
        const now = Date.now();
        const expireThreshold = now - this.config.cacheTTL;
        // Clear expired memory cache entries
        for (const [key, entry] of this.memoryCache.entries()) {
            if (entry.timestamp < expireThreshold) {
                this.memoryCache.delete(key);
            }
        }
        // We could also implement cleanup for persistent and semantic caches
        // But those might need to be cleaned less frequently
    }
    async optimizeContext(context, mode) {
        const currentTokens = await this.estimateTokens(context);
        const modeLimit = this.config.modeSpecificLimits[mode];
        // Track usage
        await this.trackUsage(context, mode, currentTokens);
        // Check if compression is needed
        if (currentTokens > this.config.maxTokens * modeLimit) {
            return await this.compressContext(context, mode);
        }
        return context;
    }
    async compressContext(context, mode) {
        // Check cache first
        const cacheKey = this.generateCacheKey(context, mode);
        const cached = this.contextCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < 3600000) {
            // 1 hour cache
            return this.reconstructContext(cached);
        }
        // Apply compression strategies in priority order
        let compressedContext = context;
        for (const strategy of this.getCompressionStrategies(mode)) {
            compressedContext = await strategy.apply(compressedContext);
        }
        // Cache the result
        const compressed = {
            originalLength: context.length,
            compressedLength: compressedContext.length,
            compressionRatio: compressedContext.length / context.length,
            preservedElements: await this.extractPreservedElements(context, compressedContext),
            timestamp: Date.now(),
        };
        this.contextCache.set(cacheKey, compressed);
        return compressedContext;
    }
    async estimateTokens(text) {
        // Simple estimation - can be replaced with more accurate tokenizer
        return Math.ceil(text.length / 4);
    }
    async trackUsage(context, mode, tokens) {
        const record = {
            timestamp: Date.now(),
            tokens,
            mode,
            contextLength: context.length,
        };
        const history = this.usageHistory.get(mode) || [];
        history.push(record);
        this.usageHistory.set(mode, history);
        await this.analyzeUsage(mode);
    }
    async analyzeUsage(mode) {
        const history = this.usageHistory.get(mode) || [];
        const recentHistory = history.slice(-100); // Analyze last 100 records
        // Calculate usage patterns
        const avgTokens = recentHistory.reduce((acc, record) => acc + record.tokens, 0) /
            recentHistory.length;
        const maxTokens = Math.max(...recentHistory.map((record) => record.tokens));
        // Emit usage analysis event
        this.emit("usageAnalysis", {
            mode,
            avgTokens,
            maxTokens,
            history: recentHistory,
        });
    }
    getCompressionStrategies(mode) {
        const strategies = [
            {
                name: "semantic-chunking",
                priority: 1,
                apply: async (context) => {
                    // Implement semantic chunking using knowledge graph
                    return await this.knowledgeGraph.chunkContext(context);
                },
            },
            {
                name: "relevance-scoring",
                priority: 2,
                apply: async (context) => {
                    // Score and filter based on relevance
                    return await this.knowledgeGraph.scoreAndFilter(context);
                },
            },
            {
                name: "priority-retention",
                priority: 3,
                apply: async (context) => {
                    // Retain high-priority elements
                    return await this.knowledgeGraph.prioritizeElements(context);
                },
            },
        ];
        return strategies.sort((a, b) => a.priority - b.priority);
    }
    generateCacheKey(context, mode) {
        return `${mode}-${context.slice(0, 100)}`;
    }
    async reconstructContext(compressed) {
        // Implement context reconstruction from compressed form
        return compressed.preservedElements.join("\n");
    }
    async extractPreservedElements(original, compressed) {
        // Extract and return preserved elements
        return compressed.split("\n").filter((line) => line.trim());
    }
    // Public methods for monitoring and management
    getUsageHistory(mode) {
        return this.usageHistory.get(mode) || [];
    }
    getCompressionStats() {
        return new Map(this.contextCache);
    }
    async clearCache() {
        this.contextCache.clear();
    }
}
exports.EnhancedContextManager = EnhancedContextManager;
//# sourceMappingURL=EnhancedContextManager.js.map