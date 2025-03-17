import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Sidebar from './Sidebar';
import * as loggerModule from '../../utils/logger';
import * as storeModule from '../../store';

// Mock the store
vi.mock('../../store', () => ({
  useUIStore: vi.fn().mockReturnValue({
    sidebarOpen: true,
    toggleSidebar: vi.fn(),
  }),
}));

describe('Sidebar Component', () => {
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
    const { container } = render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );
    
    expect(container).toBeTruthy();
  });

  it('initializes logger with correct component name', () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );
    
    expect(useLoggerSpy).toHaveBeenCalledWith('Sidebar');
  });

  it('logs sidebar rendered with correct path and state', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Sidebar />
      </MemoryRouter>
    );
    
    expect(mockComponentLogger.debug).toHaveBeenCalledWith(
      'Sidebar rendered', 
      expect.objectContaining({
        path: '/',
        sidebarOpen: true
      })
    );
  });

  it('logs navigation changes', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Sidebar />
      </MemoryRouter>
    );
    
    expect(mockComponentLogger.info).toHaveBeenCalledWith(
      'Navigation changed', 
      expect.objectContaining({
        path: '/',
        component: 'Sidebar'
      })
    );
  });

  it('logs sidebar state changes', () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );
    
    expect(mockComponentLogger.debug).toHaveBeenCalledWith(
      'Sidebar state changed', 
      expect.objectContaining({
        isOpen: true
      })
    );
  });

  it('starts and ends navigation render timer', () => {
    const { unmount } = render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );
    
    expect(mockComponentLogger.startTimer).toHaveBeenCalledWith('navigationRender');
    
    unmount();
    
    expect(mockComponentLogger.endTimer).toHaveBeenCalledWith(
      'navigationRender',
      2,
      'Navigation menu render completed'
    );
  });

  it('logs sidebar state changes when sidebarOpen changes', () => {
    // First render with sidebarOpen as true
    const { rerender } = render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );
    
    vi.clearAllMocks();
    
    // Mock sidebarOpen as false for the rerender
    vi.mocked(storeModule.useUIStore).mockReturnValue({
      sidebarOpen: false,
      toggleSidebar: vi.fn(),
    });
    
    // Rerender with the updated store value
    rerender(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );
    
    expect(mockComponentLogger.debug).toHaveBeenCalledWith(
      'Sidebar state changed', 
      expect.objectContaining({
        isOpen: false
      })
    );
  });
}); 