# Test Agent Framework Research Tool

This tool helps analyze and evaluate existing test agent frameworks and libraries to inform our implementation decisions.

## Features

- GitHub repository scanning for test agent frameworks
- Automated evaluation of repository metrics
- Generation of comprehensive research reports
- Integration with our documentation standards

## Prerequisites

- Node.js 18+ LTS
- GitHub Personal Access Token with repo scope

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your GitHub token:
   ```bash
   export GITHUB_TOKEN=your_token_here
   ```

## Usage

1. Build the project:

   ```bash
   npm run build
   ```

2. Run the scanner:

   ```bash
   npm start
   ```

3. View results in the `research-results` directory:
   - `raw-results.json`: Raw repository data
   - `research-report.json`: Structured report data
   - `research-report.md`: Human-readable markdown report

## Development

Run in development mode:

```bash
npm run dev
```

## Research Criteria

The tool evaluates repositories based on the following criteria:

- Minimum stars: 100
- Minimum contributors: 5
- Last update within 30 days
- Minimum test coverage: 70%
- Maximum dependencies: 50
- Minimum documentation score: 0.7

## Output Format

### JSON Report

```typescript
interface ResearchReport {
  timestamp: string;
  totalRepositories: number;
  summary: {
    averageStars: number;
    averageContributors: number;
    languages: string[];
    topics: string[];
  };
  repositories: RepositoryData[];
}
```

### Markdown Report

- Summary statistics
- Language distribution
- Topic analysis
- Top 10 repositories with detailed metrics

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - see LICENSE file for details

# Token Context Management System

A sophisticated system for managing token context ratios across different development modes, optimizing context usage while maintaining high-quality interactions.

## Features

- **Mode-Specific Context Optimization**: Tailored context management for design, engineering, and testing modes
- **Intelligent Context Compression**: Semantic chunking and relevance-based filtering
- **Rate Limiting**: Configurable token limits per mode and time period
- **Usage Analytics**: Comprehensive tracking and analysis of token usage patterns
- **Caching System**: Efficient caching of compressed contexts

## Components

### EnhancedContextManager

The core component that orchestrates context optimization and management:

```typescript
const contextManager = new EnhancedContextManager(
  knowledgeGraph,
  rateLimitService
);
const optimizedContext = await contextManager.optimizeContext(
  context,
  DevelopmentMode.Engineering
);
```

### KnowledgeGraph

Handles semantic analysis and context chunking:

```typescript
const knowledgeGraph = new KnowledgeGraph();
const chunks = await knowledgeGraph.chunkContext(context);
const filteredContext = await knowledgeGraph.scoreAndFilter(context);
```

### RateLimitService

Manages token usage limits and tracking:

```typescript
const rateLimitService = new RateLimitService();
const canProceed = await rateLimitService.checkRateLimit(
  tokens,
  DevelopmentMode.Engineering
);
await rateLimitService.recordUsage(tokens, DevelopmentMode.Engineering);
```

## Configuration

### Token Limits

Default token limits per mode:

```typescript
{
  design: {
    maxTokensPerMinute: 800,
    maxTokensPerHour: 8000
  },
  engineering: {
    maxTokensPerMinute: 1200,
    maxTokensPerHour: 12000
  },
  testing: {
    maxTokensPerMinute: 600,
    maxTokensPerHour: 6000
  }
}
```

### Context Optimization

Configurable parameters for context optimization:

```typescript
{
  maxTokens: 8192,
  minContextRatio: 0.2,
  maxContextRatio: 0.8,
  compressionThreshold: 0.7
}
```

## Usage Examples

### Basic Context Optimization

```typescript
const contextManager = new EnhancedContextManager(
  knowledgeGraph,
  rateLimitService
);
const optimizedContext = await contextManager.optimizeContext(
  largeContext,
  DevelopmentMode.Engineering
);
```

### Rate Limit Checking

```typescript
const canProceed = await rateLimitService.checkRateLimit(
  1000,
  DevelopmentMode.Engineering
);
if (canProceed) {
  // Process context
}
```

### Usage Monitoring

```typescript
const usage = rateLimitService.getCurrentUsage();
const modeUsage = rateLimitService.getModeUsage(DevelopmentMode.Engineering);
```

## Testing

Run the test suite:

```bash
npm test
```

The test suite covers:

- Context optimization
- Rate limiting
- Knowledge graph operations
- Integration scenarios

## Events

The system emits various events for monitoring and integration:

- `usageAnalysis`: Emitted when token usage is analyzed
- `rateLimitExceeded`: Emitted when rate limits are exceeded
- `modeRateLimitExceeded`: Emitted when mode-specific limits are exceeded
- `usageRecorded`: Emitted when token usage is recorded

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - see LICENSE file for details
