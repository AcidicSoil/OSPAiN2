"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.todo = void 0;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const inquirer_1 = __importDefault(require("inquirer"));
const todo_service_1 = require("../services/todo.service");
const llm_middleware_service_1 = require("../services/llm-middleware.service");
const todoService = new todo_service_1.TodoService();
const llmMiddleware = new llm_middleware_service_1.LLMMiddlewareService();
exports.todo = new commander_1.Command('todo')
    .description('Manage todo items')
    .hook('preAction', async () => {
    await todoService.init();
});
exports.todo
    .command('add')
    .description('Add a new todo item')
    .option('-p, --priority <number>', 'Priority (1-5)', '3')
    .option('-s, --status <status>', 'Status (not-started, in-progress, blocked, completed, recurring)', 'not-started')
    .option('-h, --horizon <horizon>', 'Horizon (H1, H2, H3)', 'H1')
    .option('-t, --tags <tags>', 'Comma-separated tags')
    .option('-c, --category <category>', 'Category')
    .option('--no-llm', 'Skip LLM enhancement')
    .option('--remix-mode <mode>', 'Remix mode (simple, full)', 'simple')
    .action(async (options) => {
    if (options.llm) {
        // LLM-enhanced flow
        const answers = await inquirer_1.default.prompt([
            {
                type: 'input',
                name: 'input',
                message: 'Enter todo description:',
                validate: (input) => input.length > 0 || 'Description is required',
            },
        ]);
        try {
            console.log(chalk_1.default.blue('⚡ Processing with AI assistant...'));
            const llmResponse = await llmMiddleware.processTodo(answers.input);
            console.log(chalk_1.default.green('\n✅ Refined Todo:'));
            console.log(`Title: ${llmResponse.title}`);
            console.log(`Description: ${llmResponse.description}`);
            console.log(`Tags: ${llmResponse.tags.join(', ')}`);
            console.log(`Category: ${llmResponse.category}`);
            console.log(`Horizon: ${llmResponse.horizon}`);
            console.log(`Status: ${llmResponse.status}`);
            console.log(`Priority: P${llmResponse.priority}`);
            console.log();
            console.log(`Rationale: ${llmResponse.rationale}`);
            const action = await inquirer_1.default.prompt([
                {
                    type: 'list',
                    name: 'choice',
                    message: 'What would you like to do?',
                    choices: [
                        'Save as suggested',
                        'Remix specific parts',
                        'Edit before saving',
                        'Retry with different suggestion',
                        'Cancel',
                    ],
                },
            ]);
            switch (action.choice) {
                case 'Save as suggested':
                    const todo = {
                        title: llmResponse.title,
                        description: llmResponse.description,
                        tags: llmResponse.tags,
                        category: llmResponse.category,
                        horizon: llmResponse.horizon,
                        status: llmResponse.status,
                        priority: llmResponse.priority,
                    };
                    const newTodo = await todoService.addTodo(todo);
                    console.log(chalk_1.default.green('✓ Todo added successfully:'));
                    console.log(JSON.stringify(newTodo, null, 2));
                    break;
                case 'Remix specific parts':
                    const remixedTodo = await remixTodo(llmResponse);
                    if (remixedTodo) {
                        const savedRemixedTodo = await todoService.addTodo(remixedTodo);
                        console.log(chalk_1.default.green('✓ Remixed todo added successfully:'));
                        console.log(JSON.stringify(savedRemixedTodo, null, 2));
                    }
                    break;
                case 'Edit before saving':
                    const edits = await inquirer_1.default.prompt([
                        {
                            type: 'input',
                            name: 'title',
                            message: 'Title:',
                            default: llmResponse.title,
                        },
                        {
                            type: 'input',
                            name: 'description',
                            message: 'Description:',
                            default: llmResponse.description,
                        },
                        {
                            type: 'input',
                            name: 'tags',
                            message: 'Tags (comma-separated):',
                            default: llmResponse.tags.join(', '),
                        },
                        {
                            type: 'input',
                            name: 'category',
                            message: 'Category:',
                            default: llmResponse.category,
                        },
                        {
                            type: 'list',
                            name: 'priority',
                            message: 'Priority:',
                            choices: ['1', '2', '3', '4', '5'],
                            default: llmResponse.priority.toString(),
                        },
                        {
                            type: 'list',
                            name: 'horizon',
                            message: 'Horizon:',
                            choices: ['H1', 'H2', 'H3'],
                            default: llmResponse.horizon,
                        },
                        {
                            type: 'list',
                            name: 'status',
                            message: 'Status:',
                            choices: ['not-started', 'in-progress', 'blocked', 'completed', 'recurring'],
                            default: llmResponse.status,
                        },
                    ]);
                    const editedTodo = {
                        title: edits.title,
                        description: edits.description,
                        tags: edits.tags.split(',').map((t) => t.trim()),
                        category: edits.category,
                        horizon: edits.horizon,
                        status: edits.status,
                        priority: parseInt(edits.priority),
                    };
                    const savedEditedTodo = await todoService.addTodo(editedTodo);
                    console.log(chalk_1.default.green('✓ Todo added successfully:'));
                    console.log(JSON.stringify(savedEditedTodo, null, 2));
                    break;
                case 'Retry with different suggestion':
                    // Recursively call this function to try again
                    await manualTodoEntry(options);
                    break;
                case 'Cancel':
                    console.log(chalk_1.default.yellow('Todo creation cancelled'));
                    break;
            }
        }
        catch (error) {
            console.error(chalk_1.default.red('LLM processing failed:', error.message));
            console.log(chalk_1.default.yellow('Falling back to manual entry...'));
            await manualTodoEntry(options);
        }
    }
    else {
        // Manual flow without LLM
        await manualTodoEntry(options);
    }
});
/**
 * Helper function for remixing specific parts of a todo
 */
