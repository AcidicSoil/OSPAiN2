export interface LogEntry {
  timestamp: number;
  level: 'info' | 'warn' | 'error';
  message: string;
  context?: Record<string, any>;
}

export interface Session {
  id: string;
  startTime: number;
  endTime?: number;
  logs: LogEntry[];
}
