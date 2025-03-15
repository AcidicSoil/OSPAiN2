#!/usr/bin/env node
"use strict";
/**
 * CLI executable entry point
 *
 * This file is the main executable for the Sovereign AI CLI.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const cli_1 = require("../cli");
// Run the CLI with the command-line arguments
(0, cli_1.runCli)(process.argv).catch(error => {
    console.error(`Fatal error: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
});
//# sourceMappingURL=sovereign.js.map