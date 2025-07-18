
import { toast } from 'react-toastify'; // Opcional: para notificaciones
import React, { useState, useCallback } from 'react';
// Configuración de la API
const API_CONFIG = {
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 30000, // 30 segundos
  retryAttempts: 3,
  retryDelay: 1000, // 1 segundo
};

// Clase para errores de API personalizados
export class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// Función para manejar timeouts
const withTimeout = (promise, timeout) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeout)
    )
  ]);
};

// Función para retry con backoff exponencial
const withRetry = async (fn, attempts = API_CONFIG.retryAttempts) => {
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === attempts - 1) throw error;
      
      // No reintentar para ciertos errores
      if (error.status >= 400 && error.status < 500) {
        throw error;
      }
      
      // Backoff exponencial: 1s, 2s, 4s, etc.
      const delay = API_CONFIG.retryDelay * Math.pow(2, i);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// Interceptor para manejo de tokens de autenticación
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Función para manejar respuestas de error
const handleApiError = async (response) => {
  let errorData;
  try {
    errorData = await response.json();
  } catch {
    errorData = { message: 'Error desconocido del servidor' };
  }

  const error = new ApiError(
    errorData.message || `Error ${response.status}`,
    response.status,
    errorData
  );

  // Manejo específico de errores comunes
  switch (response.status) {
    case 401:
      // Token expirado o inválido
      localStorage.removeItem('authToken');
      window.location.href = '/login';
      break;
    case 403:
      toast?.error('No tienes permisos para realizar esta acción');
      break;
    case 404:
      toast?.error('Recurso no encontrado');
      break;
    case 429:
      toast?.error('Demasiadas solicitudes. Intenta más tarde');
      break;
    case 500:
      toast?.error('Error interno del servidor');
      break;
    default:
      toast?.error(error.message);
  }

  throw error;
};

// Función principal para realizar peticiones
const makeRequest = async (endpoint, options = {}) => {
  const {
    method = 'GET',
    data = null,
    headers = {},
    timeout = API_CONFIG.timeout,
    skipAuth = false,
    skipRetry = false,
    ...fetchOptions
  } = options;

  const url = `${API_CONFIG.baseURL}${endpoint}`;
  
  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(!skipAuth && getAuthHeaders()),
      ...headers
    },
    credentials: 'include',
    ...fetchOptions
  };

  // Agregar body si hay data
  if (data) {
    if (data instanceof FormData) {
      // Para FormData, remover Content-Type para que el browser lo establezca
      delete config.headers['Content-Type'];
      config.body = data;
    } else {
      config.body = JSON.stringify(data);
    }
  }

  const requestFn = async () => {
    const response = await withTimeout(fetch(url, config), timeout);
    
    if (!response.ok) {
      await handleApiError(response);
    }
    
    // Manejar respuestas vacías
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }
    
    return response.text();
  };

  try {
    if (skipRetry) {
      return await requestFn();
    }
    return await withRetry(requestFn);
  } catch (error) {
    console.error(`API Error (${method} ${endpoint}):`, error);
    throw error;
  }
};

