"""Prompt engine for generating and analyzing prompts."""

from typing import Dict, List, Optional, Any, Union
import json
import os
from datetime import datetime
from pathlib import Path

from agents_system.utils.prompt_templates import (
    PromptTemplate, 
    get_template,
    PromptPatternAnalyzer,
    TEMPLATE_REGISTRY
)

class PromptEngine:
    """Engine for generating and analyzing prompts."""
    
    def __init__(self, pattern_storage_path: Optional[str] = None):
        """Initialize the prompt engine.
        
        Args:
            pattern_storage_path: Path to store prompt patterns. If None, 
                                 patterns will not be persisted.
        """
        self.analyzer = PromptPatternAnalyzer()
        self.pattern_storage_path = pattern_storage_path
        self.cache: Dict[str, Any] = {}
        
        # Load existing patterns if storage path exists
        if pattern_storage_path and os.path.exists(pattern_storage_path):
            self._load_patterns()
    
    def generate_prompt(self, template_name: str, **kwargs) -> str:
        """Generate a prompt using a template.
        
        Args:
            template_name: Name of the template to use.
            **kwargs: Variables to substitute in the template.
            
        Returns:
            The generated prompt.
        """
        template = get_template(template_name)
        return template.render(**kwargs)
    
    def record_success(self, template_name: str, prompt: str, result: Any, 
                      metadata: Optional[Dict[str, Any]] = None) -> None:
        """Record a successful prompt pattern.
        
        Args:
            template_name: Name of the template used.
            prompt: The prompt that was successful.
            result: The result of using the prompt.
            metadata: Additional metadata about the pattern.
        """
        # Add template name to metadata
        full_metadata = metadata or {}
        full_metadata["template_name"] = template_name
        
        # Record in analyzer
        self.analyzer.analyze_success(prompt, result, template_name, full_metadata)
        
        # Persist patterns if storage path is set
        if self.pattern_storage_path:
            self._save_patterns()
    
    def generate_task_planning_prompt(self, objective: str, context: str, 
                                     time_available: str, priority: str,
                                     horizon: str, resources: str) -> str:
        """Generate a task planning prompt.
        
        Args:
            objective: The objective of the task.
            context: Current context information.
            time_available: Time available for the task.
            priority: Priority of the task.
            horizon: Time horizon of the task.
            resources: Available resources for the task.
            
        Returns:
            The generated prompt.
        """
        return self.generate_prompt(
            "task_planning",
            objective=objective,
            context=context,
            time_available=time_available,
            priority=priority,
            horizon=horizon,
            resources=resources
        )
    
    def generate_code_prompt(self, objective: str, functionality: str,
                           language: str, framework: str, environment: str,
                           code_style: str, constraints: str, 
                           success_criteria: str) -> str:
        """Generate a code generation prompt.
        
        Args:
            objective: The objective of the code generation.
            functionality: Required functionality.
            language: Programming language to use.
            framework: Framework to use.
            environment: Execution environment.
            code_style: Code style requirements.
            constraints: Constraints to consider.
            success_criteria: Success criteria for the code.
            
        Returns:
            The generated prompt.
        """
        return self.generate_prompt(
            "code_generation",
            objective=objective,
            functionality=functionality,
            language=language,
            framework=framework,
            environment=environment,
            code_style=code_style,
            constraints=constraints,
            success_criteria=success_criteria
        )
    
    def generate_chain_of_thought_prompt(self, problem_statement: str) -> str:
        """Generate a chain of thought prompt with minimal required fields.
        
        This is a simplified version that auto-populates some fields.
        
        Args:
            problem_statement: The problem to analyze.
            
        Returns:
            The generated prompt.
        """
        return self.generate_prompt(
            "chain_of_thought",
            problem_statement=problem_statement,
            problem_understanding="<analyze the problem>",
            key_components="<identify key components>",
            relevant_knowledge="<identify relevant knowledge or techniques>",
            step_breakdown="<break down into steps>",
            step_by_step_solution="<work through each step>",
            edge_cases="<consider edge cases>",
            verification="<verify the solution>",
            final_answer="<provide the final answer>"
        )
    
    def get_success_patterns(self, template_name: Optional[str] = None) -> Dict[str, Any]:
        """Get successful prompt patterns.
        
        Args:
            template_name: Name of the template to get patterns for. If None,
                          patterns for all templates are returned.
            
        Returns:
            Dictionary of success patterns.
        """
        if template_name:
            patterns = self.analyzer.get_success_patterns()
            return {template_name: patterns.get(template_name, {})}
        else:
            return self.analyzer.get_success_patterns()
    
    def suggest_template(self, template_name: str) -> Optional[str]:
        """Generate a template suggestion based on successful patterns.
        
        Args:
            template_name: Template name to generate a suggestion for.
            
        Returns:
            Suggested template string, or None if not enough data.
        """
        return self.analyzer.generate_template_suggestion(template_name)
    
    def export_patterns_to_master_player(self, filepath: str) -> None:
        """Export patterns to the master player MDC file.
        
        Args:
            filepath: Path to the master player MDC file.
        """
        # Get all patterns
        patterns = self.analyzer.get_success_patterns()
        
        # Create MDC content
        content = f"# Master Player - Prompt Patterns\n\n"
        content += f"Updated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n"
        
        # Add pattern statistics
        content += "## Pattern Statistics\n\n"
        content += "| Category | Count | Success Rate |\n"
        content += "|----------|-------|-------------|\n"
        
        for category, pattern in patterns.items():
            count = pattern["count"]
            success_rate = "N/A"  # In a real system, you'd calculate this
            content += f"| {category} | {count} | {success_rate} |\n"
        
        # Add pattern details for each category
        for category, pattern in patterns.items():
            content += f"\n## {category.replace('_', ' ').title()}\n\n"
            
            # Add common elements
            if pattern["common_elements"]:
                content += "### Common Elements\n\n"
                content += "```\n"
                for element in sorted(pattern["common_elements"]):
                    content += f"{element}\n"
                content += "```\n\n"
            
            # Add examples
            if pattern["examples"]:
                content += "### Examples\n\n"
                for i, example in enumerate(pattern["examples"][-3:]):  # Show last 3 examples
                    content += f"#### Example {i+1}\n\n"
                    content += "```\n"
                    content += example["prompt"][:500] + "..." if len(example["prompt"]) > 500 else example["prompt"]
                    content += "\n```\n\n"
                    content += f"Result: {example['result_summary']}\n\n"
                    content += f"Timestamp: {example['timestamp']}\n\n"
            
            # Add template suggestion
            suggestion = self.analyzer.generate_template_suggestion(category)
            if suggestion:
                content += "### Suggested Template\n\n"
                content += "```\n"
                content += suggestion
                content += "\n```\n\n"
        
        # Write to file
        with open(filepath, 'w') as f:
            f.write(content)
    
    def _load_patterns(self) -> None:
        """Load patterns from storage."""
        try:
            with open(self.pattern_storage_path, 'r') as f:
                data = json.load(f)
            
            # Convert to internal format
            for category, pattern_data in data.items():
                if "common_elements" in pattern_data:
                    pattern_data["common_elements"] = set(pattern_data["common_elements"])
                
                if category not in self.analyzer.patterns:
                    self.analyzer.patterns[category] = pattern_data
        except (json.JSONDecodeError, FileNotFoundError):
            # Initialize empty patterns if file doesn't exist or is invalid
            pass
    
    def _save_patterns(self) -> None:
        """Save patterns to storage."""
        # Ensure directory exists
        os.makedirs(os.path.dirname(self.pattern_storage_path), exist_ok=True)
        
        # Use the analyzer's export method
        self.analyzer.export_patterns(self.pattern_storage_path)
    
    def register_custom_template(self, name: str, template_string: str, 
                               variables: List[str]) -> None:
        """Register a custom prompt template.
        
        Args:
            name: Name for the template.
            template_string: The template string with placeholders.
            variables: List of variables required by the template.
        """
        template = PromptTemplate(template_string, variables)
        TEMPLATE_REGISTRY[name] = template 