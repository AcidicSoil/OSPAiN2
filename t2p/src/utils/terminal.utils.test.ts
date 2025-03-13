import {
  sanitizeTerminalCommand,
  commandNeedsSanitization,
  prepareCommandForExecution,
} from './terminal.utils';

describe('Terminal Utilities', () => {
  describe('sanitizeTerminalCommand', () => {
    it('should remove [200~ prefix from commands', () => {
      const command = '[200~cd /some/directory';
      const sanitized = sanitizeTerminalCommand(command);
      expect(sanitized).toBe('cd /some/directory');
    });

    it('should remove trailing ~ from commands', () => {
      const command = 'ls -la~';
      const sanitized = sanitizeTerminalCommand(command);
      expect(sanitized).toBe('ls -la');
    });

    it('should handle both prefix and suffix in the same command', () => {
      const command = '[200~npm install~';
      const sanitized = sanitizeTerminalCommand(command);
      expect(sanitized).toBe('npm install');
    });

    it('should leave valid commands unchanged', () => {
      const command = 'git clone https://github.com/user/repo.git';
      const sanitized = sanitizeTerminalCommand(command);
      expect(sanitized).toBe(command);
    });

    it('should remove ANSI color escape sequences', () => {
      const command = '\u001b[32mnpm install\u001b[0m';
      const sanitized = sanitizeTerminalCommand(command);
      expect(sanitized).toBe('npm install');
    });
  });

  describe('commandNeedsSanitization', () => {
    it('should return true if command has [200~ prefix', () => {
      const command = '[200~npm install';
      expect(commandNeedsSanitization(command)).toBe(true);
    });

    it('should return true if command has trailing ~', () => {
      const command = 'ls -la~';
      expect(commandNeedsSanitization(command)).toBe(true);
    });

    it('should return false for clean commands', () => {
      const command = 'git status';
      expect(commandNeedsSanitization(command)).toBe(false);
    });
  });

  describe('prepareCommandForExecution', () => {
    it('should sanitize commands that need sanitization', () => {
      const command = '[200~npm install~';
      const prepared = prepareCommandForExecution(command);
      expect(prepared).toBe('npm install');
    });

    it('should return clean commands as-is', () => {
      const command = 'git status';
      const prepared = prepareCommandForExecution(command);
      expect(prepared).toBe(command);
    });
  });
});
