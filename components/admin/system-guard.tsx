'use client';

import { useEffect, useState } from 'react';
import { useSystemStore } from '@/lib/stores/system-store';
import { syncSystemState } from '@/lib/api/manager';
import { SetupMode } from './setup-mode';
import { OfflineMode } from './offline-mode';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface SystemGuardProps {
  children: React.ReactNode;
}

export function SystemGuard({ children }: SystemGuardProps) {
  const { systemState, setupCompleted, apiUrl } = useSystemStore();
  const [isHydrated, setIsHydrated] = useState(false);

  // Handle hydration to avoid mismatch with SSR
  useEffect(() => {
    setIsHydrated(true);
    syncSystemState();

    // Set up a periodic health check every 60 seconds
    const interval = setInterval(() => {
      if (setupCompleted && apiUrl) {
        syncSystemState();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [setupCompleted, apiUrl]);

  if (!isHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {systemState === 'setup' && (
        <motion.div
          key="setup"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <SetupMode />
        </motion.div>
      )}

      {systemState === 'offline' && (
        <motion.div
          key="offline"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <OfflineMode />
        </motion.div>
      )}

      {systemState === 'connecting' && (
        <motion.div
          key="connecting"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-4 text-center"
        >
          <div className="relative">
            <div className="absolute inset-0 animate-ping rounded-full bg-cyan-500/20" />
            <Loader2 className="relative h-12 w-12 animate-spin text-cyan-500" />
          </div>
          <h2 className="mt-6 text-xl font-medium text-white">Đang kết nối tới hệ thống...</h2>
          <p className="mt-2 text-slate-400">Vui lòng chờ trong giây lát</p>
        </motion.div>
      )}

      {systemState === 'online' && (
        <motion.div
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
