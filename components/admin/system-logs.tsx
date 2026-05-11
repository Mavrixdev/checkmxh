'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLogs } from '@/hooks/useAdminData';
import { useLanguage } from '@/hooks/use-language';
import { Terminal, AlertCircle, Info, Search as SearchIcon, Copy, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

import { useSystemStore } from '@/lib/stores/system-store';

type LogFilter = 'all' | 'error' | 'lookup' | 'system';

export function SystemLogs() {
  const { t } = useLanguage();
  const { apiConnected } = useSystemStore();
  const { data: logs, isLoading, isFetching, refetch } = useLogs(100);

  if (!apiConnected && !isLoading) {
    return (
      <Card className="overflow-hidden rounded-md border border-slate-800/80 bg-slate-950/55 p-0 shadow-none grayscale opacity-70">
        <div className="border-b border-slate-800/80 bg-slate-900/35 px-4 py-4">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
            <Terminal className="h-5 w-5 text-cyan-400" />
            {t('system_logs')}
          </h3>
        </div>
        <div className="p-12 text-center space-y-3">
          <Terminal className="h-12 w-12 text-slate-700 mx-auto" />
          <p className="text-slate-500 text-sm italic">Logs are unavailable in Offline Mode</p>
        </div>
      </Card>
    );
  }
  const [filter, setFilter] = useState<LogFilter>('all');
  const [query, setQuery] = useState('');

  const filteredLogs = useMemo(() => {
    const source = logs ?? [];
    const search = query.trim().toLowerCase();

    return [...source].reverse().filter((log) => {
      const matchesType = filter === 'all' || log.type === filter;
      const matchesSearch = !search || log.message.toLowerCase().includes(search);
      return matchesType && matchesSearch;
    });
  }, [filter, logs, query]);

  const handleCopyLogs = async () => {
    const text = filteredLogs
      .map((log) => `[${new Date(log.timestamp).toLocaleString()}] ${log.type}: ${log.message}`)
      .join('\n');

    try {
      await navigator.clipboard.writeText(text);
      toast.success('Da copy logs');
    } catch (error) {
      toast.error('Khong copy duoc logs');
    }
  };

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertCircle className="w-3.5 h-3.5 text-red-400" />;
      case 'lookup': return <SearchIcon className="w-3.5 h-3.5 text-cyan-400" />;
      default: return <Info className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const getLogColor = (type: string) => {
    switch (type) {
      case 'error': return 'text-red-400';
      case 'lookup': return 'text-cyan-400';
      default: return 'text-slate-300';
    }
  };

  if (isLoading) {
    return (
      <Card className="rounded-md border border-slate-800/80 bg-slate-950/55 p-5 py-5 shadow-none">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
          <Terminal className="w-5 h-5 text-cyan-400" />
          {t('system_logs')}
        </h3>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-8 w-full bg-slate-800/50" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden rounded-md border border-slate-800/80 bg-slate-950/55 p-0 shadow-none">
      <div className="border-b border-slate-800/80 bg-slate-900/35 px-4 py-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
            <Terminal className="h-5 w-5 text-cyan-400" />
            {t('system_logs')}
            {isFetching && <RefreshCw className="h-4 w-4 animate-spin text-slate-500" />}
          </h3>

          <div className="flex flex-wrap items-center gap-2">
            {(['all', 'error', 'lookup', 'system'] as LogFilter[]).map((item) => (
              <Button
                key={item}
                variant="outline"
                size="sm"
                onClick={() => setFilter(item)}
                className={`h-8 border-slate-700/70 text-xs ${
                  filter === item
                    ? 'border-cyan-500 bg-cyan-500/10 text-cyan-200'
                    : 'text-slate-300 hover:border-cyan-500/70 hover:bg-cyan-500/10'
                }`}
              >
                {item}
              </Button>
            ))}
            <Button
              variant="outline"
              size="icon"
              onClick={() => refetch()}
              className="h-8 w-8 border-slate-700/70 text-slate-300 hover:border-cyan-500/70 hover:bg-cyan-500/10"
              title="Tải lại"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopyLogs}
              disabled={filteredLogs.length === 0}
              className="h-8 w-8 border-slate-700/70 text-slate-300 hover:border-emerald-500/70 hover:bg-emerald-500/10"
              title="Copy logs"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="relative mt-3">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tim trong logs..."
            className="h-9 border-slate-700 bg-slate-950/70 pl-9 text-slate-100"
          />
        </div>
      </div>

      <div className="max-h-[560px] overflow-y-auto bg-black/35 p-3 font-mono text-xs scrollbar-thin scrollbar-thumb-slate-700">
        {filteredLogs.length > 0 ? (
          filteredLogs.map((log, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              className="grid grid-cols-[86px_18px_minmax(0,1fr)] gap-2 border-b border-white/5 py-2 last:border-0"
            >
              <span className="text-slate-500 whitespace-nowrap">
                [{new Date(log.timestamp).toLocaleTimeString()}]
              </span>
              <span className="flex-shrink-0 mt-0.5">
                {getLogIcon(log.type)}
              </span>
              <span className={`min-w-0 break-words ${getLogColor(log.type)}`}>
                {log.message}
              </span>
            </motion.div>
          ))
        ) : (
          <div className="text-slate-500 text-center py-8 italic">
            {t('no_results')}
          </div>
        )}
      </div>
    </Card>
  );
}
