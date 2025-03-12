# OSPAiN₂ Hub

OSPAiN₂ (Open Source Platform for AI Networking) is a central hub for managing, monitoring, and optimizing interactions with various AI tools and services, with a focus on local-first, sovereign AI principles.

## 🔬 What is OSPAiN₂?

OSPAiN₂ serves as the central nervous system of the Ollama ecosystem, connecting various components and providing a unified interface for managing AI tools, agents, and knowledge. Named with a chemistry-inspired theme, OSPAiN₂ represents the bonding of different components (like atoms) into a cohesive structure.

## 🌟 Key Features

- **Tool Call Rate Limit Management**: Sophisticated service for managing and bypassing rate limits when working with AI assistants
- **Agent Interaction Interface**: Unified interface for interacting with different types of agents
- **Knowledge Graph Integration**: Visualization and interaction with the local knowledge graph
- **Component Evaluation**: Testing ground for evaluating new components before integration

## 🔧 Tool Call Rate Limit Bypass

A key feature of OSPAiN₂ is its ability to manage and bypass rate limits when working with AI assistants. This service ensures uninterrupted workflow by automatically handling rate limit issues through various methods:

### Bypass Methods

- **Session Rotation**: Automatically rotates sessions to reset rate limits
- **Token Management**: Optimizes token usage to stay within limits
- **Cache Optimization**: Enhances caching strategies to reduce unnecessary calls
- **Request Batching**: Combines multiple requests to reduce total call count
- **Custom Rules**: Supports custom rules for specialized bypass strategies

### How It Works

1. **Monitoring**: Continuously monitors tool call usage and rate limits
2. **Threshold Detection**: Detects when usage approaches configurable thresholds
3. **Automatic Bypass**: Executes the configured bypass method when thresholds are reached
4. **Session Management**: Maintains session state across bypass operations
5. **Notification System**: Provides alerts for rate limit events

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ LTS
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/OSPAiN2-hub.git

# Navigate to the project directory
cd OSPAiN2-hub

# Install dependencies
npm install
# or
yarn install

# Start the development server
npm start
# or
yarn start
```

The application will be available at http://localhost:3000

## 📁 Project Structure

```
OSPAiN2-hub/
├── public/                  # Static files
├── src/
│   ├── components/          # UI components
│   │   ├── layout/          # Layout components (Header, Sidebar)
│   │   └── ...              # Other components
│   ├── pages/               # Page components
│   │   ├── Dashboard.tsx    # Main dashboard
│   │   ├── RateLimitManager.tsx # Rate limit management interface
│   │   └── ...              # Other pages
│   ├── services/            # Application services
│   │   └── RateLimitBypassService.ts # Rate limit bypass functionality
│   ├── utils/               # Utility functions
│   ├── context/             # React context providers
│   ├── App.tsx              # Main application component
│   └── index.tsx            # Application entry point
├── package.json             # Dependencies and scripts
└── tsconfig.json            # TypeScript configuration
```

## 🧪 Implementation Details

### Rate Limit Bypass Service

The Rate Limit Bypass Service provides a comprehensive solution for managing tool call rate limits, with:

- Real-time monitoring of tool call usage
- Configurable threshold detection
- Multiple bypass strategies
- Historical tracking of tool calls
- Notification system for important events

### UI Components

The UI is built with React and follows a chemistry-inspired design theme that represents the molecular structure of the system:

- Carbon-based color palette for core components
- Oxygen-themed accent colors for interactive elements
- Nitrogen and Hydrogen highlights for special features
- Phosphorus indicators for status and activity

## 🤝 Integration with Ollama Ecosystem

OSPAiN₂ Hub is designed to integrate with the broader Ollama ecosystem:

- **Knowledge Graph**: Connects to the local knowledge graph for context-aware operations
- **Agent Framework**: Interfaces with various agent implementations
- **Tag System**: Leverages the existing tag system for organization
- **Tool Management**: Coordinates tool access and optimization

## 📝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
