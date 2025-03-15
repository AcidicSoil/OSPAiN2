import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// UI Store
interface UIState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      theme: 'light',
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'ui-store',
    }
  )
);

// User Store
interface UserState {
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  } | null;
  isAuthenticated: boolean;
  login: (user: UserState['user']) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'user-store',
    }
  )
);

// T2P Store
interface T2PState {
  history: {
    id: number;
    command: string;
    status: 'success' | 'error';
    time: string;
  }[];
  addToHistory: (command: string, status: 'success' | 'error') => void;
  clearHistory: () => void;
}

export const useT2PStore = create<T2PState>()((set) => ({
  history: [],
  addToHistory: (command, status) =>
    set((state) => ({
      history: [
        {
          id: Date.now(),
          command,
          status,
          time: 'just now',
        },
        ...state.history,
      ].slice(0, 50), // Keep only the last 50 commands
    })),
  clearHistory: () => set({ history: [] }),
}));

// Agent Store
interface AgentState {
  agents: {
    id: string;
    name: string;
    status: 'active' | 'inactive';
    type: string;
  }[];
  selectedAgent: string | null;
  setSelectedAgent: (id: string | null) => void;
}

export const useAgentStore = create<AgentState>()((set) => ({
  agents: [],
  selectedAgent: null,
  setSelectedAgent: (id) => set({ selectedAgent: id }),
})); 