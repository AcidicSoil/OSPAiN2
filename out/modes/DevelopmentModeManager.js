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
exports.DevelopmentModeManager = void 0;
const vscode = __importStar(require("vscode"));
const events_1 = require("events");
class DevelopmentModeManager extends events_1.EventEmitter {
    constructor(context) {
        super();
        this.currentMode = 'engineering';
        this.modeIcons = {
            design: '🎨',
            engineering: '🔧',
            testing: '🧪',
            deployment: '📦',
            maintenance: '🔍',
        };
        this.context = context;
    }
    async switchMode(mode, reason) {
        const previousMode = this.currentMode;
        this.currentMode = mode;
        // Save mode in workspace state
        this.context.workspaceState.update('cody.currentMode', mode);
        // Update configuration
        const config = vscode.workspace.getConfiguration('cody');
        await config.update('developmentMode', mode, vscode.ConfigurationTarget.Workspace);
        // Create mode context
        const modeContext = {
            mode,
            icon: this.modeIcons[mode],
            timestamp: new Date().toISOString(),
            reason,
        };
        // Save mode history
        const modeHistory = this.context.workspaceState.get('cody.modeHistory', []);
        modeHistory.push(modeContext);
        this.context.workspaceState.update('cody.modeHistory', modeHistory);
        // Emit mode changed event
        this.emit('modeChanged', { previous: previousMode, current: mode, context: modeContext });
        console.log(`Switched from ${previousMode} mode to ${mode} mode`);
    }
    getCurrentMode() {
        return this.currentMode;
    }
    getCurrentModeIcon() {
        return this.modeIcons[this.currentMode];
    }
    getModeHistory() {
        return this.context.workspaceState.get('cody.modeHistory', []);
    }
    getLastModeTransition() {
        const history = this.getModeHistory();
        return history.length > 0 ? history[history.length - 1] : undefined;
    }
    getModeIcon(mode) {
        return this.modeIcons[mode];
    }
    /**
     * Auto-detect the appropriate mode based on the active file and workspace context
     */
    async detectMode() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return null;
        }
        const document = editor.document;
        const fileName = document.fileName.toLowerCase();
        const fileContent = document.getText();
        // Check for design-related files
        if (fileName.includes('design') ||
            fileName.endsWith('.css') ||
            fileName.endsWith('.scss') ||
            fileName.endsWith('.html') ||
            fileName.endsWith('.svg') ||
            fileContent.includes('styled-components') ||
            fileContent.includes('tailwind')) {
            return 'design';
        }
        // Check for testing-related files
        if (fileName.includes('test') ||
            fileName.includes('spec') ||
            fileName.endsWith('.test.ts') ||
            fileName.endsWith('.test.js') ||
            fileName.endsWith('.spec.ts') ||
            fileName.endsWith('.spec.js') ||
            fileContent.includes('describe(') ||
            fileContent.includes('it(') ||
            fileContent.includes('test(')) {
            return 'testing';
        }
        // Check for deployment-related files
        if (fileName.includes('dockerfile') ||
            fileName.includes('docker-compose') ||
            fileName.includes('.gitlab-ci') ||
            fileName.includes('.github/workflows') ||
            fileName.includes('deploy') ||
            fileName.includes('kubernetes') ||
            fileName.includes('k8s')) {
            return 'deployment';
        }
        // Check for maintenance-related files
        if (fileName.includes('fix') ||
            fileName.includes('bug') ||
            fileName.includes('refactor') ||
            fileName.includes('clean') ||
            fileName.includes('lint')) {
            return 'maintenance';
        }
        // Default to engineering
        return 'engineering';
    }
    /**
     * If enabled, automatically switch to the detected mode
     */
    async enableAutoSwitch(enable) {
        const config = vscode.workspace.getConfiguration('cody');
        await config.update('developmentModes.autoSwitch', enable, vscode.ConfigurationTarget.Workspace);
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
exports.DevelopmentModeManager = DevelopmentModeManager;
//# sourceMappingURL=DevelopmentModeManager.js.map