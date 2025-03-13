# Architecture Mindmap Generator

## Overview

The Architecture Mindmap Generator is a tool that automatically creates visual representations and analysis of the T2P project's architecture. It leverages LLM technology to provide expert recommendations and identify potential improvements that might otherwise be overlooked.

## Features

- **Automated Architecture Analysis**: Scans the codebase to understand its structure and organization
- **Visual Mindmap Generation**: Creates both Markdown and Mermaid-based mindmaps for easy visualization
- **Expert Recommendations**: Uses LLM to analyze the architecture and suggest improvements
- **Daily Automation**: Can be configured to run automatically every day
- **Cross-Platform**: Supports Windows, macOS, and Linux scheduling

## How It Works

1. The mindmap generator scans the project's source files
2. It analyzes commands, services, types, and utilities
3. A mindmap is created showing the components and their relationships
4. The LLM analyzes the architecture to generate recommendations
5. All outputs are saved to the `mindmaps` directory

## File Outputs

For each run, the generator creates three files:

- `architecture-mindmap-YYYY-MM-DD.md`: A Markdown representation of the project structure
- `architecture-mindmap-YYYY-MM-DD.mermaid`: A Mermaid diagram of the architecture
- `architecture-recommendations-YYYY-MM-DD.md`: Expert recommendations for improvement

## Usage

### Manual Generation

To generate a mindmap on demand:

```bash
npm run generate-mindmap
```

### Setting Up Daily Generation

To configure the system to generate mindmaps automatically every day:

```bash
npm run setup-daily-mindmap
```

This will walk you through setting up scheduled execution based on your operating system:

- **Windows**: Creates a Windows Scheduled Task
- **macOS**: Sets up a Launch Agent
- **Linux**: Configures a Cron job

## Recommendation Process

The architecture recommendations are generated through the following process:

1. The project structure is analyzed and converted to a structured format
2. The LLM receives this structured representation along with specific prompts
3. The LLM analyzes the architecture against best practices and patterns
4. Recommendations are generated focusing on:
   - Maintainability
   - Extensibility
   - Performance
   - Error handling
   - User experience
5. Each recommendation includes:
   - A clear title
   - A detailed description explaining the reasoning
   - Example implementation code (where applicable)
   - Benefits of implementing the recommendation

## Customization

You can customize the mindmap generation by modifying the `generate-mindmap.ts` script:

- Add more source directories to analyze
- Change the output format
- Modify the LLM prompts for different types of recommendations
- Adjust the visualization style

## Technical Details

- TypeScript-based implementation
- Uses static analysis to understand code structure
- Leverages the LLM for intelligent recommendations
- Cross-platform scheduling support
- File-based caching to reduce redundant LLM calls

## Related Files

- `scripts/generate-mindmap.ts`: Main mindmap generation script
- `scripts/setup-daily-mindmap.ts`: Script to set up automated daily generation
- `src/services/llm-middleware.service.ts`: LLM integration for recommendations
