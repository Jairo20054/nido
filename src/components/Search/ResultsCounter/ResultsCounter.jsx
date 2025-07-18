import React from 'react';
import './ResultsCounter.css';

const ResultsCounter = ({ count, loading, location }) => {
  if (loading) {
    return (
      <div className="results-counter loading">
        <span className="loading-dot">.</span>
        <span className="loading-dot">.</span>
        <span className="loading-dot">.</span>
      </div>
    );
  }

  if (!location) {
    return (
      <div className="results-counter">
        <p>Ingresa una ubicación para comenzar tu búsqueda</p>
      </div>
    );
  }

  return (
    <div className="results-counter">
      <p>
        <strong>{count}</strong> {count === 1 ? 'propiedad encontrada' : 'propiedades encontradas'} 
        {location && ' en '} <strong>{location}</strong>
      </p>
    </div>
  );
};

export default ResultsCounter;