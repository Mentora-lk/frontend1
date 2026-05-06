
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
export const getCourseById = async (id: number) => {
  const { data } = await api.get(`/courses/${id}`);
  return data;
};

// GET /api/courses/:id/reviews — used by reviews tab
export const getCourseReviews = async (id: number) => {
  const { data } = await api.get(`/courses/${id}/reviews`);
  return data;
};

// POST /api/courses/:id/reviews — submit a review
export const submitReview = async (id: number, rating: number, comment: string) => {
  const { data } = await api.post(`/courses/${id}/reviews`, { rating, comment });
  return data;
};

// GET /api/courses/stats — platform statistics for landing page hero
export const getPlatformStats = async () => {
  const { data } = await api.get('/courses/stats');
  return data; // { activeTutors, studentsEnrolled, subjectsAvailable }
};