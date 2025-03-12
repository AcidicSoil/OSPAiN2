# OSPAiN₂ - Ollama Sovereign Personal Automated Intelligence Nexus

OSPAiN₂ is a comprehensive frontend UI for the Ollama Ecosystem, designed to provide a sovereign AI experience with full local control and ownership of your data and models.

## Features

- **Chemical-Inspired UI**: Themed after the OSPAiN₂ chemical formula, representing the element structure of our sovereign AI system
- **Local-First Infrastructure**: Run your AI models locally with full control and privacy
- **Knowledge Management**: Organize your knowledge base with tagging and retrieval
- **Model Management**: Easily download, switch, and manage multiple AI models
- **Agent Components**: Built-in support for PydanticAI and SmolAgents integration
- **Fine-Tuning Tools**: Train and refine models to your specific needs
- **Distributed Computing Support**: Leverage multiple devices for computation when needed
- **Component Evaluation Framework**: Systematically evaluate and absorb external components into the ecosystem

## Agent Components

OSPAiN₂ includes specialized components for working with intelligent agents:

- **AgentPanel**: Interactive chat interface with tool usage and planning capabilities
- **PydanticFormBuilder**: Generate dynamic forms from Pydantic schemas for agent configuration
- **AgentTaskPlanner**: Create and execute structured plans with SmolAgents technology

These components follow our chemical theme and integrate seamlessly with the Ollama ecosystem.

## Component Evaluation Framework

The project includes a structured approach to evaluate and integrate external components:

- **Metrics-Based Evaluation**: Score components on performance, quality, integration, UX, and maintenance
- **Automated Absorption**: Auto-absorb high-scoring components, reject low-scoring ones
- **Component Registry**: Track evaluations, statistics, and component relationships
- **React Integration**: Evaluate components with included React hooks and testing utilities

For more details, see the [Component Evaluation Framework documentation](./docs/component_evaluation.md).

## Technical Stack

- React 18+
- TypeScript
- Tailwind CSS
- React Router
- D3.js for visualizations
- Framer Motion for animations

## Project Structure

```
OSPAiN₂/
├── public/              # Static assets
├── src/                 # Source code
│   ├── components/      # React components
│   │   ├── AgentPanel.tsx       # Chat interface for agent interactions
│   │   ├── PydanticFormBuilder.tsx  # Dynamic form generation from schemas
│   │   ├── AgentTaskPlanner.tsx # Task planning with SmolAgents
│   │   ├── AgentDemo.tsx        # Demo page for agent components
│   │   ├── Dashboard.tsx        # Main dashboard component
│   │   ├── Header.tsx           # Site header with OSPAiN₂ formula
│   │   └── Sidebar.tsx          # Navigation sidebar
│   ├── hooks/           # Custom React hooks
│   ├── services/        # API and service functions
│   ├── contexts/        # React contexts
│   ├── utils/           # Utility functions
│   ├── types/           # TypeScript types
│   ├── App.tsx          # Main application component
│   └── index.tsx        # Application entry point
└── package.json         # Project dependencies
```

## Getting Started

1. Clone the repository
2. Install dependencies with `npm install`
3. Run the development server with `npm start`
4. Build for production with `npm run build`

## Development Tools

### Browser Tools Integration

OSPAiN₂ integrates with Browser Tools MCP to enhance development workflow:

- **Console Monitoring**: Capture and analyze browser console logs directly in Cursor IDE
- **Network Analysis**: Track XHR requests and responses during development
- **Screenshot Capture**: Easily take and share screenshots for collaboration
- **DOM Inspection**: Analyze selected DOM elements
- **Auditing Tools**: Run accessibility, performance, SEO, and best practices audits

To use Browser Tools:

1. Install the [Browser Tools Chrome Extension](https://github.com/AgentDeskAI/browser-tools-mcp)
2. Run the Browser Tools server using `start-browser-tools.bat` (Windows) or `start-browser-tools.sh` (Linux/Mac)
3. Connect to the MCP server from Cursor IDE (configured in `.cursor/mcp.json`)

## Philosophy

OSPAiN₂ embodies the principles of sovereign AI:

- **O**llama - Core AI foundation
- **S**overeign - You have full control and ownership
- **P**ersonal - Customized to your specific needs
- **A**utomated **i**ntelligence - AI that works for you
- **N₂**exus - The central connection point for all components

## Integration Points

- **PydanticAI**: Integration for form-based agent configuration
- **SmolAgents**: Framework for structured planning and execution
- **Ollama API**: Direct connection to local Ollama models
- **Knowledge Graph**: Integration with knowledge graph system

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## Connect with Ollama Ecosystem

- [Main Ollama Repository](https://github.com/ollama/ollama)
- [Ollama Website](https://ollama.com)
