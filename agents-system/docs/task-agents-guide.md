# Task Agents User Guide

## Overview

Task Agents are specialized autonomous components in the Ollama ecosystem that can execute various tasks based on their capabilities. This guide will help you understand how task agents work, how to create them, and how to effectively use them in your applications.

For a visual representation of the Task Agent architecture and workflow, see the [Task Agent Architecture](task-agent-architecture.md) document.

## Task Agent Architecture

### Core Components

1. **BaseAgent** - Abstract base class that all agents inherit from
2. **TaskAgent** - Implementation of an agent that can execute tasks
3. **AgentManager** - Orchestrates multiple agents and task assignments
4. **TaskSchema** - Represents a task to be executed
5. **TaskResult** - Contains the result of a task execution

### Agent Capabilities

Agents declare their capabilities upon creation, determining what tasks they can handle:

- `TASK_PLANNING`: Breaking down complex tasks into manageable subtasks
- `CODE_GENERATION`: Writing and modifying code
- `FILE_OPERATIONS`: Performing file system operations
- `DATA_ANALYSIS`: Analyzing data and generating insights
- `SYSTEM_ADMINISTRATION`: Managing system resources and configuration

## Creating a Task Agent

### Basic Task Agent

```python
from agents_system.core.agent import TaskAgent
from agents_system.core.schema import AgentCapability

# Create a basic task agent
agent = TaskAgent(
    "agent-id",  # Unique identifier
    "My Task Agent",  # Descriptive name
    [AgentCapability.TASK_PLANNING, AgentCapability.CODE_GENERATION]  # Capabilities
)
```

### Custom Task Agent Implementation

To create a custom task agent with specialized behavior:

```python
from agents_system.core.agent import TaskAgent
from agents_system.core.schema import TaskSchema
from typing import Tuple, Optional, Dict, Any

class CustomTaskAgent(TaskAgent):
    """A specialized task agent with custom implementation."""
    
    async def _execute_task_impl(self, task: TaskSchema) -> Tuple[bool, str, Optional[str], Optional[Dict[str, Any]]]:
        """Custom implementation of task execution.
        
        Args:
            task: The task to execute.
            
        Returns:
            A tuple of (success, summary, details, artifacts).
        """
        # Your custom implementation here
        if task.name == "special_task":
            # Special handling for this task
            return (True, "Executed special task", "Details about special execution", {"special_data": "value"})
        
        # Fall back to default implementation for other tasks
        return await super()._execute_task_impl(task)
```

## Task Management

### Creating Tasks

Tasks are represented by the `TaskSchema` class and can be created as follows:

```python
from agents_system.core.schema import TaskSchema, TaskPriority, TaskHorizon, AgentCapability

# Create a task
task = TaskSchema(
    name="Implement user authentication",
    description="Create a secure authentication system with OAuth2 support",
    priority=TaskPriority.HIGH,
    horizon=TaskHorizon.H1,
    capabilities_required=[AgentCapability.CODE_GENERATION],
    metadata={
        "language": "Python",
        "framework": "FastAPI",
        "database": "PostgreSQL"
    }
)
```

### Task Properties

- **Priority Levels**:
  - `CRITICAL`: Must be completed immediately
  - `HIGH`: Important, prioritize over medium/low
  - `MEDIUM`: Standard priority (default)
  - `LOW`: Complete when resources available
  - `OPTIONAL`: Can be skipped if resources limited

- **Horizon Values**:
  - `H1`: Current focus, actively being implemented (default)
  - `H2`: Next in line, cleared for planning
  - `H3`: Future considerations, deliberately distanced

### Task Lifecycle

1. **Creation**: Task is created and registered with `AgentManager`
2. **Assignment**: Task is assigned to a suitable agent based on capabilities
3. **Execution**: Agent executes the task and reports progress
4. **Completion**: Task is marked as completed or failed
5. **Analysis**: Success patterns are recorded for future optimization

## Using the Agent Manager

The `AgentManager` orchestrates agents and task execution:

```python
from agents_system.core.manager import AgentManager
from agents_system.core.agent import TaskAgent
from agents_system.core.schema import TaskSchema

# Create manager
manager = AgentManager()

# Register agents
manager.register_agent(agent1)
manager.register_agent(agent2)

# Register task
task_id = manager.register_task(task)

# Execute task (auto-assigns to best agent)
result = await manager.execute_task(task)

# Execute task with specific agent
result = await manager.execute_task(task, agent_id="agent-id")

# Execute multiple tasks in parallel
results = await manager.execute_tasks([task1, task2, task3], parallel=True)

# Get task result
result = manager.get_task_result(task_id)
```

