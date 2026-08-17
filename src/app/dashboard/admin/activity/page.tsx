'use client';

import { useEffect, useMemo, useState } from 'react';
import { ADMIN_STORAGE_KEYS, type AdminAuditItem, getAuditTrail, downloadFile, saveStoredState } from '../utils/operations';

type SortOrder = 'newest' | 'oldest';

function formatDateTimeUTC(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '-';
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  const hh = String(d.getUTCHours()).padStart(2, '0');
  const mm = String(d.getUTCMinutes()).padStart(2, '0');
  const ss = String(d.getUTCSeconds()).padStart(2, '0');
  return `${y}-${m}-${day} ${hh}:${mm}:${ss} UTC`;
}

function StatCard({ title, value, accent }: { title: string; value: string; accent: string }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: 18, boxShadow: '0 8px 20px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ width: 44, height: 32, borderRadius: 10, background: accent, display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 700 }}>▣</div>
      </div>
      <div style={{ color: '#6b7280', fontSize: 13 }}>{title}</div>
      <div style={{ color: '#111827', fontSize: 28, fontWeight: 800, marginTop: 6 }}>{value}</div>
    </div>
  );
}

// Builds a compact pagination range: first, last, current ±1 sibling, and 'dots' for gaps.
function getPaginationRange(current: number, total: number, siblingCount = 1): (number | 'dots')[] {
  const totalPageNumbers = siblingCount * 2 + 5; // first + last + current + 2*dots + siblings

  if (totalPageNumbers >= total) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const leftSiblingIndex = Math.max(current - siblingCount, 1);
  const rightSiblingIndex = Math.min(current + siblingCount, total);

  const showLeftDots = leftSiblingIndex > 2;
  const showRightDots = rightSiblingIndex < total - 1;

  const firstPageIndex = 1;
  const lastPageIndex = total;

  if (!showLeftDots && showRightDots) {
    const leftItemCount = 3 + 2 * siblingCount;
    const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
    return [...leftRange, 'dots', lastPageIndex];
  }

  if (showLeftDots && !showRightDots) {
    const rightItemCount = 3 + 2 * siblingCount;
    const rightRange = Array.from({ length: rightItemCount }, (_, i) => total - rightItemCount + i + 1);
    return [firstPageIndex, 'dots', ...rightRange];
  }

  const middleRange = Array.from(
    { length: rightSiblingIndex - leftSiblingIndex + 1 },
    (_, i) => leftSiblingIndex + i
  );
  return [firstPageIndex, 'dots', ...middleRange, 'dots', lastPageIndex];
}

