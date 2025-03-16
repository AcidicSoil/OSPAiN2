# OSPAiN2-Hub Frontend

The OSPAiN2-Hub frontend is a modern web application for interacting with the OSPAiN2 ecosystem. It provides interfaces for the T2P Engine, Agent Competition System, and task management.

## Features

- **Dashboard**: Overview of system status and recent activities
- **T2P Engine Interface**: Command input, suggestions, and execution tracking
- **Agent Competition System**: Agent management and competition visualization
- **Task Management**: Create, monitor, and manage tasks
- **Settings**: Configure system preferences and appearance

## Technology Stack

- **Vite**: Fast build tool and development server
- **React**: UI component library
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Zustand**: State management
- **React Router**: Client-side routing
- **React Query**: Data fetching and caching
- **Vitest/React Testing Library**: Testing framework

## Getting Started

### Prerequisites

- Node.js (v18.0.0 or higher)
- npm (v8.0.0 or higher) or yarn (v1.22.0 or higher)
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/OSPAiN2.git
   cd OSPAiN2/OSPAiN2-hub-new
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open your browser to `http://localhost:3000`

## Project Structure

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
└── ... configuration files
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run tests
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Generate test coverage report
- `npm run lint` - Lint code
- `npm run lint:fix` - Fix linting issues
- `npm run format` - Format code with Prettier
- `npm run typecheck` - Check TypeScript types

## Architecture

The frontend follows a component-based architecture with a focus on:

- **Reusable Components**: Building blocks for the UI
- **Custom Hooks**: Encapsulate complex logic and state
- **Service Layer**: Handle API communication
- **State Management**: Zustand stores for global state

For a detailed architecture overview, see [docs/frontend/architecture.md](../docs/frontend/architecture.md).

## Development Guidelines

- Use functional components with hooks
- Write TypeScript interfaces for all props
- Follow the project's ESLint and Prettier configuration
- Write tests for all components and logic
- Use Tailwind utility classes for styling
- Follow semantic HTML practices
- Ensure responsive design for all screens

## Code Quality Tools

The project uses several tools to maintain code quality:

### ESLint

ESLint is configured with rules for TypeScript, React, React Hooks, JSX accessibility, and import organization. To run ESLint:

```bash
# Check for issues
npm run lint

# Fix automatically fixable issues
npm run lint:fix
```

### Prettier

Prettier is used for consistent code formatting. To format your code:

```bash
npm run format
```

### TypeScript

TypeScript provides static type checking. To check types:

```bash
npm run typecheck
```

### Git Hooks with Husky and lint-staged

The project uses Husky to run lint-staged before commits, which automatically lints and formats staged files.

### VS Code Configuration

If you're using VS Code, the project includes settings for:
- Automatic formatting on save with Prettier
- ESLint error highlighting
- TypeScript type checking

Install the following extensions for the best experience:
- ESLint
- Prettier
- Tailwind CSS IntelliSense

## Integration Points

The frontend integrates with:

- **T2P Engine API**: For command execution and suggestions
- **Agent API**: For managing agents and competitions
- **Task API**: For task management
- **System API**: For system configuration and monitoring

## Testing

We use Vitest and React Testing Library for testing:

- **Unit Tests**: For individual components and utilities
- **Integration Tests**: For component interactions
- **E2E Tests**: For critical user flows

## Deployment

The application can be deployed:

1. Build the project:
   ```bash
   npm run build
   # or
   yarn build
   ```

2. Deploy the resulting `dist` directory to your web server or hosting service.

## Documentation

- [Documentation Index](../docs/frontend/index.md) - Central hub for all frontend documentation
- [Architecture Overview](../docs/frontend/architecture.md) - Technical architecture and design patterns
- [Wireframes](../docs/frontend/wireframes.md) - UI/UX designs and layouts
- [Setup Instructions](../docs/frontend/setup.md) - Development environment setup
- [Progress Tracker](../docs/frontend/progress.md) - Current development status and roadmap
- [Project Summary](../docs/frontend/summary.md) - Overview of accomplishments and next steps

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 