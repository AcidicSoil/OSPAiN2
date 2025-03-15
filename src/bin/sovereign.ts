#!/usr/bin/env node

/**
 * CLI executable entry point
 * 
 * This file is the main executable for the Sovereign AI CLI.
 */

import { runCli } from '../cli';

// Run the CLI with the command-line arguments
runCli(process.argv).catch(error => {
  console.error(`Fatal error: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}); 