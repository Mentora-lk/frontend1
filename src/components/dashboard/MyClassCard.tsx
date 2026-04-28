'use client';

import Link from 'next/link';

export interface MyClass {
  id: number;
  tutorId: number;
  title: string;
  tutor: string;
  subject: string;
  location: string;
  mode: 'online' | 'offline' | 'both';
  fee: number;
  rating: number;
  status: 'active' | 'requested' | 'approved';
  sessionsAttended: number;
  totalSessions: number;
  nextSession: string;
  image: string;
}

interface MyClassCardProps {
  cls: MyClass;
  view: 'grid' | 'list';
}

const STATUS_CONFIG = {
  active: { color: '#10B981', bg: '#ECFDF5', label: 'Active' },
  requested: { color: '#F59E0B', bg: '#FFFBEB', label: 'Pending' },
  approved: { color: '#3B82F6', bg: '#EFF6FF', label: 'Approved' },
};

const MODE_CONFIG = {
  online: { color: '#10B981', label: '🌐 Online' },
  offline: { color: '#EF4444', label: '📍 In-Person' },
  both: { color: '#8B5CF6', label: '🔄 Hybrid' },
};

export default function MyClassCard({ cls, view }: MyClassCardProps) {
  const statusConfig = STATUS_CONFIG[cls.status];
  const modeConfig = MODE_CONFIG[cls.mode];
  const progressPercent = (cls.sessionsAttended / cls.totalSessions) * 100;

  // ── GRID VIEW ──────────────────────────────────────────────────────────
  if (view === 'grid') {
    return (
      <div
        style={{
          background: 'white',
          borderRadius: 18,
          overflow: 'hidden',
          boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
          border: '1px solid rgba(0,0,0,0.04)',
          transition: 'all 0.3s cubic-bezier(0.22,1,0.36,1)',
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.transform = 'translateY(-6px)';
          (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 28px rgba(0,0,0,0.12)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
          (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.05)';
        }}
      >
        {/* Image section */}
        <div style={{ position: 'relative', height: 140, overflow: 'hidden', background: '#F3F4F6' }}>
          <img
            src={cls.image}
            alt={cls.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.4s ease',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform = 'scale(1.08)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
            }}
          />
          {/* Status badge */}
          <div
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              background: statusConfig.bg,
              color: statusConfig.color,
              padding: '4px 10px',
              borderRadius: 6,
              fontSize: 10,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {statusConfig.label}
          </div>
        </div>

        {/* Content section */}
        <div style={{ padding: 16 }}>
          {/* Title & Rating */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', lineHeight: 1.3, flex: 1, marginRight: 8 }}>
              {cls.title}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#111827' }}>{cls.rating}</span>
              <span style={{ fontSize: 12 }}>⭐</span>
            </div>
          </div>

          {/* Tutor */}
          <p style={{ fontSize: 12, color: '#6B7280', marginBottom: 8 }}>
            By <span style={{ color: '#10B981', fontWeight: 600 }}>{cls.tutor}</span>
          </p>

          {/* Subject & Location */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                background: '#F3F4F6',
                color: '#374151',
                padding: '4px 8px',
                borderRadius: 5,
              }}
            >
              {cls.subject}
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                background: '#F3F4F6',
                color: '#374151',
                padding: '4px 8px',
                borderRadius: 5,
              }}
            >
              📍 {cls.location}
            </span>
          </div>

          {/* Mode badge */}
          <div
            style={{
              display: 'inline-block',
              fontSize: 11,
              fontWeight: 700,
              background: `${modeConfig.color}15`,
              color: modeConfig.color,
              padding: '4px 8px',
              borderRadius: 5,
              marginBottom: 12,
            }}
          >
            {modeConfig.label}
          </div>

          {/* Progress bar */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#6B7280' }}>Progress</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#111827' }}>
                {cls.sessionsAttended}/{cls.totalSessions}
              </span>
            </div>
            <div
              style={{
                width: '100%',
                height: 6,
                background: '#E5E7EB',
                borderRadius: 3,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${progressPercent}%`,
                  background: '#10B981',
                  borderRadius: 3,
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>

          {/* Fee & Next session */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: 12,
              borderTop: '1px solid #F3F4F6',
            }}
          >
            <div>
              <p style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 2 }}>Fee per session</p>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#10B981' }}>Rs. {cls.fee.toLocaleString()}</p>
            </div>
            <Link href={`/classes/${cls.id}`}>
              <button
                style={{
                  background: '#10B981',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  padding: '7px 14px',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: "'DM Sans',sans-serif",
                }}
              >
                View
              </button>
            </Link>
          </div>

          {/* Next session */}
          <p
            style={{
              fontSize: 11,
              color: '#6B7280',
              marginTop: 10,
              paddingTop: 10,
              borderTop: '1px solid #F3F4F6',
            }}
          >
            <span style={{ fontWeight: 600, color: '#374151' }}>Next:</span> {cls.nextSession}
          </p>
        </div>
      </div>
    );
  }

  // ── LIST VIEW ──────────────────────────────────────────────────────────
  return (
    <div
      style={{
        background: 'white',
        borderRadius: 16,
        padding: 16,
        boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
        border: '1px solid rgba(0,0,0,0.04)',
        display: 'flex',
        gap: 16,
        alignItems: 'center',
        transition: 'all 0.3s ease',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = '#F9FAFB';
        (e.currentTarget as HTMLElement).style.transform = 'translateX(4px)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = 'white';
        (e.currentTarget as HTMLElement).style.transform = 'translateX(0)';
      }}
    >
      {/* Image */}
      <div
        style={{
          width: 100,
          height: 100,
          borderRadius: 12,
          overflow: 'hidden',
          background: '#F3F4F6',
          flexShrink: 0,
        }}
      >
        <img
          src={cls.image}
          alt={cls.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </div>

      {/* Middle content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{cls.title}</h3>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 3,
              fontSize: 12,
              fontWeight: 700,
              color: '#111827',
            }}
          >
            {cls.rating} ⭐
          </div>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              background: statusConfig.bg,
              color: statusConfig.color,
              padding: '3px 8px',
              borderRadius: 4,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {statusConfig.label}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
          <p style={{ fontSize: 12, color: '#6B7280' }}>
            By <span style={{ color: '#10B981', fontWeight: 600 }}>{cls.tutor}</span>
          </p>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              background: '#F3F4F6',
              color: '#374151',
              padding: '3px 7px',
              borderRadius: 4,
            }}
          >
            {cls.subject}
          </span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              background: '#F3F4F6',
              color: '#374151',
              padding: '3px 7px',
              borderRadius: 4,
            }}
          >
            📍 {cls.location}
          </span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              background: `${modeConfig.color}15`,
              color: modeConfig.color,
              padding: '3px 7px',
              borderRadius: 4,
            }}
          >
            {modeConfig.label}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div>
            <span style={{ fontSize: 11, color: '#6B7280' }}>Progress: </span>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>
              {cls.sessionsAttended}/{cls.totalSessions}
            </span>
          </div>
          <div
            style={{
              width: 60,
              height: 4,
              background: '#E5E7EB',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${progressPercent}%`,
                background: '#10B981',
              }}
            />
          </div>
        </div>
      </div>

      {/* Right section */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: 11, color: '#6B7280' }}>Fee per session</p>
          <p style={{ fontSize: 15, fontWeight: 700, color: '#10B981' }}>Rs. {cls.fee.toLocaleString()}</p>
        </div>
        <p style={{ fontSize: 11, color: '#6B7280', maxWidth: 150, textAlign: 'right' }}>
          <span style={{ fontWeight: 600, color: '#374151' }}>Next:</span> {cls.nextSession}
        </p>
        <Link href={`/classes/${cls.id}`}>
          <button
            style={{
              background: '#10B981',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              padding: '8px 16px',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: "'DM Sans',sans-serif",
            }}
          >
            View Details
          </button>
        </Link>
      </div>
    </div>
  );
}
