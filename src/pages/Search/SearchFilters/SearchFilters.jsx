import React from 'react';
import './SearchFilters.css';

const SearchFilters = ({ filters, onFilterChange, disabled }) => {
  const propertyTypes = [
    { id: 'any', label: 'Cualquier tipo' },
    { id: 'house', label: 'Casa completa' },
    { id: 'apartment', label: 'Departamento' },
    { id: 'room', label: 'Habitación privada' },
    { id: 'villa', label: 'Villa' },
    { id: 'cabin', label: 'Cabaña' }
  ];

  const amenitiesList = [
    { id: 'wifi', label: 'Wi-Fi' },
    { id: 'kitchen', label: 'Cocina' },
    { id: 'parking', label: 'Estacionamiento' },
    { id: 'pool', label: 'Piscina' },
    { id: 'ac', label: 'Aire acondicionado' },
    { id: 'heating', label: 'Calefacción' },
    { id: 'tv', label: 'TV' },
    { id: 'washer', label: 'Lavadora' }
  ];

  const handlePriceChange = (e, type) => {
    const value = e.target.value ? parseInt(e.target.value) : null;
    onFilterChange({ [type]: value });
  };

  const handlePropertyTypeChange = (e) => {
    onFilterChange({ propertyType: e.target.value });
  };

  const handleAmenityChange = (amenityId) => {
    const updatedAmenities = filters.amenities.includes(amenityId)
      ? filters.amenities.filter(id => id !== amenityId)
      : [...filters.amenities, amenityId];
    
    onFilterChange({ amenities: updatedAmenities });
  };

  const handleAccessibilityChange = (e) => {
    onFilterChange({ accessibility: e.target.checked });
  };

  const handleRatingChange = (e) => {
    onFilterChange({ rating: e.target.value ? parseFloat(e.target.value) : null });
  };

  const handleInstantBookChange = (e) => {
    onFilterChange({ instantBook: e.target.checked });
  };

  return (
    <div className="search-filters">
      {/* Precio */}
      <div className="filter-section">
        <h3 className="filter-title">Rango de precios</h3>
        <div className="price-filters">
          <div className="price-input">
            <label>Mínimo (€)</label>
            <input
              type="number"
              min="0"
              value={filters.minPrice || ''}
              onChange={(e) => handlePriceChange(e, 'minPrice')}
              disabled={disabled}
              placeholder="0"
            />
          </div>
          <div className="price-input">
            <label>Máximo (€)</label>
            <input
              type="number"
              min="0"
              value={filters.maxPrice || ''}
              onChange={(e) => handlePriceChange(e, 'maxPrice')}
              disabled={disabled}
              placeholder="Sin límite"
            />
          </div>
        </div>
      </div>

      {/* Tipo de propiedad */}
      <div className="filter-section">
        <h3 className="filter-title">Tipo de propiedad</h3>
        <div className="property-type-filters">
          {propertyTypes.map(type => (
            <label key={type.id} className="property-type-option">
              <input
                type="radio"
                name="propertyType"
                value={type.id}
                checked={filters.propertyType === type.id || (!filters.propertyType && type.id === 'any')}
                onChange={handlePropertyTypeChange}
                disabled={disabled}
              />
              <span>{type.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Comodidades */}
      <div className="filter-section">
        <h3 className="filter-title">Comodidades</h3>
        <div className="amenities-grid">
          {amenitiesList.map(amenity => (
            <label key={amenity.id} className="amenity-option">
              <input
                type="checkbox"
                checked={filters.amenities.includes(amenity.id)}
                onChange={() => handleAmenityChange(amenity.id)}
                disabled={disabled}
              />
              <span>{amenity.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Accesibilidad */}
      <div className="filter-section">
        <h3 className="filter-title">Accesibilidad</h3>
        <label className="accessibility-option">
          <input
            type="checkbox"
            checked={filters.accessibility || false}
            onChange={handleAccessibilityChange}
            disabled={disabled}
          />
          <span>Accesible para silla de ruedas</span>
        </label>
      </div>

      {/* Calificación mínima */}
      <div className="filter-section">
        <h3 className="filter-title">Calificación mínima</h3>
        <div className="rating-filter">
          <select
            value={filters.rating || ''}
            onChange={handleRatingChange}
            disabled={disabled}
          >
            <option value="">Cualquier calificación</option>
            <option value="4.5">4.5+ Estrellas</option>
            <option value="4">4+ Estrellas</option>
            <option value="3.5">3.5+ Estrellas</option>
          </select>
        </div>
      </div>

      {/* Reserva instantánea */}
      <div className="filter-section">
        <h3 className="filter-title">Opciones de reserva</h3>
        <label className="instant-book-option">
          <input
            type="checkbox"
            checked={filters.instantBook || false}
            onChange={handleInstantBookChange}
            disabled={disabled}
          />
          <span>Reserva instantánea</span>
        </label>
      </div>
    </div>
  );
};

export default SearchFilters;