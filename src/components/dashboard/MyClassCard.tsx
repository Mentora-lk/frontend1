'use client';

import { useState } from 'react';
import Link from 'next/link';

// ── Types & config all self-contained ─────────────────────────────────────────
export interface MyClass {
  id: number;
  title: string;
  tutor: string;
  tutorId: number;
  subject: string;
  location: string;
  mode: 'online' | 'offline' | 'both';
  fee: number;
  status: 'active' | 'requested' | 'approved' | 'rejected';
  sessionsAttended: number;
  totalSessions: number;
  nextSession: string;
  image: string;
}

const STATUS_CONFIG = {
  active:    { label: 'Active',    icon: '🟢', bg: '#ECFDF5', color: '#065F46', border: '#A7F3D0' },
  requested: { label: 'Pending',   icon: '⏳', bg: '#FFFBEB', color: '#92400E', border: '#FDE68A' },
  approved:  { label: 'Approved',  icon: '✅', bg: '#EFF6FF', color: '#1E40AF', border: '#BFDBFE' },
  rejected:  { label: 'Rejected',  icon: '❌', bg: '#FEF2F2', color: '#991B1B', border: '#FECACA' },
};

const SUBJECT_COLORS: Record<string, string> = {
  Mathematics: '#8B5CF6', Physics: '#3B82F6', Chemistry: '#10B981',
  ICT: '#F59E0B', Music: '#EC4899', Business: '#F97316',
  English: '#06B6D4', Biology: '#84CC16', Default: '#6B7280',
};

const MODE_COLOR: Record<string, string> = {
  online: '#10B981', offline: '#3B82F6', both: '#F59E0B',
};

// ── MyClassCard ───────────────────────────────────────────────────────────────
interface Props { cls: MyClass; view: 'grid' | 'list'; onCancel?: () => void; }

