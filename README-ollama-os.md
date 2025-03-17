# OllamaOS: Agent Operating System

OllamaOS is a lightweight operating system abstraction for managing agent-based workflows in the Ollama ecosystem. It provides a structured environment for organizing development through horizons, modes, and specialized agents.

## Features

- **Development Mode Management**: Switch between design, engineering, testing, deployment and maintenance modes
- **Horizon Organization**: Organize work into current (H1), next (H2), and future (H3) horizons
- **Agent Specialization**: Configure agents specialized for different tasks and contexts
- **Knowledge Management**: Store and retrieve knowledge across different topics
- **Context Preservation**: Maintain context when switching between modes

## Installation

OllamaOS is implemented as a set of JavaScript and shell scripts that can be run in any Node.js environment.

### Prerequisites

- Node.js v14 or higher
- Git (for cloning the repository)

### Setup

1. OllamaOS is already part of the OSPAiN2 repository
2. Make the scripts executable:

```bash
# On Linux/macOS
chmod +x scripts/ollama-os.sh scripts/ollama-os.js

# On Windows, you can use the .bat file
```

## Usage

OllamaOS is operated through a simple command-line interface:

```bash
# On Linux/macOS
./scripts/ollama-os.sh [command] [subcommand] [options]

# On Windows
.\scripts\ollama-os.bat [command] [subcommand] [options]
```

### Available Commands

- `init` - Initialize OllamaOS in the current directory
- `mode` - Manage development modes
- `horizon` - Manage horizons
- `agent` - Manage agents
- `run` - Execute a task with an appropriate agent
- `knowledge` - Manage knowledge base
- `status` - Show system status
- `help` - Show help information

### Examples

```bash
# Initialize OllamaOS
./scripts/ollama-os.sh init

# Switch to design mode
./scripts/ollama-os.sh mode switch design "Starting UI component design"

# Create a new horizon
./scripts/ollama-os.sh horizon create H4

# Switch to a different horizon
./scripts/ollama-os.sh horizon switch H2

# Run a task with the appropriate agent
./scripts/ollama-os.sh run "Create a responsive button component"

# Add knowledge
./scripts/ollama-os.sh knowledge add authentication "JWT tokens should expire after 24 hours"

# Check system status
./scripts/ollama-os.sh status
```

## Agent Configuration

OllamaOS uses JSON configuration files to define agent behavior. These files are stored in the `.ollama-os/agents` directory.

### Sample Agent Configuration

```json
{
  "name": "design-agent",
  "description": "Specialized agent for design mode tasks",
  "version": "0.1.0",
  "capabilities": [
    "ui_design",
    "ux_research",
    "prototyping"
  ],
  "tools": [
    "codebase_search",
    "read_file",
    "edit_file",
    "web_search"
  ],
  "preferences": {
    "documentationLevel": "comprehensive",
    "verbosity": "high"
  }
}
```

## Directory Structure

OllamaOS creates the following directory structure:

```
.ollama-os/                  # Root directory for OllamaOS
├── agents/                  # Agent configurations
│   ├── default-agent.json
│   ├── design-agent.json
│   └── engineering-agent.json
├── knowledge/               # Knowledge base
│   └── authentication.md
└── logs/                    # System logs
    └── mode-transitions.log
```

## Integration with Ollama Ecosystem

OllamaOS is designed to integrate with other components of the Ollama ecosystem:

- **Development Mode Framework**: Uses the same mode concepts (design, engineering, testing, etc.)
- **Horizon Management**: Organizes work into H1, H2, H3 horizons
- **Context Management**: Preserves context across mode transitions
- **Sovereign Agent Framework**: Compatible with the Socratic-Stoic agent pattern

## Current Limitations

This is an initial implementation with some limitations:

- Agents do not yet integrate with LLM backends (simulated for now)
- Knowledge graph integration is minimal
- No GUI interface (command-line only)
- Limited cross-component communication

## Future Enhancements

Future versions will add:

- Integration with actual LLM models
- Full knowledge graph integration
- GUI dashboard for visualization
- Multi-agent coordination
- Extended plugin system for custom behaviors

## Contributing

Contributions are welcome! Please add improvements while maintaining the simplicity and clarity of the system.

## License

This project is part of the Ollama ecosystem and follows its licensing terms. 