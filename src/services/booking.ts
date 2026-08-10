
import api from '@/lib/api';

export interface EnrollmentForm {
  classId:       number;
  fullName:      string;
  email:         string;
  phone:         string;
  school?:       string;
  grade:         string;
  message?:      string;
  preferredMode: string;
  selectedDay:   string;
  selectedTime:  string;
}

// POST /api/enrollments — submit 3-step enroll form
export const submitEnrollment = async (form: EnrollmentForm) => {
  const { data } = await api.post('/enrollments', form);
  return data;
};

// GET /api/enrollments/mine — My Classes on dashboard
export const getMyEnrollments = async (status = 'all') => {
  const params = status !== 'all' ? { status } : {};
  const { data } = await api.get('/enrollments/mine', { params });
  return data;
};

// GET /api/enrollments/schedule — Schedule page
export const getMySchedule = async () => {
  const { data } = await api.get('/enrollments/schedule');
  return data;
};

// PATCH /api/enrollments/:id — cancel enrollment
export const cancelEnrollment = async (id: number) => {
  const { data } = await api.patch(`/enrollments/${id}`, { status: 'cancelled' });
  return data;
};

// DELETE /api/enrollments/:id — delete enrollment
export const deleteEnrollment = async (id: number) => {
  const { data } = await api.delete(`/enrollments/${id}`);
  return data;
};