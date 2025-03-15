"""T2P integration for the agent system.

This module provides functionality for integrating the t2p CLI tool
with AI model interactions, enabling automated command generation
and execution based on natural language input.
"""

import os
import json
import subprocess
import logging
from typing import Dict, List, Optional, Any, Union, Tuple

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("t2p-integration")

class T2PIntegration:
    """Integration with the t2p CLI tool for efficient AI-model interactions."""

    def __init__(self, t2p_path: Optional[str] = None):
        """Initialize the T2P integration.
        
        Args:
            t2p_path: Path to the t2p binary. If None, will try to find it in PATH.
        """
        self.t2p_path = t2p_path or self._find_t2p_binary()
        if not self.t2p_path:
            logger.warning("T2P binary not found. Some functionality may be limited.")
        
        # Command templates for common operations
        self.command_templates = {
            "todo_add": "t2p todo add --title \"{title}\" --description \"{description}\" --priority {priority} --horizon {horizon} --tags \"{tags}\" --category \"{category}\"",
            "todo_list": "t2p todo list {filters}",
            "todo_update": "t2p todo update {id} {updates}",
            "note_new": "t2p note new \"{title}\" --content \"{content}\" --tags \"{tags}\" --category \"{category}\"",
            "note_ai": "t2p note new --ai \"{prompt}\"",
        }
        
        # Command patterns for intent detection
        self.intent_patterns = {
            "create_todo": ["create task", "add todo", "new task", "create todo", "add task"],
            "list_todos": ["list tasks", "show todos", "display tasks", "get todos", "view tasks"],
            "update_todo": ["update task", "change todo", "modify task", "edit todo"],
            "create_note": ["create note", "add note", "new note", "write note"],
            "create_ai_note": ["ai note", "generate note", "create ai note", "write content for me"],
        }
    
    def _find_t2p_binary(self) -> Optional[str]:
        """Find the t2p binary in the system PATH."""
        try:
            result = subprocess.run(
                ["which", "t2p"], 
                capture_output=True, 
                text=True, 
                check=False
            )
            if result.returncode == 0:
                return result.stdout.strip()
            
            # Check common installation locations
            common_paths = [
                os.path.expanduser("~/.local/bin/t2p"),
                os.path.expanduser("~/OSPAiN2/t2p/dist/t2p"),
                "/usr/local/bin/t2p",
            ]
            for path in common_paths:
                if os.path.exists(path) and os.access(path, os.X_OK):
                    return path
                    
            return None
        except Exception as e:
            logger.error(f"Error finding t2p binary: {e}")
            return None
    
    def detect_intent(self, user_input: str) -> Tuple[Optional[str], float]:
        """Detect the user intent from natural language input.
        
        Args:
            user_input: The natural language input from the user
            
        Returns:
            A tuple of (intent_name, confidence_score) or (None, 0.0) if no intent detected
        """
        user_input = user_input.lower()
        
        # Simple pattern matching for now, can be replaced with ML-based approach later
        for intent, patterns in self.intent_patterns.items():
            for pattern in patterns:
                if pattern in user_input:
                    # Calculate a simple confidence score based on pattern length
                    confidence = len(pattern) / len(user_input)
                    return intent, min(confidence * 2, 0.95)  # Cap at 0.95
        
        return None, 0.0
    
    def generate_command(self, intent: str, parameters: Dict[str, Any]) -> Optional[str]:
        """Generate a t2p command based on intent and parameters.
        
        Args:
            intent: The detected intent (e.g., "create_todo")
            parameters: Dict of parameters for the command
            
        Returns:
            The generated command string or None if generation failed
        """
        if intent not in self.command_templates:
            logger.warning(f"Unknown intent: {intent}")
            return None
        
        try:
            if intent == "todo_add":
                return self.command_templates[intent].format(
                    title=parameters.get("title", "Untitled Task"),
                    description=parameters.get("description", ""),
                    priority=parameters.get("priority", 3),
                    horizon=parameters.get("horizon", "H1"),
                    tags=",".join(parameters.get("tags", [])),
                    category=parameters.get("category", "")
                )
            elif intent == "todo_list":
                filters = ""
                if "priority" in parameters:
                    filters += f" --priority {parameters['priority']}"
                if "status" in parameters:
                    filters += f" --status {parameters['status']}"
                if "horizon" in parameters:
                    filters += f" --horizon {parameters['horizon']}"
                if "tags" in parameters and parameters["tags"]:
                    filters += f" --tags \"{','.join(parameters['tags'])}\""
                if "category" in parameters:
                    filters += f" --category \"{parameters['category']}\""
                if "search" in parameters:
                    filters += f" --search \"{parameters['search']}\""
                
                return self.command_templates[intent].format(filters=filters)
            
            elif intent == "todo_update":
                updates = ""
                for key, value in parameters.items():
                    if key != "id" and value is not None:
                        if key == "tags":
                            value = ",".join(value)
                        updates += f" --{key} \"{value}\""
                
                return self.command_templates[intent].format(
                    id=parameters.get("id", ""),
                    updates=updates
                )
            
            elif intent == "note_new":
                return self.command_templates[intent].format(
                    title=parameters.get("title", "Untitled Note"),
                    content=parameters.get("content", ""),
                    tags=",".join(parameters.get("tags", [])),
                    category=parameters.get("category", "")
                )
                
            elif intent == "note_ai":
                return self.command_templates[intent].format(
                    prompt=parameters.get("prompt", "")
                )
                
            return None
        
        except Exception as e:
            logger.error(f"Error generating command: {e}")
            return None
    
    def execute_command(self, command: str) -> Dict[str, Any]:
        """Execute a t2p command and return the results.
        
        Args:
            command: The command string to execute
            
        Returns:
            Dict containing the command results
        """
        if not self.t2p_path:
            return {"success": False, "error": "T2P binary not found"}
        
        try:
            # Add --json flag to get structured output if applicable
            if not command.endswith("--json") and not "--json" in command:
                command += " --json"
                
            logger.info(f"Executing command: {command}")
            result = subprocess.run(
                command,
                shell=True,
                capture_output=True,
                text=True
            )
            
            if result.returncode == 0:
                try:
                    return {
                        "success": True,
                        "data": json.loads(result.stdout),
                        "raw": result.stdout
                    }
                except json.JSONDecodeError:
                    # Not all commands return JSON
                    return {
                        "success": True,
                        "data": None,
                        "raw": result.stdout
                    }
            else:
                return {
                    "success": False,
                    "error": result.stderr,
                    "exit_code": result.returncode
                }
        
        except Exception as e:
            logger.error(f"Error executing command: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def process_natural_language(self, user_input: str) -> Dict[str, Any]:
        """Process natural language input and execute appropriate t2p command.
        
        Args:
            user_input: Natural language input from the user
            
        Returns:
            Dict containing the processing results
        """
        # 1. Detect intent
        intent, confidence = self.detect_intent(user_input)
        
        if not intent or confidence < 0.6:
            return {
                "success": False,
                "error": "Could not determine intent with sufficient confidence",
                "intent": intent,
                "confidence": confidence
            }
        
        # 2. Extract parameters (simplified version - would normally use NLP)
        parameters = self._extract_parameters(user_input, intent)
        
        # 3. Generate command
        command = self.generate_command(intent, parameters)
        if not command:
            return {
                "success": False,
                "error": "Failed to generate command",
                "intent": intent,
                "parameters": parameters
            }
        
        # 4. Execute command
        result = self.execute_command(command)
        
        # 5. Return comprehensive results
        return {
            "success": result.get("success", False),
            "intent": intent,
            "confidence": confidence,
            "parameters": parameters,
            "command": command,
            "result": result
        }
    
    def _extract_parameters(self, user_input: str, intent: str) -> Dict[str, Any]:
        """Extract parameters from natural language input based on intent.
        
        This is a simplified implementation. In a full system, this would use
        NLP techniques to more accurately extract structured parameters.
        
        Args:
            user_input: Natural language input from the user
            intent: The detected intent
            
        Returns:
            Dict of extracted parameters
        """
        # Simple parameter extraction based on keyword identification
        parameters = {}
        
        if intent == "create_todo":
            # Extract title (everything after "create task" or similar)
            for pattern in self.intent_patterns["create_todo"]:
                if pattern in user_input.lower():
                    title_part = user_input.lower().split(pattern, 1)[1].strip()
                    parameters["title"] = title_part
                    break
            
            # Extract priority if mentioned
            if "priority" in user_input.lower():
                for i in range(1, 6):
                    if f"priority {i}" in user_input.lower() or f"p{i}" in user_input.lower():
                        parameters["priority"] = i
                        break
            
            # Extract horizon if mentioned
            for h in ["H1", "H2", "H3"]:
                if h in user_input:
                    parameters["horizon"] = h
                    break
            
            # Simple tag extraction (look for #tag or "tags: tag1,tag2")
            tags = []
            if "tags:" in user_input.lower():
                tags_part = user_input.lower().split("tags:", 1)[1].strip()
                if "," in tags_part:
                    tags = [tag.strip() for tag in tags_part.split(",")]
                else:
                    tags = [tags_part.split()[0].strip()]
            
            # Look for hashtags
            words = user_input.split()
            hashtags = [word[1:] for word in words if word.startswith("#")]
            tags.extend(hashtags)
            
            if tags:
                parameters["tags"] = tags
        
        elif intent == "list_todos":
            # Extract status if mentioned
            for status in ["not-started", "in-progress", "blocked", "completed", "recurring"]:
                if status in user_input.lower():
                    parameters["status"] = status
                    break
            
            # Extract horizon if mentioned
            for h in ["H1", "H2", "H3"]:
                if h in user_input:
                    parameters["horizon"] = h
                    break
            
            # Extract priority if mentioned
            if "priority" in user_input.lower():
                for i in range(1, 6):
                    if f"priority {i}" in user_input.lower() or f"p{i}" in user_input.lower():
                        parameters["priority"] = i
                        break
                        
        elif intent == "create_ai_note":
            # The entire input becomes the prompt for AI note generation
            parameters["prompt"] = user_input
        
        return parameters 