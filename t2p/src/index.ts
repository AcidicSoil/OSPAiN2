#!/usr/bin/env node

import { Command } from 'commander';
import { todo } from './commands/todo';
import { progress } from './progress';
import { createNoteCommand } from './commands/note';

const program = new Command();

program
  .name('t2p')
  .description('t2p - Tag and Todo management CLI tool for the Ollama ecosystem')
  .version('1.0.0');

program.addCommand(todo);
program.addCommand(progress);
program.addCommand(createNoteCommand());

program.parse();
