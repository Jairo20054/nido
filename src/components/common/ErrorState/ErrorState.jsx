import React from 'react';
import { FaExclamationTriangle, FaRedo } from 'react-icons/fa';
import './ErrorState.css';

const ErrorState = ({ 
  message = "Ocurrió un error inesperado", 
  onRetry,
  retryText = "Reintentar",
  className = '' 
}) => {
  return (
    <div className={`error-state ${className}`}>
      <div className="error-icon">
        <FaExclamationTriangle />
      </div>
      <h3 className="error-title">¡Algo salió mal!</h3>
      <p className="error-message">{message}</p>
      {onRetry && (
        <button 
          className="retry-button"
          onClick={onRetry}
        >
          <FaRedo className="retry-icon" />
          {retryText}
        </button>
      )}
    </div>
  );
};

export default ErrorState;
