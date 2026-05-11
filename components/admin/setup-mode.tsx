'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Server, Globe, Save, Activity, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSystemStore } from '@/lib/stores/system-store';
import { checkApiHealth } from '@/lib/api/manager';
import { toast } from 'sonner';

export function SetupMode() {
  const { apiUrl: storeApiUrl, setApiUrl, setSetupCompleted, setSystemState, setApiConnected } = useSystemStore();
  const [url, setUrl] = useState(storeApiUrl || '');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'none' | 'success' | 'failed'>('none');

  const handleTest = async () => {
    if (!url) return;
    setIsTesting(true);
    setTestResult('none');
    
    const isHealthy = await checkApiHealth(url);
    
    if (isHealthy) {
      setTestResult('success');
      toast.success('Kết nối API thành công!');
    } else {
      setTestResult('failed');
      toast.error('Không thể kết nối tới API. Vui lòng kiểm tra lại URL.');
    }
    setIsTesting(false);
  };

  const [password, setPassword] = useState('');
  const [isAuth, setIsAuth] = useState(false);

  const handleVerify = () => {
    if (password === 'Mavrix2008') {
      setIsAuth(true);
      toast.success('Xác thực thành công!');
    } else {
      toast.error('Mật khẩu không chính xác!');
    }
  };

  const handleSave = () => {
    if (!url) return;
    
    // Normalize URL
    const normalizedUrl = url.endsWith('/') ? url.slice(0, -1) : url;
    
    setApiUrl(normalizedUrl);
    setSetupCompleted(true);
    
    if (testResult === 'success') {
      setApiConnected(true);
      setSystemState('online');
    } else {
      setApiConnected(false);
      setSystemState('offline');
    }
    
    localStorage.setItem('mavrix_lookup_api_base_url', normalizedUrl);
    toast.success('Đã cấu hình hệ thống thành công!');
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md overflow-hidden rounded-xl border border-slate-800 bg-slate-950/80 shadow-2xl backdrop-blur-xl"
      >
        <div className="bg-cyan-500/10 p-6 border-b border-slate-800 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-500/10 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
            <ShieldCheck className="h-8 w-8 text-cyan-300" />
          </div>
          <h2 className="text-xl font-bold text-white">Xác thực Quản trị</h2>
          <p className="text-sm text-slate-400">
            {isAuth ? 'Cấu hình kết nối Admin Console' : 'Nhập mật khẩu để bắt đầu cấu hình'}
          </p>
        </div>

        <div className="p-6 space-y-5">
          {!isAuth ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Mật khẩu Admin</label>
                <Input
                  type="password"
                  autoFocus
                  value={password}
                  onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu..."
                  className="bg-slate-900/50 border-slate-800 text-slate-200"
                />
              </div>
              <Button onClick={handleVerify} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white">
                Tiếp tục
              </Button>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-5"
            >
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <Server className="h-4 w-4 text-sky-400" />
                  Backend API URL
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="http://103.161.171.8:5000"
                    className="pl-10 bg-slate-900/50 border-slate-800 text-slate-200"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={handleTest}
                  disabled={isTesting || !url}
                  className="w-full border-slate-700 bg-slate-900/30 text-slate-300 hover:bg-slate-800"
                >
                  <Activity className={`mr-2 h-4 w-4 ${isTesting ? 'animate-spin' : ''}`} />
                  Test Connection
                </Button>

                {testResult === 'success' && (
                  <div className="flex items-center gap-2 rounded-md bg-emerald-500/10 border border-emerald-500/20 p-3 text-sm text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                    Kết nối thành công!
                  </div>
                )}

                {testResult === 'failed' && (
                  <div className="flex items-center gap-2 rounded-md bg-rose-500/10 border border-rose-500/20 p-3 text-sm text-rose-400">
                    <AlertCircle className="h-4 w-4" />
                    Kết nối thất bại.
                  </div>
                )}

                <Button
                  onClick={handleSave}
                  disabled={!url}
                  className="w-full bg-cyan-600 text-white hover:bg-cyan-500"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Lưu & Vào Dashboard
                </Button>
              </div>
            </motion.div>
          )}
        </div>

        <div className="p-4 bg-slate-900/40 border-t border-slate-800 text-center">
          <p className="text-[11px] text-slate-500">
            Dữ liệu này được lưu trực tiếp trên trình duyệt của bạn (Local Storage).
          </p>
        </div>
      </motion.div>
    </div>
  );
}
