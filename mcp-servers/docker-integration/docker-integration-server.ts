/**
 * mcp-servers/docker-integration/docker-integration-server.ts
 * 
 * Docker Integration MCP Server implementation.
 * Provides container management capabilities through the docker_exec tool.
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import {
    MCPServer,
    MCPServerConfig
} from '../shared/mcp-server';
import {
    MCPTool,
    MCPToolRequest,
    MCPToolResponse,
    MCPResourceRequest,
    MCPResourceResponse,
    MCPPromptRequest,
    MCPPromptResponse,
    MCPToolParameter
} from '../shared/mcp-types';

// Promisify exec
const execPromise = promisify(exec);

/**
 * Docker Integration Server
 */
export class DockerIntegrationServer extends MCPServer {
    private allowedCommands: Set<string>;

    constructor(config: MCPServerConfig & { allowedCommands?: string[] }) {
        super(config);

        // Set up allowed commands for security
        this.allowedCommands = new Set(config.allowedCommands || [
            'ls', 'ps', 'exec', 'logs', 'inspect', 'stats',
            'top', 'port', 'diff', 'events', 'images', 'info',
            'network', 'version', 'volume'
        ]);

        // Register the docker_exec tool
        this.registerDockerExecTool();

        // Log initialization
        console.log(`[${this.name}] Docker Integration Server initialized`);
        console.log(`[${this.name}] Allowed commands: ${Array.from(this.allowedCommands).join(', ')}`);
    }

    /**
     * Register the docker_exec tool
     */
    private registerDockerExecTool(): void {
        const parameters: MCPToolParameter[] = [
            {
                name: 'container',
                type: 'string',
                description: 'Container ID or name',
                required: true
            },
            {
                name: 'command',
                type: 'string',
                description: 'Command to execute',
                required: true
            },
            {
                name: 'timeout',
                type: 'number',
                description: 'Command timeout in milliseconds',
                default: 10000
            }
        ];

        const tool: MCPTool = {
            name: 'docker_exec',
            description: 'Executes a command in a running Docker container',
            parameters,
            output: {
                type: 'string',
                description: 'Command output'
            }
        };

        this.registerTool(tool);
    }

    /**
     * Execute a tool
     */
    protected async executeTool(request: MCPToolRequest): Promise<MCPToolResponse> {
        const { id, tool, parameters } = request;

        if (tool !== 'docker_exec') {
            return {
                id,
                tool,
                success: false,
                error: `Tool '${tool}' not supported by Docker Integration Server`
            };
        }

        try {
            const { container, command, timeout = 10000 } = parameters;

            if (!container) {
                return {
                    id,
                    tool,
                    success: false,
                    error: 'Missing required parameter: container'
                };
            }

            if (!command) {
                return {
                    id,
                    tool,
                    success: false,
                    error: 'Missing required parameter: command'
                };
            }

            // Validate the command for security
            if (!this.isCommandAllowed(command)) {
                return {
                    id,
                    tool,
                    success: false,
                    error: 'Command not allowed for security reasons'
                };
            }

            // Execute the command with the specified container
            const result = await this.executeDockerCommand(container, command, timeout);

            return {
                id,
                tool,
                success: true,
                result: result.output,
                metadata: {
                    container,
                    command,
                    exit_code: result.exitCode
                }
            };
        } catch (error) {
            console.error(`[${this.name}] Docker exec error:`, error);
            return {
                id,
                tool,
                success: false,
                error: error.message || 'Failed to execute Docker command'
            };
        }
    }

    /**
     * Check if a command is allowed for security
     */
    private isCommandAllowed(command: string): boolean {
        // Extract the main Docker command
        const mainCommand = command.trim().split(' ')[0];

        // Check if the command is in the allowed list
        return this.allowedCommands.has(mainCommand);
    }

    /**
     * Execute a Docker command on a container
     */
    private async executeDockerCommand(container: string, command: string, timeout: number): Promise<{ output: string, exitCode: number }> {
        try {
            // Construct the Docker exec command
            const dockerCommand = `docker exec ${container} ${command}`;

            // Execute with timeout
            const { stdout, stderr } = await execPromise(dockerCommand, { timeout });

            // Combine stdout and stderr
            const output = stdout + (stderr ? `\nSTDERR: ${stderr}` : '');

            return { output, exitCode: 0 };
        } catch (error) {
            if (error.killed && error.signal === 'SIGTERM') {
                throw new Error(`Command timed out after ${timeout}ms`);
            }

            return {
                output: error.stderr || error.message,
                exitCode: error.code || 1
            };
        }
    }

    /**
     * Get a resource
     */
    protected async getResource(request: MCPResourceRequest): Promise<MCPResourceResponse> {
        // This server doesn't provide resources
        return {
            id: request.id,
            resource: request.resource,
            success: false,
            error: 'Resources not implemented in Docker Integration Server'
        };
    }

    /**
     * Execute a prompt
     */
    protected async executePrompt(request: MCPPromptRequest): Promise<MCPPromptResponse> {
        // This server doesn't provide prompts
        return {
            id: request.id,
            prompt: request.prompt,
            success: false,
            error: 'Prompts not implemented in Docker Integration Server'
        };
    }
}

/**
 * Start the server if run directly
 */
if (require.main === module) {
    const port = parseInt(process.env.DOCKER_INTEGRATION_PORT || '3002', 10);

    const server = new DockerIntegrationServer({
        name: 'Docker Integration',
        port,
        version: '1.0.0',
        description: 'MCP server for Docker container interactions',
        verbose: process.env.VERBOSE === 'true',
        allowedCommands: process.env.ALLOWED_DOCKER_COMMANDS ?
            process.env.ALLOWED_DOCKER_COMMANDS.split(',') : undefined
    });

    server.start();
} 