
import api from '@/lib/api';

export interface CourseFilters {
  q?:         string;
  subject?:   string;
  mode?:      string;
  location?:  string;
  minRating?: number;
  maxFee?:    number;
  sortBy?:    string;
  page?:      number;
  limit?:     number;
}

// GET /api/courses — used by search page
export const searchCourses = async (filters: CourseFilters) => {
  // Remove undefined values so they don't get sent as empty params
  const params = Object.fromEntries(
    Object.entries(filters).filter(([_, v]) => v !== undefined && v !== '' && v !== 0)
  );
  const { data } = await api.get('/courses', { params });
  return data; // { courses, total, totalPages, currentPage }
};

// GET /api/courses/:id — used by class detail page
export const getCourseById = async (id: number | string) => {
  const { data } = await api.get(`/courses/${id}`);
  return data;
};

export interface Review {
  id: number;
  comment: string;
  createdAt: string;
  student?: { id?: number | string; name: string };
  student_id?: number | string; // fallback shape in case author id is flat, not nested
}

// GET /api/courses/:id/reviews — used by reviews tab
export const getCourseReviews = async (id: number | string): Promise<Review[]> => {
  const { data } = await api.get(`/courses/${id}/reviews`);
  return data;
};

// POST /api/courses/:id/reviews — submit a review
export const submitReview = async (id: number | string, rating: number, comment: string): Promise<Review> => {
  const { data } = await api.post(`/courses/${id}/reviews`, { rating, comment });
  return data;
};

// POST /api/courses — create a course
export const createClass = async (data: any) => {
  const response = await api.post('/courses', data);
  return response.data;
};

// PUT /api/courses/:id — update a course
export const updateClass = async (id: number | string, data: any) => {
  const response = await api.put(`/courses/${id}`, data);
  return response.data;
};

// DELETE /api/courses/:id — delete a course
export const deleteClass = async (id: number | string) => {
  const response = await api.delete(`/courses/${id}`);
  return response.data;
};

// GET /api/courses/stats — platform statistics for landing page hero
export const getPlatformStats = async () => {
  const { data } = await api.get('/courses/stats');
  return data; // { activeTutors, studentsEnrolled, subjectsAvailable }
};

export const classService = {
  searchCourses,
  getCourseById,
  getCourseReviews,
  submitReview,
  getPlatformStats,
  createClass,
  updateClass,
  deleteClass,
};

export default classService;