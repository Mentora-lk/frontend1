'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import TutorDashboardLayout from '@/components/dashboard/TutorDashboardLayout';
import { getCommunityById, getCommunityPosts, getCommunityMembers, getCommunities, createPost, deleteCommunity, removeCommunityMember } from '@/services/tutorCommunityService';
import { useCommunitySocket } from '@/hooks/useCommunitySocket';
import { usePalette } from '@/hooks/usePalette';
import { toDownloadUrl } from '@/utils/cloudinaryDownload';

// Fallback colors/icons for communities without them in DB
const COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EC4899'];
const ICONS = ['📐', '⚡', '💻', '🧪', '📚'];

// Normalizes a raw post row (from getCommunityPosts, createPost's response, or
// a `new_community_post` Socket.io event — all three share the same
// author_name/author_role/media_url shape) into the display shape this page renders.
function mapPost(p: any) {
  let mediaUrl = p.media_url;
  if (p.type === 'image' && !mediaUrl) {
    mediaUrl = '/default-image.png';
  }
  return {
    id: p.id,
    author: p.author_name || 'Unknown User',
    avatar: p.author_name ? p.author_name[0] : 'U',
    color: '#10B981',
    time: new Date(p.created_at).toLocaleString(),
    content: p.content,
    likes: 0,
    replies: 0,
    pinned: p.is_pinned,
    isTutor: p.author_role === 'tutor',
    type: p.type || 'text',
    media_url: mediaUrl,
    mediaName: mediaUrl ? mediaUrl.split('/').pop() : '',
    size: 'Unknown',
    pollOptions: p.poll_options ? (typeof p.poll_options === 'string' ? JSON.parse(p.poll_options) : p.poll_options) : null
  };
}

