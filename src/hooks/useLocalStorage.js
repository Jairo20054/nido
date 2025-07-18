import { useState, useEffect, useCallback, useRef } from 'react';

export const useLocalStorage = (key, initialValue) => {
  // Validar que la key no esté vacía
  if (!key || typeof key !== 'string') {
    throw new Error('useLocalStorage key must be a non-empty string');
  }
  
  // Ref para evitar loops infinitos en el useEffect
  const isInitialMount = useRef(true);
  
  // Función para obtener valor del localStorage
  const getStoredValue = useCallback(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    
    try {
      const item = window.localStorage.getItem(key);
      if (item === null) {
        return initialValue;
      }
      
      // Intentar parsear JSON, si falla devolver el string tal como está
      try {
        return JSON.parse(item);
      } catch {
        // Si no es JSON válido, devolver como string
        return item;
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  }, [key, initialValue]);
  
  // Estado con valor inicial del localStorage
  const [storedValue, setStoredValue] = useState(getStoredValue);
  
  // Función para actualizar el valor
  const setValue = useCallback((value) => {
    try {
      // Permitir que value sea una función (como useState)
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Actualizar el estado
      setStoredValue(valueToStore);
      
      // Guardar en localStorage
      if (typeof window !== 'undefined') {
        if (valueToStore === undefined) {
          window.localStorage.removeItem(key);
        } else {
          const serializedValue = typeof valueToStore === 'string' 
            ? valueToStore 
            : JSON.stringify(valueToStore);
          window.localStorage.setItem(key, serializedValue);
        }
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);
  
  // Función para remover el valor
  const removeValue = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
      setStoredValue(initialValue);
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);
  
  // Función para verificar si la key existe
  const hasValue = useCallback(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    
    try {
      return window.localStorage.getItem(key) !== null;
    } catch (error) {
      console.warn(`Error checking localStorage key "${key}":`, error);
      return false;
    }
  }, [key]);
  
  // Sincronizar con cambios en localStorage (desde otras pestañas)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue !== null) {
        try {
          const newValue = JSON.parse(e.newValue);
          setStoredValue(newValue);
        } catch {
          setStoredValue(e.newValue);
        }
      } else if (e.key === key && e.newValue === null) {
        setStoredValue(initialValue);
      }
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }
  }, [key, initialValue]);
  
  // Actualizar localStorage cuando cambia el valor (solo después del mount inicial)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    try {
      if (typeof window !== 'undefined') {
        if (storedValue === undefined) {
          window.localStorage.removeItem(key);
        } else {
          const serializedValue = typeof storedValue === 'string' 
            ? storedValue 
            : JSON.stringify(storedValue);
          window.localStorage.setItem(key, serializedValue);
        }
      }
    } catch (error) {
      console.warn(`Error updating localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);
  
  return [
    storedValue, 
    setValue, 
    {
      remove: removeValue,
      hasValue,
      reset: () => setValue(initialValue)
    }
  ];
};