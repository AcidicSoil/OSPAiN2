# Getting Started with Master Player

This guide will help you quickly get started with the Master Player system and take control of the Ollama ecosystem.

## Prerequisites

- Python 3.8 or higher
- Git (for installation)
- Basic understanding of command-line interfaces

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/agents-system.git
   cd agents-system
   ```

2. Install the package:
   ```bash
   pip install -e .
   ```

3. Make the control scripts executable:
   ```bash
   chmod +x master-control
   chmod +x takeover.sh
   ```

## Quick Start

### Taking Control

The fastest way to take control of the Ollama ecosystem is with the master-control script:

```bash
./master-control takeover
```

This will:
- Initialize the Master Player
- Take ownership of the Ollama ecosystem
- Register essential agents
- Generate an ownership report

### Checking Status

To check the current status of the Master Player:

```bash
./master-control status
```

For more detailed status information:

```bash
./master-control status --verbose
```

## Working with Tasks

### Creating a Task

To create a new task:

```bash
./master-control create \
  --name "Implement search feature" \
  --description "Add search functionality to the application" \
  --priority "HIGH" \
  --capabilities "CODE_GENERATION,TASK_PLANNING"
```

This will return a task ID that you can use for execution.

### Executing a Task

To execute a task:

```bash
./master-control execute --task-id "task-123"
```

### Creating and Executing a Task in One Step

For convenience, you can create and execute a task in a single command:

```bash
./master-control run \
  --name "Fix bug in login" \
  --description "Address issue with login validation" \
  --priority "CRITICAL" \
  --capabilities "CODE_GENERATION"
```

### Running a Batch of Tasks

You can define multiple tasks in a JSON file:

```json
[
  {
    "name": "Analyze performance",
    "description": "Identify performance bottlenecks",
    "priority": "HIGH",
    "capabilities": ["DATA_ANALYSIS"]
  },
  {
    "name": "Update documentation",
    "description": "Update API documentation",
    "priority": "MEDIUM",
    "capabilities": ["CODE_GENERATION"]
  }
]
```

Then run them as a batch:

```bash
./master-control batch --batch-file tasks.json --output results.json
```

## Understanding Task Properties

### Task Priorities

- `CRITICAL`: Must be completed immediately
- `HIGH`: Important, prioritize over medium/low
- `MEDIUM`: Standard priority (default)
- `LOW`: Complete when resources available
- `OPTIONAL`: Can be skipped if resources limited

### Task Horizons

- `H1`: Current focus, actively being implemented (default)
- `H2`: Next in line, cleared for planning
- `H3`: Future considerations, deliberately distanced

### Agent Capabilities

- `TASK_PLANNING`: Breaking down complex tasks
- `CODE_GENERATION`: Writing and modifying code
- `FILE_OPERATIONS`: Manipulating files and directories
- `DATA_ANALYSIS`: Analyzing data and metrics
- `SYSTEM_ADMINISTRATION`: Managing system resources

## Learning from Success

The Master Player system learns from successful task executions. To export success patterns:

```bash
./master-control export-patterns --output-file patterns.json
```

## Shutdown

When you're done, you can shut down the Master Player:

```bash
./master-control shutdown
```

## Next Steps

- Read the [comprehensive documentation](master-player-comprehensive.md) for detailed information.
- Learn about [Task Agents](task-agents-guide.md) and how to create custom agents.
- Explore [Task Agent Architecture](task-agent-architecture.md) for visual diagrams of the system.
- Explore [success patterns](master-player.mdc) to understand effective strategies.
- Check the [API reference](api-reference.md) for programmatic usage.

## Troubleshooting

### Common Issues

1. **Permission denied when running scripts**:
   - Make sure you've made the scripts executable with `chmod +x`.

2. **ImportError when running scripts**:
   - Ensure you've installed the package with `pip install -e .`.

3. **No suitable agent found for task**:
   - Make sure you're specifying capabilities that match available agents.

### Getting Help

If you encounter issues not covered here, please:
1. Check the detailed documentation
2. Look for similar issues in the repository's issue tracker
3. Create a new issue with detailed information about your problem 