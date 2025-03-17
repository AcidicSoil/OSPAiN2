# Component Absorption Tool

The Component Absorption Tool is a system for integrating external components into the OSPAiN2 ecosystem. It provides a structured approach to evaluating, adapting, and absorbing components from external repositories.

## Features

- **Component Evaluation**: Assess components against predefined metrics and criteria
- **Adaptation Tracking**: Record changes made to components during the absorption process
- **Testing Protocols**: Apply standardized testing procedures to ensure component quality
- **Absorption Logging**: Track the progress and status of component absorptions
- **CLI Interface**: Manage absorptions through a command-line interface
- **React Integration**: Use the absorption system in React applications with a custom hook

## Architecture

The Component Absorption Tool consists of several key parts:

1. **Types**: Defined in `src/types/absorption/index.ts`
2. **Core Implementation**: Located in `src/tools/absorption/componentAbsorber.ts`
3. **API**: Exposed through `src/tools/absorption/index.ts`
4. **React Hook**: Available in `src/hooks/useComponentAbsorption.ts`
5. **CLI**: Implemented in `src/cli/absorption-cli.ts`
6. **UI Dashboard**: Provided by `src/components/AbsorptionDashboard/AbsorptionDashboard.tsx`

## Usage

### Programmatic Usage

```typescript
import { 
  startComponentAbsorption, 
  absorbComponent,
  componentAbsorber
} from './tools/absorption';

// Start a component absorption
const componentId = startComponentAbsorption(
  'MyComponent',
  'https://github.com/example/repo',
  'src/components/my-component'
);

// Record an adaptation
componentAbsorber.recordAdaptation(
  componentId,
  'CODE_MODIFICATION',
  'Updated API implementation',
  'old code',
  'new code',
  'Improved performance'
);

// Log a message
componentAbsorber.logAbsorptionMessage(
  componentId,
  'Successfully modified component API'
);

// Complete the absorption
componentAbsorber.completeAbsorption(componentId);

// Or use the helper function for the entire process
await absorbComponent(
  'MyComponent',
  'https://github.com/example/repo',
  'src/components/my-component',
  [
    {
      type: 'CODE_MODIFICATION',
      description: 'Updated API implementation',
      beforeState: 'old code',
      afterState: 'new code',
      reason: 'Improved performance'
    }
  ]
);
```

### React Hook Usage

```tsx
import { useComponentAbsorption } from './hooks/useComponentAbsorption';

function MyComponent() {
  const {
    absorptions,
    absorptionsByStatus,
    testingProtocols,
    startAbsorption,
    recordAdaptation,
    logAbsorptionMessage,
    completeAbsorption
  } = useComponentAbsorption();

  // Use the hook methods to interact with the absorption system
  return (
    <div>
      <h1>Component Absorptions</h1>
      <ul>
        {absorptions.map(absorption => (
          <li key={absorption.componentId}>
            {absorption.componentName} - {AbsorptionStatus[absorption.status]}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### CLI Usage

```bash
# List all absorptions
node src/cli/absorption-cli.js list

# List absorptions with a specific status
node src/cli/absorption-cli.js list --status IN_PROGRESS

# Start a new absorption
node src/cli/absorption-cli.js start --name "MyComponent" --source "https://github.com/example/repo" --target "src/components/my-component"

# Record an adaptation
node src/cli/absorption-cli.js adapt --id "component-id" --type "CODE_MODIFICATION" --description "Updated API" --before "old code" --after "new code" --reason "Improved performance"

# Log a message
node src/cli/absorption-cli.js log --id "component-id" --message "Successfully modified component API"

# Complete an absorption
node src/cli/absorption-cli.js complete --id "component-id"

# Mark an absorption as failed
node src/cli/absorption-cli.js complete --id "component-id" --failed --error "Failed to integrate with existing system"

# Show details of an absorption
node src/cli/absorption-cli.js show --id "component-id" --logs --adaptations

# Export absorption data
node src/cli/absorption-cli.js export --file "absorptions.json" --summary
```

## Dashboard UI

The Absorption Dashboard provides a user interface for managing component absorptions. It includes:

- A list of all absorptions with filtering by status
- A form for starting new absorptions
- Detailed view of selected absorptions
- Forms for recording adaptations and logging messages
- Actions for completing absorptions
- Display of testing protocols

## Testing Protocols

The system includes predefined testing protocols:

1. **Render Performance Protocol**: Tests rendering performance under various conditions
2. **Accessibility Testing Protocol**: Tests accessibility compliance

You can define additional protocols as needed.

## Component Evaluation

Components are evaluated based on various metrics:

- **Performance Metrics**: Render time, memory usage, etc.
- **Quality Metrics**: Code quality, test coverage, etc.
- **Integration Metrics**: Compatibility, dependency conflicts, etc.
- **User Experience Metrics**: Accessibility, usability, etc.
- **Maintenance Metrics**: Documentation, maintainability, etc.

## Adaptation Types

The system tracks different types of adaptations:

- `CODE_MODIFICATION`: Changes to the component's code
- `DEPENDENCY_CHANGE`: Changes to dependencies
- `API_ADAPTATION`: Changes to the component's API
- `STYLE_ADJUSTMENT`: Changes to styling
- `PERFORMANCE_OPTIMIZATION`: Optimizations for performance
- `ACCESSIBILITY_IMPROVEMENT`: Improvements for accessibility
- `OTHER`: Other types of adaptations

## Contributing

To contribute to the Component Absorption Tool:

1. Add new testing protocols in `src/tools/absorption/componentAbsorber.ts`
2. Enhance the CLI in `src/cli/absorption-cli.ts`
3. Improve the UI dashboard in `src/components/AbsorptionDashboard/AbsorptionDashboard.tsx`
4. Add new metrics or evaluation criteria in `src/types/absorption/index.ts`
