"""Master Player - Complete owner of the Ollama ecosystem."""

import os
import json
import logging
from typing import Dict, List, Optional, Any, Union, Set
from datetime import datetime
import asyncio

from agents_system.core.manager import AgentManager
from agents_system.core.agent import TaskAgent, BaseAgent
from agents_system.core.schema import (
    TaskSchema, TaskStatus, TaskPriority, TaskHorizon, 
    AgentCapability, TaskResult
)
from agents_system.utils.context import ContextManager
from agents_system.utils.prompt_engine import PromptEngine

logger = logging.getLogger(__name__)

class MasterPlayer:
    """Master Player class - has complete ownership of the Ollama ecosystem."""
    
    def __init__(self, 
                data_dir: str = None,
                config_path: str = None):
        """Initialize the Master Player.
        
        Args:
            data_dir: Directory for storing data
            config_path: Path to configuration file
        """
        self.data_dir = data_dir or os.path.expanduser("~/ollama-ecosystem/master-player")
        os.makedirs(self.data_dir, exist_ok=True)
        
        # Initialize configuration
        self.config = self._load_config(config_path)
        
        # Initialize core components
        self.agent_manager = AgentManager()
        self.context_manager = ContextManager(
            storage_dir=os.path.join(self.data_dir, "contexts")
        )
        self.prompt_engine = PromptEngine(
            pattern_storage_path=os.path.join(self.data_dir, "prompt_patterns.json")
        )
        
        # Ecosystem state
        self.agents_registry: Dict[str, Dict[str, Any]] = {}
        self.task_registry: Dict[str, Dict[str, Any]] = {}
        self.ownership_graph: Dict[str, Set[str]] = {
            "agents": set(),
            "tasks": set(),
            "resources": set(),
            "components": set()
        }
        self.active = False
        self.startup_time = None
        
        logger.info("Master Player initialized")
    
    def _load_config(self, config_path: Optional[str]) -> Dict[str, Any]:
        """Load configuration from file.
        
        Args:
            config_path: Path to configuration file
            
        Returns:
            Configuration dictionary
        """
        default_config = {
            "max_agents": 10,
            "default_priority": "MEDIUM",
            "default_horizon": "H1",
            "auto_takeover": True,
            "ownership_level": "complete",
            "prompt_templates_dir": os.path.join(self.data_dir, "templates"),
            "logging_level": "INFO"
        }
        
        if not config_path or not os.path.exists(config_path):
            logger.info("No configuration file found, using defaults")
            return default_config
        
        try:
            with open(config_path, 'r') as f:
                config = json.load(f)
            
            # Merge with defaults for any missing keys
            for key, value in default_config.items():
                if key not in config:
                    config[key] = value
            
            logger.info(f"Loaded configuration from {config_path}")
            return config
        except Exception as e:
            logger.error(f"Error loading configuration: {e}")
            return default_config
    
    def start(self) -> None:
        """Start the Master Player and take ownership of the ecosystem."""
        if self.active:
            logger.warning("Master Player is already active")
            return
        
        logger.info("Starting Master Player - taking ownership of Ollama ecosystem")
        self.active = True
        self.startup_time = datetime.now()
        
        # Initialize directory structure
        self._initialize_directory_structure()
        
        # Export initial prompt templates
        self._export_prompt_templates()
        
        # Record global event
        self.context_manager.record_global_event(
            "system_start",
            "Master Player has taken ownership of the Ollama ecosystem",
            {"startup_time": self.startup_time.isoformat()}
        )
        
        logger.info("Master Player active - complete ownership established")
    
    def stop(self) -> None:
        """Stop the Master Player."""
        if not self.active:
            logger.warning("Master Player is not active")
            return
        
        logger.info("Stopping Master Player")
        
        # Save all context data
        self.context_manager.save_all_contexts()
        
        # Export prompt patterns
        self.prompt_engine.export_patterns_to_master_player(
            os.path.join(self.data_dir, "master-player.mdc")
        )
        
        # Record event
        uptime = (datetime.now() - self.startup_time).total_seconds() if self.startup_time else 0
        self.context_manager.record_global_event(
            "system_stop",
            "Master Player shutdown",
            {"uptime_seconds": uptime}
        )
        
        self.active = False
        logger.info(f"Master Player stopped. Uptime: {uptime:.2f} seconds")
    
    def register_agent(self, agent: BaseAgent, ownership_level: str = "complete") -> None:
        """Register an agent with the Master Player.
        
        Args:
            agent: The agent to register
            ownership_level: Level of ownership (complete, partial, managed)
        """
        if not self.active:
            self.start()
        
        # Register with manager
        self.agent_manager.register_agent(agent)
        
        # Register in our registry
        self.agents_registry[agent.id] = {
            "agent": agent,
            "registered_at": datetime.now().isoformat(),
            "ownership_level": ownership_level,
            "status": "active"
        }
        
        # Add to ownership graph
        self.ownership_graph["agents"].add(agent.id)
        
        logger.info(f"Agent {agent.id} registered with Master Player")
    
    def unregister_agent(self, agent_id: str) -> bool:
        """Unregister an agent.
        
        Args:
            agent_id: ID of the agent to unregister
            
        Returns:
            True if agent was unregistered, False otherwise
        """
        if not self.active:
            logger.warning("Master Player is not active")
            return False
        
        # Unregister from manager
        success = self.agent_manager.unregister_agent(agent_id)
        
        if success:
            # Update our registry
            if agent_id in self.agents_registry:
                self.agents_registry[agent_id]["status"] = "inactive"
            
            # Remove from ownership graph
            self.ownership_graph["agents"].discard(agent_id)
            
            logger.info(f"Agent {agent_id} unregistered from Master Player")
        
        return success
    
    async def create_task(self, 
                         name: str,
                         description: str = None,
                         priority: Union[TaskPriority, str] = None,
                         horizon: Union[TaskHorizon, str] = None,
                         capabilities_required: List[AgentCapability] = None,
                         metadata: Dict[str, Any] = None) -> TaskSchema:
        """Create a new task.
        
        Args:
            name: Name of the task
            description: Description of the task
            priority: Priority of the task
            horizon: Horizon of the task
            capabilities_required: Capabilities required to execute the task
            metadata: Additional metadata
            
        Returns:
            Created task
        """
        if not self.active:
            self.start()
        
        # Use defaults if not provided
        if priority is None:
            priority = self.config["default_priority"]
        if horizon is None:
            horizon = self.config["default_horizon"]
        
        # Convert string values to enums if needed
        if isinstance(priority, str):
            priority = TaskPriority[priority]
        if isinstance(horizon, str):
            horizon = TaskHorizon[horizon]
        
        # Create task
        task = TaskSchema(
            name=name,
            description=description,
            priority=priority,
            horizon=horizon,
            capabilities_required=capabilities_required or [],
            metadata=metadata or {}
        )
        
        # Register task
        self.agent_manager.register_task(task)
        
        # Add to our registry
        self.task_registry[task.id] = {
            "task": task,
            "created_at": datetime.now().isoformat(),
            "status": task.status.value,
            "assigned_agent": None
        }
        
        # Add to ownership graph
        self.ownership_graph["tasks"].add(task.id)
        
        logger.info(f"Task {task.id} created: {name}")
        return task
    
    async def execute_task(self, task: TaskSchema) -> TaskResult:
        """Execute a task.
        
        Args:
            task: Task to execute
            
        Returns:
            Task execution result
        """
        if not self.active:
            self.start()
        
        logger.info(f"Executing task {task.id}: {task.name}")
        
        # Execute task
        result = await self.agent_manager.execute_task(task)
        
        # Update registry
        if task.id in self.task_registry:
            self.task_registry[task.id]["status"] = task.status.value
            if result.agent_id:
                self.task_registry[task.id]["assigned_agent"] = result.agent_id
        
        # Record success patterns if successful
        if result.success:
            # Record in master player documentation
            self._record_success_pattern(task, result)
        
        logger.info(f"Task {task.id} execution completed with success={result.success}")
        return result
    
    async def execute_batch(self, tasks: List[TaskSchema], 
                          parallel: bool = True) -> Dict[str, TaskResult]:
        """Execute multiple tasks.
        
        Args:
            tasks: Tasks to execute
            parallel: Whether to execute tasks in parallel
            
        Returns:
            Dictionary mapping task IDs to results
        """
        if not self.active:
            self.start()
        
        logger.info(f"Executing batch of {len(tasks)} tasks, parallel={parallel}")
        
        # Execute tasks
        results = await self.agent_manager.execute_tasks(tasks, parallel=parallel)
        
        # Update registry and record success patterns
        for task_id, result in results.items():
            if task_id in self.task_registry:
                self.task_registry[task_id]["status"] = result.task_status.value
                if result.agent_id:
                    self.task_registry[task_id]["assigned_agent"] = result.agent_id
            
            # Find the task
            task = next((t for t in tasks if t.id == task_id), None)
            if task and result.success:
                self._record_success_pattern(task, result)
        
        logger.info(f"Batch execution completed, {sum(1 for r in results.values() if r.success)} successful")
        return results
    
    def get_agent_performance(self) -> Dict[str, Dict[str, Any]]:
        """Get performance metrics for all agents.
        
        Returns:
            Dictionary mapping agent IDs to performance metrics
        """
        return self.agent_manager.get_agent_performance_metrics()
    
    def get_ownership_report(self) -> Dict[str, Any]:
        """Get a report of all owned ecosystem components.
        
        Returns:
            Dictionary containing ownership information
        """
        return {
            "num_agents": len(self.ownership_graph["agents"]),
            "num_tasks": len(self.ownership_graph["tasks"]),
            "num_resources": len(self.ownership_graph["resources"]),
            "num_components": len(self.ownership_graph["components"]),
            "total_owned": sum(len(items) for items in self.ownership_graph.values()),
            "agents": list(self.ownership_graph["agents"]),
            "tasks": list(self.ownership_graph["tasks"]),
            "resources": list(self.ownership_graph["resources"]),
            "components": list(self.ownership_graph["components"])
        }
    
    def _initialize_directory_structure(self) -> None:
        """Initialize directory structure for data storage."""
        os.makedirs(os.path.join(self.data_dir, "templates"), exist_ok=True)
        os.makedirs(os.path.join(self.data_dir, "contexts"), exist_ok=True)
        os.makedirs(os.path.join(self.data_dir, "logs"), exist_ok=True)
        os.makedirs(os.path.join(self.data_dir, "patterns"), exist_ok=True)
        os.makedirs(os.path.join(self.data_dir, "metrics"), exist_ok=True)
    
    def _export_prompt_templates(self) -> None:
        """Export prompt templates to templates directory."""
        templates_dir = os.path.join(self.data_dir, "templates")
        
        # Export master player documentation
        self.prompt_engine.export_patterns_to_master_player(
            os.path.join(self.data_dir, "master-player.mdc")
        )
    
    def _record_success_pattern(self, task: TaskSchema, result: TaskResult) -> None:
        """Record a successful task execution pattern.
        
        Args:
            task: The executed task
            result: The task execution result
        """
        # Determine the pattern category based on task
        if AgentCapability.TASK_PLANNING in task.capabilities_required:
            category = "task_planning"
        elif AgentCapability.CODE_GENERATION in task.capabilities_required:
            category = "code_generation"
        else:
            category = "general"
        
        # Record the pattern
        prompt = f"""
        Task: {task.name}
        Description: {task.description or 'No description'}
        Priority: {task.priority.value}
        Horizon: {task.horizon.value}
        Capabilities: {', '.join(cap.value for cap in task.capabilities_required)}
        """
        
        metadata = {
            "task_id": task.id,
            "agent_id": result.agent_id,
            "duration_seconds": result.execution_time,
            "priority": task.priority.value,
            "horizon": task.horizon.value,
            "task_type": category
        }
        
        self.prompt_engine.record_success(
            template_name=category,
            prompt=prompt,
            result={
                "success": result.success,
                "summary": result.summary,
                "details": result.details,
                "duration": result.execution_time
            },
            metadata=metadata
        )

