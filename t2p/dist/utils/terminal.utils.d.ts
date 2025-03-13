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
export declare function sanitizeTerminalCommand(command: string): string;
/**
 * Safely execute a command by ensuring it doesn't contain problematic
 * escape sequences that would cause execution to fail
 */
export declare function prepareCommandForExecution(command: string): string;
/**
 * Checks if a command appears to have terminal escape sequences
 * that need to be sanitized
 */
export declare function commandNeedsSanitization(command: string): boolean;
