import React, { useState } from 'react';
import { MapPin, Calendar, Users, Search, ChevronDown } from 'lucide-react';
import './HeroSection.css';

const HeroSection = ({ onSearch }) => {
  const [searchParams, setSearchParams] = useState({
    location: '',
    checkIn: '',
    checkOut: '',
    guests: 2
  });
  
  const [isLocationFocused, setIsLocationFocused] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchParams);
  };

  const popularDestinations = [
    "Cartagena", "Medellín", "Bogotá", "Santa Marta", "Cali", "San Andrés"
  ];

  return (
    <section className="hero-section" aria-labelledby="hero-heading">
      <div className="hero-overlay">
        <div className="hero-content">
          <h1 id="hero-heading" className="hero-title">
            Encuentra tu lugar ideal, para todos los presupuestos
          </h1>
          <p className="hero-subtitle">
            Descubre alojamientos únicos que se adaptan a tu estilo y bolsillo
          </p>
          
          <form onSubmit={handleSubmit} className="search-form">
            <div className="form-container">
              <div className="form-row">
                <div className="form-group location-group">
                  <label htmlFor="location" className="form-label">¿DÓNDE?</label>
                  <div className={`input-with-icon ${isLocationFocused ? 'focused' : ''}`}>
                    <MapPin size={20} className="icon" />
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={searchParams.location}
                      onChange={handleChange}
                      onFocus={() => setIsLocationFocused(true)}
                      onBlur={() => setIsLocationFocused(false)}
                      placeholder="Explora destinos"
                      className="form-input"
                      aria-required="true"
                    />
                    {!searchParams.location && (
                      <div className="suggestions">
                        {popularDestinations.map((dest, index) => (
                          <span key={index} className="suggestion-tag">{dest}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="date-group">
                  <div className="form-group">
                    <label htmlFor="checkIn" className="form-label">LLEGADA</label>
                    <div className="input-with-icon">
                      <Calendar size={20} className="icon" />
                      <input
                        type="date"
                        id="checkIn"
                        name="checkIn"
                        value={searchParams.checkIn}
                        onChange={handleChange}
                        className="form-input"
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="checkOut" className="form-label">SALIDA</label>
                    <div className="input-with-icon">
                      <Calendar size={20} className="icon" />
                      <input
                        type="date"
                        id="checkOut"
                        name="checkOut"
                        value={searchParams.checkOut}
                        onChange={handleChange}
                        className="form-input"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="form-group guests-group">
                  <label htmlFor="guests" className="form-label">HUÉSPEDES</label>
                  <div className="input-with-icon">
                    <Users size={20} className="icon" />
                    <select
                      id="guests"
                      name="guests"
                      value={searchParams.guests}
                      onChange={handleChange}
                      className="form-input"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                        <option key={num} value={num}>
                          {num} {num === 1 ? 'huésped' : 'huéspedes'}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="dropdown-icon" />
                  </div>
                </div>
                
                <button type="submit" className="search-button">
                  <div className="button-content">
                    <Search size={22} className="search-icon" />
                    <span>Buscar</span>
                  </div>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;