import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock window
const windowMock = {
  requestIdleCallback: (callback: IdleRequestCallback) => setTimeout(() => callback({ didTimeout: false, timeRemaining: () => 0 }), 0),
  cancelIdleCallback: vi.fn(),
  setInterval: vi.fn(),
  clearInterval: vi.fn(),
  performance: {
    getEntriesByType: () => [],
    timing: {
      navigationStart: 0,
      domContentLoadedEventEnd: 100,
      loadEventEnd: 200,
      domainLookupEnd: 50,
      domainLookupStart: 0,
      connectEnd: 75,
      connectStart: 50,
    },
  },
};

// Mock document
const documentMock = {
  documentElement: {
    classList: {
      add: vi.fn(),
      remove: vi.fn(),
    },
  },
};

// Setup global mocks
Object.defineProperty(global, 'window', {
  value: windowMock,
  writable: true,
});

Object.defineProperty(global, 'document', {
  value: documentMock,
  writable: true,
});

// Mock console methods
global.console = {
  ...console,
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  groupCollapsed: vi.fn(),
  groupEnd: vi.fn(),
};

// Mock fetch
global.fetch = vi.fn();

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
}); 