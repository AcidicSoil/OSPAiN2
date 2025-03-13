export enum DevelopmentMode {
  Design = "design",
  Engineering = "engineering",
  Testing = "testing",
}

export interface TokenUsageMetrics {
  totalTokens: number;
  averageTokens: number;
  maxTokens: number;
  compressionRatio: number;
}

export interface ContextOptimizationResult {
  originalLength: number;
  optimizedLength: number;
  compressionRatio: number;
  preservedElements: string[];
  mode: DevelopmentMode;
  timestamp: number;
}

export interface UsageAnalysisEvent {
  mode: DevelopmentMode;
  avgTokens: number;
  maxTokens: number;
  history: TokenUsageRecord[];
}

export interface TokenUsageRecord {
  timestamp: number;
  tokens: number;
  mode: DevelopmentMode;
  contextLength: number;
}

export interface CompressionStrategy {
  name: string;
  priority: number;
  apply: (context: string) => Promise<string>;
}
