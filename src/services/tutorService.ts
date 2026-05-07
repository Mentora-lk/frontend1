import { apiCall } from "@/lib/api";

export const tutorService = {
  async getRequests() {
    const token = localStorage.getItem("token");
    return apiCall<any[]>("/api/tutors/requests", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  async updateRequestStatus(id: number, status: string) {
    const token = localStorage.getItem("token");
    return apiCall(`/api/enrollments/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
  }
};