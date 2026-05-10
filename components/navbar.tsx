'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Menu, X, ShieldCheck } from 'lucide-react';
import { usePublicSettings } from '@/hooks/useAdminData';
import { LanguageToggle } from '@/components/language-toggle';

const NAV_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const { data: settings } = usePublicSettings();
  const siteName = settings?.site?.title?.split(' - ')[0] || 'MavrixCheck';
  const iconUrl = '/icon-favicon.png';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { threshold: 0.3 },
    );
    ['home', 'about', 'contact'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const scrollTo = (href: string) => {
    const id = href.replace('#', '');
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setIsOpen(false);
  };

  return (
    <nav
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'border-b border-slate-800/80 bg-slate-950/90 shadow-lg shadow-black/20 backdrop-blur-xl'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Logo */}
        <button
          onClick={() => scrollTo('#home')}
          className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
        >
          {iconUrl ? (
            <img src={iconUrl} alt="logo" className="h-7 w-7 object-contain" />
          ) : (
            <div className="flex h-7 w-7 items-center justify-center rounded-md border border-cyan-400/20 bg-cyan-500/10">
              <ShieldCheck className="h-4 w-4 text-cyan-300" />
            </div>
          )}
          <span className="text-base font-bold text-white">{siteName}</span>
        </button>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 sm:flex">
          {NAV_LINKS.map((link) => {
            const isActive = activeSection === link.href.replace('#', '');
            return (
              <button
                key={link.href}
                onClick={() => scrollTo(link.href)}
                className={`relative rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  isActive ? 'text-cyan-300' : 'text-slate-400 hover:text-slate-100'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-md bg-cyan-500/10 ring-1 ring-cyan-500/30"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative">{link.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <LanguageToggle />
          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="rounded-md border border-slate-700/60 bg-slate-900/50 p-2 text-slate-400 transition-colors hover:text-white sm:hidden"
          >
            {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-slate-800/80 bg-slate-950/95 backdrop-blur-xl sm:hidden"
          >
            <div className="flex flex-col gap-1 p-3">
              {NAV_LINKS.map((link) => {
                const isActive = activeSection === link.href.replace('#', '');
                return (
                  <button
                    key={link.href}
                    onClick={() => scrollTo(link.href)}
                    className={`rounded-md px-4 py-2.5 text-left text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-cyan-500/10 text-cyan-300 ring-1 ring-cyan-500/30'
                        : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                    }`}
                  >
                    {link.label}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
