# Chat Export Tool

## Overview

The `chat-export-tool.js` script automates the export of chat conversations for prompt engineering analysis and template creation. It can identify patterns in conversations, categorize them by intent, and generate template starters to help prompt engineers improve AI interactions.

## Features

- **Conversation Export**: Export conversations to markdown, JSON, or CSV format
- **Intent Detection**: Automatically classify conversations by their primary intent
- **Pattern Analysis**: Identify common patterns and interaction styles
- **Template Generation**: Create starter templates based on conversation analysis
- **Filtering Options**: Filter exports by recency, source, and other criteria
- **Export Formats**: Support for markdown, JSON, and CSV export formats

## Usage

```bash
node chat-export-tool.js [options]
```

### Options

- `--source, -s <path>` - Source directory or file (default: ./logs/chat)
- `--destination, -d <path>` - Destination file (default: auto-generated)
- `--format, -f <format>` - Export format: markdown, json, or csv (default: markdown)
- `--analyze, -a` - Perform basic analysis on exports
- `--all` - Export all conversations (default: last 7 days)
- `--days <number>` - Number of days back to export (default: 7)
- `--help, -h` - Show help message

### Examples

#### Export all conversations in JSON format

```bash
node chat-export-tool.js --all --format json
```

#### Export conversations from custom source

```bash
node chat-export-tool.js --source ./custom/logs --days 30
```

#### Export and analyze conversations

```bash
node chat-export-tool.js --analyze
```

## Conversation Analysis

The tool can perform basic analysis on exported conversations, providing insights such as:

- **Intent Distribution**: Percentage of conversations by intent category
- **Message Length**: Average length of user and assistant messages
- **Common Patterns**: Frequency of tool usage, clarification requests, etc.
- **Template Suggestions**: Recommendations for templates based on conversation types

## Template Starters

The tool automatically generates template starters for common conversation types:

- **Implementation Template**: For building features, components, or systems
- **Troubleshooting Template**: For diagnosing and fixing issues
- **Explanation Template**: For explaining concepts and providing information

These templates can be found in the `./prompt-engineering/templates/` directory after running the tool.

## Export Formats

### Markdown (Default)

The markdown export format organizes conversations hierarchically with metadata, intents, and exchanges clearly marked. This format is ideal for human review and analysis.

### JSON

The JSON export provides a structured data format that can be easily processed programmatically. It includes all conversation metadata, exchanges, and analysis results.

### CSV

The CSV export format is suitable for importing into spreadsheet tools or data analysis software. Each row represents a single exchange in a conversation.

## Directory Structure

The tool creates and uses the following directory structure:

```
./prompt-engineering/
├── exports/           # Contains exported conversation files
│   └── analysis.md    # Analysis summary if --analyze is used
└── templates/         # Contains generated template starters
    ├── implementation-template.md
    ├── troubleshooting-template.md
    └── explanation-template.md
```

## Workflow for Prompt Engineers

1. **Export conversations**: Run the tool to export recent conversations
2. **Analyze patterns**: Review the analysis to identify successful patterns
3. **Refine templates**: Edit the template starters based on analysis
4. **Test templates**: Use the refined templates in new conversations
5. **Iterate**: Export new conversations and analyze results

## Benefits

- **Systematic Analysis**: Transform ad-hoc conversations into structured data
- **Pattern Discovery**: Identify what makes interactions successful
- **Template Development**: Create reusable templates that encode best practices
- **Quality Improvement**: Systematically improve AI interactions
- **Knowledge Sharing**: Share successful patterns across the team

## Related Documentation

- [MDC Naming Convention](./mdc-naming-convention.md)
- [System File Manager](./system-file-manager.md) 