import { apiCall } from "@/lib/api";

const getAuthHeaders = (): Record<string, string> => {
    let token = null;
    if (typeof window !== 'undefined') {
        token = localStorage.getItem('token');
    }
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// 1. Community Management
export const getCommunities = async () => {
    return apiCall<any>("/api/tutor/communities", { 
        method: "GET",
        headers: getAuthHeaders() 
    });
};

export const createCommunity = async (data: { name: string; description: string; tags: string[] }) => {
    return apiCall<any>("/api/tutor/communities", { 
        method: "POST",
        body: JSON.stringify(data),
        headers: getAuthHeaders() 
    });
};

export const getCommunityById = async (id: string) => {
    return apiCall<any>(`/api/tutor/communities/${id}`, { 
        method: "GET",
        headers: getAuthHeaders() 
    });
};

export const getCommunityPosts = async (id: string) => {
    return apiCall<any>(`/api/tutor/communities/${id}/posts`, { 
        method: "GET",
        headers: getAuthHeaders() 
    });
};

export const getCommunityMembers = async (id: string) => {
    return apiCall<any>(`/api/tutor/communities/${id}/members`, { 
        method: "GET",
        headers: getAuthHeaders() 
    });
};

// 2. Request Management
export const getPendingRequests = async () => {
    return apiCall<any>("/api/tutor/requests", { 
        method: "GET",
        headers: getAuthHeaders() 
    });
};

export const updateRequestStatus = async (membershipId: string | number, status: 'approved' | 'declined') => {
    return apiCall<any>(`/api/tutor/requests/${membershipId}`, { 
        method: "PUT",
        body: JSON.stringify({ status }),
        headers: getAuthHeaders() 
    });
};

// 3. Content Publishing
export const createPost = async (communityId: string, data: { type: string; content: string; media_url?: string; is_pinned?: boolean; pollOptions?: string[] }, file?: File) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    if (file) {
        // Use FormData for file uploads
        const formData = new FormData();
        formData.append('type', data.type);
        formData.append('content', data.content);
        formData.append('is_pinned', String(data.is_pinned || false));
        if (data.pollOptions && data.pollOptions.length > 0) {
            formData.append('poll_options', JSON.stringify(data.pollOptions));
        }
        formData.append('material', file);
        
        console.log('📨 Sending FormData with file:');
        console.log('  Type:', data.type);
        console.log('  Content:', data.content);
        console.log('  Poll options:', data.pollOptions);
        console.log('  File name:', file.name);
        console.log('  File size:', file.size);
        console.log('  File type:', file.type);
        
        try {
            const response = await fetch(`/api/tutor/communities/${communityId}/posts`, {
                method: 'POST',
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                body: formData
            });
            
            console.log('📩 Response status:', response.status);
            
            if (!response.ok) {
                let errorMessage = 'Failed to create post';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorData.error || errorMessage;
                } catch {
                    // If response is not JSON, use status text
                    errorMessage = `Server error: ${response.status} ${response.statusText}`;
                }
                console.error('❌ Error response:', errorMessage);
                return { status: 'error', message: errorMessage };
            }
            
            const result = await response.json();
            console.log('✅ Success response:', result);
            return result;
        } catch (error: any) {
            console.error('❌ Network error:', error);
            return { status: 'error', message: error.message || 'Failed to create post' };
        }
    }
    
    // For text-only posts
    return apiCall<any>(`/api/tutor/communities/${communityId}/posts`, { 
        method: "POST",
        body: JSON.stringify(data),
        headers: getAuthHeaders() 
    });
};

export const pinPost = async (postId: string | number, isPinned: boolean) => {
    return apiCall<any>(`/api/tutor/posts/${postId}/pin`, { 
        method: "PUT",
        body: JSON.stringify({ is_pinned: isPinned }),
        headers: getAuthHeaders() 
    });
};

export const createDeadline = async (communityId: string, data: { title: string; due_date: string; link_url?: string }) => {
    return apiCall<any>(`/api/tutor/communities/${communityId}/deadlines`, { 
        method: "POST",
        body: JSON.stringify(data),
        headers: getAuthHeaders() 
    });
};
