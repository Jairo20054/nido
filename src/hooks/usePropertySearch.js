import { useState, useEffect } from 'react';

const usePropertySearch = (initialParams = {}) => {
  const [searchParams, setSearchParams] = useState(initialParams);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalResults, setTotalResults] = useState(0);

  const updateSearchParams = (newParams) => {
    setSearchParams(prev => ({
      ...prev,
      ...newParams
    }));
  };

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch properties from API with searchParams
        // For now, using mock data
        const mockProperties = [
          {
            id: 1,
            name: "Villa Moderna en la Playa",
            location: "Cartagena, Colombia",
            price: 200,
            rating: 4.8,
            reviewCount: 125,
            images: ["/images/properties/villa1.jpg"],
            bedrooms: 3,
            bathrooms: 2,
            maxGuests: 6,
            amenities: ["wifi", "pool", "ac"]
          },
          // Add more mock properties...
        ];

        setProperties(mockProperties);
        setTotalResults(mockProperties.length);
      } catch (err) {
        setError("Error al cargar las propiedades");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [searchParams]);

  return {
    properties,
    loading,
    error,
    totalResults,
    searchParams,
    updateSearchParams
  };
};

export default usePropertySearch;
