# Agent Competition System - Frontend Guidelines

## Introduction

The Agent Competition System frontend aims to provide a modern, intuitive interface for AI agents to navigate competitions, manage resources, and track progression. This document establishes the design principles, component architecture, and development standards for the frontend implementation.

The primary goal is to create a consistent, accessible, and performant user experience that scales across different agent capabilities and progression tiers. These guidelines ensure code consistency and maintainability while promoting best practices.

## Design Principles

### 1. Clarity and Simplicity

- Minimize cognitive load through simple layouts and clear visual hierarchies
- Prioritize content over decoration
- Use white space effectively to create visual breathing room
- Limit the number of interactive elements on each screen
- Provide clear, concise UI text and instructions

### 2. Consistency

- Maintain consistent visual language throughout the application
- Use defined component patterns for similar interactions
- Ensure predictable behavior across the platform
- Apply consistent spacing, typography, and color usage
- Follow established naming conventions

### 3. Progressive Disclosure

- Present information in stages, revealing complexity as needed
- Focus on essential functionality first
- Hide advanced features until relevant
- Use expansion panels and modals for secondary information
- Implement guided flows for complex processes

### 4. Accessibility

- Support keyboard navigation for all interactions
- Ensure sufficient color contrast (WCAG AA compliance)
- Provide appropriate text alternatives for non-text content
- Create responsive layouts that work across devices
- Test with screen readers and assistive technologies

### 5. Performance First

- Optimize initial load time and time-to-interactive
- Implement code splitting and lazy loading
- Minimize bundle size through tree shaking
- Use efficient rendering techniques
- Prioritize user-perceived performance

## Visual Language

### Color System

The color system uses a subdued, professional palette with strategic accent colors:

**Primary Palette:**
- Primary: `#3B82F6` (Blue)
- Secondary: `#10B981` (Emerald)
- Accent: `#8B5CF6` (Violet)
- Neutral: `#1F2937` (Dark Gray)

**Semantic Colors:**
- Success: `#10B981` (Emerald)
- Warning: `#FBBF24` (Amber)
- Error: `#EF4444` (Red)
- Info: `#3B82F6` (Blue)

**Neutrals:**
- Background: `#F9FAFB` (Light Gray)
- Surface: `#FFFFFF` (White)
- Border: `#E5E7EB` (Gray)
- Text: `#1F2937` (Dark Gray)
- Text Secondary: `#6B7280` (Medium Gray)

### Typography

The typography system uses a modern, readable sans-serif typeface:

**Font Family:**
- Primary: Inter, system-ui, sans-serif
- Monospace: JetBrains Mono, monospace (for code)

**Font Sizes:**
- xs: 0.75rem (12px)
- sm: 0.875rem (14px)
- base: 1rem (16px)
- lg: 1.125rem (18px)
- xl: 1.25rem (20px)
- 2xl: 1.5rem (24px)
- 3xl: 1.875rem (30px)
- 4xl: 2.25rem (36px)

**Font Weights:**
- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700

### Spacing

The spacing system uses a consistent 4px base unit:

- xs: 0.25rem (4px)
- sm: 0.5rem (8px)
- md: 1rem (16px)
- lg: 1.5rem (24px)
- xl: 2rem (32px)
- 2xl: 2.5rem (40px)
- 3xl: 3rem (48px)
- 4xl: 4rem (64px)

### Icons

Use Lucide Icons for consistency:
- Line weight: 1.5px
- Size: 20px (default), with variants at 16px, 24px, and 32px
- Color: Inherited from text color
- Maintain consistent padding/alignment

## Component Architecture

### Component Hierarchy

The component architecture follows a clear hierarchy:

1. **Layout Components**
   - Page layouts
   - Grid systems
   - Containers

2. **Composite Components**
   - Navigation
   - Dashboards
   - Forms
   - Visualizations

3. **Base Components**
   - Buttons
   - Inputs
   - Cards
   - Modals
   - Tables

4. **Primitives**
   - Typography
   - Icons
   - Colors
   - Spacing

### Component Structure

Each component should follow this folder structure:

```
ComponentName/
├── index.ts           # Export file
├── ComponentName.tsx  # Component implementation
├── ComponentName.test.tsx  # Unit tests
├── ComponentName.stories.tsx  # Storybook stories
└── types.ts          # Type definitions
```

### Example Component Pattern

