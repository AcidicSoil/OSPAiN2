"use strict";
/**
 * mcp-servers/content-summarizer/content-summarizer-server.ts
 *
 * Content Summarizer MCP Server
 * Provides text summarization with various options and styles
 * Using local LLM (Ollama) with multi-level caching for efficiency.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentSummarizerServer = void 0;
const mcp_server_1 = require("../shared/mcp-server");
const ollama_service_1 = require("../shared/integrations/ollama-service");
const memory_cache_1 = require("../shared/cache/memory-cache");
const disk_cache_1 = require("../shared/cache/disk-cache");
const semantic_cache_1 = require("../shared/cache/semantic-cache");
const path_1 = __importDefault(require("path"));
// Default configuration
const DEFAULT_CONFIG = {
    name: "Content_Summarizer_Server",
    description: "MCP server for generating text summaries with various styles",
    version: "1.0.0",
    ollamaEndpoint: "http://localhost:11434",
    ollamaModel: "mistral:latest",
    embedModel: "nomic-embed-text",
    cachePath: path_1.default.join(process.cwd(), ".cache", "summarizer"),
    memCacheMaxSize: 100,
    memCacheTTL: 24 * 60 * 60 * 1000, // 24 hours
    diskCacheTTL: 7 * 24 * 60 * 60 * 1000, // 7 days
    semanticCacheTTL: 30 * 24 * 60 * 60 * 1000, // 30 days
    similarityThreshold: 0.85,
    defaultMaxLength: 200,
    // Mode-specific optimizations
    designModeOptimizations: {
        memCacheMaxSize: 200, // Double the cache size for design mode
        similarityThreshold: 0.8, // Lower threshold for more matches in design mode
    },
    engineeringModeOptimizations: {
        memCacheMaxSize: 150, // Larger cache for engineering mode
        similarityThreshold: 0.9, // Higher threshold for more precise matches
    },
    testingModeOptimizations: {
        memCacheMaxSize: 300, // Largest cache for testing mode to handle test cases
        similarityThreshold: 0.87, // Balanced threshold for testing
    },
    deploymentModeOptimizations: {
        memCacheMaxSize: 100, // Standard cache for deployment
        similarityThreshold: 0.85, // Standard threshold for deployment
    },
    maintenanceModeOptimizations: {
        memCacheMaxSize: 150, // Larger cache for maintenance mode
        similarityThreshold: 0.82, // Lower threshold to find more similar issues
    },
};
// Summarization template/style options
const SUMMARY_TEMPLATES = {
    default: "Summarize the following text concisely, keeping the main points and key details:\n\n{text}\n\nSummary:",
    technical: "Create a technical summary of the following, using precise terminology and focusing on technical details:\n\n{text}\n\nTechnical summary:",
    executive: "Create an executive summary of the following, focusing on key business implications and strategic insights:\n\n{text}\n\nExecutive summary:",
    bullet: "Summarize the following text as a bullet point list of the most important points:\n\n{text}\n\nBullet point summary:",
    tldr: "TL;DR for the following text:\n\n{text}\n\nTL;DR:",
    academic: "Create an academic summary of the following, using formal language and preserving scholarly content:\n\n{text}\n\nAcademic summary:",
    critical: "Create a critical analysis summary of the following, evaluating strengths, weaknesses, and implications:\n\n{text}\n\nCritical summary:",
    eli5: "Explain the following text as you would to a 5-year-old, using simple words and concepts:\n\n{text}\n\nSimple explanation:",
};
// Enum for different development modes
var DevelopmentMode;
(function (DevelopmentMode) {
    DevelopmentMode["DESIGN"] = "design";
    DevelopmentMode["ENGINEERING"] = "engineering";
    DevelopmentMode["TESTING"] = "testing";
    DevelopmentMode["DEPLOYMENT"] = "deployment";
    DevelopmentMode["MAINTENANCE"] = "maintenance";
})(DevelopmentMode || (DevelopmentMode = {}));
/**
 * Content Summarizer Server
 * Provides tools for summarizing text content with various styles
 * Implements multi-level caching for efficient operation
 */
