import axios from 'axios';
import config from '../config';
import { trackError } from '../utils/analytics';

const api = axios.create({
  baseURL: config.api.baseUrl,
  timeout: config.api.timeout
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(config.auth.tokenKey);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle token expiration
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem(config.auth.refreshTokenKey);
        const response = await api.post('/auth/refresh', { refreshToken });
        
        localStorage.setItem(config.auth.tokenKey, response.data.token);
        
        originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Handle refresh token failure
        localStorage.removeItem(config.auth.tokenKey);
        localStorage.removeItem(config.auth.refreshTokenKey);
        window.location.href = '/auth/login';
      }
    }

    // Track error
    trackError('api', error);

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password })
};

// Property API
export const propertyAPI = {
  search: (params) => api.get('/properties', { params }),
  getById: (id) => api.get(`/properties/${id}`),
  create: (propertyData) => api.post('/properties', propertyData),
  update: (id, propertyData) => api.put(`/properties/${id}`, propertyData),
  delete: (id) => api.delete(`/properties/${id}`),
  uploadImages: (id, formData) => api.post(`/properties/${id}/images`, formData),
  getAvailability: (id, params) => api.get(`/properties/${id}/availability`, { params })
};

// Booking API
export const bookingAPI = {
  create: (bookingData) => api.post('/bookings', bookingData),
  getById: (id) => api.get(`/bookings/${id}`),
  getUserBookings: () => api.get('/bookings/user'),
  getHostBookings: () => api.get('/bookings/host'),
  cancel: (id) => api.post(`/bookings/${id}/cancel`),
  update: (id, updateData) => api.put(`/bookings/${id}`, updateData)
};

// User API
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (userData) => api.put('/users/profile', userData),
  uploadAvatar: (formData) => api.post('/users/avatar', formData),
  getFavorites: () => api.get('/users/favorites'),
  addFavorite: (propertyId) => api.post('/users/favorites', { propertyId }),
  removeFavorite: (propertyId) => api.delete(`/users/favorites/${propertyId}`),
  getNotifications: () => api.get('/users/notifications'),
  updateNotificationSettings: (settings) => api.put('/users/notifications/settings', settings)
};

// Review API
export const reviewAPI = {
  create: (propertyId, reviewData) => api.post(`/properties/${propertyId}/reviews`, reviewData),
  update: (propertyId, reviewId, reviewData) => api.put(`/properties/${propertyId}/reviews/${reviewId}`, reviewData),
  delete: (propertyId, reviewId) => api.delete(`/properties/${propertyId}/reviews/${reviewId}`),
  getPropertyReviews: (propertyId, params) => api.get(`/properties/${propertyId}/reviews`, { params })
};

// Message API
export const messageAPI = {
  getConversations: () => api.get('/messages/conversations'),
  getMessages: (conversationId) => api.get(`/messages/conversations/${conversationId}`),
  sendMessage: (conversationId, message) => api.post(`/messages/conversations/${conversationId}`, { message }),
  createConversation: (propertyId, message) => api.post('/messages/conversations', { propertyId, message })
};

// Host API
export const hostAPI = {
  getDashboard: () => api.get('/host/dashboard'),
  getProperties: () => api.get('/host/properties'),
  getBookings: (params) => api.get('/host/bookings', { params }),
  getEarnings: (params) => api.get('/host/earnings', { params }),
  updateSettings: (settings) => api.put('/host/settings', settings)
};

export default api;
