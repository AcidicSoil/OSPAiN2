# Text Cleanup Tool

A context-aware text pattern replacement tool for maintaining naming consistency across the codebase.

## Overview

The Text Cleanup Tool analyzes surrounding code context to determine the appropriate way to replace text patterns in different file types and contexts. This ensures naming consistency while respecting the specific conventions of each context (e.g., camelCase in code, TitleCase in headings, etc.).

## Features

- **Context-aware replacements**: Determines the appropriate replacement based on surrounding code context
- **Smart pattern detection**: Recognizes different contexts (code, documentation, shell scripts, etc.)
- **Batch processing**: Process multiple files with a single command
- **Dry-run preview**: Preview changes without modifying files
- **Detailed reporting**: Generate comprehensive reports of changes made
- **Regular expression support**: Use regex patterns for complex matching

## Installation

The tool is included in the OSPAiN2 repository. No additional installation is required.

## Usage

```bash
node text-cleanup.js [options]
```

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `-p, --pattern <pattern>` | Text pattern to search for (regex supported) | (required) |
| `-r, --replacement <replacement>` | Text to replace matches with (can be dynamic) | (optional when using --smart) |
| `-d, --directory <directory>` | Root directory to search in | `.` (current directory) |
| `-i, --include <glob>` | Glob pattern for files to include | `**/*.{js,ts,jsx,tsx,md,json,html,css}` |
| `-e, --exclude <dirs>` | Directories to exclude | `node_modules,.git,dist,build` |
| `-c, --context-lines <number>` | Number of context lines to analyze | `3` |
| `--dry-run` | Show what would be changed without making changes | `false` |
| `--smart` | Use smart replacement based on context | `false` |
| `--report <file>` | Output report file | `./cleanup-report.md` |

## Examples

### Basic Usage

Replace all instances of "oldName" with "newName":

```bash
node text-cleanup.js --pattern "oldName" --replacement "newName"
```

### Smart Replacement

Use context-aware replacement for "ollama-tag-cli":

```bash
node text-cleanup.js --pattern "ollama-tag-cli" --smart
```

### Dry Run

Preview changes without modifying files:

```bash
node text-cleanup.js --pattern "oldName" --replacement "newName" --dry-run
```

### Custom Report Location

Specify a custom location for the report file:

```bash
node text-cleanup.js --pattern "oldName" --replacement "newName" --report "./reports/cleanup-$(date +%Y%m%d).md"
```

### Limited Scope

Run only on specific file types in a specific directory:

```bash
node text-cleanup.js --pattern "oldName" --replacement "newName" --directory "./src" --include "**/*.js"
```

## Context-Aware Replacement

The tool analyzes surrounding context to determine appropriate replacements. Here's how it works:

### Code Context

When patterns appear in code contexts (functions, imports, variables), the tool uses appropriate code conventions:

```javascript
// Before
const ollamaTagCli = require('ollama-tag-cli');

// After (with --smart)
const t2p = require('t2p');
```

### Documentation Context

In documentation contexts (headings, descriptions), the tool uses appropriate documentation conventions:

```markdown
# Before: Ollama Tag CLI Documentation

# After (with --smart): T2P Documentation
```

### Shell Script Context

In script contexts (shell commands, npm scripts), the tool maintains the command-line convention:

```bash
# Before
npx ollama-tag-cli tag add --name "test"

# After (with --smart)
npx t2p tag add --name "test"
```

### Package Context

In package.json and dependency contexts, the tool follows npm naming conventions:

```json
// Before
"dependencies": {
  "ollama-tag-cli": "^1.0.0"
}

// After (with --smart)
"dependencies": {
  "t2p": "^1.0.0"
}
```

## Generating Reports

The tool generates detailed Markdown reports showing:
- Summary of changes
- Files modified
- Original text and replacements
- Context around each replacement

Example report:

```markdown
# Text Cleanup Report

Generated: 2025-03-15 12:34:56

## Summary

- **Search Pattern:** `ollama-tag-cli`
- **Replacement:** t2p
- **Files Scanned:** 23
- **Total Matches:** 45
- **Total Replacements:** 45
- **Mode:** Actual Changes
- **Smart Replacement:** Yes

## Replacements

### src/utils/config.js

| Original | Replacement | Context |
|----------|-------------|---------|
| `ollama-tag-cli` | `t2p` | import { config } from 'ollama-tag-cli/utils'; → const DEFAULT_CONFIG = { → name: |
```

## CI/CD Integration

The Text Cleanup Tool includes GitHub Actions workflows for continuous integration:

1. Runs tests on each PR or push to main branch
2. Generates consistency reports
3. Warns about naming inconsistencies
4. Provides artifacts with detailed reports

To view reports, check the GitHub Actions artifacts after each workflow run.

## Testing

Run the tests using:

```bash
mocha test/text-cleanup.test.js
```

The tests verify:
- Context-aware replacements work correctly
- Dry run mode preserves files
- Report generation works properly
- Different file types and contexts are handled appropriately

## Contributing

To enhance the text-cleanup.js tool:

1. Add more context patterns to the `analyzeContext` function
2. Add tests for new patterns
3. Update documentation for new features
4. Submit a PR with your changes

## License

MIT 