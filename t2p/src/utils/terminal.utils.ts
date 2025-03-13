/**
 * Terminal Utilities
 *
 * Helper functions for terminal command handling and sanitization
 */

/**
 * Sanitizes a terminal command by removing ANSI escape sequences
 * and bracket-wrapped terminal control sequences
 *
 * Specifically handles the [200~ prefix and trailing ~ that can appear
 * in terminal commands, which causes them to fail.
 */
export function sanitizeTerminalCommand(command: string): string {
  // Remove [200~ prefix if present
  let sanitized = command.replace(/^\[200~/, '');

  // Remove trailing ~ if present at the end of the command
  sanitized = sanitized.replace(/~$/, '');

  // Remove other common ANSI escape sequences
  sanitized = sanitized.replace(/\u001b\[\d+m/g, '');

  return sanitized;
}

/**
 * Safely execute a command by ensuring it doesn't contain problematic
 * escape sequences that would cause execution to fail
 */
export function prepareCommandForExecution(command: string): string {
  return sanitizeTerminalCommand(command);
}

/**
 * Checks if a command appears to have terminal escape sequences
 * that need to be sanitized
 */
export function commandNeedsSanitization(command: string): boolean {
  return command.startsWith('[200~') || command.endsWith('~');
}
