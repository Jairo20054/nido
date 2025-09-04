import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ImageGallery from './ImageGallery';
import AmenityList from './AmenityList';
import ReviewSection from './ReviewSection';
import BookingWidget from '../../booking/BookingWidget';
import './PropertyDetail.css';

const PropertyDetail = ({ property: propProperty }) => {
  const [activeTab, setActiveTab] = useState('details');
  const [property, setProperty] = useState(propProperty || null);
  const [loading, setLoading] = useState(!propProperty);
  const [error, setError] = useState(null);
  const { id } = useParams();

  // Mock property data for demonstration
  const mockProperty = {
    id: id || '1',
    title: "Habitación 203 cerca al centro",
    type: "Habitación en San Antonio, Colombia",
    guests: 2,
    bedrooms: 1,
    bathrooms: 1,
    rating: 4.9,
    reviewCount: 58,
    location: "San Antonio, Colombia",
    host: {
      name: "Yita",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
      isSuperhost: true
    },
    images: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
    ],
    amenities: [
      { name: "WiFi", icon: "📶" },
      { name: "Cocina", icon: "🍳" },
      { name: "Estacionamiento", icon: "🚗" },
      { name: "Aire acondicionado", icon: "❄️" }
    ],
    reviews: [
      { id: 1, user: "Ana", rating: 5, comment: "Excelente lugar", date: "2024-01-15" }
    ],
    description: "Hermosa habitación en el centro de la ciudad con todas las comodidades.",
    locationDetails: "Ubicación perfecta cerca de transporte público y comercios.",
    // BookingWidget expected properties
    pricePerNight: 37,
    cleaningFee: 10,
    serviceFeeRate: 0.12,
    maxGuests: 2,
    instantBook: true
  };

  useEffect(() => {
    if (!propProperty && id) {
      // Simulate API call
      const fetchProperty = async () => {
        setLoading(true);
        try {
          // In a real app, this would be an API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          setProperty(mockProperty);
        } catch (err) {
          setError("Error al cargar la propiedad");
        } finally {
          setLoading(false);
        }
      };
      fetchProperty();
    } else if (propProperty) {
      setProperty(propProperty);
      setLoading(false);
    }
  }, [propProperty, id]);

  if (loading) {
    return (
      <div className="property-detail-loading">
        <div className="loading-spinner"></div>
        <p>Cargando propiedad...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="property-detail-error">
        <p>{error}</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="property-detail-error">
        <p>Propiedad no encontrada</p>
      </div>
    );
  }
  
  return (
    <div className="property-detail">
      <ImageGallery images={property.images} />
      
      <div className="detail-container">
        <div className="detail-header">
          <div>
            <h1 className="property-title">{property.title}</h1>
            <div className="property-meta">
              <div className="rating">
                <span>★ {property.rating}</span>
                <span>({property.reviewCount} reseñas)</span>
                <span className="superhost">Superhost</span>
                <span>{property.location}</span>
              </div>
            </div>
          </div>
          <button className="share-button">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7.5 3.75a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM3.75 6.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM3.75 17.25a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM13.5 6.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM18.75 17.25a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM12 12a.75.75 0 01.75.75v6a.75.75 0 01-1.5 0v-6A.75.75 0 0112 12zM6 12a.75.75 0 01.75.75v6a.75.75 0 01-1.5 0v-6A.75.75 0 016 12zM18 12a.75.75 0 01.75.75v6a.75.75 0 01-1.5 0v-6A.75.75 0 0118 12z" />
            </svg>
            Compartir
          </button>
        </div>
        
        <div className="specifications">
          <div className="spec-item">
            <span>🏠</span>
            <div>
              <div>Tipo de propiedad</div>
              <div className="spec-value">{property.type}</div>
            </div>
          </div>
          <div className="spec-item">
            <span>👥</span>
            <div>
              <div>Huéspedes</div>
              <div className="spec-value">{property.guests}</div>
            </div>
          </div>
          <div className="spec-item">
            <span>🛏️</span>
            <div>
              <div>Habitaciones</div>
              <div className="spec-value">{property.bedrooms}</div>
            </div>
          </div>
          <div className="spec-item">
            <span>🛁</span>
            <div>
              <div>Baños</div>
              <div className="spec-value">{property.bathrooms}</div>
            </div>
          </div>
        </div>
        
        <div className="detail-content">
          <div className="main-contentent">
            <div className="tabs">
              <button 
                className={`tab ${activeTab === 'details' ? 'active' : ''}`}
                onClick={() => setActiveTab('details')}
              >
                Detalles
              </button>
              <button 
                className={`tab ${activeTab === 'amenities' ? 'active' : ''}`}
                onClick={() => setActiveTab('amenities')}
              >
                Comodidades
              </button>
              <button 
                className={`tab ${activeTab === 'reviews' ? 'active' : ''}`}
                onClick={() => setActiveTab('reviews')}
              >
                Reseñas ({property.reviewCount})
              </button>
              <button 
                className={`tab ${activeTab === 'location' ? 'active' : ''}`}
                onClick={() => setActiveTab('location')}
              >
                Ubicación
              </button>
            </div>
            
            <div className="tab-content">
              {activeTab === 'details' && (
                <div className="description">
                  <p>{property.description}</p>
                  <button className="read-more">Leer más</button>
                </div>
              )}
              
              {activeTab === 'amenities' && <AmenityList amenities={property.amenities} />}
              
              {activeTab === 'reviews' && <ReviewSection reviews={property.reviews} />}
              
              {activeTab === 'location' && (
                <div className="location-section">
                  <div className="map-placeholder">
                    Mapa interactivo aquí
                  </div>
                  <div className="location-details">
                    <h3>Ubicación exacta después de la reserva</h3>
                    <p>{property.locationDetails}</p>
                    <div className="nearby-places">
                      <h4>Lugares cercanos</h4>
                      <ul>
                        <li>Centro comercial: 500m</li>
                        <li>Estación de metro: 300m</li>
                        <li>Parque: 800m</li>
                        <li>Supermercado: 200m</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="sidebar">
            <BookingWidget property={property} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;