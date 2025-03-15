import React, { useState, FormEvent } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Dropdown } from '../ui/Dropdown';

export interface SearchBarProps {
  /** Callback fired when search is submitted */
  onSearch: (query: string, options: SearchOptions) => void;
  /** Initial search query */
  initialQuery?: string;
  /** Whether the search is loading */
  loading?: boolean;
  /** Whether to show the advanced options */
  showAdvanced?: boolean;
  /** Custom class name for the container */
  className?: string;
  /** Test ID for component testing */
  testId?: string;
}

export interface SearchOptions {
  /** Number of results to return */
  count: number;
  /** Whether to force refresh (ignore cache) */
  forceRefresh: boolean;
  /** Type of query for cache management */
  queryType: 'default' | 'documentation' | 'news';
}

const DEFAULT_OPTIONS: SearchOptions = {
  count: 5,
  forceRefresh: false,
  queryType: 'default',
};

/**
 * SearchBar Component
 * 
 * Provides a search interface for the Web Search Optimizer with advanced options.
 */
export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  initialQuery = '',
  loading = false,
  showAdvanced = false,
  className = '',
  testId = 'search-bar',
}) => {
  const [query, setQuery] = useState<string>(initialQuery);
  const [options, setOptions] = useState<SearchOptions>(DEFAULT_OPTIONS);
  const [showOptions, setShowOptions] = useState<boolean>(showAdvanced);
  
  // Handle search submission
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query, options);
    }
  };
  
  // Update search options
  const updateOption = <K extends keyof SearchOptions>(key: K, value: SearchOptions[K]) => {
    setOptions(prev => ({
      ...prev,
      [key]: value,
    }));
  };
  
  return (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-lg shadow p-4 ${className}`}
      data-testid={testId}
    >
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex-grow">
            <Input
              type="text"
              placeholder="Search with Web Search Optimizer..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search query"
              disabled={loading}
              testId={`${testId}-input`}
            />
          </div>
          
          <Button
            type="submit"
            disabled={loading || !query.trim()}
            loading={loading}
            testId={`${testId}-submit`}
          >
            Search
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowOptions(!showOptions)}
            testId={`${testId}-options-toggle`}
          >
            {showOptions ? 'Hide Options' : 'Show Options'}
          </Button>
        </div>
        
        {showOptions && (
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Results count */}
              <div>
                <label className="text-sm font-medium block mb-1">
                  Results
                </label>
                <select
                  value={options.count}
                  onChange={(e) => updateOption('count', parseInt(e.target.value))}
                  className="block w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                  disabled={loading}
                  data-testid={`${testId}-count`}
                >
                  <option value={3}>3 results</option>
                  <option value={5}>5 results</option>
                  <option value={10}>10 results</option>
                  <option value={20}>20 results</option>
                </select>
              </div>
              
              {/* Query type */}
              <div>
                <label className="text-sm font-medium block mb-1">
                  Content Type
                </label>
                <select
                  value={options.queryType}
                  onChange={(e) => updateOption('queryType', e.target.value as any)}
                  className="block w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                  disabled={loading}
                  data-testid={`${testId}-type`}
                >
                  <option value="default">General (7 day cache)</option>
                  <option value="documentation">Documentation (30 day cache)</option>
                  <option value="news">News (1 day cache)</option>
                </select>
              </div>
              
              {/* Force refresh */}
              <div className="flex items-center mt-6">
                <input
                  type="checkbox"
                  id="force-refresh"
                  checked={options.forceRefresh}
                  onChange={(e) => updateOption('forceRefresh', e.target.checked)}
                  className="h-4 w-4 text-primary focus:ring-primary"
                  disabled={loading}
                  data-testid={`${testId}-refresh`}
                />
                <label htmlFor="force-refresh" className="ml-2 text-sm">
                  Ignore cache (force new search)
                </label>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default SearchBar; 