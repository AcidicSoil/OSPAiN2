import React, { useState } from 'react';
import PageContainer from '../layout/PageContainer';
import SearchBar, { SearchOptions } from './SearchBar';
import SearchResult, { SearchResultItem } from './SearchResult';
import { ErrorDisplay } from '../ui/ErrorDisplay';

/**
 * SearchPage Component
 * 
 * Provides a UI for interacting with the Web Search Optimizer MCP server.
 * This serves as both a test harness for the Web Search Optimizer and
 * a practical search tool for the OSPAiN2 ecosystem.
 */
const SearchPage: React.FC = () => {
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [query, setQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [searchStats, setSearchStats] = useState<any>(null);
  
  // Mock function to represent the MCP call to the Web Search Optimizer
  // In a real implementation, this would be replaced with an actual MCP call
  const mockOptimizedSearch = async (query: string, options: SearchOptions) => {
    // Simulate network request
    setLoading(true);
    setError(undefined);
    
    try {
      // In a real implementation, this would be:
      // const response = await window.mcp.call('optimized_search', { query, ...options });
      
      // For testing, we'll simulate a response after a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate cache hit based on options
      const isFromCache = !options.forceRefresh && Math.random() > 0.5;
      
      // Generate mock results
      const mockResults: SearchResultItem[] = [
        {
          title: `Result 1 for "${query}"`,
          url: 'https://example.com/result1',
          description: 'This is a mock result to demonstrate the search functionality. In a real implementation, this would be replaced with actual search results from the Web Search Optimizer.',
          source: isFromCache ? 'cache' : 'brave',
          timestamp: Date.now(),
        },
        {
          title: `Result 2 for "${query}"`,
          url: 'https://example.com/result2',
          description: 'Another mock result for demonstration purposes. The Web Search Optimizer would return real search results from the configured search engine or from its cache.',
          source: isFromCache ? 'cache' : 'brave',
          timestamp: Date.now(),
        },
        {
          title: `DevDocs.io: ${query}`,
          url: `https://devdocs.io/search?q=${encodeURIComponent(query)}`,
          description: 'Documentation result from DevDocs.io. The Web Search Optimizer prioritizes DevDocs.io for documentation-related queries to provide consistent access to documentation.',
          source: options.queryType === 'documentation' ? 'devdocs.io' : 'brave',
          timestamp: Date.now(),
        },
      ];
      
      // Return additional results based on count
      const additionalResults = Array.from({ length: options.count - 3 }, (_, i) => ({
        title: `Additional Result ${i + 1} for "${query}"`,
        url: `https://example.com/result${i + 3}`,
        description: `Additional mock result ${i + 1} for demonstration purposes.`,
        source: isFromCache ? 'cache' : 'brave',
        timestamp: Date.now(),
      }));
      
      setResults([...mockResults, ...additionalResults].slice(0, options.count));
      setQuery(query);
      
      // Simulate getting search stats
      // In a real implementation, this would be:
      // const stats = await window.mcp.call('get_search_stats');
      setSearchStats({
        cache: {
          hits: isFromCache ? 1 : 0,
          misses: isFromCache ? 0 : 1,
        },
        usage: {
          requests: {
            lastMinute: 1,
            lastHour: 5,
            lastDay: 15,
          },
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle search submission
  const handleSearch = (searchQuery: string, options: SearchOptions) => {
    mockOptimizedSearch(searchQuery, options);
  };
  
  // Clear cache (mock function)
  const handleClearCache = async () => {
    // In a real implementation, this would be:
    // await window.mcp.call('clear_search_cache', { all: true });
    
    setSearchStats({
      ...searchStats,
      message: 'Cache cleared successfully',
    });
  };
  
  return (
    <PageContainer
      title="Web Search Optimizer"
      description="Test and use the Web Search Optimizer MCP server"
    >
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h2 className="text-xl font-semibold mb-4">Web Search Optimizer</h2>
          <p className="mb-4">
            This page demonstrates the Web Search Optimizer MCP server with its intelligent caching, 
            DevDocs.io integration, and tiered caching based on content type.
          </p>
          <div className="p-3 bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 rounded-md">
            <h3 className="text-md font-medium text-blue-800 dark:text-blue-300">Features</h3>
            <ul className="list-disc pl-5 mt-2 text-sm text-blue-700 dark:text-blue-400">
              <li>Intelligent caching of search results (1-30 days based on content type)</li>
              <li>DevDocs.io prioritization for documentation searches</li>
              <li>Rate limiting to prevent excessive API calls</li>
              <li>Knowledge Graph integration for persistent storage</li>
            </ul>
          </div>
        </div>
        
        <SearchBar
          onSearch={handleSearch}
          loading={loading}
          showAdvanced={true}
        />
        
        {query && (
          <SearchResult
            results={results}
            query={query}
            loading={loading}
            error={error}
          />
        )}
        
        {searchStats && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold mb-3">Search Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-md font-medium mb-2">Cache Performance</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Cache Hits:</span>
                    <span className="font-mono">{searchStats.cache.hits}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cache Misses:</span>
                    <span className="font-mono">{searchStats.cache.misses}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Hit Rate:</span>
                    <span className="font-mono">
                      {searchStats.cache.hits + searchStats.cache.misses === 0
                        ? 'N/A'
                        : `${Math.round((searchStats.cache.hits / (searchStats.cache.hits + searchStats.cache.misses)) * 100)}%`}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-md font-medium mb-2">API Usage</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Requests (Last Minute):</span>
                    <span className="font-mono">{searchStats.usage.requests.lastMinute}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Requests (Last Hour):</span>
                    <span className="font-mono">{searchStats.usage.requests.lastHour}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Requests (Last Day):</span>
                    <span className="font-mono">{searchStats.usage.requests.lastDay}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleClearCache}
                className="px-3 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md text-sm"
              >
                Clear Cache
              </button>
            </div>
            
            {searchStats.message && (
              <div className="mt-3 p-2 bg-green-50 dark:bg-green-900 dark:bg-opacity-20 text-green-700 dark:text-green-300 rounded-md text-sm">
                {searchStats.message}
              </div>
            )}
          </div>
        )}
      </div>
    </PageContainer>
  );
};

export default SearchPage; 