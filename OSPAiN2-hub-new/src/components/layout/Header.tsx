import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '../../store';
import { useLogger } from '../../utils/logger';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { toggleSidebar, toggleTheme, theme } = useUIStore();
  const logger = useLogger('Header');
  
  useEffect(() => {
    logger.debug('Header rendered', { theme });
  }, [theme, logger]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    logger.info('Search executed', { query: searchQuery });
    // Implement search functionality
    console.log('Search query:', searchQuery);
  };
  
  const handleNotificationsClick = () => {
    logger.debug('Notifications clicked');
    // Implement notifications functionality
    console.log('Notifications clicked');
  };
  
  const handleThemeToggle = () => {
    logger.info('Theme toggled', { 
      previousTheme: theme, 
      newTheme: theme === 'light' ? 'dark' : 'light' 
    });
    toggleTheme();
  };
  
  const handleSidebarToggle = () => {
    logger.debug('Sidebar toggle triggered');
    toggleSidebar();
  };
  
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm h-16 flex items-center justify-between px-6 z-10">
      <div className="flex items-center">
        <button
          onClick={handleSidebarToggle}
          className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 focus:outline-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        
        <div className="ml-4 text-xl font-bold text-primary-600 dark:text-primary-400">
          OSPAiN2-Hub
        </div>
      </div>
      
      <div className="flex-1 max-w-xl mx-6">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            type="submit"
            className="absolute right-0 top-0 h-full px-4 text-gray-500 dark:text-gray-400"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        </form>
      </div>
      
      <div className="flex items-center space-x-4">
        <button
          onClick={handleThemeToggle}
          className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 focus:outline-none"
        >
          {theme === 'light' ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          )}
        </button>
        
        <button
          onClick={handleNotificationsClick}
          className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 focus:outline-none relative"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
        </button>
        
        <div className="relative">
          <button className="flex items-center space-x-2 focus:outline-none">
            <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white">
              <span className="text-sm font-medium">U</span>
            </div>
            <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-300">
              User
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header; 