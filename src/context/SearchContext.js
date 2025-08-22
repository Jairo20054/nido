import React, { createContext, useState, useContext, useEffect } from 'react';

const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
  const [location, setLocation] = useState('');
  const [dates, setDatesState] = useState({ checkIn: null, checkOut: null });
  const [guests, setGuests] = useState(1);
  const [results, setResults] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateDates = (checkIn, checkOut) => {
    if (checkIn && checkOut && new Date(checkOut) <= new Date(checkIn)) {
      setError('La fecha de salida debe ser posterior a la de entrada');
      return;
    }
    setDatesState({ checkIn, checkOut });
    setError(null);
  };

  useEffect(() => {
    const saved = localStorage.getItem('searchParams');
    if (saved) {
      try {
        const { loc, dates, guests: g } = JSON.parse(saved);
        setLocation(loc || '');
        setDatesState(dates || { checkIn: null, checkOut: null });
        setGuests(g || 1);
      } catch (error) {
        console.error('Error loading search params from localStorage:', error);
      }
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('searchParams', JSON.stringify({ 
        loc: location, 
        dates, 
        guests 
      }));
    } catch (error) {
      console.error('Error saving search params to localStorage:', error);
    }
  }, [location, dates, guests]);

  const value = {
    location,
    setLocation,
    dates,
    updateDates,
    guests,
    setGuests,
    results,
    setResults,
    isLoading,
    setLoading,
    error,
    setError
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch debe usarse dentro de SearchProvider');
  }
  return context;
};