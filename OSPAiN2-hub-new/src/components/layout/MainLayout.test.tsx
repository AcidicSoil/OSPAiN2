import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MainLayout from './MainLayout';
import * as loggerModule from '../../utils/logger';

// Mock the child components
vi.mock('./Header', () => ({
  default: () => <div data-testid="header-component">Header Component</div>,
}));

vi.mock('./Sidebar', () => ({
  default: () => <div data-testid="sidebar-component">Sidebar Component</div>,
}));

// Mock the Outlet component
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Outlet: () => <div data-testid="outlet-component">Outlet Content</div>,
  };
});

describe('MainLayout Component', () => {
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
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { getByTestId } = render(
      <MemoryRouter>
        <MainLayout />
      </MemoryRouter>
    );
    
    expect(getByTestId('header-component')).toBeInTheDocument();
    expect(getByTestId('sidebar-component')).toBeInTheDocument();
    expect(getByTestId('outlet-component')).toBeInTheDocument();
  });

  it('initializes logger with correct component name', () => {
    render(
      <MemoryRouter>
        <MainLayout />
      </MemoryRouter>
    );
    
    expect(useLoggerSpy).toHaveBeenCalledWith('MainLayout');
  });

  it('logs main layout rendered', () => {
    render(
      <MemoryRouter>
        <MainLayout />
      </MemoryRouter>
    );
    
    expect(mockComponentLogger.info).toHaveBeenCalledWith('Main layout rendered');
  });

  it('starts layout render timer', () => {
    render(
      <MemoryRouter>
        <MainLayout />
      </MemoryRouter>
    );
    
    expect(mockComponentLogger.startTimer).toHaveBeenCalledWith('layoutRender');
  });

  it('ends layout render timer on unmount', () => {
    const { unmount } = render(
      <MemoryRouter>
        <MainLayout />
      </MemoryRouter>
    );
    
    unmount();
    
    expect(mockComponentLogger.endTimer).toHaveBeenCalledWith(
      'layoutRender',
      2,
      'Layout render completed'
    );
  });
}); 