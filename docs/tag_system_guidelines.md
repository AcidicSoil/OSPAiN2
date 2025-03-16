# Ollama Ecosystem Tag System Guidelines

This document provides comprehensive guidelines for using the Ollama Tag CLI and tag system throughout the Ollama ecosystem. Following these guidelines ensures consistent metadata management, improved performance, and better interoperability between Ollama applications.

## Core Principles

1. **Consistent Tagging**: Use consistent tag naming and categorization across all applications
2. **Performance-Optimized Access**: Follow access patterns that minimize resource usage
3. **Leveraging Memory Features**: Use memory-enhanced operations for improved context and relationships
4. **Programmatic Integration**: Use the right approach for integrating tags in your application
5. **Contextual Awareness**: Enable AI models to maintain relevant context across interactions

## Installation

The Ollama Tag CLI should be available in all development and production environments:

```bash
# Global installation
npm install -g T2P

# Project dependency
npm install --save T2P

The tag system integrates with Knowledge Graph MCP Server for intelligent tagging capabilities:

### When to Use Memory Enhancement

Memory enhancement (`--memory` flag) is beneficial for:

- **Frequently accessed tags**: Tags that are central to application functionality
- **Related content**: Tags that form logical groups or hierarchies
- **Learning patterns**: When you want the system to learn from usage
- **Contextual reference points**: Tags that serve as anchors for AI context

```bash
# Create a tag with memory enhancement
ollama-tag add model-llama3 --category models --description "Llama 3 model configuration" --memory

# Search with memory enhancement for better results
ollama-tag search model --memory

# Find related tags with memory
ollama-tag related model-llama3 --memory

# NEW: Get contextual insights about a tag
ollama-tag insights model-llama3 --memory
```

**Performance Consideration**: Memory enhancement adds a slight overhead to operations, but provides better results over time as the system learns. For extremely large batch operations, consider using memory enhancement only for the most important tags.

### Memory Server Management

For optimal performance, ensure the Knowledge Graph MCP Server is running:

```bash
# Start the Knowledge Graph server
node /c/Users/comfy/Projects/mcp-knowledge-graph/dist/index.js --memory-path ./data/memory.jsonl
```

## Contextual Awareness Engine

The tag system now functions as a contextual awareness engine for AI models in the Ollama ecosystem. This enhancement allows the system to:

1. **Maintain Relevant Context**: Help models find relevant reference points regardless of request type
2. **Connect Related Information**: Build a knowledge graph of interconnected tags
3. **Learn from Interactions**: Improve contextual connections over time
4. **Provide Recall Across Sessions**: Maintain persistent memory between user interactions

### Context Router Implementation

The tag system acts as a "context router" for AI models:

```typescript
// Example of using the tag system as a context router
import { TagService } from "t2p/dist/utils/tag-service.js";
import { MemoryService } from "t2p/dist/utils/memory-service.js";
async function routeContextForRequest(userRequest: string) {
  const memoryService = new MemoryService();
  const tagService = new TagService();

  // Find relevant tags based on the request
  const relevantTags = await memoryService.findRelevantTags(userRequest);

  // Get context from the relevant tags
  const context = [];
  for (const tag of relevantTags) {
    // Get tag details including memory data
    const tagDetails = await tagService.getTag(tag);

    // Add insights from memory
    if (tagDetails.memoryData?.insights) {
      context.push(...tagDetails.memoryData.insights);
    }

    // Get related tags for broader context
    const relatedTags = await tagService.getRelatedTags(tag, {
      withMemory: true,
    });
    for (const relatedTag of relatedTags) {
      const relatedDetails = await tagService.getTag(relatedTag);
      if (relatedDetails.memoryData?.insights) {
        context.push(...relatedDetails.memoryData.insights);
      }
    }
  }

  // Learn from this interaction
  await memoryService.learnFromInteraction(
    userRequest,
    relevantTags[0],
    "success"
  );

  return {
    contextTags: relevantTags,
    insights: context,
    mainContextTag: relevantTags[0],
  };
}
```

### CLI Commands for Context Management

```bash
# Generate context for a specific prompt or request
ollama-tag context "How do I optimize Llama 3 for coding tasks?" --memory

