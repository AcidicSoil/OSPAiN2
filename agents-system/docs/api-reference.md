# Master Player: API Reference

This document provides a detailed reference for the Master Player system's APIs.

## Table of Contents

1. [MasterPlayer Class](#masterplayer-class)
2. [DirectControl Class](#directcontrol-class)
3. [AgentManager Class](#agentmanager-class)
4. [Agent Classes](#agent-classes)
5. [PromptEngine Class](#promptengine-class)
6. [ContextManager Class](#contextmanager-class)
7. [Schema Classes](#schema-classes)

## MasterPlayer Class

The central controller for the entire system.

### Constructor

```python
def __init__(self, data_dir=None, config_path=None)
```

**Parameters:**
- `data_dir (str, optional)`: Directory for storing the Master Player's data. Defaults to "~/ollama-ecosystem/master-player".
- `config_path (str, optional)`: Path to a configuration file. Defaults to None.

### Methods

```python
def start(self) -> None
```
Takes ownership of the Ollama ecosystem and initializes all subsystems.

---

```python
def stop(self) -> None
```
Shutdown the Master Player and releases resources.

---

```python
def register_agent(self, agent, ownership_level="complete") -> None
```
Registers an agent with the Master Player.

**Parameters:**
- `agent (BaseAgent)`: The agent to register.
- `ownership_level (str, optional)`: Level of ownership. Options: "complete", "partial", "managed". Defaults to "complete".

---

```python
def unregister_agent(self, agent_id) -> bool
```
Unregisters an agent from the Master Player.

**Parameters:**
- `agent_id (str)`: ID of the agent to unregister.

**Returns:**
- `bool`: True if successful, False otherwise.

---

```python
async def create_task(self, name, description=None, priority=TaskPriority.MEDIUM, horizon=TaskHorizon.H1, capabilities_required=None, metadata=None) -> TaskSchema
```
Creates a new task.

**Parameters:**
- `name (str)`: Name of the task.
- `description (str, optional)`: Description of the task. Defaults to None.
- `priority (TaskPriority, optional)`: Priority of the task. Defaults to TaskPriority.MEDIUM.
- `horizon (TaskHorizon, optional)`: Horizon of the task. Defaults to TaskHorizon.H1.
- `capabilities_required (List[AgentCapability], optional)`: Required capabilities. Defaults to None.
- `metadata (Dict[str, Any], optional)`: Additional metadata. Defaults to None.

**Returns:**
- `TaskSchema`: The created task.

---

```python
async def execute_task(self, task) -> TaskResult
```
Executes a task.

**Parameters:**
- `task (TaskSchema or str)`: The task to execute or its ID.

**Returns:**
- `TaskResult`: The result of the task execution.

---

```python
async def execute_batch(self, tasks, parallel=True) -> List[TaskResult]
```
Executes multiple tasks.

**Parameters:**
- `tasks (List[TaskSchema or str])`: The tasks to execute or their IDs.
- `parallel (bool, optional)`: Whether to execute tasks in parallel. Defaults to True.

**Returns:**
- `List[TaskResult]`: The results of the task executions.

---

```python
def get_agent_performance(self) -> Dict[str, Dict[str, Any]]
```
Get performance metrics for all agents.

**Returns:**
- `Dict[str, Dict[str, Any]]`: Performance metrics for each agent.

---

```python
def get_ownership_report(self) -> Dict[str, Any]
```
Get a report of all owned components.

**Returns:**
- `Dict[str, Any]`: Ownership report.

## DirectControl Class

Provides a simplified interface for controlling the Master Player.

### Constructor

```python
def __init__(self, data_dir=None)
```

**Parameters:**
- `data_dir (str, optional)`: Directory for storing the Master Player's data. Defaults to "~/ollama-ecosystem/master-player".

### Methods

```python
def initialize(self) -> bool
```
Initializes the Master Player.

**Returns:**
- `bool`: True if successful, False otherwise.

---

```python
def take_control(self) -> bool
```
Takes control of the Ollama ecosystem.

**Returns:**
- `bool`: True if successful, False otherwise.

---

```python
async def create_task(self, name, description=None, priority="MEDIUM", horizon="H1", capabilities=None) -> Optional[str]
```
Creates a task.

**Parameters:**
- `name (str)`: Name of the task.
- `description (str, optional)`: Description of the task. Defaults to None.
- `priority (str, optional)`: Priority of the task. Options: "CRITICAL", "HIGH", "MEDIUM", "LOW", "OPTIONAL". Defaults to "MEDIUM".
- `horizon (str, optional)`: Horizon of the task. Options: "H1", "H2", "H3". Defaults to "H1".
- `capabilities (List[str], optional)`: Required capabilities. Defaults to None.

**Returns:**
- `Optional[str]`: Task ID if successful, None otherwise.

---

```python
async def execute_task(self, task_id) -> Optional[Dict[str, Any]]
```
Executes a task.

**Parameters:**
- `task_id (str)`: ID of the task to execute.

**Returns:**
- `Optional[Dict[str, Any]]`: Task result if successful, None otherwise.

---

```python
def get_status(self) -> Dict[str, Any]
```
Gets the current status of the Master Player.

**Returns:**
- `Dict[str, Any]`: Status information.

---

```python
def shutdown(self) -> bool
```
Shuts down the Master Player.

**Returns:**
- `bool`: True if successful, False otherwise.

## AgentManager Class

Manages agents and task execution.

### Constructor

```python
def __init__(self)
```

### Methods

```python
def register_agent(self, agent) -> None
```
Registers an agent with the manager.

**Parameters:**
- `agent (BaseAgent)`: The agent to register.

---

```python
def unregister_agent(self, agent_id) -> bool
```
Unregisters an agent from the manager.

**Parameters:**
- `agent_id (str)`: ID of the agent to unregister.

**Returns:**
- `bool`: True if successful, False otherwise.

---

```python
def get_agent(self, agent_id) -> Optional[BaseAgent]
```
Gets an agent by ID.

**Parameters:**
- `agent_id (str)`: ID of the agent to get.

**Returns:**
- `Optional[BaseAgent]`: The agent if found, None otherwise.

---

```python
def find_agent_for_task(self, task) -> Optional[BaseAgent]
```
Finds a suitable agent for a task.

**Parameters:**
- `task (TaskSchema)`: The task to find an agent for.

**Returns:**
- `Optional[BaseAgent]`: A suitable agent if found, None otherwise.

---

```python
def register_task(self, task) -> str
```
Registers a task with the manager.

**Parameters:**
- `task (TaskSchema)`: The task to register.

**Returns:**
- `str`: The ID of the registered task.

---

```python
async def execute_task(self, task) -> TaskResult
```
Executes a task.

**Parameters:**
- `task (TaskSchema or str)`: The task to execute or its ID.

**Returns:**
- `TaskResult`: The result of the task execution.

---

```python
async def execute_tasks(self, tasks, parallel=True) -> List[TaskResult]
```
Executes multiple tasks.

**Parameters:**
- `tasks (List[TaskSchema or str])`: The tasks to execute or their IDs.
- `parallel (bool, optional)`: Whether to execute tasks in parallel. Defaults to True.

**Returns:**
- `List[TaskResult]`: The results of the task executions.

---

```python
def get_task_result(self, task_id) -> Optional[TaskResult]
```
Gets the result of a task.

**Parameters:**
- `task_id (str)`: ID of the task to get the result for.

**Returns:**
- `Optional[TaskResult]`: The task result if found, None otherwise.

---

```python
def get_task_results(self) -> Dict[str, TaskResult]
```
Gets all task results.

**Returns:**
- `Dict[str, TaskResult]`: All task results.

---

```python
def get_success_patterns(self, category=None) -> Dict[str, List[Dict[str, Any]]]
```
Gets recorded success patterns.

**Parameters:**
- `category (str, optional)`: Category to filter by. Defaults to None.

**Returns:**
- `Dict[str, List[Dict[str, Any]]]`: Success patterns by category.

---

```python
def export_success_patterns(self, filepath) -> bool
```
Exports success patterns to a file.

**Parameters:**
- `filepath (str)`: Path to export to.

**Returns:**
- `bool`: True if successful, False otherwise.

---

```python
def get_agent_performance_metrics(self) -> Dict[str, Dict[str, Any]]
```
Gets performance metrics for all agents.

**Returns:**
- `Dict[str, Dict[str, Any]]`: Performance metrics for each agent.

## Agent Classes

### BaseAgent

Abstract base class for all agents.

```python
class BaseAgent:
    def __init__(self, agent_id, name, capabilities=None):
        self.agent_id = agent_id
        self.name = name
        self.capabilities = capabilities or []
        
    async def execute_task(self, task):
        """Execute a task."""
        raise NotImplementedError("Subclasses must implement execute_task")
        
    def has_capability(self, capability):
        """Check if the agent has a specific capability."""
        return capability in self.capabilities
```

### TaskAgent

General-purpose agent for task execution.

```python
class TaskAgent(BaseAgent):
    async def execute_task(self, task):
        """Execute a task."""
        # Task execution implementation
```

### PromptDrivenAgent

Agent that uses prompt templates.

```python
class PromptDrivenAgent(BaseAgent):
    def __init__(self, agent_id, name, capabilities=None, prompt_engine=None):
        super().__init__(agent_id, name, capabilities)
        self.prompt_engine = prompt_engine or PromptEngine()
        
    async def execute_task(self, task):
        """Execute a task using prompt templates."""
        # Prompt-driven task execution
```

## PromptEngine Class

Handles prompt generation and pattern analysis.

### Constructor

```python
def __init__(self, templates_dir=None)
```

**Parameters:**
- `templates_dir (str, optional)`: Directory containing prompt templates. Defaults to None.

### Methods

```python
def load_templates(self, templates_dir) -> None
```
Loads templates from a directory.

**Parameters:**
- `templates_dir (str)`: Directory containing templates.

---

```python
def get_template(self, template_name) -> Optional[PromptTemplate]
```
Gets a template by name.

**Parameters:**
- `template_name (str)`: Name of the template.

**Returns:**
- `Optional[PromptTemplate]`: The template if found, None otherwise.

---

```python
def render_prompt(self, template_name, **kwargs) -> str
```
Renders a prompt using a template.

**Parameters:**
- `template_name (str)`: Name of the template.
- `**kwargs`: Variables for the template.

**Returns:**
- `str`: The rendered prompt.

---

```python
def record_success(self, template_name, rendered_prompt, category, metadata=None) -> None
```
Records a successful prompt.

**Parameters:**
- `template_name (str)`: Name of the template.
- `rendered_prompt (str)`: The rendered prompt.
- `category (str)`: Category of the success.
- `metadata (Dict[str, Any], optional)`: Additional metadata. Defaults to None.

---

```python
def analyze_patterns(self, category=None) -> Dict[str, Any]
```
Analyzes success patterns.

**Parameters:**
- `category (str, optional)`: Category to analyze. Defaults to None.

**Returns:**
- `Dict[str, Any]`: Analysis results.

---

```python
def export_patterns(self, filepath) -> bool
```
Exports patterns to a file.

**Parameters:**
- `filepath (str)`: Path to export to.

**Returns:**
- `bool`: True if successful, False otherwise.

## ContextManager Class

Manages agent contexts.

### Constructor

```python
def __init__(self, data_dir=None)
```

**Parameters:**
- `data_dir (str, optional)`: Directory for storing contexts. Defaults to None.

### Methods

```python
def get_context(self, agent_id) -> AgentContext
```
Gets or creates an agent context.

**Parameters:**
- `agent_id (str)`: ID of the agent.

**Returns:**
- `AgentContext`: The agent's context.

---

```python
def save_all_contexts(self) -> bool
```
Saves all contexts to storage.

**Returns:**
- `bool`: True if successful, False otherwise.

---

```python
def load_all_contexts(self) -> bool
```
Loads all contexts from storage.

**Returns:**
- `bool`: True if successful, False otherwise.

---

```python
def query_contexts_by_tag(self, tag) -> List[str]
```
Finds contexts with a specific tag.

**Parameters:**
- `tag (str)`: Tag to search for.

**Returns:**
- `List[str]`: Agent IDs with matching contexts.

## Schema Classes

### TaskSchema

Defines the structure of a task.

```python
class TaskSchema(BaseModel):
    id: Optional[str] = None
    name: str
    description: Optional[str] = None
    priority: TaskPriority = TaskPriority.MEDIUM
    horizon: TaskHorizon = TaskHorizon.H1
    status: TaskStatus = TaskStatus.PENDING
    capabilities_required: List[AgentCapability] = []
    subtasks: List[SubTask] = []
    metadata: Dict[str, Any] = {}
    
    def mark_pending(self) -> None:
        """Mark task as pending."""
        self.status = TaskStatus.PENDING
        
    def mark_in_progress(self) -> None:
        """Mark task as in progress."""
        self.status = TaskStatus.IN_PROGRESS
        
    def mark_completed(self) -> None:
        """Mark task as completed."""
        self.status = TaskStatus.COMPLETED
        
    def mark_failed(self, error) -> None:
        """Mark task as failed."""
        self.status = TaskStatus.FAILED
        self.metadata["error"] = str(error)
        
    def add_subtask(self, name, description=None) -> None:
        """Add a subtask."""
        self.subtasks.append(SubTask(name=name, description=description))
```

### TaskResult

Represents the result of a task execution.

```python
class TaskResult(BaseModel):
    task_id: str
    agent_id: str
    success: bool
    start_time: datetime
    end_time: Optional[datetime] = None
    execution_time: Optional[float] = None
    output: Any = None
    error: Optional[str] = None
    summary: Optional[str] = None
    metadata: Dict[str, Any] = {}
```

### AgentContext

Represents an agent's context.

```python
class AgentContext(BaseModel):
    agent_id: str
    interactions: List[Dict[str, Any]] = []
    executions: List[Dict[str, Any]] = []
    focus_stack: List[str] = []
    metadata: Dict[str, Any] = {}
    tags: List[str] = []
    
    def record_interaction(self, interaction_type, content, metadata=None) -> None:
        """Record an interaction."""
        self.interactions.append({
            "type": interaction_type,
            "content": content,
            "timestamp": datetime.now().isoformat(),
            "metadata": metadata or {}
        })
        
    def record_execution(self, task_id, success, details, duration_seconds) -> None:
        """Record a task execution."""
        self.executions.append({
            "task_id": task_id,
            "success": success,
            "details": details,
            "duration_seconds": duration_seconds,
            "timestamp": datetime.now().isoformat()
        })
```

## Enums

### TaskPriority

```python
class TaskPriority(Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"
    OPTIONAL = "OPTIONAL"
```

### TaskHorizon

```python
class TaskHorizon(Enum):
    H1 = "H1"  # Current focus
    H2 = "H2"  # Next in line
    H3 = "H3"  # Future considerations
```

### TaskStatus

```python
class TaskStatus(Enum):
    PENDING = "PENDING"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    CANCELLED = "CANCELLED"
```

### AgentCapability

```python
class AgentCapability(Enum):
    TASK_PLANNING = "TASK_PLANNING"
    CODE_GENERATION = "CODE_GENERATION"
    FILE_OPERATIONS = "FILE_OPERATIONS"
    DATA_ANALYSIS = "DATA_ANALYSIS"
    SYSTEM_ADMINISTRATION = "SYSTEM_ADMINISTRATION"
``` 