# Content Summarizer MCP Server

A Model Context Protocol (MCP) server that provides text summarization capabilities with various styles and options, following sovereign AI principles.

## Features

- **Local-First**: Uses Ollama for local LLM inference
- **Multiple Summarization Styles**: Supports various summarization styles (default, technical, executive, bullet points, TL;DR, academic, critical analysis, ELI5)
- **Multi-Level Caching**: Implements both memory and disk caching for efficient resource usage
- **Language Support**: Generates summaries in different languages
- **Configurable**: Easily customize summarization parameters

## Installation

1. Ensure you have Ollama installed and running locally
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the server:
   ```bash
   npm run build
   ```

## Usage

### Starting the Server

```bash
# Start with default configuration
npm run start

# Or with custom configuration
NODE_ENV=production OLLAMA_ENDPOINT=http://localhost:11434 OLLAMA_MODEL=mistral npm run start
```

### Configuration Options

The server can be configured with the following environment variables:

- `OLLAMA_ENDPOINT`: URL of the Ollama API (default: `http://localhost:11434`)
- `OLLAMA_MODEL`: Model to use for summarization (default: `mistral:latest`)
- `NODE_ENV`: Environment mode (`development` or `production`)
- `PORT`: Port to run the server on (default: `3004`)

### Using the Summarize Tool

The server provides a `summarize` tool with the following parameters:

- `text` (required): The text to summarize
- `maxLength` (optional): Maximum length of the summary in words (default: 200)
- `language` (optional): Language for the summary (default: "en")
- `style` (optional): Summary style (default, technical, executive, bullet, tldr, academic, critical, eli5)

## Summarization Styles

- **default**: Standard concise summary preserving main points and key details
- **technical**: Technical summary using precise terminology and focusing on technical details
- **executive**: Executive summary focusing on business implications and strategic insights
- **bullet**: Bullet point list of the most important points
- **tldr**: Very brief TL;DR (Too Long; Didn't Read) summary
- **academic**: Academic summary using formal language and preserving scholarly content
- **critical**: Critical analysis evaluating strengths, weaknesses, and implications
- **eli5**: Simple explanation using basic words and concepts (Explain Like I'm 5)

## Integration with Cursor

This MCP server is designed to work with Cursor IDE. After starting the server, it will be available at `http://localhost:3004/sse` and can be used with the `summarize` tool.

## Architecture

The Content Summarizer server implements:

- **MCPServer**: Base server functionality for handling MCP protocol
- **OllamaService**: Integration with Ollama API for local LLM inference
- **MemoryCache**: In-memory caching for fast access to recent summaries
- **DiskCache**: Persistent disk caching for longer-term storage

## Development

### Project Structure

```
mcp-servers/content-summarizer/
├── content-summarizer-server.ts  # Main server implementation
├── index.ts                      # Entry point and exports
└── README.md                     # Documentation
```

### Adding New Summarization Styles

To add a new summarization style, update the `SUMMARY_TEMPLATES` object in `content-summarizer-server.ts`:

```typescript
const SUMMARY_TEMPLATES = {
  // Existing templates...

  // Add your new template
  newStyle:
    "Create a [description] summary of the following:\n\n{text}\n\nSummary:",
};
```

## License

MIT
