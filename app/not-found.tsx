'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, Search, AlertTriangle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-slate-950">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-2xl -z-10 pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center px-4 z-10"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 15,
            delay: 0.1
          }}
          className="relative inline-block mb-8"
        >
          <h1 className="text-[8rem] sm:text-[12rem] font-bold text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 leading-none select-none drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]">
            404
          </h1>
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
            className="absolute -top-4 -right-8 text-cyan-400/50"
          >
            <Search size={48} />
          </motion.div>
        </motion.div>

        <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-4">
          Lạc đường rồi!
        </h2>
        
        <p className="text-slate-400 mb-10 max-w-md mx-auto leading-relaxed">
          Trang bạn đang tìm kiếm không tồn tại, đã bị xóa hoặc tạm thời không thể truy cập. Hãy quay lại trang chủ để tiếp tục.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl font-medium transition-colors shadow-lg shadow-cyan-500/25 w-full sm:w-auto"
            >
              <Home className="w-5 h-5" />
              Về trang chủ
            </motion.button>
          </Link>
          <a href="https://www.facebook.com/ntmdz08" target="_blank" rel="noopener noreferrer">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-800/80 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors border border-slate-700/50 backdrop-blur-sm w-full sm:w-auto"
            >
              <AlertTriangle className="w-5 h-5" />
              Báo lỗi
            </motion.button>
          </a>
        </div>
      </motion.div>
      
      {/* Decorative floating elements */}
      <motion.div
        animate={{ y: [0, -20, 0], opacity: [0.3, 0.6, 0.3] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        className="absolute bottom-20 left-20 w-32 h-32 bg-purple-500/10 rounded-full blur-xl -z-10 hidden md:block pointer-events-none"
      />
      <motion.div
        animate={{ y: [0, 20, 0], opacity: [0.2, 0.5, 0.2] }}
        transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
        className="absolute top-20 right-20 w-40 h-40 bg-emerald-500/10 rounded-full blur-xl -z-10 hidden md:block pointer-events-none"
      />
    </div>
  );
}
