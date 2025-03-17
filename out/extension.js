"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const KnowledgeGraph_1 = require("./knowledge/KnowledgeGraph");
const context_1 = require("./context");
const RateLimitService_1 = require("./services/RateLimitService");
// Mode icons for the status bar
const modeIcons = {
    design: '🎨',
    engineering: '🔧',
    testing: '🧪',
    deployment: '📦',
    maintenance: '🔍',
};
// Status bar item to display current mode
let modeStatusBarItem;
// Context management instances
let knowledgeGraph;
let contextManager;
let contextScanner;
let rateLimitService;
function activate(context) {
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
    const switchModeCommand = vscode.commands.registerCommand('cody.switchMode', switchDevelopmentMode);
    const startChatCommand = vscode.commands.registerCommand('cody.startChat', startChat);
    const processSelectionCommand = vscode.commands.registerCommand('cody.processSelection', processSelection);
    // Register context scanner commands
    const forceScanCommand = vscode.commands.registerCommand('cody.forceContextScan', () => contextScanner.forceScan());
    const toggleAutoScanCommand = vscode.commands.registerCommand('cody.toggleAutoContextScan', toggleAutoContextScan);
    // Add commands to subscriptions
    context.subscriptions.push(switchModeCommand);
    context.subscriptions.push(startChatCommand);
    context.subscriptions.push(processSelectionCommand);
    context.subscriptions.push(forceScanCommand);
    context.subscriptions.push(toggleAutoScanCommand);
    // Listen for configuration changes
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration('cody.currentMode')) {
            updateModeStatusBar();
        }
        if (e.affectsConfiguration('cody.contextScanner')) {
            updateContextScannerConfig();
        }
    }));
}
/**
 * Initialize services needed for context management
 */
function initializeServices(context) {
    // Initialize knowledge graph
    knowledgeGraph = new KnowledgeGraph_1.KnowledgeGraph();
    // Initialize rate limit service
    rateLimitService = new RateLimitService_1.RateLimitService();
    // Initialize context manager
    contextManager = new context_1.EnhancedContextManager(knowledgeGraph, rateLimitService);
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
    contextScanner = new context_1.PredictiveContextScanner(contextManager, knowledgeGraph, scannerConfig);
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
    }
    else {
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
    }
    else {
        contextScanner.stop();
        vscode.window.showInformationMessage('Predictive context scanning disabled');
    }
}
/**
 * Switch between development modes
 */
async function switchDevelopmentMode() {
    const modes = [
        'design',
        'engineering',
        'testing',
        'deployment',
        'maintenance',
    ];
    const currentMode = vscode.workspace
        .getConfiguration('cody')
        .get('currentMode', 'engineering');
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
        .get('currentMode', 'engineering');
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
    vscode.window.showInformationMessage(`Selected text: ${selectedText.substring(0, 30)}${selectedText.length > 30 ? '...' : ''}`);
}
/**
 * Helper function to capitalize the first letter of a string
 */
function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
function deactivate() {
    // Clean up resources
}
//# sourceMappingURL=extension.js.map