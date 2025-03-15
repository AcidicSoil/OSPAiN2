import * as vscode from 'vscode';
import { KnowledgeGraph } from './knowledge/KnowledgeGraph';
import { EnhancedContextManager, PredictiveContextScanner } from './context';
import { RateLimitService } from './services/RateLimitService';

// Development mode types
type DevelopmentMode = 'design' | 'engineering' | 'testing' | 'deployment' | 'maintenance';

// Mode icons for the status bar
const modeIcons: Record<DevelopmentMode, string> = {
  design: '🎨',
  engineering: '🔧',
  testing: '🧪',
  deployment: '📦',
  maintenance: '🔍',
};

// Status bar item to display current mode
let modeStatusBarItem: vscode.StatusBarItem;

// Context management instances
let knowledgeGraph: KnowledgeGraph;
let contextManager: EnhancedContextManager;
let contextScanner: PredictiveContextScanner;
let rateLimitService: RateLimitService;

export function activate(context: vscode.ExtensionContext) {
  console.log('Cody extension is now active');

  // Create status bar item
  modeStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  modeStatusBarItem.command = 'cody.switchMode';
  context.subscriptions.push(modeStatusBarItem);

  // Update status bar with current mode
  updateModeStatusBar();
  modeStatusBarItem.show();

  // Initialize services
  initializeServices(context);

  // Register commands
  const switchModeCommand = vscode.commands.registerCommand(
    'cody.switchMode',
    switchDevelopmentMode,
  );
  const startChatCommand = vscode.commands.registerCommand('cody.startChat', startChat);
  const processSelectionCommand = vscode.commands.registerCommand(
    'cody.processSelection',
    processSelection,
  );
  
  // Register context scanner commands
  const forceScanCommand = vscode.commands.registerCommand(
    'cody.forceContextScan',
    () => contextScanner.forceScan()
  );
  
  const toggleAutoScanCommand = vscode.commands.registerCommand(
    'cody.toggleAutoContextScan',
    toggleAutoContextScan
  );

  // Add commands to subscriptions
  context.subscriptions.push(switchModeCommand);
  context.subscriptions.push(startChatCommand);
  context.subscriptions.push(processSelectionCommand);
  context.subscriptions.push(forceScanCommand);
  context.subscriptions.push(toggleAutoScanCommand);

  // Listen for configuration changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('cody.currentMode')) {
        updateModeStatusBar();
      }
      
      if (e.affectsConfiguration('cody.contextScanner')) {
        updateContextScannerConfig();
      }
    })
  );
}

/**
 * Initialize services needed for context management
 */
function initializeServices(context: vscode.ExtensionContext) {
  // Initialize knowledge graph
  knowledgeGraph = new KnowledgeGraph();
  
  // Initialize rate limit service
  rateLimitService = new RateLimitService();
  
  // Initialize context manager
  contextManager = new EnhancedContextManager(knowledgeGraph, rateLimitService);
  
  // Get scanner configuration from settings
  const config = vscode.workspace.getConfiguration('cody.contextScanner');
  const scannerConfig = {
    maxFilesToScan: config.get('maxFilesToScan', 100),
    maxFilesToSuggest: config.get('maxFilesToSuggest', 5),
    minRelevanceScore: config.get('minRelevanceScore', 0.6),
    scanIntervalMs: config.get('scanIntervalMs', 30000),
    enableAutomaticAddition: config.get('enableAutomaticAddition', false),
    scanDepth: config.get('scanDepth', 'medium')
  };
  
  // Initialize context scanner
  contextScanner = new PredictiveContextScanner(contextManager, knowledgeGraph, scannerConfig);
  
  // Start scanner if enabled
  if (config.get('enabled', true)) {
    contextScanner.start();
  }
  
  // Add to disposables
  context.subscriptions.push({
    dispose: () => {
      contextScanner.dispose();
    }
  });
}

/**
 * Update context scanner configuration from settings
 */
function updateContextScannerConfig() {
  const config = vscode.workspace.getConfiguration('cody.contextScanner');
  const scannerConfig = {
    maxFilesToScan: config.get('maxFilesToScan', 100),
    maxFilesToSuggest: config.get('maxFilesToSuggest', 5),
    minRelevanceScore: config.get('minRelevanceScore', 0.6),
    scanIntervalMs: config.get('scanIntervalMs', 30000),
    enableAutomaticAddition: config.get('enableAutomaticAddition', false),
    scanDepth: config.get('scanDepth', 'medium')
  };
  
  contextScanner.updateConfig(scannerConfig);
  
  // Start or stop scanner based on enabled setting
  if (config.get('enabled', true)) {
    contextScanner.start();
  } else {
    contextScanner.stop();
  }
}

/**
 * Toggle automatic context scanning
 */
async function toggleAutoContextScan() {
  const config = vscode.workspace.getConfiguration('cody.contextScanner');
  const currentlyEnabled = config.get('enabled', true);
  
  // Update configuration
  await config.update('enabled', !currentlyEnabled, vscode.ConfigurationTarget.Global);
  
  // Show notification
  if (!currentlyEnabled) {
    contextScanner.start();
    vscode.window.showInformationMessage('Predictive context scanning enabled');
  } else {
    contextScanner.stop();
    vscode.window.showInformationMessage('Predictive context scanning disabled');
  }
}

/**
 * Switch between development modes
 */
async function switchDevelopmentMode() {
  const modes: DevelopmentMode[] = [
    'design',
    'engineering',
    'testing',
    'deployment',
    'maintenance',
  ];
  const currentMode = vscode.workspace
    .getConfiguration('cody')
    .get<DevelopmentMode>('currentMode', 'engineering');

  const items = modes.map((mode) => ({
    label: `${modeIcons[mode]} ${capitalizeFirstLetter(mode)}`,
    description: mode === currentMode ? '(Current)' : '',
    mode,
  }));

  const selected = await vscode.window.showQuickPick(items, {
    placeHolder: 'Select development mode',
  });

  if (selected) {
    await vscode.workspace.getConfiguration('cody').update('currentMode', selected.mode, true);
    vscode.window.showInformationMessage(`Switched to ${selected.mode} mode`);
    updateModeStatusBar();
  }
}

/**
 * Update the status bar item with the current mode
 */
function updateModeStatusBar() {
  const currentMode = vscode.workspace
    .getConfiguration('cody')
    .get<DevelopmentMode>('currentMode', 'engineering');
  modeStatusBarItem.text = `${modeIcons[currentMode]} ${capitalizeFirstLetter(currentMode)} Mode`;
  modeStatusBarItem.tooltip = `Current development mode: ${capitalizeFirstLetter(currentMode)}`;
}

/**
 * Start a chat with Cody
 */
function startChat() {
  vscode.window.showInformationMessage('Chat functionality not implemented yet');
}

/**
 * Process the selected text in the active editor
 */
function processSelection() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showWarningMessage('No active editor');
    return;
  }

  const selection = editor.selection;
  if (selection.isEmpty) {
    vscode.window.showWarningMessage('No text selected');
    return;
  }

  const selectedText = editor.document.getText(selection);
  vscode.window.showInformationMessage(
    `Selected text: ${selectedText.substring(0, 30)}${selectedText.length > 30 ? '...' : ''}`,
  );
}

/**
 * Helper function to capitalize the first letter of a string
 */
function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function deactivate() {
  // Clean up resources
}
