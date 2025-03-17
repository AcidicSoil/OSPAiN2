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

# Ollama Ecosystem Report Generation System

A comprehensive system for generating standardized dark and light reports within the Ollama Ecosystem project. This system integrates with our existing agent workflow and documentation standards to provide consistent, well-structured reports for various purposes.

## Features

### Dark Reports

- Sensitive technical findings and security assessments
- Multiple security levels (restricted, confidential, top-secret)
- Detailed technical analysis and risk assessment
- Structured findings with severity levels
- Comprehensive mitigation recommendations

### Light Reports

- General project updates and progress tracking
- Multiple visibility levels (public, internal, team)
- Structured sections with optional subsections
- Metric tracking with targets and status indicators
- Action-oriented next steps

## Installation

```bash
npm install
```

## Usage

### Generating a Dark Report

```typescript
import { StandardReportGenerator, ReportType } from './models';

const generator = new StandardReportGenerator('./reports');

const darkReport = await generator.generateReport(ReportType.DARK, {
  title: 'Security Assessment Report',
  securityLevel: 'confidential',
  technicalDetails: {
    systemAccess: ['Root access detected on system A'],
    vulnerabilities: ['CVE-2024-1234: Critical SQL injection vulnerability'],
    exploitationRisks: ['Remote code execution possible'],
    mitigationSteps: ['Update database to version 5.0.8']
  },
  findings: [
    {
      severity: 'critical',
      description: 'Unauthorized access vulnerability in API endpoint',
      evidence: 'Successful exploitation demonstrated in test environment',
      recommendations: ['Implement rate limiting', 'Add request validation']
    }
  ],
  riskAssessment: {
    overallRisk: 'high',
    impactAnalysis: 'Critical business impact if exploited',
    probabilityMatrix: 'High likelihood of exploitation'
  }
});
```

### Generating a Light Report

```typescript
const lightReport = await generator.generateReport(ReportType.LIGHT, {
  title: 'Sprint Progress Report',
  visibility: 'internal',
  sections: [
    {
      title: 'Sprint Overview',
      content: 'Completed 15 out of 20 planned stories',
      subsections: [
        {
          title: 'Key Achievements',
          content: 'Successfully deployed new authentication system'
        }
      ]
    }
  ],
  metrics: [
    {
      name: 'Sprint Velocity',
      value: 45,
      target: 50,
      status: 'warning'
    }
  ],
  nextSteps: [
    {
      action: 'Complete remaining stories',
      assignee: 'dev-team',
      dueDate: new Date('2024-03-20'),
      priority: 'high'
    }
  ]
});
```

## Report Structure

### Dark Report Fields

- `id`: Unique identifier
- `type`: ReportType.DARK
- `title`: Report title
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp
- `createdBy`: Author identifier
- `status`: 'draft' | 'complete'
- `tags`: Array of tags
- `horizon`: 'H1' | 'H2' | 'H3'
- `priority`: 1-5
- `mode`: Development mode indicator
- `securityLevel`: Security classification
- `technicalDetails`: Technical findings
- `findings`: Array of findings
- `riskAssessment`: Risk analysis

### Light Report Fields

- `id`: Unique identifier
- `type`: ReportType.LIGHT
- `title`: Report title
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp
- `createdBy`: Author identifier
- `status`: 'draft' | 'complete'
- `tags`: Array of tags
- `horizon`: 'H1' | 'H2' | 'H3'
- `priority`: 1-5
- `mode`: Development mode indicator
- `visibility`: Access level
- `sections`: Report content sections
- `metrics`: Performance metrics
- `nextSteps`: Action items

## Development

### Running Tests

```bash
npm test
```

### Building

```bash
npm run build
```

### Linting

```bash
npm run lint
```

## Integration with Agent Workflow

The report generation system integrates with our agent workflow system:

1. Reports are automatically tagged with the current development mode
2. Reports respect the horizon classification system
3. Reports can be linked to specific agent tasks and workflows
4. Report templates enforce our documentation standards

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT

# MCP Monitoring System

A monitoring system for tracking changes in Model Context Protocol (MCP) tools and codebase changes. This system uses a workflow-based approach to analyze and report on changes in the development environment.

## Features

- Automated monitoring of MCP tools and capabilities
- Git repository change tracking
- Configurable monitoring intervals
- Workflow-based analysis pipeline
- Context hub integration for intelligent decision making
- Event-based architecture for real-time updates

## Architecture

The system is built using a workflow graph architecture with the following components:

- **WorkflowGraph**: Core engine for executing monitoring tasks
- **MCPMonitoringService**: Main service coordinating monitoring activities
- **Configuration System**: Flexible configuration with validation
- **Event System**: Real-time event handling and reporting

### Workflow Nodes

1. **Git Monitor Node**
   - Tracks changes in the codebase
   - Analyzes commit patterns
   - Reports on file modifications

2. **MPC Monitor Node**
   - Monitors MPC tool availability
   - Tracks tool versions and capabilities
   - Reports on new or deprecated features

3. **Analysis Node**
   - Processes data from Git and MPC monitors
   - Generates insights and recommendations
   - Identifies patterns and trends

4. **Context Hub Node**
   - Integrates with the context management system
   - Updates knowledge base
   - Provides historical context

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd mcp-monitoring
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the project:
   ```bash
   npm run build
   ```

## Configuration

The system can be configured through environment variables or a configuration file. Default configuration is provided in `src/config/monitoring.ts`.

Example configuration:

```typescript
{
  checkInterval: 5 * 60 * 1000, // 5 minutes
  mpcCheckSchedule: '0 * * * *', // Every hour
  gitCheckSchedule: '0 0 * * *', // Daily at midnight
  outputPath: 'data/monitoring',
  contextHubPath: 'data/context-hub'
}
```

## Usage

Start the monitoring service:

```bash
npm run start:monitoring
```

The service will begin monitoring according to the configured schedules. Events will be emitted for:
- Monitoring cycle completion
- Error conditions
- Significant changes detected

## Development

### Running Tests

```bash
npm test
```

### Adding New Monitoring Capabilities

1. Create a new node processor in `src/processors/`
2. Register the processor in `MCPMonitoringService`
3. Add appropriate test coverage
4. Update documentation

### Workflow Graph

The workflow graph system supports:
- Custom node types
- Data type validation
- Cycle detection
- Error handling
- Event emission

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - see LICENSE file for details
