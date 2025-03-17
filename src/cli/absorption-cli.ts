#!/usr/bin/env node
/**
 * Component Absorption CLI
 * 
 * This CLI tool provides commands for working with the component absorption system.
 */

import chalk from 'chalk';
import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { componentAbsorber } from '../tools/absorption/componentAbsorber';
import {
    AbsorptionStatus,
    ComponentAdaptation,
    ComponentEvaluation,
    ComponentEvaluationStatus
} from '../types/absorption';

const program = new Command();

program
  .name('absorption-cli')
  .description('OSPAiN2 Component Absorption CLI')
  .version('1.0.0');

// List command
program
  .command('list')
  .description('List all component absorptions')
  .option('-s, --status <status>', 'Filter by status')
  .action((options) => {
    try {
      let absorptions;
      if (options.status) {
        if (!Object.values(AbsorptionStatus).includes(options.status)) {
          console.error(chalk.red(`Invalid status: ${options.status}`));
          console.log(chalk.yellow(`Valid statuses: ${Object.values(AbsorptionStatus).join(', ')}`));
          process.exit(1);
        }
        absorptions = componentAbsorber.getAbsorptionsByStatus(options.status as AbsorptionStatus);
      } else {
        absorptions = componentAbsorber.getAllAbsorptions();
      }

      if (absorptions.length === 0) {
        console.log(chalk.yellow('No absorptions found.'));
        return;
      }

      console.log(chalk.bold('Component Absorptions:'));
      absorptions.forEach((absorption) => {
        const statusColor = {
          [AbsorptionStatus.NOT_STARTED]: chalk.gray,
          [AbsorptionStatus.IN_PROGRESS]: chalk.blue,
          [AbsorptionStatus.COMPLETED]: chalk.green,
          [AbsorptionStatus.FAILED]: chalk.red,
        }[absorption.status];

        console.log(`${chalk.bold(absorption.componentName)} (${chalk.dim(absorption.componentId)})`);
        console.log(`  Status: ${statusColor(absorption.status)}`);
        console.log(`  Source: ${chalk.dim(absorption.sourceRepo)}`);
        console.log(`  Target: ${chalk.dim(absorption.targetLocation)}`);
        console.log(`  Started: ${chalk.dim(absorption.startTime.toISOString())}`);
        if (absorption.completionTime) {
          console.log(`  Completed: ${chalk.dim(absorption.completionTime.toISOString())}`);
        }
        console.log(`  Adaptations: ${chalk.dim(absorption.adaptations.length)}`);
        console.log();
      });

      // Print summary
      const summary = componentAbsorber.getAbsorptionSummary();
      console.log(chalk.bold('Summary:'));
      console.log(`  Total: ${chalk.bold(summary.total)}`);
      console.log(`  In Progress: ${chalk.blue(summary.inProgress)}`);
      console.log(`  Completed: ${chalk.green(summary.completed)}`);
      console.log(`  Failed: ${chalk.red(summary.failed)}`);
    } catch (error) {
      console.error(chalk.red(`Error: ${(error as Error).message}`));
      process.exit(1);
    }
  });

// Start absorption command
program
  .command('start')
  .description('Start a component absorption process')
  .requiredOption('-c, --component <name>', 'Component name')
  .requiredOption('-s, --source <url>', 'Source repository URL')
  .requiredOption('-t, --target <path>', 'Target location in the codebase')
  .action((options) => {
    try {
      const componentId = uuidv4();
      const evaluation: ComponentEvaluation = {
        componentId,
        componentName: options.component,
        sourceRepo: options.source,
        status: ComponentEvaluationStatus.ABSORBED,
        evaluationDate: new Date(),
      };

      const absorption = componentAbsorber.startAbsorption(evaluation, options.target);
      
      console.log(chalk.green(`Started absorption for ${chalk.bold(options.component)}`));
      console.log(`Component ID: ${chalk.dim(componentId)}`);
      console.log(`Status: ${chalk.blue(absorption.status)}`);
      console.log(`Use this ID in other commands to reference this absorption.`);
    } catch (error) {
      console.error(chalk.red(`Error: ${(error as Error).message}`));
      process.exit(1);
    }
  });

// Record adaptation command
program
  .command('adapt')
  .description('Record an adaptation made during absorption')
  .requiredOption('-i, --id <componentId>', 'Component ID')
  .requiredOption('-t, --type <type>', 'Adaptation type (rename, modify, dependency, interface, style, other)')
  .requiredOption('-d, --description <description>', 'Adaptation description')
  .option('-b, --before <before>', 'State before adaptation')
  .option('-a, --after <after>', 'State after adaptation')
  .requiredOption('-r, --reason <reason>', 'Reason for adaptation')
  .action((options) => {
    try {
      const validTypes = ['rename', 'modify', 'dependency', 'interface', 'style', 'other'];
      if (!validTypes.includes(options.type)) {
        console.error(chalk.red(`Invalid adaptation type: ${options.type}`));
        console.log(chalk.yellow(`Valid types: ${validTypes.join(', ')}`));
        process.exit(1);
      }

      const adaptation: ComponentAdaptation = {
        type: options.type as any,
        description: options.description,
        before: options.before,
        after: options.after,
        reason: options.reason,
      };

      componentAbsorber.recordAdaptation(options.id, adaptation);
      console.log(chalk.green(`Recorded adaptation for component ${chalk.bold(options.id)}`));
    } catch (error) {
      console.error(chalk.red(`Error: ${(error as Error).message}`));
      process.exit(1);
    }
  });

