#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.progress = void 0;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const figlet_1 = __importDefault(require("figlet"));
const boxen_1 = __importDefault(require("boxen"));
const cli_progress_1 = __importDefault(require("cli-progress"));
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
// Emoji mapping for status indicators
const statusEmojis = {
    NOT_STARTED: chalk_1.default.red('🔴'),
    IN_PROGRESS: chalk_1.default.yellow('🟡'),
    BLOCKED: chalk_1.default.blue('🔵'),
    COMPLETED: chalk_1.default.green('🟢'),
    RECURRING: chalk_1.default.white('📌'),
};
async function displayHeader() {
    console.log(chalk_1.default.cyan(figlet_1.default.textSync('t2p Progress', {
        font: 'Standard',
        horizontalLayout: 'full',
    })));
}
async function createProgressBar(title, percentage) {
    const bar = new cli_progress_1.default.SingleBar({
        format: `${title} |${chalk_1.default.cyan('{bar}')}| {percentage}%`,
        barCompleteChar: '█',
        barIncompleteChar: '░',
        hideCursor: true,
        clearOnComplete: false,
    });
    bar.start(100, 0);
    bar.update(percentage);
    bar.stop();
}
async function displayProgressSections(sections) {
    console.log((0, boxen_1.default)(chalk_1.default.bold('\nProgress Overview'), {
        padding: 1,
        margin: 1,
        borderStyle: 'double',
        borderColor: 'cyan',
    }));
    for (const section of sections) {
        await createProgressBar(section.name.padEnd(25), section.percentage);
    }
}
async function displayPriorityStats(todoContent) {
    const priorities = {
        P1: 0,
        P2: 0,
        P3: 0,
        P4: 0,
        P5: 0,
    };
    const priorityRegex = /\*\*P(\d)\*\*/g;
    let match;
    while ((match = priorityRegex.exec(todoContent)) !== null) {
        const priority = `P${match[1]}`;
        priorities[priority]++;
    }
    console.log((0, boxen_1.default)(chalk_1.default.bold('\nPriority Distribution'), {
        padding: 1,
        margin: 1,
        borderStyle: 'double',
        borderColor: 'yellow',
    }));
    const total = Object.values(priorities).reduce((a, b) => a + b, 0);
    for (const [priority, count] of Object.entries(priorities)) {
        const percentage = (count / total) * 100;
        await createProgressBar(`${priority} Tasks`.padEnd(25), percentage);
    }
}
async function displayStatusStats(todoContent) {
    const statuses = {
        'Not Started': (todoContent.match(/🔴/g) || []).length,
        'In Progress': (todoContent.match(/🟡/g) || []).length,
        Blocked: (todoContent.match(/🔵/g) || []).length,
        Completed: (todoContent.match(/🟢/g) || []).length,
        Recurring: (todoContent.match(/📌/g) || []).length,
    };
    console.log((0, boxen_1.default)(chalk_1.default.bold('\nStatus Overview'), {
        padding: 1,
        margin: 1,
        borderStyle: 'double',
        borderColor: 'green',
    }));
    const total = Object.values(statuses).reduce((a, b) => a + b, 0);
    for (const [status, count] of Object.entries(statuses)) {
        const percentage = (count / total) * 100;
        const statusKey = status.replace(' ', '_').toUpperCase();
        const emoji = statusEmojis[statusKey] || '';
        await createProgressBar(`${emoji} ${status} Tasks`.padEnd(25), percentage);
    }
}
exports.progress = new commander_1.Command('progress')
    .description('Display progress visualization')
    .action(async () => {
    try {
        await displayHeader();
        const todoContent = await promises_1.default.readFile(path_1.default.join(process.cwd(), 'master-todo.md'), 'utf-8');
        // Extract progress sections from the todo content
        const progressRegex = /- ([^:]+): (\d+)% complete/g;
        const sections = [];
        let match;
        while ((match = progressRegex.exec(todoContent)) !== null) {
            sections.push({
                name: match[1],
                percentage: parseInt(match[2], 10),
            });
        }
        await displayProgressSections(sections);
        await displayPriorityStats(todoContent);
        await displayStatusStats(todoContent);
    }
    catch (error) {
        console.error(chalk_1.default.red('Error reading todo file:', error.message));
        process.exit(1);
    }
});
// Allow running as standalone script
if (require.main === module) {
    const program = new commander_1.Command();
    program
        .name('t2p-progress')
        .description('CLI tool for visualizing todo progress')
        .version('1.0.0');
    program.addCommand(exports.progress);
    program.parse();
}
//# sourceMappingURL=progress.js.map