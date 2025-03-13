import { execSync, ExecSyncOptions } from 'child_process';
import { sanitizeTerminalCommand } from './terminal.utils';

/**
 * Class for safely executing terminal commands
 * with handling for common escape sequence issues
 */
export class TerminalExecutor {
  /**
   * Execute a terminal command safely
   *
   * @param command The command to execute
   * @param options Options for execSync
   * @returns The command output as a string
   */
  static execute(command: string, options?: ExecSyncOptions): string {
    // Sanitize the command
    const sanitizedCommand = sanitizeTerminalCommand(command);
    const wasModified = command !== sanitizedCommand;

    if (wasModified) {
      console.log(`Command was sanitized: "${command}" -> "${sanitizedCommand}"`);
    }

    try {
      // Execute the sanitized command
      const result = execSync(sanitizedCommand, {
        encoding: 'utf8',
        ...options,
      });

      return result.toString();
    } catch (error: any) {
      // Add helpful information about the command and error
      console.error(`Error executing command: ${sanitizedCommand}`);
      console.error(`Original command: ${command}`);
      if (command !== sanitizedCommand) {
        console.error(
          'Command was sanitized before execution because it contained escape sequences'
        );
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
  static validateCommand(command: string): boolean {
    // Basic validation - commands should not be empty after sanitization
    const sanitizedCommand = sanitizeTerminalCommand(command);
    return sanitizedCommand.trim().length > 0;
  }
}
