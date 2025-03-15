# OSPAiN2-Hub Frontend Setup Instructions

## Prerequisites

Before starting with the OSPAiN2-Hub frontend development, ensure you have the following installed:

- Node.js (v18.0.0 or higher)
- npm (v8.0.0 or higher) or yarn (v1.22.0 or higher)
- Git

## Setting Up the Development Environment

### 1. Clone the Repository

```bash
# If starting from scratch
git clone https://github.com/yourusername/OSPAiN2.git
cd OSPAiN2

# Create new directory for frontend rebuild
mkdir -p OSPAiN2-hub-new
cd OSPAiN2-hub-new
```

### 2. Initialize the Project

```bash
# Using npm
npm init -y

# Using yarn
yarn init -y
```

### 3. Install Vite

```bash
# Using npm
npm install --save-dev vite @vitejs/plugin-react

# Using yarn
yarn add --dev vite @vitejs/plugin-react
```

### 4. Setup TypeScript

```bash
# Using npm
npm install --save-dev typescript @types/react @types/react-dom @types/node

# Using yarn
yarn add --dev typescript @types/react @types/react-dom @types/node
```

Create a `tsconfig.json` file:

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

Create a `tsconfig.node.json` file:

```json
{
  "compilerOptions": {
    "composite": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

### 5. Install Core Dependencies

```bash
# Using npm
npm install react react-dom react-router-dom zustand @tanstack/react-query axios

# Using yarn
yarn add react react-dom react-router-dom zustand @tanstack/react-query axios
```

### 6. Install UI and Styling Dependencies

```bash
# Using npm
npm install tailwindcss postcss autoprefixer @headlessui/react @heroicons/react

# Using yarn
yarn add tailwindcss postcss autoprefixer @headlessui/react @heroicons/react
```

Initialize Tailwind CSS:

```bash
npx tailwindcss init -p
```

Update the `tailwind.config.js` file:

```javascript
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
          50: '#e6f1f8',
          100: '#cce3f1',
          200: '#99c7e3',
          300: '#66abd5',
          400: '#338fc7',
          500: '#3498db', // Primary color
          600: '#2980b9',
          700: '#1f6897',
          800: '#154f76',
          900: '#0b2d44',
        },
        secondary: {
          50: '#e8f8ef',
          100: '#d0f0df',
          200: '#a1e2bf',
          300: '#72d39f',
          400: '#43c57f',
          500: '#2ecc71', // Secondary color
          600: '#25ad5e',
          700: '#1c874a',
          800: '#146237',
          900: '#0b3c21',
        },
        accent: {
          50: '#f4ecf7',
          100: '#e9d9ef',
          200: '#d4b3df',
          300: '#be8dcf',
          400: '#a967c0',
          500: '#9b59b6', // Accent color
          600: '#844ca0',
          700: '#683c7e',
          800: '#4d2d5d',
          900: '#33203f',
        },
      },
    },
  },
  plugins: [],
}
```

### 7. Install Development Tools

```bash
# Using npm
npm install --save-dev eslint eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-import eslint-plugin-jsx-a11y prettier eslint-plugin-prettier eslint-config-prettier husky lint-staged

# Using yarn
yarn add --dev eslint eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-import eslint-plugin-jsx-a11y prettier eslint-plugin-prettier eslint-config-prettier husky lint-staged
```

### 8. Setup ESLint and Prettier

Create an `.eslintrc.js` file:

```javascript
module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:jsx-a11y/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['react', '@typescript-eslint', 'prettier'],
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'prettier/prettier': 'error',
  },
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      typescript: {},
    },
  },
};
```

Create a `.prettierrc` file:

```json
{
  "semi": true,
  "tabWidth": 2,
  "printWidth": 100,
  "singleQuote": true,
  "trailingComma": "es5",
  "bracketSpacing": true,
  "jsxBracketSameLine": false,
  "arrowParens": "avoid"
}
```

### 9. Setup Testing

```bash
# Using npm
npm install --save-dev vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event

# Using yarn
yarn add --dev vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

Create a `vitest.config.ts` file:

```typescript
/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
```

