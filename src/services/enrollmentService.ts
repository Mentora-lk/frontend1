import { apiCall } from "@/lib/api";

export interface EnrollmentRequest {
  classId: number;
  fullName: string;
  email: string;
  phone: string;
  school?: string;
  grade: string;
  message?: string;
  preferredMode: string;
  selectedDay: string;
  selectedTime: string;
}

export const enrollmentService = {
  async createEnrollment(data: EnrollmentRequest) {
    const token = localStorage.getItem("token");
    return apiCall("/api/enrollments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  },

  async getMyEnrollments(status: string = "all") {
    const token = localStorage.getItem("token");
    return apiCall<any[]>(`/api/enrollments/mine?status=${status}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
};
