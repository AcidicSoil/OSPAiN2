"""Base agent classes for the agent system."""

import uuid
from abc import ABC, abstractmethod
from datetime import datetime
from typing import Dict, List, Optional, Any, Tuple

from agents_system.core.schema import AgentCapability, AgentState, TaskSchema, TaskResult, TaskStatus

class BaseAgent(ABC):
    """Base class for all agents in the system."""
    
    def __init__(self, name: str, capabilities: List[str]):
        """Initialize the agent.
        
        Args:
            name: Name of the agent.
            capabilities: List of capabilities the agent has.
        """
        self.id = str(uuid.uuid4())
        self.name = name
        self.capabilities = [AgentCapability(cap) for cap in capabilities]
        self.state = AgentState(
            agent_id=self.id,
            name=self.name,
            status="idle",
            capabilities=self.capabilities,
            is_busy=False,
            last_active=datetime.now()
        )
    
    @abstractmethod
    async def execute_task(self, task: TaskSchema) -> TaskResult:
        """Execute a task.
        
        Args:
            task: The task to execute.
            
        Returns:
            Result of the task execution.
        """
        pass
    
    def can_handle_task(self, task: TaskSchema) -> bool:
        """Check if the agent can handle a task.
        
        Args:
            task: The task to check.
            
        Returns:
            True if the agent can handle the task, False otherwise.
        """
        if not task.capabilities_required:
            return True
        
        required_capabilities = set(task.capabilities_required)
        agent_capabilities = set(self.capabilities)
        
        return required_capabilities.issubset(agent_capabilities)
    
    def update_state(self, **kwargs) -> None:
        """Update the agent state.
        
        Args:
            **kwargs: State attributes to update.
        """
        for key, value in kwargs.items():
            if hasattr(self.state, key):
                setattr(self.state, key, value)
        
        self.state.last_active = datetime.now()
    
    def get_state(self) -> AgentState:
        """Get the current state of the agent.
        
        Returns:
            Current agent state.
        """
        return self.state

class TaskAgent(BaseAgent):
    """An agent that can execute tasks."""
    
    async def execute_task(self, task: TaskSchema) -> TaskResult:
        """Execute a task.
        
        Args:
            task: The task to execute.
            
        Returns:
            Result of the task execution.
        """
        # Mark task as in progress
        task.mark_in_progress()
        
        # Update agent state
        self.update_state(
            status="working",
            is_busy=True,
            current_task=task.id
        )
        
        # Record start time
        start_time = datetime.now()
        
        try:
            # Execute task implementation
            success, summary, details, artifacts = await self._execute_task_impl(task)
            
            # Record end time and calculate duration
            end_time = datetime.now()
            duration = (end_time - start_time).total_seconds()
            
            # Update task status
            if success:
                task.mark_completed()
                self.state.completed_tasks.append(task.id)
            else:
                task.mark_failed()
                self.state.failed_tasks.append(task.id)
            
            # Create result
            result = TaskResult(
                task_id=task.id or "",
                success=success,
                status=task.status,
                start_time=start_time,
                end_time=end_time,
                duration_seconds=duration,
                summary=summary,
                details=details,
                artifacts=artifacts or {},
                errors=[] if success else ["Task execution failed"]
            )
            
        except Exception as e:
            # Handle errors
            end_time = datetime.now()
            duration = (end_time - start_time).total_seconds()
            
            task.mark_failed()
            self.state.failed_tasks.append(task.id)
            
            result = TaskResult(
                task_id=task.id or "",
                success=False,
                status=TaskStatus.FAILED,
                start_time=start_time,
                end_time=end_time,
                duration_seconds=duration,
                summary=f"Task execution failed: {str(e)}",
                details=f"Exception: {str(e)}",
                errors=[str(e)]
            )
        
        finally:
            # Reset agent state
            self.update_state(
                status="idle",
                is_busy=False,
                current_task=None
            )
        
        return result
    
    async def _execute_task_impl(self, task: TaskSchema) -> Tuple[bool, str, Optional[str], Optional[Dict[str, Any]]]:
        """Implementation of task execution.
        
        Args:
            task: The task to execute.
            
        Returns:
            A tuple of (success, summary, details, artifacts).
        """
        # Default implementation - subclasses should override this
        subtasks_completed = []
        
        # Process any subtasks
        for subtask in task.subtasks:
            if isinstance(subtask, str):
                subtasks_completed.append(f"Completed subtask: {subtask}")
        
        return (
            True,
            f"Executed task: {task.name}",
            f"Task {task.name} executed successfully with {len(subtasks_completed)} subtasks.",
            {"subtasks_completed": subtasks_completed}
        ) 