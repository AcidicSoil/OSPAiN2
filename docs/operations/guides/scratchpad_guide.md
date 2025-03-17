# Auto-Summarizing Scratchpad Guide

The Auto-Summarizing Scratchpad is a feature of the Ollama Tag CLI that allows users to quickly capture ideas, todos, and notes while working in the Ollama ecosystem. It automatically summarizes content periodically, making it easier to maintain a clear understanding of your thoughts and tasks without manual organization.

## Key Features

- **Quick Note Capture**: Easily add notes through the CLI without disrupting your workflow
- **Automatic Summarization**: Notes are automatically summarized based on content threshold or time intervals
- **Context-Aware Summaries**: Summaries incorporate existing ecosystem knowledge for more relevant organization
- **Tag Integration**: Summaries are stored in the tag system for seamless context retrieval
- **Categorization and Tagging**: Notes can be categorized and tagged for better organization

## Command Reference

### Adding Notes

Add a new note to your scratchpad:

```bash
tag scratchpad add "Need to update model integration tests for the new llama3 model"
```

With tags and categories:

```bash
tag scratchpad add "Implement pagination for large result sets" --tags "ui,optimization" --category "enhancement"
```

### Viewing Notes

List all your notes:

```bash
tag scratchpad list
```

Filter notes:

```bash
tag scratchpad list --category "enhancement"
tag scratchpad list --tag "ui"
tag scratchpad list --unsummarized
```

Limit the number of notes shown:

```bash
tag scratchpad list --limit 5
```

### Viewing Summaries

View the current summary of your scratchpad:

```bash
tag scratchpad summary
```

Force regeneration of the summary:

```bash
tag scratchpad summary --force
```

### Managing Notes

Delete a specific note:

```bash
tag scratchpad delete <note-id>
```

Delete all notes:

```bash
tag scratchpad delete --force
```

### Manual Summarization

Trigger summarization manually:

```bash
tag scratchpad summarize
```

Summarize all notes (including already summarized ones):

```bash
tag scratchpad summarize --all
```

## How It Works

The scratchpad system works by:

1. **Storing Notes**: When you add a note, it's stored in a JSON file in your local `.ollama-tags/scratchpad` directory.

2. **Triggering Summarization**: Summarization happens automatically when:

   - The number of unsummarized notes reaches the threshold (default: 5)
   - The timer interval elapses (default: 30 minutes)
   - You manually trigger summarization

3. **Generating Summaries**: The system uses either:

   - Ollama directly (using a local LLM)
   - Knowledge Graph for more context-aware summarization

4. **Context Integration**: The system:

   - Retrieves relevant context from your tag system
   - Uses the context to make the summary more relevant to your ecosystem
   - Stores the summary back into the tag system for future reference

5. **Updating Status**: After summarization, notes are marked as summarized but remain accessible.

## Configuration

The scratchpad system uses sensible defaults, but you can customize behavior by modifying the options when initializing the `Scratchpad` class:

```typescript
const scratchpad = new Scratchpad(tagStore, {
  autoSummarizeThreshold: 10, // Number of entries before auto-summarization
  summarizationInterval: 60 * 60000, // 1 hour in milliseconds
  useMemory: true, // Use Knowledge Graph if available
  storageDir: "/custom/path", // Custom storage location
});
```

## Integration with Context Retrieval

The scratchpad system integrates with the Context Retrieval system by:

1. Storing summaries as tags in the tag system
2. Using the tag system's semantic search to find relevant context for better summarization
3. Contributing to the overall ecosystem context that models can access

This integration ensures that your notes and ideas become part of the knowledge graph that powers the Ollama ecosystem.

## Best Practices

- **Use Categories**: Organize notes with consistent categories to improve summarization quality
- **Add Relevant Tags**: Tags help connect your notes to existing ecosystem components
- **Keep Notes Concise**: Focus on capturing key points rather than lengthy details
- **Review Summaries Regularly**: Periodically check your summaries to stay on top of ideas
- **Clean Up Occasionally**: Delete old or irrelevant notes to maintain a focused scratchpad

## Future Enhancements

We're working on additional features for the scratchpad system:

- Rich text formatting support
- Export to Markdown and other formats
- Periodic summary notifications
- Collaborative scratchpads for team use
- Enhanced Knowledge Graph integration for better summarization
- Visual representation of note relationships

## Scratchpad Guide

The scratchpad integrates with the Knowledge Graph MCP Server for context-aware summarization and intelligent suggestions:

### Features

- Automatic context tracking
- Semantic search powered by Knowledge Graph
- Intelligent task suggestions
- Context-aware completions

### Configuration

```json
{
  "scratchpad": {
    "memoryServer": "knowledge_graph",
    "serverUrl": "http://localhost:3005",
    "contextDepth": 3,
    "maxSuggestions": 5
  }
}
```

### Usage

1. Start the Knowledge Graph server
2. Initialize scratchpad with context
3. Enable automatic context tracking
4. Use semantic search for related notes

For troubleshooting:

- Verify Knowledge Graph server connection
- Check context persistence
- Review server logs
