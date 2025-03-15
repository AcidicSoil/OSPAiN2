# Frontend Setup Guide

This guide outlines the steps to set up the new OSPAiN2-hub frontend project structure.

## 1. Project Initialization

Create a new directory structure for the frontend project:

```bash
# Create a new directory for the rebuilt frontend
mkdir -p OSPAiN2-hub-new

# Navigate to the directory
cd OSPAiN2-hub-new

# Initialize a new React TypeScript project with Vite
npm create vite@latest . -- --template react-ts

# Install dependencies
npm install

# Install additional core dependencies
npm install react-router-dom@6 axios zustand @mui/material @mui/icons-material @emotion/react @emotion/styled
npm install @react-three/fiber @react-three/drei three
npm install react-markdown react-syntax-highlighter d3 uuid
npm install react-toastify react-window

# Install dev dependencies
npm install -D tailwindcss postcss autoprefixer
npm install -D @types/react-syntax-highlighter @types/three @types/d3 @types/uuid @types/react-window
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install -D eslint eslint-plugin-react eslint-plugin-react-hooks @typescript-eslint/eslint-plugin
npm install -D storybook
```

## 2. Configuration Files

### Tailwind CSS Setup

Initialize Tailwind CSS:

```bash
npx tailwindcss init -p
```

Update `tailwind.config.js`:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#4f6df5',
          DEFAULT: '#2f54eb',
          dark: '#1939b7',
        },
        secondary: {
          light: '#f5a623',
          DEFAULT: '#f08c00',
          dark: '#c67100',
        },
        success: {
          light: '#52c41a',
          DEFAULT: '#389e0d',
          dark: '#237804',
        },
        warning: {
          light: '#faad14',
          DEFAULT: '#d48806',
          dark: '#ad6800',
        },
        error: {
          light: '#ff4d4f',
          DEFAULT: '#f5222d',
          dark: '#a8071a',
        },
        background: {
          light: '#ffffff',
          DEFAULT: '#f0f2f5',
          dark: '#141414',
        },
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        xxl: '3rem',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}
```

### TypeScript Configuration

Update `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "useUnknownInCatchVariables": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "allowJs": false,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### ESLint Configuration

Create `.eslintrc.js`:

```js
module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.js'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    'react/prop-types': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
  },
}
```

### Vitest Configuration

Create `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'c8',
      reporter: ['text', 'json', 'html'],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})
```

Create `src/test/setup.ts`:

```ts
import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import matchers from '@testing-library/jest-dom/matchers'

// Extend Vitest's expect method with methods from react-testing-library
expect.extend(matchers)

// Run cleanup after each test
afterEach(() => {
  cleanup()
})
```

### Vite Configuration

Update `vite.config.ts`:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3002',
        changeOrigin: true,
      },
    },
  },
})
```

## 3. Project Structure Setup

Create the directory structure:

```bash
# Create main directories
mkdir -p src/assets
mkdir -p src/components/common
mkdir -p src/components/layout
mkdir -p src/components/t2p
mkdir -p src/components/agents
mkdir -p src/context
mkdir -p src/hooks
mkdir -p src/pages/Dashboard
mkdir -p src/pages/TaskManager
mkdir -p src/pages/AgentCompetition
mkdir -p src/pages/Settings
mkdir -p src/services/api
mkdir -p src/services/t2p
mkdir -p src/services/agents
mkdir -p src/store/task
mkdir -p src/store/agent
mkdir -p src/store/ui
mkdir -p src/types
mkdir -p src/utils
```

## 4. Create Base Files

### CSS Setup

Update `src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;

  color-scheme: light dark;
  color: rgba(255, 255, 255, 0.87);
  background-color: #242424;

  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Dark/light mode support */
@media (prefers-color-scheme: light) {
  :root {
    color: #213547;
    background-color: #ffffff;
  }
}

/* Custom utility classes */
@layer components {
  .card {
    @apply bg-white dark:bg-gray-800 rounded-lg shadow-md p-4;
  }
  
  .btn-primary {
    @apply bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-4 rounded;
  }
  
  .btn-secondary {
    @apply bg-secondary hover:bg-secondary-dark text-white font-semibold py-2 px-4 rounded;
  }
}
```

### Type Definitions

Create `src/types/index.ts`:

```ts
// Task related types
export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'blocked';
  priority: 1 | 2 | 3 | 4 | 5;
  tags: string[];
  category: string;
  createdAt: string;
  updatedAt: string;
  horizon?: 'H1' | 'H2' | 'H3';
  assignedTo?: string;
}

export interface TaskInput {
  title: string;
  description: string;
  status?: Task['status'];
  priority?: Task['priority'];
  tags?: string[];
  category?: string;
  horizon?: 'H1' | 'H2' | 'H3';
  assignedTo?: string;
}

// Agent related types
export interface Agent {
  id: string;
  name: string;
  status: 'active' | 'training' | 'idle' | 'error';
  model: string;
  capabilities: string[];
  performance: AgentPerformance;
  createdAt: string;
  lastActive: string;
}

export interface AgentPerformance {
  score: number;
  tasksCompleted: number;
  averageTime: number;
  cpuUsage: number;
  memoryUsage: number;
}

