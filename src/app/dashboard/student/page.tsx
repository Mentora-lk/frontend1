<<<<<<< HEAD
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/dashboard/Sidebar';
import MyClassCard, { MyClass } from '@/components/dashboard/MyClassCard';

// ── All dummy data lives here ──────────────────────────────────────────────────
const MY_CLASSES: MyClass[] = [
  {
    id: 1, tutorId: 1,
    title: 'A/L Combined Mathematics',
    tutor: 'Kasun Fernando',
    subject: 'Mathematics',
    location: 'Moratuwa',
    mode: 'online',
    fee: 2500,
    rating: 4.8,
    status: 'active',
    sessionsAttended: 12,
    totalSessions: 20,
    nextSession: 'Monday, 6:00 PM',
    image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&q=80',
  },
  {
    id: 2, tutorId: 2,
    title: 'Advanced Level : ICT',
    tutor: 'Nimesh Dissanayake',
    subject: 'ICT',
    location: 'Piliyandala',
    mode: 'online',
    fee: 3000,
    rating: 4.6,
    status: 'active',
    sessionsAttended: 8,
    totalSessions: 24,
    nextSession: 'Wednesday, 5:00 PM',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&q=80',
  },
  {
    id: 3, tutorId: 3,
    title: 'A/L Physics Full Syllabus',
    tutor: 'Thilak Perera',
    subject: 'Physics',
    location: 'Moratuwa',
    mode: 'offline',
    fee: 2000,
    rating: 4.9,
    status: 'requested',
    sessionsAttended: 0,
    totalSessions: 18,
    nextSession: 'Awaiting tutor approval',
    image: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=400&q=80',
  },
  {
    id: 4, tutorId: 4,
    title: 'Music : Guitar For Beginners',
    tutor: 'Manoj Kumara',
    subject: 'Music',
    location: 'Matale',
    mode: 'offline',
    fee: 1500,
    rating: 4.7,
    status: 'approved',
    sessionsAttended: 0,
    totalSessions: 12,
    nextSession: 'Starts Saturday, 9:00 AM',
    image: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&q=80',
  },
  {
    id: 5, tutorId: 5,
    title: 'A/L Chemistry',
    tutor: 'Dilshan Rajapaksa',
    subject: 'Chemistry',
    location: 'Colombo',
    mode: 'both',
    fee: 3500,
    rating: 4.5,
    status: 'active',
    sessionsAttended: 5,
    totalSessions: 22,
    nextSession: 'Friday, 4:00 PM',
    image: 'https://images.unsplash.com/photo-1532094349884-543559c1a21c?w=400&q=80',
  },
];

const UPCOMING_SESSIONS = [
  { id: 1, subject: 'Mathematics', tutor: 'Kasun Fernando',   time: 'Mon, 6:00 PM · Tomorrow',   color: '#8B5CF6' },
  { id: 2, subject: 'ICT',         tutor: 'Nimesh Dissanayake', time: 'Wed, 5:00 PM · In 3 days',  color: '#F59E0B' },
  { id: 3, subject: 'Chemistry',   tutor: 'Dilshan Rajapaksa',  time: 'Fri, 4:00 PM · In 5 days',  color: '#10B981' },
];

const SUBJECT_COLORS: Record<string, string> = {
  Mathematics: '#8B5CF6', Physics: '#3B82F6', Chemistry: '#10B981',
  ICT: '#F59E0B', Music: '#EC4899', Business: '#F97316',
  English: '#06B6D4', Biology: '#84CC16', Default: '#6B7280',
};

