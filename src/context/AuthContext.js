import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { api } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authToken, setAuthToken] = useLocalStorage('authToken', null);
  const abortControllerRef = useRef(null);

  // Limpiar error después de un tiempo
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Verificar autenticación al cargar
  useEffect(() => {
    const verifyAuth = async () => {
      if (!authToken) {
        setLoading(false);
        return;
      }

      // Cancelar request anterior si existe
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      try {
        const userData = await api.get('/auth/me', {
          headers: { Authorization: `Bearer ${authToken}` },
          signal: abortControllerRef.current.signal
        });
        
        if (userData) {
          setUser(userData);
          setError(null);
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Auth verification error:', error);
          // Token inválido o expirado
          setAuthToken(null);
          setUser(null);
          setError('Sesión expirada. Por favor, inicia sesión nuevamente.');
        }
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();

    // Cleanup al desmontar
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [authToken, setAuthToken]);

  const login = useCallback(async (email, password) => {
    if (!email || !password) {
      setError('Email y contraseña son requeridos');
      return { success: false, error: 'Email y contraseña son requeridos' };
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/auth/login', { email, password });
      const { user: userData, token } = response;

      if (!userData || !token) {
        throw new Error('Respuesta del servidor inválida');
      }

      setUser(userData);
      setAuthToken(token);
      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Error al iniciar sesión. Intenta nuevamente.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [setAuthToken]);

  const register = useCallback(async (userData) => {
    if (!userData || !userData.email || !userData.password) {
      setError('Datos de registro incompletos');
      return { success: false, error: 'Datos de registro incompletos' };
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/auth/register', userData);
      const { user: newUser, token } = response;

      if (!newUser || !token) {
        throw new Error('Respuesta del servidor inválida');
      }

      setUser(newUser);
      setAuthToken(token);
      return { success: true, user: newUser };
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Error al registrarse. Intenta nuevamente.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [setAuthToken]);

  const logout = useCallback(async () => {
    setLoading(true);
    
    try {
      // Intentar cerrar sesión en el servidor
      if (authToken) {
        await api.post('/auth/logout', {}, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Continuar con el logout local aunque falle el servidor
    } finally {
      // Limpiar estado local
      setUser(null);
      setAuthToken(null);
      setError(null);
      setLoading(false);
    }
  }, [authToken, setAuthToken]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const refreshToken = useCallback(async () => {
    if (!authToken) return false;

    try {
      const response = await api.post('/auth/refresh', {}, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      const { token: newToken } = response;
      if (newToken) {
        setAuthToken(newToken);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token refresh error:', error);
      logout();
      return false;
    }
  }, [authToken, setAuthToken, logout]);

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    clearError,
    refreshToken,
    isAuthenticated: !!user && !!authToken,
    authToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext debe ser usado dentro de un AuthProvider');
  }
  return context;
};