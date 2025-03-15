#!/usr/bin/env python
"""Complete takeover script for the Ollama ecosystem.

This script initializes the Master Player and completes the takeover of the entire Ollama ecosystem,
establishing full ownership and control over all components.
"""

import asyncio
import argparse
import logging
import os
import sys
from datetime import datetime

from agents_system.core.master_player import MasterPlayer
from agents_system.core.agent import TaskAgent
from agents_system.core.schema import AgentCapability

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
    handlers=[
        logging.FileHandler("takeover.log"),
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger("takeover")

async def complete_takeover(data_dir: str = None, config_path: str = None, verbose: bool = False):
    """Execute the complete takeover of the Ollama ecosystem.
    
    Args:
        data_dir: Directory for storing Master Player data
        config_path: Path to configuration file
        verbose: Whether to display verbose output
    """
    if verbose:
        logging.getLogger().setLevel(logging.DEBUG)
    
    logger.info("=== INITIATING COMPLETE TAKEOVER OF OLLAMA ECOSYSTEM ===")
    logger.info(f"Timestamp: {datetime.now().isoformat()}")
    logger.info(f"Data directory: {data_dir or 'Default'}")
    logger.info(f"Config path: {config_path or 'Default'}")
    
    # Initialize Master Player
    master = MasterPlayer(data_dir=data_dir, config_path=config_path)
    
    # Start and establish ownership
    logger.info("Starting Master Player and establishing ownership...")
    master.start()
    
    # Create default agents for essential capabilities
    logger.info("Registering essential agents...")
    agents = [
        TaskAgent("planning-agent", "Task Planning Agent", 
                 [AgentCapability.TASK_PLANNING]),
        TaskAgent("coding-agent", "Code Generation Agent", 
                 [AgentCapability.CODE_GENERATION]),
        TaskAgent("file-agent", "File Operations Agent", 
                 [AgentCapability.FILE_OPERATIONS]),
        TaskAgent("analysis-agent", "Data Analysis Agent", 
                 [AgentCapability.DATA_ANALYSIS]),
        TaskAgent("admin-agent", "System Administration Agent", 
                 [AgentCapability.SYSTEM_ADMINISTRATION])
    ]
    
    for agent in agents:
        master.register_agent(agent)
        logger.info(f"Registered agent: {agent.id} ({agent.name})")
    
    # Report on takeover status
    logger.info("Generating ownership report...")
    ownership = master.get_ownership_report()
    
    logger.info(f"Total owned components: {ownership['total_owned']}")
    logger.info(f"Agents under control: {len(ownership['agents'])}")
    logger.info(f"Tasks under control: {len(ownership['tasks'])}")
    logger.info(f"Resources under control: {len(ownership['resources'])}")
    logger.info(f"Components under control: {len(ownership['components'])}")
    
    logger.info("=== COMPLETE TAKEOVER SUCCESSFUL ===")
    logger.info("Master Player is now the complete owner of the Ollama ecosystem")
    logger.info(f"Takeover completed at: {datetime.now().isoformat()}")
    
    # Create a status file
    status_path = os.path.join(data_dir if data_dir else ".", "takeover_status.txt")
    with open(status_path, "w") as f:
        f.write("=== TAKEOVER STATUS ===\n")
        f.write(f"Timestamp: {datetime.now().isoformat()}\n")
        f.write("Status: COMPLETE\n")
        f.write(f"Components owned: {ownership['total_owned']}\n")
        f.write("=== MASTER PLAYER IS NOW IN CONTROL ===\n")
    
    logger.info(f"Status file created at: {status_path}")
    
    return master

def main():
    """Main entry point for the takeover script."""
    parser = argparse.ArgumentParser(description="Complete takeover of the Ollama ecosystem")
    parser.add_argument("--data-dir", help="Directory for storing Master Player data")
    parser.add_argument("--config", help="Path to configuration file")
    parser.add_argument("--verbose", "-v", action="store_true", help="Enable verbose output")
    args = parser.parse_args()
    
    # Execute the takeover
    asyncio.run(complete_takeover(args.data_dir, args.config, args.verbose))
    
    print("\n=== TAKEOVER COMPLETE ===")
    print("The Master Player is now the complete owner of the Ollama ecosystem")
    print("All systems are under control")

if __name__ == "__main__":
    main() 