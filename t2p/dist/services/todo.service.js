"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TodoService = void 0;
const uuid_1 = require("uuid");
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
class TodoService {
    constructor(todoFilePath = path_1.default.join(process.cwd(), 'master-todo.md')) {
        this.currentUser = process.env.USER || 'default-user';
        this.todoFilePath = todoFilePath;
        this.todos = { items: [], lastUpdated: new Date() };
    }
    async init() {
        try {
            await this.loadTodos();
        }
        catch (error) {
            console.error('Failed to initialize todo service:', error);
            throw error;
        }
    }
    async loadTodos() {
        try {
            console.log('Loading todos from:', this.todoFilePath);
            const content = await promises_1.default.readFile(this.todoFilePath, 'utf-8');
            console.log('File content length:', content.length);
            this.todos = this.parseMdToTodos(content);
            console.log('Parsed todos:', this.todos.items.length);
        }
        catch (error) {
            console.error('Failed to load todos:', error);
            throw error;
        }
    }
    parseMdToTodos(content) {
        const items = [];
        const lines = content.split('\n');
        console.log('Total lines:', lines.length);
        let currentItem = null;
        for (const line of lines) {
            // Look for lines that match the todo pattern, supporting both emoji and text formats
            if (line.match(/^- .+ \[(H[1-3])\] \*\*P([1-5])\*\*: (.+)$/)) {
                if (currentItem) {
                    items.push(currentItem);
                }
                // Extract the important parts using non-greedy matching
                const horizonMatch = line.match(/\[(H[1-3])\]/);
                const priorityMatch = line.match(/\*\*P([1-5])\*\*/);
                const titleMatch = line.match(/\*\*P[1-5]\*\*: (.+)$/);
                if (horizonMatch && priorityMatch && titleMatch) {
                    const horizon = horizonMatch[1];
                    const priority = parseInt(priorityMatch[1]);
                    const title = titleMatch[1].trim();
                    // Determine status based on emoji, text indicators or keywords in the line
                    let status = 'not-started';
                    const lineLower = line.toLowerCase();
                    if (line.includes('🟡') ||
                        lineLower.includes('(in-progress)') ||
                        lineLower.includes('in progress')) {
                        status = 'in-progress';
                    }
                    else if (line.includes('🔵') ||
                        lineLower.includes('(blocked)') ||
                        lineLower.includes('blocked')) {
                        status = 'blocked';
                    }
                    else if (line.includes('🟢') ||
                        lineLower.includes('(completed)') ||
                        lineLower.includes('completed')) {
                        status = 'completed';
                    }
                    else if (line.includes('📌') ||
                        lineLower.includes('(recurring)') ||
                        lineLower.includes('recurring')) {
                        status = 'recurring';
                    }
                    currentItem = {
                        id: (0, uuid_1.v4)(),
                        title,
                        status,
                        priority,
                        horizon,
                        tags: [],
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        createdBy: this.currentUser,
                        approvalStatus: status === 'in-progress' ? 'pending' : undefined,
                    };
                }
            }
            else if (currentItem && line.trim().startsWith('- ')) {
                // Process metadata lines
                const metadataMatch = line.match(/^\s*- ([^:]+): (.+)$/);
                if (metadataMatch) {
                    const [, key, value] = metadataMatch;
                    switch (key.toLowerCase()) {
                        case 'tags':
                            currentItem.tags = value.split(',').map((t) => t.trim());
                            break;
                        case 'category':
                            currentItem.category = value.trim();
                            break;
                        case 'description':
                            currentItem.description = value.trim();
                            break;
                    }
                }
            }
        }
        if (currentItem) {
            items.push(currentItem);
        }
        return {
            items,
            lastUpdated: new Date(),
        };
    }
    getStatusEmoji(status) {
        switch (status) {
            case 'not-started':
                return '🔴';
            case 'in-progress':
                return '🟡';
            case 'blocked':
                return '🔵';
            case 'completed':
                return '🟢';
            case 'recurring':
                return '📌';
        }
    }
    async addTodo(todo) {
        const newTodo = {
            ...todo,
            id: (0, uuid_1.v4)(),
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: this.currentUser,
        };
        this.todos.items.push(newTodo);
        this.todos.lastUpdated = new Date();
        await this.saveTodos();
        return newTodo;
    }
    async updateTodo(id, updates) {
        const index = this.todos.items.findIndex((item) => item.id === id);
        if (index === -1) {
            throw new Error(`Todo item with id ${id} not found`);
        }
        this.todos.items[index] = {
            ...this.todos.items[index],
            ...updates,
            updatedAt: new Date(),
        };
        this.todos.lastUpdated = new Date();
        await this.saveTodos();
        return this.todos.items[index];
    }
    async deleteTodo(id) {
        const index = this.todos.items.findIndex((item) => item.id === id);
        if (index === -1) {
            throw new Error(`Todo item with id ${id} not found`);
        }
        this.todos.items.splice(index, 1);
        this.todos.lastUpdated = new Date();
        await this.saveTodos();
    }
    /**
     * Get a todo item by its ID
     *
     * @param id The ID of the todo item to retrieve
     * @returns The todo item, or null if not found
     */
    async getTodoById(id) {
        const todo = this.todos.items.find((item) => item.id === id);
        return todo || null;
    }
    async getTodos(filter) {
        let filteredTodos = this.todos.items;
        if (filter) {
            if (filter.priority) {
                filteredTodos = filteredTodos.filter((todo) => todo.priority === filter.priority);
            }
            if (filter.status) {
                filteredTodos = filteredTodos.filter((todo) => todo.status === filter.status);
            }
            if (filter.tags?.length) {
                filteredTodos = filteredTodos.filter((todo) => filter.tags.every((tag) => todo.tags.includes(tag)));
            }
            if (filter.category) {
                filteredTodos = filteredTodos.filter((todo) => todo.category === filter.category);
            }
            if (filter.horizon) {
                filteredTodos = filteredTodos.filter((todo) => todo.horizon === filter.horizon);
            }
            if (filter.search) {
                const searchLower = filter.search.toLowerCase();
                filteredTodos = filteredTodos.filter((todo) => todo.title.toLowerCase().includes(searchLower) ||
                    todo.description?.toLowerCase().includes(searchLower));
            }
            if (filter.approvalStatus) {
                filteredTodos = filteredTodos.filter((todo) => todo.approvalStatus === filter.approvalStatus);
            }
            if (filter.assignedTo) {
                filteredTodos = filteredTodos.filter((todo) => todo.assignedTo === filter.assignedTo);
            }
        }
        return filteredTodos;
    }
    async getStats() {
        const stats = {
            totalItems: this.todos.items.length,
            byPriority: {},
            byStatus: {},
            byHorizon: {},
            byCategory: {},
        };
        for (const todo of this.todos.items) {
            // Count by priority
            stats.byPriority[todo.priority] = (stats.byPriority[todo.priority] || 0) + 1;
            // Count by status
            stats.byStatus[todo.status] = (stats.byStatus[todo.status] || 0) + 1;
            // Count by horizon
            if (todo.horizon) {
                stats.byHorizon[todo.horizon] = (stats.byHorizon[todo.horizon] || 0) + 1;
            }
            // Count by category
            if (todo.category) {
                stats.byCategory[todo.category] = (stats.byCategory[todo.category] || 0) + 1;
            }
        }
        return stats;
    }
    async saveTodos() {
        const content = this.todosToMd();
        await promises_1.default.writeFile(this.todoFilePath, content, 'utf-8');
    }
    todosToMd() {
        let content = '# Master Todo List\n\n';
        // Group todos by horizon
        const byHorizon = {};
        for (const todo of this.todos.items) {
            const horizon = todo.horizon || 'H1';
            if (!byHorizon[horizon]) {
                byHorizon[horizon] = [];
            }
            byHorizon[horizon].push(todo);
        }
        // Sort horizons
        const horizons = ['H1', 'H2', 'H3'];
        for (const horizon of horizons) {
            if (byHorizon[horizon]?.length) {
                content += `\n## ${horizon} Tasks\n\n`;
                // Sort by priority
                byHorizon[horizon].sort((a, b) => a.priority - b.priority);
                for (const todo of byHorizon[horizon]) {
                    content += `- ${this.getStatusEmoji(todo.status)} [${horizon}] **P${todo.priority}**: ${todo.title}\n`;
                    if (todo.description) {
                        content += `  - Description: ${todo.description}\n`;
                    }
                    if (todo.tags.length) {
                        content += `  - Tags: ${todo.tags.join(', ')}\n`;
                    }
                    if (todo.category) {
                        content += `  - Category: ${todo.category}\n`;
                    }
                    if (todo.githubIssue) {
                        content += `  - GitHub: #${todo.githubIssue.number} (${todo.githubIssue.url})\n`;
                    }
                    content += '\n';
                }
            }
        }
        return content;
    }
    // Set the current user for operations
    setCurrentUser(username) {
        this.currentUser = username;
    }
    /**
     * Get the current user
     *
     * @returns The current user
     */
    getCurrentUser() {
        return this.currentUser;
    }
    /**
     * Gets todos awaiting approval for the current user
     */
    async getApprovableTodos() {
        return this.todos.items.filter((todo) => todo.approvalStatus === 'pending' &&
            todo.assignedTo &&
            todo.assignedTo.includes(this.currentUser));
    }
    /**
     * Approve a todo item
     */
    async approveTodo(id, notes) {
        return this.updateTodo(id, {
            approvalStatus: 'approved',
            approvalNotes: notes,
        });
    }
    /**
     * Reject a todo item
     */
    async rejectTodo(id, notes) {
        return this.updateTodo(id, {
            approvalStatus: 'rejected',
            approvalNotes: notes,
        });
    }
    /**
     * Assign a todo to one or more users
     *
     * @param id The todo ID
     * @param usernames A single username or array of usernames
     * @returns The updated todo item
     */
    async assignTodo(id, usernames) {
        // Convert single username to array if needed
        const assignees = Array.isArray(usernames) ? usernames : [usernames];
        // Ensure no duplicates
        const uniqueAssignees = [...new Set(assignees)];
        return this.updateTodo(id, {
            assignedTo: uniqueAssignees,
            approvalStatus: 'pending',
        });
    }
    /**
     * Get todos created by the current user
     */
    async getMyTodos() {
        return this.todos.items.filter((todo) => todo.createdBy === this.currentUser);
    }
    /**
     * Get todos assigned to the current user
     */
    async getAssignedTodos() {
        return this.todos.items.filter((todo) => todo.assignedTo && todo.assignedTo.includes(this.currentUser));
    }
    /**
     * Get all todos with pending approval status
     *
     * @param includeCompleted Whether to include todos with 'completed' status
     * @returns Array of todos with pending approval status
     */
    async getAllPendingApprovalTodos(includeCompleted = false) {
        return this.todos.items.filter((todo) => todo.approvalStatus === 'pending' && (includeCompleted || todo.status !== 'completed'));
    }
    /**
     * Get todos that need approval by a specific user
     *
     * @param username The username to check for
     * @returns Array of todos assigned to the specified user
     */
    async getTodosNeedingApprovalBy(username) {
        return this.todos.items.filter((todo) => todo.approvalStatus === 'pending' && todo.assignedTo && todo.assignedTo.includes(username));
    }
}
exports.TodoService = TodoService;
//# sourceMappingURL=todo.service.js.map