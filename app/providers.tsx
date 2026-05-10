'use client';

import { QueryClient, QueryClientProvider as TanstackQueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useMemo } from 'react';
import { SiteMetadata } from '@/components/site-metadata';

export function Providers({ children }: { children: ReactNode }) {
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,
            gcTime: 1000 * 60 * 30,
          },
        },
      }),
    []
  );

  return (
    <TanstackQueryClientProvider client={queryClient}>
      <SiteMetadata />
      {children}
    </TanstackQueryClientProvider>
  );
}