## Advanced Features

### Subtasks

Tasks can contain subtasks that are executed as part of the main task:

```python
# Add subtasks to a task
task.add_subtask("Research OAuth2 providers")
task.add_subtask("Design database schema")
task.add_subtask("Implement authentication routes")
```

### Task Metadata

Use metadata to provide additional context to the agent:

```python
task.metadata = {
    "language": "Python",
    "framework": "Django",
    "requirements": ["Must support 2FA", "Use PostgreSQL for storage"],
    "references": ["https://example.com/auth-docs"],
    "deadline": "2023-12-31"
}
```

### Success Pattern Analysis

The system analyzes successful task executions to improve future performance:

```python
# Export success patterns
patterns = manager._export_success_patterns()

# Apply patterns to new tasks
manager._apply_patterns_to_task(task)
```

## Integration with Master Player

The `MasterPlayer` provides a high-level interface for working with agents:

```python
from agents_system.core.master_player import MasterPlayer

# Initialize Master Player
master = MasterPlayer()
master.start()

# Create task through Master Player
task = await master.create_task(
    name="Generate API documentation",
    description="Create comprehensive API docs",
    priority="HIGH",
    horizon="H1",
    capabilities_required=[AgentCapability.CODE_GENERATION]
)

# Execute task
result = await master.execute_task(task)

# Get performance metrics
metrics = master.get_agent_performance()
```

## Example Workflows

### Task Planning Workflow

```python
# 1. Create planning agent
planning_agent = TaskAgent("planner", "Planning Agent", [AgentCapability.TASK_PLANNING])

# 2. Register with manager
manager.register_agent(planning_agent)

# 3. Create planning task
planning_task = TaskSchema(
    name="Plan application architecture",
    description="Design the architecture for our new application",
    capabilities_required=[AgentCapability.TASK_PLANNING]
)

# 4. Execute planning task
planning_result = await manager.execute_task(planning_task)

# 5. Use planning output for subsequent tasks
architecture_plan = planning_result.artifacts.get("architecture_plan")
for component in architecture_plan["components"]:
    implementation_task = TaskSchema(
        name=f"Implement {component['name']}",
        description=component["description"],
        capabilities_required=[AgentCapability.CODE_GENERATION]
    )
    await manager.execute_task(implementation_task)
```

### Concurrent Task Execution

```python
# Create multiple tasks
tasks = []
for feature in features:
    task = TaskSchema(
        name=f"Implement {feature['name']}",
        description=feature["description"],
        capabilities_required=[AgentCapability.CODE_GENERATION]
    )
    tasks.append(task)

# Execute tasks in parallel
results = await manager.execute_tasks(tasks, parallel=True)

# Process results
successful = [r for r in results if r.success]
failed = [r for r in results if not r.success]
```

## Best Practices

1. **Assign Appropriate Capabilities**: Only assign capabilities that an agent can truly fulfill
2. **Use Specific Task Descriptions**: Provide clear, detailed task descriptions
3. **Include Relevant Metadata**: Add useful context in task metadata
4. **Handle Task Dependencies**: Ensure dependent tasks are executed in proper order
5. **Implement Error Recovery**: Design agents to handle and recover from errors
6. **Monitor Agent Performance**: Regularly check agent performance metrics
7. **Update Agent Capabilities**: Adjust capabilities as agent functionality evolves

## Troubleshooting

### Common Issues

1. **No Suitable Agent Found**: Ensure at least one agent has the required capabilities for your task
2. **Task Execution Failed**: Check the error message in the task result for specific issues
3. **Agent is Busy**: Agents can only handle one task at a time, wait or create additional agents
4. **Performance Issues**: Consider optimizing agent implementation or distributing tasks

### Logging

Enable detailed logging to troubleshoot issues:

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## API Reference

For complete API documentation, see the [API Reference](api-reference.md).

## Next Steps

- Learn about [Prompt-Driven Agents](prompt-driven-agents.md)
- Explore [Agent Communication Protocols](agent-communication.md)
- Understand [Master Player Integration](master-player-comprehensive.md) 