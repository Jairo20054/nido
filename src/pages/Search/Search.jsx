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

// Función para simular búsqueda (mock)
const mockSearch = (params) => {
  // Simular retraso de red
  return new Promise((resolve) => {
    setTimeout(() => {
      // Propiedades de ejemplo basadas en la ubicación
      const propertiesByLocation = {
        bogota: [
          {
            id: 1,
            title: "Apartamento en el norte de Bogotá",
            location: "Bogotá, Colombia",
            price: 120000,
            rating: 4.5,
            images: ["https://example.com/image1.jpg"],
            amenities: ["WiFi", "Cocina"],
            type: "apartment"
          },
          {
            id: 2,
            title: "Casa en Usaquén",
            location: "Bogotá, Colombia",
            price: 250000,
            rating: 4.8,
            images: ["https://example.com/image2.jpg"],
            amenities: ["WiFi", "Estacionamiento", "Jardín"],
            type: "house"
          }
        ],
        medellin: [
          {
            id: 3,
            title: "Loft en El Poblado",
            location: "Medellín, Colombia",
            price: 140000,
            rating: 4.7,
            images: ["https://example.com/image3.jpg"],
            amenities: ["WiFi", "Piscina", "Gimnasio"],
            type: "loft"
          }
        ],
        cartagena: [
          {
            id: 4,
            title: "Casa en la playa",
            location: "Cartagena, Colombia",
            price: 300000,
            rating: 4.9,
            images: ["https://example.com/image4.jpg"],
            amenities: ["WiFi", "Aire acondicionado", "Piscina"],
            type: "house"
          }
        ]
      };

      // Convertir la ubicación a minúsculas para buscar en el objeto
      const locationKey = params.location.toLowerCase();
      let results = propertiesByLocation[locationKey] || [];

      // Filtrar por otros parámetros si existen (aquí puedes expandir la lógica)
      if (params.minPrice) {
        results = results.filter(property => property.price >= parseInt(params.minPrice));
      }
      if (params.maxPrice) {
        results = results.filter(property => property.price <= parseInt(params.maxPrice));
      }

      resolve(results);
    }, 1000); // 1 segundo de delay
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
        } else if (value !== 1 || key !== 'guests') {
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

  // Manejar cambios en filtros
  const handleFilterChange = useCallback((newFilters) => {
    const updatedParams = { ...searchParams, ...newFilters };
    setSearchParams(updatedParams);
    updateUrlParams(updatedParams);
    executeSearch(updatedParams);
  }, [searchParams, updateUrlParams, executeSearch]);

  // ... resto de funciones (handleViewChange, handleSortChange, handleClearFilters, etc.)

  // ... resto del componente (render)

};

export default Search;