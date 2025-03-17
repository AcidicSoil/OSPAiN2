/**
 * OSPAiN2 Frontend Logging System
 * 
 * A comprehensive logging utility that provides structured logging with:
 * - Multiple log levels (DEBUG, INFO, WARN, ERROR, FATAL)
 * - Context/component tagging
 * - Console and remote logging
 * - Performance tracking
 * - Production/development mode awareness
 * - Session tracking
 */

// Log level definitions
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
}

// Log level name mapping
const LOG_LEVEL_NAMES: Record<LogLevel, string> = {
  [LogLevel.DEBUG]: 'DEBUG',
  [LogLevel.INFO]: 'INFO',
  [LogLevel.WARN]: 'WARN',
  [LogLevel.ERROR]: 'ERROR',
  [LogLevel.FATAL]: 'FATAL',
};

// Console styling for different log levels
const LOG_LEVEL_STYLES: Record<LogLevel, string> = {
  [LogLevel.DEBUG]: 'color: #6c757d',
  [LogLevel.INFO]: 'color: #0d6efd',
  [LogLevel.WARN]: 'color: #ffc107; font-weight: bold',
  [LogLevel.ERROR]: 'color: #dc3545; font-weight: bold',
  [LogLevel.FATAL]: 'color: #fff; background: #dc3545; font-weight: bold; padding: 2px 5px; border-radius: 3px',
};

// Logger configuration interface
interface LoggerConfig {
  minLevel: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
  remoteUrl?: string;
  batchSize?: number;
  includeTimestamps: boolean;
  sessionId?: string;
  includeStackTrace: boolean;
  context?: Record<string, any>;
}

// Log entry interface
interface LogEntry {
  timestamp: string;
  level: LogLevel;
  levelName: string;
  message: string;
  component?: string;
  context?: Record<string, any>;
  data?: any;
  sessionId?: string;
  stackTrace?: string;
  userId?: string;
  duration?: number;
}

// Default configuration
const DEFAULT_CONFIG: LoggerConfig = {
  minLevel: process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG,
  enableConsole: true,
  enableRemote: process.env.NODE_ENV === 'production',
  remoteUrl: process.env.VITE_LOG_ENDPOINT,
  batchSize: 10,
  includeTimestamps: true,
  includeStackTrace: process.env.NODE_ENV !== 'production',
  sessionId: generateSessionId(),
};

// Main Logger class
export class Logger {
  private static instance: Logger;
  private config: LoggerConfig;
  private logQueue: LogEntry[] = [];
  private timers: Record<string, number> = {};
  private userId?: string;
  private flushInterval?: number;

  /**
   * Private constructor - use Logger.getInstance()
   */
  private constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    // Set up remote logging if enabled
    if (this.config.enableRemote && this.config.remoteUrl) {
      this.setupRemoteLogging();
    }
    
