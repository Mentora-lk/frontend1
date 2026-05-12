import { apiCall } from "@/lib/api";

const getAuthHeaders = (): Record<string, string> => {
    let token = null;
    if (typeof window !== 'undefined') {
        token = localStorage.getItem('token');
    }
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const discoverCommunities = async (tag?: string) => {
    const url = tag ? `/api/student/communities/discover?tag=${encodeURIComponent(tag)}` : "/api/student/communities/discover";
    return apiCall<any>(url, {
        method: "GET",
        headers: getAuthHeaders()
    });
};

export const requestCommunityAccess = async (communityId: string | number) => {
    return apiCall<any>(`/api/student/communities/${communityId}/request`, {
        method: "POST",
        headers: getAuthHeaders()
    });
};

export const cancelCommunityRequest = async (communityId: string | number) => {
    return apiCall<any>(`/api/student/communities/${communityId}/request`, {
        method: "DELETE",
        headers: getAuthHeaders()
    });
};

export const dismissDeclinedRequest = async (communityId: string | number) => {
    return apiCall<any>(`/api/student/communities/${communityId}/request/declined`, {
        method: "DELETE",
        headers: getAuthHeaders()
    });
};

export const getMyClasses = async () => {
    return apiCall<any>("/api/student/communities/my-classes", {
        method: "GET",
        headers: getAuthHeaders()
    });
};

export const getMyRequests = async () => {
    return apiCall<any>("/api/student/communities/my-requests", {
        method: "GET",
        headers: getAuthHeaders()
    });
};

export const getMyDeadlines = async () => {
    return apiCall<any>("/api/student/deadlines", {
        method: "GET",
        headers: getAuthHeaders()
    });
};

export const getCommunityFeed = async (communityId: string | number) => {
    return apiCall<any>(`/api/student/communities/${communityId}/feed`, {
        method: "GET",
        headers: getAuthHeaders()
    });
};

export const togglePostReaction = async (postId: string | number) => {
    return apiCall<any>(`/api/student/posts/${postId}/react`, {
        method: "POST",
        headers: getAuthHeaders()
    });
};

export const getPostComments = async (postId: string | number) => {
    return apiCall<any>(`/api/student/posts/${postId}/comments`, {
        method: "GET",
        headers: getAuthHeaders()
    });
};

export const addPostComment = async (postId: string | number, content: string) => {
    return apiCall<any>(`/api/student/posts/${postId}/comments`, {
        method: "POST",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ content })
    });
};

export const deletePostComment = async (postId: string | number, commentId: string | number) => {
    return apiCall<any>(`/api/student/posts/${postId}/comments/${commentId}`, {
        method: "DELETE",
        headers: getAuthHeaders()
    });
};

export const submitAssignment = async (deadlineId: string | number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const headers = getAuthHeaders();
    // Do not set Content-Type to application/json, browser sets multipart/form-data with boundary

    let token = null;
    if (typeof window !== 'undefined') {
        token = localStorage.getItem('token');
    }

    const res = await fetch(`http://localhost:5000/api/student/deadlines/${deadlineId}/submit`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
    });

    if (!res.ok) {
        throw new Error("Failed to submit assignment");
    }

    return res.json();
};