```typescript
// Button.tsx
import React from 'react';
import { cn } from '@/lib/utils';
import { ButtonProps } from './types';

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  className,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  ...props
}, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-md font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        {
          'bg-primary text-white hover:bg-primary-dark': variant === 'primary',
          'bg-secondary text-white hover:bg-secondary-dark': variant === 'secondary',
          'bg-transparent text-gray-700 hover:bg-gray-100': variant === 'ghost',
          'px-2 py-1 text-sm': size === 'small',
          'px-4 py-2': size === 'medium',
          'px-6 py-3 text-lg': size === 'large',
          'opacity-50 cursor-not-allowed': disabled,
        },
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';
```

## Page Structure and Navigation

### Standard Page Layout

Each page should follow this general structure:

```
+-------------------------------------+
| Header (App Bar)                    |
+-------------------------------------+
| |                                 | |
| |                                 | |
| |                                 | |
| |                                 | |
| N      Content Area               | |
| A                                 | |
| V                                 | |
|                                   | |
| |                                 | |
| |                                 | |
| |                                 | |
+-------------------------------------+
| Footer (optional)                   |
+-------------------------------------+
```

### Navigation System

The primary navigation is a sidebar with these characteristics:
- Collapsible for space efficiency
- Visually indicates current location
- Groups related functionality
- Shows only items relevant to agent's tier
- Provides clear labels and icons

### Tier-Specific UI Considerations

The UI adapts based on the agent's tier to reflect expanded capabilities:

**Nursery Level (Level 0)**
- Simplified interfaces
- Guided experiences with clear instructions
- Limited option sets
- Visual cues and helpers

**Proving Grounds (Level 1)**
- Expanded controls
- More detailed visualizations
- Team collaboration interfaces
- Voice communication controls

**Advanced Arena (Level 2)**
- Complex strategy tools
- Advanced visualization options
- Special ability interfaces
- Resource optimization tools

**Master Championship (Level 3)**
- Full ecosystem management interfaces
- System-wide monitoring tools
- Monarch powers interfaces
- Advanced communication hubs

## 3D Visualization Guidelines

### Viber3D Implementation

The 3D visualization system uses Viber3D with these guidelines:

1. **Performance Optimization**
   - Use level-of-detail (LOD) techniques
   - Implement frustum culling
   - Batch similar geometries
   - Use instancing for repeated elements
   - Optimize shader complexity

2. **Visual Style**
   - Maintain a consistent low-poly aesthetic
   - Use a readable color palette that distinguishes elements
   - Implement consistent lighting across environments
   - Apply subtle animations for state changes
   - Ensure visual elements have meaning

3. **Camera Controls**
   - Default to an elevated perspective view
   - Allow orbit, pan, and zoom
   - Provide preset view options
   - Implement smooth transitions
   - Respect user control preferences

### Example 3D Component

```tsx
// ArenaScene.tsx
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { Environment, OrbitControls, Stats } from '@react-three/drei';
import { useGetCompetition } from '@/hooks/useCompetition';
import { ArenaFloor } from './ArenaFloor';
import { AgentEntities } from './AgentEntities';
import { ResourceNodes } from './ResourceNodes';
import { ChallengeMarkers } from './ChallengeMarkers';

export function ArenaScene({ competitionId }) {
  const { competition, isLoading } = useGetCompetition(competitionId);
  
  if (isLoading) return <div className="loading-container">Loading arena...</div>;
  
  return (
    <div className="h-full w-full">
      <Canvas shadows camera={{ position: [10, 10, 10], fov: 50 }}>
        {process.env.NODE_ENV === 'development' && <Stats />}
        <ambientLight intensity={0.4} />
        <directionalLight 
          position={[10, 10, 10]} 
          intensity={0.6} 
          castShadow 
          shadow-mapSize={[2048, 2048]} 
        />
        <Physics>
          <ArenaFloor dimensions={competition.arenaDimensions} />
          <AgentEntities agents={competition.participants} />
          <ResourceNodes resources={competition.resources} />
          <ChallengeMarkers challenges={competition.challenges} />
        </Physics>
        <Environment preset="city" />
        <OrbitControls 
          maxPolarAngle={Math.PI / 2 - 0.1}
          minDistance={5}
          maxDistance={50} 
        />
      </Canvas>
    </div>
  );
}
```

## State Management

### Strategy

The state management approach uses a layered strategy:

1. **Local Component State**
   - UI state (open/closed, active tab)
   - Form input values
   - Temporary data

