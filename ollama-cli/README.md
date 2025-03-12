# Ollama Todo CLI

A powerful command-line tool for visualizing and managing todo progress in the Ollama ecosystem project. Features beautiful terminal-based progress bars, status indicators, and priority distribution visualization.

## Features

- 📊 Real-time progress visualization with ASCII progress bars
- 🎨 Color-coded status indicators (🔴 🟡 🔵 🟢 📌)
- 📈 Priority distribution analysis
- 🔍 Project completion statistics
- 🎯 Task status overview
- 💫 Beautiful terminal UI with borders and formatting

## Installation

### Prerequisites

- Node.js v16 or higher
- npm or yarn package manager

### Install from Source

```bash
# Clone the repository
git clone [your-repo-url]
cd ollama-cli

# Install dependencies
npm install

# Build the project
npm run build

# Link globally (optional)
npm link
```

## Usage

### View Progress Overview

```bash
# Display full progress visualization
ollama-todo progress

# This will show:
# 1. ASCII art header
# 2. Progress bars for each project section
# 3. Priority distribution
# 4. Status overview
```

### Sample Output

```
   ____  _ _                     _____         _      
  / __ \| | |                   |_   _|       | |     
 | |  | | | | __ _ _ __ ___   __ | | ___   __| | ___ 
 | |  | | | |/ _' | '_ ' _ \ / _ \| |/ _ \ / _' |/ _ \
 | |__| | | | (_| | | | | | | (_) | | (_) | (_| | (_) |
  \____/|_|_|\__,_|_| |_| |_|\___/\_/\___/ \__,_|\___/ 

┌─────────────────────────┐
│    Progress Overview    │
└─────────────────────────┘
Core Functionality    |██████░░░░░░░░░░░░░░| 15%
Debug Research       |████████░░░░░░░░░░░░| 40%
Docker Integration   |███████████████████░| 95%
UI Development      |████████░░░░░░░░░░░░| 40%

┌─────────────────────────┐
│  Priority Distribution  │
└─────────────────────────┘
P1 Tasks    |██████████░░░░░░░░░░| 50%
P2 Tasks    |████░░░░░░░░░░░░░░░░| 20%
P3 Tasks    |██░░░░░░░░░░░░░░░░░░| 10%

┌─────────────────────────┐
│    Status Overview      │
└─────────────────────────┘
Not Started    |████░░░░░░░░░░░░░░░░| 20%
In Progress    |██████░░░░░░░░░░░░░░| 30%
Completed      |████████░░░░░░░░░░░░| 40%
Blocked        |██░░░░░░░░░░░░░░░░░░| 10%
```

## Configuration

The tool reads from `master-todo.md` in your project root by default. The file should follow the standard Ollama ecosystem todo format with:

- Priority indicators (P1-P5)
- Status emojis (🔴 🟡 🔵 🟢 📌)
- Progress percentages
- Section categories

## Development

```bash
# Install dependencies
npm install

# Run TypeScript compiler in watch mode
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

ISC

## Roadmap

- [ ] Add interactive todo management
- [ ] Implement task filtering by category
- [ ] Add export functionality (JSON, CSV)
- [ ] Create timeline visualization
- [ ] Add task dependency visualization
- [ ] Implement real-time updates
- [ ] Add custom theme support 