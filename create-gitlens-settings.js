const fs = require('fs');

// Ensure .vscode directory exists
if (!fs.existsSync('.vscode')) {
  fs.mkdirSync('.vscode', { recursive: true });
  console.log('Created .vscode directory');
}

// GitLens settings
const settings = {
  // GitLens Configuration
  "gitlens.codeLens.enabled": true,
  "gitlens.codeLens.includeSingleLineSymbols": true,
  "gitlens.currentLine.enabled": true,
  "gitlens.hovers.currentLine.over": "line",
  "gitlens.hovers.enabled": true,
  "gitlens.views.branches.branches.layout": "list",
  "gitlens.views.repositories.location": "explorer",
  "gitlens.views.fileHistory.enabled": true,
  "gitlens.views.lineHistory.enabled": true,
  "gitlens.views.compare.enabled": true,
  "gitlens.views.search.enabled": true,
  "gitlens.statusBar.enabled": true,
  "gitlens.statusBar.alignment": "left",
  "gitlens.statusBar.format": "${author}, ${ago} • ${message|50}",
  "gitlens.blame.format": "${author|7}, ${ago|14-medium} • ${message|50}",
  "gitlens.blame.heatmap.enabled": true,
  "gitlens.blame.highlight.enabled": true,
  "gitlens.defaultDateFormat": "MMMM Do, YYYY h:mma",
  "gitlens.defaultDateShortFormat": "MMM D, YYYY",
  "gitlens.advanced.messages": {
    "suppressGitMissingWarning": true
  },
  "gitlens.integrations.enabled": true,
  
  // Project-specific VS Code settings
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "files.associations": {
    "*.mdc": "markdown"
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/bower_components": true,
    "**/*.code-search": true,
    "out": true,
    "dist": true,
    ".git": true
  }
};

// Write settings file
try {
  fs.writeFileSync('.vscode/settings.json', JSON.stringify(settings, null, 2));
  console.log('GitLens settings file created successfully at .vscode/settings.json');
  
  // List files in .vscode to verify
  const files = fs.readdirSync('.vscode');
  console.log('.vscode directory contains:', files);
  
} catch (error) {
  console.error('Error creating settings file:', error);
} 