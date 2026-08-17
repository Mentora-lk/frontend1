import { useCallback, useEffect, useRef, useState } from "react";
import { messageService, MessageContact, DirectMessage, AvailableTutor } from "@/services/messageService";
import { messagingSocket } from "@/services/messagingService";
import { useSocket } from "@/contexts/SocketContext";
import { useNotifications } from "@/hooks/useNotifications";
import { useCurrentUser } from "@/hooks/useCurrentUser";

/**
 * Drives a WhatsApp-style DM UI: loads the contact list + message history
 * over REST (src/services/messageService.ts) and layers live updates on top
 * via the shared Socket.io connection (src/contexts/SocketContext.tsx). The
 * connection itself is owned by SocketProvider (mounted at the dashboard
 * route layout level), not by this hook — this hook only registers/cleans
 * up its own listeners on whatever socket the provider hands it, so
 * navigating away from the Messages page can't kill the connection other
 * consumers (e.g. the notification bell) depend on.
 */
export function useMessaging() {
  const socket = useSocket();
  const { clearUnreadFromSender } = useNotifications();
  const user = useCurrentUser();
  const myId = user ? Number(user.id) : null;

  const [contacts, setContacts] = useState<MessageContact[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [typingFrom, setTypingFrom] = useState<number | null>(null);

  // Event handlers below are registered once per socket/myId; this ref lets
  // them always see the latest activeId without re-subscribing on every change.
  const activeIdRef = useRef<number | null>(null);
  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  useEffect(() => {
    messageService
      .getContacts()
      .then(setContacts)
      .catch((err) => console.error("Failed to load contacts:", err))
      .finally(() => setLoadingContacts(false));
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg: DirectMessage) => {
      const otherId = msg.sender_id === myId ? msg.recipient_id : msg.sender_id;
      const isActiveThread = otherId === activeIdRef.current;
      const isIncoming = msg.sender_id !== myId;

      if (isActiveThread) {
        setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
      }

      setContacts((prev) => {
        const idx = prev.findIndex((c) => c.userId === otherId);
        if (idx === -1) return prev; // unknown contact (no shared enrollment/history yet) — ignore
        const updated: MessageContact = {
          ...prev[idx],
          lastMessage: msg.content,
          lastMessageAt: msg.created_at,
          lastMessageFromMe: msg.sender_id === myId,
          unreadCount: isIncoming && !isActiveThread ? prev[idx].unreadCount + 1 : prev[idx].unreadCount,
        };
        const next = [...prev];
        next.splice(idx, 1);
        next.unshift(updated);
        return next;
      });
    };

    const handleTyping = ({ from }: { from: string }) => {
      if (Number(from) === activeIdRef.current) setTypingFrom(Number(from));
    };

    const handleStopTyping = ({ from }: { from: string }) => {
      if (Number(from) === activeIdRef.current) setTypingFrom(null);
    };

    const handleMessagesRead = ({ by, messageIds }: { by: number; messageIds: number[] }) => {
      if (by !== activeIdRef.current) return;
      setMessages((prev) => prev.map((m) => (messageIds.includes(m.id) ? { ...m, is_read: true } : m)));
    };

    socket.on("new_message", handleNewMessage);
    socket.on("typing", handleTyping);
    socket.on("stop_typing", handleStopTyping);
    socket.on("messages_read", handleMessagesRead);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("typing", handleTyping);
      socket.off("stop_typing", handleStopTyping);
      socket.off("messages_read", handleMessagesRead);
    };
  }, [socket, myId]);

  const selectContact = useCallback((userId: number) => {
    setActiveId(userId);
    setTypingFrom(null);
    setLoadingMessages(true);
    setContacts((prev) => prev.map((c) => (c.userId === userId ? { ...c, unreadCount: 0 } : c)));
    // Opening this thread is about to mark all of their messages read
    // server-side — clear the bell/sidebar badge for them immediately rather
    // than waiting on the 'messages_read' socket round-trip.
    clearUnreadFromSender(userId);

    messageService
      .getMessages(userId)
      .then(setMessages)
      .catch((err) => console.error("Failed to load messages:", err))
      .finally(() => setLoadingMessages(false));
  }, [clearUnreadFromSender]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!activeId || !content.trim()) return;
      const msg = await messageService.sendMessage(activeId, content.trim());

      setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
      setContacts((prev) => {
        const idx = prev.findIndex((c) => c.userId === activeId);
        if (idx === -1) return prev;
        const updated: MessageContact = {
          ...prev[idx],
          lastMessage: msg.content,
          lastMessageAt: msg.created_at,
          lastMessageFromMe: msg.sender_id === myId,
        };
        const next = [...prev];
        next.splice(idx, 1);
        next.unshift(updated);
        return next;
      });
    },
    [activeId, myId]
  );

  const notifyTyping = useCallback(() => {
    if (activeId) messagingSocket.emitTyping(activeId);
  }, [activeId]);

  const notifyStopTyping = useCallback(() => {
    if (activeId) messagingSocket.emitStopTyping(activeId);
  }, [activeId]);

  /**
   * Opens an empty thread with someone who isn't a contact yet (e.g. a tutor
   * picked from the "New message" search). Nothing is persisted server-side
   * until the first message is actually sent — this just adds a local draft
   * entry to the top of the contact list so the UI has somewhere to render
   * the compose box. If they're already a contact, this just switches to
   * their existing thread instead of duplicating it.
   */
  const startConversation = useCallback((person: AvailableTutor) => {
    setContacts((prev) => {
      if (prev.some((c) => c.userId === person.userId)) return prev;
      const draft: MessageContact = {
        userId: person.userId,
        name: person.name,
        role: "tutor",
        avatarUrl: person.avatarUrl,
        subject: person.subject,
        online: false,
        lastMessage: null,
        lastMessageAt: null,
        lastMessageFromMe: null,
        unreadCount: 0,
      };
      return [draft, ...prev];
    });
    setActiveId(person.userId);
    setMessages([]);
    setTypingFrom(null);
  }, []);

  return {
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
  };
}