export interface Competition {
  id: string;
  name: string;
  status: 'scheduled' | 'running' | 'completed' | 'canceled';
  startTime: string;
  endTime?: string;
  participants: string[];
  tasks: string[];
  results?: CompetitionResults;
}

export interface CompetitionResults {
  rankings: AgentRanking[];
  metrics: Record<string, number>;
}

export interface AgentRanking {
  agentId: string;
  score: number;
  position: number;
  metrics: Record<string, number>;
}

// T2P related types
export interface CommandResult {
  command: string;
  output: string;
  success: boolean;
  executionTime: number;
  timestamp: string;
}

export interface CommandIntent {
  intent: string;
  confidence: number;
  entities: Record<string, any>;
  clarification_needed?: boolean;
  suggestions?: string[];
}

// User related types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: boolean;
  dashboardLayout: any;
}

// System related types
export interface SystemHealth {
  cpu: number;
  memory: number;
  storage: number;
  uptime: number;
  lastUpdated: string;
  services: Record<string, ServiceStatus>;
}

export interface ServiceStatus {
  status: 'online' | 'offline' | 'degraded';
  lastChecked: string;
  message?: string;
}
```

### Router Setup

Create `src/App.tsx`:

```tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// Layouts
import MainLayout from './components/layout/MainLayout'

// Lazy-loaded pages
const Dashboard = lazy(() => import('./pages/Dashboard'))
const TaskManager = lazy(() => import('./pages/TaskManager'))
const AgentCompetition = lazy(() => import('./pages/AgentCompetition'))
const Settings = lazy(() => import('./pages/Settings'))
const NotFound = lazy(() => import('./pages/NotFound'))

// Loading component
const Loading = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
)

function App() {
  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} />
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="tasks/*" element={<TaskManager />} />
            <Route path="agents/*" element={<AgentCompetition />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  )
}

export default App
```

### Index Entry Point

Update `src/index.tsx`:

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

## 5. Create Basic Layout Components

Create `src/components/layout/MainLayout.tsx`:

```tsx
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