export default function MyClassCard({ cls, view, onCancel }: Props) {
  const [hov, setHov] = useState(false);
  const cfg         = STATUS_CONFIG[cls.status];
  const subjectColor = SUBJECT_COLORS[cls.subject] || SUBJECT_COLORS.Default;
  const progressPct  = cls.totalSessions > 0
    ? Math.round((cls.sessionsAttended / cls.totalSessions) * 100) : 0;

  // ── LIST VIEW ──────────────────────────────────────────────────────────────
  if (view === 'list') {
    return (
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          display: 'flex', background: 'white', borderRadius: 18, overflow: 'hidden',
          transition: 'all 0.3s',
          transform: hov ? 'translateX(5px)' : 'translateX(0)',
          boxShadow: hov ? '0 12px 32px rgba(0,0,0,0.1)' : '0 2px 12px rgba(0,0,0,0.05)',
          border: hov ? `1px solid ${subjectColor}35` : '1px solid rgba(0,0,0,0.04)',
        }}
      >
        {/* Color strip */}
        <div style={{ width: 5, background: subjectColor, flexShrink: 0 }} />

        {/* Image */}
        <div style={{ width: 160, flexShrink: 0, overflow: 'hidden' }}>
          <img src={cls.image} alt={cls.title} style={{
            width: '100%', height: '100%', objectFit: 'cover',
            transition: 'transform 0.5s', transform: hov ? 'scale(1.06)' : 'scale(1)',
          }}/>
        </div>

        {/* Body */}
        <div style={{ flex: 1, padding: '18px 22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, color: '#111827', lineHeight: 1.35, maxWidth: '70%' }}>
                {cls.title}
              </h3>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, flexShrink: 0 }}>
                {cfg.icon} {cfg.label}
              </span>
            </div>
            <p style={{ fontSize: 13, color: '#10B981', fontWeight: 600, marginBottom: 6 }}>By {cls.tutor}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <span style={{ fontSize: 11, color: '#9CA3AF' }}>📍 {cls.location}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: MODE_COLOR[cls.mode], background: `${MODE_COLOR[cls.mode]}15`, borderRadius: 5, padding: '2px 7px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {cls.mode}
              </span>
              <span style={{ fontSize: 11, color: '#9CA3AF' }}>LKR {cls.fee.toLocaleString()}/mo</span>
            </div>
            <Link href={`/classes/${cls.tutorId}`}>
              <button
                style={{ background: 'none', border: '1px solid #E5E7EB', borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 600, color: '#10B981', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#10B981'; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = '#10B981'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#10B981'; e.currentTarget.style.borderColor = '#E5E7EB'; }}
              >View →</button>
            </Link>
            {(cls.status === 'requested' || cls.status === 'active') && onCancel && (
              <button
                onClick={e => { e.preventDefault(); onCancel(); }}
                style={{
                  background:'none', border:'1px solid #FCA5A5', borderRadius:8,
                  padding:'6px 14px', fontSize:12, fontWeight:600, color:'#EF4444',
                  cursor:'pointer', fontFamily:"'DM Sans',sans-serif", transition:'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background='#EF4444'; e.currentTarget.style.color='white'; }}
                onMouseLeave={e => { e.currentTarget.style.background='none'; e.currentTarget.style.color='#EF4444'; }}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── GRID VIEW ──────────────────────────────────────────────────────────────
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: 'white', borderRadius: 20, overflow: 'hidden',
        transition: 'all 0.32s cubic-bezier(.22,1,.36,1)',
        transform: hov ? 'translateY(-8px)' : 'translateY(0)',
        boxShadow: hov ? `0 20px 44px ${subjectColor}20` : '0 4px 18px rgba(0,0,0,0.06)',
        border: hov ? `1px solid ${subjectColor}35` : '1px solid rgba(0,0,0,0.04)',
      }}
    >
      {/* Image */}
      <div style={{ position: 'relative', height: 180, overflow: 'hidden' }}>
        <img src={cls.image} alt={cls.title} style={{
          width: '100%', height: '100%', objectFit: 'cover',
          transition: 'transform 0.5s', transform: hov ? 'scale(1.08)' : 'scale(1)',
        }}/>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(0,0,0,0.55) 0%,transparent 55%)' }}/>

        {/* Subject tag */}
        <div style={{ position: 'absolute', top: 12, left: 12, background: subjectColor, borderRadius: 7, padding: '4px 10px', fontSize: 11, fontWeight: 700, color: 'white' }}>
          {cls.subject}
        </div>

        {/* Status badge */}
        <div style={{ position: 'absolute', top: 12, right: 12, background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 7, padding: '4px 10px', fontSize: 11, fontWeight: 700, color: cfg.color }}>
          {cfg.icon} {cfg.label}
        </div>

        {/* Bottom strip */}
        <div style={{ position: 'absolute', bottom: 10, left: 12, right: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)' }}>📍 {cls.location}</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: MODE_COLOR[cls.mode], background: 'rgba(0,0,0,0.55)', padding: '2px 7px', borderRadius: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {cls.mode}
          </span>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '16px 18px 18px' }}>
        <h3 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 15, color: '#111827', lineHeight: 1.4, marginBottom: 5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {cls.title}
        </h3>
        <p style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 8 }}>
          By <span style={{ fontWeight: 600, color: '#10B981' }}>{cls.tutor}</span>
        </p>

        {/* Progress bar — active only */}
        {cls.status === 'active' && (
          <div style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 10, color: '#9CA3AF' }}>Progress</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#10B981' }}>
                {progressPct}% ({cls.sessionsAttended}/{cls.totalSessions} sessions)
              </span>
            </div>
            <div style={{ height: 5, background: '#F3F4F6', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 99, width: `${progressPct}%`, background: 'linear-gradient(90deg,#10B981,#059669)', transition: 'width 0.8s ease' }}/>
            </div>
          </div>
        )}

        {/* Next session / status info */}
        <div style={{
          background: cls.status === 'active' ? '#F0FDF4' : cls.status === 'requested' ? '#FFFBEB' : '#F9FAFB',
          borderRadius: 9, padding: '8px 11px', marginBottom: 12,
          display: 'flex', alignItems: 'center', gap: 7,
        }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: cls.status === 'active' ? '#065F46' : cls.status === 'requested' ? '#92400E' : '#6B7280' }}>
            {cls.status === 'active' ? '📅 Next:' : cls.status === 'requested' ? '⏳ Status:' : cls.status === 'approved' ? '✅ Status:' : '❌ Status:'}
          </span>
          <span style={{ fontSize: 12, fontWeight: 500, color: cls.status === 'active' ? '#065F46' : cls.status === 'requested' ? '#92400E' : '#6B7280' }}>
            {cls.nextSession}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid #F3F4F6' }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: '#059669' }}>
            LKR {cls.fee.toLocaleString()}<span style={{ fontSize: 10, fontWeight: 400, color: '#9CA3AF' }}>/mo</span>
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            <Link href={`/classes/${cls.tutorId}`}>
              <button
                style={{ background: 'none', border: '1px solid #E5E7EB', borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 600, color: '#10B981', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#10B981'; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = '#10B981'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#10B981'; e.currentTarget.style.borderColor = '#E5E7EB'; }}
              >View →</button>
            </Link>
            {(cls.status === 'requested' || cls.status === 'active') && onCancel && (
              <button
                onClick={e => { e.preventDefault(); onCancel(); }}
                style={{
                  background:'none', border:'1px solid #FCA5A5', borderRadius:8,
                  padding:'6px 14px', fontSize:12, fontWeight:600, color:'#EF4444',
                  cursor:'pointer', fontFamily:"'DM Sans',sans-serif", transition:'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background='#EF4444'; e.currentTarget.style.color='white'; }}
                onMouseLeave={e => { e.currentTarget.style.background='none'; e.currentTarget.style.color='#EF4444'; }}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}