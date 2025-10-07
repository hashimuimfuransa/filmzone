import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  signup: (userData: any) => api.post('/auth/signup', userData),
  login: (credentials: any) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (userData: any) => api.put('/auth/profile', userData),
};

// Movies API
export const moviesAPI = {
  getMovies: (params: any) => api.get('/movies', { params }),
  getMovieById: (id: string) => api.get(`/movies/${id}`),
  getTrendingMovies: (limit = 10) =>
    api.get('/movies/trending', { params: { limit } }),
  createMovie: (movieData: any) => api.post('/movies', movieData),
  updateMovie: (id: string, movieData: any) =>
    api.put(`/movies/${id}`, movieData),
  deleteMovie: (id: string) => api.delete(`/movies/${id}`),
  uploadPoster: (formData: any) =>
    api.post('/movies/upload/poster', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  uploadVideo: (formData: any, config?: any) =>
    api.post('/movies/upload/video', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      ...config,
    }),
};

// Categories API
export const categoriesAPI = {
  getCategories: () => api.get('/categories'),
  getCategoryById: (id: string) => api.get(`/categories/${id}`),
  createCategory: (categoryData: any) => api.post('/categories', categoryData),
  updateCategory: (id: string, categoryData: any) =>
    api.put(`/categories/${id}`, categoryData),
  deleteCategory: (id: string) => api.delete(`/categories/${id}`),
};

// Dubbers API
export const dubbersAPI = {
  getDubbers: (params?: any) => api.get('/dubbers', { params }),
  getDubberById: (id: string) => api.get(`/dubbers/${id}`),
  getDubberBySlug: (slug: string) => api.get(`/dubbers/slug/${slug}`),
  getMoviesByDubber: (id: string, params: any) =>
    api.get(`/dubbers/${id}/movies`, { params }),
  createDubber: (dubberData: any) => api.post('/dubbers', dubberData),
  updateDubber: (id: string, dubberData: any) =>
    api.put(`/dubbers/${id}`, dubberData),
  deleteDubber: (id: string) => api.delete(`/dubbers/${id}`),
  uploadAvatar: (formData: any) =>
    api.post('/dubbers/upload/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// Reviews API
export const reviewsAPI = {
  getMovieReviews: (movieId: string, params?: any) =>
    api.get(`/reviews/movie/${movieId}`, { params }),
  createReview: (reviewData: any) => api.post('/reviews', reviewData),
  updateReview: (id: string, reviewData: any) =>
    api.put(`/reviews/${id}`, reviewData),
  deleteReview: (id: string) => api.delete(`/reviews/${id}`),
  getPendingReviews: (params: any) => api.get('/reviews/pending', { params }),
  moderateReview: (id: string, approved: boolean) =>
    api.put(`/reviews/${id}/moderate`, { approved }),
};

// Stats API
export const statsAPI = {
  getDashboardStats: () => api.get('/stats/dashboard'),
  getAnalytics: (params: any) => api.get('/stats/analytics', { params }),
};

// Users API
export const usersAPI = {
  getUsers: (params: any) => api.get('/users', { params }),
  getUserById: (id: string) => api.get(`/users/${id}`),
  updateUser: (id: string, userData: any) => api.put(`/users/${id}`, userData),
  deleteUser: (id: string) => api.delete(`/users/${id}`),
  getUserStats: () => api.get('/users/stats'),
  getUserActivity: (id: string, params?: any) => api.get(`/users/${id}/activity`, { params }),
};

// Contact API
export const contactAPI = {
  getContactInfo: () => api.get('/contact'),
  submitContact: (data: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }) => api.post('/contact/submit', data),
  getContactMessages: (params?: any) => api.get('/contact/messages', { params }),
  getContactById: (id: string) => api.get(`/contact/messages/${id}`),
  updateContact: (id: string, data: any) => api.put(`/contact/messages/${id}`, data),
  markAsResponded: (id: string) => api.patch(`/contact/messages/${id}/responded`),
  getContactStats: () => api.get('/contact/stats'),
};

export default api;
