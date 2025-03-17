import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Logger, LogLevel, ComponentLogger, useLogger } from './logger';

describe('Logger Utility', () => {
  // Spy on console methods
  const originalConsole = { ...console };
  const consoleSpies = {
    debug: vi.spyOn(console, 'debug').mockImplementation(() => {}),
    info: vi.spyOn(console, 'info').mockImplementation(() => {}),
    warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
    error: vi.spyOn(console, 'error').mockImplementation(() => {}),
    log: vi.spyOn(console, 'log').mockImplementation(() => {}),
    groupCollapsed: vi.spyOn(console, 'groupCollapsed').mockImplementation(() => {}),
    groupEnd: vi.spyOn(console, 'groupEnd').mockImplementation(() => {}),
  };

  // Mock fetch for remote logging tests
  global.fetch = vi.fn();

  // Mock performance for timer tests
  let mockTime = 1000;
  global.performance.now = vi.fn(() => mockTime);

  // Reset mocks before each test
  beforeEach(() => {
    mockTime = 1000;
    vi.clearAllMocks();
    
    // Reset Logger singleton for each test
    // @ts-ignore - accessing private property for testing
    Logger.instance = undefined;
  });

  // Restore original console after all tests
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Logger Class', () => {
    it('creates a singleton instance', () => {
      const logger1 = Logger.getInstance();
      const logger2 = Logger.getInstance();
      
      expect(logger1).toBe(logger2);
    });

    it('logs messages at different levels', () => {
      const logger = Logger.getInstance({ enableRemote: false });
      
      logger.debug('Debug message');
      logger.info('Info message');
      logger.warn('Warning message');
      logger.error('Error message');
      logger.fatal('Fatal message');
      
      expect(consoleSpies.debug).toHaveBeenCalledWith(
        expect.stringContaining('[DEBUG]'),
        expect.any(String),
        expect.any(String)
      );
      expect(consoleSpies.info).toHaveBeenCalledWith(
        expect.stringContaining('[INFO]'),
        expect.any(String),
        expect.any(String)
      );
      expect(consoleSpies.warn).toHaveBeenCalledWith(
        expect.stringContaining('[WARN]'),
        expect.any(String),
        expect.any(String)
      );
      expect(consoleSpies.error).toHaveBeenCalledWith(
        expect.stringContaining('[ERROR]'),
        expect.any(String),
        expect.any(String)
      );
      expect(consoleSpies.error).toHaveBeenCalledWith(
        expect.stringContaining('[FATAL]'),
        expect.any(String),
        expect.any(String)
      );
    });

    it('respects minimum log level configuration', () => {
      const logger = Logger.getInstance({ 
        minLevel: LogLevel.WARN,
        enableRemote: false
      });
      
      logger.debug('Debug message');
      logger.info('Info message');
      logger.warn('Warning message');
      
      expect(consoleSpies.debug).not.toHaveBeenCalled();
      expect(consoleSpies.info).not.toHaveBeenCalled();
      expect(consoleSpies.warn).toHaveBeenCalled();
    });

    it('includes component name in logs', () => {
      const logger = Logger.getInstance({ enableRemote: false });
      
      logger.info('Test message', 'TestComponent');
      
      expect(consoleSpies.info).toHaveBeenCalledWith(
        expect.stringContaining('[TestComponent]'),
        expect.any(String),
        expect.any(String)
      );
    });

    it('includes additional data in logs', () => {
      const logger = Logger.getInstance({ enableRemote: false });
      const testData = { key: 'value' };
      
      logger.info('Test message', 'TestComponent', testData);
      
      expect(consoleSpies.info).toHaveBeenCalledWith(
        expect.stringContaining('[INFO]'),
        expect.any(String),
        expect.any(String),
        testData
      );
    });

    it('adds stack trace for error and fatal logs', () => {
      const logger = Logger.getInstance({ 
        enableRemote: false,
        includeStackTrace: true
      });
      
      logger.error('Error message');
      
      expect(consoleSpies.groupCollapsed).toHaveBeenCalledWith('Stack trace');
      expect(consoleSpies.log).toHaveBeenCalled();
      expect(consoleSpies.groupEnd).toHaveBeenCalled();
    });

    it('tracks elapsed time with timers', () => {
      const logger = Logger.getInstance({ enableRemote: false });
      
      // Start timer
      logger.startTimer('testTimer');
      
      // Simulate time passing
      mockTime += 150;
      
      // End timer
      const duration = logger.endTimer('testTimer', LogLevel.INFO, 'Timer completed');
      
      expect(duration).toBe(150);
      expect(consoleSpies.info).toHaveBeenCalledWith(
        expect.stringContaining('[INFO]'),
        expect.any(String),
        expect.any(String),
        expect.objectContaining({
          duration: 150,
          timerId: 'testTimer'
        })
      );
    });

    it('warns when ending a non-existent timer', () => {
      const logger = Logger.getInstance({ enableRemote: false });
      
      const duration = logger.endTimer('nonExistentTimer');
      
      expect(duration).toBeUndefined();
      expect(consoleSpies.warn).toHaveBeenCalledWith(
        expect.stringContaining('Timer "nonExistentTimer" does not exist'),
        expect.any(String),
        expect.any(String)
      );
    });

    it('queues logs for remote logging when enabled', async () => {
      const logger = Logger.getInstance({ 
        enableRemote: true,
        remoteUrl: 'https://example.com/logs',
        batchSize: 2
      });
      
      // Mock implementation of fetch to return a successful response
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });
      
      logger.info('First log');
      expect(global.fetch).not.toHaveBeenCalled();
      
      logger.info('Second log');
      expect(global.fetch).toHaveBeenCalledWith(
        'https://example.com/logs',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: expect.any(String),
        })
      );
      
      const body = JSON.parse((global.fetch as any).mock.calls[0][1].body);
      expect(body.logs.length).toBe(2);
      expect(body.logs[0].message).toBe('First log');
      expect(body.logs[1].message).toBe('Second log');
    });

    it('flushes logs manually when called', async () => {
      const logger = Logger.getInstance({ 
        enableRemote: true,
        remoteUrl: 'https://example.com/logs',
        batchSize: 10 // Large batch size to prevent auto-flush
      });
      
      // Mock implementation of fetch to return a successful response
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });
      
      logger.info('Test log');
      expect(global.fetch).not.toHaveBeenCalled();
      
      await logger.flush();
      expect(global.fetch).toHaveBeenCalled();
    });

    it('handles fetch errors gracefully', async () => {
      const logger = Logger.getInstance({ 
        enableRemote: true,
        remoteUrl: 'https://example.com/logs'
      });
      
      // Mock implementation of fetch to throw an error
      (global.fetch as any).mockRejectedValue(new Error('Network error'));
      
      // Mock document readyState
      Object.defineProperty(document, 'readyState', {
        value: 'complete',
        writable: true
      });
      
      logger.info('Test log');
      await logger.flush();
      
      expect(consoleSpies.error).toHaveBeenCalledWith(
        'Failed to send logs to remote endpoint:',
        expect.any(Error)
      );
      
      // Logs should be re-added to the queue
      logger.info('Another log');
      await logger.flush();
      
      // The requeued log and the new one should be sent
      expect((global.fetch as any).mock.calls[1][1].body).toContain('Test log');
      expect((global.fetch as any).mock.calls[1][1].body).toContain('Another log');
    });
  });

  describe('ComponentLogger', () => {
    it('creates a component-specific logger', () => {
      const mainLogger = Logger.getInstance({ enableRemote: false });
      const componentLogger = mainLogger.createComponentLogger('TestComponent');
      
      expect(componentLogger).toBeInstanceOf(ComponentLogger);
    });

    it('prefixes logs with component name', () => {
      const mainLogger = Logger.getInstance({ enableRemote: false });
      const componentLogger = mainLogger.createComponentLogger('TestComponent');
      
      componentLogger.info('Component message');
      
      expect(consoleSpies.info).toHaveBeenCalledWith(
        expect.stringContaining('[TestComponent]'),
        expect.any(String),
        expect.any(String)
      );
    });

    it('prefixes timer IDs with component name', () => {
      const mainLogger = Logger.getInstance({ enableRemote: false });
      const componentLogger = mainLogger.createComponentLogger('TestComponent');
      
      componentLogger.startTimer('componentTimer');
      
      // Simulate time passing
      mockTime += 100;
      
      componentLogger.endTimer('componentTimer');
      
      expect(consoleSpies.debug).toHaveBeenCalledWith(
        expect.stringContaining('TestComponent:componentTimer'),
        expect.any(String),
        expect.any(String),
        expect.objectContaining({
          timerId: 'TestComponent:componentTimer'
        })
      );
    });
  });

  describe('useLogger Hook', () => {
    it('returns a component logger for the specified component', () => {
      const componentLogger = useLogger('HookComponent');
      
      componentLogger.info('Hook message');
      
      expect(consoleSpies.info).toHaveBeenCalledWith(
        expect.stringContaining('[HookComponent]'),
        expect.any(String),
        expect.any(String)
      );
    });
  });
}); 