const MainLayout = () => {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default MainLayout
```

Create `src/components/layout/Sidebar.tsx`:

```tsx
import { NavLink } from 'react-router-dom'
import { 
  Dashboard as DashboardIcon,
  Task as TaskIcon,
  SmartToy as AgentIcon,
  Settings as SettingsIcon
} from '@mui/icons-material'

const Sidebar = () => {
  const navItems = [
    { path: '/', label: 'Dashboard', icon: <DashboardIcon /> },
    { path: '/tasks', label: 'Tasks', icon: <TaskIcon /> },
    { path: '/agents', label: 'Agents', icon: <AgentIcon /> },
    { path: '/settings', label: 'Settings', icon: <SettingsIcon /> },
  ]

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 h-full shadow-md">
      <div className="p-4 border-b dark:border-gray-700">
        <h1 className="text-xl font-bold text-primary">OSPAiN2 Hub</h1>
      </div>
      <nav className="mt-6">
        <ul>
          {navItems.map((item) => (
            <li key={item.path} className="mb-2">
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 ${
                    isActive
                      ? 'bg-primary/10 text-primary dark:text-primary-light border-r-4 border-primary'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`
                }
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}

export default Sidebar
```

Create `src/components/layout/Header.tsx`:

```tsx
import { useState } from 'react'
import { Search as SearchIcon, Notifications as NotificationsIcon, Person as PersonIcon } from '@mui/icons-material'

const Header = () => {
  const [searchTerm, setSearchTerm] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Searching for:', searchTerm)
    // Implement search functionality
  }

  return (
    <header className="bg-white dark:bg-gray-800 shadow py-4 px-6 flex items-center justify-between">
      <form onSubmit={handleSearch} className="w-1/3">
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 rounded-lg w-full border dark:border-gray-600 bg-gray-100 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <SearchIcon className="absolute left-3 top-2.5 text-gray-500 dark:text-gray-400" />
        </div>
      </form>
      
      <div className="flex items-center space-x-4">
        <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
          <NotificationsIcon className="text-gray-600 dark:text-gray-300" />
        </button>
        <div className="border-l border-gray-300 dark:border-gray-600 h-6 mx-2"></div>
        <div className="flex items-center">
          <button className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
            <PersonIcon className="text-gray-600 dark:text-gray-300" />
            <span className="text-gray-700 dark:text-gray-300">User</span>
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
```

## 6. Create Placeholder Pages

Create `src/pages/Dashboard/index.tsx`:

```tsx
const Dashboard = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Task Overview</h2>
        <p>Placeholder for task overview</p>
      </div>
      
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Agent Status</h2>
        <p>Placeholder for agent status</p>
      </div>
      
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">System Health</h2>
        <p>Placeholder for system health</p>
      </div>
      
      <div className="card md:col-span-2">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <p>Placeholder for recent activity</p>
      </div>
      
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">T2P Command Input</h2>
        <p>Placeholder for T2P command input</p>
      </div>
      
      <div className="card lg:col-span-2">
        <h2 className="text-xl font-semibold mb-4">Knowledge Graph Overview</h2>
        <p>Placeholder for knowledge graph visualization</p>
      </div>
    </div>
  )
}

export default Dashboard
```

Create `src/pages/TaskManager/index.tsx`:

```tsx
const TaskManager = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Task Manager</h1>
      <p>Task management interface will be implemented here</p>
    </div>
  )
}

export default TaskManager
```

Create `src/pages/AgentCompetition/index.tsx`:

```tsx
const AgentCompetition = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Agent Competition</h1>
      <p>Agent competition interface will be implemented here</p>
    </div>
  )
}

export default AgentCompetition
```

Create `src/pages/Settings/index.tsx`:

```tsx
const Settings = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <p>Settings interface will be implemented here</p>
    </div>
  )
}

export default Settings
```

Create `src/pages/NotFound.tsx`:

```tsx
import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-6xl font-bold text-gray-300">404</h1>
      <p className="text-xl mb-8">Page not found</p>
      <Link to="/" className="btn-primary">
        Go to Dashboard
      </Link>
    </div>
  )
}

export default NotFound
```

## 7. Initial State Management

Create `src/store/task/taskStore.ts`:

```ts
import { create } from 'zustand'
import { Task, TaskInput } from '@/types'

interface TaskState {
  tasks: Task[];
  selectedTask: Task | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchTasks: () => Promise<void>;
  addTask: (task: TaskInput) => Promise<void>;
  updateTask: (id: string, task: TaskInput) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  selectTask: (id: string | null) => void;
}

// Mock data for initial development
const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Update T2P API documentation',
    description: 'Create comprehensive documentation for the T2P API endpoints and usage',
    status: 'not-started',
    priority: 2,
    tags: ['api', 'docs', 't2p'],
    category: 'Documentation',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    horizon: 'H1',
  },
  {
    id: '2',
    title: 'Implement agent competition interface',
    description: 'Create the UI for the agent competition dashboard',
    status: 'in-progress',
    priority: 1,
    tags: ['ui', 'agents', 'competition'],
    category: 'Engineering',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    horizon: 'H1',
  },
]

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: mockTasks,
  selectedTask: null,
  isLoading: false,
  error: null,
  
  fetchTasks: async () => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      set({ tasks: mockTasks, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
  
  addTask: async (task: TaskInput) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      const newTask: Task = {
        id: Math.random().toString(36).substr(2, 9),
        ...task,
        status: task.status || 'not-started',
        priority: task.priority || 3,
        tags: task.tags || [],
        category: task.category || 'Uncategorized',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      set({ tasks: [...get().tasks, newTask], isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
  
  updateTask: async (id: string, taskInput: TaskInput) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      const updatedTasks = get().tasks.map(task => 
        task.id === id 
          ? { ...task, ...taskInput, updatedAt: new Date().toISOString() } 
          : task
      );
      set({ 
        tasks: updatedTasks, 
        selectedTask: get().selectedTask?.id === id 
          ? { ...get().selectedTask, ...taskInput, updatedAt: new Date().toISOString() } 
          : get().selectedTask,
        isLoading: false 
      });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
  
  deleteTask: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      set({ 
        tasks: get().tasks.filter(task => task.id !== id), 
        selectedTask: get().selectedTask?.id === id ? null : get().selectedTask,
        isLoading: false 
      });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
  
  selectTask: (id: string | null) => {
    if (!id) {
      set({ selectedTask: null });
      return;
    }
    const task = get().tasks.find(task => task.id === id) || null;
    set({ selectedTask: task });
  },
}));
```

## 8. Service Setup

Create `src/services/api/apiClient.ts`:

```ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

class ApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string = '/api') {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add authorization token if available
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        // Handle common errors
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          if (error.response.status === 401) {
            // Handle unauthorized
            console.error('Unauthorized access');
            // Redirect to login or refresh token
          } else if (error.response.status === 403) {
            // Handle forbidden
            console.error('Forbidden access');
          } else if (error.response.status === 404) {
            // Handle not found
            console.error('Resource not found');
          } else if (error.response.status >= 500) {
            // Handle server error
            console.error('Server error');
          }
        } else if (error.request) {
          // The request was made but no response was received
          console.error('No response received');
        } else {
          // Something happened in setting up the request
          console.error('Error setting up request', error.message);
        }
        return Promise.reject(error);
      }
    );
  }

  public async get<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.client.get<T>(url, config);
  }

  public async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.client.post<T>(url, data, config);
  }

  public async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.client.put<T>(url, data, config);
  }

  public async delete<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.client.delete<T>(url, config);
  }

  public async patch<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.client.patch<T>(url, data, config);
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient();
```

## 9. Start the Development Server

Run the development server:

```bash
npm run dev
```

This will start the development server and load the new frontend.

## Next Steps

After the initial setup, continue with:

1. Implement base components in `src/components/common`
2. Create the T2P integration components in `src/components/t2p`
3. Build out the Agent Competition interface
4. Implement the Task Management system
5. Connect to the backend API endpoints
6. Add comprehensive tests for all components

This setup provides a solid foundation for the new OSPAiN2-hub frontend with modern architecture and scalable design patterns. 