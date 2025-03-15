"""Model Context Provider for T2P-AI integration.

This module provides integration between AI models and the T2P system,
managing context for AI interactions and facilitating command generation.
"""

import os
import json
import time
import logging
import asyncio
from typing import Dict, List, Optional, Any, Union, Callable

from agents_system.integrations.t2p import T2PIntegration
from agents_system.integrations.ai_t2p_adapter import AIT2PAdapter

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("model-context-provider")

class ModelContextProvider:
    """Provider for AI model context integration with T2P."""
    
    def __init__(self):
        """Initialize the model context provider."""
        self.t2p_integration = T2PIntegration()
        self.ai_adapter = AIT2PAdapter(self.t2p_integration)
        
        # LLM call handler (to be set by user)
        self.llm_call_handler = None
        
        # Context management
        self.context_cache = {}
        self.context_ttl = 3600  # 1 hour in seconds
        
        # Performance tracking
        self.command_history = []
        self.max_history_size = 100
        self.success_counts = {
            "direct_command_generation": 0,
            "intent_extraction": 0,
            "pattern_fallback": 0,
            "ai_output_extraction": 0
        }
        self.total_attempts = {
            "direct_command_generation": 0,
            "intent_extraction": 0,
            "pattern_fallback": 0,
            "ai_output_extraction": 0
        }
    
    def register_llm_call_handler(self, handler: Callable[[str], str]) -> None:
        """Register a handler function for LLM calls.
        
        The handler should take a prompt string and return the model's response.
        
        Args:
            handler: Function that makes LLM calls
        """
        self.llm_call_handler = handler
    
    async def process_user_input(self, user_input: str) -> Dict[str, Any]:
        """Process user input to generate and execute T2P commands.
        
        Args:
            user_input: Natural language input from user
            
        Returns:
            Dict with processing results
        """
        if self.llm_call_handler:
            # Use LLM-enhanced processing
            result = await self.ai_adapter.process_user_input_with_llm(
                user_input, 
                self.llm_call_handler
            )
        else:
            # Use pattern-based processing
            result = self.ai_adapter.process_user_input(user_input)
        
        # Track performance
        self._track_performance(result)
        
        return result
    
    def process_ai_output(self, ai_output: str) -> Dict[str, Any]:
        """Process AI model output to extract and execute T2P commands.
        
        Args:
            ai_output: Output text from an AI model
            
        Returns:
            Dict with processing results
        """
        result = self.ai_adapter.process_ai_output(ai_output)
        
        # Track performance for AI output extraction
        method = "ai_output_extraction"
        self.total_attempts[method] += 1
        if result["success"]:
            self.success_counts[method] += 1
        
        return result
    
    def get_command_suggestions(self, user_input: str, max_suggestions: int = 3) -> List[Dict[str, Any]]:
        """Get command suggestions based on user input without executing them.
        
        Args:
            user_input: Natural language input from user
            max_suggestions: Maximum number of suggestions to return
            
        Returns:
            List of command suggestion objects
        """
        return self.ai_adapter.suggest_commands(user_input, max_suggestions)
    
    def get_recent_commands(self, count: int = 5) -> List[Dict[str, Any]]:
        """Get recently executed commands.
        
        Args:
            count: Maximum number of commands to return
            
        Returns:
            List of recent command objects
        """
        return self.command_history[:count]
    
    def get_performance_metrics(self) -> Dict[str, Any]:
        """Get performance metrics for command processing methods.
        
        Returns:
            Dict with performance metrics
        """
        metrics = {}
        
        for method in self.total_attempts:
            attempts = self.total_attempts[method]
            if attempts > 0:
                success_rate = self.success_counts[method] / attempts
            else:
                success_rate = 0
                
            metrics[method] = {
                "success_rate": success_rate,
                "total_attempts": attempts,
                "successful_attempts": self.success_counts[method]
            }
        
        return metrics
    
    def _track_performance(self, result: Dict[str, Any]) -> None:
        """Track performance metrics for the given result.
        
        Args:
            result: Processing result dict
        """
        # Add to command history
        if "command" in result:
            command_entry = {
                "command": result["command"],
                "success": result.get("success", False),
                "method": result.get("method", "unknown"),
                "timestamp": time.time()
            }
            
            self.command_history.insert(0, command_entry)
            
            # Trim history if needed
            if len(self.command_history) > self.max_history_size:
                self.command_history = self.command_history[:self.max_history_size]
        
        # Update success counts
        method = result.get("method")
        if method in self.total_attempts:
            self.total_attempts[method] += 1
            if result.get("success", False):
                self.success_counts[method] += 1 