'use client';
import { useEffect, useMemo, useState } from 'react';
import { appendAudit, downloadFile } from '../utils/operations';

// ── Types ────────────────────────────────────────────────────────────────
type TutorPayment = {
  id: string;
  tutorId: string;
  tutor: string;
  adId: string;
  orderId: string;
  paymentId: string;
  currency: string;
  amount: number;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  date: string; // ISO yyyy-mm-dd
};

// tutor_name must come from your API route joining tutor_payments -> tutors/users on tutor_id.
// If your route doesn't join it yet, this falls back to showing the tutor_id.
function mapRow(row: any): TutorPayment {
  return {
    id: String(row.id),
    tutorId: String(row.tutor_id),
    tutor: row.tutor_name ?? `Tutor #${row.tutor_id}`,
    adId: row.ad_id != null ? String(row.ad_id) : '—',
    orderId: row.order_id ?? '—',
    paymentId: row.payment_id ?? '—',
    currency: row.currency ?? 'LKR',
    amount: Number(row.amount ?? 0),
    status: (row.status ?? 'PENDING') as TutorPayment['status'],
    date: (row.createdAt ?? '').slice(0, 10),
  };
}

// ── UI helpers ───────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const palette =
    status === 'COMPLETED'
      ? { bg: 'rgba(34,197,94,0.10)', color: '#22c55e', border: 'rgba(34,197,94,0.20)' }
      : status === 'PENDING'
      ? { bg: 'rgba(245,158,11,0.10)', color: '#f59e0b', border: 'rgba(245,158,11,0.20)' }
      : { bg: 'rgba(239,68,68,0.10)', color: '#ef4444', border: 'rgba(239,68,68,0.20)' };

  return (
    <span
      style={{
        padding: '4px 10px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        background: palette.bg,
        color: palette.color,
        border: `1px solid ${palette.border}`,
      }}
    >
      {status}
    </span>
  );
}

function StatCard({
  title,
  value,
  detail,
  accent,
}: {
  title: string;
  value: string;
  detail?: string;
  accent?: boolean;
}) {
  return (
    <div
      style={{
        background: accent ? '#ecfeff' : '#fff',
        border: `1px solid ${accent ? '#99f6e4' : '#e5e7eb'}`,
        borderRadius: 16,
        padding: 18,
        boxShadow: '0 8px 20px rgba(0,0,0,0.04)',
      }}
    >
      <div style={{ color: '#6b7280', fontSize: 13 }}>{title}</div>
      <div style={{ color: '#111827', fontSize: 28, fontWeight: 800, marginTop: 6 }}>{value}</div>
      {detail && <div style={{ color: '#6b7280', fontSize: 12, marginTop: 4 }}>{detail}</div>}
    </div>
  );
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  } catch {
    return false;
  }
}

