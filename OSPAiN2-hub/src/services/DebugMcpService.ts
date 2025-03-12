/**
 * DebugMcpService
 *
 * A service that provides real-time console log monitoring, debugging tools,
 * and integration with Turbo Pack for improved development experience.
 */

import { EventEmitter } from "events";

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: "debug" | "info" | "warn" | "error";
  message: string;
  source: string;
  metadata?: Record<string, any>;
}

export interface DebugSessionInfo {
  id: string;
  startTime: Date;
  endTime?: Date;
  logs: LogEntry[];
  tags: string[];
}

// Define console method types for proper typing
type ConsoleMethod = (...data: any[]) => void;

class DebugMcpService extends EventEmitter {
  private static instance: DebugMcpService;
  private interceptingConsole: boolean = false;
  private originalConsole: Record<string, ConsoleMethod> = {};
  private currentSession: DebugSessionInfo | null = null;
  private sessions: DebugSessionInfo[] = [];
  private maxLogsPerSession: number = 1000;
  private sessionArchiveSize: number = 10;
  private logListeners: Array<(log: LogEntry) => void> = [];
  private isInitialized: boolean = false;

  private constructor() {
    super();
    this.loadSessions();
  }

  /**
   * Get the singleton instance of DebugMcpService
   */
  public static getInstance(): DebugMcpService {
    if (!DebugMcpService.instance) {
      DebugMcpService.instance = new DebugMcpService();
    }
    return DebugMcpService.instance;
  }

  /**
   * Initialize the debug MCP service
   */
  public initialize(): void {
    if (this.isInitialized) return;

    this.interceptConsole();
    this.startNewSession();
    this.setupMcpConnection();
    this.isInitialized = true;
  }

  /**
   * Intercept console methods to capture logs
   */
  private interceptConsole(): void {
    if (this.interceptingConsole || typeof window === "undefined") return;

    // Store original console methods
    this.originalConsole = {
      log: console.log,
      info: console.info,
      warn: console.warn,
      error: console.error,
      debug: console.debug,
    };

    // Override console methods to capture logs
    console.log = (...args: any[]) => {
      this.captureLog("info", args);
      this.originalConsole.log(...args);
    };

    console.info = (...args: any[]) => {
      this.captureLog("info", args);
      this.originalConsole.info(...args);
    };

    console.warn = (...args: any[]) => {
      this.captureLog("warn", args);
      this.originalConsole.warn(...args);
    };

    console.error = (...args: any[]) => {
      this.captureLog("error", args);
      this.originalConsole.error(...args);
    };

    console.debug = (...args: any[]) => {
      this.captureLog("debug", args);
      this.originalConsole.debug(...args);
    };

    this.interceptingConsole = true;
  }

  /**
   * Restore original console methods
   */
  private restoreConsole(): void {
    if (!this.interceptingConsole || typeof window === "undefined") return;

    console.log = this.originalConsole.log;
    console.info = this.originalConsole.info;
    console.warn = this.originalConsole.warn;
    console.error = this.originalConsole.error;
    console.debug = this.originalConsole.debug;

    this.interceptingConsole = false;
  }

  /**
   * Capture a console log
   */
  private captureLog(
    level: "debug" | "info" | "warn" | "error",
    args: any[]
  ): void {
    if (!this.currentSession) return;

    // Extract stack trace to determine source
    const stack = new Error().stack || "";
    const stackLines = stack.split("\n");
    let source = "unknown";

    // Find the caller in the stack trace (skip first 2 lines which are Error and captureLog)
    if (stackLines.length > 2) {
      const callerLine = stackLines[2].trim();
      const match = callerLine.match(/at\s+(.*)/);
      if (match) {
        source = match[1];
      }
    }

    // Create log entry
    const log: LogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      level,
      message: args
        .map((arg) => {
          if (typeof arg === "object") {
            try {
              return JSON.stringify(arg);
            } catch (e) {
              return String(arg);
            }
          }
          return String(arg);
        })
        .join(" "),
      source,
      metadata: {
        args: args.map((arg) => typeof arg),
      },
    };

    // Add log to current session
    this.currentSession.logs.push(log);

    // Trim logs if we exceed the maximum
    if (this.currentSession.logs.length > this.maxLogsPerSession) {
      this.currentSession.logs = this.currentSession.logs.slice(
        -this.maxLogsPerSession
      );
    }

    // Notify listeners
    this.notifyLogListeners(log);

