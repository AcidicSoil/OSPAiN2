"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TerminalExecutor = void 0;
const child_process_1 = require("child_process");
const terminal_utils_1 = require("./terminal.utils");
/**
 * Class for safely executing terminal commands
 * with handling for common escape sequence issues
 */
class TerminalExecutor {
    /**
     * Execute a terminal command safely
     *
     * @param command The command to execute
     * @param options Options for execSync
     * @returns The command output as a string
     */
    static execute(command, options) {
        // Sanitize the command
        const sanitizedCommand = (0, terminal_utils_1.sanitizeTerminalCommand)(command);
        const wasModified = command !== sanitizedCommand;
        if (wasModified) {
            console.log(`Command was sanitized: "${command}" -> "${sanitizedCommand}"`);
        }
        try {
            // Execute the sanitized command
            const result = (0, child_process_1.execSync)(sanitizedCommand, {
                encoding: 'utf8',
                ...options,
            });
            return result.toString();
        }
        catch (error) {
            // Add helpful information about the command and error
            console.error(`Error executing command: ${sanitizedCommand}`);
            console.error(`Original command: ${command}`);
            if (command !== sanitizedCommand) {
                console.error('Command was sanitized before execution because it contained escape sequences');
            }
            throw error;
        }
    }
    /**
     * Check if a command would execute successfully
     *
     * @param command The command to validate
     * @returns True if the command is valid
     */
    static validateCommand(command) {
        // Basic validation - commands should not be empty after sanitization
        const sanitizedCommand = (0, terminal_utils_1.sanitizeTerminalCommand)(command);
        return sanitizedCommand.trim().length > 0;
    }
}
exports.TerminalExecutor = TerminalExecutor;
//# sourceMappingURL=terminal-executor.js.map