"use strict";
/**
 * CLI Entry Point
 *
 * Configures and exports the command-line interface for the Sovereign AI ecosystem.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCli = createCli;
exports.runCli = runCli;
const commander_1 = require("commander");
const ruleType_1 = require("./commands/ruleType");
/**
 * Creates and configures the CLI program
 *
 * @returns The configured commander program
 */
function createCli() {
    const program = new commander_1.Command()
        .name('sovereign')
        .description('Sovereign AI Ecosystem CLI')
        .version('1.0.0');
    // Configure commands
    (0, ruleType_1.configureRuleTypeCommand)(program);
    // Add more commands here as they are implemented
    return program;
}
/**
 * Runs the CLI with the given arguments
 *
 * @param args Command-line arguments (typically process.argv)
 */
async function runCli(args) {
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
//# sourceMappingURL=index.js.map