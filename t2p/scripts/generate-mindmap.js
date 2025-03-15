#!/usr/bin/env node
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const chalk_1 = __importDefault(require("chalk"));
const llm_middleware_service_1 = require("../src/services/llm-middleware.service");
class MindmapGenerator {
    constructor() {
        this.llmMiddleware = new llm_middleware_service_1.LLMMiddlewareService();
        this.projectRoot = path.resolve(process.cwd());
        this.outputDir = path.join(this.projectRoot, 'mindmaps');
        this.today = new Date().toISOString().split('T')[0];
    }
    /**
     * Initialize the mindmap generation process
     */
    async init() {
        console.log(chalk_1.default.blue('🧠 Architecture Mindmap Generator'));
        console.log(chalk_1.default.gray(`Project root: ${this.projectRoot}`));
        // Ensure output directory exists
        await this.ensureDirectory(this.outputDir);
        // Generate the mindmap data
        const mindmapData = await this.generateMindmapData();
        // Save as markdown
        await this.saveAsMD(mindmapData);
        // Save as mermaid
        await this.saveAsMermaid(mindmapData);
        // Generate recommendations
        await this.generateRecommendations(mindmapData);
        console.log(chalk_1.default.green('✅ Mindmap generation complete!'));
        console.log(chalk_1.default.gray(`Output directory: ${this.outputDir}`));
    }
    /**
     * Make sure a directory exists, creating it if needed
     */
    async ensureDirectory(dir) {
        try {
            await fs.mkdir(dir, { recursive: true });
        }
        catch (error) {
            console.error(chalk_1.default.red(`Failed to create directory: ${dir}`), error);
            throw error;
        }
    }
    /**
     * Generate the mindmap data structure
     */
    async generateMindmapData() {
        console.log(chalk_1.default.blue('🔍 Analyzing project structure...'));
        // Create the root node for the project
        const rootNode = {
            id: 'root',
            label: 'T2P Architecture',
            children: [],
            properties: {
                description: 'Task management and prioritization CLI tool',
                version: await this.getProjectVersion(),
                generatedOn: this.today,
            },
        };
        // Analyze the main architectural components
        rootNode.children = await Promise.all([
            this.analyzeCommands(),
            this.analyzeServices(),
            this.analyzeTypes(),
            this.analyzeUtils(),
        ]);
        // Analyze dependencies between components
        await this.analyzeDependencies(rootNode);
        return rootNode;
    }
    /**
     * Get the project version from package.json
     */
    async getProjectVersion() {
        try {
            const packageJsonPath = path.join(this.projectRoot, 'package.json');
            const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
            return packageJson.version || '0.0.0';
        }
        catch (error) {
            console.warn(chalk_1.default.yellow('Could not determine project version'), error);
            return '0.0.0';
        }
    }
    /**
     * Analyze the commands directory
     */
    async analyzeCommands() {
        const commandsNode = {
            id: 'commands',
            label: 'Commands',
            children: [],
            properties: {
                type: 'component',
                description: 'CLI command implementations',
            },
        };
        const commandsDir = path.join(this.projectRoot, 'src', 'commands');
        try {
            const files = await fs.readdir(commandsDir);
            const commandFiles = files.filter((file) => file.endsWith('.ts') && !file.endsWith('.test.ts'));
            for (const file of commandFiles) {
                const filePath = path.join(commandsDir, file);
                const fileContent = await fs.readFile(filePath, 'utf-8');
                // Extract command name from file name
                const commandName = path.basename(file, '.ts');
                // Analyze the command implementation
                const commandNode = {
                    id: `command_${commandName}`,
                    label: commandName,
                    properties: {
                        fileName: file,
                        hasTesting: files.includes(`${commandName}.test.ts`) ? 'yes' : 'no',
                    },
                };
                // Analyze command options and subcommands using simple regex
                const optionMatches = fileContent.match(/\.option\([^)]+\)/g) || [];
                if (optionMatches.length > 0) {
                    commandNode.properties.optionCount = String(optionMatches.length);
                }
                const subcommandMatches = fileContent.match(/\.command\([^)]+\)/g) || [];
                if (subcommandMatches.length > 0) {
                    commandNode.properties.subcommandCount = String(subcommandMatches.length);
                }
                commandsNode.children.push(commandNode);
            }
        }
        catch (error) {
            console.warn(chalk_1.default.yellow(`Could not analyze commands directory: ${commandsDir}`), error);
            commandsNode.properties.error = 'Failed to analyze directory';
        }
        return commandsNode;
    }
    /**
     * Analyze the services directory
     */
    async analyzeServices() {
        const servicesNode = {
            id: 'services',
            label: 'Services',
            children: [],
            properties: {
                type: 'component',
                description: 'Business logic and data management',
            },
        };
        const servicesDir = path.join(this.projectRoot, 'src', 'services');
        try {
            const files = await fs.readdir(servicesDir);
            const serviceFiles = files.filter((file) => file.endsWith('.ts') && !file.endsWith('.test.ts'));
            for (const file of serviceFiles) {
                const filePath = path.join(servicesDir, file);
                const fileContent = await fs.readFile(filePath, 'utf-8');
                // Extract service name from file name
                const serviceName = path.basename(file, '.service.ts');
                // Analyze the service implementation
                const serviceNode = {
                    id: `service_${serviceName}`,
                    label: `${serviceName}Service`,
                    properties: {
                        fileName: file,
                        hasTesting: files.includes(`${serviceName}.service.test.ts`) ? 'yes' : 'no',
                    },
                };
                // Extract methods using simple regex
                const methodMatches = fileContent.match(/async\s+\w+\([^)]*\)/g) || [];
                if (methodMatches.length > 0) {
                    serviceNode.properties.methodCount = String(methodMatches.length);
                }
                servicesNode.children.push(serviceNode);
            }
        }
        catch (error) {
            console.warn(chalk_1.default.yellow(`Could not analyze services directory: ${servicesDir}`), error);
            servicesNode.properties.error = 'Failed to analyze directory';
        }
        return servicesNode;
    }
    /**
     * Analyze the types directory or type definitions
     */
    async analyzeTypes() {
        const typesNode = {
            id: 'types',
            label: 'Types',
            children: [],
            properties: {
                type: 'component',
                description: 'TypeScript type definitions',
            },
        };
        const typesDir = path.join(this.projectRoot, 'src', 'types');
        try {
            const files = await fs.readdir(typesDir);
            const typeFiles = files.filter((file) => file.endsWith('.ts'));
            for (const file of typeFiles) {
                const filePath = path.join(typesDir, file);
                const fileContent = await fs.readFile(filePath, 'utf-8');
                // Extract type name from file name
                const typeName = path.basename(file, '.ts');
                // Analyze the type definitions
                const typeNode = {
                    id: `type_${typeName}`,
                    label: typeName,
                    properties: {
                        fileName: file,
                    },
                };
                // Extract interface and type definitions using simple regex
                const interfaceMatches = fileContent.match(/interface\s+\w+/g) || [];
                if (interfaceMatches.length > 0) {
                    typeNode.properties.interfaceCount = String(interfaceMatches.length);
                }
                const typeMatches = fileContent.match(/type\s+\w+/g) || [];
                if (typeMatches.length > 0) {
                    typeNode.properties.typeCount = String(typeMatches.length);
                }
                typesNode.children.push(typeNode);
            }
        }
        catch (error) {
            console.warn(chalk_1.default.yellow(`Could not analyze types directory: ${typesDir}`), error);
            typesNode.properties.error = 'Failed to analyze directory';
        }
        return typesNode;
    }
    /**
     * Analyze the utils directory if it exists
     */
    async analyzeUtils() {
        const utilsNode = {
            id: 'utils',
            label: 'Utilities',
            children: [],
            properties: {
                type: 'component',
                description: 'Utility functions and helpers',
            },
        };
        const utilsDir = path.join(this.projectRoot, 'src', 'utils');
        try {
            const files = await fs.readdir(utilsDir);
            const utilFiles = files.filter((file) => file.endsWith('.ts') && !file.endsWith('.test.ts'));
            for (const file of utilFiles) {
                const filePath = path.join(utilsDir, file);
                const fileContent = await fs.readFile(filePath, 'utf-8');
                // Extract util name from file name
                const utilName = path.basename(file, '.ts');
                // Analyze the utility implementation
                const utilNode = {
                    id: `util_${utilName}`,
                    label: utilName,
                    properties: {
                        fileName: file,
                        hasTesting: files.includes(`${utilName}.test.ts`) ? 'yes' : 'no',
                    },
                };
                // Extract function definitions using simple regex
                const functionMatches = fileContent.match(/function\s+\w+\([^)]*\)/g) || [];
                const arrowFunctionMatches = fileContent.match(/const\s+\w+\s+=\s+(\([^)]*\)|[^=]+)\s+=>/g) || [];
                if (functionMatches.length > 0 || arrowFunctionMatches.length > 0) {
                    utilNode.properties.functionCount = String(functionMatches.length + arrowFunctionMatches.length);
                }
                utilsNode.children.push(utilNode);
            }
        }
        catch (error) {
            console.warn(chalk_1.default.yellow(`Could not analyze utils directory: ${utilsDir}`), error);
            utilsNode.properties.error = 'Directory may not exist or other error occurred';
        }
        return utilsNode;
    }
    /**
     * Analyze dependencies between components
     */
    async analyzeDependencies(rootNode) {
        console.log(chalk_1.default.blue('🔗 Analyzing component dependencies...'));
        // This is a simplified implementation
        // For a production system, you would want to use a proper dependency graph analysis tool
        // For now, we'll add some placeholder notes
        rootNode.notes =
            'Dependencies are analyzed based on import statements between files. ' +
                'A more detailed analysis would use a proper dependency graph tool.';
    }
    /**
     * Save the mindmap as a markdown file
     */
    async saveAsMD(mindmapData) {
        console.log(chalk_1.default.blue('📝 Generating markdown mindmap...'));
        const filename = `architecture-mindmap-${this.today}.md`;
        const filePath = path.join(this.outputDir, filename);
        let markdown = '# T2P Architecture Mindmap\n\n';
        markdown += `Generated: ${this.today}\n\n`;
        // Add properties of the root node
        if (mindmapData.properties) {
            markdown += '## Project Overview\n\n';
            for (const [key, value] of Object.entries(mindmapData.properties)) {
                markdown += `- **${key}**: ${value}\n`;
            }
            markdown += '\n';
        }
        // Add each major component
        for (const component of mindmapData.children || []) {
            markdown += `## ${component.label}\n\n`;
            if (component.properties?.description) {
                markdown += `${component.properties.description}\n\n`;
            }
            // Add child items for the component
            for (const child of component.children || []) {
                markdown += `### ${child.label}\n\n`;
                if (child.properties) {
                    for (const [key, value] of Object.entries(child.properties)) {
                        markdown += `- **${key}**: ${value}\n`;
                    }
                    markdown += '\n';
                }
                if (child.notes) {
                    markdown += `${child.notes}\n\n`;
                }
            }
        }
        // Add any notes from the root node
        if (mindmapData.notes) {
            markdown += '## Notes\n\n';
            markdown += `${mindmapData.notes}\n\n`;
        }
        await fs.writeFile(filePath, markdown, 'utf-8');
        console.log(chalk_1.default.green(`✅ Markdown mindmap saved to: ${filePath}`));
    }
    /**
     * Save the mindmap as a mermaid diagram
     */
    async saveAsMermaid(mindmapData) {
        console.log(chalk_1.default.blue('🔄 Generating mermaid diagram...'));
        const filename = `architecture-mindmap-${this.today}.mermaid`;
        const filePath = path.join(this.outputDir, filename);
        let mermaid = 'mindmap\n';
        mermaid += `  root(${mindmapData.label})\n`;
        // Add each major component
        for (const component of mindmapData.children || []) {
            mermaid += `    ${component.id}[${component.label}]\n`;
            // Add child items for the component
            for (const child of component.children || []) {
                mermaid += `      ${component.id} --> ${child.id}(${child.label})\n`;
            }
        }
        await fs.writeFile(filePath, mermaid, 'utf-8');
        console.log(chalk_1.default.green(`✅ Mermaid diagram saved to: ${filePath}`));
    }
    /**
     * Generate recommendations from the LLM based on the architecture
     */
    async generateRecommendations(mindmapData) {
        console.log(chalk_1.default.blue('🧠 Generating expert recommendations...'));
        const filename = `architecture-recommendations-${this.today}.md`;
        const filePath = path.join(this.outputDir, filename);
        try {
            // Prepare the context for the LLM
            const context = JSON.stringify(mindmapData, null, 2);
            // Call the LLM middleware to get recommendations
            const llmResponse = await this.llmMiddleware.getArchitectureRecommendations(context);
            // Format the recommendations
            let markdown = '# Architecture Recommendations\n\n';
            markdown += `Generated: ${this.today}\n\n`;
            markdown += '## Overview\n\n';
            markdown += `${llmResponse.overview}\n\n`;
            markdown += '## Recommendations\n\n';
            for (let i = 0; i < llmResponse.recommendations.length; i++) {
                const rec = llmResponse.recommendations[i];
                markdown += `### ${i + 1}. ${rec.title}\n\n`;
                markdown += `${rec.description}\n\n`;
                if (rec.implementation) {
                    markdown += '**Implementation Guide:**\n\n';
                    markdown += '```typescript\n';
                    markdown += rec.implementation;
                    markdown += '\n```\n\n';
                }
                if (rec.benefits && rec.benefits.length > 0) {
                    markdown += '**Benefits:**\n\n';
                    for (const benefit of rec.benefits) {
                        markdown += `- ${benefit}\n`;
                    }
                    markdown += '\n';
                }
            }
            await fs.writeFile(filePath, markdown, 'utf-8');
            console.log(chalk_1.default.green(`✅ Recommendations saved to: ${filePath}`));
        }
        catch (error) {
            console.error(chalk_1.default.red('Failed to generate recommendations:'), error);
            // Create a placeholder file
            let markdown = '# Architecture Recommendations\n\n';
            markdown += `Generated: ${this.today}\n\n`;
            markdown += '## Error\n\n';
            markdown += 'Failed to generate recommendations with LLM. Please try again later.\n\n';
            markdown += '## Manual Review\n\n';
            markdown +=
                'In the meantime, consider reviewing the following aspects of the architecture:\n\n';
            markdown += '1. Component coupling - Are components too tightly coupled?\n';
            markdown += '2. Error handling - Is error handling consistent across the codebase?\n';
            markdown += '3. Test coverage - Are all critical paths covered by tests?\n';
            markdown += '4. Code duplication - Are there opportunities to reduce duplication?\n';
            await fs.writeFile(filePath, markdown, 'utf-8');
            console.log(chalk_1.default.yellow(`⚠️ Placeholder recommendations saved to: ${filePath}`));
        }
    }
}
/**
 * Main function to run the generator
 */
async function main() {
    const generator = new MindmapGenerator();
    try {
        await generator.init();
    }
    catch (error) {
        console.error(chalk_1.default.red('❌ Mindmap generation failed:'), error);
        process.exit(1);
    }
}
// Run the generator
main();
//# sourceMappingURL=generate-mindmap.js.map