// Log message command
program
  .command('log')
  .description('Log a message to the absorption process')
  .requiredOption('-i, --id <componentId>', 'Component ID')
  .requiredOption('-m, --message <message>', 'Log message')
  .action((options) => {
    try {
      componentAbsorber.logAbsorptionMessage(options.id, options.message);
      console.log(chalk.green(`Logged message for component ${chalk.bold(options.id)}`));
    } catch (error) {
      console.error(chalk.red(`Error: ${(error as Error).message}`));
      process.exit(1);
    }
  });

// Complete absorption command
program
  .command('complete')
  .description('Complete an absorption process')
  .requiredOption('-i, --id <componentId>', 'Component ID')
  .option('-f, --fail', 'Mark as failed')
  .option('-e, --error <message>', 'Error message (if failed)')
  .action((options) => {
    try {
      const success = !options.fail;
      const absorption = componentAbsorber.completeAbsorption(options.id, success, options.error);
      
      const statusColor = success ? chalk.green : chalk.red;
      const statusText = success ? 'completed successfully' : 'failed';
      
      console.log(`Absorption ${statusColor(statusText)} for component ${chalk.bold(absorption.componentName)}`);
      if (options.error) {
        console.log(`Error: ${chalk.red(options.error)}`);
      }
    } catch (error) {
      console.error(chalk.red(`Error: ${(error as Error).message}`));
      process.exit(1);
    }
  });

// Show absorption details command
program
  .command('show')
  .description('Show details of an absorption process')
  .requiredOption('-i, --id <componentId>', 'Component ID')
  .option('-l, --logs', 'Show logs')
  .option('-a, --adaptations', 'Show adaptations')
  .action((options) => {
    try {
      const absorption = componentAbsorber.getAbsorption(options.id);
      if (!absorption) {
        console.error(chalk.red(`Absorption not found for component ID: ${options.id}`));
        process.exit(1);
      }

      const statusColor = {
        [AbsorptionStatus.NOT_STARTED]: chalk.gray,
        [AbsorptionStatus.IN_PROGRESS]: chalk.blue,
        [AbsorptionStatus.COMPLETED]: chalk.green,
        [AbsorptionStatus.FAILED]: chalk.red,
      }[absorption.status];

      console.log(chalk.bold(`Component: ${absorption.componentName}`));
      console.log(`ID: ${chalk.dim(absorption.componentId)}`);
      console.log(`Status: ${statusColor(absorption.status)}`);
      console.log(`Source: ${chalk.dim(absorption.sourceRepo)}`);
      console.log(`Target: ${chalk.dim(absorption.targetLocation)}`);
      console.log(`Started: ${chalk.dim(absorption.startTime.toISOString())}`);
      if (absorption.completionTime) {
        console.log(`Completed: ${chalk.dim(absorption.completionTime.toISOString())}`);
      }
      
      if (options.logs) {
        console.log();
        console.log(chalk.bold('Logs:'));
        absorption.absorptionLogs.forEach((log, index) => {
          console.log(`${index + 1}. ${log}`);
        });
      }
      
      if (options.adaptations) {
        console.log();
        console.log(chalk.bold('Adaptations:'));
        if (absorption.adaptations.length === 0) {
          console.log(chalk.yellow('No adaptations recorded.'));
        } else {
          absorption.adaptations.forEach((adaptation, index) => {
            console.log(`${index + 1}. ${chalk.bold(adaptation.type)}: ${adaptation.description}`);
            console.log(`   Reason: ${adaptation.reason}`);
            if (adaptation.before) {
              console.log(`   Before: ${adaptation.before}`);
            }
            if (adaptation.after) {
              console.log(`   After: ${adaptation.after}`);
            }
          });
        }
      }
    } catch (error) {
      console.error(chalk.red(`Error: ${(error as Error).message}`));
      process.exit(1);
    }
  });

// Export command to save absorptions to file
program
  .command('export')
  .description('Export absorptions data to a file')
  .requiredOption('-o, --output <file>', 'Output file path')
  .option('-i, --id <componentId>', 'Export specific component ID')
  .action((options) => {
    try {
      let data;
      if (options.id) {
        const absorption = componentAbsorber.getAbsorption(options.id);
        if (!absorption) {
          console.error(chalk.red(`Absorption not found for component ID: ${options.id}`));
          process.exit(1);
        }
        data = absorption;
      } else {
        data = {
          absorptions: componentAbsorber.getAllAbsorptions(),
          summary: componentAbsorber.getAbsorptionSummary(),
          exportDate: new Date(),
        };
      }

      const outputPath = path.resolve(options.output);
      fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
      console.log(chalk.green(`Exported data to ${chalk.bold(outputPath)}`));
    } catch (error) {
      console.error(chalk.red(`Error: ${(error as Error).message}`));
      process.exit(1);
    }
  });

program.parse(process.argv); 