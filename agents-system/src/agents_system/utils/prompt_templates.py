"""Prompt templates for standardized agent interactions."""

from typing import Dict, List, Optional, Any, Union
from string import Template
from datetime import datetime

class PromptTemplate:
    """Template for structured prompts."""
    
    def __init__(self, template_string: str, template_variables: List[str]):
        """Initialize the prompt template.
        
        Args:
            template_string: The template string with placeholders.
            template_variables: List of variables required by the template.
        """
        self.template = Template(template_string)
        self.variables = template_variables
    
    def render(self, **kwargs) -> str:
        """Render the template with the provided variables.
        
        Args:
            **kwargs: Variables to substitute in the template.
            
        Returns:
            The rendered template.
        """
        # Validate that all required variables are provided
        for var in self.variables:
            if var not in kwargs:
                raise ValueError(f"Missing required variable '{var}' for prompt template")
        
        return self.template.substitute(**kwargs)

# Task Planning Templates
TASK_PLANNING_TEMPLATE = PromptTemplate(
    """
    # Task Planning Request
    
    ## Objective
    ${objective}
    
    ## Current Context
    ${context}
    
    ## Task Constraints
    - Time available: ${time_available}
    - Priority: ${priority}
    - Horizon: ${horizon}
    
    ## Available Resources
    ${resources}
    
    ## Required Output Format
    Please provide:
    1. A breakdown of subtasks with clear deliverables
    2. Estimated time for each subtask
    3. Dependencies between subtasks
    4. Success criteria for each subtask
    """,
    ["objective", "context", "time_available", "priority", "horizon", "resources"]
)

# Code Generation Templates
CODE_GENERATION_TEMPLATE = PromptTemplate(
    """
    # Code Generation Request
    
    ## Objective
    ${objective}
    
    ## Required Functionality
    ${functionality}
    
    ## Technical Context
    - Language: ${language}
    - Framework: ${framework}
    - Environment: ${environment}
    
    ## Code Style Requirements
    ${code_style}
    
    ## Constraints
    ${constraints}
    
    ## Success Criteria
    ${success_criteria}
    """,
    ["objective", "functionality", "language", "framework", "environment", "code_style", "constraints", "success_criteria"]
)

# Advanced Task Decomposition Template
TASK_DECOMPOSITION_TEMPLATE = PromptTemplate(
    """
    # Task Decomposition Request
    
    ## Task Description
    ${task_description}
    
    ## Input Details
    ${input_details}
    
    ## Expected Output
    ${expected_output}
    
    ## Context
    ${context}
    
    ## Decomposition Approach
    Please break down this task into:
    1. Independent subtasks that can be executed in parallel
    2. Sequential subtasks with dependencies
    3. Critical path for execution
    4. Verification steps for each subtask
    """,
    ["task_description", "input_details", "expected_output", "context"]
)

# File Operation Template
FILE_OPERATION_TEMPLATE = PromptTemplate(
    """
    # File Operation Request
    
    ## Operation Type
    ${operation_type}
    
    ## Target Files
    ${target_files}
    
    ## Operation Details
    ${operation_details}
    
    ## Context
    ${context}
    
    ## Validation Criteria
    ${validation_criteria}
    
    ## Required Format
    Please provide:
    1. Steps to perform the operation
    2. Validation approach
    3. Rollback plan if operation fails
    """,
    ["operation_type", "target_files", "operation_details", "context", "validation_criteria"]
)

# Agent Decision Template
AGENT_DECISION_TEMPLATE = PromptTemplate(
    """
    # Agent Decision Request
    
    ## Decision Context
    ${decision_context}
    
    ## Available Options
    ${available_options}
    
    ## Decision Criteria
    ${decision_criteria}
    
    ## Constraints
    ${constraints}
    
    ## Required Output
    Please provide:
    1. Analysis of each option against the criteria
    2. Recommendation with justification
    3. Potential risks and mitigations for the recommended option
    """,
    ["decision_context", "available_options", "decision_criteria", "constraints"]
)

# Performance Optimization Template
PERFORMANCE_OPTIMIZATION_TEMPLATE = PromptTemplate(
    """
    # Performance Optimization Request
    
    ## Current Performance
    ${current_performance}
    
    ## Performance Target
    ${performance_target}
    
    ## System Context
    ${system_context}
    
    ## Resource Constraints
    ${resource_constraints}
    
    ## Required Output
    Please provide:
    1. Analysis of performance bottlenecks
    2. Optimization recommendations by priority
    3. Implementation plan for optimizations
    4. Verification approach to confirm improvements
    """,
    ["current_performance", "performance_target", "system_context", "resource_constraints"]
)

# Template Registry
TEMPLATE_REGISTRY = {
    "task_planning": TASK_PLANNING_TEMPLATE,
    "code_generation": CODE_GENERATION_TEMPLATE,
    "task_decomposition": TASK_DECOMPOSITION_TEMPLATE,
    "file_operation": FILE_OPERATION_TEMPLATE,
    "agent_decision": AGENT_DECISION_TEMPLATE,
    "performance_optimization": PERFORMANCE_OPTIMIZATION_TEMPLATE
}

