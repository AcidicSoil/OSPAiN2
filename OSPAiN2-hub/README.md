# OSPAiN² Hub

A dashboard for managing the OSPAiN² (Open Source Platform for AI Networks) ecosystem. This application provides tools for interacting with Ollama models, managing tasks, and visualizing AI agent behaviors.

## Features

- Modern, responsive UI with dark mode support
- Dashboard for monitoring system status
- Tool manager for configuring AI agent tools
- Agent demo for interactive demonstrations
- Task management system
- Rate limiting controls
- Knowledge graph visualization

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/OSPAiN2-hub.git
cd OSPAiN2-hub
```

2. Install dependencies

```bash
npm install
# or
yarn install
```

### Running the Application

The application consists of two parts:

1. An API server (port 3002)
2. A React frontend (port 3000)

#### Option 1: Start everything with the unified script

```bash
# Start both API server and React development server
./start-services.sh

# Start only the API server
./start-services.sh --api-only
```

#### Option 2: Start services individually

In one terminal, start the API server:

```bash
node server.js
```

In another terminal, start the React application:

```bash
npm start
# or
yarn start
```

### Accessing the Application

- Frontend: http://localhost:3000
- API endpoints:
  - Health check: http://localhost:3002/api/health
  - Todo data: http://localhost:3002/api/todo
  - Visualization data: http://localhost:3002/api/visualization/patterns

## Development

### Project Structure

```
OSPAiN2-hub/
├── public/                  # Static assets
├── src/
│   ├── components/          # React components
│   │   ├── layout/          # Layout components (Header, Sidebar, etc.)
│   │   ├── rate-limit/      # Rate limiting components
│   │   └── ...
│   ├── hooks/               # Custom React hooks
│   ├── pages/               # Page components
│   ├── utils/               # Utility functions
│   └── App.tsx              # Main application component
├── server.js                # API server
└── start-services.sh        # Script to start all services
```

### Building for Production

```bash
npm run build
# or
yarn build
```

The production build will be created in the `build` directory.

## Recent Changes

### UI Component Fixes

- Fixed JavaScript module format issues in layout components
- Converted CommonJS modules to ES modules
- Fixed sidebar component export issues
- Updated API server to properly handle routes
- Improved start-services.sh script for better process management

## License

[MIT](LICENSE)
