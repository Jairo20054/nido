import React, { useState } from 'react';
import { FaCheck, FaPlus, FaMinus } from 'react-icons/fa';
import './PropertyAmenities.css';

const PropertyAmenities = ({ amenities }) => {
  const [showAll, setShowAll] = useState(false);
  
  if (!amenities || amenities.length === 0) {
    return (
      <div className="property-amenities">
        <h2>Comodidades</h2>
        <p>No hay comodidades listadas.</p>
      </div>
    );
  }
  
  // Agrupar comodidades en columnas
  const half = Math.ceil(amenities.length / 2);
  const column1 = amenities.slice(0, half);
  const column2 = amenities.slice(half);
  
  const visibleAmenities = showAll ? amenities : amenities.slice(0, 10);
  const showToggle = amenities.length > 10;

  return (
    <div className="property-amenities">
      <h2>Comodidades</h2>
      
      <div className="amenities-grid">
        <div className="amenities-column">
          {column1.map((amenity, index) => (
            <div key={index} className="amenity-item">
              <FaCheck className="check-icon" />
              <span>{amenity}</span>
            </div>
          ))}
        </div>
        
        {column2.length > 0 && (
          <div className="amenities-column">
            {column2.map((amenity, index) => (
              <div key={index} className="amenity-item">
                <FaCheck className="check-icon" />
                <span>{amenity}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {showToggle && (
        <button 
          className="show-toggle" 
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? (
            <>
              <FaMinus /> Mostrar menos
            </>
          ) : (
            <>
              <FaPlus /> Mostrar todas
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default PropertyAmenities;
