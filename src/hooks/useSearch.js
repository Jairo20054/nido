import { useState, useContext, useCallback, useRef } from 'react';
import { SearchContext } from '../context/BookingContext';
import { api } from '../utils/api';

export const useSearch = () => {
  const context = useContext(SearchContext);
  
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  
  const { 
    location, 
    setLocation, 
    dates, 
    updateDates, 
    guests, 
    setGuests, 
    results, 
    setResults, 
    isLoading, 
    setLoading, 
    error, 
    setError 
  } = context;
  
  const [searchResults, setSearchResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchError, setSearchError] = useState(null);
  
  // Ref para cancelar requests anteriores
  const abortControllerRef = useRef(null);
  
  const updateSearchParams = useCallback((newParams) => {
    if (newParams.location !== undefined) setLocation(newParams.location);
    if (newParams.checkIn && newParams.checkOut) updateDates(newParams.checkIn, newParams.checkOut);
    if (newParams.guests !== undefined) setGuests(newParams.guests);
  }, [setLocation, updateDates, setGuests]);
  
  const clearSearch = useCallback(() => {
    setSearchResults([]);
    setSearchError(null);
    setLoadingSearch(false);
    
    // Cancelar request en curso si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);
  
  const searchProperties = useCallback(async (params = {}) => {
    // Combinar parámetros con el estado actual
    const searchParams = {
      location,
      checkIn: dates.checkIn,
      checkOut: dates.checkOut,
      guests,
      ...params
    };
    
    // Cancelar request anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Crear nuevo AbortController
    abortControllerRef.current = new AbortController();
    
    setLoadingSearch(true);
    setSearchError(null);
    setLoading(true); // También actualizar el loading global
    
    try {
      // Filtrar parámetros vacíos o undefined
      const cleanParams = Object.entries(searchParams).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          acc[key] = value;
        }
        return acc;
      }, {});
      
      const response = await api.get('/properties/search', { 
        params: cleanParams,
        signal: abortControllerRef.current.signal
      });
      
      // Validar que results sea un array
      const validResults = Array.isArray(response.data) ? response.data : [];
      setSearchResults(validResults);
      setResults(validResults); // Actualizar el contexto también
      setError(null); // Limpiar errores globales
      
      return validResults;
    } catch (err) {
      // No setear error si el request fue cancelado
      if (err.name === 'AbortError') {
        console.log('Search request was cancelled');
        return [];
      }
      
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          'Error en la búsqueda de propiedades';
      
      console.error('Search error:', err);
      setSearchError(errorMessage);
      setError(errorMessage); // También actualizar error global
      setSearchResults([]);
      
      // No hacer throw para evitar crashes, mejor manejar gracefully
      return [];
    } finally {
      setLoadingSearch(false);
      setLoading(false); // También actualizar el loading global
      abortControllerRef.current = null;
    }
  }, [location, dates, guests, setResults, setLoading, setError]);
  
  const resetSearch = useCallback(() => {
    clearSearch();
    setLocation('');
    updateDates(null, null);
    setGuests(1);
  }, [clearSearch, setLocation, updateDates, setGuests]);
  
  // Función para refrescar la búsqueda actual
  const refreshSearch = useCallback(() => {
    if (location || dates.checkIn || dates.checkOut) {
      return searchProperties();
    }
    return Promise.resolve([]);
  }, [location, dates, searchProperties]);
  
  return {
    // Estado del contexto
    searchParams: {
      location,
      checkIn: dates.checkIn,
      checkOut: dates.checkOut,
      guests
    },
    
    // Estado local del hook
    searchResults,
    loading: loadingSearch,
    error: searchError,
    
    // Estado global del contexto
    globalLoading: isLoading,
    globalError: error,
    
    // Acciones
    updateSearchParams,
    searchProperties,
    clearSearch,
    resetSearch,
    refreshSearch,
    
    // Información útil
    hasResults: searchResults.length > 0,
    hasError: !!searchError,
    isEmpty: !loadingSearch && searchResults.length === 0 && !searchError,
    
    // Funciones para debugging
    getContextState: () => ({
      location,
      dates,
      guests,
      results,
      isLoading,
      error
    })
  };
};

// Exportación única por defecto
export default useSearch;