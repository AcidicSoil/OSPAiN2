/**
 * Custom Git Visualization System Configuration
 * Inspired by GitLens features with comprehensive options for granular control
 */

module.exports = {
  /**
   * Inline blame annotations configuration
   */
  inlineBlame: {
    enabled: true,
    showAuthor: true,
    showDate: true,
    showMessage: true,
    dateFormat: 'YYYY-MM-DD', // Supported: 'YYYY-MM-DD', 'MMMM Do, YYYY', 'relative'
    format: '${author}, ${date} • ${message}', // Format template for blame info
    hoverFormat: '${author} (${email})\n${date}\n\n${message}', // Format for hover details
    toggleCommand: 'git-viz.toggleInlineBlame', // Command ID for toggling
    opacity: 0.7, // Opacity of blame annotations
    fontStyle: 'italic', // 'normal', 'italic', 'bold'
  },

  /**
   * CodeLens configuration for git information above code blocks
   */
  codeLens: {
    enabled: true,
    showRecentChanges: true, // Show the most recent change
    showAuthors: true, // Show the number of authors
    includeSingleLineSymbols: true, // Show annotations on single-line symbols
    locations: ['document', 'blocks', 'functions'], // Where to show CodeLens
  },

  /**
   * File annotations (heatmap, changes, etc.)
   */
  fileAnnotations: {
    heatmap: {
      enabled: true,
      coldColor: '#5c6bc0', // Color for older code
      hotColor: '#e91e63', // Color for newer code
      coldThreshold: 90, // Days old to be considered cold
      hotThreshold: 3, // Days old to be considered hot
    },
    changes: {
      enabled: true,
      addedColor: '#4caf50',
      modifiedColor: '#ff9800',
      deletedColor: '#f44336',
      showInRuler: true,
    },
  },

  /**
   * History view configuration
   */
  historyView: {
    showGraph: true,
    defaultBranchSort: 'date', // 'date', 'name', 'author'
    showCommitDetails: true,
    showFileChanges: true,
    maxCommits: 100, // Max number of commits to load initially
  },

  /**
   * Commit graph visualization
   */
  commitGraph: {
    showBranches: true,
    showTags: true,
    showRemotes: true,
    showStashes: true,
    showRefNames: true,
    avatarType: 'identicon', // 'gravatar', 'identicon', 'none'
    graphStyle: 'rounded', // 'angular', 'rounded', 'square'
    columnWidth: 3, // Width of commit graph columns
  },

  /**
   * Status bar integration
   */
  statusBar: {
    enabled: true,
    format: '${author}, ${date} • ${message}',
    alignment: 'left', // 'left', 'right'
    command: 'git-viz.showBlameDetails', // Command when clicking the status bar item
  },

  /**
   * Keyboard shortcuts
   */
  keybindings: {
    toggleFileBlame: 'alt+b',
    toggleCodeLens: 'alt+l',
    toggleFileHeatmap: 'alt+h',
    toggleFileChanges: 'alt+c',
    showFileHistory: 'alt+shift+h',
    showCommitGraph: 'alt+shift+g',
  },

  /**
   * UI theme and appearance
   */
  appearance: {
    theme: 'auto', // 'light', 'dark', 'auto' (follow VS Code theme)
    useIcons: true,
    iconSet: 'default', // 'default', 'minimal', 'colorful'
    animationSpeed: 'normal', // 'slow', 'normal', 'fast', 'none'
  },

  /**
   * Advanced settings for performance optimization
   */
  advanced: {
    caching: {
      enabled: true,
      lifetime: 3600, // Cache lifetime in seconds
      maxEntries: 1000, // Maximum cache entries
    },
    throttling: {
      fileChangeDetection: 300, // Minimum time between file change checks (ms)
      blameCalculation: 150, // Minimum time between blame calculations (ms)
    },
    git: {
      commandTimeout: 5000, // Git command timeout in milliseconds
      maxConcurrentCommands: 4, // Maximum concurrent Git commands
      useExperimentalFeatures: false, // Enable experimental Git features
    },
  },

  /**
   * Integrations with other systems
   */
  integrations: {
    github: {
      enabled: false,
      enterpriseUrl: '', // URL for GitHub Enterprise
      pullRequests: {
        enabled: false,
        showInCodeLens: false,
        showInBlame: false,
      },
    },
    gitlab: {
      enabled: false,
      selfHostedUrl: '', // URL for self-hosted GitLab
    },
    bitbucket: {
      enabled: false,
      selfHostedUrl: '', // URL for self-hosted Bitbucket
    },
  },
}; 