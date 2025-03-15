import { DevelopmentMode } from '../modes';

export type RuleType = 'auto_applied' | 'manual' | 'agent_requested' | 'conditional';

export interface RuleFileInfo {
  id: string;
  filePath: string;
  currentType: RuleType;
  content: string;
}

export interface TokenContextConfig {
  maxTokens: number;
  reservedTokens: number;
  mode: DevelopmentMode;
}

export interface CompressedContext {
  tokens: number;
  content: string;
}

export interface ToolImplementation {
  execute: (params: any) => Promise<any>;
}

export interface ToolCall {
  name: string;
  parameters: Record<string, any>;
}

export interface ToolResponse {
  success: boolean;
  result: any;
  error?: string;
}

export interface CallTrackingService {
  trackCall: (call: ToolCall) => void;
  getCallHistory: () => ToolCall[];
}
