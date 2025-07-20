import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import HeroSection from '../../pages/Home/HeroSection';
import CategorySection from '../../pages/Home/CategorySection';
import PropertyGrid from '../../components/property/PropertyGrid/PropertyGrid';
import LoadingSpinner from '../../components/common/LoadingSpinner/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage/ErrorMessage';

const Home = () => {
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Datos mock para propiedades destacadas
  const mockFeaturedProperties = [
    {
      id: 1,
      title: "Apartamento Moderno en Zona Rosa",
      location: "Zona Rosa, Bogotá",
      price: 150000,
      rating: 4.8,
      images: ["/api/placeholder/300/200"],
      amenities: ["WiFi", "Cocina", "Accesible"],
      type: "apartment"
    },
    {
      id: 2,
      title: "Casa Familiar en Chapinero",
      location: "Chapinero, Bogotá",
      price: 280000,
      rating: 4.9,
      images: ["/api/placeholder/300/200"],
      amenities: ["WiFi", "Jardín", "Parking", "Accesible"],
      type: "house"
    },
    {
      id: 3,
      title: "Loft Contemporáneo La Candelaria",
      location: "La Candelaria, Bogotá",
      price: 120000,
      rating: 4.7,
      images: ["/api/placeholder/300/200"],
      amenities: ["WiFi", "Vista panorámica", "Accesible"],
      type: "loft"
    }
  ];

  const valuePropositions = [
    {
      id: 1,
      icon: "💸",
      title: "Precios Accesibles",
      description: "Opciones para todos los presupuestos, desde económicas hasta premium con transparencia total en costos"
    },
    {
      id: 2,
      icon: "♿",
      title: "Accesibilidad Total",
      description: "Filtros especializados y propiedades verificadas para personas con necesidades de movilidad reducida"
    },
    {
      id: 3,
      icon: "🔒",
      title: "Reservas Seguras",
      description: "Sistema de verificación robusto, pagos protegidos y soporte 24/7 para tu tranquilidad"
    }
  ];

  const fetchFeaturedProperties = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setFeaturedProperties(mockFeaturedProperties);
    } catch (err) {
      console.error("Error fetching featured properties:", err);
      setError("No pudimos cargar las propiedades destacadas. Intenta de nuevo más tarde.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeaturedProperties();
  }, [fetchFeaturedProperties]);

  // Función modificada para usar estado de navegación
  const handleSearch = useCallback((searchParams) => {
    navigate('/search', { 
      state: { searchParams }  // Pasamos parámetros como estado de navegación
    });
  }, [navigate]);

  const handleRetry = useCallback(() => {
    fetchFeaturedProperties();
  }, [fetchFeaturedProperties]);

  if (error) {
    return (
      <div className="home-page">
        <HeroSection onSearch={handleSearch} />
        <ErrorMessage 
          message={error} 
          onRetry={handleRetry}
          className="home-error"
        />
      </div>
    );
  }

  return (
    <div className="home-page">
      <HeroSection onSearch={handleSearch} />
      
      <section className="featured-section" aria-labelledby="featured-title">
        <h2 id="featured-title" className="section-title">
          Propiedades Destacadas
        </h2>
        <p className="section-subtitle">
          Descubre los alojamientos más populares y mejor valorados
        </p>
        
        {loading ? (
          <div className="loading-container">
            <LoadingSpinner />
            <p className="loading-text">Cargando propiedades destacadas...</p>
          </div>
        ) : (
          <>
            <PropertyGrid 
              properties={featuredProperties} 
              className="featured-grid"
            />
            {featuredProperties.length === 0 && (
              <div className="empty-state">
                <p>No hay propiedades destacadas disponibles en este momento.</p>
              </div>
            )}
          </>
        )}
      </section>
      
      <CategorySection />
      
      <section className="value-proposition" aria-labelledby="value-title">
        <div className="value-header">
          <h2 id="value-title" className="section-title">
            ¿Por qué elegirnos?
          </h2>
          <p className="section-subtitle">
            Comprometidos con hacer tus viajes más accesibles y seguros
          </p>
        </div>
        
        <div className="value-grid">
          {valuePropositions.map((item) => (
            <article key={item.id} className="value-card">
              <div className="value-icon" role="img" aria-label={item.title}>
                {item.icon}
              </div>
              <h3 className="value-title">{item.title}</h3>
              <p className="value-description">{item.description}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;