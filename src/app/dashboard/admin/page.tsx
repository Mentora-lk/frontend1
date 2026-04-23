'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { revenueData, tutorVerifications } from '../../../data/adminData';
import { appendAudit } from './utils/operations';

function StatCard({ title, value, accent, detail }: { title: string; value: string; accent: string; detail?: string }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #dfeee8', borderRadius: 16, padding: 18, boxShadow: '0 8px 20px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div style={{ width: 52, height: 36, borderRadius: 10, background: accent, display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 700 }}>▣</div>
        <span style={{ color: '#10B981', fontSize: 12, fontWeight: 700 }}>12.5%</span>
      </div>
      <div style={{ color: '#6b7280', fontSize: 13 }}>{title}</div>
      <div style={{ color: '#111827', fontSize: 28, fontWeight: 800, marginTop: 6 }}>{value}</div>
      {detail && <div style={{ color: '#8aa0ae', fontSize: 12, marginTop: 4 }}>{detail}</div>}
    </div>
  );
}

function LineChart({ data, stroke = '#10B981' }: { data: { name: string; value: number }[]; stroke?: string }) {
  const width = 560;
  const height = 220;
  const padding = 20;
  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(max - min, 1);
  
  const points = data.map((d, i) => ({
    x: padding + (i * (width - padding * 2)) / (data.length - 1),
    y: height - padding - ((d.value - min) / range) * (height - padding * 2),
  }));

  const pathData = points
    .map((p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      const prev = points[i - 1];
      const cx = (prev.x + p.x) / 2;
      return `S ${cx} ${prev.y} ${p.x} ${p.y}`;
    })
    .join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="240" preserveAspectRatio="none" style={{ marginBottom: 8 }}>
      <defs>
        <linearGradient id="grad1" x1="0%" x2="0%" y1="0%" y2="100%">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.25" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0.02" />
        </linearGradient>
        <filter id="blur1">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.2" />
        </filter>
      </defs>
      <path d={`${pathData} L ${width - padding} ${height - padding} L ${padding} ${height - padding} Z`} fill="url(#grad1)" />
      <path d={pathData} fill="none" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3.5" fill={stroke} opacity="0.8" />
      ))}
      {points.map((p, i) => (
        <circle key={`t${i}`} cx={p.x} cy={p.y} r="4.5" fill="none" stroke={stroke} strokeWidth="1.5" opacity="0.3" />
      ))}
    </svg>
  );
}

function BarChart({ data }: { data: { name: string; value: number }[] }) {
  const width = 280;
  const height = 200;
  const padding = 18;
  const values = data.map((d) => d.value);
  const max = Math.max(...values);
  const barWidth = (width - padding * 2) / data.length * 0.7;
  const spacing = (width - padding * 2) / data.length;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="220" preserveAspectRatio="none">
      <defs>
        <linearGradient id="barGrad" x1="0%" x2="0%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="#10B981" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#059669" stopOpacity="0.7" />
        </linearGradient>
      </defs>
      {data.map((d, i) => {
        const barHeight = (d.value / max) * (height - padding * 2);
        const x = padding + i * spacing + (spacing - barWidth) / 2;
        const y = height - padding - barHeight;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barWidth} height={barHeight} fill="url(#barGrad)" rx="6" />
            <text x={x + barWidth / 2} y={height - padding + 16} textAnchor="middle" fontSize="11" fill="#6b7280" fontWeight="600">{d.name}</text>
          </g>
        );
      })}
    </svg>
  );
}