// ── Page ──────────────────────────────────────────────────────────────────────
export default function StudentDashboard() {
  const [view, setView]           = useState<'grid' | 'list'>('grid');
  const [statusFilter, setStatus] = useState<string>('all');
  const [searchQuery, setSearch]  = useState('');

  // Derived stats
  const activeClasses    = MY_CLASSES.filter(c => c.status === 'active');
  const pendingClasses   = MY_CLASSES.filter(c => c.status === 'requested');
  const totalSpend       = MY_CLASSES.filter(c => c.status === 'active' || c.status === 'approved').reduce((s, c) => s + c.fee, 0);
  const avgRating        = (MY_CLASSES.reduce((s, c) => s + c.rating, 0) / MY_CLASSES.length).toFixed(1);

  // Filtered list
  const filtered = MY_CLASSES.filter(c => {
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        c.tutor.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: #F8FAF9; }
        a { text-decoration: none; color: inherit; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: #10B981; border-radius: 99px; }

        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation: fadeUp 0.6s cubic-bezier(.22,1,.36,1) both; }
        .delay-1 { animation-delay: 0.08s; }
        .delay-2 { animation-delay: 0.16s; }
        .delay-3 { animation-delay: 0.24s; }
        .delay-4 { animation-delay: 0.32s; }

        .stat-card {
          background: white; border-radius: 18px; padding: 20px 22px; flex: 1;
          transition: all 0.28s cubic-bezier(.22,1,.36,1);
          border: 1px solid rgba(0,0,0,0.04);
        }
        .stat-card:hover { transform: translateY(-5px); }

        .filter-tab {
          padding: 7px 18px; border-radius: 99px; font-size: 13px; font-weight: 600;
          cursor: pointer; border: 1.5px solid; font-family: 'DM Sans', sans-serif;
          transition: all 0.2s;
        }

        .class-grid  { display: grid; grid-template-columns: repeat(auto-fill, minmax(268px, 1fr)); gap: 22px; }
        .class-list  { display: flex; flex-direction: column; gap: 16px; }

        @media (max-width: 900px) {
          .dashboard-layout { flex-direction: column !important; }
          .sidebar-col { position: static !important; width: 100% !important; }
        }
      `}</style>

      {/* ── Top nav bar ─────────────────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(20px)',
        boxShadow: '0 2px 20px rgba(0,0,0,0.07)', padding: '0 5%',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 }}>
          <Link href="/">
            <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 900, color: '#111' }}>
              Mentora<span style={{ color: '#10B981' }}>.lk</span>
            </span>
          </Link>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Notification bell */}
            <div style={{ position: 'relative', cursor: 'pointer' }}>
              <div style={{ width: 38, height: 38, borderRadius: 11, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
              </div>
              <span style={{ position: 'absolute', top: -3, right: -3, width: 16, height: 16, borderRadius: '50%', background: '#EF4444', fontSize: 9, fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</span>
            </div>

            {/* Avatar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#10B981,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 16 }}>D</div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#111827', lineHeight: 1.2 }}>D.M.S.N. Dissanayake</span>
                <span style={{ fontSize: 11, color: '#9CA3AF' }}>Student</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Main layout ─────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '88px 5% 48px' }}>
        <div className="dashboard-layout" style={{ display: 'flex', gap: 28, alignItems: 'flex-start' }}>

          {/* ── SIDEBAR ───────────────────────────────────────────────────── */}
          <div className="sidebar-col">
            <Sidebar />
          </div>

          {/* ── MAIN CONTENT ──────────────────────────────────────────────── */}
          <div style={{ flex: 1, minWidth: 0 }}>

            {/* Welcome header */}
            <div className="fade-up" style={{ marginBottom: 28 }}>
              <p style={{ fontSize: 13, color: '#10B981', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>Welcome back 👋</p>
              <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(24px,3vw,36px)', fontWeight: 900, color: '#111827', lineHeight: 1.15 }}>
                My Learning Dashboard
              </h1>
              <p style={{ fontSize: 14, color: '#6B7280', marginTop: 6 }}>Track your classes, progress, and upcoming sessions.</p>
            </div>

            {/* ── STAT CARDS ──────────────────────────────────────────────── */}
            <div className="fade-up delay-1" style={{ display: 'flex', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
              {[
                { label: 'Total Classes',   value: MY_CLASSES.length,    icon: '📚', color: '#8B5CF6', bg: '#F5F3FF', border: '#DDD6FE', shadow: 'rgba(139,92,246,0.1)' },
                { label: 'Active Classes',  value: activeClasses.length, icon: '🟢', color: '#10B981', bg: '#ECFDF5', border: '#A7F3D0', shadow: 'rgba(16,185,129,0.1)'  },
                { label: 'Pending Approval',value: pendingClasses.length, icon: '⏳', color: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A', shadow: 'rgba(245,158,11,0.1)'  },
              ].map((s, i) => (
                <div key={i} className="stat-card" style={{ boxShadow: `0 4px 20px ${s.shadow}`, border: `1px solid ${s.border}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{s.icon}</div>
                  </div>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 900, color: '#111827', lineHeight: 1, marginBottom: 4 }}>{s.value}</div>
                  <div style={{ fontSize: 13, color: '#6B7280', fontWeight: 500 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* ── TWO COLUMN: Classes + Right panel ───────────────────────── */}
            <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>

              {/* Classes column */}
              <div style={{ flex: 1, minWidth: 0 }}>

                {/* Toolbar */}
                <div className="fade-up delay-2" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
                  {/* Status filters */}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {[
                      { key: 'all',       label: `All (${MY_CLASSES.length})` },
                      { key: 'active',    label: `Active (${activeClasses.length})` },
                      { key: 'requested', label: `Pending (${pendingClasses.length})` },
                      { key: 'approved',  label: 'Approved' },
                    ].map(tab => (
                      <button key={tab.key} className="filter-tab" onClick={() => setStatus(tab.key)}
                        style={{
                          background:   statusFilter === tab.key ? '#10B981' : 'white',
                          color:        statusFilter === tab.key ? 'white'   : '#6B7280',
                          borderColor:  statusFilter === tab.key ? '#10B981' : '#E5E7EB',
                          boxShadow:    statusFilter === tab.key ? '0 4px 12px rgba(16,185,129,0.3)' : 'none',
                        }}>
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Search + view toggle */}
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'white', border: '1.5px solid #E5E7EB', borderRadius: 11, padding: '8px 14px' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                      </svg>
                      <input
                        type="text" placeholder="Search classes..."
                        value={searchQuery} onChange={e => setSearch(e.target.value)}
                        style={{ border: 'none', outline: 'none', fontSize: 13, color: '#374151', background: 'transparent', width: 130, fontFamily: "'DM Sans',sans-serif" }}
                      />
                    </div>
                    {/* Grid / List toggle */}
                    <div style={{ display: 'flex', background: 'white', border: '1.5px solid #E5E7EB', borderRadius: 11, overflow: 'hidden' }}>
                      {(['grid', 'list'] as const).map(v => (
                        <button key={v} onClick={() => setView(v)} style={{
                          padding: '8px 13px', border: 'none', cursor: 'pointer',
                          background: view === v ? '#10B981' : 'transparent',
                          color: view === v ? 'white' : '#9CA3AF',
                          transition: 'all 0.2s', display: 'flex', alignItems: 'center',
                        }}>
                          {v === 'grid'
                            ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                            : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                          }
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Class cards */}
                <div className={`fade-up delay-3 ${view === 'grid' ? 'class-grid' : 'class-list'}`}>
                  {filtered.length > 0
                    ? filtered.map(cls => <MyClassCard key={cls.id} cls={cls} view={view} />)
                    : (
                      <div style={{ textAlign: 'center', padding: '60px 0', color: '#9CA3AF', gridColumn: '1/-1' }}>
                        <div style={{ fontSize: 48, marginBottom: 12 }}>🎓</div>
                        <p style={{ fontSize: 16, fontWeight: 600 }}>No classes found</p>
                        <p style={{ fontSize: 13, marginTop: 6 }}>Try a different filter or search term</p>
                        <Link href="/classes/search">
                          <button style={{ marginTop: 20, background: '#10B981', color: 'white', border: 'none', borderRadius: 10, padding: '11px 28px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>
                            Browse Classes
                          </button>
                        </Link>
                      </div>
                    )
                  }
                </div>
              </div>

              {/* ── RIGHT PANEL ───────────────────────────────────────────── */}
              <div className="fade-up delay-4" style={{ width: 260, flexShrink: 0 }}>

                {/* Upcoming sessions */}
                <div style={{ background: 'white', borderRadius: 20, padding: 22, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.04)', marginBottom: 20 }}>
                  <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, fontWeight: 700, color: '#111827', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    Upcoming Sessions
                  </h3>
                  {UPCOMING_SESSIONS.map((s, i) => (
                    <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '11px 0', borderBottom: i < UPCOMING_SESSIONS.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                      <div style={{ width: 40, height: 40, borderRadius: 11, background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={s.color} strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 2 }}>{s.subject}</p>
                        <p style={{ fontSize: 11, color: '#9CA3AF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>By {s.tutor}</p>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <p style={{ fontSize: 11, fontWeight: 600, color: '#374151' }}>{s.time.split('·')[0].trim()}</p>
                        <p style={{ fontSize: 10, color: '#9CA3AF' }}>{s.time.split('·')[1]?.trim()}</p>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
