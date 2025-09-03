import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import HeroSection from './HeroSection';
import CategorySection from './CategorySection';
import PropertyGrid from '../../components/property/PropertyGrid/PropertyGrid';
import LoadingSpinner from '../../components/common/LoadingSpinner/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage/ErrorMessage';
import Footer from '../../components/common/Footer/Footer';

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
      images: ["https://apartamento-bogota-zona-rosa.bogota-hotels-co.net/data/Photos/OriginalPhoto/1820/182016/182016102.JPEG"],
      amenities: ["WiFi", "Cocina", "Accesible"],
      type: "apartment"
    },
    {
      id: 2,
      title: "Casa Familiar en Chapinero",
      location: "Chapinero, Bogotá",
      price: 280000,
      rating: 4.9,
      images: ["https://a0.muscache.com/im/pictures/cacd930a-dd65-4c56-95de-032d4e162ebb.jpg"],
      amenities: ["WiFi", "Jardín", "Parking", "Accesible"],
      type: "house"
    },
    {
      id: 3,
      title: "Loft Contemporáneo La Candelaria",
      location: "La Candelaria, Bogotá",
      price: 120000,
      rating: 4.7,
      images: ["https://cf.bstatic.com/xdata/images/hotel/max1024x768/540297069.jpg?k=43a388f82614e8438d0bbacba5249fc9e642c73322b2e2da3141580848bd4968&o=&hp=1"],
      amenities: ["WiFi", "Vista panorámica", "Accesible"],
      type: "loft"
    },
    {
      id: 4,
      title: "Apartamento Moderno en Zona Rosa",
      location: "Zona Rosa, Bogotá",
      price: 150000,
      rating: 4.8,
      images: ["https://apartamento-bogota-zona-rosa.bogota-hotels-co.net/data/Photos/OriginalPhoto/1820/182016/182016102.JPEG"],
      amenities: ["WiFi", "Cocina", "Accesible"],
      type: "apartment"
    },
    {
      id: 5,
      title: "Casa Familiar en Chapinero",
      location: "Chapinero, Bogotá",
      price: 280000,
      rating: 4.9,
      images: ["https://a0.muscache.com/im/pictures/cacd930a-dd65-4c56-95de-032d4e162ebb.jpg"],
      amenities: ["WiFi", "Jardín", "Parking", "Accesible"],
      type: "house"
    },
    {
      id: 6,
      title: "Loft Contemporáneo La Candelaria",
      location: "La Candelaria, Bogotá",
      price: 120000,
      rating: 4.7,
      images: ["https://cf.bstatic.com/xdata/images/hotel/max1024x768/540297069.jpg?k=43a388f82614e8438d0bbacba5249fc9e642c73322b2e2da3141580848bd4968&o=&hp=1"],
      amenities: ["WiFi", "Vista panorámica", "Accesible"],
      type: "loft"
    },
    {
      id: 7,
      title: "Casa Familiar en Chapinero",
      location: "Chapinero, Bogotá",
      price: 280000,
      rating: 4.9,
      images: ["https://a0.muscache.com/im/pictures/cacd930a-dd65-4c56-95de-032d4e162ebb.jpg"],
      amenities: ["WiFi", "Jardín", "Parking", "Accesible"],
      type: "house"
    },
    {
      id: 8,
      title: "Loft Contemporáneo La Candelaria",
      location: "La Candelaria, Bogotá",
      price: 120000,
      rating: 4.7,
      images: ["https://cf.bstatic.com/xdata/images/hotel/max1024x768/540297069.jpg?k=43a388f82614e8438d0bbacba5249fc9e642c73322b2e2da3141580848bd4968&o=&hp=1"],
      amenities: ["WiFi", "Vista panorámica", "Accesible"],
      type: "loft"
    },
    {
      id: 9,
      title: "Loft Contemporáneo La Candelaria",
      location: "La Candelaria, Bogotá",
      price: 120000,
      rating: 4.7,
      images: ["https://cf.bstatic.com/xdata/images/hotel/max1024x768/540297069.jpg?k=43a388f82614e8438d0bbacba5249fc9e642c73322b2e2da3141580848bd4968&o=&hp=1"],
      amenities: ["WiFi", "Vista panorámica", "Accesible"],
      type: "loft"
    },
    {
      id: 10,
      title: "Casa Familiar en Chapinero",
      location: "Chapinero, Bogotá",
      price: 280000,
      rating: 4.9,
      images: ["https://a0.muscache.com/im/pictures/cacd930a-dd65-4c56-95de-032d4e162ebb.jpg"],
      amenities: ["WiFi", "Jardín", "Parking", "Accesible"],
      type: "house"
    },
    {
      id: 11,
      title: "Loft Contemporáneo La Candelaria",
      location: "La Candelaria, Bogotá",
      price: 120000,
      rating: 4.7,
      images: ["https://cf.bstatic.com/xdata/images/hotel/max1024x768/540297069.jpg?k=43a388f82614e8438d0bbacba5249fc9e642c73322b2e2da3141580848bd4968&o=&hp=1"],
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

  // Función para construir URL de búsqueda
  const buildSearchUrl = useCallback((searchParams) => {
    const url = new URL('/search', window.location.origin);
    
    // Añadir solo parámetros válidos
    if (searchParams.location) url.searchParams.set('location', searchParams.location);
    if (searchParams.checkIn) url.searchParams.set('checkIn', searchParams.checkIn);
    if (searchParams.checkOut) url.searchParams.set('checkOut', searchParams.checkOut);
    if (searchParams.guests) url.searchParams.set('guests', searchParams.guests.toString());
    if (searchParams.minPrice) url.searchParams.set('minPrice', searchParams.minPrice.toString());
    if (searchParams.maxPrice) url.searchParams.set('maxPrice', searchParams.maxPrice.toString());
    if (searchParams.propertyType) url.searchParams.set('propertyType', searchParams.propertyType);
    if (searchParams.amenities && searchParams.amenities.length > 0) {
      url.searchParams.set('amenities', searchParams.amenities.join(','));
    }
    if (searchParams.accessibility) url.searchParams.set('accessibility', 'true');
    if (searchParams.rating) url.searchParams.set('rating', searchParams.rating.toString());
    if (searchParams.instantBook) url.searchParams.set('instantBook', 'true');
    
    return url.toString();
  }, []);

  // Función para manejar búsquedas - MODIFICADA para abrir nueva pestaña
  const handleSearch = useCallback((params) => {
    // Validar parámetros mínimos
    if (!params.location?.trim()) {
      alert('Por favor, ingresa una ubicación para buscar');
      return;
    }
    
    const searchUrl = buildSearchUrl(params);
    
    // Abrir nueva pestaña de forma segura
    if (typeof window !== 'undefined' && window.open) {
      window.open(searchUrl, '_blank', 'noopener,noreferrer');
    } else {
      // Fallback para entornos sin window.open (ej. testing)
      console.log('Search URL:', searchUrl);
    }
  }, [buildSearchUrl]);

  const handleRetry = useCallback(() => {
    fetchFeaturedProperties();
  }, [fetchFeaturedProperties]);

  // Nueva función para manejar click en card
  const handleCardClick = useCallback((property) => {
    navigate(`/property/${property.id}`);
  }, [navigate]);

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
        <h2 id="featured-title" className="section-title text-center">
          Propiedades Destacadas
        </h2>
        <p className="section-subtitle text-center">
          Descubre los alojamientos más populares y mejor valorados
        </p>
        
        {loading ? (
          <div className="loading-container flex flex-col items-center justify-center h-[60vh] text-center">
            <LoadingSpinner className="mb-4" />
            <p className="loading-text">Cargando propiedades destacadas...</p>
          </div>
        ) : (
          <>
            <PropertyGrid 
              properties={featuredProperties} 
              className="featured-grid"
              onCardClick={handleCardClick}
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
        {/* Contenido de value proposition */}
      </section>
      
      <Footer />
    </div>
  );
};

export default Home;