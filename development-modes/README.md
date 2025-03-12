# Development Modes Framework

This directory contains the operational mode files for our Project Development Framework. Each file represents a distinct development mode with specific objectives, activities, deliverables, and transition criteria.

## Product Requirements Document

For a complete understanding of the Development Modes Framework, please refer to the [master-prd.mdc](./master-prd.mdc) document, which provides the comprehensive Product Requirements Document that establishes the context, purpose, and implementation guidelines for this framework.

## Purpose

These mode files serve as structured templates to:

1. Provide clear guidelines for different phases of the development process
2. Standardize workflows and expectations
3. Ensure quality control across all development activities
4. Facilitate smoother transitions between development phases
5. Serve as documentation for project contributors

## Available Modes

- [🎨 Design Mode](./design) - Focus on UI/UX structuring, component architecture, visual design
- [🔧 Engineering Mode](./engineering) - Focus on core functionality, business logic, data flow
- [🧪 Testing Mode](./testing) - Focus on quality assurance, edge cases, resilience
- [📦 Deployment Mode](./deployment) - Focus on release readiness, CI/CD, documentation
- [🔍 Maintenance Mode](./maintenance) - Focus on ongoing health, improvements, community support

## How to Use

1. **Determine Current Mode**: Based on the current project phase and needs, identify the appropriate mode for your work.

2. **Reference Template**: Open the corresponding mode file to understand the scope, objectives, and deliverables.

3. **Add Project-Specific Notes**: Each mode file has a Notes section where you can add project-specific considerations.

4. **Track Progress**: Use the Activities and Deliverables sections to track progress and ensure completeness.

5. **Follow Transition Criteria**: Before moving to another mode, ensure that the transition criteria for the current mode are met.

6. **Document Mode Switches**: When switching modes, document the transition in project documentation.

## Mode Switcher CLI

The framework includes command-line tools for managing development modes:

- `mode_switcher.sh` for Bash/Git Bash environments
- `mode_switcher.ps1` for PowerShell environments

### Available Commands

- **current**: Show the current development mode

  ```
  ./mode_switcher.sh current
  ```

- **list**: List all available development modes

  ```
  ./mode_switcher.sh list
  ```

- **switch**: Switch to a different development mode with reason

  ```
  ./mode_switcher.sh switch design "Starting UI design for new feature"
  ```

- **history**: Show mode transition history

  ```
  ./mode_switcher.sh history
  ```

- **notes**: Edit mode-specific notes for the current or specified mode
  ```
  ./mode_switcher.sh notes engineering
  ```

### Mode Context for Chat Sessions

The framework now includes tools to display the current development mode context in chat sessions:

- `mode-context.sh` for Bash/Git Bash environments
- `mode-context.ps1` for PowerShell environments

These scripts provide context about the current mode, including focus areas, relevant files, and suggested tools. This helps maintain consistent context across chat sessions, especially when working with AI assistants.

#### Available Commands

- **Full Context**: Display comprehensive mode information

  ```
  ./mode-context.sh
  ```

- **Short Context**: Display a brief context header

  ```
  ./mode-context.sh --short
  ```

- **Copy to Clipboard**: Copy context for pasting into chat sessions

  ```
  ./mode-context.sh --copy
  ```

- **Combined Options**: Use multiple options together

  ```
  ./mode-context.sh --short --copy
  ```

#### Example Output

