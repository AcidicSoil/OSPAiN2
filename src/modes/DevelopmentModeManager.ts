import * as vscode from 'vscode';
import { EventEmitter } from 'events';

export type DevelopmentMode = 'design' | 'engineering' | 'testing' | 'deployment' | 'maintenance';

export interface ModeContext {
  mode: DevelopmentMode;
  icon: string;
  timestamp: string;
  reason?: string;
}

// File type priorities by mode - used for indexing and retrieval optimization
export interface ContentPriorities {
  fileTypes: Record<string, number>; // File extension to priority (0-1)
  directoryTypes: Record<string, number>; // Directory name to priority (0-1)
  keywords: Record<string, number>; // Keywords to priority boost (0-1)
}

// Content retrieval strategies for each mode
export interface ModeContentStrategy {
  priorities: ContentPriorities;
  hybridSearchAlpha: number; // Balance between vector vs keyword search
  chunkingStrategy: 'semantic' | 'fixed' | 'paragraph' | 'adaptive';
  contextWindowSize: number; // Preferred context window size for this mode
  relevancyThreshold: number; // Minimum relevancy score (0-1)
}

export class DevelopmentModeManager extends EventEmitter {
  private context: vscode.ExtensionContext;
  private currentMode: DevelopmentMode = 'engineering';
  private modeIcons: Record<DevelopmentMode, string> = {
    design: '🎨',
    engineering: '🔧',
    testing: '🧪',
    deployment: '📦',
    maintenance: '🔍',
  };
  
  // Content optimization strategies for each mode
  private modeContentStrategies: Record<DevelopmentMode, ModeContentStrategy> = {
    design: {
      priorities: {
        fileTypes: {
          // Design mode prioritizes UI files
          'css': 0.9, 'scss': 0.9, 'less': 0.9,
          'tsx': 0.8, 'jsx': 0.8,
          'html': 0.8, 'svg': 0.9,
          'md': 0.7, 'mdc': 0.7,
          'png': 0.6, 'jpg': 0.6, 'jpeg': 0.6,
          'ts': 0.5, 'js': 0.5,
        },
        directoryTypes: {
          'components': 0.9, 'ui': 0.9, 'styles': 0.9,
          'assets': 0.8, 'images': 0.8, 
          'design': 0.9, 'templates': 0.8
        },
        keywords: {
          'component': 0.8, 'style': 0.8, 'css': 0.7,
          'layout': 0.8, 'ui': 0.8, 'ux': 0.8,
          'responsive': 0.7, 'design': 0.8, 'theme': 0.7
        }
      },
      hybridSearchAlpha: 0.4, // Favor keyword search slightly
      chunkingStrategy: 'semantic',
      contextWindowSize: 4000,
      relevancyThreshold: 0.6
    },
    engineering: {
      priorities: {
        fileTypes: {
          // Engineering mode prioritizes code files
          'ts': 0.9, 'js': 0.9, 
          'tsx': 0.8, 'jsx': 0.8,
          'py': 0.9, 'java': 0.9, 'rs': 0.9, 'go': 0.9,
          'c': 0.8, 'cpp': 0.8, 'h': 0.8,
          'json': 0.7, 'yaml': 0.7, 'toml': 0.7,
          'md': 0.6, 'mdc': 0.6
        },
        directoryTypes: {
          'src': 0.9, 'lib': 0.9, 'services': 0.9,
          'utils': 0.8, 'helpers': 0.8,
          'api': 0.9, 'server': 0.8, 'client': 0.8
        },
        keywords: {
          'function': 0.8, 'class': 0.8, 'interface': 0.8,
          'api': 0.8, 'service': 0.8, 'data': 0.7,
          'implementation': 0.8, 'algorithm': 0.7
        }
      },
      hybridSearchAlpha: 0.6, // Favor vector search slightly
      chunkingStrategy: 'semantic',
      contextWindowSize: 8000,
      relevancyThreshold: 0.7
    },
    testing: {
      priorities: {
        fileTypes: {
          // Testing mode prioritizes test files
          'test.ts': 0.95, 'test.js': 0.95,
          'spec.ts': 0.95, 'spec.js': 0.95,
          'test.tsx': 0.9, 'test.jsx': 0.9, 
          'ts': 0.7, 'js': 0.7,
          'md': 0.6, 'mdc': 0.6
        },
        directoryTypes: {
          'tests': 0.95, 'test': 0.95, '__tests__': 0.95,
          'e2e': 0.9, 'fixtures': 0.9, 'mocks': 0.9,
          'coverage': 0.8
        },
        keywords: {
          'test': 0.9, 'assert': 0.9, 'expect': 0.9,
          'mock': 0.8, 'stub': 0.8, 'spy': 0.8,
          'describe': 0.8, 'it': 0.8, 'should': 0.8
        }
      },
      hybridSearchAlpha: 0.5, // Equal weight
      chunkingStrategy: 'paragraph',
      contextWindowSize: 4000, 
      relevancyThreshold: 0.8
    },
    deployment: {
      priorities: {
        fileTypes: {
          // Deployment mode prioritizes config and docs
          'yml': 0.9, 'yaml': 0.9, 'toml': 0.9,
          'json': 0.8, 'tf': 0.9, 'sh': 0.9, 'ps1': 0.9,
          'md': 0.8, 'mdc': 0.8,
          'Dockerfile': 0.9, 'docker-compose.yml': 0.9
        },
        directoryTypes: {
          'deploy': 0.95, 'deployment': 0.95, 'infrastructure': 0.95,
          'ci': 0.9, 'cd': 0.9, 'pipelines': 0.9,
          'config': 0.8, 'docs': 0.7
        },
        keywords: {
          'deploy': 0.9, 'release': 0.9, 'version': 0.8,
          'environment': 0.8, 'config': 0.8, 'build': 0.8,
          'pipeline': 0.8, 'container': 0.8, 'docker': 0.8
        }
      },
      hybridSearchAlpha: 0.4, // Favor keyword search slightly
      chunkingStrategy: 'semantic',
      contextWindowSize: 6000,
      relevancyThreshold: 0.7
    },
    maintenance: {
      priorities: {
        fileTypes: {
          // Maintenance mode prioritizes all files equally with slight preference
          'log': 0.9, 'md': 0.9, 'mdc': 0.9,
          'ts': 0.8, 'js': 0.8,
          'json': 0.8, 'yml': 0.8, 'yaml': 0.8,
          'tsx': 0.8, 'jsx': 0.8
        },
        directoryTypes: {
          'docs': 0.9, 'logs': 0.9,
          'src': 0.8, 'tests': 0.8,
          '.git': 0.7, 'node_modules': 0.6
        },
        keywords: {
          'bug': 0.9, 'fix': 0.9, 'issue': 0.9,
          'error': 0.9, 'crash': 0.9, 'performance': 0.8,
          'improve': 0.8, 'update': 0.8, 'upgrade': 0.8
        }
      },
      hybridSearchAlpha: 0.5, // Equal weight
      chunkingStrategy: 'adaptive',
      contextWindowSize: 8000,
      relevancyThreshold: 0.6
    }
  };

