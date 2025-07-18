import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  FaMapMarkerAlt, 
  FaCalendarAlt, 
  FaUsers, 
  FaDollarSign, 
  FaTimes, 
  FaChevronDown,
  FaWifi,
  FaCar,
  FaSwimmingPool,
  FaDumbbell,
  FaPaw,
  FaSmokingBan,
  FaUtensils,
  FaSnowflake,
  FaTv,
  FaFilter,
  FaCheck
} from 'react-icons/fa';
import './AdvancedFilters.css';

const AdvancedFilters = ({ 
  onFiltersChange,
  initialFilters = {},
  onClose,
  isOpen = true,
  className = ''
}) => {
  const [filters, setFilters] = useState({
    country: '',
    state: '',
    city: '',
    neighborhood: '',
    checkIn: '',
    checkOut: '',
    adults: 1,
    children: 0,
    infants: 0,
    minPrice: 0,
    maxPrice: 1000,
    propertyType: '',
    amenities: [],
    instantBook: false,
    superhost: false,
    ...initialFilters
  });

  const [activeSection, setActiveSection] = useState(null);
  const [locationData, setLocationData] = useState({
    countries: ['Colombia', 'Argentina', 'México', 'Chile', 'Perú', 'Brasil'],
    states: {
      'Colombia': ['Valle del Cauca', 'Antioquia', 'Cundinamarca', 'Atlántico'],
      'Argentina': ['Buenos Aires', 'Córdoba', 'Santa Fe', 'Mendoza'],
      'México': ['Ciudad de México', 'Jalisco', 'Nuevo León', 'Yucatán']
    },
    cities: {
      'Valle del Cauca': ['Cali', 'Buenaventura', 'Palmira', 'Tuluá'],
      'Antioquia': ['Medellín', 'Bello', 'Itagüí', 'Envigado'],
      'Buenos Aires': ['Buenos Aires', 'La Plata', 'Mar del Plata', 'Bahía Blanca']
    },
    neighborhoods: {
      'Cali': ['El Peñón', 'San Fernando', 'Granada', 'Versalles'],
      'Medellín': ['El Poblado', 'Laureles', 'Envigado', 'Sabaneta'],
      'Buenos Aires': ['Palermo', 'Recoleta', 'San Telmo', 'Puerto Madero']
    }
  });

  const propertyTypes = [
    { value: 'apartment', label: 'Apartamento' },
    { value: 'house', label: 'Casa' },
    { value: 'studio', label: 'Estudio' },
    { value: 'loft', label: 'Loft' },
    { value: 'villa', label: 'Villa' },
    { value: 'cabin', label: 'Cabaña' }
  ];

  const amenitiesList = [
    { id: 'wifi', label: 'WiFi', icon: FaWifi },
    { id: 'parking', label: 'Estacionamiento', icon: FaCar },
    { id: 'pool', label: 'Piscina', icon: FaSwimmingPool },
    { id: 'gym', label: 'Gimnasio', icon: FaDumbbell },
    { id: 'pets', label: 'Se admiten mascotas', icon: FaPaw },
    { id: 'nonsmoking', label: 'No fumar', icon: FaSmokingBan },
    { id: 'kitchen', label: 'Cocina', icon: FaUtensils },
    { id: 'ac', label: 'Aire acondicionado', icon: FaSnowflake },
    { id: 'tv', label: 'TV', icon: FaTv }
  ];

  // Calcular días de diferencia
  const daysDifference = useMemo(() => {
    if (filters.checkIn && filters.checkOut) {
      const start = new Date(filters.checkIn);
      const end = new Date(filters.checkOut);
      const diffTime = Math.abs(end - start);
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    return 0;
  }, [filters.checkIn, filters.checkOut]);

  // Total de huéspedes
  const totalGuests = useMemo(() => {
    return filters.adults + filters.children + filters.infants;
  }, [filters.adults, filters.children, filters.infants]);

  // Actualizar filtros
  const updateFilter = useCallback((key, value) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value };
      
      // Limpiar campos dependientes
      if (key === 'country') {
        newFilters.state = '';
        newFilters.city = '';
        newFilters.neighborhood = '';
      } else if (key === 'state') {
        newFilters.city = '';
        newFilters.neighborhood = '';
      } else if (key === 'city') {
        newFilters.neighborhood = '';
      }
      
      return newFilters;
    });
  }, []);

  // Manejar cambio de amenidades
  const handleAmenityToggle = useCallback((amenityId) => {
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter(id => id !== amenityId)
        : [...prev.amenities, amenityId]
    }));
  }, []);

  // Limpiar filtros
  const clearFilters = useCallback(() => {
    const clearedFilters = {
      country: '',
      state: '',
      city: '',
      neighborhood: '',
      checkIn: '',
      checkOut: '',
      adults: 1,
      children: 0,
      infants: 0,
      minPrice: 0,
      maxPrice: 1000,
      propertyType: '',
      amenities: [],
      instantBook: false,
      superhost: false
    };
    setFilters(clearedFilters);
    if (onFiltersChange) {
      onFiltersChange(clearedFilters);
    }
  }, [onFiltersChange]);

  // Aplicar filtros
  const applyFilters = useCallback(() => {
    if (onFiltersChange) {
      onFiltersChange(filters);
    }
    if (onClose) {
      onClose();
    }
  }, [filters, onFiltersChange, onClose]);

  // Validar fechas
  const today = new Date().toISOString().split('T')[0];
  const isValidDateRange = filters.checkIn && filters.checkOut && 
                          new Date(filters.checkIn) < new Date(filters.checkOut);

  // Contar filtros activos
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.country) count++;
    if (filters.checkIn && filters.checkOut) count++;
    if (totalGuests > 1) count++;
    if (filters.minPrice > 0 || filters.maxPrice < 1000) count++;
    if (filters.propertyType) count++;
    if (filters.amenities.length > 0) count++;
    if (filters.instantBook || filters.superhost) count++;
    return count;
  }, [filters, totalGuests]);

  if (!isOpen) return null;

  return (
    <div className={`advanced-filters ${className}`}>
      <div className="filters-header">
        <div className="header-title">
          <FaFilter className="header-icon" />
          <h2>Filtros avanzados</h2>
          {activeFiltersCount > 0 && (
            <span className="active-count">{activeFiltersCount}</span>
          )}
        </div>
        {onClose && (
          <button className="close-button" onClick={onClose} aria-label="Cerrar filtros">
            <FaTimes />
          </button>
        )}
      </div>

      {/* Sección: Ubicación */}
      <div className="filter-section">
        <button 
          className={`section-header ${activeSection === 'location' ? 'active' : ''}`}
          onClick={() => setActiveSection(activeSection === 'location' ? null : 'location')}
        >
          <div className="section-title">
            <FaMapMarkerAlt className="section-icon" />
            <h3>Ubicación</h3>
          </div>
          <FaChevronDown className={`chevron ${activeSection === 'location' ? 'open' : ''}`} />
        </button>
        
        <div className={`section-content ${activeSection === 'location' ? 'open' : ''}`}>
          <div className="filter-group">
            <div className="filter-field">
              <label>País</label>
              <select 
                className="filter-select"
                value={filters.country}
                onChange={(e) => updateFilter('country', e.target.value)}
              >
                <option value="">Seleccionar país</option>
                {locationData.countries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>

            {filters.country && (
              <div className="filter-field">
                <label>Estado/Provincia</label>
                <select 
                  className="filter-select"
                  value={filters.state}
                  onChange={(e) => updateFilter('state', e.target.value)}
                >
                  <option value="">Seleccionar estado</option>
                  {(locationData.states[filters.country] || []).map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
            )}

            {filters.state && (
              <div className="filter-field">
                <label>Ciudad</label>
                <select 
                  className="filter-select"
                  value={filters.city}
                  onChange={(e) => updateFilter('city', e.target.value)}
                >
                  <option value="">Seleccionar ciudad</option>
                  {(locationData.cities[filters.state] || []).map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
            )}

            {filters.city && (
              <div className="filter-field">
                <label>Barrio</label>
                <select 
                  className="filter-select"
                  value={filters.neighborhood}
                  onChange={(e) => updateFilter('neighborhood', e.target.value)}
                >
                  <option value="">Seleccionar barrio</option>
                  {(locationData.neighborhoods[filters.city] || []).map(neighborhood => (
                    <option key={neighborhood} value={neighborhood}>{neighborhood}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sección: Fechas */}
      <div className="filter-section">
        <button 
          className={`section-header ${activeSection === 'dates' ? 'active' : ''}`}
          onClick={() => setActiveSection(activeSection === 'dates' ? null : 'dates')}
        >
          <div className="section-title">
            <FaCalendarAlt className="section-icon" />
            <h3>Fechas y duración</h3>
          </div>
          <FaChevronDown className={`chevron ${activeSection === 'dates' ? 'open' : ''}`} />
        </button>
        
        <div className={`section-content ${activeSection === 'dates' ? 'open' : ''}`}>
          <div className="filter-group">
            <div className="filter-field">
              <label>Fecha de entrada</label>
              <input
                type="date"
                className="filter-input"
                value={filters.checkIn}
                min={today}
                onChange={(e) => updateFilter('checkIn', e.target.value)}
              />
            </div>
            <div className="filter-field">
              <label>Fecha de salida</label>
              <input
                type="date"
                className="filter-input"
                value={filters.checkOut}
                min={filters.checkIn || today}
                onChange={(e) => updateFilter('checkOut', e.target.value)}
              />
            </div>
          </div>
          {isValidDateRange && (
            <div className="date-summary">
              <span className="duration-badge">
                {daysDifference} {daysDifference === 1 ? 'noche' : 'noches'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Sección: Huéspedes */}
      <div className="filter-section">
        <button 
          className={`section-header ${activeSection === 'guests' ? 'active' : ''}`}
          onClick={() => setActiveSection(activeSection === 'guests' ? null : 'guests')}
        >
          <div className="section-title">
            <FaUsers className="section-icon" />
            <h3>Huéspedes</h3>
          </div>
          <FaChevronDown className={`chevron ${activeSection === 'guests' ? 'open' : ''}`} />
        </button>
        
        <div className={`section-content ${activeSection === 'guests' ? 'open' : ''}`}>
          <div className="guest-controls">
            <div className="guest-row">
              <div className="guest-info">
                <span className="guest-type">Adultos</span>
                <span className="guest-desc">13 años o más</span>
              </div>
              <div className="counter-controls">
                <button 
                  className="counter-btn"
                  onClick={() => updateFilter('adults', Math.max(1, filters.adults - 1))}
                  disabled={filters.adults <= 1}
                >
                  -
                </button>
                <span className="counter-value">{filters.adults}</span>
                <button 
                  className="counter-btn"
                  onClick={() => updateFilter('adults', Math.min(16, filters.adults + 1))}
                  disabled={filters.adults >= 16}
                >
                  +
                </button>
              </div>
            </div>

            <div className="guest-row">
              <div className="guest-info">
                <span className="guest-type">Niños</span>
                <span className="guest-desc">De 2 a 12 años</span>
              </div>
              <div className="counter-controls">
                <button 
                  className="counter-btn"
                  onClick={() => updateFilter('children', Math.max(0, filters.children - 1))}
                  disabled={filters.children <= 0}
                >
                  -
                </button>
                <span className="counter-value">{filters.children}</span>
                <button 
                  className="counter-btn"
                  onClick={() => updateFilter('children', Math.min(10, filters.children + 1))}
                  disabled={filters.children >= 10}
                >
                  +
                </button>
              </div>
            </div>

            <div className="guest-row">
              <div className="guest-info">
                <span className="guest-type">Bebés</span>
                <span className="guest-desc">Menores de 2 años</span>
              </div>
              <div className="counter-controls">
                <button 
                  className="counter-btn"
                  onClick={() => updateFilter('infants', Math.max(0, filters.infants - 1))}
                  disabled={filters.infants <= 0}
                >
                  -
                </button>
                <span className="counter-value">{filters.infants}</span>
                <button 
                  className="counter-btn"
                  onClick={() => updateFilter('infants', Math.min(5, filters.infants + 1))}
                  disabled={filters.infants >= 5}
                >
                  +
                </button>
              </div>
            </div>
          </div>
          
          {totalGuests > 1 && (
            <div className="guests-summary">
              Total: {totalGuests} {totalGuests === 1 ? 'huésped' : 'huéspedes'}
            </div>
          )}
        </div>
      </div>

      {/* Sección: Precio */}
      <div className="filter-section">
        <button 
          className={`section-header ${activeSection === 'price' ? 'active' : ''}`}
          onClick={() => setActiveSection(activeSection === 'price' ? null : 'price')}
        >
          <div className="section-title">
            <FaDollarSign className="section-icon" />
            <h3>Precio por noche</h3>
          </div>
          <FaChevronDown className={`chevron ${activeSection === 'price' ? 'open' : ''}`} />
        </button>
        
        <div className={`section-content ${activeSection === 'price' ? 'open' : ''}`}>
          <div className="price-range">
            <div className="price-inputs">
              <div className="price-field">
                <label>Mínimo</label>
                <div className="price-input-wrapper">
                  <span className="currency">$</span>
                  <input
                    type="number"
                    className="price-input"
                    value={filters.minPrice}
                    min="0"
                    max={filters.maxPrice}
                    onChange={(e) => updateFilter('minPrice', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
              <div className="price-separator">-</div>
              <div className="price-field">
                <label>Máximo</label>
                <div className="price-input-wrapper">
                  <span className="currency">$</span>
                  <input
                    type="number"
                    className="price-input"
                    value={filters.maxPrice}
                    min={filters.minPrice}
                    max="10000"
                    onChange={(e) => updateFilter('maxPrice', parseInt(e.target.value) || 1000)}
                  />
                </div>
              </div>
            </div>
            
            <div className="price-slider">
              <input
                type="range"
                min="0"
                max="1000"
                value={filters.minPrice}
                onChange={(e) => updateFilter('minPrice', parseInt(e.target.value))}
                className="range-input range-min"
              />
              <input
                type="range"
                min="0"
                max="1000"
                value={filters.maxPrice}
                onChange={(e) => updateFilter('maxPrice', parseInt(e.target.value))}
                className="range-input range-max"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sección: Tipo de propiedad */}
      <div className="filter-section">
        <button 
          className={`section-header ${activeSection === 'property' ? 'active' : ''}`}
          onClick={() => setActiveSection(activeSection === 'property' ? null : 'property')}
        >
          <div className="section-title">
            <h3>Tipo de propiedad</h3>
          </div>
          <FaChevronDown className={`chevron ${activeSection === 'property' ? 'open' : ''}`} />
        </button>
        
        <div className={`section-content ${activeSection === 'property' ? 'open' : ''}`}>
          <div className="property-types">
            {propertyTypes.map(type => (
              <button
                key={type.value}
                className={`property-type-btn ${filters.propertyType === type.value ? 'active' : ''}`}
                onClick={() => updateFilter('propertyType', 
                  filters.propertyType === type.value ? '' : type.value
                )}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sección: Amenidades */}
      <div className="filter-section">
        <button 
          className={`section-header ${activeSection === 'amenities' ? 'active' : ''}`}
          onClick={() => setActiveSection(activeSection === 'amenities' ? null : 'amenities')}
        >
          <div className="section-title">
            <h3>Amenidades</h3>
          </div>
          <FaChevronDown className={`chevron ${activeSection === 'amenities' ? 'open' : ''}`} />
        </button>
        
        <div className={`section-content ${activeSection === 'amenities' ? 'open' : ''}`}>
          <div className="amenities-grid">
            {amenitiesList.map(amenity => {
              const IconComponent = amenity.icon;
              const isSelected = filters.amenities.includes(amenity.id);
              
              return (
                <button
                  key={amenity.id}
                  className={`amenity-btn ${isSelected ? 'active' : ''}`}
                  onClick={() => handleAmenityToggle(amenity.id)}
                >
                  <IconComponent className="amenity-icon" />
                  <span className="amenity-label">{amenity.label}</span>
                  {isSelected && <FaCheck className="check-icon" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Opciones adicionales */}
      <div className="filter-section">
        <div className="additional-options">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={filters.instantBook}
              onChange={(e) => updateFilter('instantBook', e.target.checked)}
            />
            <span className="checkbox-custom"></span>
            <span>Reserva instantánea</span>
          </label>
          
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={filters.superhost}
              onChange={(e) => updateFilter('superhost', e.target.checked)}
            />
            <span className="checkbox-custom"></span>
            <span>Solo Superhosts</span>
          </label>
        </div>
      </div>

      {/* Acciones */}
      <div className="filter-actions">
        <button 
          className="clear-filters"
          onClick={clearFilters}
          disabled={activeFiltersCount === 0}
        >
          Limpiar filtros
          {activeFiltersCount > 0 && ` (${activeFiltersCount})`}
        </button>
        <button 
          className="apply-filters"
          onClick={applyFilters}
        >
          Aplicar filtros
        </button>
      </div>
    </div>
  );
};

export default AdvancedFilters;