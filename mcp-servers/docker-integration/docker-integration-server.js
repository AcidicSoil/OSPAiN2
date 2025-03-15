"use strict";
/**
 * mcp-servers/docker-integration/docker-integration-server.ts
 *
 * Docker Integration MCP Server implementation.
 * Provides container management capabilities through the docker_exec tool.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DockerIntegrationServer = void 0;
const child_process_1 = require("child_process");
const util_1 = require("util");
const mcp_server_1 = require("../shared/mcp-server");
// Promisify exec
const execPromise = (0, util_1.promisify)(child_process_1.exec);
/**
 * Docker Integration Server
 */
class DockerIntegrationServer extends mcp_server_1.MCPServer {
    constructor(config) {
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
    registerDockerExecTool() {
        const parameters = [
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
        const tool = {
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
    async executeTool(request) {
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
        }
        catch (error) {
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
    isCommandAllowed(command) {
        // Extract the main Docker command
        const mainCommand = command.trim().split(' ')[0];
        // Check if the command is in the allowed list
        return this.allowedCommands.has(mainCommand);
    }
    /**
     * Execute a Docker command on a container
     */
    async executeDockerCommand(container, command, timeout) {
        try {
            // Construct the Docker exec command
            const dockerCommand = `docker exec ${container} ${command}`;
            // Execute with timeout
            const { stdout, stderr } = await execPromise(dockerCommand, { timeout });
            // Combine stdout and stderr
            const output = stdout + (stderr ? `\nSTDERR: ${stderr}` : '');
            return { output, exitCode: 0 };
        }
        catch (error) {
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
    async getResource(request) {
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
    async executePrompt(request) {
        // This server doesn't provide prompts
        return {
            id: request.id,
            prompt: request.prompt,
            success: false,
            error: 'Prompts not implemented in Docker Integration Server'
        };
    }
}
exports.DockerIntegrationServer = DockerIntegrationServer;
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
//# sourceMappingURL=docker-integration-server.js.map