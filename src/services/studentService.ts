import { apiCall } from "@/lib/api";

export const studentService = {
  async getProfile() {
    const token = localStorage.getItem("token");
    return apiCall<any>("/api/students/profile", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  async updateProfile(data: {
    name: string;
    phone: string;
    school: string;
    grade: string;
    bio: string;
    address: string;
  }) {
    const token = localStorage.getItem("token");
    return apiCall<any>("/api/students/profile", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  },
};
