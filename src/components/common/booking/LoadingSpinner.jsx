import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ size = 'medium', color = 'primary', label = 'Cargando...' }) => {
  // Validar props para evitar errores
  const validSizes = ['small', 'medium', 'large'];
  const validColors = ['primary', 'secondary', 'success', 'danger', 'warning', 'info'];
  
  const spinnerSize = validSizes.includes(size) ? size : 'medium';
  const spinnerColor = validColors.includes(color) ? color : 'primary';

  return (
    <div 
      className={`loading-spinner ${spinnerSize} ${spinnerColor}`}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <span className="visually-hidden">{label}</span>
      <div className="spinner">
        <div className="cube1"></div>
        <div className="cube2"></div>
        <div className="cube3"></div>
        <div className="cube4"></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;