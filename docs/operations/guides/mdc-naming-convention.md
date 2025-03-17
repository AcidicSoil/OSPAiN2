# MDC Naming Convention

## The `@` Prefix in MDC Files

In our project, we use the `@` prefix to denote special MDC (Markdown Cursor) files that serve as system-level configuration, documentation, or governance documents. 

### Purpose of the `@` Prefix

The `@` prefix serves multiple purposes:

1. **Visual Distinction**: Makes these files immediately recognizable in directory listings
2. **Semantic Meaning**: Indicates files with special project-level significance
3. **Organization**: Groups essential system files together in alphabetical listings
4. **Context Awareness**: Helps the AI understand which files contain authoritative project information

### System Files with `@` Prefix

The following MDC files use the `@` prefix:

| File | Purpose |
|------|---------|
| `@horizon-map.mdc` | Maps current project horizons (H1/H2/H3) |
| `@master-todo.mdc` | Central task tracking and organization |
| `@parking-lot.mdc` | Storage for future ideas and concepts |
| `@microManager.mdc` | Development mode supervision agent configuration |
| `@master-dev-schedule.mdc` | Weekly development schedule framework |
| `@master-player.mdc` | Command patterns and execution strategies |
| `@development-mode-workflow.mdc` | Development mode transition workflows |

### When to Use the `@` Prefix

The `@` prefix should be applied to files that:

1. Have project-wide significance
2. Define governance frameworks or processes
3. Track global project state
4. Configure system-level behavior
5. Serve as authoritative documentation sources

### Benefits of This Convention

- **Improved Organization**: System files are grouped together
- **Enhanced Context**: The AI can more easily identify authoritative sources
- **Clear Hierarchies**: Establishes a visual hierarchy in the project files
- **Easier Reference**: Makes these files easier to reference in commands and documentation
- **Visual Distinction**: Immediately identifies special files in directory listings

### Implementation Notes

This naming convention was implemented on March 15, 2024 to enhance project organization and make system files more readily identifiable.

### References

- [Horizon Management Framework](../@horizon-map.mdc)
- [Project Task Tracking](../@master-todo.mdc)
- [Development Mode Framework](../@microManager.mdc) 