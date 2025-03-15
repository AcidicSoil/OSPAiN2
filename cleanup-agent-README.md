# Cleanup Agent

An agentic workflow tool for recursively analyzing the codebase and identifying outdated files that may be candidates for cleanup.

## Overview

The Cleanup Agent uses contextual understanding from the project's Horizon Framework and other structured knowledge resources to intelligently identify files that may be outdated or no longer needed in the codebase.

It analyzes:
- File age and modification dates
- Import/export relationships between files
- Horizon classifications (H1/H2/H3)
- Code duplication and generated files
- Usage patterns

## Features

- **Recursive Analysis**: Walks through the entire repository
- **Horizon-Aware**: Uses horizon classifications to prioritize active work
- **Dependency Analysis**: Identifies orphaned files with exports but no imports
- **Git Integration**: Checks commit history for recent modifications
- **Safe Operation**: Defaults to dry-run mode with detailed reporting
- **Contextual Intelligence**: Integrates with OACL and Research Levels frameworks

## Usage

```bash
# Run in dry-run mode (default, no files will be deleted)
node cleanup-agent.js

# Run with actual deletion (use with caution)
node cleanup-agent.js --dry-run=false

# Change the age threshold (default 30 days)
node cleanup-agent.js --age-threshold=60

# Specify custom output path
node cleanup-agent.js --output=my-cleanup-report.md

# Turn off verbose logging
node cleanup-agent.js --verbose=false
```

## Output

The tool generates a detailed Markdown report that includes:
- Summary statistics
- List of potential cleanup candidates
- Reasons for each file being flagged
- Metrics about each file
- Recommended next steps

## Integration with Ollama Ecosystem

This tool is part of the OSPAiN2 project and integrates with:

1. **Horizon Framework**: Uses `@horizon-map.mdc` to understand active development paths
2. **OACL Framework**: Incorporates Optimized AI Command Language patterns
3. **Research Levels Framework**: Applies research maturity considerations to file analysis

## Workflow Integration

This agent works best as part of a larger system:

1. Run periodically to identify cleanup candidates
2. Review the generated report
3. Update horizon classifications for incorrectly flagged files
4. Run with `--dry-run=false` for approved deletions

## Configuration

The tool has sensible defaults, but you can modify the `CONFIG` object in the script to:
- Adjust ignore patterns
- Change which file extensions to analyze
- Update paths to framework files
- Modify the age threshold

## License

MIT 