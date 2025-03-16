# t2p - Tag, Todo, and Notes Management CLI

A command-line tool for managing tags, todos, and notes in the Ollama ecosystem.

## Features

- ⚡ **Todo Management**: Create, update, and delete todo items with ease
- 📝 **Note-taking System**: Create and manage markdown notes with AI assistance
- 🏷️ **Tagging System**: Organize todos and notes with custom tags
- 🔢 **Prioritization**: Assign priorities to ensure important tasks are visible
- 📊 **Status Tracking**: Monitor todo status (not-started, in-progress, blocked, completed)
- 🌅 **Horizon Planning**: Categorize todos by time horizon (H1, H2, H3)
- 📈 **Progress Visualization**: View progress statistics and charts
- 🧠 **LLM Enhancement**: AI-powered improvement of todos, notes, and metadata
- 🔗 **Integration**: Connect notes to todos for contextual information
- 🌐 **Web Capture**: Create notes from web content automatically
- 👥 **Multi-user Workflow**: Collaborative todos with approval system
- 🗺️ **Architecture Mindmaps**: Daily generated architecture analysis with expert recommendations
- 🔄 **Migration Tools**: Context-aware tools for migrating from ollama-tag-cli

## Components

- **Todo Commands**: Comprehensive CLI for todo management
- **Note System**: Feature-rich note-taking with markdown support
- **Progress Visualization**: Visual representation of todo status
- **LLM Integration**: AI-enhanced processing for todos and notes
- **Multi-user Support**: Collaborative todo workflows
- **Architecture Mindmaps**: Daily architecture analysis and recommendations
- **Text Cleanup Tool**: Context-aware migration from ollama-tag-cli to t2p

## Documentation

- [Installation Guide](docs/installation.md)
- [Usage Guide](docs/usage.md)
- [API Documentation](docs/api.md)
- [Note-Taking System](docs/note-system.md)
- [Mindmap Feature](docs/mindmap-feature.md)
- [Migration from ollama-tag-cli](docs/text-cleanup-integration.md)

## Installation

### Option 1: Using the install script

```bash
# Clone the repository
git clone <repository-url>
cd t2p

# Run the installation script
npm run install-tool
```

### Option 2: Manual installation

```bash
# Clone the repository
git clone <repository-url>
cd t2p

# Install dependencies
npm install

# Build the project
npm run build

# Install globally
npm install -g .
```

## Usage

### Todo Management

```bash
# Add a new todo
t2p todo add

# List todos
t2p todo list

# List todos with specific filters
t2p todo list --priority 1 --horizon H1 --status in-progress

# Update a todo
t2p todo update <id> --status completed

# Delete a todo
t2p todo delete <id>

# Show todo statistics
t2p todo stats
```

### Note Management

```bash
# Create a new note
t2p note new "My Note Title"

# Create a note with AI assistance
t2p note new --ai "Write about TypeScript best practices"

# List all notes
t2p note list

# View a specific note
t2p note view <id>

# Edit a note
t2p note edit <id>

# Create a note from a web page
t2p note web https://example.com/article

# Link a note to a todo
t2p note link <note-id> <todo-id>

# Generate a summary of a note
t2p note summarize <id>
```

### Progress Visualization

```bash
# Show progress visualization
t2p progress
```

This will display:

- Progress overview with progress bars
- Priority distribution
- Status overview

## Options

### Todo Add

```bash
t2p todo add [options]
```

Options:

- `-p, --priority <number>`: Priority (1-5) (default: "3")
- `-s, --status <status>`: Status (not-started, in-progress, blocked, completed, recurring) (default: "not-started")
- `-h, --horizon <horizon>`: Horizon (H1, H2, H3) (default: "H1")
- `-t, --tags <tags>`: Comma-separated tags
- `-c, --category <category>`: Category

### Todo List

```bash
t2p todo list [options]
```

Options:

- `-p, --priority <number>`: Filter by priority
- `-s, --status <status>`: Filter by status
- `-h, --horizon <horizon>`: Filter by horizon
- `-t, --tags <tags>`: Filter by tags (comma-separated)
- `-c, --category <category>`: Filter by category
- `--search <term>`: Search in title and description

### Note New

```bash
t2p note new [title] [options]
```

Options:

- `-a, --ai <prompt>`: Generate note content using AI with the given prompt
- `-c, --content <content>`: Note content
- `-t, --tags <tags>`: Comma-separated list of tags
- `--category <category>`: Note category
- `-d, --draft`: Save as draft
- `-e, --editor`: Open in external editor after creation

### Note List

```bash
t2p note list [options]
```

Options:

- `-t, --tag <tag>`: Filter by tag
- `-c, --category <category>`: Filter by category
- `-s, --search <term>`: Search in title and content
- `--todos`: Show only notes with todo relations
- `--ai`: Show only AI-generated notes
- `--drafts`: Show only draft notes
- `-n, --limit <number>`: Limit number of results

## License

MIT
