#!/usr/bin/env python
"""T2P Integration Example.

This example demonstrates how to use the T2P integration with AI models
to process natural language input and execute T2P commands.
"""

import os
import sys
import asyncio
import logging
from typing import Dict, Any

# Add parent directory to path for imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from agents_system.integrations.t2p import T2PIntegration
from agents_system.integrations.ai_t2p_adapter import AIT2PAdapter
from agents_system.integrations.model_context_provider import ModelContextProvider

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("t2p-integration-example")

# Sample LLM handler that simulates AI model responses
async def sample_llm_handler(prompt: str) -> str:
    """Simulate LLM responses for testing purposes.
    
    In a real implementation, this would call an actual LLM API.
    
    Args:
        prompt: The prompt to send to the LLM
        
    Returns:
        Simulated LLM response
    """
    logger.info(f"LLM prompt: {prompt[:100]}...")
    
    # Simple pattern matching to simulate responses
    if "generate the appropriate t2p command" in prompt:
        if "create a task" in prompt.lower() or "add todo" in prompt.lower():
            return 't2p todo add --title "Example task" --description "This is an example task" --priority 3 --horizon H1 --tags "example,test"'
        elif "list tasks" in prompt.lower() or "show todos" in prompt.lower():
            return 't2p todo list --priority 1 --horizon H1'
        elif "create note" in prompt.lower():
            return 't2p note new "Example Note" --content "This is an example note" --tags "example,test"'
        else:
            return "I'm not sure how to generate a command for that input."
    
    elif "extract the primary intention" in prompt:
        if "create a task" in prompt.lower() or "add todo" in prompt.lower():
            return '{"intent": "create_todo", "confidence": 0.95, "parameters": {"title": "Example task", "priority": 3}}'
        elif "list tasks" in prompt.lower() or "show todos" in prompt.lower():
            return '{"intent": "list_todos", "confidence": 0.9, "parameters": {"status": "in-progress"}}'
        elif "create note" in prompt.lower():
            return '{"intent": "create_note", "confidence": 0.85, "parameters": {"title": "Example Note"}}'
        else:
            return '{"intent": null, "confidence": 0.0, "parameters": {}}'
    
    return "I don't understand the prompt format."

async def process_with_pattern_matching(user_input: str) -> None:
    """Process user input using pattern-based matching (no LLM).
    
    Args:
        user_input: Natural language input from user
    """
    logger.info("Processing with pattern matching...")
    
    t2p = T2PIntegration()
    result = t2p.process_natural_language(user_input)
    
    if result["success"]:
        logger.info(f"Successfully generated command: {result['command']}")
        logger.info(f"Intent: {result['intent']} (confidence: {result['confidence']:.2f})")
        logger.info(f"Execution result: {result['result']}")
    else:
        logger.error(f"Failed to process input: {result['error']}")

async def process_with_ai_adapter(user_input: str) -> None:
    """Process user input using the AI-T2P adapter with LLM.
    
    Args:
        user_input: Natural language input from user
    """
    logger.info("Processing with AI-T2P adapter...")
    
    adapter = AIT2PAdapter()
    result = await adapter.process_user_input_with_llm(user_input, sample_llm_handler)
    
    if result["success"]:
        logger.info(f"Successfully processed with method: {result['method']}")
        logger.info(f"Generated command: {result['command']}")
        if "intent" in result:
            logger.info(f"Intent: {result['intent']} (confidence: {result.get('confidence', 0):.2f})")
        logger.info(f"Execution result: {result['execution_result']}")
    else:
        logger.error(f"Failed to process input: {result.get('error', 'Unknown error')}")

async def process_with_model_context(user_input: str) -> None:
    """Process user input using the Model Context Provider.
    
    Args:
        user_input: Natural language input from user
    """
    logger.info("Processing with Model Context Provider...")
    
    provider = ModelContextProvider()
    provider.register_llm_call_handler(sample_llm_handler)
    
    result = await provider.process_user_input(user_input)
    
    if result["success"]:
        logger.info(f"Successfully processed with method: {result['method']}")
        logger.info(f"Generated command: {result['command']}")
        if "intent" in result:
            logger.info(f"Intent: {result['intent']} (confidence: {result.get('confidence', 0):.2f})")
        logger.info(f"Execution result: {result['execution_result']}")
    else:
        logger.error(f"Failed to process input: {result.get('error', 'Unknown error')}")
    
    # Show performance metrics
    metrics = provider.get_performance_metrics()
    logger.info("Performance metrics:")
    for method, data in metrics.items():
        if data["total_attempts"] > 0:
            logger.info(f"  {method}: {data['success_rate']:.2f} success rate ({data['successful_attempts']}/{data['total_attempts']})")

async def process_ai_output_example() -> None:
    """Demonstrate processing AI output to extract T2P commands."""
    logger.info("Processing AI output example...")
    
    ai_output = """
    Based on your request, I've analyzed the project structure and found several areas for improvement.
    
    To add a new task for documentation, you can use the command:
    `t2p todo add --title "Update documentation" --description "Create comprehensive documentation for the T2P integration" --priority 2 --horizon H1 --tags "documentation,t2p"`
    
    This will add the task to your todo list with the appropriate tags and priority.
    """
    
    provider = ModelContextProvider()
    result = provider.process_ai_output(ai_output)
    
    if result["success"]:
        logger.info(f"Successfully extracted command: {result['command']}")
        logger.info(f"Execution result: {result['execution_result']}")
    else:
        logger.error(f"Failed to extract command: {result.get('error', 'Unknown error')}")

async def suggestions_example(user_input: str) -> None:
    """Demonstrate command suggestions without execution.
    
    Args:
        user_input: Natural language input from user
    """
    logger.info("Command suggestions example...")
    
    adapter = AIT2PAdapter()
    suggestions = adapter.suggest_commands(user_input)
    
    logger.info(f"Generated {len(suggestions)} suggestions:")
    for i, suggestion in enumerate(suggestions):
        logger.info(f"  {i+1}. {suggestion['command']} ({suggestion['confidence']:.2f})")
        logger.info(f"     Description: {suggestion['description']}")

async def main() -> None:
    """Run the example."""
    # Test inputs
    inputs = [
        "Create a task to update the README",
        "Show me all high priority tasks",
        "Make a note about the meeting tomorrow",
        "Generate a report of in-progress tasks"
    ]
    
    for user_input in inputs:
        logger.info(f"\n{'='*80}\nProcessing input: {user_input}\n{'='*80}")
        
        # Process with different methods
        await process_with_pattern_matching(user_input)
        logger.info("")
        await process_with_ai_adapter(user_input)
        logger.info("")
        await process_with_model_context(user_input)
        logger.info("")
        await suggestions_example(user_input)
        logger.info("")
    
    # AI output processing example
    await process_ai_output_example()

if __name__ == "__main__":
    asyncio.run(main()) 