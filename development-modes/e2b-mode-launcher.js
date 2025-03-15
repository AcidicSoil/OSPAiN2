"use strict";
// E2B Desktop Mode Launcher
// Launches E2B Desktop with appropriate environment based on current development mode
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
const child_process_1 = require("child_process");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
// Mock E2B Desktop API for demonstration
// In a real implementation, you would use:
// import { Sandbox } from '@e2b/desktop';
class MockSandbox {
    constructor() {
        this.stream = {
            start: async (options = {}) => {
                console.log(`[E2B] Stream started with options:`, options);
                return true;
            },
            getAuthKey: async () => {
                return 'mock-auth-key-123456';
            },
            getUrl: (options = {}) => {
                return `https://sandbox.e2b.dev/desktop/stream?authKey=${options.authKey || 'none'}`;
            },
            stop: async () => {
                console.log(`[E2B] Stream stopped`);
                return true;
            }
        };
        this.files = {
            write: async (filePath, content) => {
                console.log(`[E2B] Writing file: ${filePath}`);
                console.log(`Content: ${content.substring(0, 50)}...`);
                return true;
            }
        };
    }
    async commands() {
        return {
            run: async (cmd) => {
                console.log(`[E2B] Running command: ${cmd}`);
                return { stdout: 'Command executed successfully', stderr: '' };
            }
        };
    }
    async open(path) {
        console.log(`[E2B] Opening: ${path}`);
        return true;
    }
    static async create(options = {}) {
        console.log(`[E2B] Creating sandbox with options:`, options);
        return new MockSandbox();
    }
}
// Configuration for each mode
const modeConfigs = {
    design: {
        resolution: [1920, 1080],
        packages: ['figma-linux', 'inkscape', 'gimp'],
        mainApp: '/usr/bin/figma-linux',
        workingDir: '/home/user/design-projects'
    },
    engineering: {
        resolution: [1920, 1080],
        packages: ['code', 'git', 'nodejs', 'npm'],
        mainApp: '/usr/bin/code',
        workingDir: '/home/user/engineering-projects'
    },
    testing: {
        resolution: [1680, 1050],
        packages: ['firefox', 'cypress', 'selenium-webdriver'],
        mainApp: '/usr/bin/firefox',
        workingDir: '/home/user/testing-projects'
    },
    deployment: {
        resolution: [1920, 1080],
        packages: ['docker.io', 'kubectl', 'terraform'],
        mainApp: '/usr/bin/gnome-terminal',
        workingDir: '/home/user/deployment-projects'
    },
    maintenance: {
        resolution: [1920, 1080],
        packages: ['mysql-workbench', 'htop', 'nmon'],
        mainApp: '/usr/bin/mysql-workbench',
        workingDir: '/home/user/maintenance-projects'
    }
};
// Get current development mode using the mode_switcher.sh script
function getCurrentMode() {
    try {
        const scriptDir = path.dirname(__filename);
        const modeSwitcherPath = path.join(scriptDir, 'mode_switcher.sh');
        // Ensure the script is executable
        fs.chmodSync(modeSwitcherPath, '755');
        const output = (0, child_process_1.execSync)(`${modeSwitcherPath} current`, { encoding: 'utf8' });
        const modeLine = output.split('\n')[0];
        const modeMatch = modeLine.match(/Current mode: [🎨🔧🧪📦🔍] (\w+)/);
        if (modeMatch && modeMatch[1]) {
            return modeMatch[1].toLowerCase();
        }
        return 'engineering'; // Default to engineering mode if not set
    }
    catch (error) {
        console.error('Error getting current mode:', error);
        return 'engineering'; // Default to engineering mode on error
    }
}
// Get activities for the current mode to display in the welcome file
function getModeActivities(mode) {
    const activities = {
        design: [
            '- Create wireframes for new features',
            '- Update UI component library',
            '- Review design system consistency',
            '- Prepare mockups for stakeholder review'
        ],
        engineering: [
            '- Implement core functionality',
            '- Write unit tests for business logic',
            '- Optimize data flow',
            '- Refactor legacy code',
            '- Document API endpoints'
        ],
        testing: [
            '- Create test plans for new features',
            '- Automate regression test suite',
            '- Identify and document edge cases',
            '- Perform load testing',
            '- Verify cross-browser compatibility'
        ],
        deployment: [
            '- Update CI/CD pipeline',
            '- Prepare release notes',
            '- Configure monitoring',
            '- Update documentation',
            '- Schedule deployment window'
        ],
        maintenance: [
            '- Monitor system performance',
            '- Analyze error logs',
            '- Apply security patches',
            '- Optimize database queries',
            '- Address user-reported issues'
        ]
    };
    return activities[mode]?.join('\n') || '- General development tasks';
}
// Launch E2B Desktop for the current development mode
async function launchE2BDesktop() {
    const currentMode = getCurrentMode();
    console.log(`Current development mode: ${currentMode}`);
    const config = modeConfigs[currentMode] || modeConfigs.engineering;
    console.log(`Launching E2B Desktop with ${currentMode} mode configuration...`);
    try {
        // Create the sandbox (using mock for demo)
        const desktop = await MockSandbox.create({
            resolution: config.resolution,
            dpi: 96
        });
        // Install required packages
        const commandsApi = await desktop.commands();
        const installCmd = `apt-get update && apt-get install -y ${config.packages.join(' ')}`;
        await commandsApi.run(installCmd);
        // Create a working directory
        await commandsApi.run(`mkdir -p ${config.workingDir}`);
        // Create a welcome file with mode information
        const welcomeContent = `
# Welcome to ${currentMode.toUpperCase()} Mode

You are currently in ${currentMode.toUpperCase()} mode with E2B Desktop.

## Suggested Activities:
${getModeActivities(currentMode)}

## Working Directory:
${config.workingDir}

## Available Tools:
- ${config.packages.join('\n- ')}

To switch modes, use the mode_switcher.sh script in your terminal.
`;
        await desktop.files.write(`${config.workingDir}/WELCOME.md`, welcomeContent);
        // Open the main application
        await desktop.open(config.mainApp);
        // Start streaming with authentication
        await desktop.stream.start({
            requireAuth: true
        });
        const authKey = await desktop.stream.getAuthKey();
        const streamUrl = desktop.stream.getUrl({ authKey });
        console.log(`\n🚀 E2B Desktop Ready!`);
        console.log(`Mode: ${currentMode.toUpperCase()}`);
        console.log(`Access URL: ${streamUrl}`);
        console.log(`Auth Key: ${authKey}`);
        console.log(`\nThis is a simulation - in production, you would be using the actual E2B Desktop SDK.`);
    }
    catch (error) {
        console.error('Error launching E2B Desktop:', error);
    }
}
// Run the launcher
launchE2BDesktop().catch(console.error);
//# sourceMappingURL=e2b-mode-launcher.js.map