class ContentSummarizerServer extends mcp_server_1.MCPServer {
    /**
     * Create a new Content Summarizer Server
     * @param config Server configuration
     */
    constructor(config = {}) {
        // Merge default config with provided config
        const mergedConfig = { ...DEFAULT_CONFIG, ...config };
        // Initialize the base MCP server
        super({
            name: mergedConfig.name,
            description: mergedConfig.description,
            version: mergedConfig.version,
        });
        this.currentMode = DevelopmentMode.DESIGN; // Default to design mode
        // Store the merged configuration
        this.config = mergedConfig;
        // Initialize Ollama service
        this.ollama = new ollama_service_1.OllamaService({
            endpoint: this.config.ollamaEndpoint,
            model: this.config.ollamaModel,
        });
        // Initialize caches
        this.setupCaches();
        // Register the summarize tool
        this.registerTool(this.createSummarizeTool());
        // Register the setMode tool
        this.registerTool(this.createSetModeTool());
        // Log server initialization
        this.log("Content Summarizer Server initialized");
    }
    /**
     * Set up caches based on current mode
     */
    setupCaches() {
        // Get cache configuration based on current mode
        const cacheConfig = this.getCacheConfigForMode();
        // Initialize memory cache
        this.memCache = new memory_cache_1.MemoryCache({
            maxSize: cacheConfig.memCacheMaxSize,
            ttl: this.config.memCacheTTL,
        });
        // Initialize disk cache
        this.diskCache = new disk_cache_1.DiskCache({
            directory: path_1.default.join(this.config.cachePath, "disk"),
            ttl: this.config.diskCacheTTL,
        });
        // Initialize semantic cache
        this.semanticCache = new semantic_cache_1.SemanticCache({
            cachePath: path_1.default.join(this.config.cachePath, "semantic"),
            embeddingModel: this.config.embedModel,
            similarityThreshold: cacheConfig.similarityThreshold,
            ttl: this.config.semanticCacheTTL,
            ollamaEndpoint: this.config.ollamaEndpoint,
        });
        this.log(`Caches configured for ${this.currentMode} mode`);
    }
    /**
     * Get cache configuration for the current development mode
     */
    getCacheConfigForMode() {
        switch (this.currentMode) {
            case DevelopmentMode.DESIGN:
                return this.config.designModeOptimizations;
            case DevelopmentMode.ENGINEERING:
                return this.config.engineeringModeOptimizations;
            case DevelopmentMode.TESTING:
                return this.config.testingModeOptimizations;
            case DevelopmentMode.DEPLOYMENT:
                return this.config.deploymentModeOptimizations;
            case DevelopmentMode.MAINTENANCE:
                return this.config.maintenanceModeOptimizations;
            default:
                return {
                    memCacheMaxSize: this.config.memCacheMaxSize,
                    similarityThreshold: this.config.similarityThreshold,
                };
        }
    }
    /**
     * Create the summarize tool
     * @returns The summarize MCPTool
     */
    createSummarizeTool() {
        return {
            name: "summarize",
            description: "Summarize text content with various options",
            parameters: {
                type: "object",
                properties: {
                    text: {
                        type: "string",
                        minLength: 1,
                        description: "The text to summarize",
                    },
                    maxLength: {
                        type: "number",
                        default: this.config.defaultMaxLength,
                        description: "Maximum length of the summary",
                    },
                    language: {
                        type: "string",
                        default: "en",
                        description: "Language for the summary",
                    },
                    style: {
                        type: "string",
                        enum: Object.keys(SUMMARY_TEMPLATES),
                        default: "default",
                        description: "Summary style (default, technical, executive, bullet, tldr, academic, critical, eli5)",
                    },
                },
                required: ["text"],
                additionalProperties: false,
            },
            handler: this.handleSummarize.bind(this),
        };
    }
    /**
     * Create the setMode tool for switching development modes
     * @returns The setMode MCPTool
     */
    createSetModeTool() {
        return {
            name: "setMode",
            description: "Set the development mode for optimized performance",
            parameters: {
                type: "object",
                properties: {
                    mode: {
                        type: "string",
                        enum: Object.values(DevelopmentMode),
                        description: "Development mode (design, engineering, testing, deployment, maintenance)",
                    },
                },
                required: ["mode"],
                additionalProperties: false,
            },
            handler: this.handleSetMode.bind(this),
        };
    }
    /**
     * Handle setMode tool requests
     * @param params Tool parameters
     * @returns Success message
     */
    async handleSetMode(params) {
        const { mode } = params;
        // Check if mode is valid
        if (!Object.values(DevelopmentMode).includes(mode)) {
            throw new Error(`Invalid mode: ${mode}. Valid modes are: ${Object.values(DevelopmentMode).join(", ")}`);
        }
        // Update current mode
        this.currentMode = mode;
        // Reconfigure caches for new mode
        this.setupCaches();
        return `Development mode set to ${mode}`;
    }
    /**
     * Handle summarize tool requests
     * @param params Tool parameters
     * @returns The summarized text
     */
    async handleSummarize(params) {
        const { text, maxLength = this.config.defaultMaxLength, language = "en", style = "default", } = params;
        // Generate a cache key
        const cacheKey = this.generateCacheKey(text, maxLength, language, style);
        // Try to get from memory cache first (fastest)
        const memCached = this.memCache.get(cacheKey);
        if (memCached) {
            this.log("Summary retrieved from memory cache");
            return memCached;
        }
        // Try to get from disk cache (medium speed)
        const diskCached = await this.diskCache.get(cacheKey);
        if (diskCached) {
            // Store in memory cache for faster future access
            this.memCache.set(cacheKey, diskCached);
            this.log("Summary retrieved from disk cache");
            return diskCached;
        }
        // Try to get from semantic cache (finds similar content)
        try {
            const similarResult = await this.semanticCache.findSimilar(text);
            if (similarResult) {
                const { value: summary, similarity } = similarResult;
                this.log(`Summary retrieved from semantic cache (similarity: ${similarity.toFixed(2)})`);
                // Store in faster caches for future retrieval
                this.memCache.set(cacheKey, summary);
                await this.diskCache.set(cacheKey, summary);
                return summary;
            }
        }
        catch (error) {
            this.logError("Error accessing semantic cache", error);
            // Continue with generating a new summary if semantic cache fails
        }
        // Get the appropriate template
        const templateKey = style;
        const template = SUMMARY_TEMPLATES[templateKey] || SUMMARY_TEMPLATES.default;
        // Prepare prompt with text replacement
        const prompt = template.replace("{text}", text);
        // Add length instruction
        const fullPrompt = `${prompt}\n\nKeep the summary under ${maxLength} words and in ${language} language.`;
        // Check if Ollama is available
        const isOllamaAvailable = await this.ollama.isAvailable();
        if (!isOllamaAvailable) {
            throw new Error("Ollama service is not available");
        }
        try {
            // Generate summary
            const summary = await this.ollama.generateText(fullPrompt, {
                temperature: 0.3, // Lower temperature for more factual summaries
                maxTokens: maxLength * 4, // Estimate tokens based on words
            });
            // Cache the result in all cache levels
            this.memCache.set(cacheKey, summary);
            await this.diskCache.set(cacheKey, summary);
            await this.semanticCache.set(cacheKey, summary, text);
            return summary;
        }
        catch (error) {
            this.logError("Error generating summary", error);
            throw new Error(`Failed to generate summary: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Generate a cache key from parameters
     */
    generateCacheKey(text, maxLength, language, style) {
        // Create a simple hash of the text to keep the key length reasonable
        const textHash = Buffer.from(text).toString("base64").substring(0, 40);
        return `summary_${style}_${language}_${maxLength}_${textHash}`;
    }
    /**
     * Log a message with server name prefix
     */
    log(message) {
        if (process.env.NODE_ENV !== "production") {
            console.log(`[${this.config.name}] ${message}`);
        }
    }
    /**
     * Log an error with server name prefix
     */
    logError(message, error) {
        console.error(`[${this.config.name}] ${message}:`, error);
    }
}
exports.ContentSummarizerServer = ContentSummarizerServer;
// If running directly, start the server
if (require.main === module) {
    const server = new ContentSummarizerServer({
        port: parseInt(process.env.PORT || "3004"),
        name: "Content Summarizer",
        version: "1.0.0",
        description: "Text summarization MCP server with multiple styles",
        ollamaEndpoint: process.env.OLLAMA_ENDPOINT,
        ollamaModel: process.env.OLLAMA_MODEL || "mistral",
        embedModel: process.env.OLLAMA_EMBED_MODEL || "nomic-embed-text",
        cachePath: path_1.default.join(process.cwd(), ".cache", "summarizer"),
        memCacheMaxSize: 100,
        memCacheTTL: 24 * 60 * 60 * 1000, // 24 hours
        diskCacheTTL: 7 * 24 * 60 * 60 * 1000, // 7 days
        defaultMaxLength: 200,
    });
    server.start();
}
//# sourceMappingURL=content-summarizer-server.js.map