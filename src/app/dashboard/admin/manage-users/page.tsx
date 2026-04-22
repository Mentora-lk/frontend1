'use client';

import { CreditCard, Briefcase, FileText, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import { StatCard, StatusBadge } from '@/components/ui';
import { transactions } from '@/lib/data';

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Platform Commission" value="LKR 450,200.00" trend="up"   trendValue="12.5%" icon={CreditCard} colorClass="text-emerald-400" />
        <StatCard title="Pending Payouts to Tutors" value="LKR 125,800.00" subtext="Target: 200k"         icon={Briefcase}  colorClass="text-amber-400"   />
        <StatCard title="Total Transactions"        value="1,284"           trend="up"   trendValue="5.7%"  icon={FileText}   colorClass="text-blue-400"    />
      </div>

      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden backdrop-blur-sm">
        <div className="p-6 border-b border-slate-700/50 flex justify-between items-center flex-wrap gap-4">
          <h3 className="text-lg font-semibold text-slate-100">Transaction History</h3>
          <div className="flex items-center space-x-2 bg-slate-900/50 rounded-lg px-3 py-2 border border-slate-700/50">
            <span className="text-slate-400 text-sm">Oct 1 – Oct 31, 2023</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase font-medium">
              <tr>
                <th className="px-6 py-4">Transaction ID</th>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Tutor</th>
                <th className="px-6 py-4 text-right">Amount (LKR)</th>
                <th className="px-6 py-4 text-right">Comm %</th>
                <th className="px-6 py-4 text-right">Revenue</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50 text-sm">
              {transactions.map((txn, idx) => (
                <tr key={txn.id} className="hover:bg-slate-700/20 transition-colors">
                  <td className="px-6 py-4 text-slate-400 font-mono text-xs">{txn.id}</td>
                  <td className="px-6 py-4">
                    <div className="text-slate-200 font-medium">{txn.student}</div>
                    <div className="text-xs text-slate-500">ID: ST-00{idx + 41}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-slate-200 font-medium">{txn.tutor}</div>
                    <div className="text-xs text-slate-500">ID: TR-10{idx + 92}</div>
                  </td>
                  <td className="px-6 py-4 text-right text-slate-200 font-medium">{txn.amount.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right text-slate-400">{txn.comm}</td>
                  <td className="px-6 py-4 text-right text-cyan-400 font-medium">{txn.revenue.toFixed(2)}</td>
                  <td className="px-6 py-4 text-center"><StatusBadge status={txn.status} /></td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-slate-400 hover:text-slate-200"><MoreHorizontal size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t border-slate-700/50 flex justify-between items-center">
          <span className="text-sm text-slate-400">Showing 1 to 4 of 1,284 transactions</span>
          <div className="flex items-center space-x-2">
            <button className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 disabled:opacity-50"><ChevronLeft size={18} /></button>
            <button className="w-8 h-8 rounded-lg bg-cyan-500 text-white font-medium text-sm flex items-center justify-center">1</button>
            <button className="w-8 h-8 rounded-lg hover:bg-slate-700 text-slate-400 font-medium text-sm flex items-center justify-center">2</button>
            <button className="w-8 h-8 rounded-lg hover:bg-slate-700 text-slate-400 font-medium text-sm flex items-center justify-center">3</button>
            <button className="p-2 rounded-lg hover:bg-slate-700 text-slate-400"><ChevronRight size={18} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
