import { TodoItem, TodoFilter, TodoStats } from '../types/todo';
export declare class TodoService {
    private todoFilePath;
    private todos;
    private currentUser;
    constructor(todoFilePath?: string);
    init(): Promise<void>;
    loadTodos(): Promise<void>;
    private parseMdToTodos;
    private getStatusEmoji;
    addTodo(todo: Omit<TodoItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<TodoItem>;
    updateTodo(id: string, updates: Partial<TodoItem>): Promise<TodoItem>;
    deleteTodo(id: string): Promise<void>;
    /**
     * Get a todo item by its ID
     *
     * @param id The ID of the todo item to retrieve
     * @returns The todo item, or null if not found
     */
    getTodoById(id: string): Promise<TodoItem | null>;
    getTodos(filter?: TodoFilter): Promise<TodoItem[]>;
    getStats(): Promise<TodoStats>;
    private saveTodos;
    private todosToMd;
    setCurrentUser(username: string): void;
    /**
     * Get the current user
     *
     * @returns The current user
     */
    getCurrentUser(): string;
    /**
     * Gets todos awaiting approval for the current user
     */
    getApprovableTodos(): Promise<TodoItem[]>;
    /**
     * Approve a todo item
     */
    approveTodo(id: string, notes?: string): Promise<TodoItem | undefined>;
    /**
     * Reject a todo item
     */
    rejectTodo(id: string, notes?: string): Promise<TodoItem | undefined>;
    /**
     * Assign a todo to one or more users
     *
     * @param id The todo ID
     * @param usernames A single username or array of usernames
     * @returns The updated todo item
     */
    assignTodo(id: string, usernames: string | string[]): Promise<TodoItem | undefined>;
    /**
     * Get todos created by the current user
     */
    getMyTodos(): Promise<TodoItem[]>;
    /**
     * Get todos assigned to the current user
     */
    getAssignedTodos(): Promise<TodoItem[]>;
    /**
     * Get all todos with pending approval status
     *
     * @param includeCompleted Whether to include todos with 'completed' status
     * @returns Array of todos with pending approval status
     */
    getAllPendingApprovalTodos(includeCompleted?: boolean): Promise<TodoItem[]>;
    /**
     * Get todos that need approval by a specific user
     *
     * @param username The username to check for
     * @returns Array of todos assigned to the specified user
     */
    getTodosNeedingApprovalBy(username: string): Promise<TodoItem[]>;
}