  constructor(context: vscode.ExtensionContext) {
    super();
    this.context = context;
  }

  public async switchMode(mode: DevelopmentMode, reason?: string): Promise<void> {
    const previousMode = this.currentMode;
    this.currentMode = mode;

    // Save mode in workspace state
    this.context.workspaceState.update('cody.currentMode', mode);

    // Update configuration
    const config = vscode.workspace.getConfiguration('cody');
    await config.update('developmentMode', mode, vscode.ConfigurationTarget.Workspace);

    // Create mode context
    const modeContext: ModeContext = {
      mode,
      icon: this.modeIcons[mode],
      timestamp: new Date().toISOString(),
      reason,
    };

    // Save mode history
    const modeHistory = this.context.workspaceState.get<ModeContext[]>('cody.modeHistory', []);
    modeHistory.push(modeContext);
    await this.context.workspaceState.update('cody.modeHistory', modeHistory);

    // Emit event for other components to react
    this.emit('modeChanged', { previous: previousMode, current: mode, reason });
    
    // Apply content retrieval strategy for the new mode
    this.applyContentStrategy(mode);

    // Show notification
    vscode.window.showInformationMessage(`Switched to ${mode} mode ${this.modeIcons[mode]}`);
  }
  
  /**
   * Apply content retrieval strategy based on current mode
   * @param mode The development mode
   */
  private async applyContentStrategy(mode: DevelopmentMode): Promise<void> {
    const strategy = this.modeContentStrategies[mode];
    
    // Update configuration for knowledge graph and context retrieval
    const config = vscode.workspace.getConfiguration('cody');
    
    // Update hybrid search alpha
    await config.update('knowledgeGraph.searchAlpha', strategy.hybridSearchAlpha, vscode.ConfigurationTarget.Workspace);
    
    // Update chunking strategy
    await config.update('content.chunkingStrategy', strategy.chunkingStrategy, vscode.ConfigurationTarget.Workspace);
    
    // Update context window size
    await config.update('context.preferredWindowSize', strategy.contextWindowSize, vscode.ConfigurationTarget.Workspace);
    
    // Update relevancy threshold
    await config.update('search.relevancyThreshold', strategy.relevancyThreshold, vscode.ConfigurationTarget.Workspace);
    
    // Emit event with priorities for other components to use
    this.emit('contentStrategyChanged', {
      mode,
      strategy
    });
  }

