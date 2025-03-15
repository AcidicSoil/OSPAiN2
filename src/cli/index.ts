/**
 * CLI Entry Point
 * 
 * Configures and exports the command-line interface for the Sovereign AI ecosystem.
 */

import { Command } from 'commander';
import { configureRuleTypeCommand } from './commands/ruleType';

/**
 * Creates and configures the CLI program
 * 
 * @returns The configured commander program
 */
export function createCli(): Command {
  const program = new Command()
    .name('sovereign')
    .description('Sovereign AI Ecosystem CLI')
    .version('1.0.0');

  // Configure commands
  configureRuleTypeCommand(program);

  // Add more commands here as they are implemented
  
  return program;
}

/**
 * Runs the CLI with the given arguments
 * 
 * @param args Command-line arguments (typically process.argv)
 */
export async function runCli(args: string[]): Promise<void> {
  const program = createCli();
  await program.parseAsync(args);
}

// Allow direct execution
if (require.main === module) {
  runCli(process.argv).catch(error => {
    console.error(`Fatal error: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  });
} 