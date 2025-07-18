import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

const useFavorites = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFavorites = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    try {
      // Fetch favorites from API
      // For now, using mock data
      const mockFavorites = [
        {
          id: 1,
          name: "Villa Moderna en la Playa",
          location: "Cartagena, Colombia",
          price: 200,
          rating: 4.8,
          reviewCount: 125,
          image: "/images/properties/villa1.jpg"
        },
        // Add more mock favorites...
      ];

      setFavorites(mockFavorites);
    } catch (err) {
      setError("Error al cargar los favoritos");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addFavorite = async (propertyId) => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    try {
      // API call to add favorite
      // For now, just updating state
      const mockProperty = {
        id: propertyId,
        name: "Nueva Propiedad Favorita",
        location: "Ubicación",
        price: 150,
        rating: 4.5,
        reviewCount: 50,
        image: "/images/properties/default.jpg"
      };
      
      setFavorites(prev => [...prev, mockProperty]);
    } catch (err) {
      setError("Error al agregar a favoritos");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (propertyId) => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    try {
      // API call to remove favorite
      // For now, just updating state
      setFavorites(prev => prev.filter(fav => fav.id !== propertyId));
    } catch (err) {
      setError("Error al quitar de favoritos");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const isFavorite = (propertyId) => {
    return favorites.some(fav => fav.id === propertyId);
  };

  useEffect(() => {
    fetchFavorites();
  }, [user]);

  return {
    favorites,
    loading,
    error,
    addFavorite,
    removeFavorite,
    isFavorite,
    refreshFavorites: fetchFavorites
  };
};

export default useFavorites;
