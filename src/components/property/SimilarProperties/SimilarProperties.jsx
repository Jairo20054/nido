import React from 'react';
import PropertyCard from '../PropertyCard/PropertyCard';
import './SimilarProperties.css';

const SimilarProperties = ({ properties, currentPropertyId }) => {
  // Filtrar la propiedad actual
  const filteredProperties = properties.filter(
    property => property.id !== currentPropertyId
  );
  
  if (filteredProperties.length === 0) {
    return null;
  }

  return (
    <div className="similar-properties">
      <h2>Propiedades similares</h2>
      <div className="properties-grid">
        {filteredProperties.map(property => (
          <PropertyCard 
            key={property.id} 
            property={property} 
            className="similar-property"
          />
        ))}
      </div>
    </div>
  );
};

export default SimilarProperties;