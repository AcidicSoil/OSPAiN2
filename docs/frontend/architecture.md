# OSPAiN2-Hub Frontend Architecture

## Overview

The OSPAiN2-Hub frontend is built using a modern tech stack:

- **Vite**: For fast development and optimized production builds
- **React**: Component-based UI library
- **TypeScript**: Static type checking
- **Tailwind CSS**: Utility-first CSS framework
- **Zustand**: State management
- **React Router**: Client-side routing
- **Vitest/React Testing Library**: Testing framework

This architecture document outlines the structure, patterns, and guidelines for the OSPAiN2-Hub frontend rebuild.

## Directory Structure

```
OSPAiN2-hub-new/
├── public/                 # Static assets
├── src/
│   ├── assets/             # Images, fonts, etc.
│   ├── components/         # Reusable components
│   │   ├── common/         # Generic UI components
│   │   ├── layout/         # Layout components
│   │   ├── visualization/  # Data visualization components
│   │   └── t2p/            # T2P-specific components
│   ├── hooks/              # Custom React hooks
│   ├── pages/              # Route components
│   ├── services/           # API and service functions
│   │   ├── api/            # API interaction
│   │   ├── t2p/            # T2P Engine service
│   │   └── agent/          # Agent Competition services
│   ├── store/              # Zustand state management
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   ├── App.tsx             # Main application component
│   ├── main.tsx            # Entry point
│   └── router.tsx          # Route definitions
├── tests/                  # Test files
├── .eslintrc.js            # ESLint configuration
├── .prettierrc             # Prettier configuration
├── index.html              # HTML template
├── package.json            # Project dependencies
├── tailwind.config.js      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite configuration
```

## Core Concepts

### Component Architecture

We follow a component-based architecture with these categories:

1. **Page Components**: Top-level components for each route
2. **Layout Components**: Define page structure (Header, Sidebar, etc.)
3. **Common Components**: Reusable UI elements (Button, Card, etc.)
4. **Feature Components**: Specific functionality components
5. **Visualization Components**: Charts, graphs, and data visualizations

All components should be:
- Single responsibility
- Well-typed with TypeScript
- Self-contained with their own styles
- Unit tested
- Properly documented

### State Management

Zustand is used for state management with the following stores:

1. **User Store**: Authentication and user preferences
2. **T2P Store**: T2P Engine state and interactions
3. **Agent Store**: Agent Competition System state
4. **UI Store**: UI-related state (theme, sidebar state, etc.)

Benefits of Zustand:
- Minimal boilerplate
- Simple API
- TypeScript integration
- DevTools support
- No providers needed

### API Integration

We use a service-based approach for API interactions:

1. Services are organized by domain (T2P, Agent, etc.)
2. Each service exposes methods for API interaction
3. Custom hooks abstract service usage for components
4. TypeScript ensures type safety for requests and responses

### Routing

React Router is used for client-side routing with:

1. Route configuration in a central router.tsx file
2. Nested routes for complex layouts
3. Route-based code splitting
4. Route guards for protected routes

## Key Features

### T2P Engine Integration

The T2P Engine integration includes:

1. Command input and suggestion components
2. Command execution tracking
3. Real-time feedback
4. Command history and favorites
5. Context-aware suggestions

Components:
- CommandInput
- SuggestionPanel
- CommandHistory
- ExecutionTracker

### Agent Competition System

The Agent Competition System interface includes:

1. Agent creation and configuration
2. Competition setup and management
3. Results visualization
4. Performance analytics

Components:
- AgentCreator
- CompetitionManager
- ResultsVisualization
- PerformanceAnalytics

### Dashboard

The dashboard provides an overview of:

1. System status
2. Recent activities
3. Quick actions
4. Performance metrics
5. Notifications

Components:
- SystemStatus
- ActivityFeed
- QuickActions
- MetricsPanel
- NotificationCenter

## Style Guide

### Component Structure

```typescript
// ComponentName.tsx
import { useState } from 'react';
import './ComponentName.css'; // If using CSS modules

interface ComponentNameProps {
  prop1: string;
  prop2?: number;
}

export const ComponentName: React.FC<ComponentNameProps> = ({ 
  prop1, 
  prop2 = defaultValue 
}) => {
  // State hooks
  const [state, setState] = useState<string>('');
  
  // Event handlers
  const handleEvent = () => {
    // Logic
  };
  
  // Render helpers
  const renderItem = (item: Item) => (
    <div key={item.id}>{item.name}</div>
  );
  
  return (
    <div className="component-name">
      {/* Component JSX */}
    </div>
  );
};

// Optional: Default export
export default ComponentName;
```

### Code Style

- Use functional components with hooks
- Destructure props in component parameters
- Use TypeScript interfaces for props
- Provide default values for optional props
- Follow kebab-case for CSS classes
- Use PascalCase for component names
- Use camelCase for variables and functions

### CSS Strategy

We use Tailwind CSS with the following guidelines:

1. Use Tailwind utility classes for most styling
2. Extract common patterns into custom components
3. Use @apply for complex, repeated styles
4. Use CSS variables for theme values
5. Use responsive prefixes for breakpoints

## Performance Considerations

1. **Code Splitting**: Use dynamic imports for route-based code splitting
2. **Memoization**: Use React.memo, useMemo, and useCallback for expensive operations
3. **Virtualization**: Use react-window or react-virtualized for long lists
4. **Asset Optimization**: Optimize images and use appropriate formats
5. **Bundle Analysis**: Regularly analyze bundle size
6. **Tree Shaking**: Ensure imports allow for proper tree shaking

## Testing Strategy

We use Vitest and React Testing Library with the following approach:

1. **Unit Tests**: For individual components and utilities
2. **Integration Tests**: For component interactions
3. **E2E Tests**: For critical user flows

Test structure:
- Use describe/it for test organization
- Mock external dependencies
- Test both success and error cases
- Focus on user behavior, not implementation details

## Accessibility

1. Use semantic HTML elements
2. Include ARIA attributes where appropriate
3. Ensure keyboard navigation works
4. Maintain proper contrast ratios
5. Support screen readers
6. Test with accessibility tools

## Development Workflow

1. Create component with TypeScript interfaces
2. Implement component functionality
3. Add Tailwind CSS styling
4. Write tests
5. Document component props and usage
6. Review and refactor

## Documentation

Each component should include:

1. TypeScript props interface with JSDoc comments
2. Example usage
3. Notes on behavior or limitations
4. Link to related components

## Deployment Strategy

1. Build with Vite's production mode
2. Use environment variables for configuration
3. Implement CI/CD pipeline
4. Configure caching and CDN
5. Set up monitoring and error tracking

## Future Considerations

1. Server-side rendering for improved SEO and performance
2. Progressive Web App (PWA) capabilities
3. Internationalization (i18n) support
4. Advanced animations and transitions
5. Mobile-specific optimizations 