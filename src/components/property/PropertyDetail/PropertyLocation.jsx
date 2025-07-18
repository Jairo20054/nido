import React, { useRef, useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaSubway, FaBus, FaWalking } from 'react-icons/fa';
import './PropertyLocation.css';

const PropertyLocation = ({ location }) => {
  const mapRef = useRef(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  
  useEffect(() => {
    // Simulación de inicialización de mapa
    if (!mapInitialized && mapRef.current && location) {
      console.log('Mapa inicializado para:', location.address);
      setMapInitialized(true);
    }
  }, [location, mapInitialized]);

  if (!location) {
    return null;
  }

  return (
    <div className="property-location">
      <h2>Ubicación</h2>
      
      <div className="location-details">
        <div className="address">
          <FaMapMarkerAlt className="location-icon" />
          <div>
            <p><strong>Dirección:</strong> {location.address}</p>
            <p><strong>Barrio:</strong> {location.neighborhood}</p>
            <p><strong>Ciudad:</strong> {location.city}</p>
            <p><strong>País:</strong> {location.country}</p>
          </div>
        </div>
      </div>
      
      <div className="location-map" ref={mapRef}>
        <div className="map-placeholder">
          <div className="map-mock">
            <div className="map-mock-center">
              <span className="map-mock-label">Mapa de {location.city}</span>
              <div className="map-mock-marker">
                <FaMapMarkerAlt className="marker-icon" />
                <div className="map-mock-address">{location.address}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {location.transitInfo && (
        <div className="transit-info">
          <h3>Cómo moverse</h3>
          <div className="transit-items">
            {location.transitInfo.map((info, index) => (
              <div key={index} className="transit-item">
                {info.type === 'metro' && <FaSubway className="transit-icon metro" />}
                {info.type === 'bus' && <FaBus className="transit-icon bus" />}
                {info.type === 'walk' && <FaWalking className="transit-icon walk" />}
                <div>
                  <p className="transit-title">{info.title}</p>
                  <p className="transit-details">{info.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyLocation;