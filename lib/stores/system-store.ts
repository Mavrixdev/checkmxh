import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type SystemState = 'setup' | 'offline' | 'connecting' | 'online';

interface SystemStore {
  systemState: SystemState;
  apiUrl: string;
  apiConnected: boolean;
  setupCompleted: boolean;
  lastConnectionCheck: number;
  
  // Actions
  setSystemState: (state: SystemState) => void;
  setApiUrl: (url: string) => void;
  setApiConnected: (connected: boolean) => void;
  setSetupCompleted: (completed: boolean) => void;
  updateLastCheck: () => void;
  reset: () => void;
}

export const useSystemStore = create<SystemStore>()(
  persist(
    (set) => ({
      systemState: 'offline',
      apiUrl: '',
      apiConnected: false,
      setupCompleted: false,
      lastConnectionCheck: 0,

      setSystemState: (state) => set({ systemState: state }),
      setApiUrl: (url) => set({ apiUrl: url }),
      setApiConnected: (connected) => set({ apiConnected: connected }),
      setSetupCompleted: (completed) => set({ setupCompleted: completed }),
      updateLastCheck: () => set({ lastConnectionCheck: Date.now() }),
      reset: () => set({
        systemState: 'setup',
        apiUrl: '',
        apiConnected: false,
        setupCompleted: false,
        lastConnectionCheck: 0
      }),
    }),
    {
      name: 'mavrix-system-storage',
    }
  )
);