def get_template(template_name: str) -> PromptTemplate:
    """Get a prompt template by name.
    
    Args:
        template_name: Name of the template to get.
        
    Returns:
        The requested prompt template.
    """
    if template_name not in TEMPLATE_REGISTRY:
        raise ValueError(f"Unknown template name: {template_name}")
    
    return TEMPLATE_REGISTRY[template_name]

# Success Pattern Analysis
class PromptPatternAnalyzer:
    """Analyzer for identifying successful prompt patterns."""
    
    def __init__(self):
        """Initialize the prompt pattern analyzer."""
        self.patterns: Dict[str, Dict[str, Any]] = {}
    
    def analyze_success(self, prompt: str, result: Any, category: str, metadata: Optional[Dict[str, Any]] = None) -> None:
        """Record a successful prompt pattern.
        
        Args:
            prompt: The prompt that was successful.
            result: The result of using the prompt.
            category: Category for the pattern.
            metadata: Additional metadata about the pattern.
        """
        if category not in self.patterns:
            self.patterns[category] = {
                "count": 0,
                "examples": [],
                "common_elements": set(),
                "metadata": {}
            }
        
        pattern = self.patterns[category]
        pattern["count"] += 1
        
        # Add example
        pattern["examples"].append({
            "prompt": prompt,
            "result_summary": str(result)[:200],  # Truncate long results
            "timestamp": datetime.now().isoformat(),
            "metadata": metadata or {}
        })
        
        # Update metadata
        if metadata:
            for key, value in metadata.items():
                if key not in pattern["metadata"]:
                    pattern["metadata"][key] = {}
                
                # Count occurrences of metadata values
                str_value = str(value)
                if str_value not in pattern["metadata"][key]:
                    pattern["metadata"][key][str_value] = 0
                pattern["metadata"][key][str_value] += 1
        
        # Analyze common elements when we have multiple examples
        if len(pattern["examples"]) > 1:
            # This is a simple approach - in a real system you'd use more sophisticated NLP
            # to identify common patterns
            lines = prompt.strip().split("\n")
            if not pattern["common_elements"]:
                pattern["common_elements"] = set(lines)
            else:
                pattern["common_elements"] &= set(lines)
    
    def export_patterns(self, filepath: str) -> None:
        """Export identified patterns to a file.
        
        Args:
            filepath: Path to export the patterns to.
        """
        import json
        
        # Convert sets to lists for JSON serialization
        export_data = {}
        for category, pattern in self.patterns.items():
            export_data[category] = {
                "count": pattern["count"],
                "examples": pattern["examples"][-5:],  # Just include the last 5 examples
                "common_elements": list(pattern["common_elements"]),
                "metadata": pattern["metadata"]
            }
        
        with open(filepath, 'w') as f:
            json.dump(export_data, f, indent=2)
    
    def generate_template_suggestion(self, category: str) -> Optional[str]:
        """Generate a template suggestion based on identified patterns.
        
        Args:
            category: Category to generate a template for.
            
        Returns:
            Suggested template string, or None if not enough data.
        """
        if category not in self.patterns or self.patterns[category]["count"] < 3:
            return None  # Not enough data to generate a meaningful template
        
        pattern = self.patterns[category]
        
        # Start with common elements as the base template
        template_lines = list(pattern["common_elements"])
        
        # Sort by probable order (assuming common elements are whole lines)
        # A more sophisticated implementation would use NLP to understand structure
        template_lines.sort(key=lambda line: sum(
            1 for example in pattern["examples"] 
            if line in example["prompt"] and 
            example["prompt"].index(line) < len(example["prompt"]) / 2
        ), reverse=True)
        
        return "\n".join(template_lines)

# Chain of Thought Templates
CHAIN_OF_THOUGHT_TEMPLATE = PromptTemplate(
    """
    # Chain of Thought Analysis
    
    ## Problem Statement
    ${problem_statement}
    
    ## Let's think about this step by step:
    1. First, let's understand what we're being asked to do:
       ${problem_understanding}
    
    2. What are the key components or variables involved?
       ${key_components}
    
    3. What relevant knowledge or techniques do we need to apply?
       ${relevant_knowledge}
    
    4. How can we break this down into smaller, manageable steps?
       ${step_breakdown}
    
    5. Let's work through each step methodically:
       ${step_by_step_solution}
    
    6. Are there any edge cases or special considerations?
       ${edge_cases}
    
    7. Let's verify our solution against the original problem:
       ${verification}
    
    ## Final Answer
    Based on my step-by-step analysis, the answer is:
    ${final_answer}
    """,
    ["problem_statement", "problem_understanding", "key_components", 
     "relevant_knowledge", "step_breakdown", "step_by_step_solution", 
     "edge_cases", "verification", "final_answer"]
)

TEMPLATE_REGISTRY["chain_of_thought"] = CHAIN_OF_THOUGHT_TEMPLATE 