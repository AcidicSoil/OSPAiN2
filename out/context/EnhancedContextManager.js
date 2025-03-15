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
        this.knowledgeGraph = knowledgeGraph;
        this.rateLimitService = rateLimitService;
        this.config = {
            maxTokens: config?.maxTokens || 8192,
            minContextRatio: config?.minContextRatio || 0.2,
            maxContextRatio: config?.maxContextRatio || 0.8,
            compressionThreshold: config?.compressionThreshold || 0.7,
            modeSpecificLimits: {
                design: config?.modeSpecificLimits?.design || 0.6,
                engineering: config?.modeSpecificLimits?.engineering || 0.7,
                testing: config?.modeSpecificLimits?.testing || 0.5,
            },
        };
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