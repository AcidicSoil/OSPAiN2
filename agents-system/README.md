# Master Player System

Complete owner and controller of the Ollama ecosystem. Designed for sovereign AI principles with local-first infrastructure.

## Features

- **Central Control**: Unified management of all agents and tasks
- **Agent Orchestration**: Smart allocation of tasks to agents based on capabilities
- **Prompt Template System**: Standardized templates for different task types
- **Context Management**: Tracking of agent state and interactions
- **Success Pattern Analysis**: Learning from successful task executions
- **Direct Control Interface**: Simplified API for ecosystem control
- **Ownership Management**: Complete ownership of all system components

## Architecture

The Master Player system follows a layered architecture:

1. **Control Layer**: Direct interaction with users and external systems
2. **Management Layer**: Orchestration of agents, tasks, and resources
3. **Execution Layer**: Task execution and agent operations
4. **Storage Layer**: Persistence of data, patterns, and state

## Installation

### Requirements

- Python 3.8+
- Required packages:
  - pydantic
  - aiohttp
  - jinja2
  - typer
  - rich

### Installation Steps

```bash
# Clone the repository
git clone https://github.com/your-repo/agents-system.git

# Install the package
cd agents-system
pip install -e .
```

## Quick Start

### Option 1: Using the Master Control Script (Recommended)

The master-control script provides a unified interface for all operations:

```bash
# Make the script executable
chmod +x agents-system/master-control

# Initialize the Master Player
./master-control init

# Take control of the ecosystem
./master-control takeover

# Check status
./master-control status

# Create a task
./master-control create --name "Implement feature" --description "Add new functionality" --priority "HIGH" --capabilities "CODE_GENERATION"

# Execute a task
./master-control execute --task-id "task-123"

# Create and immediately execute a task
./master-control run --name "Implement feature" --description "Add new functionality"

# Run a batch of tasks from a JSON file
./master-control batch --batch-file example-batch.json

# Export success patterns
./master-control export-patterns --output-file patterns.json

# Shutdown the Master Player
./master-control shutdown
```

### Option 2: Using the Takeover Script

A simplified shell script for taking control:

```bash
# Make the script executable
chmod +x agents-system/takeover.sh

# Run the takeover script
./takeover.sh
```

### Option 3: Using the Direct Control Launcher

A Python-based launcher with command-line options:

```bash
# Make the launcher executable
chmod +x agents-system/direct_control_launcher.py

# Take control of the ecosystem
./direct_control_launcher.py take-control

# Check status
./direct_control_launcher.py status

# Create a task
./direct_control_launcher.py create-task --name "Implement feature" --description "Add new functionality" --priority "HIGH" --capabilities "CODE_GENERATION"

# Execute a task
./direct_control_launcher.py execute-task --task-id "task-123"
```

### Option 4: Using the Python API

```python
from agents_system.direct_control import DirectControl
import asyncio

async def main():
    # Initialize and take control
    direct = DirectControl()
    direct.take_control()
    
    # Create a task
    task_id = await direct.create_task(
        name="Build prototype",
        description="Create a working prototype",
        priority="HIGH",
        capabilities=["CODE_GENERATION", "TASK_PLANNING"]
    )
    
    # Execute the task
    result = await direct.execute_task(task_id)
    print(f"Task executed with success={result['success']}")
    
    # Shutdown
    direct.shutdown()

asyncio.run(main())
```

## Batch Task Execution

You can run multiple tasks as a batch by creating a JSON file with task definitions:

```json
[
  {
    "name": "Perform system analysis",
    "description": "Analyze the current system state",
    "priority": "HIGH",
    "horizon": "H1",
    "capabilities": ["SYSTEM_ADMINISTRATION", "DATA_ANALYSIS"]
  },
  {
    "name": "Generate documentation",
    "description": "Create comprehensive documentation",
    "priority": "MEDIUM",
    "capabilities": ["CODE_GENERATION"]
  }
]
```

Then run the batch:

```bash
./master-control batch --batch-file example-batch.json --output results.json
```

## Documentation

For comprehensive documentation, see:

- [Master Player Comprehensive Guide](docs/master-player-comprehensive.md): Complete system documentation
- [Master Player Patterns](docs/master-player.mdc): Success patterns and strategies
- [Task Agents Guide](docs/task-agents-guide.md): Detailed guide on task agent usage and implementation
- [Task Agent Architecture](docs/task-agent-architecture.md): Visual documentation of the task agent system
- [API Reference](docs/api-reference.md): Detailed API documentation
- [Getting Started Guide](docs/getting-started.md): Quick start guide
- [Concept Parking Lot](docs/parking-lot.mdc): Future ideas and concepts (Horizon 3)
- [Agent Competition System](docs/agent-competition-system.md): Detailed concept for the agent battle royale
- [Documentation TODO](docs/TODO.md): Upcoming documentation tasks

## System Components

### Core Components

- **MasterPlayer**: Central controller and owner
- **AgentManager**: Manages agents and task execution
- **ContextManager**: Maintains system and agent context
- **PromptEngine**: Handles prompt generation and analysis

### Interfaces

- **DirectControl**: Python API for ecosystem control
- **master-control**: Unified command-line interface
- **Takeover Script**: Shell interface for takeover
- **Command-line Launcher**: CLI for system control

## Task Management

Tasks are managed through a comprehensive system:

- **Task Schema**: Clear structure for task definition
- **Task Lifecycle**: From creation to completion and analysis
- **Task Priorities**: From CRITICAL to OPTIONAL
- **Task Horizons**: H1 (now), H2 (next), H3 (future)

## Success Patterns

The system learns from successful patterns:

- **Task Planning Patterns**: Strategies for planning tasks
- **Code Generation Patterns**: Effective code creation approaches
- **Problem Solving Patterns**: Methods for solving complex problems

## License

MIT License

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details. 