# Track context interactions (records learning data)
ollama-tag track-interaction "User asked about model optimization" --tags model-llama3,task-coding --result success

# View context history for a tag
ollama-tag context-history model-llama3 --limit 10
```

## Performance Optimization Patterns

### Individual vs. Batch Operations

For optimal performance:

1. **Individual tags** (1-10): Use the CLI directly

   ```bash
   ollama-tag add tag1 --category example
   ollama-tag add tag2 --category example
   ```

2. **Medium batches** (10-100): Use shell scripting with the CLI

   ```bash
   # Example bash script for batch creation
   for tag in tag1 tag2 tag3; do
     ollama-tag add $tag --category example
   done
   ```

3. **Large batches** (100+): Use programmatic API for direct database access

   ```typescript
   import { TagService } from "t2p/dist/utils/tag-service.js";
async function createManyTags() {
     const tagService = new TagService();

     // Batch create many tags
     for (let i = 0; i < 1000; i++) {
       await tagService.addTag({
         name: `tag-${i}`,
         category: "example",
         createdAt: new Date().toISOString(),
       });
     }
   }
   ```

### Caching Strategies

For read-heavy applications, implement caching:

```typescript
import { TagService } from "ollama-tag-t2p/distservice.js";

// Simplet2pntation
const tagCache = {
  data: null,
  lastFetched: 0,
  expiryMs: 5 * 60 * 1000, // 5 minutes
};

