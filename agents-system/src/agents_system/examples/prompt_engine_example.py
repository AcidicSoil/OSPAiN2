"""Example demonstrating the prompt engine usage with templates."""

import asyncio
import os
from datetime import datetime
from typing import Dict, Any

from agents_system.core.manager import AgentManager
from agents_system.core.agent import TaskAgent
from agents_system.core.schema import (
    TaskSchema, TaskStatus, TaskPriority, TaskHorizon, AgentCapability
)
from agents_system.utils.prompt_engine import PromptEngine

# Initialize the prompt engine
PATTERNS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "..", "data")
os.makedirs(PATTERNS_DIR, exist_ok=True)
prompt_engine = PromptEngine(
    pattern_storage_path=os.path.join(PATTERNS_DIR, "prompt_patterns.json")
)

class PromptDrivenAgent(TaskAgent):
    """Agent that uses prompt templates to execute tasks."""
    
    def __init__(self, agent_id: str, name: str, capabilities: list):
        """Initialize the prompt-driven agent.
        
        Args:
            agent_id: Unique identifier for the agent.
            name: Name of the agent.
            capabilities: List of agent capabilities.
        """
        super().__init__(agent_id, name, capabilities)
        self.prompt_engine = prompt_engine
    
    async def _execute_task_impl(self, task: TaskSchema) -> tuple:
        """Execute a task using prompt templates.
        
        Args:
            task: The task to execute.
            
        Returns:
            Tuple of (success, result_details, artifacts, errors).
        """
        template_name = self._get_template_for_task(task)
        print(f"Using template: {template_name}")
        
        if template_name == "task_planning":
            prompt = self.prompt_engine.generate_task_planning_prompt(
                objective=task.name,
                context=task.description or "No context provided",
                time_available=f"{task.metadata.get('time_available', 'Unknown')}",
                priority=task.priority.value,
                horizon=task.horizon.value,
                resources=str(task.metadata.get('resources', 'No resources specified'))
            )
        elif template_name == "code_generation":
            prompt = self.prompt_engine.generate_code_prompt(
                objective=task.name,
                functionality=task.description or "No functionality specified",
                language=task.metadata.get('language', 'Python'),
                framework=task.metadata.get('framework', 'None'),
                environment=task.metadata.get('environment', 'Local'),
                code_style=task.metadata.get('code_style', 'PEP8'),
                constraints=task.metadata.get('constraints', 'None'),
                success_criteria=task.metadata.get('success_criteria', 'Functional code')
            )
        else:
            # Default to a simple template
            prompt = f"Task: {task.name}\nDescription: {task.description}\n"
            prompt += f"Priority: {task.priority.value}\nHorizon: {task.horizon.value}\n"
        
        print("\n--- Generated Prompt ---")
        print(prompt)
        print("------------------------\n")
        
        # Simulate the execution of the prompt
        # In a real system, this would call an LLM or other service
        result = self._simulate_prompt_execution(prompt, task)
        
        # Record the success pattern
        self.prompt_engine.record_success(
            template_name=template_name,
            prompt=prompt,
            result=result,
            metadata={
                "task_id": task.id,
                "task_name": task.name,
                "priority": task.priority.value,
                "horizon": task.horizon.value,
                "duration": result.get("duration_seconds", 0)
            }
        )
        
        # Extract results
        success = result.get("success", False)
        result_details = result.get("details", "No details provided")
        artifacts = result.get("artifacts", [])
        errors = result.get("errors", [])
        
        return success, result_details, artifacts, errors
    
    def _get_template_for_task(self, task: TaskSchema) -> str:
        """Determine the appropriate template for a task.
        
        Args:
            task: The task to get a template for.
            
        Returns:
            Name of the appropriate template.
        """
        # Determine template based on required capabilities
        if AgentCapability.CODE_GENERATION in task.capabilities_required:
            return "code_generation"
        elif AgentCapability.TASK_PLANNING in task.capabilities_required:
            return "task_planning"
        else:
            return "task_planning"  # Default template
    
    def _simulate_prompt_execution(self, prompt: str, task: TaskSchema) -> Dict[str, Any]:
        """Simulate executing a prompt.
        
        In a real system, this would call an LLM API or other service.
        
        Args:
            prompt: The prompt to execute.
            task: The task associated with the prompt.
            
        Returns:
            Simulated result of executing the prompt.
        """
        print(f"Simulating execution for task: {task.name}")
        
        # Simulate execution time
        import time
        import random
        execution_time = random.uniform(0.5, 2.0)
        time.sleep(execution_time)
        
        # Simulate success with 80% probability
        success = random.random() < 0.8
        
        if success:
            return {
                "success": True,
                "summary": f"Successfully executed task: {task.name}",
                "details": "This is a simulated result. In a real system, this would be the output of an LLM or other service.",
                "artifacts": [f"artifact_{task.id}.json"],
                "duration_seconds": execution_time,
                "errors": []
            }
        else:
            return {
                "success": False,
                "summary": f"Failed to execute task: {task.name}",
                "details": "The simulated execution failed.",
                "artifacts": [],
                "duration_seconds": execution_time,
                "errors": ["Simulated error: Random failure"]
            }

