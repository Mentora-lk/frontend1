import { apiCall } from "@/lib/api";

const getAuthHeaders = (): Record<string, string> => {
    let token = null;
    if (typeof window !== 'undefined') {
        token = localStorage.getItem('token');
    }
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getConversations = async () => {
    return apiCall<any>("/api/messages/conversations", {
        method: "GET",
        headers: getAuthHeaders()
    });
};

export const getContacts = async () => {
    return apiCall<any>("/api/messages/contacts", {
        method: "GET",
        headers: getAuthHeaders()
    });
};

export const getMessages = async (userId: string | number) => {
    return apiCall<any>(`/api/messages/${userId}`, {
        method: "GET",
        headers: getAuthHeaders()
    });
};

export const sendMessage = async (userId: string | number, content: string) => {
    return apiCall<any>(`/api/messages/${userId}`, {
        method: "POST",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ content })
    });
};
