import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import App from './App';
import * as loggerModule from './utils/logger';

// Mock the router components to avoid actual routing
vi.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }: { children: React.ReactNode }) => <div data-testid="router">{children}</div>,
  Routes: ({ children }: { children: React.ReactNode }) => <div data-testid="routes">{children}</div>,
  Route: ({ path, element }: { path: string; element: React.ReactNode }) => 
    <div data-testid={`route-${path}`}>{element}</div>,
}));

// Mock AppRoutes
vi.mock('./router', () => ({
  default: () => <div data-testid="app-routes">Mocked Routes</div>,
}));

// Mock the NotionProvider
vi.mock('./context/NotionContext', () => ({
  NotionProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="notion-provider">{children}</div>,
}));

// Mock useUIStore
vi.mock('./store', () => ({
  useUIStore: () => ({
    theme: 'light',
  }),
}));

describe('App Component', () => {
  // Spy on logger methods
  const mockComponentLogger = {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    fatal: vi.fn(),
    startTimer: vi.fn(),
    endTimer: vi.fn(),
  };

  // Spy on useLogger hook to return our mock
  const useLoggerSpy = vi.spyOn(loggerModule, 'useLogger').mockReturnValue(mockComponentLogger as any);

  // Mock requestIdleCallback and cancelIdleCallback
  beforeEach(() => {
    window.requestIdleCallback = vi.fn((callback: IdleRequestCallback) => {
      callback({
        didTimeout: false,
        timeRemaining: () => 50,
      });
      return 1;
    }) as any;
    
    window.cancelIdleCallback = vi.fn();
    
    // Mock performance API
    Object.defineProperty(window, 'performance', {
      value: {
        getEntriesByType: vi.fn().mockReturnValue([{
          domainLookupStart: 0,
          domainLookupEnd: 50,
          connectStart: 50,
          connectEnd: 100,
          domLoading: 100,
          domComplete: 500,
          startTime: 0,
          loadEventEnd: 600,
        }]),
      },
      writable: true,
    });
    
    // Clear mocks before each test
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { getByTestId } = render(<App />);
    
    expect(getByTestId('router')).toBeInTheDocument();
    expect(getByTestId('notion-provider')).toBeInTheDocument();
    expect(getByTestId('app-routes')).toBeInTheDocument();
  });

  it('initializes logger with correct component name', () => {
    render(<App />);
    
    expect(useLoggerSpy).toHaveBeenCalledWith('App');
  });

  it('logs application initialization', () => {
    render(<App />);
    
    expect(mockComponentLogger.info).toHaveBeenCalledWith(
      'Application initialized',
      expect.objectContaining({
        version: expect.any(String),
        environment: expect.any(String),
      })
    );
  });

  it('logs theme changes', () => {
    render(<App />);
    
    expect(mockComponentLogger.debug).toHaveBeenCalledWith(
      'Theme changed to light',
      { theme: 'light' }
    );
  });

  it('tracks initial render performance', () => {
    render(<App />);
    
    expect(mockComponentLogger.startTimer).toHaveBeenCalledWith('initialRender');
    expect(mockComponentLogger.endTimer).toHaveBeenCalledWith(
      'initialRender',
      2,
      'Initial render completed'
    );
  });

  it('logs performance metrics after idle callback', () => {
    render(<App />);
    
    expect(window.requestIdleCallback).toHaveBeenCalled();
    expect(mockComponentLogger.info).toHaveBeenCalledWith(
      'Page load performance',
      expect.objectContaining({
        dnsLookup: 50,
        tcpConnection: 50,
        documentLoad: 400,
        fullPageLoad: 600,
      })
    );
  });

  it('cleans up idle callback on unmount', () => {
    const { unmount } = render(<App />);
    unmount();
    
    expect(window.cancelIdleCallback).toHaveBeenCalledWith(1);
  });
}); 