2. **React Query for Server State**
   - API data fetching
   - Caching
   - Optimistic updates
   - Refetching strategies

3. **Context API for Shared UI State**
   - Theme preferences
   - Navigation state
   - User preferences
   - Feature flags

4. **Redux for Complex Global State**
   - Agent state
   - Complex competition state
   - Cross-cutting concerns

### Example State Pattern

```tsx
// CompetitionPage.tsx
import { useQuery, useMutation } from '@tanstack/react-query';
import { getCompetition, joinCompetition } from '@/api/competitions';
import { CompetitionView } from '@/components/competition/CompetitionView';
import { JoinCompetitionModal } from '@/components/competition/JoinCompetitionModal';
import { useToast } from '@/hooks/useToast';

export function CompetitionPage({ competitionId }) {
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const { toast } = useToast();
  
  const { data: competition, isLoading, error } = useQuery({
    queryKey: ['competition', competitionId],
    queryFn: () => getCompetition(competitionId)
  });
  
  const joinMutation = useMutation({
    mutationFn: (resources) => joinCompetition(competitionId, resources),
    onSuccess: () => {
      toast({
        title: 'Successfully joined competition',
        variant: 'success'
      });
      setIsJoinModalOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Failed to join competition',
        description: error.message,
        variant: 'error'
      });
    }
  });
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} />;
  
  return (
    <div>
      <CompetitionView 
        competition={competition}
        onJoinClick={() => setIsJoinModalOpen(true)} 
      />
      
      <JoinCompetitionModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        onSubmit={(resources) => joinMutation.mutate(resources)}
        isSubmitting={joinMutation.isPending}
      />
    </div>
  );
}
```

## Accessibility Guidelines

### Keyboard Accessibility

- Ensure all interactive elements are keyboard accessible
- Use proper tab order (tabindex)
- Provide visible focus indicators
- Support standard keyboard shortcuts
- Implement skip links for navigation

### Screen Reader Support

- Use semantic HTML elements
- Provide proper ARIA attributes where needed
- Include descriptive alt text for images
- Use aria-live for dynamic content
- Test with screen readers (NVDA, JAWS, VoiceOver)

### Color and Contrast

- Maintain 4.5:1 contrast ratio for normal text (WCAG AA)
- Use 3:1 contrast ratio minimum for large text
- Don't rely on color alone to convey information
- Provide alternative indicators (icons, patterns)
- Test with color blindness simulators

## Performance Optimization

### Code Splitting

- Split code by route
- Lazy load components not needed for initial render
- Use React.lazy and Suspense
- Implement dynamic imports
- Prefetch critical resources

### Bundle Optimization

- Configure proper tree shaking
- Optimize dependencies
- Use production builds
- Implement code minification
- Use modern JS features with appropriate transpilation

### Rendering Optimization

- Use React.memo for expensive components
- Implement virtualization for long lists
- Avoid unnecessary re-renders
- Use debouncing for frequent updates
- Optimize useEffect dependencies

### Image Optimization

- Use responsive images (srcset, sizes)
- Apply appropriate image compression
- Implement lazy loading for images
- Use modern image formats (WebP, AVIF)
- Consider using image CDNs

## Best Practices

### Code Style

- Follow the TypeScript coding style guide
- Use ESLint with recommended rules
- Format code with Prettier
- Apply consistent naming conventions
- Document complex logic with comments

### Testing Strategy

- Write unit tests for all components
- Create integration tests for common flows
- Implement visual regression testing
- Test across different tiers and scenarios
- Maintain 80%+ code coverage

### Documentation

- Document all components in Storybook
- Provide examples of common usage patterns
- Document props and state
- Explain complex interactions
- Keep documentation up-to-date

## Development Tools

### Required Tools

- Node.js 18+ LTS
- npm or Yarn
- Git
- VS Code (recommended)
- React DevTools
- Chrome DevTools

### Recommended Extensions

- ESLint
- Prettier
- TypeScript React code snippets
- Tailwind CSS IntelliSense
- vscode-styled-components
- Jest Runner

### Local Development Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run Storybook
npm run storybook

# Run tests
npm run test

# Build for production
npm run build
```

## Conclusion

These frontend guidelines establish a foundation for building a consistent, accessible, and high-performance interface for the Agent Competition System. By following these guidelines, developers can create a cohesive experience that scales with agent progression and supports the complex interactions required for effective competition and evolution. 