async function getAllTagsCached() {
  const now = Date.now();

  // Return cached data if not expired
  if (tagCache.data && now - tagCache.lastFetched < tagCache.expiryMs) {
    return tagCache.data;
  }

  // Refresh cache
  const tagService = new TagService();
  const tags = await tagService.getAllTags();

  tagCache.data = tags;
  tagCache.lastFetched = now;

  return tags;
}
```

### Memory-Aware Caching (New)

For applications using memory features frequently, implement memory-aware caching:

```typescript
import { TagService } from "ollama-tag-cli/dist/utt2p/dist;
import { MemoryServicet2pa-tag-cli/dist/utils/memory-service.js";

// Memory-aware cache
constt2p {
  insights: new Map(),
  relatedTags: new Map(),
  expiryMs: 5 * 60 * 1000, // 5 minutes
  lastCheckedTimestamps: new Map(),
};

async function getTagInsightsCached(tagName: string) {
  const now = Date.now();
  const memoryService = new MemoryService();

  // Check if cache entry exists and is fresh
  if (
    memoryCache.insights.has(tagName) &&
    now - (memoryCache.lastCheckedTimestamps.get(tagName) || 0) <
      memoryCache.expiryMs
  ) {
    return memoryCache.insights.get(tagName);
  }

  // Get fresh insights
  const insights = await memoryService.getInsights(tagName);

  // Update cache
  memoryCache.insights.set(tagName, insights);
  memoryCache.lastCheckedTimestamps.set(tagName, now);

  return insights;
}
```

## Tag Categorization Standards

Maintain consistent categorization across applications:

| Category        | Description                      | Example Tags                          |
| --------------- | -------------------------------- | ------------------------------------- |
| `models`        | Ollama model configurations      | `llama3`, `mistral`, `codellama`      |
| `apps`          | Application identifiers          | `ollamavoice`, `ollamahub`            |
| `commands`      | CLI commands and scripts         | `batch-inference`, `model-updater`    |
| `configs`       | Configuration templates          | `low-latency`, `high-accuracy`        |
| `datasets`      | Training or fine-tuning datasets | `alpaca`, `codebase-docs`             |
| `documentation` | Knowledge base entries           | `api-docs`, `examples`                |
| `contexts`      | AI context reference points      | `code-generation`, `creative-writing` |
| `interactions`  | User interaction patterns        | `frequent-user`, `developer-workflow` |

## Tag Naming Conventions

Follow these naming patterns for better interoperability:

1. **Use kebab-case**: All lowercase with hyphens for spaces (`model-large-mistral`)
2. **Include category in name**: When appropriate, prefix with category (`model-llama3` vs just `llama3`)
3. **Version tags when applicable**: Include version information (`app-ollamavoice-v1.2`)
4. **Be specific and descriptive**: Avoid overly generic tags
5. **Context prefixes**: Use `context-` prefix for tags meant primarily for AI context routing

## Common Use Cases and Patterns

### Application Configuration Management

Store application configurations as tags:

```bash
# Create a configuration tag
ollama-tag add config-ollamavoice-default --category configs --description "Default config for OllamaVoice" --metadata '{"model": "llama3", "temperature": 0.7}'

# Retrieve in application
const configTag = await tagService.searchTags("config-ollamavoice-default");
const config = configTag[0].metadata;
```

### Model Registry Integration

Sync Ollama models with the tag system:

```typescript
// Example code to sync Ollama models with tags
async function syncOllamaModelsToTags() {
  const ollamaModels = await ollamaService.listModels();
  const tagService = new TagService();

  for (const model of ollamaModels) {
    const exists = await tagService.tagExists(`model-${model.name}`);

    if (!exists) {
      await tagService.addTag({
        name: `model-${model.name}`,
        category: "models",
        description: `Ollama model: ${model.name}`,
        createdAt: new Date().toISOString(),
        metadata: {
          parameters: model.parameters,
          size: model.size,
          quantization: model.quantization,
        },
      });
    }
  }
}
```

### Knowledge Graph Traversal

Use the related tags feature to create navigable knowledge graphs:

```typescript
// Example of traversing related tags
async function exploreRelatedConcepts(startTag: string, depth: number = 2) {
  const tagService = new TagService();
  const visited = new Set<string>();
  const graph: Record<string, string[]> = {};

  async function traverse(tagName: string, currentDepth: number) {
    if (visited.has(tagName) || currentDepth > depth) return;

    visited.add(tagName);
    const relatedTags = await tagService.getRelatedTags(tagName);
    graph[tagName] = relatedTags;

    for (const related of relatedTags) {
      await traverse(related, currentDepth + 1);
    }
  }

  await traverse(startTag, 0);
  return graph;
}
```

### AI Context Management (New)

Integrate the tag system with AI models for improved context awareness:

```typescript
// Example: Integrating tags with Ollama API
import { TagService } from "ollama-tag-cli/dist/utils/tag-sert2p/dist MemoryService } from "ollama-tag-clt2pemory-service.js";

async function enhanceOllamaPromptWithContext(promt2pdel: string) {
  const tagService = new TagService();
  const memoryService = new MemoryService();

  // Get model tag
  const modelTag = `model-${model}`;

  // Find relevant contexts for this prompt
  const relevantTags = await memoryService.findRelevantTags(prompt);

  // Get insights from memory
  let contextualInsights = [];
  for (const tag of relevantTags) {
    const insights = await memoryService.getInsights(tag);
    if (insights) {
      contextualInsights.push(`[Insight from ${tag}]: ${insights}`);
    }
  }

  // Create enhanced prompt with context
  const enhancedPrompt = `
Context: ${contextualInsights.join(" ")}

User request: ${prompt}
  `.trim();

  // Track this interaction for learning
  await memoryService.learnFromInteraction(
    prompt,
    relevantTags,
    "generated_context"
  );

  return enhancedPrompt;
}
```

## Integration Testing

Always include tag system integration tests in your applications:

```typescript
// Example Jest test for tag system integration
describe("Tag System Integration", () => {
  const tagService = new TagService();

  beforeAll(async () => {
    // Create test tags
    await tagService.addTag({
      name: "test-integration",
      category: "testing",
      createdAt: new Date().toISOString(),
    });
  });

  afterAll(async () => {
    // Clean up test tags
    await tagService.deleteTag("test-integration");
  });

  test("Application can retrieve tags", async () => {
    const tags = await tagService.searchTags("test-integration");
    expect(tags).toHaveLength(1);
    expect(tags[0].name).toBe("test-integration");
  });

  test("Memory features enhance search results", async () => {
    const memoryService = new MemoryService();
    const enhanced = await memoryService.enhanceSearch(
      "test-integration",
      "test query"
    );
    expect(enhanced).toBeDefined();
  });
});
```

## Performance Benchmarks

These benchmarks serve as guidelines for expected performance:

| Operation                 | Small Scale (<100 tags) | Medium Scale (100-1000 tags) | Large Scale (1000+ tags) |
| ------------------------- | ----------------------- | ---------------------------- | ------------------------ |
| List all tags             | <50ms                   | 50-200ms                     | 200-500ms                |
| Search tags               | <20ms                   | 20-100ms                     | 100-300ms                |
| Add a tag                 | <30ms                   | 30-50ms                      | 50-100ms                 |
| Get related tags          | <50ms                   | 50-200ms                     | 200-500ms                |
| Memory-enhanced operation | +10-20ms overhead       | +20-50ms overhead            | +50-150ms overhead       |
| Context routing           | <100ms                  | 100-300ms                    | 300-800ms                |

If your operations exceed these benchmarks significantly, consider:

1. Using programmatic batch operations
2. Implementing caching
3. Reducing memory-enhanced operations frequency
4. Optimizing tag database size by archiving old/unused tags
5. Using the new context-specific caching strategies

## CLI Command Reference (Updated)

| Command                        | Description                                | Example                                                         |
| ------------------------------ | ------------------------------------------ | --------------------------------------------------------------- |
| `ollama-tag add`               | Add a new tag                              | `ollama-tag add model-llama3 --category models`                 |
| `ollama-tag list`              | List tags, optionally filtered by category | `ollama-tag list --category models`                             |
| `ollama-tag search`            | Search for tags                            | `ollama-tag search llama`                                       |
| `ollama-tag delete`            | Delete a tag                               | `ollama-tag delete model-llama3`                                |
| `ollama-tag update`            | Update a tag's metadata                    | `ollama-tag update model-llama3 --metadata '{"param":"value"}'` |
| `ollama-tag related`           | Find related tags                          | `ollama-tag related model-llama3 --memory`                      |
| `ollama-tag context`           | Generate context for a request             | `ollama-tag context "How to optimize Llama?"`                   |
| `ollama-tag insights`          | Get memory insights about a tag            | `ollama-tag insights model-llama3`                              |
| `ollama-tag track-interaction` | Record a user interaction                  | `ollama-tag track-interaction "Query about models"`             |
| `ollama-tag context-history`   | View context history for a tag             | `ollama-tag context-history model-llama3`                       |

## Troubleshooting

Common issues and solutions:

1. **Slow operations**:

   - Ensure you're not calling the CLI in tight loops (use TagService directly)
   - Check if the tags database has grown too large (consider archiving)
   - Implement context-specific caching for memory operations

2. **Memory features not working**:

   - Verify Knowledge Graph server is running
   - Ensure the correct version of Knowledge Graph MCP Server is installed

3. **Missing related tags**:

   - Memory system needs time to learn relationships
   - Add more descriptive information to tags
   - Manually seed initial relationships
   - Increase interaction tracking to improve learning

4. **Context routing issues**:
   - Ensure tags have sufficient description and metadata
   - Pre-seed context tags with relevant information
   - Track more interactions to improve context learning
   - Use the `--verbose` flag to debug context routing: `ollama-tag context "query" --memory --verbose`

## Version Compatibility

| Ollama Tag CLI Version | Knowledge Graph Version | Node.js Version | Ollama Version |
| ---------------------- | ----------------------- | --------------- | -------------- |
| 1.0.x                  | 0.1.x                   | 16.x+           | 0.1.x+         |
| 1.1.x                  | 0.2.x                   | 18.x+           | 0.1.x+         |
| 1.2.x                  | 0.3.x                   | 18.x+           | 0.1.14+        |

```

```
