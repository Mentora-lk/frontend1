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
  },

  async getProfile() {
    const token = localStorage.getItem("token");
    return apiCall<any>("/api/tutors/profile", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  async getRevenueAnalytics(months: number = 6) {
    const token = localStorage.getItem("token");
    return apiCall<RevenueAnalytics>(`/api/tutors/revenue-analytics?months=${months}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  async addTransaction(entry: NewTransaction) {
    const token = localStorage.getItem("token");
    return apiCall<RevenueTransaction>("/api/tutors/transactions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(entry),
    });
  },

  async deleteTransaction(id: number) {
    const token = localStorage.getItem("token");
    return apiCall(`/api/tutors/transactions/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  async uploadProfilePicture(file: File) {
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("avatar", file);
    // apiCall (fetch-based) skips setting Content-Type for FormData bodies,
    // so the browser fills in the correct multipart boundary itself — unlike
    // the `api` axios instance elsewhere, which has to be told to do that.
    return apiCall<{ profilePictureUrl: string }>("/api/tutors/profile-picture", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
  },

  async getTodos() {
    const token = localStorage.getItem("token");
    return apiCall<TodoItem[]>("/api/tutors/todos", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  async addTodo(entry: NewTodo) {
    const token = localStorage.getItem("token");
    return apiCall<TodoItem>("/api/tutors/todos", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(entry),
    });
  },

  async updateTodoStatus(id: number, status: "pending" | "completed") {
    const token = localStorage.getItem("token");
    return apiCall<TodoItem>(`/api/tutors/todos/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });
  },

  async deleteTodo(id: number) {
    const token = localStorage.getItem("token");
    return apiCall(`/api/tutors/todos/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};

export interface RevenueMonthPoint {
  month: string;
  year: number;
  income: number;
  outcome: number;
}

export interface RevenueTransaction {
  id: number;
  type: "income" | "outcome";
  amount: number;
  description: string | null;
  date: string;
}

export interface NewTransaction {
  type: "income" | "outcome";
  amount: number;
  description?: string;
  date?: string;
}

export interface RevenueAnalytics {
  totalRevenue: number;
  totalOutcome: number;
  netProfit: number;
  monthlyRevenue: number;
  revenueGrowthPercent: number;
  monthlyChart: RevenueMonthPoint[];
  transactions: RevenueTransaction[];
}

export interface TodoItem {
  id: number;
  task: string;
  finishTime: string | null;
  durationMinutes: number | null;
  status: "pending" | "completed";
}

export interface NewTodo {
  task: string;
  finishTime?: string;
  durationMinutes?: number;
}
