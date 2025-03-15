import React from 'react';

export interface SearchResultItem {
  /** Title of the search result */
  title: string;
  /** URL of the search result */
  url: string;
  /** Description or snippet of the search result */
  description: string;
  /** The source of the result (e.g., 'brave', 'cache', etc.) */
  source?: string;
  /** When the result was fetched or cached */
  timestamp?: number;
}

export interface SearchResultProps {
  /** The search results to display */
  results: SearchResultItem[];
  /** The search query that was used */
  query: string;
  /** Whether the results are loading */
  loading?: boolean;
  /** Error message if the search failed */
  error?: string;
  /** Function to handle clicking on a result */
  onResultClick?: (result: SearchResultItem) => void;
  /** Custom class name for the container */
  className?: string;
  /** Test ID for component testing */
  testId?: string;
}

/**
 * SearchResult Component
 * 
 * Displays search results from the Web Search Optimizer in a formatted list.
 */
export const SearchResult: React.FC<SearchResultProps> = ({
  results,
  query,
  loading = false,
  error,
  onResultClick,
  className = '',
  testId = 'search-results',
}) => {
  // Format timestamp to readable date
  const formatTimestamp = (timestamp?: number): string => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    return date.toLocaleString();
  };
  
  // Handle result click
  const handleResultClick = (result: SearchResultItem) => {
    if (onResultClick) {
      onResultClick(result);
    }
  };
  
  // Display loading state
  if (loading) {
    return (
      <div 
        className={`bg-white dark:bg-gray-800 rounded-lg shadow p-4 ${className}`}
        data-testid={`${testId}-loading`}
      >
        <div className="flex flex-col space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 animate-pulse"></div>
        </div>
      </div>
    );
  }
  
  // Display error state
  if (error) {
    return (
      <div 
        className={`bg-white dark:bg-gray-800 rounded-lg shadow p-4 ${className}`}
        data-testid={`${testId}-error`}
      >
        <div className="text-red-500 dark:text-red-400">
          <h4 className="font-semibold">Search Error</h4>
          <p>{error}</p>
        </div>
      </div>
    );
  }
  
  // Display empty state
  if (results.length === 0) {
    return (
      <div 
        className={`bg-white dark:bg-gray-800 rounded-lg shadow p-4 ${className}`}
        data-testid={`${testId}-empty`}
      >
        <p className="text-gray-500 dark:text-gray-400">No results found for "{query}".</p>
      </div>
    );
  }
  
  // Display results
  return (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-lg shadow p-4 ${className}`}
      data-testid={testId}
    >
      <h3 className="text-lg font-semibold mb-3">
        Search Results for "{query}"
      </h3>
      
      <ul className="space-y-4">
        {results.map((result, index) => (
          <li 
            key={`${result.url}-${index}`}
            className="border-b last:border-b-0 border-gray-200 dark:border-gray-700 pb-3 last:pb-0"
            data-testid={`${testId}-item-${index}`}
          >
            <a 
              href={result.url}
              className="block hover:bg-gray-50 dark:hover:bg-gray-700 rounded p-2 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleResultClick(result)}
            >
              <h4 className="text-primary dark:text-primary-light font-medium">{result.title}</h4>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {result.url}
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                {result.description}
              </p>
              {(result.source || result.timestamp) && (
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center justify-between">
                  {result.source && (
                    <span>Source: {result.source}</span>
                  )}
                  {result.timestamp && (
                    <span>Fetched: {formatTimestamp(result.timestamp)}</span>
                  )}
                </div>
              )}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SearchResult; 