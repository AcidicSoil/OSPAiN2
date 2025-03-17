# OSPAiN2 - Ollama Ecosystem Project

This repository contains tools and utilities for the Ollama Ecosystem, with a focus on local-first infrastructure and agentic workflow automation.

## Agentic Workflow System

The project implements an agentic workflow system that integrates various knowledge frameworks:

1. **Horizon Framework** - Classifies tasks and resources into implementation horizons (H1/H2/H3)
2. **OACL (Optimized AI Command Language)** - Provides structured communication patterns
3. **Research Levels Framework** - Organizes knowledge acquisition and research maturity
4. **CleanupAgent** - Recursively analyzes and identifies cleanup candidates

## Components

### OSPAiN2-Hub Frontend

The OSPAiN2-Hub Frontend is a modern web application for interacting with the OSPAiN2 ecosystem. The project is currently being rebuilt with a modern stack including Vite, React, TypeScript, and Tailwind CSS. Key features include:

- Dashboard for ecosystem monitoring
- T2P Engine interface
- Agent Competition System
- Task Management
- Settings and Configuration

For more information, see:

- [Frontend Documentation Index](./docs/frontend/index.md)
- [Frontend Architecture](./docs/frontend/architecture.md)
- [Frontend Project Summary](./docs/frontend/summary.md)

### CleanupAgent

The CleanupAgent is an agentic tool that analyzes the codebase recursively to identify outdated files and cleanup candidates. It integrates with the Horizon Framework to preserve active development resources while suggesting cleanup for potentially obsolete files.

Features:

- Recursive codebase analysis
- Horizon-aware classification
- Dependency tracking
- Git integration for history analysis
- Safe operation with dry-run mode

Usage:

```bash
# Basic analysis (dry run mode)
node cleanup-agent.js

# Analysis with specific settings
node cleanup-agent.js --dry-run=true --age-threshold=60 --output=my-report.md

# Cleanup mode (with deletion)
node cleanup-agent.js --dry-run=false
```

### CleanupSystem

The CleanupSystem provides a comprehensive CLI for managing the cleanup workflow with additional utilities for todo integration and horizon management.

```bash
# Install dependencies
npm install

# Run analysis
npm run cleanup:analyze

# Run weekly cleanup check
npm run cleanup:weekly

# Manage horizon classifications
npm run cleanup:horizon
```

Advanced usage:

```bash
# Run analysis with custom options
node cleanup-system.js analyze --age-threshold 45 --add-todo --switch-mode

# Run cleanup with deletion (caution!)
node cleanup-system.js cleanup --dry-run false

# Update horizon map from latest report
node cleanup-system.js horizon
```

## Knowledge Management Framework

The project uses a structured knowledge management approach with specialized memory data containers (MDC):

- **@horizon-map.mdc** - Maps development priorities across time horizons
- **oacl.mdc** - Defines optimized AI command language patterns
- **research-levels-framework.mdc** - Classifies research and knowledge maturity

## Development Modes

The project supports different development modes:

- **🎨 Design Mode** - UI/UX structuring, component architecture
- **🔧 Engineering Mode** - Core functionality, business logic
- **🧪 Testing Mode** - Quality assurance, edge cases
- **📦 Deployment Mode** - Release readiness, CI/CD
- **🔍 Maintenance Mode** - Ongoing health, improvements

Switch modes using the `m` command:

```bash
./development-modes/m switch maint "Running maintenance operations"
```

## Task Management

Tasks are managed using the t2p CLI tool:

```bash
# Add new todo item
t2p todo add --priority 2 --horizon H1 --category "Documentation" --tags "docs" --title "Update API docs"

# List todos
t2p todo list --priority 1 --status "in-progress"
```

## Documentation

- [Frontend Documentation](./docs/frontend/index.md)
- [Agentic Workflow Documentation](./agentic-workflow.md)
- [CleanupAgent README](./cleanup-agent-README.md)
- [CleanupAgent Integration Guide](./cleanup-agent-integration.md)
- [Master Todo List](./docs/master-todo.md)
- [Project Documentation](docs/)
- [Development Guidelines](docs/development-guidelines.md)
- [MDC Naming Convention](docs/mdc-naming-convention.md)
- [API References](docs/api/)

## Tools