async def main():
    """Example usage of the Master Player."""
    # Initialize Master Player
    master = MasterPlayer()
    master.start()
    
    try:
        # Create specialized agents
        planning_agent = TaskAgent(
            "agent-1",
            "Planning Agent",
            [AgentCapability.TASK_PLANNING]
        )
        
        coding_agent = TaskAgent(
            "agent-2",
            "Coding Agent",
            [AgentCapability.CODE_GENERATION]
        )
        
        # Register agents
        master.register_agent(planning_agent)
        master.register_agent(coding_agent)
        
        # Create tasks
        planning_task = await master.create_task(
            name="Plan authentication system",
            description="Create detailed plan for user authentication",
            priority=TaskPriority.HIGH,
            horizon=TaskHorizon.H1,
            capabilities_required=[AgentCapability.TASK_PLANNING],
            metadata={
                "time_available": "2 weeks",
                "resources": "1 senior developer, 1 junior developer"
            }
        )
        
        coding_task = await master.create_task(
            name="Implement user schema",
            description="Create database schema for users",
            priority=TaskPriority.MEDIUM,
            horizon=TaskHorizon.H1,
            capabilities_required=[AgentCapability.CODE_GENERATION],
            metadata={
                "language": "Python",
                "framework": "SQLAlchemy"
            }
        )
        
        # Execute tasks
        planning_result = await master.execute_task(planning_task)
        print(f"Planning task completed with success={planning_result.success}")
        
        coding_result = await master.execute_task(coding_task)
        print(f"Coding task completed with success={coding_result.success}")
        
        # Get performance metrics
        metrics = master.get_agent_performance()
        print("\nAgent Performance:")
        for agent_id, data in metrics.items():
            print(f"  Agent {data['agent_name']}:")
            print(f"    Success Rate: {data['success_rate']:.2f}")
            print(f"    Tasks: {data['completed_tasks']}/{data['total_tasks']}")
        
        # Get ownership report
        ownership = master.get_ownership_report()
        print("\nOwnership Report:")
        print(f"  Total Owned Components: {ownership['total_owned']}")
        print(f"  Agents: {len(ownership['agents'])}")
        print(f"  Tasks: {len(ownership['tasks'])}")
    
    finally:
        # Ensure Master Player is stopped
        master.stop()

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(main()) 