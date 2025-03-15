"""Data models for the agent system using Pydantic."""

from datetime import datetime
from enum import Enum, auto
from typing import Dict, List, Optional, Union, Any

from pydantic import BaseModel, Field

class TaskStatus(str, Enum):
    """Status of a task."""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    BLOCKED = "blocked"

class AgentCapability(str, Enum):
    """Capabilities that agents can have."""
    FILE_OPERATIONS = "file_operations"
    CODE_GENERATION = "code_generation"
    TEXT_PROCESSING = "text_processing"
    WEB_SEARCH = "web_search"
    DATE_PARSING = "date_parsing"
    DATA_ANALYSIS = "data_analysis"
    TASK_PLANNING = "task_planning"
    API_INTEGRATION = "api_integration"

class TaskPriority(int, Enum):
    """Priority levels for tasks."""
    CRITICAL = 1
    HIGH = 2
    MEDIUM = 3
    LOW = 4
    OPTIONAL = 5

class TaskHorizon(str, Enum):
    """Horizon classification for tasks."""
    H1 = "H1"  # Now
    H2 = "H2"  # Next
    H3 = "H3"  # Future

class SubTask(BaseModel):
    """A subtask within a larger task."""
    name: str
    description: Optional[str] = None
    status: TaskStatus = TaskStatus.PENDING
    completed_at: Optional[datetime] = None

class TaskSchema(BaseModel):
    """Schema for defining a task to be executed by an agent."""
    id: Optional[str] = None
    name: str
    description: str
    priority: TaskPriority = TaskPriority.MEDIUM
    horizon: TaskHorizon = TaskHorizon.H1
    status: TaskStatus = TaskStatus.PENDING
    capabilities_required: List[AgentCapability] = Field(default_factory=list)
    subtasks: List[Union[str, SubTask]] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    owner: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    category: Optional[str] = None
    
    def mark_in_progress(self) -> None:
        """Mark the task as in progress."""
        self.status = TaskStatus.IN_PROGRESS
        self.updated_at = datetime.now()
    
    def mark_completed(self) -> None:
        """Mark the task as completed."""
        self.status = TaskStatus.COMPLETED
        self.updated_at = datetime.now()
        self.completed_at = datetime.now()
    
    def mark_failed(self) -> None:
        """Mark the task as failed."""
        self.status = TaskStatus.FAILED
        self.updated_at = datetime.now()
    
    def mark_blocked(self) -> None:
        """Mark the task as blocked."""
        self.status = TaskStatus.BLOCKED
        self.updated_at = datetime.now()
    
    def add_subtask(self, subtask: Union[str, SubTask]) -> None:
        """Add a subtask to the task."""
        self.subtasks.append(subtask)
        self.updated_at = datetime.now()

class TaskResult(BaseModel):
    """Result of a task execution."""
    task_id: str
    success: bool
    status: TaskStatus
    start_time: datetime
    end_time: Optional[datetime] = None
    duration_seconds: Optional[float] = None
    summary: str
    details: Optional[str] = None
    artifacts: Dict[str, Any] = Field(default_factory=dict)
    errors: List[str] = Field(default_factory=list)
    subtask_results: List[Dict[str, Any]] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)

class AgentState(BaseModel):
    """State of an agent."""
    agent_id: str
    name: str
    status: str
    capabilities: List[AgentCapability]
    current_task: Optional[str] = None
    completed_tasks: List[str] = Field(default_factory=list)
    failed_tasks: List[str] = Field(default_factory=list)
    is_busy: bool = False
    last_active: datetime = Field(default_factory=datetime.now)
    metadata: Dict[str, Any] = Field(default_factory=dict) 