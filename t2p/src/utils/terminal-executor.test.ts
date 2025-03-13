import { TerminalExecutor } from './terminal-executor';
import { execSync } from 'child_process';

// Mock the execSync function
jest.mock('child_process', () => ({
  execSync: jest.fn(),
}));

describe('TerminalExecutor', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Set up a default mock implementation
    (execSync as jest.Mock).mockImplementation((cmd) => {
      return `Executed: ${cmd}`;
    });
  });

  describe('execute', () => {
    it('should sanitize commands before execution', () => {
      // Command with escape sequences
      const command = '[200~echo "Hello World"~';

      // Execute the command
      TerminalExecutor.execute(command);

      // Verify that execSync was called with the sanitized command
      expect(execSync).toHaveBeenCalledWith('echo "Hello World"', expect.anything());
    });

    it('should pass normal commands through unchanged', () => {
      const command = 'git status';

      TerminalExecutor.execute(command);

      expect(execSync).toHaveBeenCalledWith(command, expect.anything());
    });

    it('should pass options to execSync', () => {
      const command = 'ls -la';
      const options = { cwd: '/some/directory', maxBuffer: 1024 * 1024 };

      TerminalExecutor.execute(command, options);

      expect(execSync).toHaveBeenCalledWith(command, {
        encoding: 'utf8',
        cwd: '/some/directory',
        maxBuffer: 1024 * 1024,
      });
    });

    it('should throw an error with detailed information when execution fails', () => {
      const command = 'invalid-command';

      // Make execSync throw an error
      (execSync as jest.Mock).mockImplementation(() => {
        throw new Error('Command failed');
      });

      // Mock console.error to prevent output during tests
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Execute should re-throw the error
      expect(() => TerminalExecutor.execute(command)).toThrow('Command failed');

      // Verify console.error was called with appropriate information
      expect(consoleSpy).toHaveBeenCalledWith(`Error executing command: ${command}`);
      expect(consoleSpy).toHaveBeenCalledWith(`Original command: ${command}`);

      // Restore console.error
      consoleSpy.mockRestore();
    });
  });

  describe('validateCommand', () => {
    it('should return true for valid commands', () => {
      expect(TerminalExecutor.validateCommand('ls -la')).toBe(true);
      expect(TerminalExecutor.validateCommand('git status')).toBe(true);
    });

    it('should return true for commands with escape sequences', () => {
      expect(TerminalExecutor.validateCommand('[200~git status')).toBe(true);
      expect(TerminalExecutor.validateCommand('npm install~')).toBe(true);
    });

    it('should return false for empty commands', () => {
      expect(TerminalExecutor.validateCommand('')).toBe(false);
      expect(TerminalExecutor.validateCommand('  ')).toBe(false);
    });

    it('should return false for commands that are just escape sequences', () => {
      expect(TerminalExecutor.validateCommand('[200~~')).toBe(false);
    });
  });
});
