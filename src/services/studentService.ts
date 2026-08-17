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

  async updateProfile(
    data: {
      name: string;
      phone: string;
      school: string;
      grade: string;
      bio: string;
      address: string;
    },
    photoFile?: File | null
  ) {
    const token = localStorage.getItem("token");
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => formData.append(key, value ?? ""));
    if (photoFile) formData.append("profilePicture", photoFile);

    return apiCall<any>("/api/students/profile", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
  },
};
