import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Star, MapPin, Users, Bed, Bath, Home, 
  Calendar, ArrowLeft, Share, Heart, 
  Wifi, Kitchen, Car, Snowflake, Tv,
  Coffee, Dumbbell, Pool, Dog, Key
} from 'lucide-react';
import './PropertyDetail.css';

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showAllAmenities, setShowAllAmenities] = useState(false);

  // Datos mock para la propiedad
  const mockProperty = {
    id: 1,
    title: "Habitación 203 cerca al centro",
    type: "Habitación en San Antonio, Colombia",
    beds: "1 cama",
    bathroom: "Baño compartido",
    rating: 4.9,
    reviews: 58,
    host: {
      name: "Yita",
      joined: "2020",
      superhost: true,
      description: "Sucesor fábrica - 2 años anfriconcio",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
      responseRate: "100%",
      responseTime: "en menos de 1 hora"
    },
    description: "A las huéspedes recibirán las encantas de buen comienzo de esta estadía.",
    space: "Temporal habilitación en su desarrollo, más acceso a resocios compatibles.",
    cancellation: "Conocimiento gratuito antes de las 2500m del área: Si cambias de cambio, recibidas en tiempo solo total.",
    price: 37,
    currency: "USD",
    nights: 2,
    images: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
    ],
    amenities: [
      { name: "WiFi", icon: <Wifi size={20} /> },
      { name: "Cocina equipada", icon: <Kitchen size={20} /> },
      { name: "Estacionamiento gratuito", icon: <Car size={20} /> },
      { name: "Aire acondicionado", icon: <Snowflake size={20} /> },
      { name: "TV por cable", icon: <Tv size={20} /> },
      { name: "Cafetera", icon: <Coffee size={20} /> },
      { name: "Gimnasio", icon: <Dumbbell size={20} /> },
      { name: "Piscina", icon: <Pool size={20} /> },
      { name: "Mascotas permitidas", icon: <Dog size={20} /> },
      { name: "Check-in automático", icon: <Key size={20} /> }
    ],
    total: 74, // price * nights
    cleaningFee: 10,
    serviceFee: 5,
    taxes: 7
  };

  useEffect(() => {
    const fetchProperty = async () => {
      setLoading(true);
      try {
        // Simular una llamada a la API
        await new Promise(resolve => setTimeout(resolve, 1000));
        setProperty(mockProperty);
      } catch (err) {
        setError("Error al cargar la propiedad");
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === property.images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? property.images.length - 1 : prevIndex - 1
    );
  };

  const handleBookNow = () => {
    // Lógica para reservar
    alert('¡Funcionalidad de reserva próximamente!');
  };

  if (loading) return (
    <div className="property-detail-loading">
      <div className="loading-spinner"></div>
      <p>Cargando propiedad...</p>
    </div>
  );
  
  if (error) return <div className="property-detail-error">{error}</div>;
  if (!property) return <div className="property-detail-error">Propiedad no encontrada</div>;

  return (
    <div className="property-detail">
      {/* Header con botón de volver y acciones */}
      <header className="property-header">
        <button onClick={() => navigate(-1)} className="back-button">
          <ArrowLeft size={24} />
        </button>
        <div className="header-actions">
          <button className="action-button">
            <Share size={20} />
          </button>
          <button className="action-button">
            <Heart size={20} />
          </button>
        </div>
      </header>

      {/* Carrusel de imágenes */}
      <div className="image-carousel">
        <button onClick={prevImage} className="carousel-button left">‹</button>
        <img src={property.images[currentImageIndex]} alt={property.title} />
        <button onClick={nextImage} className="carousel-button right">›</button>
        <div className="image-counter">
          {currentImageIndex + 1} / {property.images.length}
        </div>
        <div className="image-dots">
          {property.images.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === currentImageIndex ? 'active' : ''}`}
              onClick={() => setCurrentImageIndex(index)}
            />
          ))}
        </div>
      </div>

      {/* Información principal */}
      <div className="property-content">
        <div className="property-info">
          <div className="property-header-info">
            <h1>{property.title}</h1>
            <div className="property-meta">
              <div className="rating">
                <Star size={16} fill="currentColor" />
                <span><strong>{property.rating}</strong></span>
                <span className="reviews">({property.reviews} reseñas)</span>
              </div>
              <div className="location">
                <MapPin size={16} />
                <span>{property.type}</span>
              </div>
            </div>
          </div>

          <div className="property-features">
            <div className="feature">
              <Users size={20} />
              <span>2 huéspedes</span>
            </div>
            <div className="feature">
              <Bed size={20} />
              <span>{property.beds}</span>
            </div>
            <div className="feature">
              <Bath size={20} />
              <span>{property.bathroom}</span>
            </div>
          </div>

          <hr />

          {/* Sección del anfitrión */}
          <div className="host-section">
            <img src={property.host.avatar} alt="Anfitrión" className="host-avatar" />
            <div className="host-info">
              <h2>Anfitrión: {property.host.name}</h2>
              {property.host.superhost && <span className="superhost-badge">Superanfitrión</span>}
              <div className="host-stats">
                <div className="stat">
                  <strong>{property.host.responseRate}</strong> de porcentaje de respuesta
                </div>
                <div className="stat">
                  <strong>{property.host.responseTime}</strong> de tiempo de respuesta
                </div>
              </div>
              <p className="host-description">{property.host.description}</p>
            </div>
          </div>

          <hr />

          {/* Descripción */}
          <div className="description-section">
            <h3>Descripción</h3>
            <p>{property.description}</p>
          </div>

          <div className="space-section">
            <h3>El espacio</h3>
            <p>{property.space}</p>
          </div>

          {/* Servicios */}
          <div className="amenities-section">
            <h3>¿Qué ofrece este lugar?</h3>
            <div className="amenities-grid">
              {property.amenities.slice(0, showAllAmenities ? property.amenities.length : 6).map((amenity, index) => (
                <div key={index} className="amenity-item">
                  {amenity.icon}
                  <span>{amenity.name}</span>
                </div>
              ))}
            </div>
            {property.amenities.length > 6 && (
              <button 
                className="show-more-amenities"
                onClick={() => setShowAllAmenities(!showAllAmenities)}
              >
                {showAllAmenities ? 'Mostrar menos' : `Mostrar los ${property.amenities.length - 6} servicios más`}
              </button>
            )}
          </div>

          <hr />

          {/* Política de cancelación */}
          <div className="cancellation-section">
            <h3>Política de cancelación</h3>
            <p>{property.cancellation}</p>
            <button className="cancellation-details">Ver detalles de cancelación</button>
          </div>
        </div>

        {/* Widget de reserva */}
        <div className="booking-widget">
          <div className="price-box">
            <div className="price-header">
              <span className="price">${property.price} <span className="currency">{property.currency}</span></span>
              <span className="per-night">por noche</span>
            </div>
            
            <div className="date-selection">
              <div className="date-input">
                <label>Llegada</label>
                <div className="date-field">
                  <Calendar size={16} />
                  <span>1 oct. 2025</span>
                </div>
              </div>
              <div className="date-input">
                <label>Salida</label>
                <div className="date-field">
                  <Calendar size={16} />
                  <span>3 oct. 2025</span>
                </div>
              </div>
            </div>
            
            <div className="guests-selection">
              <label>Huéspedes</label>
              <div className="guests-field">
                <Users size={16} />
                <span>2 huéspedes</span>
              </div>
            </div>
            
            <div className="price-breakdown">
              <div className="price-line">
                <span>${property.price} x {property.nights} noches</span>
                <span>${property.price * property.nights}</span>
              </div>
              <div className="price-line">
                <span>Tarifa de limpieza</span>
                <span>${property.cleaningFee}</span>
              </div>
              <div className="price-line">
                <span>Tarifa de servicio</span>
                <span>${property.serviceFee}</span>
              </div>
              <div className="price-line">
                <span>Impuestos</span>
                <span>${property.taxes}</span>
              </div>
              <div className="price-total">
                <span>Total</span>
                <span>${property.total + property.cleaningFee + property.serviceFee + property.taxes}</span>
              </div>
            </div>
            
            <button className="reserve-button" onClick={handleBookNow}>
              Reservar ahora
            </button>
            
            <p className="no-charge">No se cobrará nada por el momento</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;