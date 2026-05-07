import { apiCall } from "@/lib/api";

export interface CreateClassRequest {
  title: string;
  subject: string;
  grade: string;
  medium: string;
  fees: string;
  description: string;
  schedule: string;
  image?: string;
  mode?: string;
}

export const classService = {
  async createClass(data: CreateClassRequest) {
    const token = localStorage.getItem("token");
    
    // Convert to what backend expects
    const payload = {
      title: data.title,
      subject: data.subject,
      description: data.description,
      fee: Number(data.fees),
      schedule: data.schedule,
      medium: data.medium,
      mode: data.mode || "both",
      location: "Remote", // Default
      image: data.image
    };

    return apiCall("/api/courses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
  },

  async deleteClass(id: number) {
    const token = localStorage.getItem("token");
    return apiCall(`/api/courses/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};