'use client';

import { useEffect, useRef, useState } from 'react';
import TutorDashboardLayout from '@/components/dashboard/TutorDashboardLayout';
import { usePalette } from '@/hooks/usePalette';
import { useMessaging } from '@/hooks/useMessaging';
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
  } = useMessaging();

  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const stopTypingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const threadEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-select the first conversation once contacts load.
  useEffect(() => {
    if (!activeId && contacts.length > 0) selectContact(contacts[0].userId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contacts]);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ block: 'end' });
  }, [messages, activeId]);

  const active = contacts.find((c) => c.userId === activeId);
  const filteredContacts = contacts.filter((c) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return c.name.toLowerCase().includes(q) || (c.subject || '').toLowerCase().includes(q);
  });

  const handleInputChange = (value: string) => {
    setInput(value);
    notifyTyping();
    if (stopTypingTimer.current) clearTimeout(stopTypingTimer.current);
    stopTypingTimer.current = setTimeout(() => notifyStopTyping(), 1500);
  };

  const sendMsg = () => {
    if (!input.trim()) return;
    if (stopTypingTimer.current) clearTimeout(stopTypingTimer.current);
    notifyStopTyping();
    sendMessage(input);
    setInput('');
  };

  return (
    <TutorDashboardLayout title="Messages" subtitle="Chat with your students.">
      <div style={{ display: 'flex', gap: 20, height: 580 }}>

        {/* Sidebar */}
        <div style={{ width: 280, background: palette.surface, borderRadius: 18, boxShadow: palette.shadow, border: `1px solid ${palette.border}`, overflow: 'hidden', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '18px 18px 12px', borderBottom: `1px solid ${palette.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: palette.surfaceAlt, borderRadius: 10, padding: '8px 12px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={palette.textMuted} strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              <input
                placeholder="Search messages..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: palette.textSecondary, width: '100%', fontFamily: "'DM Sans',sans-serif" }} />
            </div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loadingContacts && (
              <p style={{ padding: 18, fontSize: 13, color: palette.textMuted }}>Loading conversations…</p>
            )}
            {!loadingContacts && filteredContacts.length === 0 && (
              <p style={{ padding: 18, fontSize: 13, color: palette.textMuted }}>
                {search ? 'No conversations match your search.' : 'No conversations yet. Students you share a class with will appear here once they message you.'}
              </p>
            )}
            {filteredContacts.map(c => {
              const color = colorForId(c.userId);
              return (
                <div key={c.userId} onClick={() => selectContact(c.userId)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', cursor: 'pointer', background: activeId === c.userId ? palette.activeBg : palette.surface, borderLeft: `3px solid ${activeId === c.userId ? '#10B981' : 'transparent'}`, transition: 'all 0.2s' }}>
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    {c.avatarUrl ? (
                      <img src={c.avatarUrl} alt={c.name} style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: 42, height: 42, borderRadius: '50%', background: `${color}20`, color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16 }}>{initialOf(c.name)}</div>
                    )}
                    {c.unreadCount > 0 && <span style={{ position: 'absolute', top: -2, right: -2, width: 16, height: 16, borderRadius: '50%', background: '#EF4444', color: 'white', fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{c.unreadCount}</span>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: palette.textPrimary }}>{c.name}</p>
                      {c.lastMessageAt && <span style={{ fontSize: 10, color: palette.textMuted }}>{formatRelativeTime(c.lastMessageAt)}</span>}
                    </div>
                    <p style={{ fontSize: 12, color: palette.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.lastMessage ? (c.lastMessageFromMe ? `You: ${c.lastMessage}` : c.lastMessage) : 'No messages yet'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chat area */}
        <div style={{ flex: 1, background: palette.surface, borderRadius: 18, boxShadow: palette.shadow, border: `1px solid ${palette.border}`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {!active ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: palette.textMuted, fontSize: 14 }}>
              {loadingContacts ? 'Loading…' : 'Select a conversation to start chatting'}
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div style={{ padding: '18px 22px', borderBottom: `1px solid ${palette.border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
                {active.avatarUrl ? (
                  <img src={active.avatarUrl} alt={active.name} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${colorForId(active.userId)}20`, color: colorForId(active.userId), display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16 }}>{initialOf(active.name)}</div>
                )}
                <div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: palette.textPrimary }}>{active.name}</p>
                  <p style={{ fontSize: 12, color: '#10B981', fontWeight: 600 }}>
                    {typingFrom === active.userId ? 'Typing…' : active.subject ? `📚 ${active.subject}` : ''}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {loadingMessages && <p style={{ fontSize: 13, color: palette.textMuted }}>Loading messages…</p>}
                {!loadingMessages && messages.length === 0 && (
                  <p style={{ fontSize: 13, color: palette.textMuted }}>No messages yet. Say hello!</p>
                )}
                {messages.map((msg) => {
                  const isMe = msg.sender_id === myId;
                  return (
                    <div key={msg.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                      <div style={{ maxWidth: '70%', background: isMe ? 'linear-gradient(135deg,#10B981,#059669)' : palette.surfaceAlt, color: isMe ? 'white' : palette.textPrimary, borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px', padding: '11px 16px', fontSize: 14, lineHeight: 1.5 }}>
                        <p>{msg.content}</p>
                        <p style={{ fontSize: 10, marginTop: 4, opacity: 0.7, textAlign: isMe ? 'right' : 'left' }}>
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
                  value={input}
                  onChange={e => handleInputChange(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMsg()}
                  placeholder="Type a message..."
                  style={{ flex: 1, border: `1.5px solid ${palette.border}`, borderRadius: 12, padding: '11px 16px', fontSize: 14, fontFamily: "'DM Sans',sans-serif", outline: 'none', color: palette.textPrimary, background: palette.surfaceAlt }} />
                <button onClick={sendMsg} style={{ background: 'linear-gradient(135deg,#10B981,#059669)', color: 'white', border: 'none', borderRadius: 12, padding: '0 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </TutorDashboardLayout>
  );
}