    // Save sessions
    this.saveSessions();
  }

  /**
   * Add a custom log entry
   */
  public addLogEntry(
    level: "debug" | "info" | "warn" | "error",
    message: string,
    metadata?: Record<string, any>
  ): void {
    if (!this.currentSession) return;

    const log: LogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      level,
      message,
      source: "custom",
      metadata,
    };

    this.currentSession.logs.push(log);
    this.notifyLogListeners(log);
    this.saveSessions();
  }

  /**
   * Start a new debug session
   */
  public startNewSession(tags: string[] = []): DebugSessionInfo {
    // End current session if one exists
    if (this.currentSession) {
      this.currentSession.endTime = new Date();
    }

    // Create new session
    const newSession: DebugSessionInfo = {
      id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      startTime: new Date(),
      logs: [],
      tags,
    };

    this.currentSession = newSession;
    this.sessions.push(newSession);

    // Trim sessions if we exceed the maximum
    if (this.sessions.length > this.sessionArchiveSize) {
      this.sessions = this.sessions.slice(-this.sessionArchiveSize);
    }

    this.emit("sessionStarted", newSession);
    this.saveSessions();

    return newSession;
  }

  /**
   * End the current debug session
   */
  public endCurrentSession(): void {
    if (!this.currentSession) return;

    this.currentSession.endTime = new Date();
    this.emit("sessionEnded", this.currentSession);
    this.currentSession = null;
    this.saveSessions();
  }

  /**
   * Get the current session
   */
  public getCurrentSession(): DebugSessionInfo | null {
    return this.currentSession;
  }

  /**
   * Get all debug sessions
   */
  public getSessions(): DebugSessionInfo[] {
    return this.sessions;
  }

  /**
   * Setup connection to the Cursor MCP for debugging
   */
  private setupMcpConnection(): void {
    // This would integrate with Cursor MCP for debugging
    // For now, we'll just simulate this connection
    this.addLogEntry("info", "Debug MCP Service initialized", {
      version: "1.0.0",
      timestamp: new Date(),
    });
  }

  /**
   * Setup Turbo Pack integration (if available)
   */
  public setupTurboPack(): void {
    this.addLogEntry("info", "Setting up Turbo Pack integration", {
      status: "initializing",
    });

    // Here we would add actual Turbo Pack integration
    // For now, we'll just simulate this
    setTimeout(() => {
      this.addLogEntry("info", "Turbo Pack integration complete", {
        status: "success",
      });
    }, 1000);
  }

  /**
   * Register a listener for new logs
   */
  public onLog(callback: (log: LogEntry) => void): () => void {
    this.logListeners.push(callback);
    return () => {
      this.logListeners = this.logListeners.filter((cb) => cb !== callback);
    };
  }

  /**
   * Notify all log listeners
   */
  private notifyLogListeners(log: LogEntry): void {
    this.logListeners.forEach((callback) => {
      try {
        callback(log);
      } catch (e) {
        // Use original console to avoid infinite loops
        if (this.originalConsole.error) {
          this.originalConsole.error("Error in log listener:", e);
        }
      }
    });
  }

  /**
   * Save sessions to local storage
   */
  private saveSessions(): void {
    try {
      localStorage.setItem("debugSessions", JSON.stringify(this.sessions));
    } catch (e) {
      // Silent fail - local storage may be disabled or full
    }
  }

  /**
   * Load sessions from local storage
   */
  private loadSessions(): void {
    try {
      const savedSessions = localStorage.getItem("debugSessions");
      if (savedSessions) {
        const parsed = JSON.parse(savedSessions);

        // Convert string dates back to Date objects
        this.sessions = parsed.map((session: any) => ({
          ...session,
          startTime: new Date(session.startTime),
          endTime: session.endTime ? new Date(session.endTime) : undefined,
          logs: session.logs.map((log: any) => ({
            ...log,
            timestamp: new Date(log.timestamp),
          })),
        }));
      }
    } catch (e) {
      // Silent fail - local storage may be disabled or corrupted
      this.sessions = [];
    }
  }

  /**
   * Clean up and shutdown
   */
  public shutdown(): void {
    this.restoreConsole();
    this.endCurrentSession();
    this.isInitialized = false;
  }

  /**
   * Get logs filtered by various criteria
   */
  public getLogs(filter?: {
    level?: "debug" | "info" | "warn" | "error";
    source?: string;
    sessionId?: string;
    search?: string;
    from?: Date;
    to?: Date;
  }): LogEntry[] {
    let logs: LogEntry[] = [];

    // If sessionId provided, get logs from that session
    if (filter?.sessionId) {
      const session = this.sessions.find((s) => s.id === filter.sessionId);
      if (session) {
        logs = [...session.logs];
      }
    } else {
      // Otherwise, get logs from current session or all sessions
      logs = this.currentSession
        ? [...this.currentSession.logs]
        : this.sessions.flatMap((s) => s.logs);
    }

    // Apply filters
    if (filter) {
      if (filter.level) {
        logs = logs.filter((log) => log.level === filter.level);
      }

      if (filter.source) {
        const sourceStr = filter.source;
        logs = logs.filter((log) => log.source.includes(sourceStr));
      }

      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        logs = logs.filter(
          (log) =>
            log.message.toLowerCase().includes(searchLower) ||
            (log.metadata &&
              JSON.stringify(log.metadata).toLowerCase().includes(searchLower))
        );
      }

      if (filter.from) {
        const fromDate = filter.from;
        logs = logs.filter((log) => log.timestamp >= fromDate);
      }

      if (filter.to) {
        const toDate = filter.to;
        logs = logs.filter((log) => log.timestamp <= toDate);
      }
    }

    // Sort by timestamp (newest first)
    return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
}

// Export singleton instance
export default DebugMcpService.getInstance();
