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

export const useStats = () => {
  return useQuery({
    queryKey: ['stats'],
    queryFn: getStats,
    refetchInterval: 1000 * 30, // 30 seconds
    staleTime: 1000 * 10, // 10 seconds
  });
};

export const useHealth = () => {
  return useQuery({
    queryKey: ['health'],
    queryFn: getHealth,
    refetchInterval: 1000 * 15, // 15 seconds
    staleTime: 1000 * 5, // 5 seconds
  });
};

export const useLatestLookups = (limit = 10) => {
  return useQuery({
    queryKey: ['latest', limit],
    queryFn: () => getLatestLookups(limit),
    refetchInterval: 1000 * 60, // 1 minute
    staleTime: 1000 * 30, // 30 seconds
  });
};

export const useLogs = (limit = 50) => {
  return useQuery({
    queryKey: ['logs', limit],
    queryFn: () => getLogs(limit),
    refetchInterval: 1000 * 30, // 30 seconds
    staleTime: 1000 * 10, // 10 seconds
  });
};

export const useMongoCollections = () => {
  return useQuery({
    queryKey: ['mongo-collections'],
    queryFn: getMongoCollections,
    refetchInterval: 1000 * 60,
    staleTime: 1000 * 15,
  });
};

export const useMongoDocuments = (collection: string, params: MongoDocumentQuery) => {
  return useQuery({
    queryKey: ['mongo-documents', collection, params],
    queryFn: () => getMongoDocuments(collection, params),
    enabled: Boolean(collection),
    staleTime: 1000 * 10,
  });
};

export const usePublicSettings = () => {
  return useQuery({
    queryKey: ['public-settings'],
    queryFn: getPublicSettings,
    staleTime: 1000 * 60,
  });
};

export const useAdminSettings = () => {
  return useQuery({
    queryKey: ['admin-settings'],
    queryFn: getAdminSettings,
    staleTime: 1000 * 15,
  });
};
