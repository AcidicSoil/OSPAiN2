# Agent System Examples

This directory contains example scripts demonstrating how to use the OSPAiN2 Agent System.

## Prompt Templates and Engine Example

The `prompt_engine_example.py` file demonstrates how to use the prompt templating system to standardize agent interactions. This example shows:

1. How to create prompt-driven agents
2. How to use standardized templates for different task types
3. How to record successful patterns for future optimization
4. How to export patterns to the master-player.mdc file

### Running the Example

```bash
# From the repository root
python -m agents_system.examples.prompt_engine_example
```

### Key Features

- **Template-Based Prompts**: Standardized templates for different task types (planning, coding, etc.)
- **Pattern Analysis**: Records successful patterns for continuous improvement
- **Master Player Export**: Exports patterns to a markdown file for analysis
- **Agent Specialization**: Shows how to create agents specialized for different task types
- **Success Tracking**: Records and analyzes successful execution patterns

### Prompt Templates

The system includes several pre-defined templates:

- **Task Planning**: For breaking down complex tasks into smaller steps
- **Code Generation**: For generating code with specific requirements
- **Task Decomposition**: For advanced task breakdown with parallel/sequential execution
- **File Operation**: For file manipulation tasks
- **Agent Decision**: For making decisions based on criteria and constraints
- **Performance Optimization**: For analyzing and improving performance
- **Chain of Thought**: For step-by-step problem-solving with reasoning

### Creating Custom Templates

You can create custom templates as follows:

```python
from agents_system.utils.prompt_engine import PromptEngine
from agents_system.utils.prompt_templates import PromptTemplate

# Initialize the prompt engine
prompt_engine = PromptEngine()

# Register a custom template
prompt_engine.register_custom_template(
    name="my_custom_template",
    template_string="""
    # Custom Task
    
    ## Objective
    ${objective}
    
    ## Custom Parameters
    ${custom_params}
    """,
    variables=["objective", "custom_params"]
)

# Use the custom template
prompt = prompt_engine.generate_prompt(
    "my_custom_template",
    objective="Accomplish something amazing",
    custom_params="Specific details for the task"
)
```

### Analyzing Success Patterns

The system automatically records successful patterns when you use the `record_success` method:

```python
prompt_engine.record_success(
    template_name="code_generation",
    prompt=generated_prompt,
    result=execution_result,
    metadata={
        "task_id": task.id,
        "language": "Python",
        "framework": "FastAPI"
    }
)
```

These patterns are analyzed to identify common elements and can be exported to a master player file:

```python
prompt_engine.export_patterns_to_master_player("./data/master-player.mdc")
```

## Benefits of Template-Based Prompting

1. **Consistency**: All prompts follow a standardized structure
2. **Efficiency**: Reduces duplication and ensures all necessary information is included
3. **Optimization**: Enables analysis of successful patterns to improve over time
4. **Specialization**: Templates can be optimized for different task types
5. **Documentation**: Automatically creates documentation of successful approaches

## Extending the System

To create new templates or extend the system:

1. Add new templates to the `prompt_templates.py` file
2. Create specialized agents that use specific templates
3. Implement real LLM integration instead of the simulated execution
4. Add more sophisticated pattern analysis

See the `prompt_engine_example.py` file for a complete working example. 