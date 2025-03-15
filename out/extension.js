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
const KnowledgeGraphManager_1 = require("./knowledge-graph/KnowledgeGraphManager");
const DevelopmentModeManager_1 = require("./modes/DevelopmentModeManager");
const QuickPromptManager_1 = require("./quick-prompt/QuickPromptManager");
const TokenManager_1 = require("./token-management/TokenManager");
const StatusBarManager_1 = require("./ui/StatusBarManager");
// Extension activation context
let extensionContext;
async function activate(context) {
    extensionContext = context;
    console.log('Cody extension is now active');
    // Initialize core components
    const knowledgeGraphManager = new KnowledgeGraphManager_1.KnowledgeGraphManager(context);
    const developmentModeManager = new DevelopmentModeManager_1.DevelopmentModeManager(context);
    const quickPromptManager = new QuickPromptManager_1.QuickPromptManager(context);
    const tokenManager = new TokenManager_1.TokenManager(context);
    const statusBarManager = new StatusBarManager_1.StatusBarManager(context, developmentModeManager);
    // Register commands
    registerCommands(context, {
        knowledgeGraphManager,
        developmentModeManager,
        quickPromptManager,
        tokenManager,
        statusBarManager,
    });
    // Set up initial state
    await initializeExtension(context, {
        knowledgeGraphManager,
        developmentModeManager,
        quickPromptManager,
        tokenManager,
        statusBarManager,
    });
    // Return API for other extensions to use
    return {
        getKnowledgeGraphManager: () => knowledgeGraphManager,
        getDevelopmentModeManager: () => developmentModeManager,
        getQuickPromptManager: () => quickPromptManager,
        getTokenManager: () => tokenManager,
    };
}
function registerCommands(context, { knowledgeGraphManager, developmentModeManager, quickPromptManager, tokenManager, statusBarManager, }) {
    // Register main commands
    context.subscriptions.push(vscode.commands.registerCommand('cody.startChat', () => {
        vscode.window.showInformationMessage('Starting Cody chat...');
        // TODO: Implement chat panel
    }));
    context.subscriptions.push(vscode.commands.registerCommand('cody.processSelection', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return;
        }
        const selection = editor.selection;
        const text = editor.document.getText(selection);
        if (!text) {
            vscode.window.showErrorMessage('No text selected');
            return;
        }
        // TODO: Implement processing of selected text
        vscode.window.showInformationMessage('Processing selected text...');
    }));
    context.subscriptions.push(vscode.commands.registerCommand('cody.switchMode', async () => {
        const modes = ['design', 'engineering', 'testing', 'deployment', 'maintenance'];
        const modeIcons = {
            design: '🎨',
            engineering: '🔧',
            testing: '🧪',
            deployment: '📦',
            maintenance: '🔍',
        };
        const selectedMode = await vscode.window.showQuickPick(modes, {
            placeHolder: 'Select development mode',
        });
        if (selectedMode) {
            // Update configuration
            const config = vscode.workspace.getConfiguration('cody');
            await config.update('developmentMode', selectedMode, vscode.ConfigurationTarget.Workspace);
            // Show information message
            vscode.window.showInformationMessage(`Switched to ${modeIcons[selectedMode]} ${selectedMode} mode`);
        }
    }));
}
async function initializeExtension(context, { knowledgeGraphManager, developmentModeManager, quickPromptManager, tokenManager, statusBarManager, }) {
    // Initialize knowledge graph if enabled
    const config = vscode.workspace.getConfiguration('cody');
    const knowledgeGraphEnabled = config.get('knowledgeGraph.enabled', true);
    if (knowledgeGraphEnabled) {
        try {
            await knowledgeGraphManager.initialize();
        }
        catch (err) {
            console.error('Failed to initialize knowledge graph:', err);
            vscode.window.showErrorMessage('Failed to initialize knowledge graph. Some features may not work correctly.');
        }
    }
    // Initialize development mode
    const initialMode = config.get('developmentMode', 'engineering');
    await developmentModeManager.switchMode(initialMode);
    // Initialize status bar
    statusBarManager.initialize();
    // Initialize token manager
    tokenManager.initialize();
    // Initialize quick prompt system
    quickPromptManager.initialize();
}
function deactivate() {
    // Clean up resources when the extension is deactivated
    console.log('Cody extension is now deactivated');
}
//# sourceMappingURL=extension.js.map