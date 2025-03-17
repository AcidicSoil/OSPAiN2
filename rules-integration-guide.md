# Rule Integration Guide: Using '@' Tags

This guide explains how to use '@' tags to connect rules within the Ollama Ecosystem project.

## Purpose

The '@' tag system provides a structured way to:

1. Create clear references between related rules
2. Provide context about why rules are relevant
3. Build a knowledge graph of interconnected rules
4. Make rules more discoverable in context

## '@' Tag Syntax

The basic syntax for tagging is:

```
@rule-name(context explanation)
```

Where:
- `rule-name` is the name of the rule file without the `.mdc` extension
- `context explanation` is a brief description of why this rule is relevant in the current context

## Implementation Options

### Option 1: Manual Tagging

Add '@' tags directly to your files:

1. At the top of a rule file after the frontmatter
2. Within documentation when discussing related rules
3. In code comments when implementing rule-related functionality

### Option 2: Automated Tagging (Recommended)

Use the provided `rule-tagger.js` script to automatically analyze and tag rules:

```bash
node rule-tagger.js
```

This will:
1. Scan all rule files in `.cursor/rules`
2. Analyze content for relationships between rules
3. Add appropriate '@' tags to each rule
4. Create example files in `.cursor/examples`

## Usage Patterns

### Standard Reference Format

When referencing a single rule:

```
@tool-call-optimization(Ensures efficient use of tool calls within limits)
```

### Multiple Related Rules

When multiple rules are related:

```
@knowledge-graph-search-cache(Efficient data caching) and @web-search-optimization(Query formatting) work together for optimal search performance.
```

### Contextual Grouping

When organizing rules by purpose:

```
## Core Framework
@master-prd(Development mode framework)
@sovereign-ai-ecosystem-prd(Ecosystem architecture)

## Implementation Details
@tool-call-optimization(Tool call management)
@tool-call-error-handler(Error handling)
```

## Best Practices

1. **Be Specific**: Explain why the rule is relevant in this specific context
2. **Keep It Brief**: Aim for concise descriptions (under 100 characters)
3. **Add Context**: Don't just name the rule, explain its relevance
4. **Group Logically**: Organize related rule references together
5. **Update References**: When rule content changes significantly, update references

## Examples

See the practical examples in the `.cursor/examples` directory:
- `ExampleA.example` - Basic usage example
- `TaggedRuleExample.mdc` - Example of a tagged rule file
- `basic-example.md` - Simple reference examples
- `advanced-example.md` - Complex integration scenarios
- `template-example.md` - Template for new files

## Integration with Existing Workflows

### In Development Modes

- **Design Mode**: Tag rules relevant to UI/UX principles
- **Engineering Mode**: Tag implementation-related rules
- **Testing Mode**: Tag rules for quality assurance
- **Deployment Mode**: Tag rules for release management
- **Maintenance Mode**: Tag rules for ongoing support

### In Documentation

Include rule references in documentation with context about why they're relevant:

```markdown
When implementing error handling, follow @tool-call-error-handler(Error handling near limits) 
and @master-prd(Mode-specific error handling guidelines).
```

### In Code Comments

Reference rules in code comments for implementation guidance:

```typescript
// Following @tool-call-optimization(Batching strategy)
async function batchRequests(items) {
  // Implementation here
}
```

## Next Steps

1. Run the rule tagger script to analyze and tag all rules
2. Review the tagged rules for accuracy
3. Use the example files as templates for your own use cases
4. Integrate rule tagging into your development workflow
5. Update the rule tags when rule content changes significantly

## Support

If you encounter issues with rule tagging or have suggestions for improvement, please add them to the master todo list with the tag "rule-tagging". 