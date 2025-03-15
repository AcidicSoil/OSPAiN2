"""Direct Control Interface for Master Player.

This module provides a direct Python interface for controlling the Master Player,
bypassing shell scripts, terminal commands, and other middle layers.
"""

import os
import sys
import asyncio
import logging
import argparse
from datetime import datetime
from typing import Dict, List, Optional, Any, Union

from agents_system.core.master_player import MasterPlayer
from agents_system.core.agent import TaskAgent, BaseAgent
from agents_system.core.schema import (
    TaskSchema, TaskStatus, TaskPriority, TaskHorizon, 
    AgentCapability, TaskResult
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger("direct_control")

class DirectControl:
    """Direct control interface for the Master Player."""
    
    def __init__(self, data_dir: Optional[str] = None):
        """Initialize the direct control interface.
        
        Args:
            data_dir: Directory for storing Master Player data
        """
        self.data_dir = data_dir or os.path.join(os.path.expanduser("~"), "ollama-ecosystem", "master-player")
        os.makedirs(self.data_dir, exist_ok=True)
        
        self.master_player = None
        self.initialized = False
        self.status_messages = []
        
        logger.info("Direct Control Interface initialized")
        self.add_status("Direct Control Interface initialized")
    
    def initialize(self) -> bool:
        """Initialize the Master Player.
        
        Returns:
            True if initialization was successful, False otherwise
        """
        try:
            self.master_player = MasterPlayer(data_dir=self.data_dir)
            self.initialized = True
            logger.info("Master Player initialized")
            self.add_status("Master Player initialized")
            return True
        except Exception as e:
            logger.error(f"Error initializing Master Player: {e}")
            self.add_status(f"ERROR: Failed to initialize Master Player: {e}")
            return False
    
    def take_control(self) -> bool:
        """Take control of the Ollama ecosystem.
        
        Returns:
            True if takeover was successful, False otherwise
        """
        if not self.initialized:
            if not self.initialize():
                return False
        
        try:
            self.master_player.start()
            logger.info("Master Player has taken control of the Ollama ecosystem")
            self.add_status("Master Player has taken control of the Ollama ecosystem")
            
            # Register default agents
            self._register_default_agents()
            
            # Generate takeover report
            ownership = self.master_player.get_ownership_report()
            report = f"Total owned components: {ownership['total_owned']}\n"
            report += f"Agents: {len(ownership['agents'])}\n"
            report += f"Tasks: {len(ownership['tasks'])}\n"
            report += f"Resources: {len(ownership['resources'])}\n"
            report += f"Components: {len(ownership['components'])}"
            
            self.add_status("Takeover successful")
            self.add_status(f"Ownership report:\n{report}")
            
            # Create status file
            self._write_status_file()
            
            return True
        except Exception as e:
            logger.error(f"Error taking control: {e}")
            self.add_status(f"ERROR: Failed to take control: {e}")
            return False
    
    def _register_default_agents(self) -> None:
        """Register default agents with the Master Player."""
        agents = [
            TaskAgent("planning-agent", "Task Planning Agent", 
                    [AgentCapability.TASK_PLANNING]),
            TaskAgent("coding-agent", "Code Generation Agent", 
                    [AgentCapability.CODE_GENERATION]),
            TaskAgent("file-agent", "File Operations Agent", 
                    [AgentCapability.FILE_OPERATIONS]),
            TaskAgent("analysis-agent", "Data Analysis Agent", 
                    [AgentCapability.DATA_ANALYSIS])
        ]
        
        for agent in agents:
            self.master_player.register_agent(agent)
            logger.info(f"Registered agent: {agent.id} ({agent.name})")
            self.add_status(f"Registered agent: {agent.id} ({agent.name})")
    
    def _write_status_file(self) -> None:
        """Write status to a file."""
        status_path = os.path.join(self.data_dir, "takeover_status.txt")
        
        with open(status_path, "w") as f:
            f.write("=== MASTER PLAYER DIRECT CONTROL ===\n")
            f.write(f"Timestamp: {datetime.now().isoformat()}\n")
            f.write("Status: COMPLETE\n\n")
            f.write("=== STATUS LOG ===\n")
            for msg in self.status_messages:
                f.write(f"{msg}\n")
            f.write("\n=== MASTER PLAYER IS NOW IN DIRECT CONTROL ===\n")
        
        logger.info(f"Status written to: {status_path}")
    
    def add_status(self, message: str) -> None:
        """Add a status message.
        
        Args:
            message: Status message to add
        """
        timestamp = datetime.now().isoformat()
        self.status_messages.append(f"[{timestamp}] {message}")
    
    async def create_task(self, 
                         name: str,
                         description: str = None,
                         priority: str = "MEDIUM",
                         horizon: str = "H1",
                         capabilities: List[str] = None) -> Optional[str]:
        """Create a task.
        
        Args:
            name: Name of the task
            description: Description of the task
            priority: Priority of the task (HIGH, MEDIUM, LOW, etc.)
            horizon: Horizon of the task (H1, H2, H3)
            capabilities: Required capabilities
            
        Returns:
            Task ID if creation was successful, None otherwise
        """
        if not self.initialized or not self.master_player:
            logger.error("Master Player not initialized")
            self.add_status("ERROR: Master Player not initialized")
            return None
        
        try:
            # Convert string capabilities to enum
            caps = []
            if capabilities:
                for cap in capabilities:
                    try:
                        caps.append(AgentCapability[cap.upper()])
                    except KeyError:
                        logger.warning(f"Unknown capability: {cap}")
            
            # Create task
            task = await self.master_player.create_task(
                name=name,
                description=description,
                priority=priority,
                horizon=horizon,
                capabilities_required=caps
            )
            
            logger.info(f"Task created: {task.id} ({task.name})")
            self.add_status(f"Task created: {task.id} ({task.name})")
            return task.id
        except Exception as e:
            logger.error(f"Error creating task: {e}")
            self.add_status(f"ERROR: Failed to create task: {e}")
            return None
    
    async def execute_task(self, task_id: str) -> Optional[Dict[str, Any]]:
        """Execute a task.
        
        Args:
            task_id: ID of the task to execute
            
        Returns:
            Task result if execution was successful, None otherwise
        """
        if not self.initialized or not self.master_player:
            logger.error("Master Player not initialized")
            self.add_status("ERROR: Master Player not initialized")
            return None
        
        try:
            # Find task in registry
            task = None
            if task_id in self.master_player.task_registry:
                task = self.master_player.task_registry[task_id]["task"]
            
            if not task:
                logger.error(f"Task not found: {task_id}")
                self.add_status(f"ERROR: Task not found: {task_id}")
                return None
            
            # Execute task
            result = await self.master_player.execute_task(task)
            
            logger.info(f"Task executed: {task_id}, success={result.success}")
            self.add_status(f"Task executed: {task_id}, success={result.success}")
            
            # Convert result to dictionary
            return {
                "task_id": result.task_id,
                "success": result.success,
                "agent_id": result.agent_id,
                "start_time": result.start_time,
                "end_time": result.end_time,
                "execution_time": result.execution_time,
                "summary": result.summary,
                "details": result.details,
                "artifacts": result.artifacts,
                "errors": result.errors
            }
        except Exception as e:
            logger.error(f"Error executing task: {e}")
            self.add_status(f"ERROR: Failed to execute task: {e}")
            return None
    
    def get_status(self) -> Dict[str, Any]:
        """Get the current status.
        
        Returns:
            Status information
        """
        is_active = self.initialized and self.master_player and self.master_player.active
        
        result = {
            "initialized": self.initialized,
            "active": is_active,
            "status_messages": self.status_messages,
            "data_dir": self.data_dir
        }
        
        if is_active:
            ownership = self.master_player.get_ownership_report()
            result["ownership"] = ownership
            
            metrics = self.master_player.get_agent_performance()
            result["agent_metrics"] = metrics
        
        return result
    
    def shutdown(self) -> bool:
        """Shutdown the Master Player.
        
        Returns:
            True if shutdown was successful, False otherwise
        """
        if not self.initialized or not self.master_player:
            logger.warning("Master Player not initialized, nothing to shutdown")
            return True
        
        try:
            self.master_player.stop()
            logger.info("Master Player shutdown successfully")
            self.add_status("Master Player shutdown successfully")
            return True
        except Exception as e:
            logger.error(f"Error shutting down Master Player: {e}")
            self.add_status(f"ERROR: Failed to shutdown Master Player: {e}")
            return False

async def main():
    """Main entry point for direct control."""
    parser = argparse.ArgumentParser(description="Direct Control Interface for Master Player")
    parser.add_argument("--data-dir", help="Directory for storing Master Player data")
    parser.add_argument("--take-control", action="store_true", help="Take control immediately")
    parser.add_argument("--create-task", help="Create a task with the given name")
    parser.add_argument("--description", help="Description for the task")
    parser.add_argument("--priority", default="MEDIUM", help="Priority for the task")
    parser.add_argument("--horizon", default="H1", help="Horizon for the task")
    parser.add_argument("--capabilities", help="Comma-separated capabilities for the task")
    parser.add_argument("--execute-task", help="Execute a task with the given ID")
    parser.add_argument("--status", action="store_true", help="Get status information")
    parser.add_argument("--shutdown", action="store_true", help="Shutdown the Master Player")
    
    args = parser.parse_args()
    
    # Create direct control interface
    direct_control = DirectControl(data_dir=args.data_dir)
    
    # Process commands
    if args.take_control:
        success = direct_control.take_control()
        if not success:
            print("Failed to take control")
            return
    
    if args.create_task:
        capabilities = args.capabilities.split(",") if args.capabilities else []
        task_id = await direct_control.create_task(
            name=args.create_task,
            description=args.description,
            priority=args.priority,
            horizon=args.horizon,
            capabilities=capabilities
        )
        if task_id:
            print(f"Task created: {task_id}")
        else:
            print("Failed to create task")
    
    if args.execute_task:
        result = await direct_control.execute_task(args.execute_task)
        if result:
            print(f"Task executed: {args.execute_task}")
            print(f"Success: {result['success']}")
            print(f"Agent: {result['agent_id']}")
            print(f"Execution time: {result['execution_time']} seconds")
            print(f"Summary: {result['summary']}")
        else:
            print("Failed to execute task")
    
    if args.status or not (args.take_control or args.create_task or args.execute_task or args.shutdown):
        status = direct_control.get_status()
        print("\n=== MASTER PLAYER STATUS ===")
        print(f"Initialized: {status['initialized']}")
        print(f"Active: {status['active']}")
        print(f"Data directory: {status['data_dir']}")
        
        if status.get('ownership'):
            print("\n=== OWNERSHIP REPORT ===")
            print(f"Total owned components: {status['ownership']['total_owned']}")
            print(f"Agents: {len(status['ownership']['agents'])}")
            print(f"Tasks: {len(status['ownership']['tasks'])}")
            print(f"Resources: {len(status['ownership']['resources'])}")
        
        print("\n=== STATUS LOG ===")
        for msg in status['status_messages']:
            print(msg)
    
    if args.shutdown:
        success = direct_control.shutdown()
        if success:
            print("Master Player shutdown successfully")
        else:
            print("Failed to shutdown Master Player")

if __name__ == "__main__":
    asyncio.run(main()) 