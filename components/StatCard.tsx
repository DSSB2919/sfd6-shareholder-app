'use client';

import { Icon } from './Icon';

interface StatCardProps {
  icon: string;
  label: string;
  value: string;
  sub?: string;
}

export function StatCard({ icon, label, value, sub }: StatCardProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/10 p-5 text-white shadow-xl backdrop-blur-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-white/60">{label}</p>
          <h3 className="mt-2 text-2xl font-bold tracking-tight">{value}</h3>
          {sub && <p className="mt-1 text-xs text-white/50">{sub}</p>}
        </div>
        <div className="rounded-2xl bg-white/15 p-3">
          <Icon name={icon} className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}