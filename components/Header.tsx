'use client';

import { motion } from 'framer-motion';
import { Icon } from './Icon';
import type { Shareholder } from '@/types';
import { formatRM } from '@/lib/utils';

interface HeaderProps {
  shareholder: Shareholder;
  onShowQR?: () => void;
}

export function Header({ shareholder, onShowQR }: HeaderProps) {
  const tierBadge = shareholder.tier === 'Founding Partner' 
    ? 'FOUNDING PARTNER'
    : shareholder.tier.toUpperCase();

  return (
    <div className="relative overflow-hidden rounded-b-[2.5rem] bg-gradient-to-br from-zinc-950 via-zinc-900 to-emerald-950 px-5 pb-7 pt-8 text-white shadow-2xl">
      <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-emerald-400/20 blur-3xl" />
      <div className="absolute -bottom-16 left-8 h-36 w-36 rounded-full bg-amber-300/10 blur-3xl" />
      
      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">Snowy Fox</p>
          <h1 className="mt-1 text-2xl font-black leading-tight">Shareholder Lifestyle Club</h1>
          <p className="mt-1 text-sm text-white/60">
            {shareholder.share_percent}% 股东 · {shareholder.tier}
          </p>
        </div>
        <div className="rounded-3xl bg-white/10 p-3 backdrop-blur">
          <Icon name="snow" className="h-7 w-7 text-emerald-300" />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative mt-6 overflow-hidden rounded-3xl border border-amber-300/30 bg-gradient-to-br from-white/15 to-amber-300/10 p-5 shadow-2xl backdrop-blur-xl"
      >
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-amber-300/20 blur-3xl" />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Icon name="crown" className="h-5 w-5 text-amber-300" />
              <p className="rounded-full bg-amber-300 px-3 py-1 text-xs font-black tracking-wide text-zinc-950">
                {tierBadge}
              </p>
            </div>
            <h2 className="mt-3 text-2xl font-black tracking-tight">{shareholder.name}</h2>
            <p className="mt-1 text-sm font-semibold text-amber-100">{shareholder.tier}</p>
            <p className="mt-2 text-sm text-white/65">
              {shareholder.share_percent}% Shareholding · {formatRM(shareholder.actual_investment_rm)} Capital Injection
            </p>
            <p className="mt-1 text-sm text-emerald-300">
              {(shareholder.points_balance || 0).toLocaleString()} Snow Points · Founding Circle Privilege
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="rounded-2xl bg-zinc-950/50 px-3 py-2 text-right">
              <p className="text-xs text-white/50">股东编号</p>
              <p className="text-sm font-bold text-emerald-300">{shareholder.member_no}</p>
            </div>
            {onShowQR && (
              <button
                onClick={onShowQR}
                className="flex items-center gap-1.5 rounded-xl bg-amber-400 px-3 py-2 text-xs font-bold text-zinc-950 transition hover:bg-amber-300"
              >
                <Icon name="qr" className="h-3.5 w-3.5" />
                消费码
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}