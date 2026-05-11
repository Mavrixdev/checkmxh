import axios from 'axios';
import {
  LookupResult,
  Stats,
  HealthStatus,
  LogEntry,
  AppSettings,
  MongoCollectionsResponse,
  MongoDocument,
  MongoDocumentsResponse,
  PublicSettings,
} from '@/types';

const getStoredApiUrl = () => {
  if (typeof window === 'undefined') return process.env.NEXT_PUBLIC_API_URL || '';
  
  // Try to get from Zustand persist storage
  try {
    const storage = window.localStorage.getItem('mavrix-system-storage');
    if (storage) {
      const parsed = JSON.parse(storage);
      if (parsed.state?.apiUrl) {
        const url = parsed.state.apiUrl;
        return url.endsWith('/') ? url.slice(0, -1) : url;
      }
    }
  } catch (e) {
    console.error('Error parsing system storage:', e);
  }

  const url = process.env.NEXT_PUBLIC_API_URL || '';
  return url.endsWith('/') ? url.slice(0, -1) : url;
};

const apiClient = axios.create({
  baseURL: getStoredApiUrl(),
  withCredentials: true,
  validateStatus: (status) => status < 500, // Chấp nhận tất cả mã 4xx để không bị đỏ Console
});

import { useSystemStore } from './stores/system-store';

// Update baseURL dynamically when needed
apiClient.interceptors.request.use((config) => {
  const currentBaseUrl = getStoredApiUrl();
  if (config.baseURL !== currentBaseUrl) {
    config.baseURL = currentBaseUrl;
  }

  // SILENCE LOGS: If we know we're offline, don't even try to request (prevents red console errors)
  const isHealthCheck = config.url?.includes('public-settings') || config.url?.includes('health');
  const store = useSystemStore.getState();
  
  if (store.setupCompleted && !store.apiConnected && !isHealthCheck) {
    // We abort the request before it even starts
    const controller = new AbortController();
    config.signal = controller.signal;
    controller.abort('System offline');
  }

  return config;
});

// SILENCE NUCLEAR OPTION: Catch all network errors and force offline
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // If it's a network error (no response) or aborted by us
    const isNetworkError = !error.response || error.code === 'ERR_NETWORK' || error.message === 'Network Error';
    const isSilentAbort = error.message === 'System offline' || error.code === 'ERR_CANCELED';

    if (isNetworkError || isSilentAbort) {
      const store = useSystemStore.getState();
      if (store.apiConnected) {
        useSystemStore.setState({ apiConnected: false, systemState: 'offline' });
      }
      // Return a pending promise that never resolves to "hang" the request 
      // and prevent further error processing in the UI/Console
      return new Promise(() => {}); 
    }
    return Promise.reject(error);
  }
);

// Add a request interceptor to attach the private key to admin requests
apiClient.interceptors.request.use((config) => {
  const privateKey = getLookupPrivateKey();
  if (privateKey) {
    config.headers['x-private-key'] = privateKey;
  }
  return config;
});

const PRIVATE_KEY_STORAGE = 'mavrix_lookup_private_key';
const LOOKUP_API_URL_STORAGE = 'mavrix_lookup_api_base_url';

export const getLookupPrivateKey = () => {
  if (typeof window === 'undefined') return process.env.NEXT_PUBLIC_API_PRIVATE_KEY || '';
  
  // Hidden activation: ?key=your_key will save it to localStorage
  const urlParams = new URLSearchParams(window.location.search);
  const urlKey = urlParams.get('key');
  if (urlKey) {
    window.localStorage.setItem(PRIVATE_KEY_STORAGE, urlKey);
    // Optional: clean up URL
    try {
      const newUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, '', newUrl);
    } catch (e) {}
  }
  
  // Background key from env var
  const backgroundKey = process.env.NEXT_PUBLIC_API_PRIVATE_KEY || '';
  // Manual key override from localStorage
  const manualKey = window.localStorage.getItem(PRIVATE_KEY_STORAGE);
  
  return manualKey || backgroundKey;
};

export const setLookupPrivateKey = (key: string) => {
  if (typeof window === 'undefined') return;
  const value = key.trim();
  if (value) {
    window.localStorage.setItem(PRIVATE_KEY_STORAGE, value);
  } else {
    window.localStorage.removeItem(PRIVATE_KEY_STORAGE);
  }
};

export const getLookupApiBaseUrl = () => {
  return getStoredApiUrl();
};

export const setLookupApiBaseUrl = (baseUrl: string) => {
  if (typeof window === 'undefined') return;
  const value = baseUrl.trim();
  if (value) {
    window.localStorage.setItem(LOOKUP_API_URL_STORAGE, value);
  } else {
    window.localStorage.removeItem(LOOKUP_API_URL_STORAGE);
  }
};

// --- Phone Lookup APIs ---

export const lookupPhone = async (phone: string, force: boolean = false): Promise<LookupResult> => {
  const response = await apiClient.get(`/api/check-all`, {
    params: { phone, force: force ? 1 : 0 },
  });
  return response.data;
};

export const lookupPhoneBank = async (phone: string): Promise<any> => {
  const response = await apiClient.get(`/api/check-bank`, {
    params: { phone },
  });
  return response.data;
};

// --- Admin APIs ---

export const login = async (password: string): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.post(`/api/login`, { password });
  return response.data;
};

export const logout = async (): Promise<{ success: boolean }> => {
  const response = await apiClient.get(`/api/logout`);
  return response.data;
};

