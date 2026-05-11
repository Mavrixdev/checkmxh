'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { WifiOff, RefreshCw, Settings2, Globe, Activity, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSystemStore } from '@/lib/stores/system-store';
import { syncSystemState } from '@/lib/api/manager';
import { toast } from 'sonner';

export function OfflineMode() {
  const { apiUrl, setSystemState } = useSystemStore();
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    const toastId = toast.loading('Đang thử kết nối lại...');
    
    await syncSystemState();
    
    setIsRetrying(false);
    toast.dismiss(toastId);
  };

  const handleChangeApi = () => {
    const pass = prompt('Nhập mật khẩu Admin để thay đổi cấu hình:');
    if (pass === 'Mavrix2008' || pass === (typeof window !== 'undefined' ? window.localStorage.getItem('mavrix_lookup_private_key') : '')) {
      useSystemStore.getState().setSetupCompleted(false);
      setSystemState('setup');
    } else if (pass !== null) {
      toast.error('Mật khẩu không chính xác!');
    }
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-rose-500/20 bg-slate-950/90 shadow-2xl backdrop-blur-xl"
      >
        <div className="bg-rose-500/10 p-8 text-center border-b border-slate-800">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border-2 border-rose-500/30 bg-rose-500/10 shadow-[0_0_30px_rgba(244,63,94,0.2)]">
            <WifiOff className="h-10 w-10 text-rose-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Hệ thống đang Ngoại tuyến</h2>
          <p className="text-slate-400 max-w-sm mx-auto">
            Không thể kết nối tới Backend API tại địa chỉ:
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-mono text-rose-300 border border-rose-500/20">
            <Globe className="h-3.5 w-3.5" />
            {apiUrl || 'Chưa cấu hình'}
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={handleRetry}
              disabled={isRetrying}
              className="h-12 bg-white text-slate-950 hover:bg-slate-200"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
              Thử kết nối lại
            </Button>
            
            <Button
              variant="outline"
              onClick={handleChangeApi}
              className="h-12 border-slate-800 bg-slate-900/50 text-slate-300 hover:bg-slate-800"
            >
              <Settings2 className="mr-2 h-4 w-4" />
              Thay đổi API URL
            </Button>
          </div>

          <div className="rounded-xl bg-amber-500/5 border border-amber-500/10 p-4">
            <div className="flex gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-200 mb-1">Lưu ý cho Quản trị viên</p>
                <p className="text-slate-400 leading-relaxed">
                  Nếu bạn vừa đổi Server hoặc API chưa sẵn sàng, hãy kiểm tra lại cấu hình CORS và Firewall trên VPS.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-900/40 border-t border-slate-800 text-center">
          <button 
            onClick={() => setSystemState('online')}
            className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors"
          >
            Tiếp tục vào Dashboard ở chế độ Offline (Chỉ xem)
          </button>
        </div>
      </motion.div>
    </div>
  );
}
