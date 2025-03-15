"""AI-to-T2P adapter for seamless integration between AI models and T2P CLI.

This module provides functionality for connecting AI models with the T2P tool,
enabling automatic command generation from AI model outputs and natural language processing.
"""

import os
import re
import json
import time
import logging
from typing import Dict, List, Optional, Any, Union, Tuple, Callable

from agents_system.integrations.t2p import T2PIntegration

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("ai-t2p-adapter")

class AIT2PAdapter:
    """Adapter that connects AI models with the T2P integration."""
    
    def __init__(self, t2p_integration: Optional[T2PIntegration] = None):
        """Initialize the AI-T2P adapter.
        
        Args:
            t2p_integration: T2P integration instance. If None, creates a new one.
        """
        self.t2p = t2p_integration or T2PIntegration()
        
        # Confidence threshold for auto-execution
        self.auto_execution_threshold = 0.85
        
        # Command suggestion patterns from AI outputs
        self.command_suggestion_patterns = [
            r"You can use the command:\s*`(t2p .+?)`",
            r"Run\s*`(t2p .+?)`",
            r"Execute\s*`(t2p .+?)`",
            r"Command:\s*`(t2p .+?)`",
            r"t2p command:\s*`(t2p .+?)`",
        ]
        
        # LLM prompt templates for command generation
        self.prompt_templates = {
            "command_generation": """
Given the following user instruction, generate the appropriate t2p command:

USER INSTRUCTION:
{user_instruction}

Available t2p commands:
- t2p todo add --title "..." --description "..." --priority <1-5> --horizon <H1|H2|H3> --tags "..." --category "..."
- t2p todo list [--priority <1-5>] [--status <status>] [--horizon <H1|H2|H3>] [--tags "..."] [--category "..."] [--search "..."]
- t2p todo update <id> [--status <status>] [--priority <1-5>] [--tags "..."] [--title "..."] [--description "..."]
- t2p note new "Title" [--content "..."] [--tags "..."] [--category "..."]
- t2p note new --ai "AI prompt to generate content"

Generate just the command with no explanation or additional text. Only include necessary parameters.
""",
            "intent_extraction": """
Given the following user instruction, extract the primary intention:

USER INSTRUCTION:
{user_instruction}

Possible intents:
- create_todo: User wants to create a new task/todo
- list_todos: User wants to view or list existing todos
- update_todo: User wants to update an existing todo
- create_note: User wants to create a new note
- create_ai_note: User wants to create a note with AI-generated content

RESPONSE FORMAT:
{{"intent": "intent_name", "confidence": 0.XX, "parameters": {{"param1": "value1", "param2": "value2"}}}}

Respond with the JSON only, no explanation.
""",
        }
        
        # Tracking for recently suggested commands
        self.recent_suggestions = []
        self.max_suggestions_history = 10
    
    def extract_command_from_ai_output(self, ai_output: str) -> Optional[str]:
        """Extract T2P command from AI model output if present.
        
        Args:
            ai_output: The output text from an AI model
            
        Returns:
            Extracted command string or None if no command found
        """
        # Check for command suggestions using regex patterns
        for pattern in self.command_suggestion_patterns:
            matches = re.search(pattern, ai_output, re.IGNORECASE)
            if matches:
                command = matches.group(1).strip()
                # Verify it's a t2p command
                if command.startswith("t2p "):
                    return command
        
        return None
    
    async def generate_command_from_llm(self, 
                                  user_input: str, 
                                  llm_call_function: Callable[[str], str]) -> Dict[str, Any]:
        """Generate a T2P command using an LLM for better intent understanding.
        
        Args:
            user_input: Natural language input from the user
            llm_call_function: Async function that calls an LLM with a prompt and returns response
            
        Returns:
            Dict with command generation result
        """
        # Generate prompt for command generation
        prompt = self.prompt_templates["command_generation"].format(
            user_instruction=user_input
        )
        
        try:
            # Call LLM
            llm_response = await llm_call_function(prompt)
            
            # Extract command
            command = llm_response.strip().replace('`', '').strip()
            
            # Check if it's a valid t2p command
            if command.startswith("t2p "):
                return {
                    "success": True,
                    "command": command,
                    "source": "llm",
                    "confidence": 0.9  # Assuming high confidence for LLM-generated commands
                }
            else:
                return {
                    "success": False,
                    "error": "LLM did not generate a valid t2p command",
                    "raw_response": llm_response
                }
                
        except Exception as e:
            logger.error(f"Error generating command with LLM: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def extract_intent_from_llm(self, 
                               user_input: str,
                               llm_call_function: Callable[[str], str]) -> Dict[str, Any]:
        """Extract intent and parameters using an LLM for better understanding.
        
        Args:
            user_input: Natural language input from the user
            llm_call_function: Async function that calls an LLM with a prompt and returns response
            
        Returns:
            Dict with intent extraction result
        """
        # Generate prompt for intent extraction
        prompt = self.prompt_templates["intent_extraction"].format(
            user_instruction=user_input
        )
        
        try:
            # Call LLM
            llm_response = await llm_call_function(prompt)
            
            # Parse JSON response
            try:
                parsed = json.loads(llm_response.strip())
                return {
                    "success": True,
                    "intent": parsed.get("intent"),
                    "confidence": parsed.get("confidence", 0.0),
                    "parameters": parsed.get("parameters", {})
                }
            except json.JSONDecodeError:
                return {
                    "success": False,
                    "error": "Could not parse LLM response as JSON",
                    "raw_response": llm_response
                }
                
        except Exception as e:
            logger.error(f"Error extracting intent with LLM: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def process_user_input(self, user_input: str) -> Dict[str, Any]:
        """Process user input using pattern-based intent detection.
        
        This method doesn't use LLM and relies on the simpler pattern matching
        in the T2PIntegration class.
        
        Args:
            user_input: Natural language input from the user
            
        Returns:
            Dict with processing result
        """
        return self.t2p.process_natural_language(user_input)
    
    async def process_user_input_with_llm(self, 
                                   user_input: str, 
                                   llm_call_function: Callable[[str], str]) -> Dict[str, Any]:
        """Process user input with LLM assistance for better intent understanding.
        
        Args:
            user_input: Natural language input from the user
            llm_call_function: Async function that calls an LLM with a prompt and returns response
            
        Returns:
            Dict with processing result
        """
        # First try direct command generation
        command_result = await self.generate_command_from_llm(user_input, llm_call_function)
        
        if command_result["success"]:
            # Execute the generated command
            execution_result = self.t2p.execute_command(command_result["command"])
            
            return {
                "success": execution_result["success"],
                "command": command_result["command"],
                "command_source": "llm",
                "execution_result": execution_result,
                "method": "direct_command_generation"
            }
            
        # If direct command generation fails, try intent extraction
        intent_result = await self.extract_intent_from_llm(user_input, llm_call_function)
        
        if intent_result["success"] and intent_result["confidence"] >= 0.6:
            # Generate command from extracted intent
            command = self.t2p.generate_command(intent_result["intent"], intent_result["parameters"])
            
            if command:
                # Execute the generated command
                execution_result = self.t2p.execute_command(command)
                
                return {
                    "success": execution_result["success"],
                    "command": command,
                    "intent": intent_result["intent"],
                    "parameters": intent_result["parameters"],
                    "confidence": intent_result["confidence"],
                    "execution_result": execution_result,
                    "method": "intent_extraction"
                }
        
        # If both approaches fail, fall back to pattern-based processing
        fallback_result = self.process_user_input(user_input)
        
        if fallback_result["success"]:
            return {
                **fallback_result,
                "method": "pattern_fallback"
            }
        
        # If all approaches fail, return failure
        return {
            "success": False,
            "error": "Could not process input with any available method",
            "attempted_methods": ["direct_command_generation", "intent_extraction", "pattern_fallback"],
            "user_input": user_input
        }
    
    def process_ai_output(self, ai_output: str) -> Dict[str, Any]:
        """Process AI model output to extract and execute T2P commands.
        
        Args:
            ai_output: The output text from an AI model
            
        Returns:
            Dict with processing result
        """
        # Extract command if present
        command = self.extract_command_from_ai_output(ai_output)
        
        if not command:
            return {
                "success": False,
                "error": "No T2P command found in AI output",
                "ai_output": ai_output
            }
        
        # Store suggestion
        self._add_suggestion(command)
        
        # Execute command
        result = self.t2p.execute_command(command)
        
        return {
            "success": result["success"],
            "command": command,
            "execution_result": result,
            "ai_output": ai_output
        }
    
    def suggest_commands(self, user_input: str, max_suggestions: int = 3) -> List[Dict[str, Any]]:
        """Generate command suggestions based on user input without executing them.
        
        Args:
            user_input: Natural language input from the user
            max_suggestions: Maximum number of suggestions to return
            
        Returns:
            List of command suggestion objects
        """
        # Process the input to get intent and parameters
        process_result = self.t2p.process_natural_language(user_input)
        
        suggestions = []
        
        if process_result["success"]:
            # Add the main suggestion
            main_suggestion = {
                "command": process_result["command"],
                "confidence": process_result["confidence"],
                "intent": process_result["intent"],
                "description": f"Execute {process_result['intent'].replace('_', ' ')} operation"
            }
            suggestions.append(main_suggestion)
        
        # Add variant suggestions based on the same intent
        if "intent" in process_result and process_result["intent"]:
            intent = process_result["intent"]
            parameters = process_result.get("parameters", {})
            
            # Create variants based on intent
            if intent == "create_todo":
                # Variant with higher priority
                if "priority" in parameters and parameters["priority"] < 5:
                    higher_priority_params = parameters.copy()
                    higher_priority_params["priority"] = min(parameters["priority"] + 1, 5)
                    command = self.t2p.generate_command(intent, higher_priority_params)
                    if command:
                        suggestions.append({
                            "command": command,
                            "confidence": process_result["confidence"] * 0.8,
                            "intent": intent,
                            "description": "Create todo with higher priority"
                        })
                
                # Variant with different horizon
                if "horizon" in parameters and parameters["horizon"] != "H1":
                    h1_params = parameters.copy()
                    h1_params["horizon"] = "H1"
                    command = self.t2p.generate_command(intent, h1_params)
                    if command:
                        suggestions.append({
                            "command": command,
                            "confidence": process_result["confidence"] * 0.7,
                            "intent": intent,
                            "description": "Create todo in current horizon (H1)"
                        })
            
            elif intent == "list_todos":
                # Variant with more filters
                if "status" not in parameters:
                    status_params = parameters.copy()
                    status_params["status"] = "in-progress"
                    command = self.t2p.generate_command(intent, status_params)
                    if command:
                        suggestions.append({
                            "command": command,
                            "confidence": process_result["confidence"] * 0.8,
                            "intent": intent,
                            "description": "List in-progress todos"
                        })
        
        # Limit suggestions
        return suggestions[:max_suggestions]
    
    def _add_suggestion(self, command: str) -> None:
        """Add a command to recent suggestions history.
        
        Args:
            command: The command string to add
        """
        # Add to front of list
        self.recent_suggestions.insert(0, {
            "command": command,
            "timestamp": time.time()
        })
        
        # Trim to max size
        if len(self.recent_suggestions) > self.max_suggestions_history:
            self.recent_suggestions = self.recent_suggestions[:self.max_suggestions_history]
    
    def get_recent_suggestions(self, count: int = 5) -> List[str]:
        """Get recently suggested commands.
        
        Args:
            count: Maximum number of suggestions to return
            
        Returns:
            List of recent command strings
        """
        return [s["command"] for s in self.recent_suggestions[:count]] 