export default function AdminActivityPage() {
  const [logs, setLogs] = useState<AdminAuditItem[]>([]);
  const [query, setQuery] = useState('');
  const [actorFilter, setActorFilter] = useState('All');
  const [actionFilter, setActionFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [page, setPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    setLogs(getAuditTrail());
  }, []);

  const uniqueActors = useMemo(() => ['All', ...Array.from(new Set(logs.map((item) => item.actor)))], [logs]);
  const uniqueActions = useMemo(() => ['All', ...Array.from(new Set(logs.map((item) => item.action)))], [logs]);

  const filtered = useMemo(() => {
    const matched = logs.filter((item) => {
      const q = query.trim().toLowerCase();
      const matchesQuery = !q || item.action.toLowerCase().includes(q) || item.detail.toLowerCase().includes(q) || item.actor.toLowerCase().includes(q);
      const matchesActor = actorFilter === 'All' || item.actor === actorFilter;
      const matchesAction = actionFilter === 'All' || item.action === actionFilter;
      return matchesQuery && matchesActor && matchesAction;
    });

    // Sort by event time — same newest/oldest pattern used on the Tutors page.
    const sorted = [...matched].sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
    });

    return sorted;
  }, [logs, query, actorFilter, actionFilter, sortOrder]);

  const stats = useMemo(() => {
    const total = logs.length;
    const todayCount = logs.filter((item) => {
      const d = new Date(item.createdAt);
      const now = new Date();
      return d.getUTCFullYear() === now.getUTCFullYear() && d.getUTCMonth() === now.getUTCMonth() && d.getUTCDate() === now.getUTCDate();
    }).length;
    const securityCount = logs.filter((item) => item.action.includes('PASSWORD') || item.action.includes('SETTINGS')).length;
    const exportCount = logs.filter((item) => item.action.includes('EXPORT')).length;
    return { total, todayCount, securityCount, exportCount };
  }, [logs]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visibleLogs = filtered.slice((page - 1) * pageSize, page * pageSize);
  const paginationRange = useMemo(() => getPaginationRange(page, totalPages), [page, totalPages]);

  const refreshLogs = () => {
    setLogs(getAuditTrail());
    setPage(1);
  };

  const clearLogs = () => {
    saveStoredState(ADMIN_STORAGE_KEYS.audit, []);
    setLogs([]);
    setPage(1);
  };

  const exportLogs = () => {
    if (filtered.length === 0) return;
    const header = ['Time (UTC)', 'Actor', 'Action', 'Detail'];
    const rows = filtered.map((item) => [formatDateTimeUTC(item.createdAt), item.actor, item.action, item.detail]);
    const csv = [header, ...rows].map((row) => row.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(',')).join('\n');
    downloadFile('admin-activity-log.csv', csv, 'text/csv;charset=utf-8;');
  };

  return (
    <div
      style={{
        display: 'grid',
        gap: 20,
        background: 'linear-gradient(160deg, #f0fdfa 0%, #eef6ff 55%, #f6f4ff 100%)',
        borderRadius: 24,
        padding: 20,
        margin: -20,
      }}
    >
      <div>
        <h2 style={{ margin: 0, color: '#111827', fontSize: 30, fontWeight: 900, fontFamily: "'Fraunces', serif" }}>Activity Log</h2>
        <p style={{ margin: '6px 0 0', color: '#6b7280' }}>Operational audit trail for admin actions.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <StatCard title="Total Events" value={String(stats.total)} accent="#0f766e" />
        <StatCard title="Events Today" value={String(stats.todayCount)} accent="#27c3ff" />
        <StatCard title="Security Events" value={String(stats.securityCount)} accent="#7c3aed" />
        <StatCard title="Exports" value={String(stats.exportCount)} accent="#22c55e" />
      </div>

      <div style={{ background: 'linear-gradient(135deg, #ecfeff 0%, #f0fdfa 100%)', border: '1px solid #d7f2ea', borderRadius: 16, padding: 16, boxShadow: '0 8px 20px rgba(15,118,110,0.06)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.7fr 0.8fr 0.7fr auto auto auto', gap: 10 }}>
          <input
            type="text"
            placeholder="Search by action, detail or actor..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            style={{ padding: '12px 14px', borderRadius: 12, border: '1px solid #d1d5db', background: '#fff', color: '#111827', fontSize: 14 }}
          />

          <select value={actorFilter} onChange={(e) => { setActorFilter(e.target.value); setPage(1); }} style={{ padding: '12px 14px', borderRadius: 12, border: '1px solid #d1d5db', background: '#fff', color: '#111827', fontSize: 14 }}>
            {uniqueActors.map((actor) => (
              <option key={actor} value={actor}>{actor === 'All' ? 'Actor: All' : actor}</option>
            ))}
          </select>

          <select value={actionFilter} onChange={(e) => { setActionFilter(e.target.value); setPage(1); }} style={{ padding: '12px 14px', borderRadius: 12, border: '1px solid #d1d5db', background: '#fff', color: '#111827', fontSize: 14 }}>
            {uniqueActions.map((action) => (
              <option key={action} value={action}>{action === 'All' ? 'Action: All' : action}</option>
            ))}
          </select>

          {/* Sort by event time — same newest/oldest pattern as the Tutors page. */}
          <select value={sortOrder} onChange={(e) => { setSortOrder(e.target.value as SortOrder); setPage(1); }} style={{ padding: '12px 14px', borderRadius: 12, border: '1px solid #d1d5db', background: '#fff', color: '#111827', fontSize: 14 }}>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>

          <button onClick={refreshLogs} style={{ border: '1px solid #d1d5db', background: '#fff', color: '#374151', borderRadius: 12, padding: '0 14px', fontWeight: 700, cursor: 'pointer' }}>Refresh</button>
          <button onClick={clearLogs} style={{ border: '1px solid #fecaca', background: '#fef2f2', color: '#991b1b', borderRadius: 12, padding: '0 14px', fontWeight: 700, cursor: 'pointer' }}>Clear</button>
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, overflow: 'hidden', boxShadow: '0 8px 20px rgba(0,0,0,0.04)' }}>
        {/* Header row matches the Tutors page: title left, Export button right with live count. */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', padding: '18px 18px 0' }}>
          <h3 style={{ margin: 0, color: '#111827', fontFamily: "'Fraunces', serif", fontSize: 16 }}>Event Log</h3>
          <button
            onClick={exportLogs}
            disabled={filtered.length === 0}
            style={{
              borderRadius: 10,
              border: '1px solid ' + (filtered.length === 0 ? '#e5e7eb' : '#0f766e'),
              background: filtered.length === 0 ? '#f3f4f6' : '#0f766e',
              color: filtered.length === 0 ? '#9ca3af' : '#fff',
              padding: '10px 16px',
              fontWeight: 700,
              fontSize: 13,
              cursor: filtered.length === 0 ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Export Log {filtered.length > 0 ? `(${filtered.length})` : ''}
          </button>
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: 28 }}>
            <h3 style={{ margin: 0, color: '#111827', fontSize: 18, fontFamily: "'Fraunces', serif" }}>No matching activity records</h3>
            <p style={{ margin: '8px 0 0', color: '#6b7280', maxWidth: 680 }}>
              No audit records match your current filters. Try clearing filters, clicking refresh, or perform admin actions such as approvals, settings updates, and exports to generate traceable activity entries.
            </p>
            <div style={{ marginTop: 14, display: 'flex', gap: 10 }}>
              <button onClick={() => { setQuery(''); setActorFilter('All'); setActionFilter('All'); }} style={{ border: '1px solid #d1d5db', background: '#fff', color: '#374151', borderRadius: 10, padding: '8px 12px', fontWeight: 700, cursor: 'pointer' }}>Reset Filters</button>
              <button onClick={refreshLogs} style={{ border: '1px solid #99f6e4', background: '#ecfeff', color: '#0f766e', borderRadius: 10, padding: '8px 12px', fontWeight: 700, cursor: 'pointer' }}>Refresh Log</button>
            </div>
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto', marginTop: 14 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 980 }}>
                <thead>
                  <tr style={{ background: 'linear-gradient(90deg, #ecfeff 0%, #f0fdfa 100%)', textAlign: 'left' }}>
                    {['Time (UTC)', 'Actor', 'Action', 'Detail', 'Event ID'].map((h) => (
                      <th key={h} style={{ padding: '12px 16px', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#0f766e' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visibleLogs.map((item) => (
                    <tr
                      key={item.id}
                      style={{ borderTop: '1px solid #ecf4ef', transition: 'background 0.15s ease' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fdfb')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '14px 16px', color: '#374151', whiteSpace: 'nowrap' }}>{formatDateTimeUTC(item.createdAt)}</td>
                      <td style={{ padding: '14px 16px', color: '#111827', fontWeight: 700 }}>{item.actor}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ display: 'inline-flex', padding: '4px 9px', borderRadius: 999, background: '#ecfeff', color: '#0f766e', fontSize: 12, fontWeight: 700, border: '1px solid #99f6e4' }}>
                          {item.action}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', color: '#374151' }}>{item.detail}</td>
                      <td style={{ padding: '14px 16px', color: '#6b7280', fontFamily: 'monospace', fontSize: 12 }}>{item.id}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ padding: 16, borderTop: '1px solid #ecf4ef', background: '#fafdfc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#6b7280', fontSize: 13, flexWrap: 'wrap', gap: 10 }}>
              <span>Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, filtered.length)} of {filtered.length} events</span>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  style={{ border: '1px solid #99f6e4', background: '#fff', borderRadius: 8, padding: '4px 10px', color: '#0f766e', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1 }}
                >
                  Previous
                </button>

                {paginationRange.map((item, idx) =>
                  item === 'dots' ? (
                    <span key={`dots-${idx}`} style={{ padding: '4px 6px', color: '#6b7280', fontSize: 13, userSelect: 'none' }}>
                      &hellip;
                    </span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => setPage(item)}
                      style={{
                        border: item === page ? '1px solid #0f766e' : '1px solid #99f6e4',
                        background: item === page ? '#0f766e' : '#fff',
                        borderRadius: 8,
                        padding: '4px 10px',
                        color: item === page ? '#fff' : '#0f766e',
                        cursor: 'pointer',
                        minWidth: 32,
                      }}
                    >
                      {item}
                    </button>
                  )
                )}

                <button
                  onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={page === totalPages}
                  style={{ border: '1px solid #99f6e4', background: '#fff', borderRadius: 8, padding: '4px 10px', color: '#0f766e', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.5 : 1 }}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