// API object con métodos mejorados
export const api = {
  // Configuración
  config: API_CONFIG,
  
  // Método genérico de petición
  request: makeRequest,
  
  // Métodos HTTP específicos
  get(endpoint, params = null, options = {}) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return makeRequest(`${endpoint}${query}`, { method: 'GET', ...options });
  },
  
  post(endpoint, data, options = {}) {
    return makeRequest(endpoint, { method: 'POST', data, ...options });
  },
  
  put(endpoint, data, options = {}) {
    return makeRequest(endpoint, { method: 'PUT', data, ...options });
  },
  
  patch(endpoint, data, options = {}) {
    return makeRequest(endpoint, { method: 'PATCH', data, ...options });
  },
  
  delete(endpoint, options = {}) {
    return makeRequest(endpoint, { method: 'DELETE', ...options });
  },
  
  // Método para subir archivos
  upload(endpoint, file, progressCallback = null, options = {}) {
    const formData = new FormData();
    formData.append('file', file);
    
    const config = {
      method: 'POST',
      data: formData,
      ...options
    };
    
    // Agregar callback de progreso si se proporciona
    if (progressCallback && typeof progressCallback === 'function') {
      config.onUploadProgress = progressCallback;
    }
    
    return makeRequest(endpoint, config);
  },
  
  // Método para descargar archivos
  async download(endpoint, filename, options = {}) {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}${endpoint}`, {
        method: 'GET',
        headers: {
          ...getAuthHeaders(),
          ...options.headers
        },
        credentials: 'include',
        ...options
      });
      
      if (!response.ok) {
        throw new ApiError(`Error ${response.status}`, response.status);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      return true;
    } catch (error) {
      console.error('Download error:', error);
      throw error;
    }
  },
  
  // Método para validar conexión
  async ping() {
    try {
      await makeRequest('/health', { method: 'GET', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  },
  
  // Método para cancelar peticiones (usando AbortController)
  createCancellableRequest(endpoint, options = {}) {
    const controller = new AbortController();
    const promise = makeRequest(endpoint, {
      ...options,
      signal: controller.signal
    });
    
    return {
      promise,
      cancel: () => controller.abort()
    };
  },
  
  // Métodos para manejo de autenticación
  auth: {
    login: (credentials) => api.post('/auth/login', credentials, { skipAuth: true }),
    logout: () => api.post('/auth/logout'),
    refresh: () => api.post('/auth/refresh'),
    me: () => api.get('/auth/me'),
    register: (userData) => api.post('/auth/register', userData, { skipAuth: true }),
    forgotPassword: (email) => api.post('/auth/forgot-password', { email }, { skipAuth: true }),
    resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }, { skipAuth: true })
  },
  
  // Métodos específicos para el dominio de la aplicación
  properties: {
    search: (params) => api.get('/properties/search', params),
    getById: (id) => api.get(`/properties/${id}`),
    create: (data) => api.post('/properties', data),
    update: (id, data) => api.put(`/properties/${id}`, data),
    delete: (id) => api.delete(`/properties/${id}`),
    uploadImages: (id, images) => api.upload(`/properties/${id}/images`, images),
    getReviews: (id, params) => api.get(`/properties/${id}/reviews`, params)
  },
  
  bookings: {
    create: (data) => api.post('/bookings', data),
    getById: (id) => api.get(`/bookings/${id}`),
    update: (id, data) => api.put(`/bookings/${id}`, data),
    cancel: (id) => api.patch(`/bookings/${id}/cancel`),
    getUserBookings: (params) => api.get('/bookings/user', params),
    getAvailability: (propertyId, params) => api.get(`/properties/${propertyId}/availability`, params)
  },
  
  users: {
    getProfile: () => api.get('/users/profile'),
    updateProfile: (data) => api.put('/users/profile', data),
    uploadAvatar: (file) => api.upload('/users/avatar', file),
    getBookings: (params) => api.get('/users/bookings', params),
    getFavorites: () => api.get('/users/favorites'),
    addFavorite: (propertyId) => api.post(`/users/favorites/${propertyId}`),
    removeFavorite: (propertyId) => api.delete(`/users/favorites/${propertyId}`)
  }
};

// Función para configurar interceptores globales
export const setupApiInterceptors = () => {
  // Interceptor para añadir timestamp a las peticiones
  const originalRequest = api.request;
  api.request = async (endpoint, options = {}) => {
    const startTime = Date.now();
    try {
      const result = await originalRequest(endpoint, options);
      const duration = Date.now() - startTime;
      console.log(`API Request: ${options.method || 'GET'} ${endpoint} (${duration}ms)`);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`API Request Failed: ${options.method || 'GET'} ${endpoint} (${duration}ms)`, error);
      throw error;
    }
  };
};

// Función para manejar errores globalmente
export const handleGlobalError = (error) => {
  if (error instanceof ApiError) {
    // Ya fue manejado por handleApiError
    return;
  }
  
  if (error.name === 'AbortError') {
    console.log('Request was cancelled');
    return;
  }
  
  console.error('Unexpected error:', error);
  toast?.error('Ha ocurrido un error inesperado');
};

// Hook personalizado para usar la API en componentes React
export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const execute = useCallback(async (apiCall) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiCall();
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  
  return { execute, loading, error };
};

export default api;