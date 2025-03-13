#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const todo_1 = require("./commands/todo");
const progress_1 = require("./progress");
const note_1 = require("./commands/note");
const program = new commander_1.Command();
program
    .name('t2p')
    .description('t2p - Tag and Todo management CLI tool for the Ollama ecosystem')
    .version('1.0.0');
program.addCommand(todo_1.todo);
program.addCommand(progress_1.progress);
program.addCommand((0, note_1.createNoteCommand)());
program.parse();
//# sourceMappingURL=index.js.map