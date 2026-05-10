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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;


const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

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
  let baseUrl = '';
  if (typeof window !== 'undefined') {
    baseUrl = window.localStorage.getItem(LOOKUP_API_URL_STORAGE) || API_BASE_URL || '';
  } else {
    baseUrl = API_BASE_URL || '';
  }
  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
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
  const privateKey = getLookupPrivateKey();
  const response = await axios.get(`/api/check-all`, {
    baseURL: getLookupApiBaseUrl(),
    withCredentials: true,
    params: { phone, force: force ? 1 : 0 },
    headers: privateKey ? { 'x-private-key': privateKey } : undefined,
  });
  return response.data;
};

export const lookupPhoneBank = async (phone: string): Promise<any> => {
  const privateKey = getLookupPrivateKey();
  const response = await axios.get(`/api/check-bank`, {
    baseURL: getLookupApiBaseUrl(),
    withCredentials: true,
    params: { phone },
    headers: privateKey ? { 'x-private-key': privateKey } : undefined,
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

export const getPublicSettings = async (): Promise<PublicSettings> => {
  const response = await apiClient.get(`/api/public-settings`);
  return response.data;
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
