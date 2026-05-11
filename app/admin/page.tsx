'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAdminStore } from '@/lib/store';
import { useHealth, useStats } from '@/hooks/useAdminData';
import { Button } from '@/components/ui/button';
import { StatsCard } from '@/components/admin/stats-card';
import { HealthWidget } from '@/components/admin/health-widget';
import { MongoDataManager } from '@/components/admin/mongo-data-manager';
import { SettingsPanel } from '@/components/admin/settings-panel';
import { logout } from '@/lib/api';
import { toast } from 'sonner';
import {
  Activity,
  AlertCircle,
  BarChart3,
  Database,
  Home,
  LayoutDashboard,
  LogOut,
  Server,
  Settings,
  ShieldCheck,
  Terminal,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SystemLogs } from '@/components/admin/system-logs';

export default function AdminDashboard() {
  const { t } = useLanguage();
  const router = useRouter();
  const { session, logout: logoutStore } = useAdminStore();
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: health } = useHealth();
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

  // Check if user is authenticated
  useEffect(() => {
    if (!session.isAuthenticated) {
      router.push('/admin/login');
    }
  }, [session.isAuthenticated, router]);

  const [isTesting, setIsTesting] = useState(false);

  const handleTestConnection = async () => {
    setIsTesting(true);
    try {
      const { lookupPhone } = await import('@/lib/api');
      await lookupPhone('0000000000');
      toast.success('Kết nối API thành công!');
    } catch (error: any) {
      console.error('API Test failed:', error);
      const msg = error.response?.data?.message || error.message || 'Lỗi kết nối';
      toast.error(`Kết nối thất bại: ${msg}`);
    } finally {
      setIsTesting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      logoutStore();
      toast.success('Logged out successfully');
      router.push('/admin/login');
    } catch (error) {
      toast.error('Logout failed');
      console.log('[v0] Logout error:', error);
    }
  };

  if (!session.isAuthenticated) {
    return null;
  }

  return (
    <main className="min-h-screen px-3 py-4 sm:px-5 sm:py-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto mb-5 max-w-[1600px]"
      >
        <div className="rounded-md border border-slate-800/80 bg-slate-950/70 shadow-2xl shadow-black/20">
          <div className="flex flex-col gap-4 border-b border-slate-800/80 px-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-5">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-cyan-400/20 bg-cyan-500/10">
                <ShieldCheck className="h-5 w-5 text-cyan-300" />
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-2xl font-semibold tracking-normal text-white sm:text-3xl">
                  Admin Console
                </h1>
                <p className="mt-1 truncate text-sm text-slate-400">
                  {t('subtitle')}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
              <div className="flex items-center gap-2 rounded-md border border-slate-800 bg-slate-900/55 px-3 py-2 text-slate-300">
                <Activity className={`h-4 w-4 ${health?.status === 'healthy' ? 'text-emerald-300' : 'text-amber-300'}`} />
                <span className="hidden sm:inline">{health?.status || 'checking'}</span>
              </div>
              <div className="flex max-w-full items-center gap-2 rounded-md border border-slate-800 bg-slate-900/55 px-3 py-2 text-slate-300">
                <Server className="h-4 w-4 text-sky-300" />
                <span className="max-w-[180px] truncate font-mono text-xs">{apiBaseUrl}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="h-6 w-6 ml-1 hover:bg-sky-500/20 hover:text-sky-300"
                >
                  <Activity className={`h-3 w-3 ${isTesting ? 'animate-pulse' : ''}`} />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between lg:px-5">
            <div className="grid grid-cols-2 gap-2 text-xs sm:flex sm:flex-wrap">
              <div className="rounded-md border border-slate-800 bg-slate-900/45 px-3 py-2 text-slate-400">
                MongoDB <span className={health?.mongodb === 'connected' ? 'text-emerald-300' : 'text-red-300'}>{health?.mongodb || 'unknown'}</span>
              </div>
              <div className="rounded-md border border-slate-800 bg-slate-900/45 px-3 py-2 text-slate-400">
                Queue <span className="text-slate-100">{health?.queue?.total ?? 0}</span>
              </div>
              <div className="rounded-md border border-slate-800 bg-slate-900/45 px-3 py-2 text-slate-400">
                Cache <span className="text-slate-100">{stats?.cacheHits ?? 0}</span>
              </div>
              <div className="rounded-md border border-slate-800 bg-slate-900/45 px-3 py-2 text-slate-400">
                Risk hits <span className="text-rose-300">{stats?.totalScammers ?? 0}</span>
              </div>
              <div className="flex items-center gap-2 rounded-md border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs">
                <span className="text-amber-400/70">Key:</span>
                <span className="font-mono text-amber-200/90">{typeof window !== 'undefined' ? (window.localStorage.getItem('mavrix_lookup_private_key') || 'System Default') : '...'}</span>
                <button 
                  onClick={() => {
                    window.localStorage.removeItem('mavrix_lookup_private_key');
                    window.location.reload();
                  }}
                  className="ml-1 text-amber-500 hover:text-amber-400 underline decoration-dotted"
                >
                  Reset
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs sm:text-sm">
            <Link href="/" className="flex-1 sm:flex-none">
              <Button
                variant="outline"
                size="sm"
                className="w-full border-slate-700/70 bg-slate-950/30 text-slate-300 hover:border-cyan-500 hover:bg-cyan-500/10"
              >
                <Home className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">{t('title')}</span>
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex-1 border-red-500/30 bg-slate-950/30 text-red-300 hover:border-red-500 hover:bg-red-500/10 sm:flex-none"
            >
              <LogOut className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">{t('logout')}</span>
            </Button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="mx-auto max-w-[1600px] space-y-4 sm:space-y-6">
        <Tabs defaultValue="overview" className="space-y-5">
          <TabsList className="grid h-auto w-full grid-cols-2 rounded-md border border-slate-800/80 bg-slate-950/70 p-1 shadow-none sm:grid-cols-4">
            <TabsTrigger value="overview" className="rounded-sm py-2.5 text-slate-300 data-[state=active]:border-cyan-500/30 data-[state=active]:bg-cyan-500/15 data-[state=active]:text-cyan-100">
              <LayoutDashboard className="h-4 w-4" />
              {t('overview')}
            </TabsTrigger>
            <TabsTrigger value="management" className="rounded-sm py-2.5 text-slate-300 data-[state=active]:border-emerald-500/30 data-[state=active]:bg-emerald-500/15 data-[state=active]:text-emerald-100">
              <Database className="h-4 w-4" />
              MongoDB
            </TabsTrigger>
            <TabsTrigger value="logs" className="rounded-sm py-2.5 text-slate-300 data-[state=active]:border-amber-500/30 data-[state=active]:bg-amber-500/15 data-[state=active]:text-amber-100">
              <Terminal className="h-4 w-4" />
              {t('system_logs')}
            </TabsTrigger>
            <TabsTrigger value="settings" className="rounded-sm py-2.5 text-slate-300 data-[state=active]:border-sky-500/30 data-[state=active]:bg-sky-500/15 data-[state=active]:text-sky-100">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 outline-none">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
            >
              <StatsCard
                icon={BarChart3}
                title={t('total_lookups')}
                value={stats?.totalLookups || 0}
                loading={statsLoading}
                tone="cyan"
              />
              <StatsCard
                icon={TrendingUp}
                title={t('cache_hits')}
                value={stats?.cacheHits || 0}
                loading={statsLoading}
                tone="emerald"
              />
              <StatsCard
                icon={Users}
                title={t('fresh_scans')}
                value={stats?.freshScans || 0}
                loading={statsLoading}
                tone="amber"
              />
              <StatsCard
                icon={AlertCircle}
                title={t('scammers_detected')}
                value={stats?.totalScammers || 0}
                loading={statsLoading}
                tone="rose"
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-[minmax(0,520px)_minmax(0,1fr)]"
            >
              <HealthWidget />
              <div className="rounded-md border border-slate-800/80 bg-slate-950/55 p-5">
                <div className="mb-4 flex items-center gap-2">
                  <Database className="h-5 w-5 text-emerald-300" />
                  <h3 className="text-lg font-semibold text-white">Data workspace</h3>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-md border border-slate-800 bg-slate-900/40 p-4">
                    <p className="text-xs text-slate-500">Primary tab</p>
                    <p className="mt-2 text-sm font-medium text-slate-100">MongoDB</p>
                  </div>
                  <div className="rounded-md border border-slate-800 bg-slate-900/40 p-4">
                    <p className="text-xs text-slate-500">Documents</p>
                    <p className="mt-2 text-sm font-medium text-slate-100">{stats?.totalLookups ?? 0}</p>
                  </div>
                  <div className="rounded-md border border-slate-800 bg-slate-900/40 p-4">
                    <p className="text-xs text-slate-500">Risk hits</p>
                    <p className="mt-2 text-sm font-medium text-rose-300">{stats?.totalScammers ?? 0}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="management" className="outline-none">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <MongoDataManager />
            </motion.div>
          </TabsContent>

          <TabsContent value="logs" className="outline-none">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <SystemLogs />
            </motion.div>
          </TabsContent>

          <TabsContent value="settings" className="outline-none">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <SettingsPanel />
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}