    // Set up unload handler to flush logs before page close
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => this.flush());
    }
  }

  /**
   * Get singleton logger instance
   */
  public static getInstance(config: Partial<LoggerConfig> = {}): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(config);
    }
    return Logger.instance;
  }

  /**
   * Set user ID for tracking
   */
  public setUserId(userId: string): void {
    this.userId = userId;
  }

  /**
   * Update logger configuration
   */
  public configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
    
    // Re-setup remote logging if config changed
    if (this.config.enableRemote && this.config.remoteUrl) {
      this.setupRemoteLogging();
    } else if (!this.config.enableRemote && this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = undefined;
    }
  }

  /**
   * Main log method
   */
  public log(
    level: LogLevel,
    message: string,
    component?: string,
    data?: any
  ): void {
    // Skip if log level is below minimum
    if (level < this.config.minLevel) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      levelName: LOG_LEVEL_NAMES[level],
      message,
      component,
      data,
      sessionId: this.config.sessionId,
      userId: this.userId,
    };

    // Add stack trace for errors if enabled
    if (this.config.includeStackTrace && (level === LogLevel.ERROR || level === LogLevel.FATAL)) {
      entry.stackTrace = new Error().stack?.split('\n').slice(2).join('\n');
    }

    // Add global context if any
    if (this.config.context) {
      entry.context = { ...this.config.context };
    }

    // Log to console
    if (this.config.enableConsole) {
      this.logToConsole(entry);
    }

    // Queue for remote logging
    if (this.config.enableRemote) {
      this.logQueue.push(entry);
      
      // Flush if we've hit batch size
      if (this.logQueue.length >= (this.config.batchSize || 10)) {
        this.flush();
      }
    }

    // If fatal, flush immediately
    if (level === LogLevel.FATAL) {
      this.flush();
    }
  }

  /**
   * Debug log
   */
  public debug(message: string, component?: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, component, data);
  }

  /**
   * Info log
   */
  public info(message: string, component?: string, data?: any): void {
    this.log(LogLevel.INFO, message, component, data);
  }

  /**
   * Warning log
   */
  public warn(message: string, component?: string, data?: any): void {
    this.log(LogLevel.WARN, message, component, data);
  }

  /**
   * Error log
   */
  public error(message: string, component?: string, data?: any): void {
    this.log(LogLevel.ERROR, message, component, data);
  }

  /**
   * Fatal log
   */
  public fatal(message: string, component?: string, data?: any): void {
    this.log(LogLevel.FATAL, message, component, data);
  }

  /**
   * Start a timer for performance tracking
   */
  public startTimer(timerId: string): void {
    this.timers[timerId] = performance.now();
  }

  /**
   * End a timer and log the duration
   */
  public endTimer(
    timerId: string,
    level: LogLevel = LogLevel.DEBUG,
    message?: string,
    component?: string
  ): number | undefined {
    if (!(timerId in this.timers)) {
      this.warn(`Timer "${timerId}" does not exist`, 'Logger');
      return undefined;
    }

    const duration = performance.now() - this.timers[timerId];
    const logMessage = message || `Timer "${timerId}" completed`;
    
    this.log(level, logMessage, component, { duration, timerId });
    
    delete this.timers[timerId];
    return duration;
  }

  /**
   * Flush all queued logs to remote endpoint
   */
  public async flush(): Promise<void> {
    if (!this.config.enableRemote || !this.config.remoteUrl || this.logQueue.length === 0) {
      return;
    }

    const logs = [...this.logQueue];
    this.logQueue = [];

    try {
      await fetch(this.config.remoteUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ logs }),
        // Use keepalive to ensure logs get sent even if page is unloading
        keepalive: true,
      });
    } catch (error) {
      // Log to console as fallback, but don't add to queue to avoid loop
      console.error('Failed to send logs to remote endpoint:', error);
      
      // Re-add to queue only if not in unload state
      if (typeof document !== 'undefined' && document.readyState !== 'unloading') {
        this.logQueue.push(...logs);
      }
    }
  }

  /**
   * Create a component-specific logger
   */
  public createComponentLogger(componentName: string): ComponentLogger {
    return new ComponentLogger(this, componentName);
  }

  /**
   * Log to browser console with appropriate styling
   */
  private logToConsole(entry: LogEntry): void {
    const timestamp = this.config.includeTimestamps ? `[${entry.timestamp.split('T')[1].split('.')[0]}] ` : '';
    const component = entry.component ? `[${entry.component}] ` : '';
    const levelName = `[${entry.levelName}]`;
    
    const logFunctions = {
      [LogLevel.DEBUG]: console.debug,
      [LogLevel.INFO]: console.info,
      [LogLevel.WARN]: console.warn,
      [LogLevel.ERROR]: console.error,
      [LogLevel.FATAL]: console.error,
    };

    const logFn = logFunctions[entry.level];
    const style = LOG_LEVEL_STYLES[entry.level];
    
    if (entry.data) {
      logFn(`${timestamp}%c${levelName}%c ${component}${entry.message}`, style, '', entry.data);
    } else {
      logFn(`${timestamp}%c${levelName}%c ${component}${entry.message}`, style, '');
    }
    
    // Show stack trace for errors
    if (entry.stackTrace) {
      console.groupCollapsed('Stack trace');
      console.log(entry.stackTrace);
      console.groupEnd();
    }
  }

  /**
   * Setup interval for remote logging
   */
  private setupRemoteLogging(): void {
    // Clear existing interval if any
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    
    // Setup new interval
    this.flushInterval = window.setInterval(() => this.flush(), 30000) as unknown as number;
  }
}

/**
 * Component-specific logger
 * Creates a logger instance pre-configured with a component name
 */
export class ComponentLogger {
  private logger: Logger;
  private componentName: string;

  constructor(logger: Logger, componentName: string) {
    this.logger = logger;
    this.componentName = componentName;
  }

  public debug(message: string, data?: any): void {
    this.logger.debug(message, this.componentName, data);
  }

  public info(message: string, data?: any): void {
    this.logger.info(message, this.componentName, data);
  }

  public warn(message: string, data?: any): void {
    this.logger.warn(message, this.componentName, data);
  }

  public error(message: string, data?: any): void {
    this.logger.error(message, this.componentName, data);
  }

  public fatal(message: string, data?: any): void {
    this.logger.fatal(message, this.componentName, data);
  }

  public startTimer(timerId: string): void {
    this.logger.startTimer(`${this.componentName}:${timerId}`);
  }

  public endTimer(
    timerId: string,
    level: LogLevel = LogLevel.DEBUG,
    message?: string
  ): number | undefined {
    return this.logger.endTimer(
      `${this.componentName}:${timerId}`,
      level,
      message,
      this.componentName
    );
  }
}

/**
 * Generate a unique session ID
 */
function generateSessionId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// Default logger instance
export const logger = Logger.getInstance();

// React hook for component-based logging
export function useLogger(componentName: string): ComponentLogger {
  return logger.createComponentLogger(componentName);
}

// Export singleton for global use
export default logger; 