import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Todo {
  id: string;
  title: string;
  description?: string;
  priority: number;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  category?: string;
  dueDate?: string;
  tags?: string[];
}

interface TodoState {
  todos: Todo[];
  addTodo: (todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTodo: (id: string, updates: Partial<Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  deleteTodo: (id: string) => void;
  toggleCompleted: (id: string) => void;
  getTodosByCategory: (category: string) => Todo[];
  getTodosByTags: (tags: string[]) => Todo[];
  getIncompleteTodos: () => Todo[];
  getCompletedTodos: () => Todo[];
  getHighPriorityTodos: () => Todo[];
  getCompletionPercentage: () => number;
}

export const useTodoStore = create<TodoState>()(
  persist(
    (set, get) => ({
      todos: [],
      
      addTodo: (todo) => set((state) => ({
        todos: [
          ...state.todos,
          {
            ...todo,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
      })),
      
      updateTodo: (id, updates) => set((state) => ({
        todos: state.todos.map((todo) => 
          todo.id === id 
            ? { 
                ...todo, 
                ...updates, 
                updatedAt: new Date().toISOString() 
              } 
            : todo
        ),
      })),
      
      deleteTodo: (id) => set((state) => ({
        todos: state.todos.filter((todo) => todo.id !== id),
      })),
      
      toggleCompleted: (id) => set((state) => ({
        todos: state.todos.map((todo) =>
          todo.id === id
            ? { ...todo, completed: !todo.completed, updatedAt: new Date().toISOString() }
            : todo
        ),
      })),
      
      getTodosByCategory: (category) => {
        return get().todos.filter((todo) => todo.category === category);
      },
      
      getTodosByTags: (tags) => {
        return get().todos.filter((todo) => 
          todo.tags?.some((tag) => tags.includes(tag))
        );
      },
      
      getIncompleteTodos: () => {
        return get().todos.filter((todo) => !todo.completed);
      },
      
      getCompletedTodos: () => {
        return get().todos.filter((todo) => todo.completed);
      },
      
      getHighPriorityTodos: () => {
        return get().todos.filter((todo) => todo.priority >= 4);
      },
      
      getCompletionPercentage: () => {
        const todos = get().todos;
        if (todos.length === 0) return 0;
        
        const completedCount = todos.filter((todo) => todo.completed).length;
        return (completedCount / todos.length) * 100;
      },
    }),
    {
      name: 'todo-storage',
    }
  )
); 