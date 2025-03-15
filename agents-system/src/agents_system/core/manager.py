"""Agent manager for orchestrating multiple agents."""

import asyncio
import uuid
from datetime import datetime
from typing import Dict, List, Optional, Any, Union, Tuple

from agents_system.core.agent import BaseAgent
from agents_system.core.schema import TaskSchema, TaskResult, TaskStatus

class AgentManager:
    """Manager for orchestrating multiple agents."""
    
    def __init__(self):
        """Initialize the agent manager."""
        self.agents: Dict[str, BaseAgent] = {}
        self.tasks: Dict[str, TaskSchema] = {}
        self.results: Dict[str, TaskResult] = {}
        self.success_patterns: Dict[str, List[Dict[str, Any]]] = {}
    
    def register_agent(self, agent: BaseAgent) -> None:
        """Register an agent with the manager.
        
        Args:
            agent: The agent to register.
        """
        if agent.id in self.agents:
            raise ValueError(f"Agent with ID {agent.id} already registered")
        
        self.agents[agent.id] = agent
    
    def unregister_agent(self, agent_id: str) -> None:
        """Unregister an agent from the manager.
        
        Args:
            agent_id: ID of the agent to unregister.
        """
        if agent_id not in self.agents:
            raise ValueError(f"Agent with ID {agent_id} not registered")
        
        del self.agents[agent_id]
    
    def get_agent(self, agent_id: str) -> BaseAgent:
        """Get an agent by ID.
        
        Args:
            agent_id: ID of the agent to get.
            
        Returns:
            The agent with the specified ID.
        """
        if agent_id not in self.agents:
            raise ValueError(f"Agent with ID {agent_id} not registered")
        
        return self.agents[agent_id]
    
    def get_agents(self) -> List[BaseAgent]:
        """Get all registered agents.
        
        Returns:
            List of all registered agents.
        """
        return list(self.agents.values())
    
    def find_agent_for_task(self, task: TaskSchema) -> Optional[BaseAgent]:
        """Find the most suitable agent for a task.
        
        Args:
            task: The task to find an agent for.
            
        Returns:
            The most suitable agent for the task, or None if no suitable agent was found.
        """
        suitable_agents = [
            agent for agent in self.agents.values()
            if agent.can_handle_task(task) and not agent.get_state().is_busy
        ]
        
        if not suitable_agents:
            return None
        
        # For now, just return the first suitable agent
        # In a more advanced implementation, could prioritize agents
        return suitable_agents[0]
    
    def register_task(self, task: TaskSchema) -> str:
        """Register a task with the manager.
        
        Args:
            task: The task to register.
            
        Returns:
            The ID of the registered task.
        """
        if task.id is None:
            task.id = str(uuid.uuid4())
        
        self.tasks[task.id] = task
        return task.id
    
    async def execute_task(self, task: TaskSchema, agent_id: Optional[str] = None) -> TaskResult:
        """Execute a task using a suitable agent.
        
        Args:
            task: The task to execute.
            agent_id: ID of the agent to use. If None, a suitable agent will be found.
            
        Returns:
            Result of the task execution.
        """
        # Register the task if not already registered
        if task.id is None or task.id not in self.tasks:
            self.register_task(task)
        
        # Find an agent if none specified
        agent = None
        if agent_id is not None:
            agent = self.get_agent(agent_id)
        else:
            agent = self.find_agent_for_task(task)
        
        if agent is None:
            # Create a failed result if no suitable agent found
            result = TaskResult(
                task_id=task.id or "",
                success=False,
                status=TaskStatus.FAILED,
                start_time=datetime.now(),
                end_time=datetime.now(),
                duration_seconds=0,
                summary="No suitable agent found for the task",
                errors=["No suitable agent available to execute the task"]
            )
            self.results[task.id] = result
            return result
        
        # Execute the task
        result = await agent.execute_task(task)
        
        # Store the result
        self.results[task.id] = result
        
        # Record successful patterns if task was successful
        if result.success:
            self._record_success_pattern(task, result, agent)
        
        return result
    
    async def execute_tasks(self, tasks: List[TaskSchema], parallel: bool = True) -> List[TaskResult]:
        """Execute multiple tasks.
        
        Args:
            tasks: List of tasks to execute.
            parallel: Whether to execute tasks in parallel. Default is True.
            
        Returns:
            List of task results.
        """
        if parallel:
            # Execute tasks in parallel
            coroutines = [self.execute_task(task) for task in tasks]
            return await asyncio.gather(*coroutines)
        else:
            # Execute tasks sequentially
            results = []
            for task in tasks:
                result = await self.execute_task(task)
                results.append(result)
            return results
    
    def get_task_result(self, task_id: str) -> Optional[TaskResult]:
        """Get the result of a task.
        
        Args:
            task_id: ID of the task to get the result for.
            
        Returns:
            Result of the task, or None if the task has not been executed.
        """
        return self.results.get(task_id)
    
    def get_task_results(self) -> List[TaskResult]:
        """Get all task results.
        
        Returns:
            List of all task results.
        """
        return list(self.results.values())
    
    def _record_success_pattern(self, task: TaskSchema, result: TaskResult, agent: BaseAgent) -> None:
        """Record a successful task execution pattern.
        
        Args:
            task: The task that was executed.
            result: Result of the task execution.
            agent: The agent that executed the task.
        """
        # Create a pattern key based on task category and capabilities
        category = task.category or "general"
        capabilities = "-".join(sorted([c.value for c in task.capabilities_required]))
        pattern_key = f"{category}-{capabilities}" if capabilities else category
        
        # Initialize the pattern list if it doesn't exist
        if pattern_key not in self.success_patterns:
            self.success_patterns[pattern_key] = []
        
        # Add the success pattern
        self.success_patterns[pattern_key].append({
            "task_id": task.id,
            "task_name": task.name,
            "agent_id": agent.id,
            "agent_name": agent.name,
            "duration_seconds": result.duration_seconds,
            "timestamp": datetime.now().isoformat(),
            "subtasks": len(task.subtasks),
            "priority": task.priority,
            "horizon": task.horizon
        })
    
    def get_success_patterns(self, category: Optional[str] = None) -> Dict[str, List[Dict[str, Any]]]:
        """Get recorded success patterns.
        
        Args:
            category: Category of patterns to get. If None, all patterns are returned.
            
        Returns:
            Dictionary of success patterns.
        """
        if category is None:
            return self.success_patterns
        
        return {
            key: patterns for key, patterns in self.success_patterns.items()
            if key.startswith(category)
        }
    
    def export_success_patterns(self, filepath: str) -> None:
        """Export success patterns to a file.
        
        Args:
            filepath: Path to export the patterns to.
        """
        import json
        with open(filepath, 'w') as f:
            json.dump(self.success_patterns, f, indent=2)
    
    def get_agent_performance_metrics(self) -> Dict[str, Dict[str, Any]]:
        """Get performance metrics for all agents.
        
        Returns:
            Dictionary of agent performance metrics.
        """
        metrics = {}
        
        for agent_id, agent in self.agents.items():
            agent_state = agent.get_state()
            
            # Calculate success rate
            total_tasks = len(agent_state.completed_tasks) + len(agent_state.failed_tasks)
            success_rate = 0
            if total_tasks > 0:
                success_rate = len(agent_state.completed_tasks) / total_tasks
            
            # Get completed task results
            completed_results = [
                result for result in self.results.values()
                if result.task_id in agent_state.completed_tasks
            ]
            
            # Calculate average duration
            avg_duration = 0
            if completed_results:
                durations = [r.duration_seconds for r in completed_results if r.duration_seconds is not None]
                if durations:
                    avg_duration = sum(durations) / len(durations)
            
            metrics[agent_id] = {
                "agent_name": agent.name,
                "total_tasks": total_tasks,
                "completed_tasks": len(agent_state.completed_tasks),
                "failed_tasks": len(agent_state.failed_tasks),
                "success_rate": success_rate,
                "avg_duration": avg_duration,
                "capabilities": [c.value for c in agent.capabilities]
            }
        
        return metrics 