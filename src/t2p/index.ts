import { researchCommand } from './commands/research';

interface T2PCommandDefinition {
  description: string;
  usage: string;
  examples: string[];
  handler: (args: string[]) => Promise<void> | void;
}

interface T2PRegistry {
  registerCommand: (name: string, definition: T2PCommandDefinition) => void;
}

/**
 * Register all T2P commands with the registry
 * @param t2p The T2P registry instance
 */
export function registerCommands(t2p: T2PRegistry): void {
  // Register the research command
  t2p.registerCommand('research', {
    description: 'Perform deep research on a topic using ollama-deep-researcher-ts',
    usage: 't2p research "your research topic" [--iterations=3] [--enhance] [--output=./research-results]',
    examples: [
      't2p research "History of artificial intelligence"',
      't2p research "Climate change impacts" --iterations=5 --enhance',
      't2p research "Quantum computing" --output=./my-research'
    ],
    handler: researchCommand
  });
} 