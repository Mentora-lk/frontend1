'use client';

import { useState, useEffect, useCallback } from 'react';
import TutorDashboardLayout from '@/components/dashboard/TutorDashboardLayout';
import { tutorService, RevenueAnalytics } from '@/services/tutorService';
import { usePalette } from '@/hooks/usePalette';
import { useTheme } from '@/hooks/useTheme';

const money = (v: number) => `Rs. ${Math.round(v).toLocaleString()}`;
const today = () => new Date().toISOString().slice(0, 10);

export default function RevenueAnalyticsPage() {
  const palette = usePalette();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [data, setData] = useState<RevenueAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [rangeMonths, setRangeMonths] = useState<6 | 12>(6);

  // Add-transaction form
  const [entryType, setEntryType] = useState<'income' | 'outcome'>('income');
  const [entryAmount, setEntryAmount] = useState('');
  const [entryDescription, setEntryDescription] = useState('');
  const [entryDate, setEntryDate] = useState(today());
  const [entryError, setEntryError] = useState('');
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchAnalytics = useCallback(async (months: 6 | 12, signal?: { cancelled: boolean }) => {
    setLoading(true);
    try {
      const result = await tutorService.getRevenueAnalytics(months);
      if (signal?.cancelled) return;
      setData(result);
      setError('');
    } catch (err) {
      console.error('Failed to fetch revenue analytics', err);
      if (!signal?.cancelled) setError('Failed to load revenue analytics. Please try again.');
    } finally {
      if (!signal?.cancelled) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const signal = { cancelled: false };
    fetchAnalytics(rangeMonths, signal);
    return () => { signal.cancelled = true; };
  }, [rangeMonths, fetchAnalytics]);

  const resetForm = () => {
    setEntryAmount('');
    setEntryDescription('');
    setEntryDate(today());
    setEntryError('');
  };

  const submitTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(entryAmount);
    if (entryAmount === '' || isNaN(amount) || amount < 0) {
      setEntryError('Enter a valid amount (0 or more).');
      return;
    }

    setAdding(true);
    setEntryError('');
    try {
      await tutorService.addTransaction({
        type: entryType,
        amount,
        description: entryDescription.trim() || undefined,
        date: entryDate || undefined,
      });
      resetForm();
      await fetchAnalytics(rangeMonths);
    } catch (err) {
      console.error('Failed to add transaction', err);
      setEntryError('Failed to save. Please try again.');
    } finally {
      setAdding(false);
    }
  };

  const removeTransaction = async (id: number) => {
    if (!window.confirm('Delete this entry?')) return;
    setDeletingId(id);
    try {
      await tutorService.deleteTransaction(id);
      await fetchAnalytics(rangeMonths);
    } catch (err) {
      console.error('Failed to delete transaction', err);
      alert('Failed to delete. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <TutorDashboardLayout title="Revenue Analytics" subtitle="Track your income and outcome on Mentora.lk.">
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px', color: palette.textMuted }}>Loading...</div>
      </TutorDashboardLayout>
    );
  }

  if (error || !data) {
    return (
      <TutorDashboardLayout title="Revenue Analytics" subtitle="Track your income and outcome on Mentora.lk.">
        <div style={{ textAlign: 'center', padding: '60px 0', color: palette.textMuted }}>{error || 'No data available.'}</div>
      </TutorDashboardLayout>
    );
  }

  const { totalRevenue, totalOutcome, netProfit, monthlyRevenue, revenueGrowthPercent, monthlyChart, transactions } = data;

  const maxAmount = Math.max(...monthlyChart.map(m => Math.max(m.income, m.outcome)), 1);
  const isGrowthPositive = revenueGrowthPercent > 0;
  const isGrowthFlat = revenueGrowthPercent === 0;
  const growthColor = isGrowthFlat ? palette.textMuted : (isGrowthPositive ? '#10B981' : '#EF4444');
  const profitColor = netProfit >= 0 ? '#10B981' : '#EF4444';

  const statCards = [
    { label: 'Total Revenue', value: money(totalRevenue), icon: '💼', color: '#8B5CF6', bg: '#F5F3FF', border: '#DDD6FE' },
    { label: 'Total Outcome', value: money(totalOutcome), icon: '📤', color: '#EF4444', bg: '#FEF2F2', border: '#FECACA' },
    { label: 'Net Profit', value: money(netProfit), icon: profitColor === '#10B981' ? '📈' : '📉', color: profitColor, bg: profitColor === '#10B981' ? '#ECFDF5' : '#FEF2F2', border: profitColor === '#10B981' ? '#A7F3D0' : '#FECACA' },
    { label: 'This Month', value: money(monthlyRevenue), icon: '📅', color: '#3B82F6', bg: '#EFF6FF', border: '#BFDBFE' },
  ];

  return (
    <TutorDashboardLayout title="Revenue Analytics" subtitle="Track your income and outcome on Mentora.lk.">
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);} }
        .fade-up{animation:fadeUp 0.6s cubic-bezier(.22,1,.36,1) both;}
        .delay-1{animation-delay:0.08s;} .delay-2{animation-delay:0.16s;}
        .delay-3{animation-delay:0.24s;} .delay-4{animation-delay:0.32s;}
        .rev-stat-card{background:${palette.surface};border-radius:18px;padding:20px 22px;flex:1;min-width:180px;transition:all 0.28s cubic-bezier(.22,1,.36,1);border:1px solid ${palette.border};}
        .rev-stat-card:hover{transform:translateY(-5px);}
        .rev-bar{transition:opacity 0.15s ease;cursor:pointer;}
        .rev-bar:hover{opacity:0.85;}
        .txn-row{transition:background 0.15s ease;}
        .txn-row:hover{background:${palette.surfaceAlt};}
        .range-btn{padding:6px 14px;border-radius:9px;font-size:12px;font-weight:700;cursor:pointer;border:1.5px solid;font-family:'DM Sans',sans-serif;transition:all 0.2s;}
        .type-btn{flex:1;padding:10px;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;border:1.5px solid;font-family:'DM Sans',sans-serif;transition:all 0.2s;}
        .rev-input{width:100%;padding:10px 12px;border-radius:10px;border:1.5px solid ${palette.border};background:${palette.inputBg};color:${palette.textPrimary};font-size:13px;font-family:'DM Sans',sans-serif;outline:none;}
      `}</style>

      {/* ── STAT CARDS ── */}
      <div className="fade-up delay-1" style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        {statCards.map((s, i) => (
          <div key={i} className="rev-stat-card" style={{ boxShadow: `0 4px 20px ${s.border}55`, borderColor: s.border }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, marginBottom: 14 }}>{s.icon}</div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 900, color: palette.textPrimary, lineHeight: 1, marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: 13, color: palette.textSecondary, fontWeight: 500 }}>{s.label}</div>
          </div>
        ))}

        {/* Revenue growth card */}
        <div className="rev-stat-card" style={{ boxShadow: `0 4px 20px ${growthColor}22`, borderColor: `${growthColor}55`, minWidth: 180 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: `${growthColor}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={growthColor} strokeWidth="2.5">
              {isGrowthFlat
                ? <line x1="5" y1="12" x2="19" y2="12" />
                : isGrowthPositive
                  ? <><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></>
                  : <><polyline points="22 17 13.5 8.5 8.5 13.5 2 7" /><polyline points="16 17 22 17 22 11" /></>}
            </svg>
          </div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 900, color: growthColor, lineHeight: 1, marginBottom: 4 }}>
            {isGrowthFlat ? '—' : `${isGrowthPositive ? '+' : ''}${revenueGrowthPercent.toFixed(1)}%`}
          </div>
          <div style={{ fontSize: 13, color: palette.textSecondary, fontWeight: 500 }}>Revenue Growth</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>

        {/* ── MONTHLY CHART ── */}
        <div className="fade-up delay-2" style={{ flex: 2, minWidth: 340, background: palette.surface, borderRadius: 20, padding: 24, boxShadow: palette.shadow, border: `1px solid ${palette.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4, flexWrap: 'wrap', gap: 10 }}>
            <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, color: palette.textPrimary }}>Monthly Income vs Outcome</h3>
            <div style={{ display: 'flex', gap: 6 }}>
              {([6, 12] as const).map(m => (
                <button key={m} className="range-btn" onClick={() => setRangeMonths(m)}
                  style={{ background: rangeMonths === m ? '#10B981' : palette.surface, color: rangeMonths === m ? 'white' : palette.textSecondary, borderColor: rangeMonths === m ? '#10B981' : palette.border }}>
                  {m}mo
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: palette.textMuted }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: '#10B981', display: 'inline-block' }} /> Income
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: palette.textMuted }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: '#EF4444', display: 'inline-block' }} /> Outcome
            </span>
          </div>

          <div style={{ position: 'relative', height: 220, display: 'flex', alignItems: 'flex-end', gap: rangeMonths === 12 ? 8 : 14, borderBottom: `1px solid ${palette.border}`, paddingBottom: 0 }}>
            {[0.25, 0.5, 0.75].map(f => (
              <div key={f} style={{ position: 'absolute', left: 0, right: 0, bottom: `${f * 100}%`, borderTop: `1px dashed ${palette.border}`, opacity: 0.6 }} />
            ))}

            {monthlyChart.map((m, i) => {
              const incomePct = Math.max((m.income / maxAmount) * 100, m.income > 0 ? 3 : 0);
              const outcomePct = Math.max((m.outcome / maxAmount) * 100, m.outcome > 0 ? 3 : 0);
              return (
                <div key={`${m.month}-${m.year}-${i}`} style={{ flex: 1, position: 'relative', height: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 3 }}
                  onMouseEnter={() => setHoverIdx(i)} onMouseLeave={() => setHoverIdx(null)}>
                  {hoverIdx === i && (
                    <div style={{
                      position: 'absolute', bottom: `calc(${Math.max(incomePct, outcomePct)}% + 10px)`, left: '50%', transform: 'translateX(-50%)',
                      background: isDark ? '#F3F4F6' : '#111827', color: isDark ? '#111827' : 'white',
                      padding: '6px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap', zIndex: 5, boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    }}>
                      +{money(m.income)} / −{money(m.outcome)}
                    </div>
                  )}
                  <div className="rev-bar" style={{ width: '38%', height: `${incomePct}%`, minHeight: m.income > 0 ? 4 : 0, background: 'linear-gradient(180deg,#10B981,#059669)', borderRadius: '6px 6px 0 0' }} />
                  <div className="rev-bar" style={{ width: '38%', height: `${outcomePct}%`, minHeight: m.outcome > 0 ? 4 : 0, background: 'linear-gradient(180deg,#F87171,#EF4444)', borderRadius: '6px 6px 0 0' }} />
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: rangeMonths === 12 ? 8 : 14, marginTop: 10 }}>
            {monthlyChart.map((m, i) => (
              <div key={`${m.month}-${m.year}-label-${i}`} style={{ flex: 1, textAlign: 'center', fontSize: rangeMonths === 12 ? 10 : 12, fontWeight: i === monthlyChart.length - 1 ? 700 : 500, color: i === monthlyChart.length - 1 ? '#10B981' : palette.textMuted }}>
                {m.month}
              </div>
            ))}
          </div>
        </div>

        {/* ── ADD TRANSACTION ── */}
        <div className="fade-up delay-3" style={{ flex: 1, minWidth: 260, background: palette.surface, borderRadius: 20, padding: 22, boxShadow: palette.shadow, border: `1px solid ${palette.border}` }}>
          <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, fontWeight: 700, color: palette.textPrimary, marginBottom: 16 }}>Add Entry</h3>
          <form onSubmit={submitTransaction} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" className="type-btn" onClick={() => setEntryType('income')}
                style={{ background: entryType === 'income' ? '#10B981' : palette.surfaceAlt, color: entryType === 'income' ? 'white' : palette.textSecondary, borderColor: entryType === 'income' ? '#10B981' : palette.border }}>
                + Income
              </button>
              <button type="button" className="type-btn" onClick={() => setEntryType('outcome')}
                style={{ background: entryType === 'outcome' ? '#EF4444' : palette.surfaceAlt, color: entryType === 'outcome' ? 'white' : palette.textSecondary, borderColor: entryType === 'outcome' ? '#EF4444' : palette.border }}>
                − Outcome
              </button>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: palette.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Amount (Rs.)</label>
              <input type="number" min={0} className="rev-input" value={entryAmount} onChange={e => setEntryAmount(e.target.value)} placeholder="0" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: palette.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Description</label>
              <input type="text" className="rev-input" value={entryDescription} onChange={e => setEntryDescription(e.target.value)} placeholder="e.g. March fees, textbooks…" maxLength={255} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: palette.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Date</label>
              <input type="date" className="rev-input" value={entryDate} onChange={e => setEntryDate(e.target.value)} />
            </div>
            {entryError && <p style={{ fontSize: 12, color: '#EF4444', fontWeight: 600 }}>{entryError}</p>}
            <button type="submit" disabled={adding}
              style={{ padding: '11px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#10B981,#059669)', color: 'white', fontSize: 13, fontWeight: 700, cursor: adding ? 'default' : 'pointer', fontFamily: "'DM Sans',sans-serif", opacity: adding ? 0.7 : 1 }}>
              {adding ? 'Adding...' : 'Add Entry'}
            </button>
          </form>
        </div>
      </div>

      {/* ── TRANSACTIONS LIST ── */}
      <div className="fade-up delay-4" style={{ marginTop: 24, background: palette.surface, borderRadius: 20, padding: 24, boxShadow: palette.shadow, border: `1px solid ${palette.border}` }}>
        <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, color: palette.textPrimary, marginBottom: 4 }}>Transactions</h3>
        <p style={{ fontSize: 12, color: palette.textMuted, marginBottom: 20 }}>Your manually logged income and outcome entries</p>

        {transactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: palette.textMuted }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>🧾</div>
            <p style={{ fontSize: 14, fontWeight: 600 }}>No entries yet</p>
            <p style={{ fontSize: 12, marginTop: 4 }}>Use "Add Entry" above to log your first income or outcome</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
              <thead>
                <tr style={{ borderBottom: `1.5px solid ${palette.border}` }}>
                  {['Date', 'Type', 'Description', 'Amount', ''].map((h, i) => (
                    <th key={h || 'actions'} style={{ textAlign: i === 3 ? 'right' : (i === 4 ? 'center' : 'left'), padding: '0 12px 12px', fontSize: 11, fontWeight: 700, color: palette.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {transactions.map(t => (
                  <tr key={t.id} className="txn-row" style={{ borderBottom: `1px solid ${palette.border}` }}>
                    <td style={{ padding: '14px 12px', fontSize: 13, color: palette.textSecondary, whiteSpace: 'nowrap' }}>
                      {new Date(t.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '14px 12px' }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, borderRadius: 6, padding: '3px 9px', textTransform: 'uppercase', letterSpacing: '0.05em',
                        background: t.type === 'income' ? '#ECFDF5' : '#FEF2F2', color: t.type === 'income' ? '#059669' : '#DC2626',
                      }}>
                        {t.type === 'income' ? 'Income' : 'Outcome'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 12px', fontSize: 13, color: palette.textPrimary }}>{t.description || '—'}</td>
                    <td style={{ padding: '14px 12px', fontSize: 13, fontWeight: 700, textAlign: 'right', color: t.type === 'income' ? '#10B981' : '#EF4444' }}>
                      {t.type === 'income' ? '+' : '−'}{money(t.amount)}
                    </td>
                    <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                      <button onClick={() => removeTransaction(t.id)} disabled={deletingId === t.id}
                        style={{ fontSize: 11, fontWeight: 600, color: '#DC2626', background: '#FEF2F2', border: 'none', borderRadius: 7, padding: '5px 12px', cursor: deletingId === t.id ? 'default' : 'pointer', fontFamily: "'DM Sans',sans-serif", opacity: deletingId === t.id ? 0.6 : 1 }}>
                        {deletingId === t.id ? '...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </TutorDashboardLayout>
  );
}
