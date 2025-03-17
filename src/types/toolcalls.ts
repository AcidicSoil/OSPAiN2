/**
 * Types for Tool Call Window Component
 * Defines data structures for visualizing and tracking tool calls
 */

// Tool Call Status
export enum ToolCallStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

// Tool Call Data
export interface ToolCall {
  id: string;
  name: string;
  timestamp: number;
  status: ToolCallStatus;
  duration?: number; // In milliseconds
  parameters?: Record<string, any>;
  result?: any;
  error?: string;
}

// Tool Call Session
export interface ToolCallSession {
  id: string;
  startTime: number;
  endTime?: number;
  toolCalls: ToolCall[];
  totalCalls: number;
  completedCalls: number;
  failedCalls: number;
  active: boolean;
}

// Tool Call Analytics
export interface ToolCallAnalytics {
  totalCalls: number;
  averageDuration: number;
  successRate: number;
  mostUsedTools: Array<{name: string, count: number}>;
  failureRate: number;
}

// Tool Call Filter Options
export interface ToolCallFilterOptions {
  status?: ToolCallStatus[];
  toolNames?: string[];
  timeRange?: {start: number, end: number};
  search?: string;
}

// Tool Call Window Props
export interface ToolCallWindowProps {
  session?: ToolCallSession;
  maxCalls?: number; // Maximum allowed calls (default: 25)
  onClearHistory?: () => void;
  onFilterChange?: (filter: ToolCallFilterOptions) => void;
  collapsed?: boolean;
  showAnalytics?: boolean;
  height?: string | number;
  width?: string | number;
}

// Tool Call Service Interface
export interface ToolCallService {
  trackCall: (name: string, parameters?: Record<string, any>) => string; // Returns call ID
  updateCallStatus: (id: string, status: ToolCallStatus, result?: any, error?: string) => void;
  getSession: () => ToolCallSession;
  clearSession: () => void;
  getAnalytics: () => ToolCallAnalytics;
} 