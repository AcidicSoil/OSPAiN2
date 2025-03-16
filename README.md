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

## License

MIT
