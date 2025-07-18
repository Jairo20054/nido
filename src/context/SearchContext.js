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
    if (new Date(checkOut) <= new Date(checkIn)) {
      setError('La fecha de salida debe ser posterior a la de entrada');
      return;
    }
    setDatesState({ checkIn, checkOut });
    setError(null);
  };

  useEffect(() => {
    const saved = localStorage.getItem('searchParams');
    if (saved) {
      const { loc, dates, guests: g } = JSON.parse(saved);
      setLocation(loc);
      setDatesState(dates);
      setGuests(g);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('searchParams', JSON.stringify({ loc: location, dates, guests }));
  }, [location, dates, guests]);

  return (
    <SearchContext.Provider value={{
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
    }}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error('useSearch debe usarse dentro de SearchProvider');
  return ctx;
};
