'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import TutorDashboardLayout from '@/components/dashboard/TutorDashboardLayout';
import { getCommunities, getPendingRequests, updateRequestStatus, createCommunity } from '@/services/tutorCommunityService';
import { useTutorRequestSocket } from '@/hooks/useTutorRequestSocket';
import { usePalette } from '@/hooks/usePalette';

// Fallback colors/icons for communities without them in DB
const COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EC4899'];
const ICONS = ['📐', '⚡', '💻', '🧪', '📚'];

const ALL_TAGS = ['All', 'Mathematics', 'Physics', 'A/L', 'O/L', 'Science'];

export default function TutorCommunityPage() {
  const palette = usePalette();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');

  const [communities, setCommunities] = useState<any[]>([]);
  const [stats, setStats] = useState({ total_students: 0, total_resources: 0, communities_managed: 0 });
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCommName, setNewCommName] = useState('');
  const [newCommDesc, setNewCommDesc] = useState('');
  const [newCommTags, setNewCommTags] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  // Live updates: the backend pushes `new_membership_request` to this tutor's
  // personal Socket.io room the moment a student requests access, so the
  // widget below updates without a refresh.
  useTutorRequestSocket((request) => {
    setPendingRequests(prev => {
      if (prev.some(r => r.membership_id === request.membership_id)) return prev; // duplicate event
      return [request, ...prev];
    });
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [commRes, reqRes] = await Promise.all([
        getCommunities(),
        getPendingRequests()
      ]);

      if (commRes.status === 'success') {
        const enrichedCommunities = commRes.data.communities.map((c: any, index: number) => ({
          ...c,
          tags: c.tags || [],
          // Give them consistent colors/icons based on index if not provided by backend
          color: COLORS[index % COLORS.length],
          icon: ICONS[index % ICONS.length],
          members: c.members_count || 0 // if members_count is not provided by getCommunities, it might be 0
        }));
        setCommunities(enrichedCommunities);
        setStats({
          total_students: commRes.data.stats?.total_students || 0,
          total_resources: commRes.data.stats?.total_resources || 0,
          communities_managed: enrichedCommunities.length
        });
      }

      if (reqRes.status === 'success') {
        setPendingRequests(reqRes.data);
      }
    } catch (err: any) {
      console.warn('Expected error fetching data:', err.message || err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAction = async (membershipId: number, action: 'approved' | 'declined') => {
    try {
      const res = await updateRequestStatus(membershipId, action);
      if (res.status === 'success') {
        // Remove from pending list
        setPendingRequests(prev => prev.filter(r => r.membership_id !== membershipId));
        // If approved, we could potentially refetch communities to update members count
        if (action === 'approved') {
          fetchData();
        }
      }
    } catch (error) {
      console.error('Error updating request:', error);
      alert('Failed to update request');
    }
  };

  const handleCreateCommunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommName.trim()) return;
    try {
      const tagsArray = newCommTags.split(',').map(t => t.trim()).filter(Boolean);
      const res = await createCommunity({
        name: newCommName,
        description: newCommDesc,
        tags: tagsArray
      });
      if (res.status === 'success') {
        setShowCreateModal(false);
        setNewCommName('');
        setNewCommDesc('');
        setNewCommTags('');
        fetchData(); // Refresh the list
      }
    } catch (error) {
      console.error('Error creating community:', error);
      alert('Failed to create community');
    }
  };

  const filteredCommunities = communities.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag === 'All' || c.tags?.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  return (
    <TutorDashboardLayout title="Community Management" subtitle="Manage your communities and connect with students on Mentora.lk.">
      <style>{`
        .post-card { transition: all 0.22s; } 
        .post-card:hover { box-shadow: 0 8px 32px rgba(0,0,0,0.1)!important; transform: translateY(-2px); }
        .tag-btn { background: ${palette.surface}; border: 1px solid ${palette.border}; border-radius: 20px; padding: 6px 16px; font-size: 13px; font-weight: 600; cursor: pointer; color: ${palette.textSecondary}; transition: all 0.2s; font-family: 'DM Sans', sans-serif; }
        .tag-btn:hover, .tag-btn.active { background: #10B981; color: white; border-color: #10B981; }
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal-content { background: ${palette.surface}; padding: 32px; border-radius: 24px; width: 100%; max-width: 500px; box-shadow: 0 20px 40px rgba(0,0,0,0.35); }
        .input-field { width: 100%; padding: 12px 16px; border: 1.5px solid ${palette.border}; border-radius: 12px; font-size: 14px; font-family: 'DM Sans', sans-serif; margin-top: 8px; outline: none; transition: border-color 0.2s; background: ${palette.inputBg}; color: ${palette.textPrimary}; }
        .input-field:focus { border-color: #10B981; }
        @keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
      `}</style>

      {/* Create Community Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 700, color: palette.textPrimary, margin: '0 0 8px 0' }}>Create New Community</h2>
            <p style={{ fontSize: 14, color: palette.textSecondary, marginBottom: 24 }}>Set up a new space for your students to learn and discuss.</p>
            <form onSubmit={handleCreateCommunity}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: palette.textSecondary }}>Community Name *</label>
                <input required className="input-field" placeholder="e.g. A/L Physics 2025" value={newCommName} onChange={e => setNewCommName(e.target.value)} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: palette.textSecondary }}>Description</label>
                <textarea className="input-field" placeholder="What is this community about?" value={newCommDesc} onChange={e => setNewCommDesc(e.target.value)} rows={3} style={{ resize: 'none' }} />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: palette.textSecondary }}>Tags (comma separated)</label>
                <input className="input-field" placeholder="e.g. Physics, A/L, Mechanics" value={newCommTags} onChange={e => setNewCommTags(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowCreateModal(false)} style={{ background: palette.surfaceAlt, color: '#4B5563', border: 'none', padding: '10px 20px', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>Cancel</button>
                <button type="submit" style={{ background: '#10B981', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>Create Community</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <div style={{ width: 40, height: 40, border: `3px solid ${palette.border}`, borderTop: '3px solid #10B981', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: palette.textMuted, fontSize: 14 }}>Loading your communities...</p>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {/* Main Content Area */}
          <div style={{ flex: 1, minWidth: 300 }}>

            {/* Discover Header & Search */}
            <div style={{ background: palette.surface, borderRadius: 20, padding: 22, boxShadow: palette.shadow, border: `1px solid ${palette.border}`, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 700, color: palette.textPrimary, margin: 0 }}>My Communities</h2>
                <button onClick={() => setShowCreateModal(true)} style={{ background: '#10B981', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', gap: 6 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg> Create New
                </button>
              </div>
              <div style={{ position: 'relative', marginBottom: 20 }}>
                <svg style={{ position: 'absolute', left: 14, top: 13, color: palette.textMuted }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                <input
                  type="text"
                  placeholder="Search your communities..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ width: '100%', padding: '12px 16px 12px 44px', border: `1px solid ${palette.border}`, borderRadius: 12, fontSize: 15, fontFamily: "'DM Sans', sans-serif", outline: 'none', transition: 'border-color 0.2s' }}
                  onFocus={e => e.target.style.borderColor = '#10B981'}
                  onBlur={e => e.target.style.borderColor = palette.border}
                />
              </div>

            </div>

            {/* Communities Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
              {filteredCommunities.length > 0 ? filteredCommunities.map(c => (
                <Link href={`/dashboard/tutor/community/${c.id}`} key={c.id} style={{ textDecoration: 'none' }}>
                  <div className="post-card" style={{ background: palette.surface, borderRadius: 20, padding: 20, boxShadow: palette.shadow, border: `1px solid ${palette.border}`, display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                      <div>
                        <h4 style={{ fontSize: 15, fontWeight: 700, color: palette.textPrimary, margin: '0 0 4px 0' }}>{c.name}</h4>
                        {/* <p style={{ fontSize: 12, color: palette.textSecondary, margin: 0 }}>{c.members} members</p> */}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                      {c.tags?.map((tag: string) => (
                        <span key={tag} style={{ background: palette.surfaceAlt, color: '#4B5563', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>{tag}</span>
                      ))}
                    </div>
                    <div style={{ marginTop: 'auto' }}>
                      <div style={{ width: '100%', background: '#ECFDF5', border: `1px solid #A7F3D0`, color: '#059669', padding: '10px', borderRadius: 10, fontSize: 13, fontWeight: 700, textAlign: 'center', fontFamily: "'DM Sans', sans-serif" }}>
                        Manage Community &rarr;
                      </div>
                    </div>
                  </div>
                </Link>
              )) : (
                <div style={{ padding: 20, color: palette.textSecondary, fontSize: 14 }}>No communities found. Click "Create New" to start your first community.</div>
              )}
            </div>

          </div>

          {/* Right panel */}
          <div style={{ width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* My Communities Widget */}
            <div style={{ background: palette.surface, borderRadius: 20, padding: 22, boxShadow: palette.shadow, border: `1px solid ${palette.border}` }}>
              <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 12, fontWeight: 700, color: palette.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>My Communities</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {communities.map(ac => {
                  return (
                    <Link href={`/dashboard/tutor/community/${ac.id}`} key={ac.id} style={{ textDecoration: 'none' }}>
                      <button style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'transparent', border: 'none', borderRadius: 12, width: '100%', cursor: 'pointer', color: palette.textSecondary, transition: 'all 0.2s', textAlign: 'left', fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }} onMouseOver={e => e.currentTarget.style.background = palette.surfaceAlt} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                        {ac.name}
                      </button>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Pending Requests Widget */}
            <div style={{ background: palette.surface, borderRadius: 20, padding: 22, boxShadow: palette.shadow, border: `1px solid ${palette.border}` }}>
              <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, color: palette.textPrimary, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" /></svg>
                Student Requests
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {pendingRequests.length > 0 ? pendingRequests.map(r => (
                  <div key={r.membership_id} style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingBottom: 12, borderBottom: `1px solid ${palette.border}` }}>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: palette.textPrimary, marginBottom: 4, lineHeight: 1.3 }}>{r.student_name}</p>
                      <p style={{ fontSize: 12, color: palette.textSecondary }}>Requested for {r.community_name}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => handleRequestAction(r.membership_id, 'approved')} style={{ flex: 1, background: '#10B981', color: 'white', border: 'none', padding: '6px', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>Accept</button>
                      <button onClick={() => handleRequestAction(r.membership_id, 'declined')} style={{ flex: 1, background: palette.surfaceAlt, color: '#4B5563', border: 'none', padding: '6px', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>Decline</button>
                    </div>
                  </div>
                )) : (
                  <div style={{ fontSize: 13, color: palette.textMuted }}>No pending requests.</div>
                )}
              </div>
            </div>

            <div style={{ background: palette.surface, borderRadius: 20, padding: 22, boxShadow: palette.shadow, border: `1px solid ${palette.border}` }}>
              <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, color: palette.textPrimary, marginBottom: 12 }}>My Community Stats</p>
              {[{ l: 'Total Students', v: stats.total_students }, { l: 'Communities Managed', v: stats.communities_managed }, { l: 'Resources Shared', v: stats.total_resources }].map((s, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < 2 ? `1px dashed ${palette.border}` : 'none' }}>
                  <span style={{ fontSize: 13, color: palette.textSecondary }}>{s.l}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: palette.textPrimary }}>{s.v}</span>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}
    </TutorDashboardLayout>
  );
}