function fmtCurrency(n: number) {
  return n.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(iso: string) {
  const d = new Date(iso + 'T00:00:00');
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-LK', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ── Detail drawer ────────────────────────────────────────────────────────
function PaymentDrawer({
  payment, onClose, onCopy, copiedId, copyError,
}: {
  payment: TutorPayment | null;
  onClose: () => void;
  onCopy: (id: string) => void;
  copiedId: string | null;
  copyError: string | null;
}) {
  const open = payment !== null;
  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(17,24,39,0.32)',
          opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 0.2s ease', zIndex: 40,
        }}
      />
      <div
        role="dialog"
        aria-hidden={!open}
        style={{
          position: 'fixed', top: 0, right: 0, height: '100vh', width: 380, maxWidth: '92vw',
          background: '#fff', boxShadow: '-16px 0 40px rgba(0,0,0,0.12)',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.24s ease', zIndex: 50,
          display: 'flex', flexDirection: 'column',
        }}
      >
        {payment && (
          <>
            <div style={{ padding: '20px 22px', borderBottom: '1px solid #ecf4ef', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ color: '#6b7280', fontSize: 12, fontFamily: 'monospace', marginBottom: 4 }}>{payment.id}</div>
                <h3 style={{ margin: 0, color: '#111827', fontSize: 19, fontWeight: 800, fontFamily: "'Fraunces', serif" }}>Advertisement Payment</h3>
              </div>
              <button onClick={onClose} aria-label="Close details" style={{ border: '1px solid #e5e7eb', background: '#fff', color: '#6b7280', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', fontSize: 15, lineHeight: 1 }}>✕</button>
            </div>

            <div style={{ padding: 22, overflowY: 'auto', flex: 1, display: 'grid', gap: 22 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <StatusBadge status={payment.status} />
                <button
                  onClick={() => onCopy(payment.id)}
                  style={{
                    border: `1px solid ${copyError === payment.id ? '#fca5a5' : copiedId === payment.id ? '#99f6e4' : '#e5e7eb'}`,
                    background: copyError === payment.id ? '#FEF2F2' : copiedId === payment.id ? '#ecfeff' : '#fff',
                    color: copyError === payment.id ? '#991B1B' : copiedId === payment.id ? '#0f766e' : '#374151',
                    borderRadius: 8, padding: '5px 11px', cursor: 'pointer', fontSize: 12.5, transition: 'all 0.15s ease',
                  }}
                >
                  {copyError === payment.id ? 'Failed' : copiedId === payment.id ? '✓ Copied' : 'Copy Payment ID'}
                </button>
              </div>

              <div>
                <div style={{ color: '#9ca3af', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>Date</div>
                <div style={{ background: '#f9fafb', border: '1px solid #f0f2f5', borderRadius: 12, padding: '12px 14px', color: '#111827', fontSize: 13, fontWeight: 600 }}>
                  {fmtDate(payment.date)}
                </div>
              </div>

              <div>
                <div style={{ color: '#9ca3af', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>Tutor</div>
                <div style={{ background: '#f9fafb', border: '1px solid #f0f2f5', borderRadius: 12, padding: '12px 14px' }}>
                  <div style={{ color: '#111827', fontWeight: 700 }}>{payment.tutor}</div>
                  <div style={{ color: '#6b7280', fontSize: 12, marginTop: 2 }}>ID: {payment.tutorId}</div>
                </div>
              </div>

              <div>
                <div style={{ color: '#9ca3af', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>Payment</div>
                <div style={{ display: 'grid', gap: 8, background: '#f9fafb', border: '1px solid #f0f2f5', borderRadius: 12, padding: '14px 16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280', fontSize: 13 }}>Ad ID</span>
                    <span style={{ color: '#111827', fontWeight: 700, fontSize: 13 }}>{payment.adId}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280', fontSize: 13 }}>Order ID</span>
                    <span style={{ color: '#6b7280', fontSize: 13, fontFamily: 'monospace' }}>{payment.orderId}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280', fontSize: 13 }}>Payment Gateway ID</span>
                    <span style={{ color: '#6b7280', fontSize: 13, fontFamily: 'monospace' }}>{payment.paymentId}</span>
                  </div>
                  <div style={{ height: 1, background: '#ecf4ef', margin: '4px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#0f766e', fontSize: 13, fontWeight: 700 }}>Amount</span>
                    <span style={{ color: '#0f766e', fontSize: 14, fontWeight: 800 }}>{payment.currency} {fmtCurrency(payment.amount)}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────
export default function ReportPage() {
  const [payments, setPayments] = useState<TutorPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [appliedFrom, setAppliedFrom] = useState('');
  const [appliedTo, setAppliedTo] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copyError, setCopyError] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<TutorPayment | null>(null);
  const pageSize = 5;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/admin/tutor-payments');
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        const data = await res.json();
        if (!cancelled) {
          setPayments((Array.isArray(data) ? data : data.rows ?? []).map(mapRow));
          setLoadError(null);
        }
      } catch (err) {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Failed to load payments');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        p.tutor.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.adId.toLowerCase().includes(q) ||
        p.orderId.toLowerCase().includes(q) ||
        p.paymentId.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'All' || p.status === statusFilter;
      const matchFrom = !appliedFrom || p.date >= appliedFrom;
      const matchTo = !appliedTo || p.date <= appliedTo;
      return matchSearch && matchStatus && matchFrom && matchTo;
    });
  }, [payments, search, statusFilter, appliedFrom, appliedTo]);

  const totalPages = Math.max(1, Math.ceil(filteredPayments.length / pageSize));

  const visiblePayments = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredPayments.slice(start, start + pageSize);
  }, [page, filteredPayments]);

  const periodActive = appliedFrom !== '' || appliedTo !== '';
  const periodTotal = useMemo(() => {
    if (!periodActive) return null;
    return filteredPayments.reduce((sum, p) => sum + p.amount, 0);
  }, [filteredPayments, periodActive]);

  const totalRevenue = useMemo(() => payments.reduce((sum, p) => sum + p.amount, 0), [payments]);
  const pendingTotal = useMemo(
    () => payments.filter((p) => p.status === 'PENDING').reduce((sum, p) => sum + p.amount, 0),
    [payments]
  );

  const hasActiveFilters = search !== '' || statusFilter !== 'All' || periodActive || dateFrom !== '' || dateTo !== '';

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('All');
    setDateFrom('');
    setDateTo('');
    setAppliedFrom('');
    setAppliedTo('');
    setPage(1);
    appendAudit('FILTER_CLEAR', 'Cleared advertisement payments filters');
  };

  const runDateSearch = () => {
    setAppliedFrom(dateFrom);
    setAppliedTo(dateTo);
    setPage(1);
    appendAudit('DATE_RANGE_SEARCH', `Filtered ad payments ${dateFrom || '…'} to ${dateTo || '…'}`);
  };

  const exportCsv = () => {
    if (filteredPayments.length === 0) return;
    const header = ['Payment ID', 'Date', 'Tutor', 'Tutor ID', 'Ad ID', 'Order ID', 'Payment Gateway ID', 'Amount', 'Currency', 'Status'];
    const rows = filteredPayments.map((p) => [p.id, p.date, p.tutor, p.tutorId, p.adId, p.orderId, p.paymentId, p.amount.toFixed(2), p.currency, p.status]);
    const csv = [header, ...rows].map((row) => row.join(',')).join('\n');
    const stamp = new Date().toISOString().slice(0, 10);
    downloadFile(`tutor-ad-payments-${stamp}.csv`, csv, 'text/csv;charset=utf-8;');
    appendAudit('REPORT_EXPORT', `Tutor advertisement payments report downloaded (${filteredPayments.length} rows)`);
  };

  const handleCopy = async (id: string) => {
    const ok = await copyToClipboard(id);
    if (ok) {
      setCopiedId(id);
      setCopyError(null);
      appendAudit('COPY_PAYMENT_ID', `Copied ${id}`);
      setTimeout(() => setCopiedId((prev) => (prev === id ? null : prev)), 1500);
    } else {
      setCopyError(id);
      setTimeout(() => setCopyError((prev) => (prev === id ? null : prev)), 1500);
    }
  };

  return (
    <div style={{ display: 'grid', gap: 22 }}>
      <div>
        <h2 style={{ margin: 0, color: '#111827', fontSize: 30, fontWeight: 900, fontFamily: "'Fraunces', serif" }}>Tutor Advertisement Payments</h2>
        <p style={{ margin: '6px 0 0', color: '#6b7280' }}>Payments made by tutors for advertisement placements, in LKR.</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
        {hasActiveFilters && (
          <button onClick={clearFilters} style={{ border: '1px solid #e5e7eb', background: '#fff', color: '#6b7280', borderRadius: 12, padding: '10px 14px', cursor: 'pointer' }}>Clear Filters</button>
        )}
        <button onClick={exportCsv} disabled={filteredPayments.length === 0} style={{ border: '1px solid #99f6e4', background: '#ecfeff', color: '#0f766e', borderRadius: 12, padding: '10px 14px', cursor: filteredPayments.length === 0 ? 'not-allowed' : 'pointer', opacity: filteredPayments.length === 0 ? 0.5 : 1 }}>Export Report</button>
      </div>

      {loadError && (
        <div style={{ background: '#FEF2F2', border: '1px solid #fca5a5', color: '#991B1B', borderRadius: 12, padding: '12px 16px', fontSize: 13 }}>
          Couldn't load payments: {loadError}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <StatCard title="Total Ad Revenue" value={`LKR ${fmtCurrency(totalRevenue)}`} />
        <StatCard title="Pending Payments" value={`LKR ${fmtCurrency(pendingTotal)}`} />
        <StatCard title="Total Payments" value={String(payments.length)} />
        {periodActive && periodTotal !== null && (
          <StatCard accent title={`Total: ${appliedFrom || 'Start'} → ${appliedTo || 'Now'}`} value={`LKR ${fmtCurrency(periodTotal)}`} detail={`${filteredPayments.length} payment${filteredPayments.length === 1 ? '' : 's'} in range`} />
        )}
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, overflow: 'hidden', boxShadow: '0 8px 20px rgba(0,0,0,0.04)' }}>
        <div style={{ padding: 18, borderBottom: '1px solid #ecf4ef', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <h3 style={{ margin: 0, color: '#111827', fontFamily: "'Fraunces', serif" }}>Payment History</h3>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="date"
              value={dateFrom}
              max={dateTo || undefined}
              onChange={(e) => setDateFrom(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && runDateSearch()}
              style={{ padding: '8px 12px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 13, color: '#374151' }}
            />
            <span style={{ color: '#6b7280' }}>to</span>
            <input
              type="date"
              value={dateTo}
              min={dateFrom || undefined}
              onChange={(e) => setDateTo(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && runDateSearch()}
              style={{ padding: '8px 12px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 13, color: '#374151' }}
            />
            <button
              onClick={runDateSearch}
              disabled={!dateFrom && !dateTo}
              title="Search this date range"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                border: '1px solid #0f766e', background: '#0f766e', color: '#fff',
                borderRadius: 10, padding: '8px 14px', fontSize: 13, fontWeight: 700,
                cursor: !dateFrom && !dateTo ? 'not-allowed' : 'pointer',
                opacity: !dateFrom && !dateTo ? 0.5 : 1,
              }}
            >
              <SearchIcon /> Search
            </button>
          </div>
        </div>

        <div style={{ padding: '12px 18px', borderBottom: '1px solid #ecf4ef', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search by tutor, ad ID, order ID, or payment ID..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            style={{ flex: 1, minWidth: 200, padding: '10px 14px', borderRadius: 10, border: '1px solid #d1d5db', fontSize: 14, color: '#111827' }}
          />
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid #d1d5db', fontSize: 14, color: '#111827' }}
          >
            <option value="All">All Status</option>
            <option value="COMPLETED">Completed</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
            <thead>
              <tr style={{ color: '#6b7280', fontSize: 12, textAlign: 'left', background: '#f0fdf4' }}>
                {['Payment ID', 'Date', 'Tutor', 'Ad ID', 'Order ID', 'Amount (LKR)', 'Status', 'Actions'].map((h) => (
                  <th key={h} style={{ padding: '12px 16px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={8} style={{ padding: '32px 16px', textAlign: 'center', color: '#6b7280' }}>Loading payments…</td>
                </tr>
              )}
              {!loading && visiblePayments.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ padding: '32px 16px', textAlign: 'center', color: '#6b7280' }}>
                    No payments match your filters.
                  </td>
                </tr>
              )}
              {!loading && visiblePayments.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => setSelectedPayment(p)}
                  style={{ borderTop: '1px solid #ecf4ef', cursor: 'pointer' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#f9fafb')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '14px 16px', color: '#6b7280', fontSize: 12, fontFamily: 'monospace' }}>{p.id}</td>
                  <td style={{ padding: '14px 16px', color: '#374151', fontSize: 13 }}>{fmtDate(p.date)}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ color: '#111827', fontWeight: 700 }}>{p.tutor}</div>
                    <div style={{ color: '#6b7280', fontSize: 12 }}>ID: {p.tutorId}</div>
                  </td>
                  <td style={{ padding: '14px 16px', color: '#374151', fontSize: 13 }}>{p.adId}</td>
                  <td style={{ padding: '14px 16px', color: '#6b7280', fontSize: 12, fontFamily: 'monospace' }}>{p.orderId}</td>
                  <td style={{ padding: '14px 16px', textAlign: 'right', color: '#0f766e', fontWeight: 700 }}>{p.amount.toFixed(2)}</td>
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}><StatusBadge status={p.status} /></td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleCopy(p.id)}
                      style={{
                        border: '1px solid #e5e7eb',
                        background: '#fff',
                        color: '#374151',
                        borderRadius: 8,
                        padding: '6px 12px',
                        cursor: 'pointer',
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      Copy ID
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div
          style={{
            padding: '14px 18px',
            borderTop: '1px solid #ecf4ef',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#f9fafb',
          }}
        >
          <div style={{ color: '#6b7280', fontSize: 13 }}>
            Page {page} of {totalPages} ({filteredPayments.length} total rows)
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                border: '1px solid #99f6e4',
                background: '#fff',
                borderRadius: 8,
                padding: '4px 10px',
                color: '#0f766e',
                cursor: page === 1 ? 'not-allowed' : 'pointer',
                opacity: page === 1 ? 0.5 : 1,
              }}
            >
              ‹
            </button>

            {Array.from(
              { length: totalPages },
              (_, i) => i + 1
            ).map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                style={{
                  border: n === page ? '1px solid #0f766e' : '1px solid #99f6e4',
                  background: n === page ? '#0f766e' : '#fff',
                  borderRadius: 8,
                  padding: '4px 10px',
                  color: n === page ? '#fff' : '#0f766e',
                  cursor: 'pointer',
                }}
              >
                {n}
              </button>
            ))}

            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              style={{
                border: '1px solid #99f6e4',
                background: '#fff',
                borderRadius: 8,
                padding: '4px 10px',
                color: '#0f766e',
                cursor: page === totalPages ? 'not-allowed' : 'pointer',
                opacity: page === totalPages ? 0.5 : 1,
              }}
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {/* Drawer */}
      <PaymentDrawer
        payment={selectedPayment}
        onClose={() => setSelectedPayment(null)}
        onCopy={handleCopy}
        copiedId={copiedId}
        copyError={copyError}
      />
    </div>
  );
}