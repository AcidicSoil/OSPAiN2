"""Agent-based task system for OSPAiN2."""

__version__ = "0.1.0"

from agents_system.core.agent import BaseAgent, TaskAgent
from agents_system.core.manager import AgentManager
from agents_system.core.schema import TaskSchema, AgentCapability, TaskStatus, TaskResult

__all__ = [
    "BaseAgent", 
    "TaskAgent",
    "AgentManager",
    "TaskSchema",
    "AgentCapability",
    "TaskStatus",
    "TaskResult"
] 