'use client';

import { useState } from 'react';
import Link from 'next/link';
import TutorDashboardLayout from '@/components/dashboard/TutorDashboardLayout';

const MY_COMMUNITIES = [
  { id: 'al-maths-2025', name: 'A/L Maths 2025', members: 342, tags: ['Mathematics', 'A/L'], color: '#8B5CF6', icon: '📐' },
  { id: 'al-physics-hub', name: 'A/L Physics Hub', members: 518, tags: ['Physics', 'A/L'], color: '#3B82F6', icon: '⚡' },
];

const ALL_TAGS = ['All', 'Mathematics', 'Physics', 'A/L'];

const PENDING_REQUESTS = [
  { id: 1, name: 'Sachini Perera', community: 'A/L Maths 2025', date: 'Oct 15, 2024' },
  { id: 2, name: 'Nuwan Kumara', community: 'A/L Physics Hub', date: 'Oct 16, 2024' },
];

export default function TutorCommunityPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');

  const filteredCommunities = MY_COMMUNITIES.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag === 'All' || c.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  return (
    <TutorDashboardLayout title="Community Management" subtitle="Manage your communities and connect with students on Mentora.lk.">
      <style>{`
        .post-card { transition: all 0.22s; } 
        .post-card:hover { box-shadow: 0 8px 32px rgba(0,0,0,0.1)!important; transform: translateY(-2px); }
        .tag-btn { background: white; border: 1px solid #E5E7EB; border-radius: 20px; padding: 6px 16px; font-size: 13px; font-weight: 600; cursor: pointer; color: #374151; transition: all 0.2s; font-family: 'DM Sans', sans-serif; }
        .tag-btn:hover, .tag-btn.active { background: #3B82F6; color: white; border-color: #3B82F6; }
      `}</style>

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        {/* Main Content Area */}
        <div style={{ flex: 1, minWidth: 0 }}>
          
          {/* Discover Header & Search */}
          <div style={{ background: 'white', borderRadius: 20, padding: 22, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.04)', marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 700, color: '#111827', margin: 0 }}>My Communities</h2>
              <button style={{ background: '#3B82F6', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg> Create New
              </button>
            </div>
            <div style={{ position: 'relative', marginBottom: 20 }}>
              <svg style={{ position: 'absolute', left: 14, top: 13, color: '#9CA3AF' }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              <input
                type="text"
                placeholder="Search your communities..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '12px 16px 12px 44px', border: '1px solid #E5E7EB', borderRadius: 12, fontSize: 15, fontFamily: "'DM Sans', sans-serif", outline: 'none', transition: 'border-color 0.2s' }}
                onFocus={e => e.target.style.borderColor = '#3B82F6'}
                onBlur={e => e.target.style.borderColor = '#E5E7EB'}
              />
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {ALL_TAGS.map(tag => (
                <button key={tag} className={`tag-btn ${selectedTag === tag ? 'active' : ''}`} onClick={() => setSelectedTag(tag)}>
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Communities Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {filteredCommunities.map(c => (
              <Link href={`/dashboard/tutor/community/${c.id}`} key={c.id} style={{ textDecoration: 'none' }}>
                <div className="post-card" style={{ background: 'white', borderRadius: 20, padding: 20, boxShadow: '0 4px 16px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: `${c.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
                      {c.icon}
                    </div>
                    <div>
                      <h4 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: '0 0 4px 0' }}>{c.name}</h4>
                      <p style={{ fontSize: 12, color: '#6B7280', margin: 0 }}>{c.members} members</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                    {c.tags.map(tag => (
                      <span key={tag} style={{ background: '#F3F4F6', color: '#4B5563', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>{tag}</span>
                    ))}
                  </div>
                  <div style={{ marginTop: 'auto' }}>
                    <div style={{ width: '100%', background: '#EFF6FF', border: `1px solid #DBEAFE`, color: '#1D4ED8', padding: '10px', borderRadius: 10, fontSize: 13, fontWeight: 700, textAlign: 'center', fontFamily: "'DM Sans', sans-serif" }}>
                      Manage Community &rarr;
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

        </div>

        {/* Right panel */}
        <div style={{ width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* My Communities Widget */}
          <div style={{ background: 'white', borderRadius: 20, padding: 22, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.04)' }}>
            <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 12, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>My Communities</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {MY_COMMUNITIES.map(ac => {
                return (
                  <Link href={`/dashboard/tutor/community/${ac.id}`} key={ac.id} style={{ textDecoration: 'none' }}>
                    <button style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'transparent', border: 'none', borderRadius: 12, width: '100%', cursor: 'pointer', color: '#4B5563', transition: 'all 0.2s', textAlign: 'left', fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }} onMouseOver={e => e.currentTarget.style.background = '#F9FAFB'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                      {ac.icon}
                      {ac.name}
                    </button>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Pending Requests Widget */}
          <div style={{ background: 'white', borderRadius: 20, padding: 22, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.04)' }}>
            <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" /></svg>
              Student Requests
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {PENDING_REQUESTS.map(r => (
                <div key={r.id} style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingBottom: 12, borderBottom: '1px solid #F3F4F6' }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 4, lineHeight: 1.3 }}>{r.name}</p>
                    <p style={{ fontSize: 12, color: '#6B7280' }}>Requested for {r.community}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button style={{ flex: 1, background: '#10B981', color: 'white', border: 'none', padding: '6px', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>Accept</button>
                    <button style={{ flex: 1, background: '#F3F4F6', color: '#4B5563', border: 'none', padding: '6px', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>Decline</button>
                  </div>
                </div>
              ))}
              <button style={{ background: 'none', border: 'none', color: '#3B82F6', fontSize: 13, fontWeight: 700, cursor: 'pointer', textAlign: 'left', padding: 0, marginTop: 4, fontFamily: "'DM Sans', sans-serif" }}>View all requests &rarr;</button>
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: 20, padding: 22, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.04)' }}>
            <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 12 }}>My Community Stats</p>
            {[{ l: 'Total Students', v: '860' }, { l: 'Communities Managed', v: '2' }, { l: 'Resources Shared', v: '145' }].map((s, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < 2 ? '1px dashed #E5E7EB' : 'none' }}>
                <span style={{ fontSize: 13, color: '#6B7280' }}>{s.l}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{s.v}</span>
              </div>
            ))}
          </div>

        </div>
      </div>

    </TutorDashboardLayout>
  );
}
