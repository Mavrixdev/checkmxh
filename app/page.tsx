'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SearchInput } from '@/components/search-input';
import { ResultCard } from '@/components/result-card';
import { useLookup } from '@/hooks/useLookup';
import { useSearchStore } from '@/lib/store';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/hooks/use-language';
import { usePublicSettings } from '@/hooks/useAdminData';
import { Navbar } from '@/components/navbar';
import {
  ShieldCheck,
  Phone,
  Search,
  Users,
  Database,
  Globe,
  Zap,
  Send,
  Facebook,
  AlertTriangle,
} from 'lucide-react';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [searchPhone, setSearchPhone] = useState<string | null>(null);
  const [force, setForce] = useState(false);
  const { data: result, isLoading, error } = useLookup(searchPhone, force);
  const { addToHistory } = useSearchStore();
  const { t } = useLanguage();
  const { data: settings } = usePublicSettings();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearch = (phone: string) => {
    if (phone === searchPhone) {
      setForce((prev) => !prev);
    } else {
      setForce(false);
      setSearchPhone(phone);
    }
    addToHistory(phone);
    // Smooth scroll to results after search
    setTimeout(() => {
      document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  if (!mounted) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative">
        <div className="text-white">Đang tải...</div>
      </main>
    );
  }

  const siteTitle = settings?.site.title || 'MavrixCheck';
  const siteDescription = settings?.site.description || t('subtitle');

  return (
    <>
      <Navbar />

      <main className="min-h-screen pt-16">
        {/* ── HERO / HOME SECTION ── */}
        <section
          id="home"
          className="relative flex min-h-screen flex-col items-center justify-center px-4 py-20"
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8 sm:mb-12"
          >
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-white mb-4 flex items-center justify-center gap-4">
              {settings?.site.iconUrl && (
                <img
                  src={settings.site.iconUrl}
                  alt="Logo"
                  className="h-10 w-10 sm:h-14 sm:w-14 object-contain"
                />
              )}
              {siteTitle}
            </h1>
            <p className="text-slate-400 text-sm sm:text-base md:text-lg max-w-xl mx-auto px-4">
              {siteDescription}
            </p>
          </motion.div>

          {/* Search */}
          <div className="w-full max-w-4xl mb-8 sm:mb-12 px-4 relative z-40">
            <SearchInput onSearch={handleSearch} loading={isLoading} />
          </div>

          {/* Results */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full max-w-6xl px-4 space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-40 rounded-lg" />
                ))}
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-4xl px-4 bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-300"
            >
              <p className="font-medium">{t('error_occurred')}</p>
              <p className="text-sm text-red-200/80">
                {error instanceof Error ? error.message : t('failed_lookup')}
              </p>
            </motion.div>
          )}

          {result && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-6xl px-4"
            >
              <ResultCard result={result} />
            </motion.div>
          )}

          {!result && !isLoading && !error && searchPhone && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-slate-400"
            >
              <p>Không tìm thấy kết quả cho số {searchPhone}</p>
            </motion.div>
          )}

          {!searchPhone && !result && !isLoading && !error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-center text-slate-500 max-w-xl px-4"
            >
              <p className="text-sm">
                Nhập số điện thoại để tra cứu thông tin tài khoản, xác minh danh tính và kiểm tra lừa đảo.
              </p>
            </motion.div>
          )}

          {/* Scroll hint */}
          {!searchPhone && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2"
            >
              <div className="flex flex-col items-center gap-1 text-slate-600 text-xs">
                <span>Cuộn xuống để xem thêm</span>
                <motion.div
                  animate={{ y: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.4 }}
                  className="h-1 w-1 rounded-full bg-slate-600"
                />
              </div>
            </motion.div>
          )}
        </section>

        {/* ── ABOUT SECTION ── */}
        <section id="about" className="px-4 py-24 sm:py-32">
          <div className="mx-auto max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <span className="inline-block rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-cyan-400 mb-4">
                Giới thiệu
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                {siteTitle} là gì?
              </h2>
              <p className="mx-auto max-w-2xl text-slate-400 sm:text-lg">
                Hệ thống tra cứu thông tin đa nền tảng, giúp bạn xác minh danh tính và kiểm tra rủi ro lừa đảo từ số điện thoại chỉ trong vài giây.
              </p>
            </motion.div>

            {/* Feature grid */}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: Search,
                  color: 'text-cyan-300',
                  bg: 'bg-cyan-500/10 border-cyan-500/20',
                  title: 'Tra cứu đa nền tảng',
                  desc: 'Kiểm tra thông tin Zalo, Facebook, Instagram và Telegram chỉ từ một số điện thoại.',
                },
                {
                  icon: Database,
                  color: 'text-emerald-300',
                  bg: 'bg-emerald-500/10 border-emerald-500/20',
                  title: 'Tra cứu ngân hàng',
                  desc: 'Tự động tra cứu tên chủ tài khoản tại nhiều ngân hàng lớn ở Việt Nam.',
                },
                {
                  icon: ShieldCheck,
                  color: 'text-rose-300',
                  bg: 'bg-rose-500/10 border-rose-500/20',
                  title: 'Kiểm tra lừa đảo',
                  desc: 'Đối chiếu số điện thoại với cơ sở dữ liệu lừa đảo để cảnh báo kịp thời.',
                },
                {
                  icon: Zap,
                  color: 'text-amber-300',
                  bg: 'bg-amber-500/10 border-amber-500/20',
                  title: 'Kết quả tức thời',
                  desc: 'Hệ thống xử lý song song, trả kết quả nhanh chóng với bộ nhớ đệm thông minh.',
                },
                {
                  icon: Globe,
                  color: 'text-sky-300',
                  bg: 'bg-sky-500/10 border-sky-500/20',
                  title: 'Đa ngôn ngữ',
                  desc: 'Giao diện hỗ trợ tiếng Việt và tiếng Anh, dễ dàng chuyển đổi.',
                },
                {
                  icon: AlertTriangle,
                  color: 'text-orange-300',
                  bg: 'bg-orange-500/10 border-orange-500/20',
                  title: 'Cảnh báo rủi ro',
                  desc: 'Hiển thị mức độ rủi ro rõ ràng: An toàn, Chưa xác minh, hoặc Rủi ro cao.',
                },
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.08, duration: 0.5 }}
                  className="group rounded-xl border border-slate-800/80 bg-slate-950/60 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-slate-700 hover:shadow-lg hover:shadow-black/20"
                >
                  <div className={`mb-3 inline-flex rounded-lg border p-2.5 ${feature.bg}`}>
                    <feature.icon className={`h-5 w-5 ${feature.color}`} />
                  </div>
                  <h3 className="mb-2 font-semibold text-white">{feature.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
                </motion.div>
              ))}
            </div>

            {/* Disclaimer */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="mt-10 rounded-xl border border-amber-500/20 bg-amber-500/5 p-5"
            >
              <div className="flex gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
                <div>
                  <p className="font-semibold text-amber-200">Lưu ý về sử dụng</p>
                  <p className="mt-1 text-sm text-slate-400">
                    Công cụ này chỉ dành cho mục đích xác minh danh tính hợp pháp. Vui lòng không sử dụng để xâm phạm quyền riêng tư. Mọi hành vi tra cứu đều được ghi lại.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── CONTACT SECTION ── */}
        <section id="contact" className="px-4 py-24 sm:py-32">
          <div className="mx-auto max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-14"
            >
              <span className="inline-block rounded-full border border-sky-500/30 bg-sky-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-sky-400 mb-4">
                Liên hệ
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Cần hỗ trợ?</h2>
              <p className="text-slate-400 sm:text-lg">
                Liên hệ với chúng tôi qua các kênh bên dưới nếu bạn gặp vấn đề hoặc muốn hợp tác.
              </p>
            </motion.div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  icon: 'https://img.icons8.com/?size=100&id=5mIvDYZUWDCF&format=png&color=000000',
                  label: 'Telegram',
                  value: '@Mavrixdev',
                  href: 'https://t.me/Mavrixdev',
                  color: 'text-cyan-300',
                  bg: 'bg-cyan-500/10 border-cyan-500/20',
                  hover: 'hover:border-cyan-500/50',
                  desc: 'Phản hồi nhanh nhất',
                },
                {
                  icon: 'https://img.icons8.com/?size=100&id=z657ovoGgS2o&format=png&color=000000',
                  label: 'Facebook',
                  value: 'Nguyễn Thạc Mậu',
                  href: 'https://www.facebook.com/ntmdz08',
                  color: 'text-blue-300',
                  bg: 'bg-blue-500/10 border-blue-500/20',
                  hover: 'hover:border-blue-500/50',
                  desc: 'Cho yêu cầu chính thức',
                },
              ].map((item, idx) => (
                <motion.a
                  key={idx}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                  whileHover={{ y: -3 }}
                  className={`flex items-center gap-4 rounded-xl border ${item.bg} ${item.hover} p-5 transition-all duration-300`}
                >
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${item.bg}`}>
                    <img src={item.icon} className={`h-8 w-8${item.color}`} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">{item.label}</p>
                    <p className={`font-semibold ${item.color}`}>{item.value}</p>
                    <p className="text-xs text-slate-600">{item.desc}</p>
                  </div>
                </motion.a>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-800/90 px-4 py-6 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {siteTitle}. Được phát triển bởi <a href="https://www.facebook.com/ntmdz08" target="_blank" rel="noopener noreferrer" className="text-cyan-300 hover:underline">Mavrixdev</a>.</p>
        </footer>
      </main>
    </>
  );
}