export const getStats = async (): Promise<Stats> => {
  const response = await apiClient.get(`/api/stats`);
  return response.data;
};

export const getHealth = async (): Promise<HealthStatus> => {
  const response = await apiClient.get(`/api/health`);
  return response.data;
};

export const getLatestLookups = async (limit: number = 10): Promise<LookupResult[]> => {
  const response = await apiClient.get(`/api/latest`, {
    params: { limit },
  });
  return response.data;
};

export const getLogs = async (limit: number = 50): Promise<LogEntry[]> => {
  const response = await apiClient.get(`/api/logs`, {
    params: { limit },
  });
  return response.data;
};

export const searchDatabase = async (query: string): Promise<LookupResult[]> => {
  const response = await apiClient.get(`/api/search`, {
    params: { q: query },
  });
  return response.data;
};

export const clearCache = async (): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.get(`/api/clear-cache`);
  return response.data;
};

export const deleteLookup = async (id: string): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.delete(`/api/lookup/${id}`);
  return response.data;
};

export const updateLookup = async (id: string, data: Partial<LookupResult>): Promise<{ success: boolean; data: LookupResult }> => {
  const response = await apiClient.put(`/api/lookup/${id}`, data);
  return response.data;
};

export const exportData = async (): Promise<any> => {
  const response = await apiClient.get(`/api/export`);
  return response.data;
};

let lastFetchAttempt = 0;
let settingsSnapshot: PublicSettings | null = null;

export const getPublicSettings = async (): Promise<PublicSettings> => {
  const store = useSystemStore.getState();
  const now = Date.now();

  // 1. Try to load from snapshot in localStorage first
  if (!settingsSnapshot) {
    try {
      const saved = localStorage.getItem('mavrix-settings-snapshot');
      if (saved) settingsSnapshot = JSON.parse(saved);
    } catch (e) {}
  }

  // 2. If we are offline or setup not done, return snapshot (or default) immediately
  // Never try to fetch if we know we are offline to prevent red console errors
  if (!store.apiConnected || !store.setupCompleted) {
    if (settingsSnapshot) return settingsSnapshot;
    throw new Error('Offline');
  }

  // 3. Rate limit even for successful online mode (throttle to 30s)
  if (settingsSnapshot && (now - lastFetchAttempt < 30000)) {
    return settingsSnapshot;
  }

  try {
    lastFetchAttempt = now;
    const response = await apiClient.get(`/api/public-settings`);
    const data = response.data as PublicSettings;
    settingsSnapshot = data;
    // Save snapshot for offline use
    localStorage.setItem('mavrix-settings-snapshot', JSON.stringify(data));
    return data;
  } catch (error) {
    // FAIL FAST: If this fails, the server is likely down.
    // Force offline state immediately to stop other components from trying
    useSystemStore.setState({ apiConnected: false, systemState: 'offline' });
    
    if (settingsSnapshot) return settingsSnapshot;
    // If absolutely no settings, return a minimal safe default
    return {
      site: { title: 'MavrixCheck', description: '', keywords: '', iconUrl: '' },
      api: { baseUrl: store.apiUrl, requirePrivateKey: false },
      updatedAt: new Date().toISOString()
    };
  }
};

export const getAdminSettings = async (): Promise<AppSettings> => {
  const response = await apiClient.get(`/api/settings`);
  return response.data;
};

export const updateAdminSettings = async (
  settings: AppSettings,
): Promise<{ success: boolean; data: AppSettings }> => {
  const response = await apiClient.put(`/api/settings`, settings);
  return response.data;
};

// --- Generic MongoDB Admin APIs ---

export interface MongoDocumentQuery {
  page?: number;
  limit?: number;
  q?: string;
  filter?: string;
  sort?: string;
}

const mongoCollectionPath = (collection: string) => encodeURIComponent(collection);

export const getMongoCollections = async (): Promise<MongoCollectionsResponse> => {
  const response = await apiClient.get(`/api/mongo/collections`);
  return response.data;
};

export const getMongoDocuments = async (
  collection: string,
  params: MongoDocumentQuery = {},
): Promise<MongoDocumentsResponse> => {
  const response = await apiClient.get(`/api/mongo/${mongoCollectionPath(collection)}/documents`, {
    params,
  });
  return response.data;
};

export const createMongoDocument = async (
  collection: string,
  document: MongoDocument,
): Promise<{ success: boolean; data: MongoDocument }> => {
  const response = await apiClient.post(`/api/mongo/${mongoCollectionPath(collection)}/documents`, {
    document,
  });
  return response.data;
};

export const updateMongoDocument = async (
  collection: string,
  id: string,
  document: MongoDocument,
): Promise<{ success: boolean; data: MongoDocument }> => {
  const response = await apiClient.put(
    `/api/mongo/${mongoCollectionPath(collection)}/documents/${encodeURIComponent(id)}`,
    { document },
  );
  return response.data;
};

export const deleteMongoDocument = async (
  collection: string,
  id: string,
): Promise<{ success: boolean; deletedCount: number }> => {
  const response = await apiClient.delete(
    `/api/mongo/${mongoCollectionPath(collection)}/documents/${encodeURIComponent(id)}`,
  );
  return response.data;
};

export const exportMongoDocuments = async (
  collection: string,
  params: MongoDocumentQuery = {},
): Promise<MongoDocument[]> => {
  const response = await apiClient.get(`/api/mongo/${mongoCollectionPath(collection)}/export`, {
    params,
  });
  return response.data;
};
