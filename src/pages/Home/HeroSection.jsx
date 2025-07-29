// src/components/Home/HeroSection/HeroSection.jsx
import React, { useState } from 'react';
import './HeroSection.css';

const HeroSection = ({ onSearch }) => {
  const [searchParams, setSearchParams] = useState({
    location: '',
    checkIn: '',
    checkOut: '',
    guests: 1
  });
  
  const [isExpanded, setIsExpanded] = useState(false);
  
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
  
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <section className="hero-section" aria-labelledby="hero-heading">
      <div className="hero-overlay">
        <div className="hero-content">
          <h1 id="hero-heading" className="hero-title">
            Encuentra tu lugar ideal, para todos los presupuestos
          </h1>
          <p className="hero-subtitle">
            Descubre alojamientos accesibles que se adaptan a tu bolsillo
          </p>
          
          <form onSubmit={handleSubmit} className="search-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="location" className="form-label">¿Dónde vas?</label>
                <div className="input-with-icon">
                  <span className="icon">📍</span>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={searchParams.location}
                    onChange={handleChange}
                    placeholder="Ciudad, barrio o dirección"
                    className="form-input"
                    aria-required="true"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="checkIn" className="form-label">Llegada</label>
                <div className="input-with-icon">
                  <span className="icon">📅</span>
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
                <label htmlFor="checkOut" className="form-label">Salida</label>
                <div className="input-with-icon">
                  <span className="icon">📅</span>
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
              
              <div className="form-group">
                <label htmlFor="guests" className="form-label">Huéspedes</label>
                <div className="input-with-icon">
                  <span className="icon">👥</span>
                  <select
                    id="guests"
                    name="guests"
                    value={searchParams.guests}
                    onChange={handleChange}
                    className="form-input"
                  >
                    {[1, 2, 3, 4, 5, 6].map(num => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? 'huésped' : 'huéspedes'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <button type="submit" className="search-button">
                Buscar
              </button>
            </div>
            
            <div className="form-expandable" aria-expanded={isExpanded}>
              <button 
                type="button" 
                className="expand-toggle"
                onClick={toggleExpand}
                aria-label={isExpanded ? "Ocultar filtros avanzados" : "Mostrar filtros avanzados"}
              >
                {isExpanded ? 'Menos opciones' : 'Más opciones'} 
                <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>▼</span>
              </button>
              
              {isExpanded && (
                <div className="advanced-filters">
                  <div className="filter-group">
                    <h3 className="filter-title">Presupuesto</h3>
                    <div className="price-range">
                      <div className="price-label">
                        <span>Mín: $20.000</span>
                        <span>Máx: $500.000+</span>
                      </div>
                      <input 
                        type="range" 
                        min="20000" 
                        max="500000" 
                        step="10000"
                        className="price-slider"
                        aria-label="Rango de precios"
                      />
                    </div>
                  </div>
                  
                  <div className="filter-group">
                    <h3 className="filter-title">Tipo de propiedad</h3>
                    <div className="filter-options">
                      {['Casa', 'Apartamento', 'Habitación', 'Loft', 'Cabaña'].map(type => (
                        <label key={type} className="filter-option">
                          <input type="checkbox" name="propertyType" value={type.toLowerCase()} />
                          <span className="checkmark"></span>
                          {type}
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div className="filter-group">
                    <h3 className="filter-title">Accesibilidad</h3>
                    <div className="filter-options">
                      {['Rampa acceso', 'Ascensor', 'Baño adaptado', 'Pasillos amplios'].map(acc => (
                        <label key={acc} className="filter-option">
                          <input type="checkbox" name="accessibility" value={acc.toLowerCase()} />
                          <span className="checkmark"></span>
                          {acc}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </form>
          
          
        </div>
      </div>
    </section>
  );
};

export default HeroSection;