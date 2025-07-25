// components/search/SearchBar.jsx
import React, { useState, useRef, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { format, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import "react-datepicker/dist/react-datepicker.css";
import './SearchBar.css';

const SearchBar = ({ onSearch, compact = false, initialData = {} }) => {
  const [activeField, setActiveField] = useState(null);
  const [searchData, setSearchData] = useState({
    location: initialData.location || '',
    checkIn: initialData.checkIn || null,
    checkOut: initialData.checkOut || null,
    guests: initialData.guests || {
      adults: 2,
      children: 0,
      babies: 0,
      pets: false
    }
  });
  
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef(null);

  // Sugerencias de ubicaciones populares
  const popularLocations = [
    { name: 'Centro, Bogotá', type: 'Barrio', country: 'Colombia' },
    { name: 'Zona Rosa, Bogotá', type: 'Barrio', country: 'Colombia' },
    { name: 'Chapinero, Bogotá', type: 'Barrio', country: 'Colombia' },
    { name: 'La Candelaria, Bogotá', type: 'Barrio', country: 'Colombia' },
    { name: 'Medellín', type: 'Ciudad', country: 'Colombia' },
    { name: 'Cartagena', type: 'Ciudad', country: 'Colombia' },
    { name: 'Cali', type: 'Ciudad', country: 'Colombia' },
    { name: 'Santa Marta', type: 'Ciudad', country: 'Colombia' }
  ];

  // Efecto para cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setActiveField(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Manejar búsqueda de ubicaciones
  const handleLocationSearch = (value) => {
    setSearchData(prev => ({ ...prev, location: value }));
    
    if (value.length > 2) {
      const filtered = popularLocations.filter(location =>
        location.name.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  // Seleccionar sugerencia
  const selectSuggestion = (suggestion) => {
    setSearchData(prev => ({ ...prev, location: suggestion.name }));
    setSuggestions([]);
    setActiveField(null);
  };

  // Manejar cambio de fechas
  const handleDateChange = (date, type) => {
    setSearchData(prev => {
      const newData = { ...prev, [type]: date };
      
      // Auto-ajustar checkout si es menor que checkin
      if (type === 'checkIn' && prev.checkOut && date >= prev.checkOut) {
        newData.checkOut = addDays(date, 1);
      }
      
      return newData;
    });
  };

  // Manejar cambio de huéspedes
  const updateGuests = (type, operation) => {
    setSearchData(prev => ({
      ...prev,
      guests: {
        ...prev.guests,
        [type]: operation === 'increment' 
          ? prev.guests[type] + 1 
          : Math.max(0, prev.guests[type] - 1)
      }
    }));
  };

  // Calcular total de huéspedes
  const totalGuests = searchData.guests.adults + searchData.guests.children + searchData.guests.babies;

  // Manejar búsqueda
  const handleSearch = () => {
    if (!searchData.location.trim()) {
      alert('Por favor, ingresa una ubicación');
      return;
    }
    
    onSearch(searchData);
    setActiveField(null);
  };

  // Manejar Enter
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className={`search-bar ${compact ? 'search-bar--compact' : ''}`} ref={searchRef}>
      <div className="search-bar__container">
        
        {/* Campo de ubicación */}
        <div className={`search-field ${activeField === 'location' ? 'search-field--active' : ''}`}>
          <button
            className="search-field__button"
            onClick={() => setActiveField(activeField === 'location' ? null : 'location')}
          >
          
            <div className="search-field__value">
              {searchData.location || 'Buscar destinos'}
            </div>
          </button>
          
          {activeField === 'location' && (
            <div className="search-dropdown">
              <div className="search-input-container">
                <svg className="search-input-icon" width="16" height="16" viewBox="0 0 16 16">
                  <path d="M7 14A7 7 0 1 0 7 0a7 7 0 0 0 0 14ZM7 2a5 5 0 1 1 0 10A5 5 0 0 1 7 2Zm4.93 7.75L15 12.58l-.92.92-3.5-3.5a.5.5 0 0 1 .35-.25Z" fill="currentColor"/>
                </svg>
                <input
                  type="text"
                  placeholder="Busca por ciudad o barrio"
                  value={searchData.location}
                  onChange={(e) => handleLocationSearch(e.target.value)}
                  onKeyPress={handleKeyPress}
                  autoFocus
                />
              </div>
              
              <div className="search-suggestions">
                {suggestions.length > 0 ? (
                  suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      className="suggestion-item"
                      onClick={() => selectSuggestion(suggestion)}
                    >
                      <svg className="suggestion-icon" width="16" height="16" viewBox="0 0 16 16">
                        <path d="M8 0a6 6 0 0 0-6 6c0 4 6 10 6 10s6-6 6-10a6 6 0 0 0-6-6Zm0 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z" fill="currentColor"/>
                      </svg>
                      <div>
                        <div className="suggestion-name">{suggestion.name}</div>
                        <div className="suggestion-type">{suggestion.type}, {suggestion.country}</div>
                      </div>
                    </button>
                  ))
                ) : searchData.location.length > 2 ? (
                  <div className="no-suggestions">No se encontraron ubicaciones</div>
                ) : (
                  <div className="popular-destinations">
                   
                    {popularLocations.slice(0, 4).map((location, index) => (
                      <button
                        key={index}
                        className="suggestion-item"
                        onClick={() => selectSuggestion(location)}
                      >
                        <svg className="suggestion-icon" width="16" height="16" viewBox="0 0 16 16">
                          <path d="M8 0a6 6 0 0 0-6 6c0 4 6 10 6 10s6-6 6-10a6 6 0 0 0-6-6Zm0 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z" fill="currentColor"/>
                        </svg>
                        <div>
                          <div className="suggestion-name">{location.name}</div>
                          <div className="suggestion-type">{location.type}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Separador */}
        <div className="search-divider"></div>

        {/* Campo de fechas */}
        <div className={`search-field search-field--dates ${activeField === 'dates' ? 'search-field--active' : ''}`}>
          <button
            className="search-field__button"
            onClick={() => setActiveField(activeField === 'dates' ? null : 'dates')}
          >
            <div className="search-field__content">
              <div className="date-section">
                <div className="search-field__value">
                  {searchData.checkIn ? format(searchData.checkIn, 'dd MMM', { locale: es }) : 'Agregar fechas'}
                </div>
              </div>
              <div className="date-section">
                <div className="search-field__label">Salida</div>
                <div className="search-field__value">
                  {searchData.checkOut ? format(searchData.checkOut, 'dd MMM', { locale: es }) : 'Agregar fechas'}
                </div>
              </div>
            </div>
          </button>
          
          {activeField === 'dates' && (
            <div className="search-dropdown search-dropdown--dates">
              <div className="date-picker-container">
                <DatePicker
                  selected={searchData.checkIn}
                  onChange={(date) => handleDateChange(date, 'checkIn')}
                  startDate={searchData.checkIn}
                  endDate={searchData.checkOut}
                  selectsStart
                  minDate={new Date()}
                  monthsShown={2}
                  inline
                  locale={es}
                />
                <DatePicker
                  selected={searchData.checkOut}
                  onChange={(date) => handleDateChange(date, 'checkOut')}
                  startDate={searchData.checkIn}
                  endDate={searchData.checkOut}
                  selectsEnd
                  minDate={searchData.checkIn || new Date()}
                  monthsShown={2}
                  inline
                  locale={es}
                />
              </div>
            </div>
          )}
        </div>

        {/* Separador */}
        <div className="search-divider"></div>

        {/* Campo de huéspedes */}
        <div className={`search-field ${activeField === 'guests' ? 'search-field--active' : ''}`}>
          <button
            className="search-field__button"
            onClick={() => setActiveField(activeField === 'guests' ? null : 'guests')}
          >
            <div className="search-field__label">¿Quién?</div>
            <div className="search-field__value">
              {totalGuests > 0 ? `${totalGuests} huésped${totalGuests > 1 ? 'es' : ''}` : 'Agregar huéspedes'}
            </div>
          </button>
          
          {activeField === 'guests' && (
            <div className="search-dropdown">
              <div className="guests-selector">
                <div className="guest-type">
                  <div className="guest-info">
                    <div className="guest-title">Adultos</div>
                    <div className="guest-subtitle">13 años o más</div>
                  </div>
                  <div className="guest-controls">
                    <button
                      type="button"
                      className="guest-btn"
                      onClick={() => updateGuests('adults', 'decrement')}
                      disabled={searchData.guests.adults <= 1}
                    >
                      −
                    </button>
                    <span className="guest-count">{searchData.guests.adults}</span>
                    <button
                      type="button"
                      className="guest-btn"
                      onClick={() => updateGuests('adults', 'increment')}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="guest-type">
                  <div className="guest-info">
                    <div className="guest-title">Niños</div>
                    <div className="guest-subtitle">De 2 a 12 años</div>
                  </div>
                  <div className="guest-controls">
                    <button
                      type="button"
                      className="guest-btn"
                      onClick={() => updateGuests('children', 'decrement')}
                      disabled={searchData.guests.children <= 0}
                    >
                      −
                    </button>
                    <span className="guest-count">{searchData.guests.children}</span>
                    <button
                      type="button"
                      className="guest-btn"
                      onClick={() => updateGuests('children', 'increment')}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="guest-type">
                  <div className="guest-info">
                  </div>
                  <div className="guest-controls">
                    
                  </div>
                </div>

                <div className="guest-type">
                  <div className="guest-info">
                    <div className="guest-title">Mascotas</div>
                    <div className="guest-subtitle">¿Llevas una mascota de servicio?</div>
                  </div>
                  <div className="guest-controls">
                    <label className="pet-toggle">
                      <input
                        type="checkbox"
                        checked={searchData.guests.pets}
                        onChange={(e) => setSearchData(prev => ({
                          ...prev,
                          guests: { ...prev.guests, pets: e.target.checked }
                        }))}
                      />
                      <span className="pet-toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Botón de búsqueda */}
       
      </div>
    </div>
  );
};

export default SearchBar;


