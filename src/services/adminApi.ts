import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('adminToken');
  }
  return null;
};

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${getToken()}` },
});

// ── Auth ──────────────────────────────────────────────────────────────────────

export const adminLogin = async (email: string, password: string) => {
  const res = await axios.post(`${API_URL}/auth/login`, { email, password });
  localStorage.setItem('adminToken', res.data.token);
  localStorage.setItem('adminUser', JSON.stringify(res.data.admin));
  return res.data;
};

export const adminSignup = async (
  fullName: string,
  email: string,
  password: string,
  adminCode: string,
) => {
  const res = await axios.post(`${API_URL}/auth/register`, {
    fullName,
    email,
    password,
    adminCode,
  });
  localStorage.setItem('adminToken', res.data.token);
  localStorage.setItem('adminUser', JSON.stringify(res.data.admin));
  return res.data;
};

export const adminLogout = () => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
};

export const forgotPassword = async (email: string) => {
  const res = await axios.post(`${API_URL}/auth/forgot-password`, { email });
  return res.data;
};

export const resetPassword = async (token: string, newPassword: string) => {
  const res = await axios.post(`${API_URL}/auth/reset-password`, { token, newPassword });
  return res.data;
};

// ── Dashboard ─────────────────────────────────────────────────────────────────

export const getAdminStats = async () => {
  const res = await axios.get(`${API_URL}/admin/dashboard`, authHeaders());
  return res.data;
};

// ── Tutors ────────────────────────────────────────────────────────────────────

export const getTutors = async () => {
  const res = await axios.get(`${API_URL}/admin/tutors`, authHeaders());
  return res.data;
};

// ── Students ──────────────────────────────────────────────────────────────────

export const getStudents = async () => {
  const res = await axios.get(`${API_URL}/admin/students`, authHeaders());
  return res.data;
};

// ── Payments ──────────────────────────────────────────────────────────────────

export const getPayments = async () => {
  const res = await axios.get(`${API_URL}/admin/payments`, authHeaders());
  return res.data;
};

// ── Advertisements ────────────────────────────────────────────────────────────

export const getAds = async () => {
  const res = await axios.get(`${API_URL}/admin/ads`, authHeaders());
  return res.data;
};

export const updateAdStatus = async (id: number, status: string) => {
  const res = await axios.put(`${API_URL}/admin/ads/${id}`, { status }, authHeaders());
  return res.data;
};
export const getSessions = async () => {
  const res = await axios.get(`${API_URL}/admin/sessions`, authHeaders());
  return res.data;
};

export const updateSessionStatus = async (id: number, status: string) => {
  const res = await axios.put(`${API_URL}/admin/sessions/${id}`, { status }, authHeaders());
  return res.data;
};

export const createTutor = async (data: { fullName: string; email: string; password: string; subject?: string; city?: string; phone?: string }) => {
  const res = await axios.post(`${API_URL}/admin/tutors`, data, authHeaders());
  return res.data;
};

export const createStudent = async (data: { fullName: string; email: string; password: string; gradeLevel?: string; schoolInstitute?: string; phone?: string }) => {
  const res = await axios.post(`${API_URL}/admin/students`, data, authHeaders());
  return res.data;
};

export const createSession = async (data: { fullName: string; phone?: string; school?: string; grade?: string; email?: string; message?: string; preferredMode?: string; selectedDay: string; selectedTime: string }) => {
  const res = await axios.post(`${API_URL}/admin/sessions`, data, authHeaders());
  return res.data;
};

export const createAd = async (data: { tutorId: number; title: string; description?: string; price?: string }) => {
  const res = await axios.post(`${API_URL}/admin/ads`, data, authHeaders());
  return res.data;
};