async def main():
    """Example usage of the prompt-driven agent with templates."""
    # Create agent manager
    manager = AgentManager()
    
    # Create agents with different capabilities
    planning_agent = PromptDrivenAgent(
        "agent-1", 
        "Task Planning Agent",
        [AgentCapability.TASK_PLANNING]
    )
    
    coding_agent = PromptDrivenAgent(
        "agent-2",
        "Code Generation Agent",
        [AgentCapability.CODE_GENERATION]
    )
    
    # Register agents
    manager.register_agent(planning_agent)
    manager.register_agent(coding_agent)
    
    # Create tasks with different requirements
    planning_task = TaskSchema(
        name="Plan the implementation of the user authentication system",
        description="Create a detailed plan for implementing user authentication in our application",
        priority=TaskPriority.HIGH,
        horizon=TaskHorizon.H1,
        capabilities_required=[AgentCapability.TASK_PLANNING],
        metadata={
            "time_available": "2 weeks",
            "resources": "1 senior developer, 1 junior developer",
            "context": "We need to implement a secure authentication system with support for OAuth2"
        }
    )
    
    coding_task = TaskSchema(
        name="Implement user database schema",
        description="Create database models for user authentication with proper validation",
        priority=TaskPriority.MEDIUM,
        horizon=TaskHorizon.H1,
        capabilities_required=[AgentCapability.CODE_GENERATION],
        metadata={
            "language": "Python",
            "framework": "SQLAlchemy with Pydantic",
            "environment": "PostgreSQL database",
            "code_style": "PEP8 with type hints",
            "constraints": "Must be compatible with async execution",
            "success_criteria": "Models with proper validation and relationships"
        }
    )
    
    # Execute tasks
    print("Executing planning task...")
    planning_result = await manager.execute_task(planning_task)
    print(f"Planning task completed with success={planning_result.success}")
    
    print("\nExecuting coding task...")
    coding_result = await manager.execute_task(coding_task)
    print(f"Coding task completed with success={coding_result.success}")
    
    # Export patterns to master player
    master_player_path = os.path.join(PATTERNS_DIR, "master-player.mdc")
    prompt_engine.export_patterns_to_master_player(master_player_path)
    print(f"\nExported patterns to {master_player_path}")
    
    # Display performance metrics
    metrics = manager.get_agent_performance_metrics()
    print("\nAgent Performance Metrics:")
    for agent_id, agent_metrics in metrics.items():
        print(f"Agent: {agent_metrics['agent_name']}")
        print(f"  Success Rate: {agent_metrics['success_rate']:.2f}")
        print(f"  Completed/Total Tasks: {agent_metrics['completed_tasks']}/{agent_metrics['total_tasks']}")
        print(f"  Average Duration: {agent_metrics['avg_duration']:.2f} seconds")

if __name__ == "__main__":
    asyncio.run(main()) 