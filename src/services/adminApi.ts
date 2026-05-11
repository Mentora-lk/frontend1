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
  // Backend route: POST /api/auth/login
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
  // Backend route: POST /api/auth/register  ← was wrongly "/auth/signup"
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

// ── Dashboard ─────────────────────────────────────────────────────────────────

export const getAdminStats = async () => {
  // Backend route: GET /api/admin/dashboard
  // Returns: { totalUsers, totalTutors, totalStudents, totalCourses }
  const res = await axios.get(`${API_URL}/admin/dashboard`, authHeaders());
  return res.data;
};

// ── Tutors ────────────────────────────────────────────────────────────────────

export const getTutors = async () => {
  // Backend route: GET /api/admin/tutors
  // Returns: [{ id, full_name, email, subjects, city, created_at }]
  const res = await axios.get(`${API_URL}/admin/tutors`, authHeaders());
  return res.data;
};

// ── Students ──────────────────────────────────────────────────────────────────

export const getStudents = async () => {
  // Backend route: GET /api/admin/students
  // Returns: [{ user_id, full_name, grade_level, school_institute, email, created_at }]
  const res = await axios.get(`${API_URL}/admin/students`, authHeaders());
  return res.data;
};

// ── Payments ──────────────────────────────────────────────────────────────────

export const getPayments = async () => {
  // Backend route: GET /api/admin/payments
  const res = await axios.get(`${API_URL}/admin/payments`, authHeaders());
  return res.data;
};

// ── Advertisements ────────────────────────────────────────────────────────────

export const getAds = async () => {
  // Backend route: GET /api/admin/ads
  // Returns: [{ id, tutor_id, tutor_name, title, status, created_at, ... }]
  const res = await axios.get(`${API_URL}/admin/ads`, authHeaders());
  return res.data;
};

export const updateAdStatus = async (id: number, status: string) => {
  // Backend route: PUT /api/admin/ads/:id
  const res = await axios.put(`${API_URL}/admin/ads/${id}`, { status }, authHeaders());
  return res.data;
};