- [system-file-manager.sh](./system-file-manager.sh) - Manages system-level MDC files with @ prefix convention ([Documentation](docs/system-file-manager.md))
- [chat-export-tool.js](./chat-export-tool.js) - Exports conversations for prompt engineering analysis and template creation
- [text-cleanup.js](./text-cleanup.js) - Context-aware pattern replacement tool for maintaining codebase consistency ([Documentation](docs/text-cleanup.md))

## Intelligent Context Distribution System

An advanced system for intelligently distributing context across related files in a codebase, creating smooth transitions between related information, and visualizing context relationships.

## Overview

This system helps manage context relationships between files in large codebases by:

1. **Analyzing content similarities** - Identifies relationships between files based on content analysis
2. **Distributing context references** - Adds appropriate `@tag` references to connect related files
3. **Creating transition maps** - Builds optimal paths between different contexts
4. **Visualizing relationships** - Generates interactive visualizations of the context network

## Features

- Intelligent context similarity detection
- Smart placement of context references
- Multi-hop context transitions
- Interactive network visualization
- Optimized paths between important contexts
- Smooth context handoffs

## Installation

Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd context-system
npm install
```

## Usage

### Quick Start

Run the complete pipeline with:

```bash
node context-runner.js
```

This will:

1. Analyze your codebase
2. Distribute context across related files
3. Generate transition maps
4. Create visualizations

### Individual Components

You can also run each component separately:

#### Context Distribution

```bash
node context-distributor.js
```

Analyzes files and adds `@tag` references to connect related contexts.

#### Context Transition Management

```bash
node context-transition-manager.js
```

Creates transition maps for smooth navigation between related contexts.

#### Context Visualization

```bash
node context-visualization.js
```

Generates an interactive D3.js visualization of context relationships.

### Command Line Options

The runner supports several options:

```bash
node context-runner.js --help
```

Options include:

- `--help, -h` - Display help information
- `--skip=<step>` - Skip a specific step (1, 2, or 3)
- `--only=<step>` - Run only a specific step (1, 2, or 3)

## System Components

### Context Distributor

The `context-distributor.js` script:

- Scans source directories
- Extracts context from files (concepts, keywords, summary)
- Builds a context similarity graph
- Distributes context references to related files

Configuration options include:

- `SOURCE_DIRS` - Directories to scan for files
- `OUTPUT_DIR` - Where to write enhanced files
- `MIN_SIMILARITY_SCORE` - Threshold for including references

### Context Transition Manager

The `context-transition-manager.js` script:

- Generates transition maps between contexts
- Finds optimal paths between important nodes
- Calculates shared concepts along paths
- Creates individual transition map files

Key concepts:

- **Direct connections** - One-hop relationships between files
- **Two-hop connections** - Connections through an intermediate file
- **Optimal paths** - Shortest paths between important contexts
- **Important nodes** - Files with high connectivity or important types

### Context Visualization

The `context-visualization.js` script:

- Creates an interactive D3.js visualization
- Shows relationships between files
- Allows filtering by file type and concepts
- Highlights connections on hover
- Provides detailed information on click

Visualization features:

- Zoom and pan controls
- Filters for file types and concepts
- Link strength adjustment
- Node and link highlighting
- Detailed information panels

## Output Structure

After running the system, you'll find several directories:

- `.cursor/context-enhanced/` - Files with added context references
- `.cursor/transition-maps/` - Transition maps for each file
- `.cursor/visualizations/` - Interactive visualization files
- `.cursor/context-graph.json` - Complete context relationship graph
- `.cursor/context-system/run-log.txt` - Execution log

## Example Context Reference

In a file, context references look like:

```
<!-- Context Connections -->

## Related Rule Files
@tool-call-optimization(Provides optimization strategies related to tool, call)
@error-handling-best-practices(Related context for error, handler, optimization)

