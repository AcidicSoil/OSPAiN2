#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import figlet from 'figlet';
import boxen from 'boxen';
import cliProgress from 'cli-progress';
import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';

interface ProgressSection {
    name: string;
    percentage: number;
}

const program = new Command();

// ANSI escape codes for status emojis
const STATUS_ICONS = {
    NOT_STARTED: chalk.red('🔴'),
    IN_PROGRESS: chalk.yellow('🟡'),
    BLOCKED: chalk.blue('🔵'),
    COMPLETED: chalk.green('🟢'),
    RECURRING: chalk.white('📌'),
};

async function displayHeader() {
    console.log(
        chalk.cyan(
            figlet.textSync('Ollama Todo', {
                font: 'Standard',
                horizontalLayout: 'full',
            })
        )
    );
}

async function createProgressBar(title: string, percentage: number) {
    const bar = new cliProgress.SingleBar({
        format: `${title} |${chalk.cyan('{bar}')}| {percentage}%`,
        barCompleteChar: '█',
        barIncompleteChar: '░',
        hideCursor: true,
        clearOnComplete: false,
    });

    bar.start(100, 0);
    bar.update(percentage);
    bar.stop();
}

async function displayProgressSections(sections: ProgressSection[]) {
    console.log(
        boxen(chalk.bold('\nProgress Overview'), {
            padding: 1,
            margin: 1,
            borderStyle: 'double',
            borderColor: 'cyan',
        })
    );

    for (const section of sections) {
        await createProgressBar(section.name.padEnd(25), section.percentage);
    }
}

async function displayPriorityStats(todoContent: string) {
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

    console.log(
        boxen(chalk.bold('\nPriority Distribution'), {
            padding: 1,
            margin: 1,
            borderStyle: 'double',
            borderColor: 'yellow',
        })
    );

    const total = Object.values(priorities).reduce((a, b) => a + b, 0);
    for (const [priority, count] of Object.entries(priorities)) {
        const percentage = (count / total) * 100;
        await createProgressBar(`${priority} Tasks`.padEnd(25), percentage);
    }
}

async function displayStatusStats(todoContent: string) {
    const statuses = {
        'Not Started': (todoContent.match(/🔴/g) || []).length,
        'In Progress': (todoContent.match(/🟡/g) || []).length,
        'Blocked': (todoContent.match(/🔵/g) || []).length,
        'Completed': (todoContent.match(/🟢/g) || []).length,
        'Recurring': (todoContent.match(/📌/g) || []).length,
    };

    console.log(
        boxen(chalk.bold('\nStatus Overview'), {
            padding: 1,
            margin: 1,
            borderStyle: 'double',
            borderColor: 'green',
        })
    );

    const total = Object.values(statuses).reduce((a, b) => a + b, 0);
    for (const [status, count] of Object.entries(statuses)) {
        const percentage = (count / total) * 100;
        await createProgressBar(`${status} Tasks`.padEnd(25), percentage);
    }
}

program
    .name('ollama-todo')
    .description('CLI tool for visualizing Ollama ecosystem todo progress')
    .version('1.0.0');

program
    .command('progress')
    .description('Display progress visualization')
    .action(async () => {
        try {
            await displayHeader();

            const todoContent = await fs.readFile(path.join(process.cwd(), 'master-todo.md'), 'utf-8');

            // Extract progress sections from the todo content
            const progressRegex = /- ([^:]+): (\d+)% complete/g;
            const sections: ProgressSection[] = [];
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

        } catch (error) {
            console.error(chalk.red('Error reading todo file:', error.message));
            process.exit(1);
        }
    });

program.parse(); 