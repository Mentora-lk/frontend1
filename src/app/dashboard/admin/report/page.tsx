'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { transactions } from '../../../../data/adminData';
import { appendAudit, downloadFile } from '../utils/operations';

function StatusBadge({ status }: { status: string }) {
  const palette =
    status === 'Success'
      ? { bg: 'rgba(34,197,94,0.10)', color: '#22c55e', border: 'rgba(34,197,94,0.20)' }
      : status === 'Pending'
      ? { bg: 'rgba(245,158,11,0.10)', color: '#f59e0b', border: 'rgba(245,158,11,0.20)' }
      : { bg: 'rgba(239,68,68,0.10)', color: '#ef4444', border: 'rgba(239,68,68,0.20)' };

  return <span style={{ padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700, background: palette.bg, color: palette.color, border: `1px solid ${palette.border}` }}>{status}</span>;
}

function StatCard({ title, value, trend, detail }: { title: string; value: string; trend?: string; detail?: string }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: 18, boxShadow: '0 8px 20px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ width: 44, height: 32, borderRadius: 10, background: '#1d4ed8', display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 700 }}>▣</div>
        {trend && <span style={{ color: '#0f766e', fontSize: 12, fontWeight: 700 }}>{trend}</span>}
      </div>
      <div style={{ color: '#6b7280', fontSize: 13 }}>{title}</div>
      <div style={{ color: '#111827', fontSize: 28, fontWeight: 800, marginTop: 6 }}>{value}</div>
      {detail && <div style={{ color: '#6b7280', fontSize: 12, marginTop: 4 }}>{detail}</div>}
    </div>
  );
}

