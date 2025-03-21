# Web Search Optimizer Documentation

## Overview

The Web Search Optimizer is an MCP server that provides optimized web search capabilities with intelligent caching, DevDocs.io integration, and API usage conservation.

## Features

- **Intelligent Caching**: Search results are cached to minimize redundant API calls
- **Tiered Cache Lifetimes**: Different cache durations based on content type:
  - News: 1 day
  - General: 7 days
  - Documentation: 30 days
- **DevDocs.io Integration**: Automatic prioritization of DevDocs.io for documentation searches
- **Rate Limiting**: Built-in rate limiting to prevent excessive API usage
- **Knowledge Graph Storage**: Results stored in the Knowledge Graph for persistent access
- **Query Optimization**: Automatic query enhancement for better results

## MCP Server Configuration

The Web Search Optimizer MCP server is configured in `.cursor/mcp.json`:

```json
{
  "name": "Web Search Optimizer",
  "type": "command",
  "command": "node",
  "args": [".cursor/mcp-servers/web-search-optimizer/web-search-optimizer.js"],
  "description": "Optimized web search with caching and conservation"
}
```

## Available Tools

### optimized_search

Performs web searches with caching and optimizations.

**Parameters:**
- `query` (string, required): The search query
- `count` (number, default 5): Number of results to return
- `forceRefresh` (boolean, default false): Ignore cache and force a new search
- `queryType` (string): Type of query for cache management (default, documentation, news)

**Example:**
```javascript
const results = await window.mcp.call('optimized_search', {
  query: 'TypeScript interface examples',
  count: 3,
  queryType: 'documentation'
});
```

### get_search_stats

Get statistics about search usage and cache performance.

**Example:**
```javascript
const stats = await window.mcp.call('get_search_stats');
```

### clear_search_cache

Clear the search cache.

**Parameters:**
- `all` (boolean, default false): Clear all cache entries
- `olderThan` (number): Clear entries older than this many days
- `query` (string): Clear entries matching this query

**Example:**
```javascript
await window.mcp.call('clear_search_cache', {
  olderThan: 14 // Clear entries older than 14 days
});
```

## DevDocs.io Integration

The Web Search Optimizer automatically prioritizes DevDocs.io in search results for documentation-related queries by:

1. Detecting documentation-related queries
2. Adding "devdocs.io" to the search query
3. Setting longer cache lifetimes for documentation results

This provides consistent access to documentation across multiple technologies without requiring separate API calls to different documentation sources.

### DevDocs.io Usage

For direct DevDocs.io access, you can use:
- **Web Interface**: [https://devdocs.io/](https://devdocs.io/)
- **URL Search**: `https://devdocs.io/search?q=your+query`
- **Desktop App**: Available for offline use

## Knowledge Graph Integration

Search results are stored in the Knowledge Graph with:

1. Query information
2. Result content
3. Source and timestamp metadata
4. Semantic relationships between queries

This enables:
- Persistent caching across sessions
- Semantic search capabilities for related queries
- Integration with other Knowledge Graph-based tools

## Best Practices

1. **Use Specific Queries**: More specific queries produce better results and improve cache utilization
2. **Set Appropriate Query Types**: Specify 'documentation' for docs, 'news' for current events
3. **Limit Result Count**: Request only as many results as needed to conserve API usage
4. **Use Cache Wisely**: Only force refresh when absolutely necessary
5. **Monitor Usage**: Check search stats to avoid hitting API limits

## Implementation Examples

### Basic Search

```javascript
// Basic search with default options
const results = await window.mcp.call('optimized_search', {
  query: 'React hooks tutorial'
});
```

### Documentation Search

```javascript
// Documentation-specific search
const docsResults = await window.mcp.call('optimized_search', {
  query: 'JavaScript Promise API',
  queryType: 'documentation',
  count: 10
});
```

### News Search with Forced Refresh

```javascript
// Fresh news search
const newsResults = await window.mcp.call('optimized_search', {
  query: 'latest technology announcements',
  queryType: 'news',
  forceRefresh: true
});
```

## Troubleshooting

### Common Issues

1. **Rate Limiting Errors**: If you receive a rate limit error, wait before making more requests or reduce request frequency
2. **Cache Issues**: If you're getting outdated results, use `forceRefresh: true` to bypass the cache
3. **Search Quality Issues**: Try reformulating your query to be more specific

### Maintenance

Periodically clear old cache entries:

```javascript
// Clear entries older than 30 days
await window.mcp.call('clear_search_cache', {
  olderThan: 30
});
```

## Next Steps

1. Complete thorough testing with various search queries
2. Enhance DevDocs.io integration with direct API access
3. Expand Knowledge Graph integration for better semantic search
4. Create comprehensive documentation for all features
5. Implement additional search engines for fallback 