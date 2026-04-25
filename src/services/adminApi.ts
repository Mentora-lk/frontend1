import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Get token from localStorage
const getToken = () => localStorage.getItem('adminToken');

// Auth headers
const authHeaders = () => ({
  headers: { Authorization: `Bearer ${getToken()}` }
});

// ── Auth APIs ─────────────────────────────────────────────
export const adminLogin = async (email: string, password: string) => {
  const res = await axios.post(`${API_URL}/auth/login`, { email, password });
  localStorage.setItem('adminToken', res.data.token);
  localStorage.setItem('adminUser', JSON.stringify(res.data.admin));
  return res.data;
};

export const adminSignup = async (
  fullName: string, email: string,
  password: string, adminCode: string
) => {
  const res = await axios.post(`${API_URL}/auth/signup`, {
    fullName, email, password, adminCode
  });
  localStorage.setItem('adminToken', res.data.token);
  localStorage.setItem('adminUser', JSON.stringify(res.data.admin));
  return res.data;
};

export const adminLogout = () => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
};

// ── Admin APIs ────────────────────────────────────────────
export const getAdminStats = async () => {
  const res = await axios.get(`${API_URL}/admin/stats`, authHeaders());
  return res.data;
};

export const getTutors = async () => {
  const res = await axios.get(`${API_URL}/admin/tutors`, authHeaders());
  return res.data;
};

export const updateTutorStatus = async (id: number, status: string) => {
  const res = await axios.put(`${API_URL}/admin/tutors/${id}`, { status }, authHeaders());
  return res.data;
};

export const getPayments = async () => {
  const res = await axios.get(`${API_URL}/admin/payments`, authHeaders());
  return res.data;
};

export const getAds = async () => {
  const res = await axios.get(`${API_URL}/admin/ads`, authHeaders());
  return res.data;
};

export const updateAdStatus = async (id: number, status: string) => {
  const res = await axios.put(`${API_URL}/admin/ads/${id}`, { status }, authHeaders());
  return res.data;
};