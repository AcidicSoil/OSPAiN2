import { execSync, ExecSyncOptions } from 'child_process';
import { sanitizeTerminalCommand, commandNeedsSanitization } from './terminal.utils';

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
    if (!command || command.trim() === '') {
      throw new Error('Cannot execute empty command');
    }

    // Log the original command for debugging purposes
    console.log(`[Terminal] Original command: ${JSON.stringify(command)}`);

    // Sanitize the command
    const sanitizedCommand = sanitizeTerminalCommand(command);
    const wasModified = command !== sanitizedCommand;

    if (wasModified) {
      // Log the before/after comparison for debugging
      console.log(`[Terminal] Command sanitized: 
        Original: ${JSON.stringify(command)}
        Sanitized: ${JSON.stringify(sanitizedCommand)}
      `);
    }

    try {
      // For debugging - show if command needs sanitization
      if (commandNeedsSanitization(command)) {
        console.log('[Terminal] Command needed sanitization due to control sequences');
      }

      // Execute the sanitized command
      const result = execSync(sanitizedCommand, {
        encoding: 'utf8',
        ...options,
      });

      return result.toString();
    } catch (error: any) {
      // Add helpful information about the command and error
      console.error(`[Terminal Error] Failed to execute command: ${sanitizedCommand}`);
      console.error(`[Terminal Error] Original command: ${command}`);
      
      if (command !== sanitizedCommand) {
        console.error(
          '[Terminal Error] Command was sanitized before execution because it contained escape sequences'
        );
      }

      // Display the error in a more readable format
      console.error('[Terminal Error] Details:', {
        message: error.message,
        code: error.code,
        signal: error.signal,
        cmd: error.cmd
      });

      // Provide guidance for common errors
      if (error.message && error.message.includes('command not found')) {
        console.error('[Terminal Error] Hint: This could be due to the command not being installed or not in PATH');
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

  /**
   * Wraps a command in quotes if it contains spaces or special characters
   * that might cause issues in the shell
   * 
   * @param command Command to wrap safely
   * @returns Safely quoted command
   */
  static safeQuote(command: string): string {
    // Sanitize first
    const sanitized = sanitizeTerminalCommand(command);
    
    // If it contains spaces or shell special chars, wrap in quotes
    if (/[\s&|<>;"'`()]/.test(sanitized)) {
      // Escape any existing double quotes
      const escaped = sanitized.replace(/"/g, '\\"');
      return `"${escaped}"`;
    }
    
    return sanitized;
  }
}