function FileIcon({ type }: { type: string }) {
  const colors: Record<string, string> = { pdf: '#EF4444', doc: '#3B82F6', image: '#F59E0B', video: '#8B5CF6', document: '#10B981', announcement: '#6B7280' };
  const labels: Record<string, string> = { pdf: 'PDF', doc: 'DOC', image: 'IMG', video: 'VID', document: 'FILE', announcement: 'ATCH' };
  const c = colors[type] || '#6B7280';
  return (
    <div style={{ width: 42, height: 42, borderRadius: 10, background: `${c}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <span style={{ fontSize: 10, fontWeight: 800, color: c, letterSpacing: '0.05em' }}>{labels[type] || 'FILE'}</span>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function TutorCommunityDetailPage() {
  const palette = usePalette();
  const params = useParams();
  const communityId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [community, setCommunity] = useState<any>(null);
  const [allCommunities, setAllCommunities] = useState<any[]>([]);
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);

  const [activeTab, setActiveTab] = useState<'discussions' | 'files' | 'members'>('discussions');
  const [newMessage, setNewMessage] = useState('');
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [deleteCommunityPopup, setDeleteCommunityPopup] = useState(false);
  const [isMemberListOpen, setIsMemberListOpen] = useState(false);
  const [deleteMemberPopup, setDeleteMemberPopup] = useState<{isOpen: boolean; memberId: number | null; memberName: string}>({isOpen: false, memberId: null, memberName: ''});
  const [removingMember, setRemovingMember] = useState(false);
  const router = require('next/navigation').useRouter();

  const handleDeleteCommunity = async () => {
    try {
      const res = await deleteCommunity(communityId);
      if (res.status === 'success') {
        router.push('/dashboard/tutor/community');
      } else {
        alert(res.message || 'Failed to delete community');
      }
    } catch (e) {
      console.error("Error deleting community", e);
      alert('Error deleting community');
    }
  };

  const handleRemoveMember = async () => {
    if (!deleteMemberPopup.memberId || removingMember) return;
    try {
      setRemovingMember(true);
      const res = await removeCommunityMember(communityId, deleteMemberPopup.memberId);
      if (res.status === 'success') {
        setMembers(prev => prev.filter(m => m.id !== deleteMemberPopup.memberId));
        // Keep the banner's member count in step with the list we just trimmed.
        setCommunity((prev: any) => prev ? { ...prev, members: Math.max(0, (prev.members || 1) - 1) } : prev);
        setDeleteMemberPopup({ isOpen: false, memberId: null, memberName: '' });
      } else {
        alert(res.message || 'Failed to remove member');
      }
    } catch (e) {
      console.error("Error removing member", e);
      alert('Error removing member');
    } finally {
      setRemovingMember(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [communityId]);

  // Live updates: join the community's Socket.io room so posts/deadlines the
  // tutor (or a student) creates elsewhere show up here without a refresh.
  useCommunitySocket(
    communityId,
    (rawPost) => {
      setDiscussions(prev => {
        if (prev.some(d => d.id === rawPost.id)) return prev; // already added optimistically by submitPost, or a duplicate event
        return [mapPost(rawPost), ...prev];
      });
      if (rawPost.media_url) {
        setFiles(prev => {
          if (prev.some(f => f.id === rawPost.id)) return prev;
          return [{
            id: rawPost.id,
            name: rawPost.media_url.split('/').pop() || 'File',
            type: rawPost.type,
            size: 'Unknown',
            uploadedBy: rawPost.author_name || 'Tutor',
            date: new Date(rawPost.created_at).toLocaleString(),
            downloads: 0
          }, ...prev];
        });
      }
    }
  );

  const fetchData = async () => {
    try {
      setLoading(true);
      const [commRes, postsRes, membersRes, allCommRes] = await Promise.all([
        getCommunityById(communityId),
        getCommunityPosts(communityId),
        getCommunityMembers(communityId),
        getCommunities()
      ]);

      if (commRes.status === 'success') {
        const c = commRes.data;
        // Determine fallback color/icon by id string length or hash
        const hash = c.id ? String(c.id).length : 0;
        setCommunity({
          ...c,
          color: c.color || COLORS[hash % COLORS.length],
          icon: c.icon || ICONS[hash % ICONS.length],
          members: c.members_count || 0,
          category: c.tags?.[0] || 'General'
        });
      }
       
      if (postsRes.status === 'success') {
        const fetchedPosts = postsRes.data.map(mapPost);
        setDiscussions(fetchedPosts);

        // Populate files tab from posts that have an attachment
        setFiles(fetchedPosts.filter((p: any) => !!p.media_url).map((p: any) => ({
          id: p.id,
          name: p.mediaName || 'File',
          type: p.type,
          size: p.size,
          uploadedBy: p.author,
          date: p.time,
          downloads: 0
        })));
      }

      if (membersRes.status === 'success') {
        const fetchedMembers = membersRes.data.map((m: any, i: number) => ({
          name: m.name,
          role: m.role,
          id: m.id,
          avatar: m.name ? m.name[0] : 'U',
          color: COLORS[i % COLORS.length],
          school: 'Mentora.lk', // fallback
          joined: new Date(m.joined_at).toLocaleDateString()
        }));
        setMembers(fetchedMembers);
      }

      if (allCommRes.status === 'success') {
        const enrichedCommunities = allCommRes.data.communities.map((c: any, index: number) => ({
          ...c,
          color: COLORS[index % COLORS.length],
          icon: ICONS[index % ICONS.length],
        }));
        setAllCommunities(enrichedCommunities);
      }
    } catch (err: any) {
      console.warn('Expected error fetching data:', err.message || err);
      setError('Community could not be found');
    } finally { setLoading(false); }
  };

  const submitPost = async () => {
    if (!newMessage.trim() && !attachedFile) return;
    try {
      setError('');
      const postType = 'announcement';

      console.log('📤 Submitting post...');
      console.log('  Type:', postType);
      console.log('  Content:', newMessage.trim());
      console.log('  Has file?:', !!attachedFile);
      console.log('  File info:', attachedFile ? { name: attachedFile.name, size: attachedFile.size, type: attachedFile.type } : 'NO FILE');

      const res = await createPost(
        communityId,
        {
          type: postType,
          content: newMessage.trim()
        },
        attachedFile || undefined
      );

      console.log('📥 Response:', res);

      if (res.status === 'success') {
        const p = res.data;
        console.log('✅ Post created:', p);
        const newPost = {
          id: p.id,
          author: 'Tutor (You)',
          avatar: 'T',
          color: '#10B981',
          time: 'Just now',
          content: p.content,
          likes: 0,
          replies: 0,
          pinned: false,
          isTutor: true,
          type: p.type || postType,
          media_url: p.media_url,
          mediaName: attachedFile ? attachedFile.name : '',
          size: 'Unknown'
        };
        setDiscussions([newPost, ...discussions]);
        setNewMessage('');
        setAttachedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        console.error('❌ Post failed:', res.message);
        setError(res.message || 'Failed to post');
      }
    } catch (error: any) {
      console.error('❌ Error submitting post:', error);
      setError('Failed to post');
    }
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFile(file);
    }
  };

  const toggleLike = (id: number) => {
    setDiscussions(prev => prev.map(d => d.id === id ? { ...d, likes: d.likes + 1 } : d));
  };

  // Everyone except the community's own tutor can be removed. Role casing
  // varies by endpoint, so compare case-insensitively.
  const removableMembers = members.filter(m => String(m.role || '').toLowerCase() !== 'tutor');

  const tabs = [
    { key: 'discussions' as const, label: 'Feed & Discussions', count: discussions.length, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg> },
    { key: 'files' as const, label: 'Materials', count: files.length, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg> },
    { key: 'members' as const, label: 'Members', count: members.length, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg> },
  ];

  if (loading) {
    return (
      <TutorDashboardLayout title="Loading..." subtitle="Fetching community details">
        <style>{`@keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }`}</style>
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <div style={{ width: 40, height: 40, border: `3px solid ${palette.border}`, borderTop: '3px solid #10B981', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: palette.textMuted, fontSize: 14 }}>Loading community details...</p>
        </div>
      </TutorDashboardLayout>
    );
  }

  if (!community) {
    return <TutorDashboardLayout title="Not Found" subtitle="Community could not be found"><div style={{ padding: 40, textAlign: 'center' }}>Community not found.</div></TutorDashboardLayout>;
  }

  return (
    <TutorDashboardLayout title={community.name} subtitle={community.description}>
      <style>{`
        .tab-btn { transition: all 0.2s; }
        .tab-btn:hover { background: #F3F4F6 !important; }
        .disc-card { transition: all 0.2s; }
        .disc-card:hover { box-shadow: 0 8px 28px rgba(0,0,0,0.08) !important; }
        .file-row { transition: all 0.2s; }
        .file-row:hover { background: #F9FAFB !important; }
        .member-card { transition: all 0.2s; }
        .member-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.1) !important; }
        .action-icon { transition: all 0.2s; cursor: pointer; }
        .action-icon:hover { color: #10B981 !important; }
      `}</style>

      {/* Back link + community banner */}
      <div style={{ marginBottom: 24 }}>
        <Link href="/dashboard/tutor/community" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: palette.textSecondary, fontWeight: 500, marginBottom: 16 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
          Back to My Communities
        </Link>

        {/* Banner */}
        <div style={{
          background: `linear-gradient(135deg, ${community.color}, ${community.color}99)`,
          borderRadius: 20, padding: '24px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 40 }}>{community.icon}</span>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: 'white', fontFamily: "'DM Sans',sans-serif", display: 'flex', alignItems: 'center', gap: 10 }}>
                {community.name}
              </h2>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>{community.members} members · {community.category}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => setIsSettingsOpen(true)} style={{
              background: palette.surface, color: community.color,
              border: 'none', borderRadius: 10, padding: '8px 18px',
              fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", display: 'flex', alignItems: 'center', gap: 6
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
              Settings
            </button>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setIsSettingsOpen(false)}>
          <div style={{ background: palette.surface, padding: 32, borderRadius: 24, width: '100%', maxWidth: 400, boxShadow: '0 20px 40px rgba(0,0,0,0.35)' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 700, color: palette.textPrimary, margin: '0 0 16px 0' }}>Community Settings</h2>
            <p style={{ fontSize: 14, color: palette.textSecondary, marginBottom: 24 }}>Manage your community preferences.</p>

            <button onClick={() => { setIsSettingsOpen(false); setIsMemberListOpen(true); }} style={{ width: '100%', background: palette.surfaceAlt, color: palette.textPrimary, border: `1px solid ${palette.border}`, padding: '12px 16px', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="23" y1="11" x2="17" y2="11" /></svg>
              Remove Member
            </button>

            <button onClick={() => { setIsSettingsOpen(false); setDeleteCommunityPopup(true); }} style={{ width: '100%', background: '#FEE2E2', color: '#DC2626', border: 'none', padding: '12px 16px', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
              Delete Community
            </button>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
              <button onClick={() => setIsSettingsOpen(false)} style={{ background: 'transparent', color: palette.textSecondary, border: 'none', padding: '10px 16px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Member — member picker (opened from Settings) */}
      {isMemberListOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setIsMemberListOpen(false)}>
          <div style={{ background: palette.surface, padding: 32, borderRadius: 24, width: '100%', maxWidth: 440, boxShadow: '0 20px 40px rgba(0,0,0,0.35)' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 700, color: palette.textPrimary, margin: '0 0 8px 0' }}>Remove a Member</h2>
            <p style={{ fontSize: 14, color: palette.textSecondary, marginBottom: 20 }}>Removing a student permanently revokes their access to this community.</p>

            <div style={{ maxHeight: 320, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {removableMembers.map(member => (
                <div key={member.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', border: `1px solid ${palette.border}`, borderRadius: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${member.color}20`, color: member.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15, flexShrink: 0 }}>{member.avatar}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: palette.textPrimary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{member.name}</p>
                    <p style={{ fontSize: 11, color: palette.textMuted }}>Joined {member.joined}</p>
                  </div>
                  <button onClick={() => { setIsMemberListOpen(false); setDeleteMemberPopup({ isOpen: true, memberId: member.id, memberName: member.name }); }} style={{ background: '#FEE2E2', color: '#DC2626', border: 'none', padding: '8px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", flexShrink: 0 }}>
                    Remove
                  </button>
                </div>
              ))}
              {removableMembers.length === 0 && (
                <p style={{ textAlign: 'center', padding: '20px 0', color: palette.textSecondary, fontSize: 14 }}>No students in this community yet.</p>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
              <button onClick={() => setIsMemberListOpen(false)} style={{ background: 'transparent', color: palette.textSecondary, border: 'none', padding: '10px 16px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Community Popup */}
      {deleteCommunityPopup && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div style={{ background: palette.surface, padding: 32, borderRadius: 24, width: '100%', maxWidth: 400, boxShadow: '0 20px 40px rgba(0,0,0,0.35)', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
            </div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 700, color: palette.textPrimary, margin: '0 0 12px 0' }}>Are you sure?</h2>
            <p style={{ fontSize: 14, color: palette.textSecondary, marginBottom: 24 }}>This action cannot be undone. All posts, files, and members will be permanently removed.</p>
            
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setDeleteCommunityPopup(false)} style={{ flex: 1, background: palette.surfaceAlt, color: palette.textSecondary, border: 'none', padding: '12px', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>Cancel</button>
              <button onClick={handleDeleteCommunity} style={{ flex: 1, background: '#DC2626', color: 'white', border: 'none', padding: '12px', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Member Popup */}
      {deleteMemberPopup.isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div style={{ background: palette.surface, padding: 32, borderRadius: 24, width: '100%', maxWidth: 400, boxShadow: '0 20px 40px rgba(0,0,0,0.35)', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="23" y1="11" x2="17" y2="11" /></svg>
            </div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 700, color: palette.textPrimary, margin: '0 0 12px 0' }}>Remove Member?</h2>
            <p style={{ fontSize: 14, color: palette.textSecondary, marginBottom: 24 }}>
              {deleteMemberPopup.memberName
                ? <>Permanently remove <strong style={{ color: palette.textPrimary }}>{deleteMemberPopup.memberName}</strong> from this community? They will lose access to all posts and materials.</>
                : 'Are you sure you want to permanently remove this student from the community?'}
            </p>

            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setDeleteMemberPopup({ isOpen: false, memberId: null, memberName: '' })} disabled={removingMember} style={{ flex: 1, background: palette.surfaceAlt, color: palette.textSecondary, border: 'none', padding: '12px', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: removingMember ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans', sans-serif" }}>Cancel</button>
              <button onClick={handleRemoveMember} disabled={removingMember} style={{ flex: 1, background: '#DC2626', color: 'white', border: 'none', padding: '12px', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: removingMember ? 'not-allowed' : 'pointer', opacity: removingMember ? 0.7 : 1, fontFamily: "'DM Sans', sans-serif" }}>{removingMember ? 'Removing…' : 'Yes, Remove'}</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>

        {/* Main Content Area */}
        <div style={{ flex: 1, minWidth: 300 }}>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: palette.surface, borderRadius: 14, padding: 4, boxShadow: '0 2px 12px rgba(0,0,0,0.04)', border: `1px solid ${palette.border}`, overflowX: 'auto' }}>
            {tabs.map(tab => (
              <button
                key={tab.key}
                className="tab-btn"
                onClick={() => setActiveTab(tab.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px',
                  borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                  fontFamily: "'DM Sans',sans-serif",
                  background: activeTab === tab.key ? '#10B981' : 'transparent',
                  color: activeTab === tab.key ? 'white' : palette.textSecondary,
                  whiteSpace: 'nowrap'
                }}
              >
                {tab.icon} {tab.label}
                <span style={{
                  background: activeTab === tab.key ? 'rgba(255,255,255,0.25)' : palette.surfaceAlt,
                  color: activeTab === tab.key ? 'white' : palette.textMuted,
                  borderRadius: 99, padding: '1px 8px', fontSize: 11, fontWeight: 700,
                }}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* ── DISCUSSIONS TAB ──────────────────────────────────────────────────── */}
          {activeTab === 'discussions' && (
            <div>
              {/* New post */}
              <div style={{ background: palette.surface, borderRadius: 18, padding: 20, boxShadow: palette.shadow, border: `1px solid ${palette.border}`, marginBottom: 20 }}>
                <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#3B82F6,#2563EB)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 15, flexShrink: 0 }}>T</div>
                  <textarea
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder="Make an announcement or start a discussion..."
                    style={{ flex: 1, border: `1.5px solid ${palette.border}`, borderRadius: 12, padding: '10px 14px', fontSize: 13, fontFamily: "'DM Sans',sans-serif", color: palette.textSecondary, resize: 'none', height: 70, outline: 'none', lineHeight: 1.5 }}
                    onFocus={e => { e.target.style.borderColor = '#10B981'; }}
                    onBlur={e => { e.target.style.borderColor = '#E5E7EB'; }}
                  />
                </div>

                {/* Error message */}
                {error && (
                  <div style={{ background: '#FEE2E2', border: '1px solid #FECACA', color: '#DC2626', padding: '10px 14px', borderRadius: 10, fontSize: 12, marginBottom: 12 }}>
                    {error}
                  </div>
                )}

                {/* Show attached file */}
                {attachedFile && (
                  <div style={{ background: palette.surfaceAlt, border: `1px solid ${palette.border}`, borderRadius: 12, padding: 12, marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                      <span style={{ fontSize: 13, fontWeight: 600, color: palette.textSecondary }}>{attachedFile.name}</span>
                      <span style={{ fontSize: 11, color: palette.textMuted }}>({(attachedFile.size / 1024).toFixed(2)} KB)</span>
                    </div>
                    <button onClick={() => { setAttachedFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontWeight: 600 }}>Remove</button>
                  </div>
                )}

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.mp4,.avi,.mov"
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button onClick={handleAttachClick} style={{ background: 'none', border: 'none', color: palette.textSecondary, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer', fontWeight: 600, transition: 'color 0.2s' }} onMouseOver={e => { e.currentTarget.style.color = '#10B981'; }} onMouseOut={e => { e.currentTarget.style.color = '#6B7280'; }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                      Attach
                    </button>
                  </div>
                  <button onClick={submitPost} style={{ background: 'linear-gradient(135deg,#10B981,#059669)', color: 'white', border: 'none', borderRadius: 10, padding: '8px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>Post to Community</button>
                </div>
              </div>

              {/* Posts Feed */}
              {discussions.map(post => (
                <div key={post.id} className="disc-card" style={{ background: palette.surface, borderRadius: 18, padding: 20, boxShadow: '0 4px 12px rgba(0,0,0,0.04)', border: `1px solid ${palette.border}`, marginBottom: 12 }}>

                  {post.pinned && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: '#F59E0B', marginBottom: 12 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                      PINNED ANNOUNCEMENT
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 38, height: 38, borderRadius: '50%', background: `${post.color}20`, color: post.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15, flexShrink: 0 }}>{post.avatar}</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: palette.textPrimary, display: 'flex', alignItems: 'center', gap: 6 }}>
                        {post.author}
                        {post.isTutor && <span style={{ background: '#ECFDF5', color: '#059669', fontSize: 9, padding: '2px 6px', borderRadius: 4, fontWeight: 800 }}>TUTOR</span>}
                      </p>
                      <p style={{ fontSize: 11, color: palette.textMuted }}>{post.time}</p>
                    </div>
                    {/* Tutor Options menu on posts */}
                    <button style={{ background: 'none', border: 'none', color: palette.textMuted, cursor: 'pointer' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" /></svg>
                    </button>
                  </div>

                  <p style={{ fontSize: 14, color: palette.textSecondary, lineHeight: 1.6, marginBottom: 16 }}>{post.content}</p>

                  {/* Media Content (Video/PDF) */}
                  {post.type === 'video' && (
                    <div style={{ background: '#111827', borderRadius: 12, padding: 20, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                        </div>
                        <div>
                          <p style={{ color: 'white', fontWeight: 600, fontSize: 14 }}>{post.mediaName}</p>
                          <p style={{ color: palette.textMuted, fontSize: 12 }}>Video</p>
                        </div>
                      </div>
                      <button style={{ background: '#10B981', color: 'white', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Play</button>
                    </div>
                  )}

                  {post.type === 'image' && post.media_url && (
                    <div style={{ marginBottom: 16, padding: 12, background: palette.surfaceAlt, border: `1px solid ${palette.border}`, borderRadius: 12 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <img src={post.media_url} alt={post.mediaName} style={{ maxWidth: '100%', borderRadius: 8, marginBottom: 12 }} />
                        <p style={{ color: palette.textPrimary, fontWeight: 600, fontSize: 13 }}>{post.mediaName}</p>
                        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                          <a href={toDownloadUrl(post.media_url, post.mediaName)} rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#10B981', fontSize: 13, fontWeight: 600 }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                            Download Image
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

                  {['document', 'pdf', 'doc'].includes(post.type) && post.media_url && (
                    <div style={{ background: palette.surfaceAlt, border: `1px solid ${palette.border}`, borderRadius: 12, padding: 16, marginBottom: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ color: palette.textPrimary, fontWeight: 600, fontSize: 13 }}>{post.mediaName || 'Attached Document'}</p>
                          <p style={{ color: palette.textSecondary, fontSize: 12, textTransform: 'uppercase' }}>{post.type}</p>
                        </div>
                        <a href={toDownloadUrl(post.media_url, post.mediaName)} rel="noreferrer" style={{ background: '#10B981', color: 'white', padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>
                          Download
                        </a>
                      </div>
                    </div>
                  )}

                  {post.type === 'announcement' && post.media_url && (
                    <div style={{ background: palette.surfaceAlt, border: `1px solid ${palette.border}`, borderRadius: 12, padding: 16, marginBottom: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: '#E0E7FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ color: palette.textPrimary, fontWeight: 600, fontSize: 13 }}>{post.mediaName || 'Attached File'}</p>
                          <p style={{ color: palette.textSecondary, fontSize: 12 }}>Attachment</p>
                        </div>
                        <a href={toDownloadUrl(post.media_url, post.mediaName)} rel="noreferrer" style={{ background: '#4F46E5', color: 'white', padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>
                          Download
                        </a>
                      </div>
                    </div>
                  )}

                  {post.type === 'poll' && post.pollOptions && (
                    <div style={{ background: '#F0F9FF', border: '1px solid #BFDBFE', borderRadius: 12, padding: 16, marginBottom: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1E40AF" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#1E40AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Poll</span>
                      </div>
                      {post.pollOptions.map((option: string, index: number) => (
                        <div key={index} style={{ marginBottom: index < post.pollOptions.length - 1 ? 10 : 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ flex: 1, background: '#DBEAFE', borderRadius: 8, padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: '#1E40AF' }}>{option}</span>
                            <span style={{ fontSize: 11, fontWeight: 700, color: '#1E40AF' }}>0%</span>
                          </div>
                        </div>
                      ))}
                      <p style={{ fontSize: 11, color: palette.textMuted, marginTop: 12, marginBottom: 0 }}>0 votes</p>
                    </div>
                  )}


                  <div style={{ paddingTop: 12, borderTop: `1px solid ${palette.border}` }}>
                  </div>
                </div>
              ))}
              {discussions.length === 0 && (
                <div style={{ padding: 20, textAlign: 'center', color: palette.textSecondary, fontSize: 14 }}>No discussions yet. Start one above!</div>
              )}
            </div>
          )}

          {/* ── FILES TAB ────────────────────────────────────────────────────────── */}
          {activeTab === 'files' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: palette.textPrimary, margin: 0 }}>Shared Materials</h3>
                <button style={{
                  background: 'linear-gradient(135deg,#10B981,#059669)', color: 'white', border: 'none',
                  borderRadius: 10, padding: '9px 20px', fontSize: 13, fontWeight: 700,
                  cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                  Upload New File
                </button>
              </div>

              <div style={{ background: palette.surface, borderRadius: 18, boxShadow: palette.shadow, border: `1px solid ${palette.border}`, overflow: 'hidden' }}>
                {files.map((file, i) => (
                  <div key={file.id} className="file-row" style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px',
                    borderBottom: i < files.length - 1 ? '1px solid #F3F4F6' : 'none', cursor: 'pointer',
                  }}>
                    <FileIcon type={file.type} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: palette.textPrimary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</p>
                      <p style={{ fontSize: 11, color: palette.textMuted }}>Uploaded by {file.uploadedBy} · {file.date}</p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0, marginRight: 16 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: palette.textSecondary }}>{file.size}</p>
                      <p style={{ fontSize: 10, color: palette.textMuted }}>{file.downloads} downloads</p>
                    </div>
                    <button style={{ background: 'none', border: 'none', color: palette.textMuted, cursor: 'pointer' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" /></svg>
                    </button>
                  </div>
                ))}
                {files.length === 0 && (
                  <div style={{ padding: 20, textAlign: 'center', color: palette.textSecondary, fontSize: 14 }}>No files uploaded yet.</div>
                )}
              </div>
            </div>
          )}

          {/* ── MEMBERS TAB ──────────────────────────────────────────────────────── */}
          {activeTab === 'members' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
              {members.map((member, i) => (
                <div key={i} className="member-card" style={{
                  background: palette.surface, borderRadius: 18, padding: 20, boxShadow: palette.shadow,
                  border: `1px solid ${palette.border}`, textAlign: 'center', position: 'relative'
                }}>
                  {String(member.role || '').toLowerCase() !== 'tutor' && (
                    <button onClick={() => setDeleteMemberPopup({ isOpen: true, memberId: member.id, memberName: member.name })} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', color: palette.textMuted, cursor: 'pointer' }} title="Remove Member">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                  )}
                  <div style={{
                    width: 52, height: 52, borderRadius: '50%', background: `${member.color}20`, color: member.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 20,
                    margin: '0 auto 12px',
                  }}>
                    {member.avatar}
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: palette.textPrimary, marginBottom: 2 }}>{member.name}</p>
                  <p style={{ fontSize: 11, color: palette.textMuted, marginBottom: 6 }}>{member.school}</p>
                  <span style={{
                    display: 'inline-block', fontSize: 10, fontWeight: 700,
                    padding: '2px 10px', borderRadius: 99, letterSpacing: '0.05em',
                    background: member.role === 'Admin' ? '#FEF3C7' : member.role === 'Student' ? '#DBEAFE' : '#F3F4F6',
                    color: member.role === 'Admin' ? '#92400E' : member.role === 'Student' ? '#1E40AF' : '#6B7280',
                  }}>
                    {member.role.toUpperCase()}
                  </span>
                  <p style={{ fontSize: 10, color: palette.textMuted, marginTop: 8 }}>Joined {member.joined}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Right Panel (Widgets) ───────────────────────────────────────────── */}
        <div style={{ width: 280, flexShrink: 0 }}>

          {/* My Communities Widget */}
          <div style={{ background: palette.surface, borderRadius: 20, padding: 22, boxShadow: palette.shadow, border: `1px solid ${palette.border}`, marginBottom: 16 }}>
            <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 12, fontWeight: 700, color: palette.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>My Communities</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {allCommunities.map((ac) => {
                const isActive = ac.id.toString() === communityId;
                return (
                  <Link href={`/dashboard/tutor/community/${ac.id}`} key={ac.id} style={{ textDecoration: 'none' }}>
                    <button style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: isActive ? '#ECFDF5' : 'transparent', border: 'none', borderRadius: 12, width: '100%', cursor: 'pointer', color: isActive ? '#059669' : '#4B5563', transition: 'all 0.2s', textAlign: 'left', fontWeight: isActive ? 700 : 600, fontFamily: "'DM Sans', sans-serif" }} onMouseOver={e => { if (!isActive) e.currentTarget.style.background = '#F9FAFB' }} onMouseOut={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}>
                      {ac.icon}
                      {ac.name}
                    </button>
                  </Link>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </TutorDashboardLayout >
  );
}
