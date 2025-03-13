# T2P Note-Taking System

A powerful, AI-enhanced note-taking system for the command line, integrated with the T2P CLI tool.

## Features

- **Create Notes**: Create markdown notes with optional AI assistance
- **Organize with Tags**: Tag and categorize notes for easy organization
- **Link to Todos**: Connect notes to todo items for contextual workflow
- **AI Integration**: Generate note content, summarize notes, and extract web content
- **Export Options**: Export notes to Markdown, JSON, or HTML formats
- **External Editor Support**: Open notes in your favorite editor

## Usage

### Creating Notes

```bash
# Create a new note with a title
t2p note new "My Note Title"

# Create a note with AI-generated content
t2p note new --ai "Write about TypeScript best practices"

# Create a note and open in your external editor
t2p note new --editor

# Create a note with tags and category
t2p note new "Meeting Notes" --tags "meeting,project,planning" --category "work"
```

### Listing and Viewing Notes

```bash
# List all notes
t2p note list

# List notes with specific tag
t2p note list --tag coding

# List notes with filtering
t2p note list --category work --limit 20

# View a specific note (by ID or list index)
t2p note view 1
t2p note view 5d6f8a2e-75d8-4f8e-9632-8d9eb732e4f0

# Open a note in your default markdown viewer
t2p note view 1 --open
```

### Editing and Updating Notes

```bash
# Edit a note with interactive prompts
t2p note edit 1

# Edit specific fields
t2p note edit 1 --title "New Title" --tags "new,tags"

# Open in external editor
t2p note edit 1 --editor
```

### Web Integration

```bash
# Create a note from a web page
t2p note web https://example.com/article

# Create from web and edit
t2p note web https://example.com/article --editor
```

### AI Features

```bash
# Generate a summary of a note
t2p note summarize 1

# Create an AI-generated note
t2p note new --ai "Write about the benefits of unit testing"
```

### Todo Integration

```bash
# Link a note to one or more todos
t2p note link 1 todo-id-1 todo-id-2

# Unlink a note from todos
t2p note unlink 1 todo-id-1
```

### Exporting Notes

```bash
# Export all notes to markdown
t2p note export

# Export with filtering and custom format
t2p note export --format html --tag project --category work
```

## Note Structure

Each note contains:

- **ID**: Unique identifier for the note
- **Title**: The note's title
- **Content**: Markdown-formatted note content
- **Tags**: Array of tags for categorization
- **Category**: Optional category for broader organization
- **Related Todos**: Optional array of linked todo IDs
- **Creation/Update Timestamps**: Tracks when notes were created and modified
- **Metadata Flags**: Tracks if notes are AI-generated, drafts, etc.

## Storage and Format

Notes are stored in a master Markdown file (`master-notes.md`) with:

1. Human-readable Markdown for viewing and editing
2. Embedded JSON data for preserving structured information

This dual approach ensures both human readability and programmatic access.

## Integration with T2P Ecosystem

The note-taking system integrates with other T2P features:

- **Todo Integration**: Link notes to specific todo items
- **AI Enhancement**: Leverage the same LLM middleware as the todo system
- **Terminal Utilities**: Uses common terminal utilities with sanitization
- **Export Capabilities**: Generate various output formats for sharing

## Implementation Details

- **Local-First**: All notes are stored locally in plain text
- **Markdown-Based**: Full support for markdown formatting
- **AI-Optional**: AI features enhance but are not required for functionality
- **External Editor Support**: Designed to work with your preferred editor
