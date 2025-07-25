import React from 'react';
import PropertyCard from '../PropertyCard/PropertyCard';
import './PropertyGrid.css';

const PropertyGrid = ({ properties, className, onCardClick }) => {
  if (!properties || properties.length === 0) {
    return (
      <div className={`property-grid ${className || ''}`}>
        <p className="no-properties">No se encontraron propiedades</p>
      </div>
    );
  }

  return (
    <div className={`property-grid ${className || ''}`}>
      {properties.map(property => (
        <PropertyCard 
          key={property.id} 
          property={property} 
          className="property-grid-item"
          onClick={() => onCardClick && onCardClick(property)}
        />
      ))}
    </div>
  );
};

export default PropertyGrid;
