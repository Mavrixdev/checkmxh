'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import React from 'react';

interface StatsCardProps {
  icon: React.ComponentType<{ className: string }>;
  title: string;
  value: number | string;
  change?: string;
  loading?: boolean;
  tone?: 'cyan' | 'emerald' | 'amber' | 'rose';
}

const toneClasses = {
  cyan: {
    card: 'border-cyan-500/20 bg-cyan-950/10',
    iconWrap: 'border-cyan-400/20 bg-cyan-500/10',
    icon: 'text-cyan-300',
    rail: 'from-cyan-400 to-sky-500',
  },
  emerald: {
    card: 'border-emerald-500/20 bg-emerald-950/10',
    iconWrap: 'border-emerald-400/20 bg-emerald-500/10',
    icon: 'text-emerald-300',
    rail: 'from-emerald-400 to-teal-500',
  },
  amber: {
    card: 'border-amber-500/20 bg-amber-950/10',
    iconWrap: 'border-amber-400/20 bg-amber-500/10',
    icon: 'text-amber-300',
    rail: 'from-amber-300 to-orange-500',
  },
  rose: {
    card: 'border-rose-500/20 bg-rose-950/10',
    iconWrap: 'border-rose-400/20 bg-rose-500/10',
    icon: 'text-rose-300',
    rail: 'from-rose-400 to-red-500',
  },
};

export function StatsCard({ icon: Icon, title, value, change, loading, tone = 'cyan' }: StatsCardProps) {
  const classes = toneClasses[tone];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Card className={`relative h-full overflow-hidden rounded-md border p-5 py-5 shadow-none ${classes.card}`}>
        <div className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${classes.rail}`} />
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <p className="mb-2 truncate text-sm text-slate-400">{title}</p>
            {loading ? (
              <div className="h-8 w-24 animate-pulse rounded-md bg-slate-800/70" />
            ) : (
              <p className="text-3xl font-semibold tracking-normal text-white">{value}</p>
            )}
            {change && (
              <p className={`text-xs mt-2 ${change.includes('-') ? 'text-red-400' : 'text-green-400'}`}>
                {change}
              </p>
            )}
          </div>
          <div className={`rounded-md border p-2.5 ${classes.iconWrap}`}>
            <Icon className={`h-5 w-5 ${classes.icon}`} />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