## Related Documentation Files
@development-mode-overview(Establishes framework components for mode, development)
```

## Customization

You can customize the system by modifying the configuration values at the top of each script:

### context-distributor.js

```javascript
const SOURCE_DIRS = ['.cursor/rules', 'src', 'docs', 'tests'];
const OUTPUT_DIR = '.cursor/context-enhanced';
const MIN_SIMILARITY_SCORE = 0.15;
const MAX_CONTEXT_REFERENCES = 7;
```

### context-transition-manager.js

```javascript
const TRANSITION_MAPS_DIR = '.cursor/transition-maps';
const MAX_PATH_LENGTH = 5;
const MIN_SIMILARITY_THRESHOLD = 0.1;
```

## Context Transition Strategy

The system uses multiple strategies to create smooth context transitions:

1. **Similarity-based** - Connect files with similar content
2. **Concept-based** - Group files sharing the same concepts
3. **File type awareness** - Consider relationships between different types of files
4. **Multi-hop paths** - Build paths through intermediate files for smoother transitions
5. **Importance-weighted** - Prioritize important hub nodes in the context graph

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

# Deep Research Integration

This project integrates three powerful systems to enable deep, AI-enhanced research capabilities:

1. **Deep Researcher TS**: A Node.js service that performs deep research on topics using the Tavily API and LLMs
2. **OpenManus**: A system that enhances research results with additional analysis and insights
3. **OpenWeb-UI**: A web interface for interacting with Ollama and research capabilities

## Quick Start

### Prerequisites

- [Ollama](https://ollama.ai/) installed and running
- [Docker](https://www.docker.com/products/docker-desktop/) and Docker Compose installed
- A [Tavily API key](https://tavily.com/) (free tier available)

### Setup

1. Run the setup script:

   **Windows**:

   ```
   setup-research-environment.bat
   ```

   **Linux/macOS**:

   ```
   ./setup-research-environment.sh
   ```

   This script will:
   - Check for prerequisites
   - Create necessary directories and configuration files
   - Start all required services

2. Access the web UI:

   Open [http://localhost:8080](http://localhost:8080) in your browser

## Usage

### T2P Command Line

Use the research command via t2p:

```bash
# Basic research
t2p research "history of artificial intelligence"

# Research with more iterations for deeper results
t2p research "climate change impacts" --iterations=5

# Enhanced research (processed through OpenManus)
t2p research "quantum computing" --enhance

# Save to custom directory
t2p research "renewable energy" --output=./my-research
```

### React Component

Import and use the ResearchPanel component in your React applications:

```jsx
import { ResearchPanel } from './components/ResearchPanel';

function App() {
  return (
    <div className="App">
      <h1>Deep Research Tool</h1>
      <ResearchPanel />
    </div>
  );
}
```

### React Hook

For custom implementations, use the useDeepResearcher hook:

```typescript
import { useDeepResearcher } from './hooks/useDeepResearcher';

function CustomResearchComponent() {
  const {
    startResearch,
    cancelResearch,
    isLoading,
    progress,
    results,
    error
  } = useDeepResearcher();

  const handleStartResearch = () => {
    startResearch({
      topic: "space exploration",
      iterations: 3,
      includeSourceDetails: true
    });
  };

  return (
    <div>
      <button onClick={handleStartResearch} disabled={isLoading}>
        Start Research
      </button>
      {isLoading && <p>Progress: {progress}%</p>}
      {error && <p>Error: {error}</p>}
      {results?.summary && (
        <div>
          <h3>Research Results</h3>
          <div>{results.summary}</div>
        </div>
      )}
    </div>
  );
}
```

## Architecture

The integration connects these systems via Docker Compose:

```
+-----------------+       +---------------+       +--------------+
| OpenWeb-UI      |------>| Deep          |------>| OpenManus    |
| (Web Interface) |<------| Researcher    |<------| (Enhancer)   |
+-----------------+       +---------------+       +--------------+
        ^                         ^
        |                         |
        v                         v
+-----------------+       +---------------+
| Browser         |       | Ollama        |
| (User)          |       | (LLM Service) |
+-----------------+       +---------------+
```

## Configuration

Environment variables can be configured in `.env` files or through Docker Compose. Key variables:

- `TAVILY_API_KEY`: API key for the Tavily search service
- `LLM_BASE_URL`: URL for the Ollama API (default: <http://host.docker.internal:11434>)
- `MODEL_NAME`: LLM model to use (default: llama3)
- `RESEARCH_ITERATIONS`: Default research depth (default: 3)

## Troubleshooting

If services fail to start:

1. Check Ollama is running with `ollama list`
2. Verify Docker is running
3. Check logs with `docker-compose -f docker-compose.research.yml logs`
4. Ensure ports 2024, 3006, and 8080 are available

## License

MIT
