import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LookupResult, AdminSession } from '@/types';

interface SearchStore {
  results: LookupResult | null;
  history: string[];
  loading: boolean;
  error: string | null;
  setResults: (results: LookupResult | null) => void;
  addToHistory: (phone: string) => void;
  clearHistory: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  removeFromHistory: (phone: string) => void;
}

interface AdminStore {
  session: AdminSession;
  setAuthenticated: (authenticated: boolean, sessionId?: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useSearchStore = create<SearchStore>()(
  persist(
    (set) => ({
      results: null,
      history: [],
      loading: false,
      error: null,
      setResults: (results) => set({ results }),
      addToHistory: (phone) =>
        set((state) => {
          const filtered = state.history.filter((h) => h !== phone);
          return { history: [phone, ...filtered].slice(0, 5) }; // Keep top 5 recent searches
        }),
      clearHistory: () => set({ history: [] }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      removeFromHistory: (phone) =>
        set((state) => ({
          history: state.history.filter((h) => h !== phone),
        })),
    }),
    {
      name: 'mavrix-search-storage', // key in localStorage
      partialize: (state) => ({ history: state.history }), // only save history
    }
  )
);

export const useAdminStore = create<AdminStore>((set) => ({
  session: { isAuthenticated: false },
  setAuthenticated: (authenticated, sessionId) =>
    set({
      session: {
        isAuthenticated: authenticated,
        sessionId,
      },
    }),
  logout: () => set({ session: { isAuthenticated: false } }),
  isAuthenticated: () => {
    const state = useAdminStore.getState();
    return state.session.isAuthenticated;
  },
}));
