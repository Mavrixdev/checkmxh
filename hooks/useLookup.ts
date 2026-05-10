import { useQuery } from '@tanstack/react-query';
import { lookupPhone } from '@/lib/api';
import { LookupResult } from '@/types';

export const useLookup = (phone: string | null, force = false, enabled = true) => {
  return useQuery({
    queryKey: ['lookup', phone, force],
    queryFn: async () => {
      if (!phone) return null;
      return await lookupPhone(phone, force);
    },
    enabled: !!phone && enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    refetchOnWindowFocus: false, // Không quét lại khi chuyển tab
    refetchOnReconnect: false,   // Không quét lại khi có mạng lại
    refetchOnMount: false,       // Không quét lại khi component mount
  }) as any;
};
