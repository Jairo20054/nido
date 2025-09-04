import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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

const mockSearch = (params) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const propertiesByLocation = {
        bogota: [
          {
            id: 1,
            title: "Apartamento en el norte de Bogotá",
            location: "Bogotá, Colombia",
            price: 47,
            rating: 4.5,
            reviews: 5526,
            images: ["https://example.com/image1.jpg"],
            amenities: ["WiFi", "Cocina"],
            type: "apartment",
            beds: 2,
            monthlyPrice: 1128,
            isSuperHost: true
          },
          {
            id: 2,
            title: "Casa en Usaquén",
            location: "Bogotá, Colombia",
            price: 85,
            rating: 4.8,
            reviews: 680,
            images: ["https://example.com/image2.jpg"],
            amenities: ["WiFi", "Estacionamiento", "Jardín"],
            type: "house",
            beds: 3,
            monthlyPrice: 769,
            isSuperHost: false
          },
          {
            id: 3,
            title: "Apartamento en Chapinero",
            location: "Bogotá, Colombia",
            price: 62,
            rating: 4.3,
            reviews: 420,
            images: ["https://example.com/image3.jpg"],
            amenities: ["WiFi", "Lavadora"],
            type: "apartment",
            beds: 1,
            monthlyPrice: 525,
            isSuperHost: true
          }
        ],
        medellin: [
          {
            id: 4,
            title: "Loft en El Poblado",
            location: "Medellín, Colombia",
            price: 75,
            rating: 4.7,
            reviews: 1250,
            images: ["https://example.com/image4.jpg"],
            amenities: ["WiFi", "Piscina", "Gimnasio"],
            type: "loft",
            beds: 2,
            monthlyPrice: 950,
            isSuperHost: true
          }
        ],
        cartagena: [
          {
            id: 5,
            title: "Casa en la playa",
            location: "Cartagena, Colombia",
            price: 120,
            rating: 4.9,
            reviews: 890,
            images: ["https://example.com/image5.jpg"],
            amenities: ["WiFi", "Aire acondicionado", "Piscina"],
            type: "house",
            beds: 4,
            monthlyPrice: 1500,
            isSuperHost: false
          }
        ]
      };

      const locationKey = params.location.toLowerCase();
      let results = propertiesByLocation[locationKey] || [];

      if (params.minPrice) {
        results = results.filter(property => property.price >= parseInt(params.minPrice));
      }
      if (params.maxPrice) {
        results = results.filter(property => property.price <= parseInt(params.maxPrice));
      }
      if (params.propertyType) {
        results = results.filter(property => property.type === params.propertyType);
      }

      resolve(results);
    }, 1000);
  });
};

const Search = () => {
  const navigate = useNavigate();
  const [urlParams, setUrlParams] = useSearchParams();
  
  const [searchParams, setSearchParams] = useState({});
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('preferredViewMode') || 'grid';
  });
  const [sortBy, setSortBy] = useState('relevance');
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [showMap, setShowMap] = useState(false);

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

  const updateUrlParams = useCallback((newParams) => {
    const params = new URLSearchParams();
    
    Object.entries(newParams).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '' && value !== false) {
        if (Array.isArray(value) && value.length > 0) {
          params.set(key, value.join(','));
        } else if (value !== 1 || key !== 'guests') {
          params.set(key, value.toString());
        }
      }
    });

    setUrlParams(params, { replace: true });
  }, [setUrlParams]);

  const executeSearch = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    
    try {
      if (!params.location?.trim()) {
        throw new Error('La ubicación es requerida para realizar la búsqueda');
      }

      const results = await mockSearch(params);
      setProperties(results);
    } catch (err) {
      console.error("Search error:", err);
      setError(err.message || 'Error al realizar la búsqueda. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialParams = parseUrlParams();
    setSearchParams(initialParams);
    
    if (initialParams.location) {
      executeSearch(initialParams);
    } else {
      setLoading(false);
    }
  }, [parseUrlParams, executeSearch]);

  const handleFilterChange = useCallback((newFilters) => {
    const updatedParams = { ...searchParams, ...newFilters };
    setSearchParams(updatedParams);
    updateUrlParams(updatedParams);
    executeSearch(updatedParams);
  }, [searchParams, updateUrlParams, executeSearch]);

  const handleViewChange = useCallback((mode) => {
    setViewMode(mode);
    localStorage.setItem('preferredViewMode', mode);
  }, []);

  const handleSortChange = useCallback((sortOption) => {
    setSortBy(sortOption);
  }, []);

  const handleClearFilters = useCallback(() => {
    const defaultParams = {
      location: searchParams.location,
      checkIn: '',
      checkOut: '',
      guests: 1,
      minPrice: null,
      maxPrice: null,
      propertyType: '',
      amenities: [],
      accessibility: false,
      rating: null,
      instantBook: false
    };
    handleFilterChange(defaultParams);
  }, [searchParams.location, handleFilterChange]);

  const sortedProperties = useMemo(() => {
    const propertiesCopy = [...properties];
    switch (sortBy) {
      case 'price-asc':
        return propertiesCopy.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return propertiesCopy.sort((a, b) => b.price - a.price);
      case 'rating':
        return propertiesCopy.sort((a, b) => b.rating - a.rating);
      default:
        return propertiesCopy;
    }
  }, [properties, sortBy]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="search-page">
      <div className="search-header">
        <div className="search-header-top">
          <h1>Más de 1000 alojamientos</h1>
          <div className="search-controls">
            <button 
              className="filter-toggle"
              onClick={() => setFiltersVisible(!filtersVisible)}
            >
              <span>Filtros</span>
            </button>
            <SortDropdown 
              sortBy={sortBy} 
              onSortChange={handleSortChange} 
            />
            <ViewToggle 
              viewMode={viewMode} 
              onViewChange={handleViewChange} 
            />
          </div>
        </div>
        <div className="search-header-bottom">
          <ResultsCounter count={properties.length} />
          <button 
            className={`map-toggle ${showMap ? 'active' : ''}`}
            onClick={() => setShowMap(!showMap)}
          >
            {showMap ? 'Mostrar lista' : 'Mostrar mapa'}
          </button>
        </div>
      </div>

      <div className="search-content">
        <div className={`search-filters-sidebar ${filtersVisible ? 'visible' : ''}`}>
          <div className="filters-header">
            <h2>Filtros</h2>
            <button onClick={() => setFiltersVisible(false)}>×</button>
          </div>
          <SearchFilters
            filters={searchParams}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
          />
        </div>

        {filtersVisible && <div className="filters-overlay" onClick={() => setFiltersVisible(false)}></div>}

        <div className="search-results-container">
          {error && <ErrorMessage message={error} />}

          {!error && properties.length === 0 && (
            <EmptyState 
              message="No se encontraron propiedades que coincidan con tu búsqueda"
              subtitle="Intenta ajustar los filtros o busca en otra ubicación"
            />
          )}

          {!error && properties.length > 0 && (
            <>
              {showMap ? (
                <MapView properties={sortedProperties} />
              ) : (
                <PropertyGrid properties={sortedProperties} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;