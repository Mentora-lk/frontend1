import { apiCall } from "@/lib/api";
import { searchCourses } from "./classService";

const getAuthHeaders = (): Record<string, string> => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface MessageContact {
  userId: number;
  name: string;
  role: "student" | "tutor" | "admin";
  avatarUrl: string | null;
  subject: string | null;
  online: boolean;
  lastMessage: string | null;
  lastMessageAt: string | null;
  lastMessageFromMe: boolean | null;
  unreadCount: number;
}

export interface DirectMessage {
  id: number;
  sender_id: number;
  recipient_id: number;
  content: string;
  is_read: boolean;
  created_at: string;
}

/** A tutor a student can start a brand-new conversation with, i.e. not yet an existing contact/thread. */
export interface AvailableTutor {
  userId: number;
  name: string;
  avatarUrl: string | null;
  subject: string | null;
}

export interface UnreadBySender {
  senderId: number;
  senderName: string;
  count: number;
}

export interface UnreadMessagesSummary {
  totalUnread: number;
  bySender: UnreadBySender[];
}

export const messageService = {
  async getContacts(): Promise<MessageContact[]> {
    const res = await apiCall<{ data: MessageContact[] }>("/api/messages/contacts", {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return res.data;
  },

  async getMessages(userId: number | string): Promise<DirectMessage[]> {
    const res = await apiCall<{ data: DirectMessage[] }>(`/api/messages/${userId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return res.data;
  },

  async sendMessage(userId: number | string, content: string): Promise<DirectMessage> {
    const res = await apiCall<{ data: DirectMessage }>(`/api/messages/${userId}`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ content }),
    });
    return res.data;
  },

  /**
   * Tutors a student can message but hasn't started a conversation with yet.
   * There's no dedicated "list tutors" endpoint (GET /api/tutors is an
   * unimplemented backend stub), so this reuses the public course listing
   * (GET /api/courses, which already returns tutor_id/tutor_name per course)
   * and dedupes to one entry per tutor. A generous limit + no filters keeps
   * this a one-shot fetch; the picker UI filters client-side as the user types.
   */
  async getAvailableTutors(): Promise<AvailableTutor[]> {
    const res = await searchCourses({ limit: 200 });
    const courses: any[] = res?.courses || [];

    const byTutor = new Map<number, AvailableTutor>();
    for (const c of courses) {
      if (!c.tutor_id || byTutor.has(c.tutor_id)) continue;
      byTutor.set(c.tutor_id, {
        userId: c.tutor_id,
        name: c.tutor_name || "Unknown Tutor",
        avatarUrl: c.tutor_avatar || null,
        subject: c.subject || null,
      });
    }

    return Array.from(byTutor.values()).sort((a, b) => a.name.localeCompare(b.name));
  },

  /**
   * Unread DM count across every conversation — the total for the sidebar
   * badge, plus a per-sender breakdown (with display name) for the bell
   * dropdown's "N new messages from X" rows.
   */
  async getUnreadCount(): Promise<UnreadMessagesSummary> {
    const res = await apiCall<{ data: UnreadMessagesSummary }>("/api/messages/unread-count", {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return res.data;
  },
};
