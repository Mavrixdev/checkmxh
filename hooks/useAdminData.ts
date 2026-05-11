import { useQuery } from '@tanstack/react-query';
import {
  getStats,
  getHealth,
  getLatestLookups,
  getLogs,
  getAdminSettings,
  getMongoCollections,
  getMongoDocuments,
  getPublicSettings,
  MongoDocumentQuery,
} from '@/lib/api';
import { useSystemStore } from '@/lib/stores/system-store';

export const useStats = () => {
  const { apiConnected } = useSystemStore();
  return useQuery({
    queryKey: ['stats'],
    queryFn: getStats,
    enabled: apiConnected,
    refetchInterval: 1000 * 30, // 30 seconds
    staleTime: 1000 * 10, // 10 seconds
  });
};

export const useHealth = () => {
  const { apiConnected } = useSystemStore();
  return useQuery({
    queryKey: ['health'],
    queryFn: getHealth,
    enabled: apiConnected,
    refetchInterval: 1000 * 15, // 15 seconds
    staleTime: 1000 * 5, // 5 seconds
  });
};

export const useLatestLookups = (limit = 10) => {
  const { apiConnected } = useSystemStore();
  return useQuery({
    queryKey: ['latest', limit],
    queryFn: () => getLatestLookups(limit),
    enabled: apiConnected,
    refetchInterval: 1000 * 60, // 1 minute
    staleTime: 1000 * 30, // 30 seconds
  });
};

export const useLogs = (limit = 50) => {
  const { apiConnected } = useSystemStore();
  return useQuery({
    queryKey: ['logs', limit],
    queryFn: () => getLogs(limit),
    enabled: apiConnected,
    refetchInterval: 1000 * 30, // 30 seconds
    staleTime: 1000 * 10, // 10 seconds
  });
};

export const useMongoCollections = () => {
  const { apiConnected } = useSystemStore();
  return useQuery({
    queryKey: ['mongo-collections'],
    queryFn: getMongoCollections,
    enabled: apiConnected,
    refetchInterval: 1000 * 60,
    staleTime: 1000 * 15,
  });
};

export const useMongoDocuments = (collection: string, params: MongoDocumentQuery) => {
  const { apiConnected } = useSystemStore();
  return useQuery({
    queryKey: ['mongo-documents', collection, params],
    queryFn: () => getMongoDocuments(collection, params),
    enabled: apiConnected && Boolean(collection),
    staleTime: 1000 * 10,
  });
};

export const usePublicSettings = () => {
  const { apiConnected } = useSystemStore();
  return useQuery({
    queryKey: ['public-settings'],
    queryFn: getPublicSettings,
    enabled: apiConnected,
    staleTime: 1000 * 60,
  });
};

export const useAdminSettings = () => {
  const { apiConnected } = useSystemStore();
  return useQuery({
    queryKey: ['admin-settings'],
    queryFn: getAdminSettings,
    enabled: apiConnected,
    staleTime: 1000 * 15,
  });
};
