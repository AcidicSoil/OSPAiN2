#!/usr/bin/env python
"""Direct Control Launcher for Master Player.

This script provides a simple launcher for the Direct Control interface,
making it easy to take control of the Ollama ecosystem.
"""

import os
import sys
import asyncio
import argparse

try:
    from agents_system.direct_control import DirectControl
except ImportError:
    sys.path.append(os.path.abspath(os.path.dirname(__file__)))
    try:
        from agents_system.direct_control import DirectControl
    except ImportError:
        print("Error: Cannot import DirectControl. Make sure agents_system is installed.")
        sys.exit(1)

async def execute_command(args):
    """Execute a command based on arguments.
    
    Args:
        args: Command-line arguments
    """
    direct_control = DirectControl(data_dir=args.data_dir)
    
    if args.command == 'take-control':
        success = direct_control.take_control()
        if success:
            print("Successfully took control of Ollama ecosystem.")
        else:
            print("Failed to take control of Ollama ecosystem.")
        
    elif args.command == 'create-task':
        capabilities = args.capabilities.split(',') if args.capabilities else []
        task_id = await direct_control.create_task(
            name=args.name,
            description=args.description,
            priority=args.priority,
            horizon=args.horizon,
            capabilities=capabilities
        )
        if task_id:
            print(f"Task created successfully: {task_id}")
        else:
            print("Failed to create task.")
        
    elif args.command == 'execute-task':
        result = await direct_control.execute_task(args.task_id)
        if result:
            print(f"Task executed: {args.task_id}")
            print(f"Success: {result['success']}")
            print(f"Agent: {result['agent_id']}")
            print(f"Execution time: {result['execution_time']} seconds")
            print(f"Summary: {result['summary']}")
        else:
            print(f"Failed to execute task: {args.task_id}")
        
    elif args.command == 'status':
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
        
    elif args.command == 'shutdown':
        success = direct_control.shutdown()
        if success:
            print("Master Player shutdown successfully.")
        else:
            print("Failed to shutdown Master Player.")

def main():
    """Main entry point for the launcher."""
    parser = argparse.ArgumentParser(description="Master Player Direct Control Launcher")
    parser.add_argument("--data-dir", help="Directory for storing Master Player data")
    
    subparsers = parser.add_subparsers(dest="command", help="Command to execute")
    
    # Take control command
    take_control_parser = subparsers.add_parser("take-control", help="Take control of the Ollama ecosystem")
    
    # Create task command
    create_task_parser = subparsers.add_parser("create-task", help="Create a new task")
    create_task_parser.add_argument("--name", required=True, help="Name of the task")
    create_task_parser.add_argument("--description", help="Description of the task")
    create_task_parser.add_argument("--priority", default="MEDIUM", help="Priority of the task (HIGH, MEDIUM, LOW)")
    create_task_parser.add_argument("--horizon", default="H1", help="Horizon of the task (H1, H2, H3)")
    create_task_parser.add_argument("--capabilities", help="Comma-separated list of required capabilities")
    
    # Execute task command
    execute_task_parser = subparsers.add_parser("execute-task", help="Execute a task")
    execute_task_parser.add_argument("--task-id", required=True, help="ID of the task to execute")
    
    # Status command
    status_parser = subparsers.add_parser("status", help="Get status information")
    
    # Shutdown command
    shutdown_parser = subparsers.add_parser("shutdown", help="Shutdown the Master Player")
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return
    
    asyncio.run(execute_command(args))

if __name__ == "__main__":
    main() 