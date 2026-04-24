import { apiCall } from "@/lib/api";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterStudentRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
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
  };
}

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    return apiCall<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
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
};
