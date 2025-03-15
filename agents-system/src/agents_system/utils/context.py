"""Context management for agents."""

from typing import Dict, List, Optional, Any, Set
from datetime import datetime
import json
import os
from pathlib import Path

class AgentContext:
    """Context for an agent, containing local information and history."""
    
    def __init__(self, agent_id: str):
        """Initialize agent context.
        
        Args:
            agent_id: ID of the agent this context belongs to.
        """
        self.agent_id = agent_id
        self.start_time = datetime.now()
        self.local_data: Dict[str, Any] = {}
        self.interaction_history: List[Dict[str, Any]] = []
        self.execution_history: List[Dict[str, Any]] = []
        self.focus_stack: List[str] = []  # Stack of task IDs the agent is focusing on
        self.tags: Set[str] = set()
    
    def update_local_data(self, key: str, value: Any) -> None:
        """Update local data.
        
        Args:
            key: Data key.
            value: Data value.
        """
        self.local_data[key] = value
    
    def get_local_data(self, key: str, default: Any = None) -> Any:
        """Get local data.
        
        Args:
            key: Data key.
            default: Default value if key doesn't exist.
            
        Returns:
            Data value, or default if key doesn't exist.
        """
        return self.local_data.get(key, default)
    
    def record_interaction(self, interaction_type: str, content: Any, 
                          metadata: Optional[Dict[str, Any]] = None) -> None:
        """Record an interaction.
        
        Args:
            interaction_type: Type of interaction.
            content: Content of the interaction.
            metadata: Additional metadata.
        """
        self.interaction_history.append({
            "timestamp": datetime.now().isoformat(),
            "type": interaction_type,
            "content": str(content),
            "metadata": metadata or {}
        })
    
    def record_execution(self, task_id: str, success: bool, 
                        details: str, duration_seconds: float,
                        metadata: Optional[Dict[str, Any]] = None) -> None:
        """Record task execution.
        
        Args:
            task_id: ID of the executed task.
            success: Whether execution was successful.
            details: Execution details.
            duration_seconds: Duration of execution in seconds.
            metadata: Additional metadata.
        """
        self.execution_history.append({
            "timestamp": datetime.now().isoformat(),
            "task_id": task_id,
            "success": success,
            "details": details,
            "duration_seconds": duration_seconds,
            "metadata": metadata or {}
        })
    
    def push_focus(self, task_id: str) -> None:
        """Push a task onto the focus stack.
        
        Args:
            task_id: ID of the task to focus on.
        """
        self.focus_stack.append(task_id)
    
    def pop_focus(self) -> Optional[str]:
        """Pop the top task from the focus stack.
        
        Returns:
            ID of the popped task, or None if stack is empty.
        """
        if not self.focus_stack:
            return None
        
        return self.focus_stack.pop()
    
    def get_current_focus(self) -> Optional[str]:
        """Get the current focus.
        
        Returns:
            ID of the current focus, or None if stack is empty.
        """
        if not self.focus_stack:
            return None
        
        return self.focus_stack[-1]
    
    def add_tag(self, tag: str) -> None:
        """Add a tag to the context.
        
        Args:
            tag: Tag to add.
        """
        self.tags.add(tag)
    
    def remove_tag(self, tag: str) -> None:
        """Remove a tag from the context.
        
        Args:
            tag: Tag to remove.
        """
        self.tags.discard(tag)
    
    def has_tag(self, tag: str) -> bool:
        """Check if context has a tag.
        
        Args:
            tag: Tag to check.
            
        Returns:
            True if context has the tag, False otherwise.
        """
        return tag in self.tags
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert context to dictionary.
        
        Returns:
            Dictionary representation of the context.
        """
        return {
            "agent_id": self.agent_id,
            "start_time": self.start_time.isoformat(),
            "local_data": self.local_data,
            "interaction_history": self.interaction_history,
            "execution_history": self.execution_history,
            "focus_stack": self.focus_stack,
            "tags": list(self.tags)
        }
    
    def save_to_file(self, filepath: str) -> None:
        """Save context to a file.
        
        Args:
            filepath: Path to save the context to.
        """
        with open(filepath, 'w') as f:
            json.dump(self.to_dict(), f, indent=2)
    
    @classmethod
    def load_from_file(cls, filepath: str) -> 'AgentContext':
        """Load context from a file.
        
        Args:
            filepath: Path to load the context from.
            
        Returns:
            Loaded context.
        """
        with open(filepath, 'r') as f:
            data = json.load(f)
        
        context = cls(data["agent_id"])
        context.start_time = datetime.fromisoformat(data["start_time"])
        context.local_data = data["local_data"]
        context.interaction_history = data["interaction_history"]
        context.execution_history = data["execution_history"]
        context.focus_stack = data["focus_stack"]
        context.tags = set(data["tags"])
        
        return context

class ContextManager:
    """Manager for agent contexts."""
    
    def __init__(self, storage_dir: Optional[str] = None):
        """Initialize the context manager.
        
        Args:
            storage_dir: Directory to store contexts. If None, contexts won't be persisted.
        """
        self.contexts: Dict[str, AgentContext] = {}
        self.storage_dir = storage_dir
        
        if storage_dir:
            os.makedirs(storage_dir, exist_ok=True)
    
    def get_context(self, agent_id: str) -> AgentContext:
        """Get context for an agent.
        
        Args:
            agent_id: ID of the agent to get context for.
            
        Returns:
            Context for the agent.
        """
        if agent_id not in self.contexts:
            # Try to load from storage
            if self.storage_dir:
                filepath = os.path.join(self.storage_dir, f"{agent_id}.json")
                if os.path.exists(filepath):
                    self.contexts[agent_id] = AgentContext.load_from_file(filepath)
                else:
                    self.contexts[agent_id] = AgentContext(agent_id)
            else:
                self.contexts[agent_id] = AgentContext(agent_id)
        
        return self.contexts[agent_id]
    
    def save_context(self, agent_id: str) -> None:
        """Save context for an agent.
        
        Args:
            agent_id: ID of the agent to save context for.
        """
        if not self.storage_dir:
            return
        
        if agent_id not in self.contexts:
            return
        
        filepath = os.path.join(self.storage_dir, f"{agent_id}.json")
        self.contexts[agent_id].save_to_file(filepath)
    
    def save_all_contexts(self) -> None:
        """Save all contexts."""
        if not self.storage_dir:
            return
        
        for agent_id in self.contexts:
            self.save_context(agent_id)
    
    def record_global_event(self, event_type: str, description: str, 
                           metadata: Optional[Dict[str, Any]] = None) -> None:
        """Record a global event.
        
        Args:
            event_type: Type of event.
            description: Description of the event.
            metadata: Additional metadata.
        """
        if not self.storage_dir:
            return
        
        events_file = os.path.join(self.storage_dir, "global_events.jsonl")
        
        event = {
            "timestamp": datetime.now().isoformat(),
            "type": event_type,
            "description": description,
            "metadata": metadata or {}
        }
        
        with open(events_file, 'a') as f:
            f.write(json.dumps(event) + "\n")
    
    def query_contexts_by_tag(self, tag: str) -> List[str]:
        """Query contexts by tag.
        
        Args:
            tag: Tag to query for.
            
        Returns:
            List of agent IDs whose contexts have the tag.
        """
        return [
            agent_id for agent_id, context in self.contexts.items()
            if context.has_tag(tag)
        ]
    
    def get_context_summary(self, agent_id: str) -> Dict[str, Any]:
        """Get a summary of an agent's context.
        
        Args:
            agent_id: ID of the agent to get context summary for.
            
        Returns:
            Summary of the agent's context.
        """
        if agent_id not in self.contexts:
            return {}
        
        context = self.contexts[agent_id]
        
        return {
            "agent_id": agent_id,
            "uptime_seconds": (datetime.now() - context.start_time).total_seconds(),
            "interaction_count": len(context.interaction_history),
            "execution_count": len(context.execution_history),
            "current_focus": context.get_current_focus(),
            "tags": list(context.tags),
            "last_execution": context.execution_history[-1] if context.execution_history else None
        } 