Create a `src/test/setup.ts` file:

```typescript
import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with Testing Library matchers
expect.extend(matchers);

// Clean up after each test
afterEach(() => {
  cleanup();
});
```

### 10. Setup Vite Configuration

Create a `vite.config.ts` file:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
```

### 11. Create Basic Project Structure

Create the following directories:

```bash
mkdir -p src/assets src/components/common src/components/layout src/components/visualization src/components/t2p src/hooks src/pages src/services/api src/services/t2p src/services/agent src/store src/types src/utils
```

### 12. Create HTML Entry Point

Create an `index.html` file in the root directory:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>OSPAiN2-Hub</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### 13. Create Main Entry Files

Create `src/main.tsx`:

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

Create `src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --color-primary: theme('colors.primary.500');
    --color-secondary: theme('colors.secondary.500');
    --color-accent: theme('colors.accent.500');
  }

  body {
    @apply bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-50;
    @apply min-h-screen;
  }
}
```

Create `src/App.tsx`:

```typescript
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppRoutes from './router';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppRoutes />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
```

Create `src/router.tsx`:

```typescript
import { Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import T2PPage from './pages/T2PPage';
import AgentsPage from './pages/AgentsPage';
import TasksPage from './pages/TasksPage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="t2p" element={<T2PPage />} />
        <Route path="agents" element={<AgentsPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
```

### 14. Setup Basic Components

Create `src/components/layout/MainLayout.tsx`:

```typescript
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

const MainLayout = () => {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
```

### 15. Update package.json Scripts

Update the `package.json` scripts section:

```json
"scripts": {
  "dev": "vite",
  "build": "tsc && vite build",
  "preview": "vite preview",
  "test": "vitest",
  "test:ui": "vitest --ui",
  "test:coverage": "vitest run --coverage",
  "lint": "eslint src --ext .ts,.tsx",
  "lint:fix": "eslint src --ext .ts,.tsx --fix",
  "format": "prettier --write \"src/**/*.{ts,tsx,css}\"",
  "typecheck": "tsc --noEmit"
}
```

### 16. Add Base API Service

Create `src/services/api/apiClient.ts`:

```typescript
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

export class APIClient {
  private client: AxiosInstance;

  constructor(baseURL: string = '/api') {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        // Handle errors globally
        console.error('API Error:', error);
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.get(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.post(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.put(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.delete(url, config);
    return response.data;
  }
}

// Export singleton instance
export const apiClient = new APIClient();
```

### 17. Add Base Zustand Store

Create `src/store/index.ts`:

```typescript
import { create } from 'zustand';

// UI Store
interface UIState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  theme: 'light',
  toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
}));

// Add other stores as needed
```

## Running the Application

```bash
# Development mode
npm run dev
# or
yarn dev

# Build for production
npm run build
# or
yarn build

# Preview production build
npm run preview
# or
yarn preview
```

## Testing

```bash
# Run all tests
npm test
# or
yarn test

# Run tests with UI
npm run test:ui
# or
yarn test:ui

# Generate test coverage report
npm run test:coverage
# or
yarn test:coverage
```

## Linting and Formatting

```bash
# Lint code
npm run lint
# or
yarn lint

# Fix linting issues
npm run lint:fix
# or
yarn lint:fix

# Format code
npm run format
# or
yarn format

# Check TypeScript types
npm run typecheck
# or
yarn typecheck
```

## Implementation Steps

After setting up the development environment, follow these steps to implement the frontend:

1. Create the core layout components (Header, Sidebar, etc.)
2. Implement the basic routing structure
3. Create reusable UI components
4. Implement state management with Zustand
5. Create API services for backend communication
6. Implement the dashboard page
7. Implement the T2P Engine interface
8. Implement the Agent Competition interface
9. Implement the Task Management interface
10. Implement the Settings interface
11. Add responsive design and theming
12. Write tests for all components
13. Optimize performance
14. Document all components and architecture

## Additional Resources

- [Vite Documentation](https://vitejs.dev/guide/)
- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [React Router Documentation](https://reactrouter.com/docs/en/v6)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Vitest Documentation](https://vitest.dev/guide/) 