```
## 🔧 Current Mode: Engineering

**Focus**: Core functionality, business logic, data flow implementation

### Key Activities
- Implementing core business logic
- Building data processing pipelines
- Optimizing performance bottlenecks
- Structuring code architecture

### Relevant Files
- `src/**/*.ts`
- `lib/*.js`
- `utils/*.js`
- `services/*.ts`

### Suggested Tools
- TypeScript
- Node.js
- SQL/NoSQL databases
- API frameworks

### Recent Mode Transitions
- 2025-03-10 18:41:52: Changed from No active mode to engineering (Starting integration with E2B Desktop)

---
*Append this context to your prompts for mode-specific assistance*
```

#### HTML Template

An HTML template (`chat-mode-context.html`) is also provided for integrating mode context into web-based chat interfaces with proper styling.

### Mode-Specific Notes

Each development mode has its own dedicated notes file stored in the `notes/` directory. These notes follow a standard template with sections for:

- Overview
- Current Tasks
- Important Decisions
- Resources

The notes command automatically opens these files in your default editor, making it easy to document your work within each mode.

## Integration with Workflow

These mode files should be integrated with your workflow tools and processes:

- Reference the appropriate mode in commit messages and pull requests
- Include mode information in task tracking systems
- Use mode transitions as milestones in project planning
- Conduct mode transition reviews with the team
- Update project documentation to reflect the current mode

### Git Integration

You can install the included Git hook to automatically prepend mode information to your commit messages:

```bash
# Copy the hook to your Git hooks directory
cp git-hooks/prepare-commit-msg ../.git/hooks/
chmod +x ../.git/hooks/prepare-commit-msg
```

This will add mode prefixes like `[🎨 design]` to your commit messages automatically.

## Customization

Feel free to customize these mode files to better align with your project's specific needs and workflows. However, maintain the core structure to ensure consistency across different projects.

## Acknowledgments

This framework is based on the Project Development Framework outlined in our Product Requirements Document, designed to enhance productivity, improve quality control, and foster collaboration among team members and contributors.

## Mode Synchronization

All components in the OSPAiN2 project are now synchronized through the Mode Synchronization System, ensuring consistent mode display and behavior across:

- Terminal sessions (PowerShell and Bash)
- Cursor IDE chat windows
- MCP servers and tools
- Status bar displays

### How Synchronization Works

1. The current mode is stored in `.current_mode` file
2. When a mode change occurs (via `mode-switch.sh` or `mode-switch.ps1`), the file is updated
3. The `mode-sync-service.ts` monitors this file for changes and propagates updates
4. All components listen for these updates and adjust their display/behavior accordingly

### TypeScript Implementation

The synchronization system is implemented in TypeScript, providing type safety and better integration with the codebase:

- `mcp-servers/utils/mode-aware.ts`: The core mode awareness utility
  - Detects current mode from multiple sources
  - Emits mode change events when changes occur
  - Provides mode-specific optimizations for different services
  - Auto-configures based on the current development mode

The TypeScript implementation allows for:

- Strong type checking for mode-related operations
- Event-based architecture for real-time updates
- Consistent behavior across all components
- Extension points for service-specific optimizations

### Integration with Cursor IDE

Mode information is integrated with Cursor IDE through:

1. `.cursor/mcp.json` configuration
2. `.cursor/cursor-mode-sync.js` implementation
3. MCP protocol for real-time updates

This allows Cursor to be aware of the current mode, adjust its behavior accordingly, and expose mode-related functionality through its tools.

### Troubleshooting

If mode displays are out of sync:

1. Check the `.current_mode` file contains a valid mode name
2. Verify the mode synchronization service is running (`node development-modes/mode-sync-service.js`)
3. Try manually triggering a mode switch with `mode-switch.sh` or `mode-switch.ps1`
4. Check for any error messages in the console output

### Custom Integration

For custom tools that need to be mode-aware:

1. Import the `ModeAwareService` from `mcp-servers/utils/mode-aware`
2. Create an instance: `const modeService = new ModeAwareService('my-service-name')`
3. Listen for mode changes: `modeService.on('modeChanged', handleModeChange)`
4. Access current mode: `const currentMode = modeService.getCurrentMode()`
5. Apply mode-specific optimizations: `const optimizations = modeService.getOptimizationsForService('my-service-name')`

## Contributing

When extending the Development Modes Framework, please:

1. Update all synchronization components when adding new modes
2. Test synchronization across all components before committing
3. Document any new features or changes in this README
