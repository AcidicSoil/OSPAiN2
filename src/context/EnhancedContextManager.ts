import { EventEmitter } from "events";
import { DevelopmentMode } from "../types";
import { KnowledgeGraph } from "../knowledge/KnowledgeGraph";
import { RateLimitService } from "../services/RateLimitService";

interface TokenContextConfig {
  maxTokens: number;
  minContextRatio: number;
  maxContextRatio: number;
  compressionThreshold: number;
  modeSpecificLimits: Record<DevelopmentMode, number>;
}

interface CompressedContext {
  originalLength: number;
  compressedLength: number;
  compressionRatio: number;
  preservedElements: string[];
  timestamp: number;
}

interface TokenUsageRecord {
  timestamp: number;
  tokens: number;
  mode: DevelopmentMode;
  contextLength: number;
}

export class EnhancedContextManager extends EventEmitter {
  private config: TokenContextConfig;
  private tokenUsage: Map<string, number> = new Map();
  private contextCache: Map<string, CompressedContext> = new Map();
  private usageHistory: Map<DevelopmentMode, TokenUsageRecord[]> = new Map();
  private knowledgeGraph: KnowledgeGraph;
  private rateLimitService: RateLimitService;

  constructor(
    knowledgeGraph: KnowledgeGraph,
    rateLimitService: RateLimitService,
    config?: Partial<TokenContextConfig>
  ) {
    super();
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

  async optimizeContext(
    context: string,
    mode: DevelopmentMode
  ): Promise<string> {
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

  private async compressContext(
    context: string,
    mode: DevelopmentMode
  ): Promise<string> {
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
    const compressed: CompressedContext = {
      originalLength: context.length,
      compressedLength: compressedContext.length,
      compressionRatio: compressedContext.length / context.length,
      preservedElements: await this.extractPreservedElements(
        context,
        compressedContext
      ),
      timestamp: Date.now(),
    };
    this.contextCache.set(cacheKey, compressed);

    return compressedContext;
  }

  private async estimateTokens(text: string): Promise<number> {
    // Simple estimation - can be replaced with more accurate tokenizer
    return Math.ceil(text.length / 4);
  }

  private async trackUsage(
    context: string,
    mode: DevelopmentMode,
    tokens: number
  ): Promise<void> {
    const record: TokenUsageRecord = {
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

  private async analyzeUsage(mode: DevelopmentMode): Promise<void> {
    const history = this.usageHistory.get(mode) || [];
    const recentHistory = history.slice(-100); // Analyze last 100 records

    // Calculate usage patterns
    const avgTokens =
      recentHistory.reduce((acc, record) => acc + record.tokens, 0) /
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

  private getCompressionStrategies(mode: DevelopmentMode) {
    const strategies = [
      {
        name: "semantic-chunking",
        priority: 1,
        apply: async (context: string) => {
          // Implement semantic chunking using knowledge graph
          return await this.knowledgeGraph.chunkContext(context);
        },
      },
      {
        name: "relevance-scoring",
        priority: 2,
        apply: async (context: string) => {
          // Score and filter based on relevance
          return await this.knowledgeGraph.scoreAndFilter(context);
        },
      },
      {
        name: "priority-retention",
        priority: 3,
        apply: async (context: string) => {
          // Retain high-priority elements
          return await this.knowledgeGraph.prioritizeElements(context);
        },
      },
    ];

    return strategies.sort((a, b) => a.priority - b.priority);
  }

  private generateCacheKey(context: string, mode: DevelopmentMode): string {
    return `${mode}-${context.slice(0, 100)}`;
  }

  private async reconstructContext(
    compressed: CompressedContext
  ): Promise<string> {
    // Implement context reconstruction from compressed form
    return compressed.preservedElements.join("\n");
  }

  private async extractPreservedElements(
    original: string,
    compressed: string
  ): Promise<string[]> {
    // Extract and return preserved elements
    return compressed.split("\n").filter((line) => line.trim());
  }

  // Public methods for monitoring and management
  public getUsageHistory(mode: DevelopmentMode): TokenUsageRecord[] {
    return this.usageHistory.get(mode) || [];
  }

  public getCompressionStats(): Map<string, CompressedContext> {
    return new Map(this.contextCache);
  }

  public async clearCache(): Promise<void> {
    this.contextCache.clear();
  }
}