export default function PaymentsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'sessions' | 'advertisements'>('sessions');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const pageSize = 3;

  const filteredTransactions = useMemo(() => {
    return transactions.filter(txn => {
      const q = search.toLowerCase();
      const matchSearch = !q || txn.student.toLowerCase().includes(q) || txn.tutor.toLowerCase().includes(q) || txn.id.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'All' || txn.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / pageSize));
  const visibleTransactions = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredTransactions.slice(start, start + pageSize);
  }, [page, filteredTransactions]);

  const exportCsv = () => {
    const header = ['Transaction ID', 'Student', 'Tutor', 'Amount', 'Commission', 'Revenue', 'Status'];
    const rows = transactions.map((txn) => [txn.id, txn.student, txn.tutor, txn.amount.toFixed(2), txn.comm, txn.revenue.toFixed(2), txn.status]);
    const csv = [header, ...rows].map((row) => row.join(',')).join('\n');
    downloadFile('payments-report.csv', csv, 'text/csv;charset=utf-8;');
    appendAudit('REPORT_EXPORT', 'Payments report downloaded');
  };

  const handleTabChange = (tab: 'sessions' | 'advertisements') => {
    setActiveTab(tab);
    if (tab === 'advertisements') {
      appendAudit('TAB_SWITCH', 'Navigated from payments to advertisements');
      router.push('/dashboard/admin/advertisements');
    }
  };

  return (
    <div style={{ display: 'grid', gap: 22 }}>
      <div>
        <h2 style={{ margin: 0, color: '#111827', fontSize: 30, fontWeight: 900, fontFamily: "'Fraunces', serif" }}>Payments & Commission</h2>
        <p style={{ margin: '6px 0 0', color: '#6b7280' }}>Revenue and payout summary in LKR.</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'inline-flex', gap: 8, background: '#fff', borderRadius: 12, padding: 6, border: '1px solid #e5e7eb' }}>
          <button
            onClick={() => handleTabChange('sessions')}
            style={{
              border: 'none',
              background: activeTab === 'sessions' ? '#ecfeff' : 'transparent',
              color: activeTab === 'sessions' ? '#0f766e' : '#6b7280',
              padding: '8px 12px',
              borderRadius: 8,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Sessions
          </button>
          <button
            onClick={() => handleTabChange('advertisements')}
            style={{ border: 'none', background: 'transparent', color: '#6b7280', padding: '8px 12px', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}
          >
            Advertisements
          </button>
        </div>
        <button onClick={exportCsv} style={{ border: '1px solid #99f6e4', background: '#ecfeff', color: '#0f766e', borderRadius: 12, padding: '10px 14px', cursor: 'pointer' }}>Export Report</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <StatCard title="Total Commission" value="LKR 450,200.00" trend="+12.5%" />
        <StatCard title="Pending Payouts to Tutors" value="LKR 125,800.00" detail="Target: 200k" />
        <StatCard title="Total Transactions" value="1,284" trend="+5.7%" />
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, overflow: 'hidden', boxShadow: '0 8px 20px rgba(0,0,0,0.04)' }}>
        <div style={{ padding: 18, borderBottom: '1px solid #ecf4ef', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <h3 style={{ margin: 0, color: '#111827', fontFamily: "'Fraunces', serif" }}>Transaction History</h3>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }} style={{ padding: '8px 12px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 13, color: '#374151' }} />
          <span style={{ color: '#6b7280' }}>to</span>
         <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }} style={{ padding: '8px 12px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 13, color: '#374151' }} />
      </div>
        </div>

        <div style={{ padding: '12px 18px', borderBottom: '1px solid #ecf4ef', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input type="text" placeholder="Search by student, tutor or ID..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} style={{ flex: 1, minWidth: 200, padding: '10px 14px', borderRadius: 10, border: '1px solid #d1d5db', fontSize: 14, color: '#111827' }} />
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid #d1d5db', fontSize: 14, color: '#111827' }}>
            <option value="All">All Status</option>
            <option value="Success">Success</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
          </select>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
            <thead>
              <tr style={{ color: '#6b7280', fontSize: 12, textAlign: 'left', background: '#f0fdf4' }}>
                {['Transaction ID', 'Student', 'Tutor', 'Amount (LKR)', 'Comm %', 'Revenue', 'Status', 'Actions'].map((h) => (
                  <th key={h} style={{ padding: '12px 16px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleTransactions.map((txn, idx) => (
                <tr key={txn.id} style={{ borderTop: '1px solid #ecf4ef' }}>
                  <td style={{ padding: '14px 16px', color: '#6b7280', fontSize: 12, fontFamily: 'monospace' }}>{txn.id}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ color: '#111827', fontWeight: 700 }}>{txn.student}</div>
                    <div style={{ color: '#6b7280', fontSize: 12 }}>ID: ST-00{(page - 1) * pageSize + idx + 41}</div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ color: '#111827', fontWeight: 700 }}>{txn.tutor}</div>
                    <div style={{ color: '#6b7280', fontSize: 12 }}>ID: TR-10{(page - 1) * pageSize + idx + 92}</div>
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right', color: '#111827', fontWeight: 700 }}>{txn.amount.toFixed(2)}</td>
                  <td style={{ padding: '14px 16px', textAlign: 'right', color: '#6b7280' }}>{txn.comm}</td>
                  <td style={{ padding: '14px 16px', textAlign: 'right', color: '#0f766e', fontWeight: 700 }}>{txn.revenue.toFixed(2)}</td>
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}><StatusBadge status={txn.status} /></td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(txn.id);
                        appendAudit('COPY_TRANSACTION_ID', `Copied ${txn.id}`);
                      }}
                      style={{ border: '1px solid #e5e7eb', background: '#fff', color: '#374151', borderRadius: 8, padding: '4px 10px', cursor: 'pointer' }}
                    >
                      Copy ID
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ padding: 16, borderTop: '1px solid #ecf4ef', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#6b7280', fontSize: 13 }}>
          <span>
            Showing {filteredTransactions.length === 0 ? 0 : (page - 1) * pageSize + 1} to {Math.min(page * pageSize, filteredTransactions.length)} of {filteredTransactions.length} transactions
          </span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              style={{ border: '1px solid #99f6e4', background: '#fff', borderRadius: 8, padding: '4px 10px', color: '#0f766e', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1 }}
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                style={{ border: n === page ? '1px solid #0f766e' : '1px solid #99f6e4', background: n === page ? '#0f766e' : '#fff', borderRadius: 8, padding: '4px 10px', color: n === page ? '#fff' : '#0f766e', cursor: 'pointer' }}
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              style={{ border: '1px solid #99f6e4', background: '#fff', borderRadius: 8, padding: '4px 10px', color: '#0f766e', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.5 : 1 }}
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