async function remixTodo(llmResponse) {
    try {
        // Ask which parts to remix
        const partsToRemix = await inquirer_1.default.prompt([
            {
                type: 'checkbox',
                name: 'fields',
                message: 'Which parts would you like to remix?',
                choices: ['Title', 'Description', 'Tags', 'Category', 'Priority', 'Horizon', 'Status'],
            },
        ]);
        // If no parts selected, return original
        if (partsToRemix.fields.length === 0) {
            console.log(chalk_1.default.yellow('No parts selected for remix. Using original suggestion.'));
            return {
                title: llmResponse.title,
                description: llmResponse.description,
                tags: llmResponse.tags,
                category: llmResponse.category,
                horizon: llmResponse.horizon,
                status: llmResponse.status,
                priority: llmResponse.priority,
            };
        }
        // Ask for remix method
        const remixMethod = await inquirer_1.default.prompt([
            {
                type: 'list',
                name: 'method',
                message: 'How would you like to remix these parts?',
                choices: ['Manual edit', 'AI-assisted', 'Combine both'],
            },
        ]);
        // Create a copy of the original todo to modify
        let remixedTodo = {
            title: llmResponse.title,
            description: llmResponse.description,
            tags: [...llmResponse.tags],
            category: llmResponse.category,
            horizon: llmResponse.horizon,
            status: llmResponse.status,
            priority: llmResponse.priority,
        };
        // Get AI suggestions if requested
        let aiSuggestions = {};
        if (remixMethod.method === 'AI-assisted' || remixMethod.method === 'Combine both') {
            console.log(chalk_1.default.blue('⚡ Getting AI suggestions for remix...'));
            aiSuggestions = await llmMiddleware.getRemixSuggestions(remixedTodo, partsToRemix.fields.map((f) => f.toLowerCase()));
            // Display AI suggestions
            console.log(chalk_1.default.green('\n✅ AI Suggestions:'));
            for (const [field, value] of Object.entries(aiSuggestions)) {
                console.log(chalk_1.default.bold(`${field.charAt(0).toUpperCase() + field.slice(1)}:`));
                if (field === 'tags' && Array.isArray(value)) {
                    console.log(`  ${value.join(', ')}`);
                }
                else if (typeof value === 'object' && value.suggestion && value.rationale) {
                    console.log(`  ${value.suggestion}`);
                    console.log(chalk_1.default.gray(`  Rationale: ${value.rationale}`));
                }
                else {
                    console.log(`  ${value}`);
                }
            }
            // If AI-assisted only, apply all suggestions
            if (remixMethod.method === 'AI-assisted') {
                for (const [field, value] of Object.entries(aiSuggestions)) {
                    if (field === 'title') {
                        remixedTodo.title = typeof value === 'object' ? value.suggestion : value;
                    }
                    else if (field === 'description') {
                        remixedTodo.description = typeof value === 'object' ? value.suggestion : value;
                    }
                    else if (field === 'tags' && Array.isArray(value)) {
                        remixedTodo.tags = value;
                    }
                    else if (field === 'category') {
                        remixedTodo.category = typeof value === 'object' ? value.suggestion : value;
                    }
                    else if (field === 'priority') {
                        const priority = typeof value === 'object' ? value.suggestion : value;
                        const parsedPriority = typeof priority === 'number' ? priority : parseInt(priority);
                        remixedTodo.priority = (parsedPriority >= 1 && parsedPriority <= 5 ? parsedPriority : 3);
                    }
                    else if (field === 'horizon') {
                        const horizon = typeof value === 'object' ? value.suggestion : value;
                        remixedTodo.horizon = horizon;
                    }
                    else if (field === 'status') {
                        const status = typeof value === 'object' ? value.suggestion : value;
                        remixedTodo.status = status;
                    }
                }
                // Show final result after AI suggestions
                console.log(chalk_1.default.green('\n✅ Final Todo after AI Remix:'));
                console.log(`Title: ${remixedTodo.title}`);
                console.log(`Description: ${remixedTodo.description}`);
                console.log(`Tags: ${remixedTodo.tags.join(', ')}`);
                console.log(`Category: ${remixedTodo.category}`);
                console.log(`Horizon: ${remixedTodo.horizon}`);
                console.log(`Status: ${remixedTodo.status}`);
                console.log(`Priority: P${remixedTodo.priority}`);
                const confirmAnswer = await inquirer_1.default.prompt([
                    {
                        type: 'list',
                        name: 'confirm',
                        message: 'Confirm AI-remixed todo:',
                        choices: ['Save', 'Continue with manual editing', 'Cancel'],
                    },
                ]);
                if (confirmAnswer.confirm === 'Save') {
                    return remixedTodo;
                }
                else if (confirmAnswer.confirm === 'Cancel') {
                    console.log(chalk_1.default.yellow('Todo creation cancelled'));
                    return null;
                }
                // If continuing with manual editing, fall through to the manual editing code
            }
        }
        // Process each selected field for manual editing
        if (remixMethod.method === 'Manual edit' || remixMethod.method === 'Combine both') {
            for (const field of partsToRemix.fields) {
                switch (field.toLowerCase()) {
                    case 'title':
                        const titleAnswer = await inquirer_1.default.prompt([
                            {
                                type: 'input',
                                name: 'title',
                                message: `Current title: ${remixedTodo.title}\nNew title:`,
                                default: aiSuggestions.title
                                    ? typeof aiSuggestions.title === 'object'
                                        ? aiSuggestions.title.suggestion
                                        : aiSuggestions.title
                                    : remixedTodo.title,
                            },
                        ]);
                        remixedTodo.title = titleAnswer.title;
                        break;
                    case 'description':
                        const descAnswer = await inquirer_1.default.prompt([
                            {
                                type: 'input',
                                name: 'description',
                                message: `Current description: ${remixedTodo.description}\nNew description:`,
                                default: aiSuggestions.description
                                    ? typeof aiSuggestions.description === 'object'
                                        ? aiSuggestions.description.suggestion
                                        : aiSuggestions.description
                                    : remixedTodo.description,
                            },
                        ]);
                        remixedTodo.description = descAnswer.description;
                        break;
                    case 'tags':
                        // Special handling for tags - allow selecting which to keep and adding new ones
                        if (remixedTodo.tags.length > 0) {
                            const tagSelections = await inquirer_1.default.prompt([
                                {
                                    type: 'checkbox',
                                    name: 'selectedTags',
                                    message: 'Select tags to keep:',
                                    choices: remixedTodo.tags,
                                    default: remixedTodo.tags,
                                },
                            ]);
                            // Display AI suggested tags if available
                            let suggestedTagsPrompt = 'Add new tags (comma-separated):';
                            if (aiSuggestions.tags && Array.isArray(aiSuggestions.tags)) {
                                suggestedTagsPrompt = `AI suggests: ${aiSuggestions.tags.join(', ')}\nAdd new tags (comma-separated):`;
                            }
                            const newTags = await inquirer_1.default.prompt([
                                {
                                    type: 'input',
                                    name: 'tags',
                                    message: suggestedTagsPrompt,
                                    default: '',
                                },
                            ]);
                            // Combine selected and new tags
                            remixedTodo.tags = [
                                ...tagSelections.selectedTags,
                                ...newTags.tags
                                    .split(',')
                                    .map((t) => t.trim())
                                    .filter((t) => t),
                            ];
                        }
                        else {
                            let suggestedTagsPrompt = 'Add tags (comma-separated):';
                            let defaultTags = '';
                            if (aiSuggestions.tags && Array.isArray(aiSuggestions.tags)) {
                                suggestedTagsPrompt = `AI suggests: ${aiSuggestions.tags.join(', ')}\nAdd tags (comma-separated):`;
                                defaultTags = aiSuggestions.tags.join(', ');
                            }
                            const newTags = await inquirer_1.default.prompt([
                                {
                                    type: 'input',
                                    name: 'tags',
                                    message: suggestedTagsPrompt,
                                    default: defaultTags,
                                },
                            ]);
                            remixedTodo.tags = newTags.tags
                                .split(',')
                                .map((t) => t.trim())
                                .filter((t) => t);
                        }
                        break;
                    case 'category':
                        let categoryPrompt = `Current category: ${remixedTodo.category}\nNew category:`;
                        let categoryDefault = remixedTodo.category;
                        if (aiSuggestions.category) {
                            const suggestedCategory = typeof aiSuggestions.category === 'object'
                                ? aiSuggestions.category.suggestion
                                : aiSuggestions.category;
                            categoryPrompt = `Current category: ${remixedTodo.category}\nAI suggests: ${suggestedCategory}\nNew category:`;
                            categoryDefault = suggestedCategory;
                        }
                        const catAnswer = await inquirer_1.default.prompt([
                            {
                                type: 'input',
                                name: 'category',
                                message: categoryPrompt,
                                default: categoryDefault,
                            },
                        ]);
                        remixedTodo.category = catAnswer.category;
                        break;
                    case 'priority':
                        let priorityPrompt = `Current priority: P${remixedTodo.priority}\nNew priority:`;
                        let priorityDefault = remixedTodo.priority.toString();
                        if (aiSuggestions.priority) {
                            const suggestedPriority = typeof aiSuggestions.priority === 'object'
                                ? aiSuggestions.priority.suggestion
                                : aiSuggestions.priority;
                            priorityPrompt = `Current priority: P${remixedTodo.priority}\nAI suggests: P${suggestedPriority}\nNew priority:`;
                            priorityDefault =
                                typeof suggestedPriority === 'number'
                                    ? suggestedPriority.toString()
                                    : suggestedPriority;
                        }
                        const prioAnswer = await inquirer_1.default.prompt([
                            {
                                type: 'list',
                                name: 'priority',
                                message: priorityPrompt,
                                choices: ['1', '2', '3', '4', '5'],
                                default: priorityDefault,
                            },
                        ]);
                        remixedTodo.priority = parseInt(prioAnswer.priority);
                        break;
                    case 'horizon':
                        let horizonPrompt = `Current horizon: ${remixedTodo.horizon}\nNew horizon:`;
                        let horizonDefault = remixedTodo.horizon;
                        if (aiSuggestions.horizon) {
                            const suggestedHorizon = typeof aiSuggestions.horizon === 'object'
                                ? aiSuggestions.horizon.suggestion
                                : aiSuggestions.horizon;
                            horizonPrompt = `Current horizon: ${remixedTodo.horizon}\nAI suggests: ${suggestedHorizon}\nNew horizon:`;
                            horizonDefault = suggestedHorizon;
                        }
                        const horizonAnswer = await inquirer_1.default.prompt([
                            {
                                type: 'list',
                                name: 'horizon',
                                message: horizonPrompt,
                                choices: ['H1', 'H2', 'H3'],
                                default: horizonDefault,
                            },
                        ]);
                        remixedTodo.horizon = horizonAnswer.horizon;
                        break;
                    case 'status':
                        let statusPrompt = `Current status: ${remixedTodo.status}\nNew status:`;
                        let statusDefault = remixedTodo.status;
                        if (aiSuggestions.status) {
                            const suggestedStatus = typeof aiSuggestions.status === 'object'
                                ? aiSuggestions.status.suggestion
                                : aiSuggestions.status;
                            statusPrompt = `Current status: ${remixedTodo.status}\nAI suggests: ${suggestedStatus}\nNew status:`;
                            statusDefault = suggestedStatus;
                        }
                        const statusAnswer = await inquirer_1.default.prompt([
                            {
                                type: 'list',
                                name: 'status',
                                message: statusPrompt,
                                choices: ['not-started', 'in-progress', 'blocked', 'completed', 'recurring'],
                                default: statusDefault,
                            },
                        ]);
                        remixedTodo.status = statusAnswer.status;
                        break;
                }
            }
        }
        // Show final result and confirm
        console.log(chalk_1.default.green('\n✅ Remixed Todo:'));
        console.log(`Title: ${remixedTodo.title}`);
        console.log(`Description: ${remixedTodo.description}`);
        console.log(`Tags: ${remixedTodo.tags.join(', ')}`);
        console.log(`Category: ${remixedTodo.category}`);
        console.log(`Horizon: ${remixedTodo.horizon}`);
        console.log(`Status: ${remixedTodo.status}`);
        console.log(`Priority: P${remixedTodo.priority}`);
        const confirmAnswer = await inquirer_1.default.prompt([
            {
                type: 'list',
                name: 'confirm',
                message: 'Confirm final todo:',
                choices: ['Save', 'Continue editing', 'Cancel'],
            },
        ]);
        switch (confirmAnswer.confirm) {
            case 'Save':
                return remixedTodo;
            case 'Continue editing':
                // Recursive call to continue editing
                return remixTodo(remixedTodo);
            case 'Cancel':
                console.log(chalk_1.default.yellow('Todo creation cancelled'));
                return null;
        }
    }
    catch (error) {
        console.error(chalk_1.default.red('Error during remix:', error));
        return null;
    }
    return null;
}
// Helper function for manual todo entry
async function manualTodoEntry(options) {
    const answers = await inquirer_1.default.prompt([
        {
            type: 'input',
            name: 'title',
            message: 'Enter todo title:',
            validate: (input) => input.length > 0 || 'Title is required',
        },
        {
            type: 'input',
            name: 'description',
            message: 'Enter description (optional):',
        },
    ]);
    const todo = {
        title: answers.title,
        description: answers.description || undefined,
        priority: parseInt(options.priority),
        status: options.status,
        horizon: options.horizon,
        tags: options.tags ? options.tags.split(',').map((t) => t.trim()) : [],
        category: options.category,
    };
    try {
        const newTodo = await todoService.addTodo(todo);
        console.log(chalk_1.default.green('✓ Todo added successfully:'));
        console.log(JSON.stringify(newTodo, null, 2));
    }
    catch (error) {
        console.error(chalk_1.default.red('Failed to add todo:', error.message));
    }
}
exports.todo
    .command('list')
    .description('List todo items')
    .option('-p, --priority <number>', 'Filter by priority')
    .option('-s, --status <status>', 'Filter by status')
    .option('-h, --horizon <horizon>', 'Filter by horizon')
    .option('-t, --tags <tags>', 'Filter by tags (comma-separated)')
    .option('-c, --category <category>', 'Filter by category')
    .option('--search <term>', 'Search in title and description')
    .option('--show-ids', 'Show todo IDs')
    .action(async (options) => {
    try {
        const todos = await todoService.getTodos({
            priority: options.priority ? parseInt(options.priority) : undefined,
            status: options.status,
            horizon: options.horizon,
            tags: options.tags ? options.tags.split(',').map((t) => t.trim()) : undefined,
            category: options.category,
            search: options.search,
        });
        if (todos.length === 0) {
            console.log(chalk_1.default.yellow('No todos found matching the criteria.'));
            return;
        }
        console.log(chalk_1.default.cyan('\nTodo Items:\n'));
        todos.forEach((todo) => {
            console.log(chalk_1.default.bold(`${todo.horizon} P${todo.priority} [${todo.status}] ${todo.title}`));
            if (options.showIds) {
                console.log(chalk_1.default.gray(`  ID: ${todo.id}`));
            }
            if (todo.description) {
                console.log(chalk_1.default.gray(`  Description: ${todo.description}`));
            }
            if (todo.tags.length) {
                console.log(chalk_1.default.blue(`  Tags: ${todo.tags.join(', ')}`));
            }
            if (todo.category) {
                console.log(chalk_1.default.magenta(`  Category: ${todo.category}`));
            }
            console.log();
        });
    }
    catch (error) {
        console.error(chalk_1.default.red('Failed to list todos:', error.message));
    }
});
exports.todo
    .command('update <id>')
    .description('Update a todo item')
    .option('-t, --title <title>', 'New title')
    .option('-d, --description <description>', 'New description')
    .option('-p, --priority <number>', 'New priority')
    .option('-s, --status <status>', 'New status')
    .option('-h, --horizon <horizon>', 'New horizon')
    .option('--tags <tags>', 'New tags (comma-separated)')
    .option('-c, --category <category>', 'New category')
    .action(async (id, options) => {
    try {
        const updates = {};
        if (options.title)
            updates.title = options.title;
        if (options.description)
            updates.description = options.description;
        if (options.priority)
            updates.priority = parseInt(options.priority);
        if (options.status)
            updates.status = options.status;
        if (options.horizon)
            updates.horizon = options.horizon;
        if (options.tags)
            updates.tags = options.tags.split(',').map((t) => t.trim());
        if (options.category)
            updates.category = options.category;
        const updatedTodo = await todoService.updateTodo(id, updates);
        console.log(chalk_1.default.green('✓ Todo updated successfully:'));
        console.log(JSON.stringify(updatedTodo, null, 2));
    }
    catch (error) {
        console.error(chalk_1.default.red('Failed to update todo:', error.message));
    }
});
exports.todo
    .command('delete <id>')
    .description('Delete a todo item')
    .action(async (id) => {
    try {
        await todoService.deleteTodo(id);
        console.log(chalk_1.default.green('✓ Todo deleted successfully'));
    }
    catch (error) {
        console.error(chalk_1.default.red('Failed to delete todo:', error.message));
    }
});
exports.todo
    .command('stats')
    .description('Show todo statistics')
    .action(async () => {
    try {
        const stats = await todoService.getStats();
        console.log(chalk_1.default.cyan('\nTodo Statistics:\n'));
        console.log(chalk_1.default.bold(`Total Items: ${stats.totalItems}\n`));
        console.log(chalk_1.default.bold('By Priority:'));
        Object.entries(stats.byPriority).forEach(([priority, count]) => {
            console.log(`  P${priority}: ${count}`);
        });
        console.log(chalk_1.default.bold('\nBy Status:'));
        Object.entries(stats.byStatus).forEach(([status, count]) => {
            console.log(`  ${status}: ${count}`);
        });
        console.log(chalk_1.default.bold('\nBy Horizon:'));
        Object.entries(stats.byHorizon).forEach(([horizon, count]) => {
            console.log(`  ${horizon}: ${count}`);
        });
        if (Object.keys(stats.byCategory).length) {
            console.log(chalk_1.default.bold('\nBy Category:'));
            Object.entries(stats.byCategory).forEach(([category, count]) => {
                console.log(`  ${category}: ${count}`);
            });
        }
    }
    catch (error) {
        console.error(chalk_1.default.red('Failed to get todo statistics:', error.message));
    }
});
exports.todo
    .command('approval')
    .description('Manage todo approvals')
    .action(async () => {
    // This serves as a parent command for approval subcommands
    console.log(chalk_1.default.blue('Todo approval management'));
    console.log(chalk_1.default.cyan('\nAvailable subcommands:'));
    console.log('  - todo approval list            List todos requiring your approval');
    console.log('  - todo approval pending         List todos you submitted pending approval');
    console.log('  - todo approval all             List all todos pending approval from any user');
    console.log('  - todo approval approve <id>    Approve a todo');
    console.log('  - todo approval reject <id>     Reject a todo');
    console.log('  - todo approval assign <id>     Assign a todo for approval to one or more users');
    console.log(chalk_1.default.cyan('\nExamples:'));
    console.log('  - todo approval assign abc123 --users=bob,alice      Assign to multiple users');
    console.log('  - todo approval assign abc123 --team                 Assign to a predefined team');
    console.log("  - todo approval all --user=alice                     Show todos awaiting Alice's approval");
    console.log('  - todo approval all --include-completed              Include completed todos');
});
exports.todo
    .command('approval list')
    .description('List todos requiring your approval')
    .action(async () => {
    try {
        const approvableTodos = await todoService.getApprovableTodos();
        if (approvableTodos.length === 0) {
            console.log(chalk_1.default.yellow('No todos require your approval.'));
            return;
        }
        console.log(chalk_1.default.blue('\nTodos Requiring Your Approval:'));
        approvableTodos.forEach((todo) => {
            console.log(chalk_1.default.green(`\nID: ${todo.id}`));
            console.log(`Title: ${chalk_1.default.white.bold(todo.title)}`);
            console.log(`Description: ${todo.description}`);
            console.log(`Created by: ${chalk_1.default.cyan(todo.createdBy || 'Unknown')}`);
            console.log(`Status: ${chalk_1.default.yellow(todo.status)}`);
            console.log(`Priority: P${todo.priority}`);
            console.log(`Horizon: ${todo.horizon}`);
            console.log(`Tags: ${todo.tags.join(', ')}`);
            console.log(`Category: ${todo.category}`);
            console.log(`Created: ${new Date(todo.createdAt).toLocaleString()}`);
        });
    }
    catch (error) {
        console.error(chalk_1.default.red('Error listing todos for approval:', error.message));
    }
});
exports.todo
    .command('approval pending')
    .description('List todos you submitted that are pending approval')
    .action(async () => {
    try {
        const myTodos = await todoService.getMyTodos();
        const pendingTodos = myTodos.filter((todo) => todo.approvalStatus === 'pending');
        if (pendingTodos.length === 0) {
            console.log(chalk_1.default.yellow('You have no pending todos awaiting approval.'));
            return;
        }
        console.log(chalk_1.default.blue('\nYour Todos Awaiting Approval:'));
        pendingTodos.forEach((todo) => {
            console.log(chalk_1.default.green(`\nID: ${todo.id}`));
            console.log(`Title: ${chalk_1.default.white.bold(todo.title)}`);
            console.log(`Description: ${todo.description}`);
            console.log(`Assigned to: ${chalk_1.default.cyan(todo.assignedTo || 'Not assigned')}`);
            console.log(`Status: ${chalk_1.default.yellow(todo.status)}`);
            console.log(`Priority: P${todo.priority}`);
            console.log(`Horizon: ${todo.horizon}`);
            console.log(`Created: ${new Date(todo.createdAt).toLocaleString()}`);
        });
    }
    catch (error) {
        console.error(chalk_1.default.red('Error listing pending todos:', error.message));
    }
});
exports.todo
    .command('approval approve <id>')
    .description('Approve a todo item')
    .action(async (id) => {
    try {
        const todo = await todoService.getTodoById(id);
        if (!todo) {
            console.error(chalk_1.default.red(`Todo with id ${id} not found`));
            return;
        }
        if (todo.approvalStatus !== 'pending') {
            console.error(chalk_1.default.yellow(`Todo is not pending approval (current status: ${todo.approvalStatus || 'none'})`));
            return;
        }
        // Check if the current user is in the assignedTo array
        if (!todo.assignedTo || !todo.assignedTo.includes(todoService.getCurrentUser())) {
            console.error(chalk_1.default.red(`This todo is not assigned to you for approval`));
            return;
        }
        const answers = await inquirer_1.default.prompt([
            {
                type: 'input',
                name: 'notes',
                message: 'Add approval notes (optional):',
            },
        ]);
        const updatedTodo = await todoService.approveTodo(id, answers.notes);
        console.log(chalk_1.default.green('✓ Todo approved successfully:'));
        console.log(JSON.stringify(updatedTodo, null, 2));
    }
    catch (error) {
        console.error(chalk_1.default.red('Error approving todo:', error.message));
    }
});
exports.todo
    .command('approval reject <id>')
    .description('Reject a todo item')
    .action(async (id) => {
    try {
        const todo = await todoService.getTodoById(id);
        if (!todo) {
            console.error(chalk_1.default.red(`Todo with id ${id} not found`));
            return;
        }
        if (todo.approvalStatus !== 'pending') {
            console.error(chalk_1.default.yellow(`Todo is not pending approval (current status: ${todo.approvalStatus || 'none'})`));
            return;
        }
        if (!todo.assignedTo || !todo.assignedTo.includes(todoService.getCurrentUser())) {
            console.error(chalk_1.default.red(`This todo is not assigned to you for approval`));
            return;
        }
        const answers = await inquirer_1.default.prompt([
            {
                type: 'input',
                name: 'notes',
                message: 'Add rejection reason (required):',
                validate: (input) => input.length > 0 || 'Rejection reason is required',
            },
        ]);
        const updatedTodo = await todoService.rejectTodo(id, answers.notes);
        console.log(chalk_1.default.yellow('Todo rejected:'));
        console.log(JSON.stringify(updatedTodo, null, 2));
    }
    catch (error) {
        console.error(chalk_1.default.red('Error rejecting todo:', error.message));
    }
});
exports.todo
    .command('approval assign <id>')
    .description('Assign a todo for approval to one or more users')
    .option('-u, --users <users>', 'Comma-separated list of usernames')
    .option('-t, --team', 'Assign to a pre-defined team')
    .action(async (id, options) => {
    try {
        const todo = await todoService.getTodoById(id);
        if (!todo) {
            console.error(chalk_1.default.red(`Todo with id ${id} not found`));
            return;
        }
        // Only the creator should be able to assign
        if (todo.createdBy && todo.createdBy !== todoService.getCurrentUser()) {
            console.error(chalk_1.default.red(`You can only assign todos you created`));
            return;
        }
        let assignees = [];
        // If no options specified, prompt for users
        if (!options.users && !options.team) {
            // If there are existing assignees, show them
            if (todo.assignedTo && todo.assignedTo.length > 0) {
                console.log(chalk_1.default.blue(`Current assignees: ${todo.assignedTo.join(', ')}`));
            }
            const answers = await inquirer_1.default.prompt([
                {
                    type: 'input',
                    name: 'users',
                    message: 'Enter usernames to assign (comma-separated):',
                    validate: (input) => input.length > 0 || 'At least one username is required',
                },
            ]);
            assignees = answers.users.split(',').map((u) => u.trim());
        }
        // Process command line options
        else if (options.users) {
            assignees = options.users.split(',').map((u) => u.trim());
        }
        else if (options.team) {
            // Show a prompt with predefined teams
            // In a real app, these would come from a team service
            const teams = {
                dev: ['dev1', 'dev2', 'dev3'],
                design: ['designer1', 'designer2'],
                qa: ['tester1', 'tester2'],
            };
            const teamChoice = await inquirer_1.default.prompt([
                {
                    type: 'list',
                    name: 'team',
                    message: 'Select a team:',
                    choices: Object.keys(teams),
                },
            ]);
            assignees = teams[teamChoice.team];
        }
        // Update existing assignees or create new list
        const mergeChoice = todo.assignedTo && todo.assignedTo.length > 0
            ? await inquirer_1.default.prompt([
                {
                    type: 'list',
                    name: 'merge',
                    message: 'How would you like to handle existing assignees?',
                    choices: [
                        { name: 'Replace existing assignees', value: 'replace' },
                        { name: 'Add to existing assignees', value: 'add' },
                    ],
                },
            ])
            : { merge: 'replace' };
        if (mergeChoice.merge === 'add' && todo.assignedTo) {
            // Combine existing and new assignees
            assignees = [...todo.assignedTo, ...assignees];
        }
        const updatedTodo = await todoService.assignTodo(id, assignees);
        console.log(chalk_1.default.green(`✓ Todo assigned to ${assignees.join(', ')} for approval:`));
        console.log(JSON.stringify(updatedTodo, null, 2));
    }
    catch (error) {
        console.error(chalk_1.default.red('Error assigning todo:', error.message));
    }
});
exports.todo
    .command('user <username>')
    .description('Set the current user for todo operations')
    .action(async (username) => {
    try {
        todoService.setCurrentUser(username);
        console.log(chalk_1.default.green(`✓ Current user set to: ${username}`));
    }
    catch (error) {
        console.error(chalk_1.default.red('Error setting user:', error.message));
    }
});
exports.todo
    .command('approval all')
    .description('List all todos pending approval from any user')
    .option('--include-completed', 'Include completed todos')
    .option('-u, --user <username>', 'Filter by assigned user')
    .action(async (options) => {
    try {
        let pendingTodos;
        if (options.user) {
            pendingTodos = await todoService.getTodosNeedingApprovalBy(options.user);
            console.log(chalk_1.default.blue(`\nAll Todos Pending Approval by ${options.user}:`));
        }
        else {
            pendingTodos = await todoService.getAllPendingApprovalTodos(options.includeCompleted);
            console.log(chalk_1.default.blue('\nAll Todos Pending Approval:'));
        }
        if (pendingTodos.length === 0) {
            console.log(chalk_1.default.yellow('No pending approval todos found.'));
            return;
        }
        // Group todos by assignee for better visualization
        const todosByAssignee = {};
        pendingTodos.forEach((todo) => {
            const assignees = todo.assignedTo || ['Unassigned'];
            assignees.forEach((assignee) => {
                if (!todosByAssignee[assignee]) {
                    todosByAssignee[assignee] = [];
                }
                todosByAssignee[assignee].push(todo);
            });
        });
        // Display todos grouped by assignee
        for (const [assignee, todos] of Object.entries(todosByAssignee)) {
            console.log(chalk_1.default.cyan(`\nAssigned to: ${assignee}`));
            todos.forEach((todo) => {
                console.log(chalk_1.default.green(`  ID: ${todo.id}`));
                console.log(`  Title: ${chalk_1.default.white.bold(todo.title)}`);
                console.log(`  Description: ${todo.description || 'None'}`);
                console.log(`  Created by: ${chalk_1.default.yellow(todo.createdBy || 'Unknown')}`);
                console.log(`  Status: ${todo.status}`);
                console.log(`  Priority: P${todo.priority}`);
                console.log(`  Horizon: ${todo.horizon}`);
                console.log(`  Created: ${new Date(todo.createdAt).toLocaleString()}`);
                console.log(); // Empty line between todos
            });
        }
        console.log(chalk_1.default.blue(`Total: ${pendingTodos.length} todos pending approval`));
    }
    catch (error) {
        console.error(chalk_1.default.red('Error listing all pending approval todos:', error.message));
    }
});
//# sourceMappingURL=todo.js.map