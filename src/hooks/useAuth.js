// frontend/src/hooks/useAuth.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api'; // IMPORTACIÓN CORRECTA: default

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const abortControllerRef = useRef(null);
  const isInitializedRef = useRef(false);

  const clearError = useCallback(() => setError(null), []);

  useEffect(() => {
    const checkAuth = async () => {
      if (isInitializedRef.current) return;
      isInitializedRef.current = true;

      setLoading(true);
      setError(null);

      abortControllerRef.current = new AbortController();

      try {
        // axios soporta AbortController.signal en versiones recientes
        const userData = await api.get('/auth/me', {
          signal: abortControllerRef.current.signal
        });

        // api interceptor devuelve response.data => userData es el objeto usuario
        if (userData && !abortControllerRef.current.signal.aborted) {
          setUser(userData);
        }
      } catch (err) {
        if (!abortControllerRef.current.signal.aborted) {
          console.warn('Auth check failed:', err?.message || err);
          setUser(null);
          // No setError para la verificación silenciosa
        }
      } finally {
        if (!abortControllerRef.current.signal.aborted) {
          setLoading(false);
        }
      }
    };

    checkAuth();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const login = useCallback(async (email, password) => {
    if (!email?.trim() || !password?.trim()) {
      setError('Email y contraseña son requeridos');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/auth/login', {
        email: email.trim().toLowerCase(),
        password
      });

      // api devuelve response.data (según interceptor)
      const userData = response?.user || response; // depende de tu backend
      if (userData) {
        setUser(userData);
        setTimeout(() => navigate('/dashboard'), 50);
        return true;
      }

      throw new Error('No se recibieron datos del usuario');
    } catch (err) {
      const errorMessage = err?.response?.message || err?.message || 'Error de autenticación. Por favor, intenta de nuevo.';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const register = useCallback(async (userData) => {
    if (!userData?.email?.trim() || !userData?.password?.trim()) {
      setError('Email y contraseña son requeridos');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const cleanUserData = {
        ...userData,
        email: userData.email.trim().toLowerCase(),
        name: userData.name?.trim()
      };

      const response = await api.post('/auth/register', cleanUserData);
      const newUser = response?.user || response;
      if (newUser) {
        setUser(newUser);
        setTimeout(() => navigate('/dashboard'), 50);
        return true;
      }

      throw new Error('No se pudo crear el usuario');
    } catch (err) {
      const errorMessage = err?.response?.message || err?.message || 'Error en el registro. Por favor, intenta de nuevo.';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.warn('Logout error:', err);
    } finally {
      setUser(null);
      setError(null);
      setLoading(false);
      navigate('/');
    }
  }, [navigate]);

  const updateProfile = useCallback(async (profileData) => {
    if (!user) {
      setError('Usuario no autenticado');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const updatedUser = await api.put('/auth/profile', profileData);
      setUser(updatedUser);
      return true;
    } catch (err) {
      const errorMessage = err?.response?.message || err?.message || 'Error al actualizar el perfil';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const refreshUser = useCallback(async () => {
    if (!user) return false;
    try {
      const userData = await api.get('/auth/me');
      setUser(userData);
      return true;
    } catch (err) {
      console.error('Failed to refresh user data:', err);
      return false;
    }
  }, [user]);

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile,
    refreshUser,
    clearError,
    isInitialized: isInitializedRef.current && !loading
  };
};
