'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { useHealth } from '@/hooks/useAdminData';
import { Activity, Database, Zap, Search } from 'lucide-react';
import { formatUptime } from '@/lib/utils-dashboard';
import { useLanguage } from '@/hooks/use-language';

export function HealthWidget() {
  const { t } = useLanguage();
  const { data: health, isLoading } = useHealth();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'degraded':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'unhealthy':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getDbStatus = (status: string) => {
    return status === 'connected'
      ? 'bg-green-500/20 text-green-400 border-green-500/30'
      : 'bg-red-500/20 text-red-400 border-red-500/30';
  };

  if (isLoading) {
    return (
      <Card className="rounded-md border border-slate-800/80 bg-slate-950/55 p-5 py-5 shadow-none">
        <h3 className="mb-4 text-lg font-semibold text-white">{t('health')}</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded-md bg-slate-800/50" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden rounded-md border border-slate-800/80 bg-slate-950/55 p-0 shadow-none">
      <div className="border-b border-slate-800/80 bg-slate-900/35 px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-white">{t('health')}</h3>
            <p className="mt-1 text-sm text-slate-500">Runtime, MongoDB, queue</p>
          </div>
          <div className={`rounded-full border px-3 py-1 text-xs font-medium ${getStatusColor(health?.status || 'unknown')}`}>
            {health?.status?.toUpperCase()}
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1 }}
        className="space-y-4 p-5"
      >
        {/* Overall Status */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between rounded-md border border-slate-800/80 bg-slate-900/30 px-3 py-2.5">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-300">{t('overall_status')}</span>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(health?.status || 'unknown')}`}>
            {health?.status?.toUpperCase()}
          </div>
        </motion.div>

        {/* Uptime */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="flex items-center justify-between rounded-md border border-slate-800/80 bg-slate-900/30 px-3 py-2.5">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-300">{t('uptime')}</span>
          </div>
          <span className="text-white font-mono text-sm">{formatUptime(health?.uptime || 0)}</span>
        </motion.div>

        {/* MongoDB */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex items-center justify-between rounded-md border border-slate-800/80 bg-slate-900/30 px-3 py-2.5">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-300">{t('mongodb_status')}</span>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getDbStatus(health?.mongodb || 'unknown')}`}>
            {health?.mongodb?.toUpperCase()}
          </div>
        </motion.div>

        {/* Queue Status */}
        {health?.queue && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <div className="text-slate-300 text-sm mb-2">{t('queue_status')}</div>
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-md border border-slate-800/80 bg-slate-900/40 p-3 text-center">
                <p className="text-slate-500 text-xs">{t('pending')}</p>
                <p className="text-white font-mono font-bold">{health.queue.pending}</p>
              </div>
              <div className="rounded-md border border-slate-800/80 bg-slate-900/40 p-3 text-center">
                <p className="text-slate-500 text-xs">{t('in_progress')}</p>
                <p className="text-white font-mono font-bold">{health.queue.size}</p>
              </div>
              <div className="rounded-md border border-slate-800/80 bg-slate-900/40 p-3 text-center">
                <p className="text-slate-500 text-xs">{t('total')}</p>
                <p className="text-white font-mono font-bold">{health.queue.total}</p>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </Card>
  );
}
