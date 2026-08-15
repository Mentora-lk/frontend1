import { apiCall } from "@/lib/api";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterStudentRequest {
  email: string;
  password: string;
  fullName: string;
  school: string;
  age: string;
  language: string;
  gradeLevel: string;
  address: string;
}

export interface RegisterTutorRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: "student" | "tutor" | "admin";
    fullName?: string | null;
  };
  profile?: any;
}

export interface StudentDashboardResponse {
  studentId: string;
  name: string;
  email: string;
  classes: any[];
  upcomingSessions: any[];
  progress: {
    totalClasses: number;
    activeClasses: number;
    hoursSpent: number;
  };
}

export interface TutorDashboardResponse {
  classes: any[];
  recentRequests: any[];
  upcomingSessions: any[];
}

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    return apiCall<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async loginWithGoogle(idToken: string, role?: "student" | "tutor"): Promise<AuthResponse> {
    return apiCall<AuthResponse>("/api/auth/google", {
      method: "POST",
      body: JSON.stringify({ idToken, role }),
    });
  },

  async registerStudent(data: RegisterStudentRequest): Promise<AuthResponse> {
    return apiCall<AuthResponse>("/api/auth/register/student", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async registerTutor(data: RegisterTutorRequest): Promise<AuthResponse> {
    return apiCall<AuthResponse>("/api/auth/register/tutor", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async registerTutorFormData(formData: FormData): Promise<AuthResponse> {
    return apiCall<AuthResponse>("/api/auth/register/tutor", {
      method: "POST",
      body: formData,
    });
  },

  async getStudentDashboard(): Promise<StudentDashboardResponse> {
    const token = localStorage.getItem("token");
    return apiCall<StudentDashboardResponse>("/api/auth/student-dashboard", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  async getTutorDashboard(): Promise<TutorDashboardResponse> {
    const token = localStorage.getItem("token");
    return apiCall<TutorDashboardResponse>("/api/tutors/dashboard", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};
