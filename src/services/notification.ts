import { apiCall } from "@/lib/api";

const getAuthHeaders = (): Record<string, string> => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/** Mirrors the `notifications` table columns exactly (see backend notificationController.js). */
export interface AppNotification {
  id: number;
  user_id: number;
  type: string;
  title: string;
  body: string;
  related_enrollment_id: number | null;
  related_community_id: number | null;
  related_membership_id: number | null;
  related_post_id: number | null;
  related_deadline_id: number | null;
  related_message_id: number | null;
  related_review_id: number | null;
  is_read: boolean;
  created_at: string;
}

export const notificationService = {
  async getNotifications(limit = 20): Promise<AppNotification[]> {
    const res = await apiCall<{ data: AppNotification[] }>(`/api/notifications?limit=${limit}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return res.data;
  },

  async getUnreadCount(): Promise<number> {
    const res = await apiCall<{ data: { count: number } }>("/api/notifications/unread-count", {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return res.data.count;
  },

  async markAsRead(id: number): Promise<AppNotification> {
    const res = await apiCall<{ data: AppNotification }>(`/api/notifications/${id}/read`, {
      method: "PATCH",
      headers: getAuthHeaders(),
    });
    return res.data;
  },

  async markAllAsRead(): Promise<void> {
    await apiCall<{ status: string }>("/api/notifications/read-all", {
      method: "PATCH",
      headers: getAuthHeaders(),
    });
  },
};
