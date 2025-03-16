'use strict';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

/**
 * Header Component
 *
 * Top navigation bar that includes the sidebar toggle, application branding,
 * and user controls such as theme toggle and notifications.
 */
const Header = ({ toggleSidebar }) => {
  const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') === 'dark');

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');

    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Initialize dark mode based on localStorage or system preference
  useEffect(() => {
    if (
      localStorage.getItem('theme') === 'dark' ||
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      document.documentElement.classList.add('dark');
      setDarkMode(true);
    } else {
      document.documentElement.classList.remove('dark');
      setDarkMode(false);
    }
  }, []);

  return (
    <header className="fixed w-full z-30 bg-white dark:bg-gray-800 shadow-sm h-16">
      <div className="px-4 h-full flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700"
            aria-label="Toggle sidebar"
          >
            <MenuIcon />
          </button>

          <Link to="/" className="ml-4 flex items-center">
            <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">
              OSPAiN<span className="text-blue-600 dark:text-blue-400">₂</span>
            </span>
            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">v0.1.0</span>
          </Link>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </button>

          <button
            className="p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700"
            aria-label="Notifications"
          >
            <NotificationsIcon />
          </button>

          <button
            className="p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700"
            aria-label="User account"
          >
            <AccountCircleIcon />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
//# sourceMappingURL=Header.js.map
