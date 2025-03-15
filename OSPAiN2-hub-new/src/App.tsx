import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import AppRoutes from './router';
import { useUIStore } from './store';
import { NotionProvider } from '../../src/context/NotionContext';

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
  
  // Apply theme class to html element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);
  
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