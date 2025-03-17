import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import AppRoutes from './router';
import { useUIStore } from './store';
import { NotionProvider } from './context/NotionContext';
import { useLogger } from './utils/logger';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const { theme } = useUIStore();
  const logger = useLogger('App');
  
  // Log application initialization
  useEffect(() => {
    logger.info('Application initialized', { 
      version: import.meta.env.VITE_APP_VERSION || '0.1.0',
      environment: import.meta.env.MODE,
      buildTime: import.meta.env.VITE_BUILD_TIME || new Date().toISOString()
    });
    
    return () => {
      logger.info('Application unmounting');
    };
  }, []);
  
  // Apply theme class to html element
  useEffect(() => {
    logger.debug(`Theme changed to ${theme}`, { theme });
    
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);
  
  // Track performance
  useEffect(() => {
    // Start performance timer for initial render
    logger.startTimer('initialRender');
    
    // Use requestIdleCallback to measure when everything is loaded
    const idleCallback = window.requestIdleCallback ? 
      window.requestIdleCallback : 
      (callback: IdleRequestCallback) => setTimeout(callback, 100);
    
    const idleCallbackId = idleCallback(() => {
      logger.endTimer('initialRender', 2, 'Initial render completed');
      
      // Log some performance metrics if available
      if (window.performance) {
        const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigationTiming) {
          logger.info('Page load performance', {
            dnsLookup: navigationTiming.domainLookupEnd - navigationTiming.domainLookupStart,
            tcpConnection: navigationTiming.connectEnd - navigationTiming.connectStart,
            documentLoad: navigationTiming.domComplete - navigationTiming.domLoading,
            fullPageLoad: navigationTiming.loadEventEnd - navigationTiming.startTime,
          });
        }
      }
    });
    
    return () => {
      if (window.cancelIdleCallback) {
        window.cancelIdleCallback(idleCallbackId);
      } else {
        clearTimeout(idleCallbackId);
      }
    };
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <NotionProvider>
        <Router>
          <AppRoutes />
        </Router>
      </NotionProvider>
    </QueryClientProvider>
  );
}

export default App; 