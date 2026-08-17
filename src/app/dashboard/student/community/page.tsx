'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { discoverCommunities, getMyClasses, getMyDeadlines, getCommunityStats, getCommunityFeed, requestCommunityAccess, cancelCommunityRequest, getMyPendingRequests, togglePostReaction } from '@/services/studentCommunityService';
import { useCommunitySocket } from '@/hooks/useCommunitySocket';
import { useStudentRequestSocket } from '@/hooks/useStudentRequestSocket';
import { usePalette } from '@/hooks/usePalette';

const ALL_TAGS = ['All', 'Physics', 'Maths', 'ICT', 'Technology', 'Design', 'Backend', 'Science'];

export default function StudentCommunityPage() {
  const palette = usePalette();
  const [posts, setPosts] = useState<any[]>([]);
  const [communities, setCommunities] = useState<any[]>([]);
  const [activeCommunities, setActiveCommunities] = useState<any[]>([]);
  const [deadlines, setDeadlines] = useState<any[]>([]);
  const [communityStats, setCommunityStats] = useState({ activeStudents: 0, postsToday: 0, resourcesShared: 0 });

  // Discover state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');

  // Active Community state
  const [selectedActiveCommunity, setSelectedActiveCommunity] = useState<any>(null);
  const [isManageMenuOpen, setIsManageMenuOpen] = useState(false);
  const [mutedCommunities, setMutedCommunities] = useState<number[]>([]);

  // Request state — pendingRequests is the source of truth (backed by the
  // server, survives a refresh); pendingCommunities is just the id list
  // derived from it, kept for the Discover-grid button lookups.
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [pendingCommunities, setPendingCommunities] = useState<number[]>([]);
  const [requestingId, setRequestingId] = useState<number | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [requestError, setRequestError] = useState('');

  // Hidden posts state to survive refresh
  const [hiddenPostIds, setHiddenPostIds] = useState<number[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('hiddenPostIds');
      if (stored) {
        setHiddenPostIds(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to parse hiddenPostIds from localStorage', e);
    }
  }, []);

  const handleDeletePost = (id: number) => {
    const updatedHiddenIds = [...hiddenPostIds, id];
    setHiddenPostIds(updatedHiddenIds);
    localStorage.setItem('hiddenPostIds', JSON.stringify(updatedHiddenIds));
    setPosts(prev => prev.filter(p => p.id !== id));
  };

  const loadInitialData = async () => {
    // allSettled, not all — these are 4 independent endpoints; one failing
    // shouldn't blank the whole page (each widget updates on its own result).
    const [discRes, classesRes, deadRes, pendingRes, statsRes] = await Promise.allSettled([
      discoverCommunities(),
      getMyClasses(),
      getMyDeadlines(),
      getMyPendingRequests(),
      getCommunityStats()
    ]);

    if (discRes.status === 'fulfilled' && discRes.value) {
      setCommunities(discRes.value);
    } else if (discRes.status === 'rejected') {
      console.error("Failed to load discover communities", discRes.reason);
    }

    if (classesRes.status === 'fulfilled' && classesRes.value) {
      setActiveCommunities(classesRes.value);
    } else if (classesRes.status === 'rejected') {
      console.error("Failed to load my classes", classesRes.reason);
    }

    if (deadRes.status === 'fulfilled' && deadRes.value) {
      setDeadlines(deadRes.value);
    } else if (deadRes.status === 'rejected') {
      console.error("Failed to load deadlines", deadRes.reason);
    }

    if (pendingRes.status === 'fulfilled' && pendingRes.value) {
      setPendingRequests(pendingRes.value);
      setPendingCommunities(pendingRes.value.map((r: any) => r.community_id));
    } else if (pendingRes.status === 'rejected') {
      console.error("Failed to load pending requests", pendingRes.reason);
    }

    if (statsRes.status === 'fulfilled' && statsRes.value) {
      setCommunityStats(statsRes.value);
    } else if (statsRes.status === 'rejected') {
      console.error("Failed to load community stats", statsRes.reason);
    }
  };

  const loadCommunityFeed = async (communityId: string | number) => {
    try {
      const res = await getCommunityFeed(communityId);
      if (res) setPosts(res);
    } catch (err) {
      console.error("Failed to load community feed", err);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedActiveCommunity) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadCommunityFeed(selectedActiveCommunity.id);
    }
  }, [selectedActiveCommunity]);

  // Live updates: join the selected community's Socket.io room so a tutor's
  // new post shows up here immediately instead of only after a refresh.
  const { status: socketStatus } = useCommunitySocket(
    selectedActiveCommunity?.id,
    (rawPost) => {
      setPosts(prev => {
        if (prev.some(p => p.id === rawPost.id)) return prev; // duplicate event
        return [{
          id: rawPost.id,
          type: rawPost.type,
          content: rawPost.content,
          media_url: rawPost.media_url,
          poll_options: rawPost.poll_options,
          is_pinned: rawPost.is_pinned,
          created_at: rawPost.created_at,
          author_id: rawPost.author_id,
          author_name: rawPost.author_name || selectedActiveCommunity?.tutor_name || 'Tutor',
          author_avatar: null,
          role: rawPost.author_role === 'tutor' ? 'Tutor' : 'Student',
          reaction_count: 0,
          has_reacted: false,
        }, ...prev];
      });
    }
  );

  // Live updates: the backend pushes `membership_request_updated` to this
  // student's personal Socket.io room the moment a tutor accepts or declines
  // one of their pending community requests, so "My Requests" and the
  // Discover/Active-Communities lists update without a refresh.
  const { status: requestSocketStatus } = useStudentRequestSocket((update) => {
    setPendingRequests(prev => prev.filter(r => r.membership_id !== update.membership_id));
    setPendingCommunities(prev => prev.filter(cid => cid !== update.community_id));

    if (update.status === 'approved') {
      // Now that the student has an approved membership, this community is
      // no longer a valid Discover target — drop it so its card doesn't
      // fall back to showing "Request Access" again.
      setCommunities(prev => prev.filter(c => c.id !== update.community_id));
      // Refetch so the newly-approved community shows up under Active
      // Communities with correct member_count/tutor info from the server.
      getMyClasses().then(res => { if (res) setActiveCommunities(res); }).catch(err => console.error('Failed to refresh my classes', err));
    } else if (update.status === 'declined') {
      // A declined request is eligible to be re-requested — bring the
      // community back into the Discover grid without a full page reload.
      discoverCommunities().then(res => { if (res) setCommunities(res); }).catch(err => console.error('Failed to refresh discover communities', err));
    }
  });

  const toggleLike = async (id: number) => {
    try {
      const res = await togglePostReaction(id);
      if (res) {
        setPosts(prev => prev.map(p => p.id === id ? { ...p, has_reacted: res.reacted, reaction_count: res.reactionCount } : p));
      }
    } catch (err) {
      console.error("Failed to toggle reaction", err);
    }
  };

  const handleRequestAccess = async (id: number) => {
    if (requestingId) return; // already submitting one — avoid double requests
    try {
      setRequestError('');
      setRequestingId(id);
      const res = await requestCommunityAccess(id);
      setPendingCommunities(prev => [...prev, id]);
      if (res?.membership) {
        const community = communities.find(c => c.id === id);
        setPendingRequests(prev => [{
          membership_id: res.membership.id,
          requested_at: res.membership.requested_at,
          community_id: id,
          name: community?.name,
          description: community?.description,
          tags: community?.tags,
          tutor_name: community?.tutor_name,
          tutor_avatar: community?.tutor_avatar,
        }, ...prev]);
      }
    } catch (err: any) {
      console.error("Failed to request access", err);
      setRequestError(err?.message || 'Failed to request access. Please try again.');
    } finally {
      setRequestingId(null);
    }
  };

  const handleCancelRequest = async (id: number) => {
    if (cancellingId) return;
    try {
      setRequestError('');
      setCancellingId(id);
      await cancelCommunityRequest(id);
      setPendingCommunities(prev => prev.filter(pid => pid !== id));
      setPendingRequests(prev => prev.filter(r => r.community_id !== id));
    } catch (err: any) {
      console.error("Failed to cancel request", err);
      setRequestError(err?.message || 'Failed to cancel request. Please try again.');
    } finally {
      setCancellingId(null);
    }
  };

  const filteredCommunities = communities.filter(c => {
    const matchesSearch = c.name?.toLowerCase().includes(searchQuery.toLowerCase()) || c.tutor_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag === 'All' || (c.tags && c.tags.includes(selectedTag));
    return matchesSearch && matchesTag;
  });

  const renderPosts = () => {
    const visiblePosts = posts.filter(post => !hiddenPostIds.includes(post.id));
    return (
      <>
        {visiblePosts.map(post => (
          <div key={post.id} className="post-card" style={{ background: palette.surface, borderRadius: 20, padding: 22, boxShadow: palette.shadow, border: `1px solid ${palette.border}`, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: `#3B82F620`, color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 17, flexShrink: 0, overflow: 'hidden' }}>
                {post.author_avatar ? <img src={post.author_avatar} alt={post.author_name} style={{width:'100%', height:'100%', objectFit:'cover'}} /> : post.author_name?.charAt(0)}
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: palette.textPrimary, margin: '0 0 2px 0' }}>
                  {post.author_name}
                  {post.role === 'Tutor' && <span style={{ marginLeft: 6, color: '#4B5563', fontSize: 13, fontWeight: 600 }}>(Lead Tutor)</span>}
                </p>
                <p style={{ fontSize: 12, color: palette.textMuted, margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {post.is_pinned && (
                    <span style={{ color: '#0F766E', display: 'flex' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="#0F766E" stroke="#0F766E" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                    </span>
                  )}
                  {new Date(post.created_at).toLocaleString()}
                </p>
              </div>
            </div>
            {post.role === 'Tutor' && (
              <div style={{ display: 'flex', gap: 12, color: palette.textMuted }}>
                <button onClick={() => handleDeletePost(post.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: palette.textMuted, padding: 0 }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg></button>
              </div>
            )}
          </div>

          <p style={{ fontSize: 14, color: palette.textSecondary, lineHeight: 1.7, marginBottom: 16 }}>{post.content}</p>

          {/* Media Content */}
          {post.type === 'image' && post.media_url && (
            <div style={{ marginBottom: 16, padding: 12, background: palette.surfaceAlt, border: `1px solid ${palette.border}`, borderRadius: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <img src={post.media_url} alt="Post media" style={{ maxWidth: '100%', borderRadius: 8, marginBottom: 12, display: 'block' }} />
                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                  <a href={post.media_url} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#3B82F6', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                    Download Image
                  </a>
                </div>
              </div>
            </div>
          )}

          {['document', 'pdf', 'doc'].includes(post.type) && post.media_url && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, background: palette.surfaceAlt, border: `1px solid ${palette.border}`, borderRadius: 12, marginBottom: 16 }}>
              <div style={{ width: 48, height: 48, background: '#E0F2FE', color: '#0EA5E9', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: palette.textPrimary, margin: '0 0 2px 0' }}>Attached Document</p>
                <p style={{ fontSize: 12, color: palette.textSecondary, margin: 0, textTransform: 'uppercase' }}>{post.type}</p>
              </div>
              <a href={post.media_url} target="_blank" rel="noreferrer" style={{ background: 'none', color: '#10B981', border: 'none', padding: '8px 8px', fontSize: 18, cursor: 'pointer', display: 'flex' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
              </a>
            </div>
          )}

          {post.type === 'video' && post.media_url && (
            <div style={{ position: 'relative', width: '100%', height: 240, background: '#111827', borderRadius: 12, marginBottom: 16, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <video src={post.media_url} controls style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}

          {post.type === 'announcement' && post.media_url && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, background: palette.surfaceAlt, border: `1px solid ${palette.border}`, borderRadius: 12, marginBottom: 16 }}>
              <div style={{ width: 48, height: 48, background: '#E0F2FE', color: '#0EA5E9', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: palette.textPrimary, margin: '0 0 2px 0' }}>Attached File</p>
                <p style={{ fontSize: 12, color: palette.textSecondary, margin: 0 }}>Attachment</p>
              </div>
              <a href={post.media_url} target="_blank" rel="noreferrer" style={{ background: 'none', color: '#10B981', border: 'none', padding: '8px 8px', fontSize: 18, cursor: 'pointer', display: 'flex' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
              </a>
            </div>
          )}

          {/* Poll — read-only display for now; there's no vote-casting endpoint
              anywhere yet (tutor side shows the same static 0%/0 votes shell). */}
          {post.type === 'poll' && (() => {
            const options = typeof post.poll_options === 'string'
              ? (() => { try { return JSON.parse(post.poll_options); } catch { return null; } })()
              : post.poll_options;
            if (!options || !Array.isArray(options) || options.length === 0) return null;
            return (
              <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 12, padding: 16, marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1E40AF" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#1E40AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Poll</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {options.map((option: string, index: number) => (
                    <div key={index} style={{ background: '#DBEAFE', borderRadius: 8, padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#1E40AF' }}>{option}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#1E40AF' }}>0%</span>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: 11, color: palette.textMuted, marginTop: 12, marginBottom: 0 }}>0 votes • Voting isn&apos;t available yet</p>
              </div>
            );
          })()}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 4, paddingTop: 12, borderTop: `1px solid ${palette.border}` }}>
            <button className="like-btn" onClick={() => alert("Reply functionality coming soon!")} style={{ color: palette.textSecondary }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
              Reply
            </button>
          </div>
        </div>
        ))}
      </>
    );
  };

  return (
    <DashboardLayout title="Community" subtitle="Connect, discover, and learn with fellow students on Mentora.lk.">
      <style>{`
        .post-card { transition: all 0.22s; } 
        .post-card:hover { box-shadow: 0 8px 32px rgba(0,0,0,0.1)!important; }
        .like-btn { background: none; border: none; cursor: pointer; display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; padding: 7px 14px; border-radius: 9px; transition: all 0.2s; font-family: 'DM Sans', sans-serif; }
        .like-btn:hover { background: ${palette.surfaceAlt}; }
        .tab-btn { background: none; border: none; padding: 12px 24px; font-size: 15px; font-weight: 700; cursor: pointer; border-bottom: 2px solid transparent; color: ${palette.textSecondary}; font-family: 'DM Sans', sans-serif; transition: all 0.2s; }
        .tab-btn.active { color: #10B981; border-bottom-color: #10B981; }
        .tag-btn { background: ${palette.surface}; border: 1px solid ${palette.border}; border-radius: 20px; padding: 6px 16px; font-size: 13px; font-weight: 600; cursor: pointer; color: ${palette.textSecondary}; transition: all 0.2s; font-family: 'DM Sans', sans-serif; }
        .tag-btn:hover, .tag-btn.active { background: #10B981; color: white; border-color: #10B981; }
      `}</style>

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', paddingTop: 24 }}>
        {/* Main Content Area */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {selectedActiveCommunity ? (
            <>
              {/* Community Detail Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, padding: '0 8px', flexWrap: 'wrap', gap: 16 }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 700, color: palette.textPrimary, margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
                    {selectedActiveCommunity.name}
                    <span title={`Live updates: ${socketStatus}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: palette.surfaceAlt, borderRadius: 99, padding: '3px 9px', fontSize: 10, fontWeight: 700, letterSpacing: '0.03em', color: palette.textSecondary }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: socketStatus === 'connected' ? '#10B981' : socketStatus === 'connecting' ? '#F59E0B' : '#EF4444' }} />
                      {socketStatus === 'connected' ? 'LIVE' : socketStatus === 'connecting' ? 'CONNECTING' : 'OFFLINE'}
                    </span>
                    {mutedCommunities.includes(selectedActiveCommunity.id) && (
                      <span style={{ marginLeft: 10, color: palette.textMuted, display: 'flex' }} title="Notifications Muted">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
                      </span>
                    )}
                  </h2>
                  <p style={{ fontSize: 14, color: palette.textSecondary, margin: 0 }}>{selectedActiveCommunity.member_count || 0} Students active • Tutor: {selectedActiveCommunity.tutor_name}</p>
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexShrink: 0 }}>
                  <button onClick={() => setSelectedActiveCommunity(null)} style={{ background: '#ECFDF5', color: '#0F766E', border: '1px solid #CCFBF1', padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>Discover Communities</button>
                  <div style={{ position: 'relative' }}>
                    <button onClick={() => setIsManageMenuOpen(!isManageMenuOpen)} style={{ background: palette.surface, color: palette.textSecondary, border: `1px solid ${palette.border}`, padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> Manage</button>
                    {isManageMenuOpen && (
                      <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 8, background: palette.surface, border: `1px solid ${palette.border}`, borderRadius: 12, boxShadow: '0 10px 25px rgba(0,0,0,0.25)', width: 180, zIndex: 100, overflow: 'hidden' }}>
                        <button style={{ width: '100%', padding: '12px 16px', border: 'none', background: 'none', textAlign: 'left', fontSize: 13, fontWeight: 600, color: palette.textSecondary, cursor: 'pointer', borderBottom: `1px solid ${palette.border}` }} onMouseOver={e => e.currentTarget.style.background = palette.hoverBg} onMouseOut={e => e.currentTarget.style.background = palette.surface} onClick={() => {
                          if (mutedCommunities.includes(selectedActiveCommunity.id)) {
                            setMutedCommunities(prev => prev.filter(id => id !== selectedActiveCommunity.id));
                          } else {
                            setMutedCommunities(prev => [...prev, selectedActiveCommunity.id]);
                          }
                          setIsManageMenuOpen(false);
                        }}>
                          {mutedCommunities.includes(selectedActiveCommunity.id) ? 'Unmute Notifications' : 'Mute Notifications'}
                        </button>
                        <button style={{ width: '100%', padding: '12px 16px', border: 'none', background: 'none', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#EF4444', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.background = '#FEF2F2'} onMouseOut={e => e.currentTarget.style.background = 'white'} onClick={() => { setIsManageMenuOpen(false); alert('You have left the community.'); setSelectedActiveCommunity(null); }}>
                          Leave Community
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {renderPosts()}
            </>
          ) : (
            <>
              {/* Discover Header & Search */}
              <div style={{ background: palette.surface, borderRadius: 20, padding: 22, boxShadow: palette.shadow, border: `1px solid ${palette.border}`, marginBottom: 20 }}>
                <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 700, color: palette.textPrimary, marginBottom: 16 }}>Find Your Community</h2>
                {requestError && (
                  <div style={{ background: '#FEE2E2', border: '1px solid #FECACA', color: '#DC2626', padding: '10px 14px', borderRadius: 10, fontSize: 12, marginBottom: 16 }}>
                    {requestError}
                  </div>
                )}
                <div style={{ position: 'relative', marginBottom: 20 }}>
                  <svg style={{ position: 'absolute', left: 14, top: 13, color: palette.textMuted }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                  <input
                    type="text"
                    placeholder="Search by community name or tutor..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{ width: '100%', padding: '12px 16px 12px 44px', border: `1px solid ${palette.border}`, borderRadius: 12, fontSize: 15, fontFamily: "'DM Sans', sans-serif", outline: 'none', transition: 'border-color 0.2s', background: palette.inputBg || 'transparent', color: palette.textPrimary }}
                    onFocus={e => e.target.style.borderColor = '#10B981'}
                    onBlur={e => e.target.style.borderColor = palette.border}
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

              {/* Discover Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
                {filteredCommunities.map(c => (
                  <div key={c.id} className="post-card" style={{ background: palette.surface, borderRadius: 20, padding: 20, boxShadow: palette.shadow, border: `1px solid ${palette.border}`, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                      <div style={{ width: 48, height: 48, borderRadius: 12, background: `#8B5CF615`, color: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 20, flexShrink: 0, overflow: 'hidden' }}>
                        {c.tutor_avatar ? <img src={c.tutor_avatar} alt={c.tutor_name} style={{width:'100%', height:'100%', objectFit:'cover'}} /> : c.name.charAt(0)}
                      </div>
                      <div>
                        <h4 style={{ fontSize: 15, fontWeight: 700, color: palette.textPrimary, margin: '0 0 4px 0' }}>{c.name}</h4>
                        <p style={{ fontSize: 12, color: palette.textSecondary, margin: 0 }}>{c.tutor_name} • {c.member_count || 0} members</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                      {c.tags?.map((tag: string) => (
                        <span key={tag} style={{ background: palette.surfaceAlt, color: palette.textSecondary, padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>{tag}</span>
                      ))}
                    </div>
                    <div style={{ marginTop: 'auto' }}>
                      {pendingCommunities.includes(c.id) ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <button
                            disabled
                            style={{ width: '100%', background: palette.surfaceAlt, border: `1.5px solid ${palette.border}`, color: palette.textMuted, padding: '10px', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'not-allowed', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            Pending
                          </button>
                          <button
                            onClick={() => handleCancelRequest(c.id)}
                            disabled={cancellingId === c.id}
                            style={{ width: '100%', background: palette.surface, border: '1.5px solid #EF4444', color: '#EF4444', padding: '8px', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: cancellingId === c.id ? 'not-allowed' : 'pointer', opacity: cancellingId === c.id ? 0.6 : 1, fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s' }}
                            onMouseOver={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; }}
                            onMouseOut={e => { e.currentTarget.style.background = palette.surface; }}
                          >
                            {cancellingId === c.id ? 'Cancelling…' : 'Cancel Request'}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleRequestAccess(c.id)}
                          disabled={requestingId === c.id}
                          style={{ width: '100%', background: palette.surface, border: '1.5px solid #10B981', color: '#10B981', padding: '10px', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: requestingId === c.id ? 'not-allowed' : 'pointer', opacity: requestingId === c.id ? 0.6 : 1, fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s' }}
                          onMouseOver={e => { if (requestingId !== c.id) { e.currentTarget.style.background = '#10B981'; e.currentTarget.style.color = 'white'; } }}
                          onMouseOut={e => { if (requestingId !== c.id) { e.currentTarget.style.background = palette.surface; e.currentTarget.style.color = '#10B981'; } }}
                        >
                          {requestingId === c.id ? 'Sending Request…' : 'Request Access'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

        </div>

        {/* Right panel */}
        <div style={{ width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Pending Requests Widget — only shows when there's something pending;
              this is what makes a "Request Access" click visible after a refresh,
              since Discover itself hides pending communities. */}
          {pendingRequests.length > 0 && (
            <div style={{ background: palette.surface, borderRadius: 20, padding: 22, boxShadow: palette.shadow, border: `1px solid ${palette.border}` }}>
              <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 12, fontWeight: 700, color: palette.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                My Requests
                <span style={{ background: '#FEF3C7', color: '#B45309', borderRadius: 99, padding: '1px 8px', fontSize: 11, fontWeight: 700, letterSpacing: 0 }}>{pendingRequests.length}</span>
                <span title={`Live updates: ${requestSocketStatus}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: palette.surfaceAlt, borderRadius: 99, padding: '2px 8px', fontSize: 9, fontWeight: 700, letterSpacing: '0.03em', color: palette.textSecondary, marginLeft: 'auto' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: requestSocketStatus === 'connected' ? '#10B981' : requestSocketStatus === 'connecting' ? '#F59E0B' : '#EF4444' }} />
                  {requestSocketStatus === 'connected' ? 'LIVE' : requestSocketStatus === 'connecting' ? 'CONNECTING' : 'OFFLINE'}
                </span>
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {pendingRequests.map(r => (
                  <div key={r.membership_id} style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 12, borderBottom: `1px solid ${palette.border}` }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: '#8B5CF615', color: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0, overflow: 'hidden' }}>
                      {r.tutor_avatar ? <img src={r.tutor_avatar} alt={r.tutor_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : r.name?.charAt(0)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: palette.textPrimary, margin: '0 0 2px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.name}</p>
                      <p style={{ fontSize: 11, color: '#D97706', margin: 0, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                        Awaiting approval
                      </p>
                    </div>
                    <button
                      onClick={() => handleCancelRequest(r.community_id)}
                      disabled={cancellingId === r.community_id}
                      title="Cancel request"
                      style={{ background: 'none', border: 'none', color: palette.textMuted, cursor: cancellingId === r.community_id ? 'not-allowed' : 'pointer', padding: 4, flexShrink: 0, display: 'flex' }}
                      onMouseOver={e => e.currentTarget.style.color = '#EF4444'}
                      onMouseOut={e => e.currentTarget.style.color = '#9CA3AF'}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Communities Widget */}
          <div style={{ background: palette.surface, borderRadius: 20, padding: 22, boxShadow: palette.shadow, border: `1px solid ${palette.border}` }}>
            <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 12, fontWeight: 700, color: palette.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>Active Communities</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {activeCommunities.map(ac => {
                const isActive = selectedActiveCommunity?.id === ac.id;
                return (
                  <button key={ac.id} onClick={() => setSelectedActiveCommunity(ac)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: isActive ? 'rgba(16, 185, 129, 0.1)' : 'transparent', border: 'none', borderRadius: 12, width: '100%', cursor: 'pointer', color: isActive ? '#10B981' : palette.textSecondary, transition: 'all 0.2s', textAlign: 'left', fontWeight: isActive ? 700 : 600, fontFamily: "'DM Sans', sans-serif" }} onMouseOver={e => { if (!isActive) e.currentTarget.style.background = palette.surfaceAlt }} onMouseOut={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}>
                    <div style={{ width: 18, height: 18, borderRadius: 4, background: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 10, fontWeight: 'bold' }}>{ac.name.charAt(0)}</div>
                    {ac.name}
                  </button>
                );
              })}
            </div>
          </div>



          <div style={{ background: palette.surface, borderRadius: 20, padding: 22, boxShadow: palette.shadow, border: `1px solid ${palette.border}` }}>
            <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, color: palette.textPrimary, marginBottom: 12 }}>Community Stats</p>
            {[
              { l: 'Active Students', v: communityStats.activeStudents.toLocaleString() },
              { l: 'Posts Today', v: communityStats.postsToday.toLocaleString() },
              { l: 'Resources Shared', v: communityStats.resourcesShared.toLocaleString() },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < 2 ? `1px dashed ${palette.border}` : 'none' }}>
                <span style={{ fontSize: 13, color: palette.textSecondary }}>{s.l}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: palette.textPrimary }}>{s.v}</span>
              </div>
            ))}
          </div>

        </div>
      </div>

    </DashboardLayout>
  );
}
