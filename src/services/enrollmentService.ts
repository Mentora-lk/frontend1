// src/services/enrollmentService.ts
import api from '@/lib/api';

export interface EnrollmentData {
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

// POST /api/enrollments — submit enrollment request
export const submitEnrollment = async (data: EnrollmentData) => {
  const response = await api.post('/enrollments', data);
  return response.data;
};

// PATCH /api/enrollments/:id — update an enrollment's personal details + schedule
export const updateEnrollment = async (enrollmentId: number, data: EnrollmentData) => {
  const response = await api.patch(`/enrollments/${enrollmentId}`, data);
  return response.data;
};

// GET /api/enrollments/me — get my enrolled classes
export const getMyEnrollments = async (status?: string) => {
  const params = status && status !== 'all' ? { status } : {};
  const { data } = await api.get('/enrollments/mine', { params });
  return data;
};

// DELETE /api/enrollments/:id — cancel enrollment
export const cancelEnrollment = async (enrollmentId: number) => {
  const { data } = await api.delete(`/enrollments/${enrollmentId}`);
  return data;
};

// GET /api/enrollments/me/schedule — get my schedule
export const getMySchedule = async () => {
  const { data } = await api.get('/enrollments/schedule');
  return data;
};
