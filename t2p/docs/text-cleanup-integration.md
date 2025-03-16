# T2P Text Cleanup Integration

This document describes how to use the `text-cleanup.js` tool to maintain consistent naming when migrating from `ollama-tag-cli` to `t2p`.

## Overview

The `text-cleanup.js` tool is a context-aware text replacement utility that can intelligently convert references from `ollama-tag-cli` to `t2p` based on surrounding code context. It ensures that the correct capitalization and format is used in different situations:

- In code contexts: `t2p` (lowercase)
- In documentation headings: `T2P` (title case)
- In CLI commands: `t2p` (lowercase)
- In package.json dependencies: `t2p` (lowercase)
- In file paths: `t2p` (lowercase)

## Prerequisites

- Node.js 16.x or higher
- Access to the OSPAiN2 repository

## Usage

### Basic Usage

To scan your codebase for `ollama-tag-cli` references and convert them to `t2p`:

```bash
node text-cleanup.js --pattern "ollama-tag-cli" --smart
```

### Dry Run

To preview changes without making them:

```bash
node text-cleanup.js --pattern "ollama-tag-cli" --smart --dry-run
```

### Specific Directories

To scan only specific directories:

```bash
node text-cleanup.js --pattern "ollama-tag-cli" --smart --directory "./src"
```

### Custom Report

To generate a custom report:

```bash
node text-cleanup.js --pattern "ollama-tag-cli" --smart --report "./reports/migration-report.md"
```

## Implementation Details

The tool uses several context detection patterns to determine the appropriate replacement:

### Code Context Detection

Detects code-related contexts like:
- Import/require statements
- Function definitions
- Variable declarations
- Class definitions
- Arrow functions
- Etc.

### Documentation Context Detection

Detects documentation-related contexts like:
- Markdown headings
- HTML headings
- Title elements
- README files
- Etc.

### CLI Context Detection

Detects command-line related contexts like:
- npm/yarn commands
- Shell scripts
- Terminal commands
- Code blocks with bash/shell syntax
- Etc.

## CI/CD Integration

The tool includes GitHub Actions workflow integration that automatically:
1. Runs tests to verify functionality
2. Generates naming consistency reports
3. Warns about inconsistencies over a threshold
4. Provides reports as artifacts

## Migration Strategy

For large codebases, we recommend the following migration strategy:

1. **Audit**: Run the tool in dry-run mode to identify all occurrences
2. **Review**: Check the generated report to ensure correct replacements
3. **Batch by Type**: Process files in batches by type (code first, then docs, etc.)
4. **Verify**: Run tests after each batch to ensure functionality
5. **Final Pass**: Do a final pass to catch any missed references

## Example Report

```markdown
# Text Cleanup Report

Generated: 2025-03-15 12:34:56

## Summary

- **Search Pattern:** `ollama-tag-cli`
- **Replacement:** t2p (smart replacement)
- **Files Scanned:** 125
- **Total Matches:** 45
- **Total Replacements:** 45
- **Mode:** Actual Changes
- **Smart Replacement:** Yes

## Replacements

### src/utils/config.js

| Original | Replacement | Context |
|----------|-------------|---------|
| `ollama-tag-cli` | `t2p` | import { config } from 'ollama-tag-cli/utils'; |
```

## Troubleshooting

### Common Issues

1. **Incorrect Replacements**: If the tool makes incorrect replacements, you can:
   - Add more context patterns in the `analyzeContext` function
   - Use a specific replacement with the `--replacement` flag
   - Manually fix specific cases

2. **Missing Files**: Check the `--include` and `--exclude` flags to ensure all relevant files are scanned

3. **Performance Issues**: For very large codebases, try processing directories one at a time

## Contributing

To enhance the text-cleanup.js tool for T2P integration:

1. Add more t2p-specific context patterns
2. Create additional test cases for t2p migration scenarios
3. Update documentation with common migration patterns

## License

MIT 