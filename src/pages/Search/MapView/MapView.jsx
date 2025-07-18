import React, { useEffect, useRef, useState } from 'react';
import './MapView.css';

const MapView = ({ properties, center, className }) => {
  const mapRef = useRef(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  
  useEffect(() => {
    if (!mapInitialized && mapRef.current) {
      console.log(`Mapa inicializado en: ${center}`);
      setMapInitialized(true);
    }
  }, [center, mapInitialized]);

  return (
    <div className={`map-view ${className || ''}`}>
      <div ref={mapRef} className="map-container">
        <div className="map-placeholder">
          <div className="map-mock">
            <div className="map-mock-center">
              <span className="map-mock-label">Mapa de {center}</span>
              <div className="map-mock-marker-container">
                {properties.map((prop, index) => (
                  <div 
                    key={prop.id} 
                    className="map-mock-marker"
                    style={{
                      left: `${20 + (index * 15) % 80}%`,
                      top: `${30 + (index * 10) % 60}%`
                    }}
                  >
                    <div className="map-mock-price">€{prop.price}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="map-property-list">
        {properties.map(property => (
          <div key={property.id} className="map-property-item">
            <div className="map-property-image">
              {property.image ? (
                <img src={property.image} alt={property.title} />
              ) : (
                <div className="image-placeholder" />
              )}
            </div>
            <div className="map-property-details">
              <h3 className="property-title">{property.title}</h3>
              <p className="property-location">{property.location}</p>
              <div className="property-meta">
                <span>€{property.price} noche</span>
                <span>★ {property.rating}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MapView;