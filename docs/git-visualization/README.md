# Custom Git Visualization System

A custom implementation of Git visualization features inspired by GitLens, providing granular views and ultimate control over Git information in our project.

## Features

### 1. Inline Blame Annotations
- See who last modified each line of code directly in the editor
- View commit date and message in a non-intrusive way
- Quickly identify responsible authors for specific code sections

### 2. File History View
- Comprehensive timeline of all changes made to a file
- Visual representation of branches and merges
- Filter history by author, date range, or commit message

### 3. Git CodeLens
- Author information and last modification date above functions and classes
- Number of contributors to each code block
- Quick access to commit details directly from code

### 4. Commit Graph
- Visual representation of the repository history
- Interactive branch visualization
- Ability to perform Git operations directly from the graph

### 5. Heatmap Visualization
- Age-based heat mapping of code sections
- Quickly identify older vs. newer code
- Visual indicators of frequently modified areas

### 6. Comparison Tools
- Side-by-side diff views for any two points in history
- Visual indicators for added, modified, and deleted lines
- Easy navigation between changes

## Implementation

This custom system is implemented through a combination of:
1. Custom VS Code configurations
2. Node.js scripts for Git data processing
3. UI components for visualization
4. Integration with existing project structure

## Usage

1. Configure the `.vscode/settings.json` file to enable Git features
2. Use keyboard shortcuts for quick access to different views
3. Access the Git visualization panel through the sidebar
4. Use context menu options on files for history and blame features

## Customization

The system is highly configurable through:
- `.vscode/settings.json` for Visual Studio Code settings
- `git-visualization/config.js` for custom visualization options
- Command palette commands for toggling features on/off

## Installation

All necessary components are included in the project. No additional extensions are required. 