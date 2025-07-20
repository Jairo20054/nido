import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PropertyGallery from '../../components/property/PropertyGallery/PropertyGallery';
import PropertyInfo from '../../components/property/PropertyInfo/PropertyInfo';
import PropertyAmenities from '../../components/property/PropertyAmenities/PropertyAmenities';
import PropertyLocation from '../../components/property/PropertyLocation/PropertyLocation';
import PropertyReviews from '../../components/property/PropertyReviews/PropertyReviews';
import BookingWidget from '../../components/booking/BookingWidget';
import HostInfo from '../../components/property/HostInfo/HostInfo';
import SimilarProperties from '../../components/property/SimilarProperties/SimilarProperties';
import LoadingSpinner from '../../components/common/LoadingSpinner/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState/ErrorState';
import { api } from '../../utils/api';
import './Property.css';

const Property = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Estados principales
  const [property, setProperty] = useState(null);
  const [similarProperties, setSimilarProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Función para manejar errores de forma más robusta
  const handleError = useCallback((error, context) => {
    console.error(`Error in ${context}:`, error);
    
    const errorMessages = {
      404: "La propiedad que buscas no existe.",
      403: "No tienes permisos para ver esta propiedad.",
      500: "Error del servidor. Inténtalo más tarde.",
      default: "No pudimos cargar la propiedad. Inténtalo de nuevo más tarde."
    };
    
    const status = error?.response?.status;
    const message = errorMessages[status] || errorMessages.default;
    
    setError(message);
  }, []);

  // Función para obtener la propiedad principal
  const fetchProperty = useCallback(async () => {
    if (!id) {
      setError("ID de propiedad inválido");
      setLoading(false);
      return;
    }

    try {
      const propertyData = await api.get(`/properties/${id}`);
      
      if (!propertyData) {
        throw new Error('Propiedad no encontrada');
      }
      
      setProperty(propertyData);
      setError(null);
    } catch (err) {
      handleError(err, 'fetchProperty');
    }
  }, [id, handleError]);

  // Función para obtener propiedades similares
  const fetchSimilarProperties = useCallback(async () => {
    try {
      const similar = await api.get(`/properties/similar/${id}`);
      setSimilarProperties(Array.isArray(similar) ? similar : []);
    } catch (err) {
      console.warn('Error fetching similar properties:', err);
      // No mostramos error para propiedades similares, solo las omitimos
      setSimilarProperties([]);
    }
  }, [id]);

  // Función principal de carga de datos
  const loadPropertyData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        fetchProperty(),
        fetchSimilarProperties()
      ]);
    } catch (err) {
      // Los errores ya se manejan en las funciones individuales
      console.error('Error loading property data:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchProperty, fetchSimilarProperties]);

  // Función de reintento
  const handleRetry = useCallback(() => {
    if (retryCount < 3) {
      setRetryCount(prev => prev + 1);
      loadPropertyData();
    } else {
      navigate('/properties');
    }
  }, [retryCount, loadPropertyData, navigate]);

  // Efecto principal
  useEffect(() => {
    loadPropertyData();
  }, [loadPropertyData]);

  // Función para scroll suave a secciones
  const scrollToSection = useCallback((sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  }, []);

  // Estados de carga y error
  if (loading) {
    return <LoadingSpinner fullPage message="Cargando propiedad..." />;
  }

  if (error) {
    return (
      <ErrorState 
        message={error} 
        onRetry={retryCount < 3 ? handleRetry : null}
        retryText={retryCount < 3 ? "Reintentar" : "Volver a propiedades"}
      />
    );
  }

  if (!property) {
    return (
      <ErrorState 
        message="Propiedad no encontrada" 
        onRetry={() => navigate('/properties')}
        retryText="Volver a propiedades"
      />
    );
  }

  return (
    <div className="property-page">
      {/* Navegación interna (opcional) */}
      <PropertyNavigation onNavigate={scrollToSection} />
      
      <div className="property-main">
        {/* Galería de imágenes */}
        <section className="property-gallery-section">
          <PropertyGallery 
            images={property.images} 
            title={property.title}
            propertyId={property.id}
          />
        </section>
        
        {/* Contenido principal */}
        <div className="property-details">
          <div className="property-content">
            {/* Información básica */}
            <section id="info" className="property-section">
              <PropertyInfo property={property} />
            </section>
            
            <div className="divider" />
            
            {/* Información del anfitrión */}
            <section id="host" className="property-section">
              <HostInfo host={property.host} />
            </section>
            
            <div className="divider" />
            
            {/* Servicios */}
            <section id="amenities" className="property-section">
              <PropertyAmenities amenities={property.amenities} />
            </section>
            
            <div className="divider" />
            
            {/* Descripción */}
            <section id="description" className="property-section">
              <PropertyDescription description={property.description} />
            </section>
            
            <div className="divider" />
            
            {/* Ubicación */}
            <section id="location" className="property-section">
              <PropertyLocation location={property.location} />
            </section>
            
            <div className="divider" />
            
            {/* Reseñas */}
            <section id="reviews" className="property-section">
              <PropertyReviews 
                reviews={property.reviews} 
                rating={property.rating}
                totalReviews={property.totalReviews}
              />
            </section>
          </div>
          
          {/* Widget de reserva */}
          <div className="booking-widget-container">
            <BookingWidget 
              property={property} 
              onBookingChange={(booking) => console.log('Booking updated:', booking)}
            />
          </div>
        </div>
      </div>
      
      {/* Propiedades similares */}
      {similarProperties.length > 0 && (
        <section className="similar-properties-section">
          <SimilarProperties 
            properties={similarProperties}
            currentPropertyId={property.id}
          />
        </section>
      )}
    </div>
  );
};

// Componente de navegación interna
const PropertyNavigation = ({ onNavigate }) => (
  <nav className="property-navigation" aria-label="Navegación de la propiedad">
    <div className="nav-items">
      <button 
        onClick={() => onNavigate('info')}
        className="nav-item"
        type="button"
      >
        Información
      </button>
      <button 
        onClick={() => onNavigate('amenities')}
        className="nav-item"
        type="button"
      >
        Servicios
      </button>
      <button 
        onClick={() => onNavigate('location')}
        className="nav-item"
        type="button"
      >
        Ubicación
      </button>
      <button 
        onClick={() => onNavigate('reviews')}
        className="nav-item"
        type="button"
      >
        Reseñas
      </button>
    </div>
  </nav>
);

// Componente de descripción mejorado
const PropertyDescription = ({ description }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!description) {
    return null;
  }

  const paragraphs = description.split('\n').filter(p => p.trim());
  const shouldTruncate = paragraphs.length > 3;
  const displayParagraphs = isExpanded ? paragraphs : paragraphs.slice(0, 3);

  return (
    <div className="property-description">
      <h2>Descripción</h2>
      <div className="description-content">
        {displayParagraphs.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
        
        {shouldTruncate && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="description-toggle"
            type="button"
            aria-expanded={isExpanded}
          >
            {isExpanded ? 'Mostrar menos' : 'Mostrar más'}
          </button>
        )}
      </div>
    </div>
  );
};

export default Property;