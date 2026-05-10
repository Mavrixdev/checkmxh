'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { login } from '@/lib/api';
import { useAdminStore } from '@/lib/store';
import { toast } from 'sonner';
import { ArrowLeft, Lock, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();
  const { setAuthenticated } = useAdminStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const response = await login(password);
      if (response.success) {
        setAuthenticated(true);
        toast.success('Đăng nhập thành công');
        router.push('/admin');
      } else {
        setErrorMsg(response.message || 'Đăng nhập thất bại');
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        setErrorMsg('Sai mật khẩu. Vui lòng kiểm tra lại!');
        toast.error('Sai mật khẩu');
      } else {
        setErrorMsg('Có lỗi xảy ra trong quá trình kết nối');
        toast.error('Lỗi kết nối server');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <Link
        href="/"
        className="absolute left-4 top-4 flex items-center gap-2 rounded-md border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-400 transition-colors hover:border-cyan-500/50 hover:text-slate-200"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <div className="mb-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="mb-4 flex items-center justify-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-md border border-cyan-400/20 bg-cyan-500/10">
              <ShieldCheck className="h-5 w-5 text-cyan-300" />
            </div>
            <h1 className="text-3xl font-semibold tracking-normal text-white">Admin Console</h1>
          </motion.div>
          <p className="text-sm text-slate-400">Enter admin password to continue</p>
        </div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          onSubmit={handleLogin}
          className="space-y-4 rounded-md border border-slate-800/80 bg-slate-950/70 p-5 shadow-2xl shadow-black/25"
        >
          <div className="space-y-2">
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1, 
                  y: 0,
                  x: [0, -4, 4, -4, 4, 0] // Hiệu ứng rung (shake)
                }}
                transition={{ duration: 0.4 }}
                className="mb-5 overflow-hidden rounded-2xl border border-pink-500/30 bg-gradient-to-br from-pink-500/10 to-purple-500/10 p-4 shadow-lg shadow-pink-500/5 backdrop-blur-md"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-pink-500/20 text-pink-400">
                    <span className="text-lg">🥺</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-pink-200">{errorMsg}</p>
                    <p className="mt-0.5 text-[10px] text-slate-400">
                      Cần giúp đỡ? Nhắn <a href="https://t.me/Mavrixdev" target="_blank" rel="noopener noreferrer" className="font-semibold text-pink-400 hover:underline">@Mavrixdev</a> nha ✨
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
            <label className="text-sm font-medium text-slate-300">Admin Password</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input
                type="password"
                placeholder="Enter password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="border-slate-700/70 bg-slate-900/50 pl-9 text-slate-100 focus:border-cyan-500/50 focus:ring-cyan-500/20"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={!password || loading}
            className="w-full bg-cyan-500 font-medium text-white hover:bg-cyan-600 disabled:bg-slate-700"
          >
            {loading ? 'Authenticating...' : 'Login'}
          </Button>
        </motion.form>

        <p className="mt-4 text-center text-xs text-slate-500">
          This is a protected admin area. Only authorized personnel should access.
        </p>
      </motion.div>
    </div>
  );
}
