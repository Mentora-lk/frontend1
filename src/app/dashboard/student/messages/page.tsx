'use client';

import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { getConversations, getContacts, getMessages, sendMessage } from '@/services/messageService';

export default function MessagesPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [tab, setTab] = useState<'conversations' | 'contacts'>('conversations');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<any>(null);

  // Load conversations and contacts on mount
  useEffect(() => {
    loadConversations();
    loadContacts();
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Poll for new messages when a conversation is open
  useEffect(() => {
    if (selectedUser) {
      loadMessages(selectedUser.id);
      pollRef.current = setInterval(() => loadMessages(selectedUser.id), 5000);
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [selectedUser]);

  const loadConversations = async () => {
    try {
      const res = await getConversations();
      if (res) setConversations(res);
    } catch (err) { console.error('Failed to load conversations', err); }
  };

  const loadContacts = async () => {
    try {
      const res = await getContacts();
      if (res) setContacts(res);
    } catch (err) { console.error('Failed to load contacts', err); }
  };

  const loadMessages = async (userId: number) => {
    try {
      const res = await getMessages(userId);
      if (res) setMessages(res);
    } catch (err) { console.error('Failed to load messages', err); }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedUser || sending) return;
    setSending(true);
    try {
      const res = await sendMessage(selectedUser.id, newMessage.trim());
      if (res) {
        setMessages(prev => [...prev, res]);
        setNewMessage('');
        loadConversations(); // Refresh sidebar
      }
    } catch (err) {
      console.error('Failed to send message', err);
    }
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const selectConversation = (conv: any) => {
    setSelectedUser({ id: conv.other_user_id, name: conv.other_name, avatar: conv.other_avatar, role: conv.other_role });
  };

  const selectContact = (contact: any) => {
    setSelectedUser({ id: contact.id, name: contact.name, avatar: contact.avatar, role: contact.role });
    setTab('conversations');
  };

  const myId = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}')?.id : null;

  const filteredConversations = conversations.filter(c =>
    c.other_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredContacts = contacts.filter(c =>
    c.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (d: string) => {
    const date = new Date(d);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr  = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24)  return `${diffHr}h ago`;
    if (diffDay < 7)  return `${diffDay}d ago`;
    return date.toLocaleDateString();
  };

  const getInitial = (name: string) => name ? name.charAt(0).toUpperCase() : '?';

  return (
    <DashboardLayout title="Messages" subtitle="Chat with your tutors and get help when you need it.">
      <style>{`
        .msg-sidebar-item { transition: all 0.15s; }
        .msg-sidebar-item:hover { background: #F9FAFB !important; }
        .msg-input:focus { outline: none; border-color: #10B981 !important; box-shadow: 0 0 0 3px rgba(16,185,129,0.1); }
        .send-btn { transition: all 0.2s; }
        .send-btn:hover:not(:disabled) { background: #059669 !important; transform: scale(1.05); }
        .send-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .msg-bubble { animation: fadeUp 0.2s ease-out; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      <div style={{
        display: 'flex', background: 'white', borderRadius: 20,
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.04)',
        height: 'calc(100vh - 200px)', minHeight: 500, overflow: 'hidden'
      }}>

        {/* Left sidebar — conversations & contacts */}
        <div style={{
          width: 320, borderRight: '1px solid #F3F4F6', display: 'flex',
          flexDirection: 'column', flexShrink: 0
        }}>
          {/* Search */}
          <div style={{ padding: '16px 16px 12px' }}>
            <div style={{ position: 'relative' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2"
                style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}>
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="msg-input"
                style={{
                  width: '100%', padding: '10px 12px 10px 38px', border: '1.5px solid #E5E7EB',
                  borderRadius: 12, fontSize: 13, fontFamily: "'DM Sans', sans-serif",
                  background: '#FAFAFA', outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid #F3F4F6', padding: '0 16px' }}>
            <button
              onClick={() => setTab('conversations')}
              style={{
                flex: 1, padding: '10px 0', fontSize: 13, fontWeight: tab === 'conversations' ? 700 : 500,
                color: tab === 'conversations' ? '#10B981' : '#9CA3AF',
                borderBottom: tab === 'conversations' ? '2px solid #10B981' : '2px solid transparent',
                background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif"
              }}
            >Chats</button>
            <button
              onClick={() => setTab('contacts')}
              style={{
                flex: 1, padding: '10px 0', fontSize: 13, fontWeight: tab === 'contacts' ? 700 : 500,
                color: tab === 'contacts' ? '#10B981' : '#9CA3AF',
                borderBottom: tab === 'contacts' ? '2px solid #10B981' : '2px solid transparent',
                background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif"
              }}
            >Contacts</button>
          </div>

          {/* List */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
            {tab === 'conversations' ? (
              filteredConversations.length === 0 ? (
                <div style={{ padding: 24, textAlign: 'center' }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5" style={{ margin: '0 auto 12px' }}>
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 8 }}>No conversations yet</p>
                  <p style={{ fontSize: 12, color: '#D1D5DB' }}>Start a chat from the Contacts tab</p>
                </div>
              ) : (
                filteredConversations.map(conv => (
                  <div
                    key={conv.other_user_id}
                    className="msg-sidebar-item"
                    onClick={() => selectConversation(conv)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '12px',
                      borderRadius: 14, cursor: 'pointer',
                      background: selectedUser?.id === conv.other_user_id ? '#ECFDF5' : 'transparent',
                    }}
                  >
                    <div style={{
                      width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
                      background: conv.other_avatar ? `url(${conv.other_avatar}) center/cover` : 'linear-gradient(135deg,#10B981,#059669)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontWeight: 700, fontSize: 16,
                    }}>
                      {!conv.other_avatar && getInitial(conv.other_name)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                        <span style={{ fontSize: 14, fontWeight: conv.unread_count > 0 ? 700 : 600, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {conv.other_name}
                        </span>
                        <span style={{ fontSize: 11, color: '#9CA3AF', flexShrink: 0, marginLeft: 8 }}>
                          {formatTime(conv.last_sent_at)}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{
                          fontSize: 12, color: conv.unread_count > 0 ? '#374151' : '#9CA3AF',
                          fontWeight: conv.unread_count > 0 ? 600 : 400,
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                        }}>
                          {conv.last_content}
                        </span>
                        {conv.unread_count > 0 && (
                          <span style={{
                            minWidth: 18, height: 18, borderRadius: 99, background: '#10B981',
                            color: 'white', fontSize: 10, fontWeight: 700, display: 'flex',
                            alignItems: 'center', justifyContent: 'center', padding: '0 5px',
                            flexShrink: 0, marginLeft: 8
                          }}>{conv.unread_count}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )
            ) : (
              filteredContacts.length === 0 ? (
                <div style={{ padding: 24, textAlign: 'center' }}>
                  <p style={{ fontSize: 13, color: '#9CA3AF' }}>No contacts found</p>
                  <p style={{ fontSize: 12, color: '#D1D5DB', marginTop: 4 }}>Join a community to connect with tutors</p>
                </div>
              ) : (
                filteredContacts.map(contact => (
                  <div
                    key={contact.id}
                    className="msg-sidebar-item"
                    onClick={() => selectContact(contact)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '12px',
                      borderRadius: 14, cursor: 'pointer', background: 'transparent'
                    }}
                  >
                    <div style={{
                      width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
                      background: contact.avatar ? `url(${contact.avatar}) center/cover` : 'linear-gradient(135deg,#6366F1,#8B5CF6)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontWeight: 700, fontSize: 16,
                    }}>
                      {!contact.avatar && getInitial(contact.name)}
                    </div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{contact.name}</p>
                      <p style={{ fontSize: 11, color: '#10B981', fontWeight: 600, textTransform: 'capitalize' }}>{contact.role}</p>
                    </div>
                  </div>
                ))
              )
            )}
          </div>
        </div>

        {/* Right — chat area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {selectedUser ? (
            <>
              {/* Chat header */}
              <div style={{
                padding: '16px 24px', borderBottom: '1px solid #F3F4F6',
                display: 'flex', alignItems: 'center', gap: 12
              }}>
                <div style={{
                  width: 38, height: 38, borderRadius: '50%',
                  background: selectedUser.avatar ? `url(${selectedUser.avatar}) center/cover` : 'linear-gradient(135deg,#10B981,#059669)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: 700, fontSize: 15,
                }}>
                  {!selectedUser.avatar && getInitial(selectedUser.name)}
                </div>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>{selectedUser.name}</p>
                  <p style={{ fontSize: 11, color: '#10B981', fontWeight: 600, textTransform: 'capitalize' }}>{selectedUser.role}</p>
                </div>
              </div>

              {/* Messages area */}
              <div style={{
                flex: 1, overflowY: 'auto', padding: '20px 24px',
                display: 'flex', flexDirection: 'column', gap: 8,
                background: '#FAFBFC'
              }}>
                {messages.length === 0 ? (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5" style={{ marginBottom: 12 }}>
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    <p style={{ fontSize: 14, color: '#9CA3AF', fontWeight: 500 }}>Start a conversation with {selectedUser.name}</p>
                    <p style={{ fontSize: 12, color: '#D1D5DB', marginTop: 4 }}>Send your first message below</p>
                  </div>
                ) : (
                  messages.map(msg => {
                    const isMine = msg.sender_id === myId;
                    return (
                      <div
                        key={msg.id}
                        className="msg-bubble"
                        style={{
                          alignSelf: isMine ? 'flex-end' : 'flex-start',
                          maxWidth: '70%',
                        }}
                      >
                        <div style={{
                          padding: '10px 16px',
                          borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                          background: isMine ? 'linear-gradient(135deg,#10B981,#059669)' : 'white',
                          color: isMine ? 'white' : '#111827',
                          fontSize: 14, lineHeight: 1.5,
                          boxShadow: isMine ? '0 2px 8px rgba(16,185,129,0.25)' : '0 1px 4px rgba(0,0,0,0.06)',
                          border: isMine ? 'none' : '1px solid #F3F4F6',
                        }}>
                          {msg.content}
                        </div>
                        <p style={{
                          fontSize: 10, color: '#9CA3AF', marginTop: 4,
                          textAlign: isMine ? 'right' : 'left', paddingLeft: 4, paddingRight: 4
                        }}>
                          {formatTime(msg.created_at)}
                          {isMine && msg.is_read && <span style={{ marginLeft: 6, color: '#10B981' }}>✓✓</span>}
                          {isMine && !msg.is_read && <span style={{ marginLeft: 6 }}>✓</span>}
                        </p>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message input */}
              <div style={{
                padding: '16px 24px', borderTop: '1px solid #F3F4F6',
                display: 'flex', alignItems: 'flex-end', gap: 12,
                background: 'white'
              }}>
                <textarea
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  className="msg-input"
                  rows={1}
                  style={{
                    flex: 1, resize: 'none', border: '1.5px solid #E5E7EB',
                    borderRadius: 14, padding: '12px 16px', fontSize: 14,
                    fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5,
                    maxHeight: 120, outline: 'none', background: '#FAFAFA'
                  }}
                />
                <button
                  className="send-btn"
                  onClick={handleSend}
                  disabled={!newMessage.trim() || sending}
                  style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: '#10B981', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>
            </>
          ) : (
            /* No conversation selected */
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%', background: '#ECFDF5',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20
              }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="1.5">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Your Messages</h3>
              <p style={{ fontSize: 14, color: '#9CA3AF', maxWidth: 280, textAlign: 'center', lineHeight: 1.5 }}>
                Select a conversation or start a new chat with one of your tutors from the contacts tab.
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}