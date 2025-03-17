# Absorption Dashboard

The Absorption Dashboard is a React component that provides a user interface for managing the component absorption process in the OSPAiN2 ecosystem.

## Features

- View all component absorptions with filtering by status
- Start new component absorptions
- Record adaptations made during the absorption process
- Log messages to track the absorption progress
- Complete absorptions as successful or failed
- View testing protocols for component evaluation

## Usage

```tsx
import { AbsorptionDashboard } from '../components/AbsorptionDashboard';

function App() {
  return (
    <div className="app">
      <AbsorptionDashboard className="my-custom-class" />
    </div>
  );
}
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `className` | `string` | Optional CSS class to apply to the dashboard container |

## Component Structure

The dashboard is divided into several sections:

1. **Tabs** - Filter absorptions by status (All, In Progress, Completed, Failed)
2. **Component List** - Shows all components being absorbed with their status
3. **New Absorption Form** - Form to start a new component absorption
4. **Selected Component Details** - Shows details of the selected component
5. **Adaptation Form** - For recording adaptations to the component (only shown for in-progress absorptions)
6. **Log Message Form** - For adding log messages to the absorption process
7. **Completion Actions** - Buttons to mark an absorption as completed or failed
8. **Testing Protocols** - Lists available testing protocols for component evaluation

## Dependencies

This component relies on the `useComponentAbsorption` hook which provides access to the component absorption system.

## Testing

Tests for this component can be found in the `__tests__` directory. Run them with:

```bash
npm test -- --testPathPattern=AbsorptionDashboard
``` 