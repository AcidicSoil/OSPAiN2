export interface LogEntry {
  id: string;
  timestamp: number; // Unix timestamp in milliseconds
  level: "debug" | "info" | "warn" | "error";
  message: string;
  source: string;
  metadata?: Record<string, any>;
}

export interface DebugSessionInfo {
  id: string;
  startTime: number; // Unix timestamp in milliseconds
  endTime?: number; // Unix timestamp in milliseconds
  logs: LogEntry[];
  tags: string[];
}

export interface LogFilter {
  sessionId?: string;
  level?: LogEntry["level"];
  source?: string;
  search?: string;
  startTime?: number;
  endTime?: number;
}