export default function Home() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [subject, setSubject] = useState('All');

  const recent = useMemo(() => {
    return tutorVerifications
      .filter((tutor) => {
        const matchesSearch = tutor.name.toLowerCase().includes(search.toLowerCase()) || tutor.email.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = status === 'All' || tutor.status === status;
        const matchesSubject = subject === 'All' || tutor.subject === subject;
        return matchesSearch && matchesStatus && matchesSubject;
      })
      .slice(0, 5);
  }, [search, status, subject]);

  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ margin: 0, color: '#111827', fontSize: 28, fontWeight: 900, fontFamily: "'Playfair Display', serif" }}>Admin Overview</h2>
          <p style={{ margin: '6px 0 0', color: '#6b7280' }}>Overview of current activity.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid #dfeee8', borderRadius: 12, padding: '10px 14px', minWidth: 290, boxShadow: '0 8px 20px rgba(0,0,0,0.04)' }}>
            <span style={{ color: '#9ca3af' }}>⌕</span>
            <input
              type="text"
              placeholder="Search by tutor name, email or NIC..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ border: 'none', outline: 'none', width: '100%', color: '#111827', fontSize: 14, background: 'transparent' }}
            />
          </div>
          <button onClick={() => { appendAudit('ADMIN_INVITE', 'Opened admin invite flow'); router.push('/dashboard/admin/signup'); }} style={{ border: 'none', background: '#10B981', color: '#fff', padding: '10px 14px', borderRadius: 12, fontWeight: 700, cursor: 'pointer', boxShadow: '0 10px 20px rgba(16,185,129,0.20)' }}>Send Invite</button>
          <button onClick={() => { setSearch(''); setStatus('All'); setSubject('All'); appendAudit('OVERVIEW_FILTER_RESET', 'Reset overview filters'); }} style={{ border: '1px solid #dfeee8', background: '#fff', color: '#374151', width: 40, height: 40, borderRadius: 12, fontWeight: 700, cursor: 'pointer' }}>⋯</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <StatCard title="Pending Review" value="24" accent="#0f766e" detail="+5 from yesterday" />
        <StatCard title="Verified Today" value="12" accent="#1d4ed8" detail="-2 from yesterday" />
        <StatCard title="Total Tutors" value="1,402" accent="#7c3aed" detail="+1% growth" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 16 }}>
        <div style={{ background: '#fff', border: '1px solid #dfeee8', borderRadius: 16, padding: 18, boxShadow: '0 8px 20px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div>
              <h3 style={{ margin: 0, color: '#111827', fontFamily: "'Playfair Display', serif", fontSize: 16 }}>Monthly Revenue Growth</h3>
              <div style={{ color: '#6b7280', fontSize: 12, marginTop: 2 }}>Jan - Jun 2024</div>
            </div>
            <div style={{ color: '#10B981', fontSize: 13, fontWeight: 700, background: '#ecfdf5', padding: '6px 10px', borderRadius: 8 }}>LKR 450k Peak</div>
          </div>
          <LineChart data={revenueData} stroke="#10B981" />
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#9ca3af', fontSize: 11, paddingTop: 8, borderTop: '1px solid #ecf4ef' }}>
            {revenueData.map((d) => <span key={d.name} style={{ fontWeight: 500 }}>{d.name}</span>)}
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #dfeee8', borderRadius: 16, padding: 18, boxShadow: '0 8px 20px rgba(0,0,0,0.04)' }}>
          <div style={{ marginBottom: 14 }}>
            <h3 style={{ margin: 0, color: '#111827', fontFamily: "'Playfair Display', serif", fontSize: 16 }}>Tutor Acquisition Trend</h3>
            <div style={{ color: '#6b7280', fontSize: 12, marginTop: 2 }}>New registrations this quarter</div>
          </div>
          <BarChart data={[{ name: 'Apr', value: 45 }, { name: 'May', value: 62 }, { name: 'Jun', value: 38 }]} />
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #dfeee8', borderRadius: 16, padding: 18, boxShadow: '0 8px 20px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div>
            <h3 style={{ margin: 0, color: '#111827', fontFamily: "'Playfair Display', serif", fontSize: 16 }}>Recent Tutor Verifications</h3>
            <div style={{ color: '#6b7280', fontSize: 12, marginTop: 2 }}>Recent review queue</div>
          </div>
          <button onClick={() => { appendAudit('OVERVIEW_VIEW_ALL', 'Opened tutor review queue'); router.push('/dashboard/admin/tutors'); }} style={{ border: 'none', background: 'none', color: '#10B981', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>View All →</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 0.7fr 0.7fr auto', gap: 10, marginBottom: 16 }}>
          <input
            type="text"
            placeholder="Search by tutor name, email or NIC..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: '12px 14px', borderRadius: 12, border: '1px solid #d1d5db', background: '#fff', color: '#111827', fontSize: 14 }}
          />
          <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ padding: '12px 14px', borderRadius: 12, border: '1px solid #d1d5db', background: '#fff', color: '#111827', fontSize: 14 }}>
            <option value="All">Status: All</option>
            <option>Pending</option>
            <option>Verified</option>
            <option>Missing Docs</option>
          </select>
          <select value={subject} onChange={(e) => setSubject(e.target.value)} style={{ padding: '12px 14px', borderRadius: 12, border: '1px solid #d1d5db', background: '#fff', color: '#111827', fontSize: 14 }}>
            <option>All</option>
            <option>Science</option>
            <option>Maths</option>
            <option>IT</option>
          </select>
          <button onClick={() => { setSearch(''); setStatus('All'); setSubject('All'); appendAudit('OVERVIEW_FILTER_RESET', 'Reset table filters'); }} style={{ borderRadius: 12, border: '1px solid #bbf7d0', background: '#ecfdf5', color: '#047857', padding: '0 14px', fontWeight: 700, cursor: 'pointer' }}>Reset</button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
            <thead>
              <tr style={{ color: '#6b7280', fontSize: 12, textAlign: 'left', background: '#f0fdf4', fontWeight: 700 }}>
                <th style={{ padding: '12px 8px' }}>Tutor</th>
                <th style={{ padding: '12px 8px' }}>Subject</th>
                <th style={{ padding: '12px 8px' }}>Applied</th>
                <th style={{ padding: '12px 8px' }}>Status</th>
                <th style={{ padding: '12px 8px', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((tutor) => (
                <tr key={tutor.id} style={{ borderTop: '1px solid #ecf4ef' }}>
                  <td style={{ padding: '12px 8px', color: '#111827', fontWeight: 600, fontSize: 14 }}>{tutor.name}</td>
                  <td style={{ padding: '12px 8px', color: '#374151', fontSize: 13 }}>{tutor.subject}</td>
                  <td style={{ padding: '12px 8px', color: '#6b7280', fontSize: 13 }}>{tutor.date}</td>
                  <td style={{ padding: '12px 8px' }}><span style={{ display: 'inline-block', padding: '4px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700, background: tutor.status === 'Pending' ? '#fef3c7' : tutor.status === 'Verified' ? '#dcfce7' : '#fee2e2', color: tutor.status === 'Pending' ? '#b45309' : tutor.status === 'Verified' ? '#166534' : '#991b1b' }}>{tutor.status}</span></td>
                  <td style={{ padding: '12px 8px', textAlign: 'center' }}><button onClick={() => { appendAudit('OVERVIEW_REVIEW_CLICK', `Opened review for ${tutor.name}`); router.push('/dashboard/admin/tutors'); }} style={{ border: 'none', background: '#ecfdf5', color: '#10B981', padding: '6px 12px', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>Review</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
