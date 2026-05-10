'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { useSearchStore } from '@/lib/store';
import { validatePhoneNumber } from '@/lib/utils-dashboard';
import { useLanguage } from '@/hooks/use-language';

interface SearchInputProps {
  onSearch: (phone: string) => void;
  loading?: boolean;
}

export function SearchInput({ onSearch, loading = false }: SearchInputProps) {
  const [input, setInput] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const { history, removeFromHistory } = useSearchStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowHistory(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (phone: string) => {
    if (validatePhoneNumber(phone)) {
      onSearch(phone);
      setShowHistory(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(input);
  };

  return (
    <div className="w-full relative z-10">
      <form onSubmit={handleSubmit} className="relative">
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-500/20 blur opacity-75 group-hover:opacity-100 transition duration-500" />
        
        <div className="relative flex items-center bg-slate-900/50 backdrop-blur border border-cyan-500/30 rounded-lg px-2 sm:px-4 py-2 sm:py-3 focus-within:ring-2 focus-within:ring-cyan-500/50 transition-all">
          <Search className="w-5 h-5 text-cyan-400 mr-3 flex-shrink-0" />
          
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleInputChange}
            onFocus={() => setShowHistory(true)}
            placeholder={t('search_placeholder')}
            disabled={loading}
            className="flex-1 min-w-0 bg-transparent text-white placeholder-slate-500 outline-none text-base sm:text-lg"
          />

          {input && (
            <button
              onClick={() => setInput('')}
              className="p-1 hover:bg-slate-800/50 rounded transition-colors text-slate-400 mr-2"
              type="button"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <motion.button
            type="submit"
            whileTap={{ scale: 0.95 }}
            disabled={!validatePhoneNumber(input) || loading}
            className="flex-shrink-0 ml-1 sm:ml-2 px-3 sm:px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 disabled:from-slate-700 disabled:to-slate-700 text-white rounded-lg font-medium transition-all disabled:cursor-not-allowed text-sm sm:text-base whitespace-nowrap"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span className="hidden sm:inline">{t('searching')}</span>
              </div>
            ) : (
              <>
                <span className="hidden min-[450px]:inline">{t('search')}</span>
                <Search className="w-4 h-4 min-[450px]:hidden" />
              </>
            )}
          </motion.button>
        </div>
      </form>

      <AnimatePresence>
        {showHistory && history.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-800/50 rounded-lg overflow-hidden z-[100] max-h-64 overflow-y-auto shadow-2xl"
          >
            <div className="p-2">
              <p className="text-xs text-slate-400 px-2 py-1 font-semibold border-b border-slate-800/50 mb-1">{t('history').toUpperCase()}</p>
              {history.map((phone) => (
                <div
                  key={phone}
                  className="flex items-center justify-between p-2 hover:bg-slate-800/50 rounded cursor-pointer group transition-colors"
                  onClick={() => handleSearch(phone)}
                >
                  <span className="text-slate-300 text-sm">{phone}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromHistory(phone);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-red-400"
                    type="button"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
