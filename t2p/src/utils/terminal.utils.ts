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
  if (!command) return command;

  // Remove [200~ prefix with any potential variations
  // This handles both the standard [200~ and any variations with escape chars
  let sanitized = command.replace(/^\u001b?\[?200~/, '');

  // Remove trailing ~ if present at the end of the command
  sanitized = sanitized.replace(/~+$/, '');

  // Remove other common ANSI escape sequences
  sanitized = sanitized.replace(/\u001b\[\d+m/g, '');
  
  // Remove other potential control sequences that might cause issues
  sanitized = sanitized.replace(/\u001b\[[\d;]*[a-zA-Z]/g, '');

  // Replace any carriage returns that might interfere with command execution
  sanitized = sanitized.replace(/\r\n/g, '\n');

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
  if (!command) return false;
  
  return command.includes('[200~') || 
         command.includes('\u001b') || 
         command.endsWith('~') ||
         /\[\d+[a-zA-Z]/.test(command); // Match any potential control sequence
}