  /**
   * Get the content strategy for the current or specified mode
   * @param mode Optional mode to get strategy for (uses current mode if not specified)
   */
  public getContentStrategy(mode?: DevelopmentMode): ModeContentStrategy {
    const targetMode = mode || this.currentMode;
    return this.modeContentStrategies[targetMode];
  }
  
  /**
   * Calculate a relevancy score for a file based on current mode
   * @param filePath The file path to score
   * @param fileContent Optional file content for keyword matching
   */
  public calculateFileRelevancy(filePath: string, fileContent?: string): number {
    const strategy = this.modeContentStrategies[this.currentMode];
    let score = 0.5; // Default medium relevancy
    
    // Check file extension
    const fileExtension = this.getFileExtension(filePath);
    if (fileExtension && strategy.priorities.fileTypes[fileExtension]) {
      score = Math.max(score, strategy.priorities.fileTypes[fileExtension]);
    }
    
    // Check directory
    const directory = this.getDirectoryName(filePath);
    if (directory && strategy.priorities.directoryTypes[directory]) {
      score = Math.max(score, strategy.priorities.directoryTypes[directory]);
    }
    
    // Check keywords in content
    if (fileContent) {
      for (const [keyword, priority] of Object.entries(strategy.priorities.keywords)) {
        if (fileContent.toLowerCase().includes(keyword.toLowerCase())) {
          score = Math.max(score, priority);
        }
      }
    }
    
    return score;
  }
  
  /**
   * Get file extension from path
   */
  private getFileExtension(filePath: string): string | null {
    const parts = filePath.split('.');
    if (parts.length < 2) return null;
    return parts[parts.length - 1].toLowerCase();
  }
  
  /**
   * Get directory name from path
   */
  private getDirectoryName(filePath: string): string | null {
    const parts = filePath.split('/');
    if (parts.length < 2) return null;
    return parts[parts.length - 2].toLowerCase();
  }

  public getCurrentMode(): DevelopmentMode {
    return this.currentMode;
  }

  public getCurrentModeIcon(): string {
    return this.modeIcons[this.currentMode];
  }

  public getModeHistory(): ModeContext[] {
    return this.context.workspaceState.get<ModeContext[]>('cody.modeHistory', []);
  }

  public getLastModeTransition(): ModeContext | undefined {
    const history = this.getModeHistory();
    return history.length > 0 ? history[history.length - 1] : undefined;
  }

  public getModeIcon(mode: DevelopmentMode): string {
    return this.modeIcons[mode];
  }

  /**
   * Auto-detect the appropriate mode based on the active file and workspace context
   */
  public async detectMode(): Promise<DevelopmentMode | null> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return null;
    }

    const document = editor.document;
    const fileName = document.fileName.toLowerCase();
    const fileContent = document.getText();

    // Check for design-related files
    if (
      fileName.includes('design') ||
      fileName.endsWith('.css') ||
      fileName.endsWith('.scss') ||
      fileName.endsWith('.html') ||
      fileName.endsWith('.svg') ||
      fileContent.includes('styled-components') ||
      fileContent.includes('tailwind')
    ) {
      return 'design';
    }

    // Check for testing-related files
    if (
      fileName.includes('test') ||
      fileName.includes('spec') ||
      fileName.endsWith('.test.ts') ||
      fileName.endsWith('.test.js') ||
      fileName.endsWith('.spec.ts') ||
      fileName.endsWith('.spec.js') ||
      fileContent.includes('describe(') ||
      fileContent.includes('it(') ||
      fileContent.includes('test(')
    ) {
      return 'testing';
    }

    // Check for deployment-related files
    if (
      fileName.includes('dockerfile') ||
      fileName.includes('docker-compose') ||
      fileName.includes('.gitlab-ci') ||
      fileName.includes('.github/workflows') ||
      fileName.includes('deploy') ||
      fileName.includes('kubernetes') ||
      fileName.includes('k8s')
    ) {
      return 'deployment';
    }

    // Check for maintenance-related files
    if (
      fileName.includes('fix') ||
      fileName.includes('bug') ||
      fileName.includes('refactor') ||
      fileName.includes('clean') ||
      fileName.includes('lint')
    ) {
      return 'maintenance';
    }

    // Default to engineering
    return 'engineering';
  }

  /**
   * If enabled, automatically switch to the detected mode
   */
  public async enableAutoSwitch(enable: boolean): Promise<void> {
    const config = vscode.workspace.getConfiguration('cody');
    await config.update(
      'developmentModes.autoSwitch',
      enable,
      vscode.ConfigurationTarget.Workspace,
    );

    if (enable) {
      // Set up file change listener
      vscode.window.onDidChangeActiveTextEditor(async (editor) => {
        if (editor) {
          const detectedMode = await this.detectMode();
          if (detectedMode && detectedMode !== this.currentMode) {
            await this.switchMode(detectedMode, 'Auto-detected from file context');
          }
        }
      });
    }
  }
}
