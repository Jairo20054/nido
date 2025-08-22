import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import useSearch from '../../hooks/useSearch'; // Cambiado a importación por defecto
import SearchFilters from '../../components/Search/SearchFilters';
import PropertyGrid from '../../components/property/PropertyGrid/PropertyGrid';
import MapView from '../../components/Search/MapView/MapView';
import ViewToggle from '../../components/Search/ViewToggle/ViewToggle';
import LoadingSpinner from '../../components/common/LoadingSpinner/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import ErrorMessage from '../../components/common/ErrorMessage/ErrorMessage';
import SortDropdown from '../../components/Search/SortDropdown/SortDropdown';
import ResultsCounter from '../../components/Search/ResultsCounter/ResultsCounter';
import './Search.css';

const Search = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [urlParams, setUrlParams] = useSearchParams();
  
  // Estados principales
  const [searchParams, setSearchParams] = useState({});
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('preferredViewMode') || 'grid';
  });
  const [sortBy, setSortBy] = useState('relevance');
  const [filtersVisible, setFiltersVisible] = useState(false);
  
  // Usar el hook useSearch correctamente
  const { results, isLoading, searchProperties } = useSearch();

  // Parsear parámetros de URL inicial
  const parseUrlParams = useCallback(() => {
    const params = Object.fromEntries(urlParams.entries());
    return {
      location: params.location || '',
      checkIn: params.checkIn || '',
      checkOut: params.checkOut || '',
      guests: parseInt(params.guests) || 1,
      minPrice: params.minPrice ? parseInt(params.minPrice) : null,
      maxPrice: params.maxPrice ? parseInt(params.maxPrice) : null,
      propertyType: params.propertyType || '',
      amenities: params.amenities ? params.amenities.split(',') : [],
      accessibility: params.accessibility === 'true',
      rating: params.rating ? parseFloat(params.rating) : null,
      instantBook: params.instantBook === 'true'
    };
  }, [urlParams]);

  // Actualizar URL con nuevos parámetros
  const updateUrlParams = useCallback((newParams) => {
    const params = new URLSearchParams();
    
    Object.entries(newParams).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '' && value !== false) {
        if (Array.isArray(value) && value.length > 0) {
          params.set(key, value.join(','));
        } else if (value !== 1 || key !== 'guests') { // No incluir guests=1 por defecto
          params.set(key, value.toString());
        }
      }
    });

    setUrlParams(params, { replace: true });
  }, [setUrlParams]);

  // Ejecutar búsqueda
  const executeSearch = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    
    try {
      // Validaciones básicas
      if (!params.location?.trim()) {
        throw new Error('La ubicación es requerida para realizar la búsqueda');
      }

      await searchProperties(params);
    } catch (err) {
      console.error("Search error:", err);
      setError(err.message || 'Error al realizar la búsqueda. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  }, [searchProperties]);

  // Efecto para inicializar búsqueda desde URL
  useEffect(() => {
    const initialParams = parseUrlParams();
    setSearchParams(initialParams);
    
    if (initialParams.location) {
      executeSearch(initialParams);
    } else {
      setLoading(false);
    }
  }, [parseUrlParams, executeSearch]);

  // Efecto para actualizar propiedades cuando cambian los resultados
  useEffect(() => {
    if (results) {
      setProperties(results);
    }
  }, [results]);

  // Manejar cambios en filtros
  const handleFilterChange = useCallback((newFilters) => {
    const updatedParams = { ...searchParams, ...newFilters };
    setSearchParams(updatedParams);
    updateUrlParams(updatedParams);
    executeSearch(updatedParams);
  }, [searchParams, updateUrlParams, executeSearch]);

  // Manejar cambio de vista
  const handleViewChange = useCallback((newView) => {
    setViewMode(newView);
    localStorage.setItem('preferredViewMode', newView);
  }, []);

  // Manejar ordenamiento
  const handleSortChange = useCallback((newSort) => {
    setSortBy(newSort);
    // Aquí puedes implementar la lógica de ordenamiento
    const sortedProperties = [...properties].sort((a, b) => {
      switch (newSort) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'distance':
          return a.distance - b.distance;
        default:
          return 0;
      }
    });
    setProperties(sortedProperties);
  }, [properties]);

  // Reintentar búsqueda
  const handleRetry = useCallback(() => {
    if (searchParams.location) {
      executeSearch(searchParams);
    }
  }, [searchParams, executeSearch]);

  // Limpiar filtros
  const handleClearFilters = useCallback(() => {
    const basicParams = {
      location: searchParams.location,
      checkIn: searchParams.checkIn,
      checkOut: searchParams.checkOut,
      guests: searchParams.guests || 1
    };
    setSearchParams(basicParams);
    updateUrlParams(basicParams);
    executeSearch(basicParams);
  }, [searchParams, updateUrlParams, executeSearch]);

  // Título dinámico mejorado
  const pageTitle = useMemo(() => {
    if (!searchParams.location) return 'Buscar Alojamientos';
    
    const { location: loc, checkIn, checkOut, guests } = searchParams;
    let title = `Alojamientos en ${loc}`;
    
    if (checkIn && checkOut) {
      const startDate = new Date(checkIn).toLocaleDateString('es-ES', { 
        day: 'numeric', 
        month: 'short' 
      });
      const endDate = new Date(checkOut).toLocaleDateString('es-ES', { 
        day: 'numeric', 
        month: 'short' 
      });
      title += ` • ${startDate} - ${endDate}`;
    }
    
    if (guests > 1) {
      title += ` • ${guests} huéspedes`;
    }
    
    return title;
  }, [searchParams]);

  // Breadcrumb
  const breadcrumb = useMemo(() => {
    return [
      { label: 'Inicio', path: '/' },
      { label: 'Búsqueda', path: '/search' },
      ...(searchParams.location ? [{ label: searchParams.location }] : [])
    ];
  }, [searchParams.location]);

  // Mostrar estado de error
  if (error) {
    return (
      <div className="search-page">
        <div className="search-header">
          <h1>Error en la búsqueda</h1>
        </div>
        <ErrorMessage 
          message={error} 
          onRetry={handleRetry}
          className="search-error"
        />
      </div>
    );
  }

  return (
    <div className="search-page">
      {/* Breadcrumb */}
      <nav className="breadcrumb" aria-label="Navegación">
        {breadcrumb.map((item, index) => (
          <span key={index} className="breadcrumb-item">
            {item.path ? (
              <button 
                onClick={() => navigate(item.path)}
                className="breadcrumb-link"
              >
                {item.label}
              </button>
            ) : (
              <span className="breadcrumb-current">{item.label}</span>
            )}
            {index < breadcrumb.length - 1 && (
              <span className="breadcrumb-separator" aria-hidden="true">›</span>
            )}
          </span>
        ))}
      </nav>

      {/* Header */}
      <header className="search-header">
        <div className="header-content">
          <h1 className="search-title">{pageTitle}</h1>
          <ResultsCounter 
            count={properties.length} 
            loading={loading || isLoading}
            location={searchParams.location}
          />
        </div>
        
        <div className="header-controls">
          <button 
            className="filters-toggle mobile-only"
            onClick={() => setFiltersVisible(!filtersVisible)}
            aria-expanded={filtersVisible}
          >
            Filtros {filtersVisible ? '×' : '☰'}
          </button>
          
          <SortDropdown 
            value={sortBy} 
            onChange={handleSortChange}
            disabled={loading || properties.length === 0}
          />
          
          <ViewToggle 
            currentView={viewMode} 
            onViewChange={handleViewChange}
            disabled={loading || properties.length === 0}
          />
        </div>
      </header>

      {/* Layout principal */}
      <div className="search-layout">
        {/* Filtros */}
        <aside 
          className={`filters-container ${filtersVisible ? 'visible' : ''}`}
          aria-label="Filtros de búsqueda"
        >
          <div className="filters-header">
            <h2>Filtros</h2>
            <button 
              className="clear-filters"
              onClick={handleClearFilters}
              disabled={loading}
            >
              Limpiar
            </button>
          </div>
          
          <SearchFilters 
            filters={searchParams} 
            onFilterChange={handleFilterChange}
            disabled={loading}
          />
        </aside>

        {/* Resultados */}
        <main className="results-container" role="main">
          {loading || isLoading ? (
            <div className="loading-container">
              <LoadingSpinner />
              <p className="loading-text">
                Buscando alojamientos en {searchParams.location}...
              </p>
            </div>
          ) : properties.length === 0 ? (
            <EmptyState 
              title="No encontramos propiedades que coincidan"
              description="Intenta ajustar tus filtros de búsqueda o buscar en otra ubicación"
              actionLabel="Limpiar filtros"
              onAction={handleClearFilters}
            />
          ) : (
            <div className="results-content">
              {viewMode === 'grid' ? (
                <PropertyGrid 
                  properties={properties} 
                  className="search-results-grid"
                />
              ) : (
                <MapView 
                  properties={properties}
                  center={searchParams.location}
                  className="search-results-map"
                />
              )}
            </div>
          )}
        </main>
      </div>

      {/* Overlay para filtros móviles */}
      {filtersVisible && (
        <div 
          className="filters-overlay mobile-only"
          onClick={() => setFiltersVisible(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default Search;