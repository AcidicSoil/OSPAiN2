import { ExecSyncOptions } from 'child_process';
/**
 * Class for safely executing terminal commands
 * with handling for common escape sequence issues
 */
export declare class TerminalExecutor {
    /**
     * Execute a terminal command safely
     *
     * @param command The command to execute
     * @param options Options for execSync
     * @returns The command output as a string
     */
    static execute(command: string, options?: ExecSyncOptions): string;
    /**
     * Check if a command would execute successfully
     *
     * @param command The command to validate
     * @returns True if the command is valid
     */
    static validateCommand(command: string): boolean;
}
