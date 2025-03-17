import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Header from './Header';
import * as loggerModule from '../../utils/logger';

// Mock the store
vi.mock('../../store', () => ({
  useUIStore: vi.fn().mockReturnValue({
    sidebarOpen: true,
    theme: 'light',
    toggleSidebar: vi.fn(),
    toggleTheme: vi.fn(),
  }),
}));

// Mock navigate function
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

describe('Header Component', () => {
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
        <Header />
      </MemoryRouter>
    );
    
    expect(container).toBeTruthy();
  });

  it('initializes logger with correct component name', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
    
    expect(useLoggerSpy).toHaveBeenCalledWith('Header');
  });

  it('logs header rendered with correct theme', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
    
    expect(mockComponentLogger.debug).toHaveBeenCalledWith(
      'Header rendered', 
      { theme: 'light' }
    );
  });

  it('logs search execution', () => {
    const { getByPlaceholderText, getByRole } = render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
    
    // Find search input and form
    const searchInput = getByPlaceholderText('Search...');
    const searchForm = searchInput.closest('form');
    
    // Type in search query
    fireEvent.change(searchInput, { target: { value: 'test query' } });
    
    // Submit the form
    if (searchForm) {
      fireEvent.submit(searchForm);
    }
    
    expect(mockComponentLogger.info).toHaveBeenCalledWith(
      'Search executed', 
      { query: 'test query' }
    );
  });

  it('logs notification click', () => {
    const { getAllByRole } = render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
    
    // Find the notifications button
    const buttons = getAllByRole('button');
    const notificationButton = buttons.find(
      button => button.innerHTML.includes('bell') || button.innerHTML.includes('notification')
    );
    
    if (notificationButton) {
      fireEvent.click(notificationButton);
      
      expect(mockComponentLogger.debug).toHaveBeenCalledWith('Notifications clicked');
    }
  });

  it('logs theme toggle', () => {
    const { getAllByRole } = render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
    
    // Find the theme toggle button
    const buttons = getAllByRole('button');
    const themeButton = buttons.find(
      button => button.innerHTML.includes('sun') || button.innerHTML.includes('moon')
    );
    
    if (themeButton) {
      fireEvent.click(themeButton);
      
      expect(mockComponentLogger.info).toHaveBeenCalledWith(
        'Theme toggled', 
        { previousTheme: 'light', newTheme: 'dark' }
      );
    }
  });

  it('logs sidebar toggle', () => {
    const { getAllByRole } = render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
    
    // Find the sidebar toggle button (usually the first button with hamburger icon)
    const buttons = getAllByRole('button');
    const sidebarButton = buttons[0];
    
    fireEvent.click(sidebarButton);
    
    expect(mockComponentLogger.debug).toHaveBeenCalledWith('Sidebar toggle triggered');
  });
}); 