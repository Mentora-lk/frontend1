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

// Pending membership requests — persists across refresh, since discoverCommunities
// deliberately excludes communities the student already has a pending/approved
// request for.
export const getMyPendingRequests = async () => {
    return apiCall<any>("/api/student/communities/my-requests", {
        method: "GET",
        headers: getAuthHeaders()
    });
};

// Leaves a community the student has already been approved into (as opposed to
// cancelCommunityRequest above, which withdraws a still-pending request).
// Deliberately no fallback to the `/request` endpoint on failure: that endpoint
// only deletes PENDING rows, so for an approved member it always failed with the
// misleading "No pending request found for this community" instead of surfacing
// the real error.
export const leaveCommunity = async (communityId: string | number) => {
    return apiCall<any>(`/api/student/communities/${communityId}/leave`, {
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

export const getMyDeadlines = async () => {
    return apiCall<any>("/api/student/deadlines", {
        method: "GET",
        headers: getAuthHeaders()
    });
};

export const getCommunityStats = async () => {
    return apiCall<any>("/api/student/communities/stats", {
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
