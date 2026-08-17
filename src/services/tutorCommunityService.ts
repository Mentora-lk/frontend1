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

export const deleteCommunity = async (id: string | number) => {
    return apiCall<any>(`/api/tutor/communities/${id}`, { 
        method: "DELETE",
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

export const removeCommunityMember = async (id: string | number, memberId: string | number) => {
    return apiCall<any>(`/api/tutor/communities/${id}/members/${memberId}`, { 
        method: "DELETE",
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
        
        console.log('\n════════════════════════════════════════');
        console.log('📨 SENDING FormData to API');
        console.log('════════════════════════════════════════');
        console.log('  Community ID:', communityId);
        console.log('  Type:', data.type, '(type: ' + typeof data.type + ')');
        console.log('  Content:', data.content);
        console.log('  Poll options:', data.pollOptions);
        console.log('  File name:', file.name);
        console.log('  File size:', file.size);
        console.log('  File type:', file.type);
        
        // Log FormData contents
        console.log('  FormData entries:');
        for (let [key, value] of formData.entries()) {
            if (value instanceof File) {
                console.log(`    ${key}: [File: ${value.name}]`);
            } else {
                console.log(`    ${key}: ${value}`);
            }
        }
                try {
            // Use unified apiCall which handles FormData correctly and adds auth headers
            const result = await apiCall<any>(`/api/tutor/communities/${communityId}/posts`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: formData
            });
            console.log('✅ Success response:', result);
            return result;
          } catch (error: any) {
            console.error('❌ Network error:', error);
            return { status: 'error', message: error.message || 'Failed to create post' };
          }
    }
    
    // For text-only posts (without file)
    console.log('\n════════════════════════════════════════');
    console.log('📨 SENDING JSON post (no file)');
    console.log('════════════════════════════════════════');
    console.log('  Type:', data.type);
    console.log('  Content:', data.content);

    // Mirror the FormData branch above: the backend destructures snake_case
    // `poll_options` from req.body, so camelCase `pollOptions` must be renamed
    // before sending — otherwise a poll with no attached file silently loses
    // its options (backend sees `poll_options: undefined`).
    const { pollOptions, ...jsonRest } = data;
    const jsonBody: Record<string, any> = { ...jsonRest };
    if (pollOptions && pollOptions.length > 0) {
        jsonBody.poll_options = pollOptions;
    }

    return apiCall<any>(`/api/tutor/communities/${communityId}/posts`, {
        method: "POST",
        body: JSON.stringify(jsonBody),
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
