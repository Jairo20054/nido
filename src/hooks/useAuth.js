// src/hooks/useSearch.js
import { useState, useRef, useCallback } from 'react';
import { useSearch as useSearchContext } from '../context/SearchContext';
import { api } from '../utils/api';

/**
 * Hook wrapper que delega en el contexto SearchContext y añade
 * funcionalidades (searchProperties, cancel, refresh).
 *
 * IMPORTANTE: Este hook asume que existe <SearchProvider> en el árbol.
 */
export const useSearch = () => {
  // -> Esto lanzará el error explícito si no hay SearchProvider (intencional)
  const context = useSearchContext();

  // Extraemos el estado / setters del contexto
  const {
    location,
    setLocation,
    dates,
    updateDates,
    guests,
    setGuests,
    results,
    setResults,
    isLoading: globalLoading,
    setLoading: setGlobalLoading,
    error: globalError,
    setError: setGlobalError
  } = context;

  const [searchResults, setSearchResults] = useState(Array.isArray(results) ? results : []);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const abortControllerRef = useRef(null);

  const _buildCleanParams = (raw) => {
    return Object.entries(raw || {}).reduce((acc, [k, v]) => {
      if (v !== undefined && v !== null && v !== '') acc[k] = v;
      return acc;
    }, {});
  };

  const searchProperties = useCallback(async (params = {}) => {
    // cancelar petición anterior
    if (abortControllerRef.current) {
      try { abortControllerRef.current.abort(); } catch (e) {}
    }
    abortControllerRef.current = new AbortController();

    setLoadingSearch(true);
    setSearchError(null);
    setGlobalLoading(true);

    try {
      // Combinar estado actual del contexto con params entrantes
      const merged = {
        location: params.location ?? location,
        checkIn: params.checkIn ?? dates?.checkIn,
        checkOut: params.checkOut ?? dates?.checkOut,
        guests: params.guests ?? guests,
        ...params
      };

      const cleanParams = _buildCleanParams(merged);

      // api.get(endpoint, params, options)
      const response = await api.get('/properties/search', cleanParams, {
        signal: abortControllerRef.current.signal
      });

      // El backend puede devolver directamente un array o un objeto { data: [...] } u otras formas.
      const data = Array.isArray(response)
        ? response
        : (response?.data ?? response?.results ?? []);

      const finalResults = Array.isArray(data) ? data : [];

      setSearchResults(finalResults);
      setResults(finalResults);
      setSearchError(null);
      setGlobalError(null);

      return finalResults;
    } catch (err) {
      if (err?.name === 'AbortError') {
        // petición cancelada por nueva búsqueda -> no considerarlo error
        console.log('Search request cancelled');
        return [];
      }

      const message = err?.response?.data?.message || err?.message || 'Error en la búsqueda de propiedades';
      console.error('Search error:', err);

      setSearchError(message);
      setGlobalError(message);
      setSearchResults([]);
      setResults([]);

      return [];
    } finally {
      setLoadingSearch(false);
      setGlobalLoading(false);
      abortControllerRef.current = null;
    }
  }, [
    location, dates, guests, setResults, setGlobalLoading, setGlobalError
  ]);

  const updateSearchParams = useCallback((newParams) => {
    if (newParams.location !== undefined) setLocation(newParams.location);
    if (newParams.checkIn !== undefined && newParams.checkOut !== undefined) updateDates(newParams.checkIn, newParams.checkOut);
    if (newParams.guests !== undefined) setGuests(newParams.guests);
  }, [setLocation, updateDates, setGuests]);

  const clearSearch = useCallback(() => {
    // Cancelar cualquier petición en curso
    if (abortControllerRef.current) {
      try { abortControllerRef.current.abort(); } catch (e) {}
      abortControllerRef.current = null;
    }
    setSearchResults([]);
    setSearchError(null);
    setLoadingSearch(false);
    // Nota: no limpiamos el contexto global aquí; si quieres limpiarlo también usa setResults([]) y setGlobalError(null)
  }, []);

  const refreshSearch = useCallback(() => {
    // relanza una búsqueda con los parámetros actuales del contexto
    return searchProperties();
  }, [searchProperties]);

  return {
    // Resultado y estado local
    searchResults,
    loading: loadingSearch,
    error: searchError,
    isSearching: loadingSearch,

    // Acciones
    searchProperties,
    updateSearchParams,
    clearSearch,
    refreshSearch,

    // Estado expuesto del contexto (útil si se quiere leer directo)
    contextState: {
      location, dates, guests, results, globalLoading, globalError
    }
  };
};

export default useSearch;
