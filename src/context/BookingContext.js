/* src/context/BookingContext.js */
import React, { 
  createContext, 
  useReducer, 
  useContext, 
  useEffect,
  useState
} from 'react';

// Definición de acciones
export const BOOKING_ACTIONS = {
  SET_PROPERTY: 'SET_PROPERTY',
  SET_DATES: 'SET_DATES',
  SET_GUESTS: 'SET_GUESTS',
  SET_TOTAL_PRICE: 'SET_TOTAL_PRICE',
  UPDATE: 'UPDATE',
  RESET: 'RESET',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR'
};

// Estado inicial
const initialBookingState = {
  property: null,
  dates: { checkIn: null, checkOut: null },
  guests: 1,
  totalPrice: 0,
  breakdown: { basePrice: 0, taxes: 0, fees: 0, discounts: 0 },
  isLoading: false,
  error: null,
  bookingId: null,
  status: 'draft'
};

// Reducer
const bookingReducer = (state, { type, payload }) => {
  switch (type) {
    case BOOKING_ACTIONS.SET_PROPERTY:
      return { ...state, property: payload, error: null };
    case BOOKING_ACTIONS.SET_DATES:
      const { checkIn, checkOut } = payload;
      if (new Date(checkOut) <= new Date(checkIn)) {
        return { ...state, error: 'La fecha de salida debe ser posterior a la de entrada' };
      }
      return { ...state, dates: { checkIn, checkOut }, error: null };
    case BOOKING_ACTIONS.SET_GUESTS:
      return { ...state, guests: Math.min(Math.max(payload, 1), 20), error: null };
    case BOOKING_ACTIONS.SET_TOTAL_PRICE:
      return { ...state, totalPrice: payload.totalPrice, breakdown: payload.breakdown, error: null };
    case BOOKING_ACTIONS.UPDATE:
      return { ...state, ...payload, error: null };
    case BOOKING_ACTIONS.RESET:
      return { ...initialBookingState };
    case BOOKING_ACTIONS.SET_LOADING:
      return { ...state, isLoading: payload };
    case BOOKING_ACTIONS.SET_ERROR:
      return { ...state, error: payload, isLoading: false };
    default:
      return state;
  }
};

// Crear el contexto de Booking (ahora exportado)
export const BookingContext = createContext();

// Provider de Booking
export const BookingProvider = ({ children }) => {
  const [state, dispatch] = useReducer(bookingReducer, initialBookingState);

  // Methods
  const setProperty = (prop) => dispatch({ type: BOOKING_ACTIONS.SET_PROPERTY, payload: prop });
  const setDates = (checkIn, checkOut) => dispatch({ type: BOOKING_ACTIONS.SET_DATES, payload: { checkIn, checkOut } });
  const setGuests = (num) => dispatch({ type: BOOKING_ACTIONS.SET_GUESTS, payload: num });
  const setTotalPrice = (totalPrice, breakdown) => dispatch({ 
    type: BOOKING_ACTIONS.SET_TOTAL_PRICE, 
    payload: { totalPrice, breakdown } 
  });
  const update = (data) => dispatch({ type: BOOKING_ACTIONS.UPDATE, payload: data });
  const reset = () => dispatch({ type: BOOKING_ACTIONS.RESET });
  const setLoading = (loading) => dispatch({ type: BOOKING_ACTIONS.SET_LOADING, payload: loading });
  const setError = (err) => dispatch({ type: BOOKING_ACTIONS.SET_ERROR, payload: err });

  // Cargar y guardar en localStorage
  useEffect(() => {
    const saved = localStorage.getItem('bookingData');
    if (saved) dispatch({ type: BOOKING_ACTIONS.UPDATE, payload: JSON.parse(saved) });
  }, []);

  useEffect(() => {
    localStorage.setItem('bookingData', JSON.stringify(state));
  }, [state]);

  // Helpers
  const getNights = () => {
    if (!state.dates.checkIn || !state.dates.checkOut) return 0;
    const diff = new Date(state.dates.checkOut) - new Date(state.dates.checkIn);
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };
  
  const isValid = () => Boolean(
    state.property && 
    state.dates.checkIn && 
    state.dates.checkOut && 
    !state.error
  );

  return (
    <BookingContext.Provider value={{ 
      ...state, 
      setProperty, 
      setDates, 
      setGuests, 
      setTotalPrice, 
      update, 
      reset, 
      setLoading, 
      setError, 
      getNights, 
      isValid 
    }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBooking debe usarse dentro de BookingProvider');
  return ctx;
};

/* Contexto de Búsqueda (ahora exportado) */
export const SearchContext = createContext();

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

  // Persistencia
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
    localStorage.setItem(
      'searchParams',
      JSON.stringify({ loc: location, dates, guests })
    );
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