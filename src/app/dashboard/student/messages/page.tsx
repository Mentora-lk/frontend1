'use client';

import { useEffect, useRef, useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { usePalette } from '@/hooks/usePalette';
import { useMessaging } from '@/hooks/useMessaging';
import { messageService, AvailableTutor } from '@/services/messageService';
import { formatMessageTime, formatRelativeTime } from '@/utils/date';
import { colorForId, initialOf } from '@/utils/helpers';

export default function MessagesPage() {
  const palette = usePalette();
  const {
    myId,
    contacts,
    loadingContacts,
    activeId,
    messages,
    loadingMessages,
    typingFrom,
    selectContact,
    sendMessage,
    notifyTyping,
    notifyStopTyping,
    startConversation,
  } = useMessaging();

  const [newMsg, setNewMsg] = useState('');
  const stopTypingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const threadEndRef = useRef<HTMLDivElement | null>(null);

  // "New message" tutor picker — lets a student start a conversation with a
  // tutor they haven't enrolled with / messaged yet (contacts only surfaces
  // people you already share an enrollment or message history with).
  const [showCompose, setShowCompose] = useState(false);
  const [tutorSearch, setTutorSearch] = useState('');
  const [availableTutors, setAvailableTutors] = useState<AvailableTutor[]>([]);
  const [loadingTutors, setLoadingTutors] = useState(false);

  useEffect(() => {
    if (!showCompose) return;
    setLoadingTutors(true);
    messageService
      .getAvailableTutors()
      .then(setAvailableTutors)
      .catch((err) => console.error('Failed to load tutors:', err))
      .finally(() => setLoadingTutors(false));
  }, [showCompose]);

  const contactIds = new Set(contacts.map((c) => c.userId));
  const tutorResults = availableTutors.filter((t) => {
    if (contactIds.has(t.userId)) return false; // already have a thread — find them in the list instead
    const q = tutorSearch.trim().toLowerCase();
    if (!q) return true;
    return t.name.toLowerCase().includes(q) || (t.subject || '').toLowerCase().includes(q);
  });

  const pickTutor = (tutor: AvailableTutor) => {
    startConversation(tutor);
    setShowCompose(false);
    setTutorSearch('');
  };

  // Auto-select the first conversation once contacts load.
  useEffect(() => {
    if (!activeId && contacts.length > 0) selectContact(contacts[0].userId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contacts]);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ block: 'end' });
  }, [messages, activeId]);

  const active = contacts.find((c) => c.userId === activeId);

  const handleInputChange = (value: string) => {
    setNewMsg(value);
    notifyTyping();
    if (stopTypingTimer.current) clearTimeout(stopTypingTimer.current);
    stopTypingTimer.current = setTimeout(() => notifyStopTyping(), 1500);
  };

  const sendMsg = () => {
    if (!newMsg.trim()) return;
    if (stopTypingTimer.current) clearTimeout(stopTypingTimer.current);
    notifyStopTyping();
    sendMessage(newMsg);
    setNewMsg('');
  };

  return (
    <DashboardLayout title="Messages" subtitle="Chat with your tutors.">
      <div style={{ display: 'flex', gap: 20, height: 580 }}>

        {/* Conversation list */}
        <div style={{ width: 280, flexShrink: 0, background: palette.surface, borderRadius: 20, boxShadow: palette.shadow, border: `1px solid ${palette.border}`, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '18px 18px 12px', borderBottom: `1px solid ${palette.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, fontWeight: 700, color: palette.textPrimary }}>Conversations</h3>
            <button onClick={() => setShowCompose(true)} title="New message"
              style={{ width: 30, height: 30, borderRadius: 9, background: palette.activeBg, border: `1px solid ${palette.borderStrong}`, color: '#059669', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            </button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loadingContacts && (
              <p style={{ padding: 18, fontSize: 13, color: palette.textMuted }}>Loading conversations…</p>
            )}
            {!loadingContacts && contacts.length === 0 && (
              <p style={{ padding: 18, fontSize: 13, color: palette.textMuted }}>No conversations yet. Enroll in a class, or tap + above to message a tutor.</p>
            )}
            {contacts.map(c => {
              const color = colorForId(c.userId);
              return (
                <div key={c.userId} onClick={() => selectContact(c.userId)}
                  style={{ padding: '14px 18px', cursor: 'pointer', borderBottom: `1px solid ${palette.border}`, background: activeId === c.userId ? palette.activeBg : palette.surface, transition: 'all 0.18s' }}
                  onMouseEnter={e => { if (activeId !== c.userId) (e.currentTarget as HTMLDivElement).style.background = palette.hoverBg; }}
                  onMouseLeave={e => { if (activeId !== c.userId) (e.currentTarget as HTMLDivElement).style.background = palette.surface; }}>
                  <div style={{ display: 'flex', gap: 11, alignItems: 'flex-start' }}>
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      {c.avatarUrl ? (
                        <img src={c.avatarUrl} alt={c.name} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: `linear-gradient(135deg,${color},${color}cc)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 16 }}>{initialOf(c.name)}</div>
                      )}
                      {c.online && <div style={{ position: 'absolute', bottom: 0, right: 0, width: 11, height: 11, borderRadius: '50%', background: '#10B981', border: `2px solid ${palette.surface}` }} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: palette.textPrimary }}>{c.name}</p>
                        {c.lastMessageAt && <p style={{ fontSize: 10, color: palette.textMuted }}>{formatRelativeTime(c.lastMessageAt)}</p>}
                      </div>
                      {c.subject && <p style={{ fontSize: 11, color: palette.textMuted, marginBottom: 2 }}>{c.subject}</p>}
                      <p style={{ fontSize: 12, color: palette.textSecondary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 140 }}>
                        {c.lastMessage ? (c.lastMessageFromMe ? `You: ${c.lastMessage}` : c.lastMessage) : 'No messages yet'}
                      </p>
                    </div>
                    {c.unreadCount > 0 && <span style={{ width: 18, height: 18, borderRadius: '50%', background: '#EF4444', color: 'white', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{c.unreadCount}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chat window */}
        <div style={{ flex: 1, background: palette.surface, borderRadius: 20, boxShadow: palette.shadow, border: `1px solid ${palette.border}`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {!active ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: palette.textMuted, fontSize: 14 }}>
              {loadingContacts ? 'Loading…' : 'Select a conversation to start chatting'}
            </div>
          ) : (
            <>
              {/* Header */}
              <div style={{ padding: '16px 22px', borderBottom: `1px solid ${palette.border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ position: 'relative' }}>
                  {active.avatarUrl ? (
                    <img src={active.avatarUrl} alt={active.name} style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: 42, height: 42, borderRadius: '50%', background: `linear-gradient(135deg,${colorForId(active.userId)},${colorForId(active.userId)}cc)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 16 }}>{initialOf(active.name)}</div>
                  )}
                  {active.online && <div style={{ position: 'absolute', bottom: 0, right: 0, width: 11, height: 11, borderRadius: '50%', background: '#10B981', border: `2px solid ${palette.surface}` }} />}
                </div>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: palette.textPrimary }}>{active.name}</p>
                  <p style={{ fontSize: 12, color: active.online ? '#10B981' : palette.textMuted }}>
                    {typingFrom === active.userId ? 'Typing…' : active.online ? 'Online now' : 'Offline'}{active.subject ? ` · ${active.subject} Tutor` : ''}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                {loadingMessages && <p style={{ fontSize: 13, color: palette.textMuted }}>Loading messages…</p>}
                {!loadingMessages && messages.length === 0 && (
                  <p style={{ fontSize: 13, color: palette.textMuted }}>No messages yet. Say hello!</p>
                )}
                {messages.map((msg) => {
                  const isMe = msg.sender_id === myId;
                  return (
                    <div key={msg.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                      <div style={{ maxWidth: '72%' }}>
                        <div style={{
                          padding: '11px 16px', borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                          background: isMe ? 'linear-gradient(135deg,#10B981,#059669)' : palette.surfaceAlt,
                          color: isMe ? 'white' : palette.textPrimary,
                          fontSize: 14, lineHeight: 1.6,
                          boxShadow: isMe ? '0 4px 12px rgba(16,185,129,0.3)' : 'none',
                        }}>
                          {msg.content}
                        </div>
                        <p style={{ fontSize: 10, color: palette.textMuted, marginTop: 4, textAlign: isMe ? 'right' : 'left' }}>
                          {formatMessageTime(msg.created_at)}{isMe && msg.is_read ? ' · Read' : ''}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={threadEndRef} />
              </div>

              {/* Input */}
              <div style={{ padding: '14px 18px', borderTop: `1px solid ${palette.border}`, display: 'flex', gap: 10 }}>
                <input
                  type="text"
                  placeholder={`Message ${active.name}...`}
                  value={newMsg}
                  onChange={e => handleInputChange(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') sendMsg(); }}
                  style={{ flex: 1, border: `1.5px solid ${palette.border}`, borderRadius: 12, padding: '11px 16px', fontSize: 14, fontFamily: "'DM Sans',sans-serif", color: palette.textPrimary, background: palette.surfaceAlt, outline: 'none', transition: 'border-color 0.2s' }}
                  onFocus={e => { e.target.style.borderColor = '#10B981'; e.target.style.background = palette.surface; }}
                  onBlur={e => { e.target.style.borderColor = palette.border; e.target.style.background = palette.surfaceAlt; }}
                />
                <button onClick={sendMsg} style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg,#10B981,#059669)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(16,185,129,0.4)', transition: 'all 0.2s', flexShrink: 0 }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* New message modal — pick a tutor with no existing thread yet */}
      {showCompose && (
        <div onClick={() => setShowCompose(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(17,24,39,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div onClick={e => e.stopPropagation()}
            style={{ width: '100%', maxWidth: 420, maxHeight: '70vh', background: palette.surface, borderRadius: 20, boxShadow: '0 20px 60px rgba(0,0,0,0.35)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '20px 22px 14px', borderBottom: `1px solid ${palette.border}` }}>
              <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 19, fontWeight: 700, color: palette.textPrimary, marginBottom: 12 }}>New Message</h3>
              <input
                autoFocus
                type="text"
                placeholder="Search tutors by name or subject..."
                value={tutorSearch}
                onChange={e => setTutorSearch(e.target.value)}
                style={{ width: '100%', border: `1.5px solid ${palette.border}`, borderRadius: 12, padding: '10px 14px', fontSize: 14, fontFamily: "'DM Sans',sans-serif", color: palette.textPrimary, background: palette.surfaceAlt, outline: 'none' }}
              />
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
              {loadingTutors && <p style={{ padding: 18, fontSize: 13, color: palette.textMuted }}>Loading tutors…</p>}
              {!loadingTutors && tutorResults.length === 0 && (
                <p style={{ padding: 18, fontSize: 13, color: palette.textMuted }}>
                  {tutorSearch ? 'No tutors match your search.' : 'No tutors available to message right now.'}
                </p>
              )}
              {tutorResults.map(t => {
                const color = colorForId(t.userId);
                return (
                  <div key={t.userId} onClick={() => pickTutor(t)}
                    style={{ padding: '10px 22px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, transition: 'background 0.15s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = palette.hoverBg; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}>
                    {t.avatarUrl ? (
                      <img src={t.avatarUrl} alt={t.name} style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: 38, height: 38, borderRadius: '50%', background: `linear-gradient(135deg,${color},${color}cc)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{initialOf(t.name)}</div>
                    )}
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: palette.textPrimary }}>{t.name}</p>
                      {t.subject && <p style={{ fontSize: 11, color: palette.textMuted }}>{t.subject}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
