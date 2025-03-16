import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type ThemeOption = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: ThemeOption;
  currentTheme: 'light' | 'dark'; // The actual applied theme
  setTheme: (theme: ThemeOption) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Get the initial theme preference from localStorage or default to 'system'
  const [theme, setThemeState] = useState<ThemeOption>(() => {
    const savedTheme = localStorage.getItem('theme-preference');
    return (savedTheme as ThemeOption) || 'system';
  });

  // Determine the actual theme based on preference and system settings
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light');

  // Update the actual theme whenever the theme preference changes
  useEffect(() => {
    const updateActualTheme = () => {
      if (theme === 'system') {
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setCurrentTheme(systemPrefersDark ? 'dark' : 'light');
      } else {
        setCurrentTheme(theme);
      }
    };

    updateActualTheme();

    // Listen for system preference changes if theme is set to 'system'
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => updateActualTheme();
      
      // Add event listener with compatibility for older browsers
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handler);
      } else {
        // For Safari < 14
        mediaQuery.addListener(handler);
      }

      return () => {
        // Clean up with compatibility for older browsers
        if (mediaQuery.removeEventListener) {
          mediaQuery.removeEventListener('change', handler);
        } else {
          // For Safari < 14
          mediaQuery.removeListener(handler);
        }
      };
    }
  }, [theme]);

  // Update the document with the current theme
  useEffect(() => {
    document.documentElement.classList.remove('light-theme', 'dark-theme');
    document.documentElement.classList.add(`${currentTheme}-theme`);
  }, [currentTheme]);

  // Set theme and store in localStorage
  const setTheme = (newTheme: ThemeOption) => {
    setThemeState(newTheme);
    localStorage.setItem('theme-preference', newTheme);
  };

  // Toggle between light and dark themes
  const toggleTheme = () => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, currentTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook for using the theme context
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 