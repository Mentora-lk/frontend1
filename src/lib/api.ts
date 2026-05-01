// API base configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function apiCall<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers: Record<string, string> = {
    ...((options?.headers as Record<string, string>) || {}),
  };

  // Only set Content-Type to JSON if body is NOT FormData
  if (!(options?.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `API request failed (${response.status})`;
    try {
      const error = await response.json();
      errorMessage = error.message || error.error || JSON.stringify(error);
      console.warn(`[API ${response.status}] ${errorMessage}`);
    } catch {
      console.warn(`[API Error] ${response.status} ${response.statusText} (no JSON body)`);
      errorMessage = `Server error ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }

  return response.json();
}
