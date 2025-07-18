import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const abortControllerRef = useRef(null);
  const isInitializedRef = useRef(false);

  // Limpiar errores automáticamente
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Verificar sesión al cargar con abort controller para evitar memory leaks
  useEffect(() => {
    const checkAuth = async () => {
      // Evitar múltiples inicializaciones
      if (isInitializedRef.current) return;
      isInitializedRef.current = true;

      setLoading(true);
      setError(null);

      // Crear abort controller para cancelar request si el componente se desmonta
      abortControllerRef.current = new AbortController();

      try {
        const userData = await api.get('/auth/me', {
          signal: abortControllerRef.current.signal
        });
        
        if (userData && !abortControllerRef.current.signal.aborted) {
          setUser(userData);
        }
      } catch (err) {
        // Solo establecer error si no fue cancelado
        if (!abortControllerRef.current.signal.aborted) {
          console.warn('Auth check failed:', err.message);
          setUser(null);
          // No mostrar error en la verificación inicial silenciosa
        }
      } finally {
        if (!abortControllerRef.current.signal.aborted) {
          setLoading(false);
        }
      }
    };
    
    checkAuth();

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const login = useCallback(async (email, password) => {
    // Validación básica
    if (!email?.trim() || !password?.trim()) {
      setError('Email y contraseña son requeridos');
      return false;
    }

    setLoading(true);
    setError(null);
    
    try {
      const userData = await api.post('/auth/login', { 
        email: email.trim().toLowerCase(), 
        password 
      });
      
      if (userData) {
        setUser(userData);
        // Navegar después de un pequeño delay para permitir que el estado se actualice
        setTimeout(() => navigate('/dashboard'), 50);
        return true;
      }
      
      throw new Error('No se recibieron datos del usuario');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          'Error de autenticación. Por favor, intenta de nuevo.';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const register = useCallback(async (userData) => {
    // Validación básica
    if (!userData?.email?.trim() || !userData?.password?.trim()) {
      setError('Email y contraseña son requeridos');
      return false;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Limpiar y normalizar datos
      const cleanUserData = {
        ...userData,
        email: userData.email.trim().toLowerCase(),
        name: userData.name?.trim()
      };

      const newUser = await api.post('/auth/register', cleanUserData);
      
      if (newUser) {
        setUser(newUser);
        setTimeout(() => navigate('/dashboard'), 50);
        return true; 
      }
      
      throw new Error('No se pudo crear el usuario');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          'Error en el registro. Por favor, intenta de nuevo.';
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
      // Continuar con el logout local incluso si falla el servidor
    } finally {
      setUser(null);
      setError(null);
      setLoading(false);
      navigate('/');
    }
  }, [navigate]);

  // Función para actualizar el perfil del usuario
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
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          'Error al actualizar el perfil';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Función para refrescar los datos del usuario
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
    // Estado
    user,
    loading,
    error,
    isAuthenticated: !!user,
    
    // Acciones principales
    login,
    register,
    logout,
    
    // Acciones adicionales
    updateProfile,
    refreshUser,
    clearError,
    
    // Utilidades
    isInitialized: isInitializedRef.current && !loading
  };
};