"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNoteCommand = createNoteCommand;
const commander_1 = require("commander");
const inquirer = __importStar(require("inquirer"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const chalk_1 = __importDefault(require("chalk"));
const note_service_1 = require("../services/note.service");
const open_1 = __importDefault(require("open"));
const terminal_executor_1 = require("../utils/terminal-executor");
/**
 * Note management command
 *
 * Provides functionality for creating, editing, listing, and managing notes
 * with optional AI assistance.
 */
function createNoteCommand() {
    const noteService = new note_service_1.NoteService();
    const command = new commander_1.Command('note')
        .description('Manage notes with optional AI assistance')
        .addHelpText('after', `
Examples:
  $ t2p note new "My note title"        Create a new note
  $ t2p note new --ai "Write about TypeScript best practices"  Create a note with AI assistance
  $ t2p note list                       List all notes
  $ t2p note list --tag coding          List notes with specific tag
  $ t2p note view <id>                  View a specific note
  $ t2p note edit <id>                  Edit a note
  $ t2p note delete <id>                Delete a note
  $ t2p note export --format md         Export notes to markdown
  $ t2p note link <note-id> <todo-id>   Link a note to a todo
  $ t2p note web <url>                  Create a note from web page
  $ t2p note summarize <id>             Generate summary of a note
    `);
    // Create new note
    command
        .command('new')
        .alias('add')
        .description('Create a new note')
        .argument('[title]', 'Title of the note')
        .option('-a, --ai <prompt>', 'Generate note content using AI with the given prompt')
        .option('-c, --content <content>', 'Note content')
        .option('-t, --tags <tags>', 'Comma-separated list of tags')
        .option('--category <category>', 'Note category')
        .option('-d, --draft', 'Save as draft')
        .option('-e, --editor', 'Open in external editor after creation')
        .action(async (title, options) => {
        try {
            let noteTitle = title;
            let noteContent = options.content || '';
            let noteTags = options.tags ? options.tags.split(',').map((tag) => tag.trim()) : [];
            let noteCategory = options.category;
            if (options.ai) {
                // AI-assisted note creation
                console.log(chalk_1.default.blue('🧠 Generating note using AI...'));
                const note = await noteService.generateNoteWithAI(options.ai, title);
                if (note) {
                    console.log(chalk_1.default.green('✅ Note created successfully with AI assistance!'));
                    // Display note info
                    displayNote(note);
                    // If editor flag is set, open in external editor
                    if (options.editor) {
                        await openInEditor(note);
                    }
                    return;
                }
                else {
                    console.log(chalk_1.default.yellow('⚠️ AI generation failed. Falling back to manual entry.'));
                }
            }
            // Manual note creation if AI not used or AI failed
            if (!noteTitle) {
                const answers = await inquirer.prompt([
                    {
                        type: 'input',
                        name: 'title',
                        message: 'Enter note title:',
                        validate: (input) => (input.trim().length > 0 ? true : 'Title is required'),
                    },
                ]);
                noteTitle = answers.title;
            }
            if (!noteContent && !options.editor) {
                const answers = await inquirer.prompt([
                    {
                        type: 'editor',
                        name: 'content',
                        message: 'Enter note content (press ESC then Enter when done):',
                        default: noteContent,
                    },
                ]);
                noteContent = answers.content;
            }
            if (noteTags.length === 0) {
                const answers = await inquirer.prompt([
                    {
                        type: 'input',
                        name: 'tags',
                        message: 'Enter tags (comma separated):',
                        default: '',
                    },
                ]);
                noteTags = answers.tags ? answers.tags.split(',').map((tag) => tag.trim()) : [];
            }
            if (!noteCategory) {
                const answers = await inquirer.prompt([
                    {
                        type: 'input',
                        name: 'category',
                        message: 'Enter category (optional):',
                        default: '',
                    },
                ]);
                noteCategory = answers.category || undefined;
            }
            const note = noteService.createNote(noteTitle, noteContent, noteTags, noteCategory, undefined, options.draft || false);
            console.log(chalk_1.default.green('✅ Note created successfully!'));
            // Display note info
            displayNote(note);
            // If editor flag is set, open in external editor
            if (options.editor) {
                await openInEditor(note);
            }
        }
        catch (error) {
            console.error(chalk_1.default.red('Error creating note:'), error);
        }
    });
    // List notes
    command
        .command('list')
        .alias('ls')
        .description('List notes')
        .option('-t, --tag <tag>', 'Filter by tag')
        .option('-c, --category <category>', 'Filter by category')
        .option('-s, --search <term>', 'Search in title and content')
        .option('--todos', 'Show only notes with todo relations')
        .option('--ai', 'Show only AI-generated notes')
        .option('--drafts', 'Show only draft notes')
        .option('-n, --limit <number>', 'Limit number of results', '10')
        .action(async (options) => {
        try {
            // Build filter from options
            const filter = {};
            if (options.tag) {
                filter.tags = [options.tag];
            }
            if (options.category) {
                filter.category = options.category;
            }
            if (options.search) {
                filter.search = options.search;
            }
            if (options.todos) {
                filter.hasTodoRelations = true;
            }
            if (options.ai) {
                filter.isAiGenerated = true;
            }
            if (options.drafts) {
                filter.isDraft = true;
            }
            // Get filtered notes
            const notes = noteService.getNotes(filter);
            if (notes.length === 0) {
                console.log(chalk_1.default.yellow('No notes found matching the criteria.'));
                return;
            }
            // Display limited number of notes
            const limit = parseInt(options.limit, 10) || 10;
            const displayedNotes = notes.slice(0, limit);
            console.log(chalk_1.default.bold(`\nFound ${notes.length} notes${notes.length > limit ? `, showing ${limit}` : ''}:`));
            // Display notes in a list format
            displayedNotes.forEach((note, index) => {
                console.log(chalk_1.default.bold(`\n${index + 1}. ${note.title} `) +
                    chalk_1.default.gray(`(ID: ${note.id.slice(0, 8)}...)`));
                if (note.tags.length > 0) {
                    console.log(chalk_1.default.cyan('   Tags: ') + note.tags.join(', '));
                }
                if (note.category) {
                    console.log(chalk_1.default.magenta('   Category: ') + note.category);
                }
                // Display first 100 chars of content as preview
                const contentPreview = note.content.length > 100 ? `${note.content.slice(0, 100)}...` : note.content;
                console.log(chalk_1.default.gray(`   ${contentPreview.replace(/\n/g, ' ')}`));
                // Show special indicators
                const indicators = [];
                if (note.aiGenerated)
                    indicators.push(chalk_1.default.blue('🧠 AI'));
                if (note.isDraft)
                    indicators.push(chalk_1.default.yellow('📝 Draft'));
                if (note.relatedTodos && note.relatedTodos.length > 0) {
                    indicators.push(chalk_1.default.green(`🔗 ${note.relatedTodos.length} todo(s)`));
                }
                if (indicators.length > 0) {
                    console.log('   ' + indicators.join(' '));
                }
            });
            // Show stats
            if (notes.length > limit) {
                console.log(chalk_1.default.gray(`\n...and ${notes.length - limit} more. Use --limit option to see more.`));
            }
            const stats = noteService.getStats();
            console.log(chalk_1.default.bold(`\nStats: `) +
                chalk_1.default.gray(`${stats.totalItems} total, ${stats.aiGenerated} AI-generated, ${stats.drafts} drafts, ${stats.withTodoRelations} with todo links`));
        }
        catch (error) {
            console.error(chalk_1.default.red('Error listing notes:'), error);
        }
    });
    // View note
    command
        .command('view')
        .alias('show')
        .description('View a note')
        .argument('<id>', 'Note ID or index from list')
        .option('-o, --open', 'Open in default markdown viewer')
        .action(async (id, options) => {
        try {
            // Handle numeric IDs as indexes from list
            const note = resolveNoteId(id, noteService);
            if (!note) {
                console.log(chalk_1.default.red('Note not found.'));
                return;
            }
            // Display full note
            console.log(chalk_1.default.bold.underline(`\n${note.title}`));
            if (note.tags.length > 0) {
                console.log(chalk_1.default.cyan('Tags: ') + note.tags.join(', '));
            }
            if (note.category) {
                console.log(chalk_1.default.magenta('Category: ') + note.category);
            }
            // Show indicators
            const indicators = [];
            if (note.aiGenerated)
                indicators.push(chalk_1.default.blue('🧠 AI Generated'));
            if (note.isDraft)
                indicators.push(chalk_1.default.yellow('📝 Draft'));
            if (note.sourceUrl)
                indicators.push(chalk_1.default.blue(`🔗 Source: ${note.sourceUrl}`));
            if (indicators.length > 0) {
                console.log(indicators.join(' '));
            }
            if (note.relatedTodos && note.relatedTodos.length > 0) {
                console.log(chalk_1.default.green(`🔗 Related Todos: ${note.relatedTodos.join(', ')}`));
            }
            console.log(chalk_1.default.gray(`Created: ${note.createdAt.toLocaleString()}`));
            console.log(chalk_1.default.gray(`Updated: ${note.updatedAt.toLocaleString()}`));
            console.log('\n' + note.content);
            // If open flag is set, open in default markdown viewer
            if (options.open) {
                const tempFilePath = path.join(process.cwd(), 'tmp', `note-${note.id.slice(0, 8)}.md`);
                // Ensure tmp directory exists
                if (!fs.existsSync(path.join(process.cwd(), 'tmp'))) {
                    fs.mkdirSync(path.join(process.cwd(), 'tmp'), { recursive: true });
                }
                // Create temporary markdown file
                const markdown = `# ${note.title}\n\n${note.content}\n\n---\n\nTags: ${note.tags.join(', ')}\n`;
                fs.writeFileSync(tempFilePath, markdown, 'utf-8');
                // Open with default markdown viewer
                await (0, open_1.default)(tempFilePath);
                console.log(chalk_1.default.gray(`Opened in default markdown viewer: ${tempFilePath}`));
            }
        }
        catch (error) {
            console.error(chalk_1.default.red('Error viewing note:'), error);
        }
    });
    // Edit note
    command
        .command('edit')
        .description('Edit a note')
        .argument('<id>', 'Note ID or index from list')
        .option('-t, --title <title>', 'New title')
        .option('-e, --editor', 'Open in external editor')
        .option('--tags <tags>', 'Comma-separated list of tags')
        .option('--category <category>', 'Note category')
        .option('--draft <boolean>', 'Set draft status')
        .action(async (id, options) => {
        try {
            // Handle numeric IDs as indexes from list
            const note = resolveNoteId(id, noteService);
            if (!note) {
                console.log(chalk_1.default.red('Note not found.'));
                return;
            }
            let updates = {};
            // If no specific updates and not opening in editor, prompt for changes
            if (!options.title &&
                !options.tags &&
                !options.category &&
                options.draft === undefined &&
                !options.editor) {
                // Show current note
                console.log(chalk_1.default.bold('Current note:'));
                displayNote(note);
                // Prompt for updates
                const answers = await inquirer.prompt([
                    {
                        type: 'input',
                        name: 'title',
                        message: 'Title:',
                        default: note.title,
                    },
                    {
                        type: 'editor',
                        name: 'content',
                        message: 'Content:',
                        default: note.content,
                    },
                    {
                        type: 'input',
                        name: 'tags',
                        message: 'Tags (comma separated):',
                        default: note.tags.join(', '),
                    },
                    {
                        type: 'input',
                        name: 'category',
                        message: 'Category:',
                        default: note.category || '',
                    },
                    {
                        type: 'confirm',
                        name: 'isDraft',
                        message: 'Is draft?',
                        default: note.isDraft || false,
                    },
                ]);
                updates = {
                    title: answers.title,
                    content: answers.content,
                    tags: answers.tags
                        .split(',')
                        .map((tag) => tag.trim())
                        .filter(Boolean),
                    category: answers.category || undefined,
                    isDraft: answers.isDraft,
                };
            }
            else {
                // Apply specified options
                if (options.title)
                    updates.title = options.title;
                if (options.tags)
                    updates.tags = options.tags.split(',').map((tag) => tag.trim());
                if (options.category !== undefined)
                    updates.category = options.category || undefined;
                if (options.draft !== undefined)
                    updates.isDraft = options.draft === 'true';
                // Open in editor if requested
                if (options.editor) {
                    await openInEditor(note);
                    return;
                }
            }
            // Update the note
            const updatedNote = noteService.updateNote(note.id, updates);
            if (updatedNote) {
                console.log(chalk_1.default.green('✅ Note updated successfully!'));
                displayNote(updatedNote);
            }
            else {
                console.log(chalk_1.default.red('Failed to update note.'));
            }
        }
        catch (error) {
            console.error(chalk_1.default.red('Error editing note:'), error);
        }
    });
    // Delete note
    command
        .command('delete')
        .alias('rm')
        .description('Delete a note')
        .argument('<id>', 'Note ID or index from list')
        .option('-f, --force', 'Skip confirmation')
        .action(async (id, options) => {
        try {
            // Handle numeric IDs as indexes from list
            const note = resolveNoteId(id, noteService);
            if (!note) {
                console.log(chalk_1.default.red('Note not found.'));
                return;
            }
            // Confirm deletion unless force flag is set
            if (!options.force) {
                console.log(chalk_1.default.bold('Note to delete:'));
                displayNote(note);
                const answers = await inquirer.prompt([
                    {
                        type: 'confirm',
                        name: 'confirm',
                        message: 'Are you sure you want to delete this note?',
                        default: false,
                    },
                ]);
                if (!answers.confirm) {
                    console.log(chalk_1.default.yellow('Deletion cancelled.'));
                    return;
                }
            }
            // Delete the note
            const deleted = noteService.deleteNote(note.id);
            if (deleted) {
                console.log(chalk_1.default.green('✅ Note deleted successfully!'));
            }
            else {
                console.log(chalk_1.default.red('Failed to delete note.'));
            }
        }
        catch (error) {
            console.error(chalk_1.default.red('Error deleting note:'), error);
        }
    });
    // Export notes
    command
        .command('export')
        .description('Export notes to a file')
        .option('-f, --format <format>', 'Export format (md, json, html)', 'md')
        .option('-o, --output <path>', 'Output file path')
        .option('-t, --tag <tag>', 'Filter by tag')
        .option('-c, --category <category>', 'Filter by category')
        .option('-s, --search <term>', 'Search in title and content')
        .action(async (options) => {
        try {
            // Determine export format
            const format = options.format.toLowerCase();
            if (!['md', 'json', 'html'].includes(format)) {
                console.log(chalk_1.default.red('Invalid format. Supported formats: md, json, html'));
                return;
            }
            // Determine output path
            let outputPath = options.output;
            if (!outputPath) {
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                outputPath = path.join(process.cwd(), `notes-export-${timestamp}.${format}`);
            }
            // Build filter from options
            const filter = {};
            if (options.tag) {
                filter.tags = [options.tag];
            }
            if (options.category) {
                filter.category = options.category;
            }
            if (options.search) {
                filter.search = options.search;
            }
            // Export notes
            const exportedPath = noteService.exportNotes(format, outputPath, filter);
            if (exportedPath) {
                console.log(chalk_1.default.green(`✅ Notes exported successfully to: ${exportedPath}`));
            }
            else {
                console.log(chalk_1.default.red('Failed to export notes.'));
            }
        }
        catch (error) {
            console.error(chalk_1.default.red('Error exporting notes:'), error);
        }
    });
    // Link note to todo
    command
        .command('link')
        .description('Link a note to one or more todos')
        .argument('<note-id>', 'Note ID or index from list')
        .argument('<todo-ids...>', 'Todo IDs to link (space separated)')
        .action(async (noteId, todoIds) => {
        try {
            // Handle numeric IDs as indexes from list
            const note = resolveNoteId(noteId, noteService);
            if (!note) {
                console.log(chalk_1.default.red('Note not found.'));
                return;
            }
            // Link todos
            const updatedNote = noteService.linkToTodos(note.id, todoIds);
            if (updatedNote) {
                console.log(chalk_1.default.green(`✅ Note linked to ${todoIds.length} todo(s)!`));
                if (updatedNote.relatedTodos) {
                    console.log(chalk_1.default.cyan('Related todos: ') + updatedNote.relatedTodos.join(', '));
                }
            }
            else {
                console.log(chalk_1.default.red('Failed to link note to todos.'));
            }
        }
        catch (error) {
            console.error(chalk_1.default.red('Error linking note to todos:'), error);
        }
    });
    // Unlink note from todo
    command
        .command('unlink')
        .description('Unlink a note from one or more todos')
        .argument('<note-id>', 'Note ID or index from list')
        .argument('<todo-ids...>', 'Todo IDs to unlink (space separated)')
        .action(async (noteId, todoIds) => {
        try {
            // Handle numeric IDs as indexes from list
            const note = resolveNoteId(noteId, noteService);
            if (!note) {
                console.log(chalk_1.default.red('Note not found.'));
                return;
            }
            // Unlink todos
            const updatedNote = noteService.unlinkFromTodos(note.id, todoIds);
            if (updatedNote) {
                console.log(chalk_1.default.green(`✅ Note unlinked from ${todoIds.length} todo(s)!`));
                if (updatedNote.relatedTodos && updatedNote.relatedTodos.length > 0) {
                    console.log(chalk_1.default.cyan('Still linked to: ') + updatedNote.relatedTodos.join(', '));
                }
                else {
                    console.log(chalk_1.default.cyan('Note is not linked to any todos.'));
                }
            }
            else {
                console.log(chalk_1.default.red('Failed to unlink note from todos.'));
            }
        }
        catch (error) {
            console.error(chalk_1.default.red('Error unlinking note from todos:'), error);
        }
    });
    // Create note from web
    command
        .command('web')
        .description('Create a note from a web page')
        .argument('<url>', 'URL of the web page')
        .option('-e, --editor', 'Open in external editor after creation')
        .action(async (url, options) => {
        try {
            console.log(chalk_1.default.blue(`🌐 Creating note from webpage: ${url}`));
            const note = await noteService.createNoteFromWebPage(url);
            if (note) {
                console.log(chalk_1.default.green('✅ Note created successfully from web page!'));
                displayNote(note);
                // If editor flag is set, open in external editor
                if (options.editor) {
                    await openInEditor(note);
                }
            }
            else {
                console.log(chalk_1.default.red('Failed to create note from web page.'));
            }
        }
        catch (error) {
            console.error(chalk_1.default.red('Error creating note from web:'), error);
        }
    });
    // Summarize note
    command
        .command('summarize')
        .description('Generate a summary of a note using AI')
        .argument('<id>', 'Note ID or index from list')
        .option('-l, --length <length>', 'Summary length (short, medium, long)', 'medium')
        .action(async (id, options) => {
        try {
            // Handle numeric IDs as indexes from list
            const note = resolveNoteId(id, noteService);
            if (!note) {
                console.log(chalk_1.default.red('Note not found.'));
                return;
            }
            // Validate length option
            const length = options.length.toLowerCase();
            if (!['short', 'medium', 'long'].includes(length)) {
                console.log(chalk_1.default.red('Invalid length. Supported values: short, medium, long'));
                return;
            }
            console.log(chalk_1.default.blue('🧠 Generating summary...'));
            const summary = await noteService.summarizeNote(note.id, length);
            if (summary) {
                console.log(chalk_1.default.bold.green('\n📝 Summary:'));
                console.log(summary);
            }
            else {
                console.log(chalk_1.default.red('Failed to generate summary.'));
            }
        }
        catch (error) {
            console.error(chalk_1.default.red('Error summarizing note:'), error);
        }
    });
    // Stats command
    command
        .command('stats')
        .description('Show statistics about notes')
        .action(() => {
        try {
            const stats = noteService.getStats();
            console.log(chalk_1.default.bold('\n📊 Notes Statistics:\n'));
            console.log(chalk_1.default.cyan('Total Notes: ') + stats.totalItems);
            console.log(chalk_1.default.cyan('Drafts: ') + stats.drafts);
            console.log(chalk_1.default.cyan('AI Generated: ') + stats.aiGenerated);
            console.log(chalk_1.default.cyan('With Todo Links: ') + stats.withTodoRelations);
            if (Object.keys(stats.byCategory).length > 0) {
                console.log(chalk_1.default.bold('\nBy Category:'));
                Object.entries(stats.byCategory)
                    .sort(([, a], [, b]) => b - a)
                    .forEach(([category, count]) => {
                    console.log(`  ${category}: ${count}`);
                });
            }
            if (Object.keys(stats.byTag).length > 0) {
                console.log(chalk_1.default.bold('\nBy Tag:'));
                Object.entries(stats.byTag)
                    .sort(([, a], [, b]) => b - a)
                    .forEach(([tag, count]) => {
                    console.log(`  ${tag}: ${count}`);
                });
            }
        }
        catch (error) {
            console.error(chalk_1.default.red('Error getting note statistics:'), error);
        }
    });
    return command;
}
/**
 * Helper function to display a note
 */
function displayNote(note) {
    console.log(chalk_1.default.bold(`\nTitle: ${note.title}`));
    console.log(chalk_1.default.cyan('ID: ') + note.id);
    if (note.tags.length > 0) {
        console.log(chalk_1.default.cyan('Tags: ') + note.tags.join(', '));
    }
    if (note.category) {
        console.log(chalk_1.default.cyan('Category: ') + note.category);
    }
    const indicators = [];
    if (note.aiGenerated)
        indicators.push(chalk_1.default.blue('🧠 AI Generated'));
    if (note.isDraft)
        indicators.push(chalk_1.default.yellow('📝 Draft'));
    if (indicators.length > 0) {
        console.log(indicators.join(' '));
    }
    // Display limited content preview
    if (note.content.length > 0) {
        console.log(chalk_1.default.bold('\nContent Preview:'));
        const contentPreview = note.content.length > 200 ? `${note.content.slice(0, 200)}...` : note.content;
        console.log(contentPreview);
    }
}
/**
 * Helper function to open a note in external editor
 */
async function openInEditor(note, noteService) {
    try {
        const tempFilePath = path.join(process.cwd(), 'tmp', `note-${note.id.slice(0, 8)}.md`);
        // Ensure tmp directory exists
        if (!fs.existsSync(path.join(process.cwd(), 'tmp'))) {
            fs.mkdirSync(path.join(process.cwd(), 'tmp'), { recursive: true });
        }
        // Create temporary markdown file
        const markdown = `# ${note.title}\n\n${note.content}\n\n---\n\nTags: ${note.tags.join(', ')}\nCategory: ${note.category || ''}`;
        fs.writeFileSync(tempFilePath, markdown, 'utf-8');
        // Open with system's default editor
        console.log(chalk_1.default.gray(`Opening in external editor: ${tempFilePath}`));
        const editor = process.env.EDITOR || 'code'; // Default to VS Code if EDITOR not set
        terminal_executor_1.TerminalExecutor.execute(`${editor} "${tempFilePath}"`);
        // Wait for user to finish editing
        console.log(chalk_1.default.yellow('Waiting for you to finish editing...'));
        console.log(chalk_1.default.yellow('Press Enter when done to save changes.'));
        await new Promise((resolve) => {
            process.stdin.once('data', (data) => {
                resolve(data);
            });
        });
        // Read the edited content
        const editedContent = fs.readFileSync(tempFilePath, 'utf-8');
        // Parse the edited markdown
        const titleMatch = editedContent.match(/^# (.+)$/m);
        const contentStart = editedContent.indexOf('\n\n');
        const metaStart = editedContent.lastIndexOf('\n\n---\n\n');
        const title = titleMatch ? titleMatch[1] : note.title;
        const content = metaStart > contentStart
            ? editedContent.substring(contentStart + 2, metaStart)
            : editedContent.substring(contentStart + 2);
        // Look for tags in the metadata
        const tagMatch = editedContent.match(/Tags: (.+)$/m);
        const tags = tagMatch ? tagMatch[1].split(',').map((tag) => tag.trim()) : note.tags;
        // Look for category in the metadata
        const categoryMatch = editedContent.match(/Category: (.+)$/m);
        const category = categoryMatch && categoryMatch[1].trim() ? categoryMatch[1].trim() : note.category;
        // If a NoteService was provided, update the note
        if (noteService) {
            const updatedNote = noteService.updateNote(note.id, {
                title,
                content,
                tags,
                category: category || undefined,
            });
            if (updatedNote) {
                console.log(chalk_1.default.green('✅ Note updated successfully with changes from editor!'));
            }
            else {
                console.log(chalk_1.default.red('Failed to update note with changes from editor.'));
            }
        }
    }
    catch (error) {
        console.error(chalk_1.default.red('Error opening note in external editor:'), error);
    }
}
/**
 * Helper function to resolve a note ID, handling numeric indices
 */
function resolveNoteId(id, noteService) {
    // If ID is numeric, treat it as an index from list
    if (/^\d+$/.test(id)) {
        const index = parseInt(id, 10) - 1; // Convert to 0-based index
        const notes = noteService.getNotes();
        if (index >= 0 && index < notes.length) {
            return notes[index];
        }
        return null;
    }
    // Otherwise, treat as UUID
    return noteService.getNote(id);
}
//# sourceMappingURL=note.js.map