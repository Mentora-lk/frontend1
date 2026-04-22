'use client';

import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

// ── StatusBadge ──────────────────────────────────────────
type StatusKey = 'Success' | 'Pending' | 'Failed' | 'Verified' | 'Pending Review' | 'Missing Docs' | 'Under Review';

const statusStyles: Record<string, string> = {
  Success:        'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Pending:        'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Failed:         'bg-rose-500/10 text-rose-400 border-rose-500/20',
  Verified:       'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  'Pending Review':'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'Missing Docs': 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  'Under Review': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusStyles[status] || statusStyles.Pending}`}>
      {status}
    </span>
  );
}

// ── StatCard ─────────────────────────────────────────────
interface StatCardProps {
  title: string;
  value: string;
  trend?: 'up' | 'down';
  trendValue?: string;
  icon: React.ElementType;
  colorClass: string;
  subtext?: string;
}

export function StatCard({ title, value, trend, trendValue, icon: Icon, colorClass, subtext }: StatCardProps) {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-lg bg-slate-700/50`}>
          <Icon size={24} className={colorClass} />
        </div>
        {trend && (
          <div className={`flex items-center space-x-1 text-xs font-medium ${trend === 'up' ? 'text-emerald-400' : 'text-rose-400'}`}>
            <span>{trendValue}</span>
            {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          </div>
        )}
      </div>
      <h3 className="text-slate-400 text-sm font-medium mb-1">{title}</h3>
      <div className="flex items-baseline space-x-2">
        <span className="text-2xl font-bold text-slate-100">{value}</span>
        {subtext && <span className="text-xs text-slate-500">{subtext}</span>}
      </div>
    </div>
  );
}
