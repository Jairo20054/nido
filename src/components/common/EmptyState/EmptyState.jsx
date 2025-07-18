import React from 'react';
import { FaSearch, FaFrown } from 'react-icons/fa';
import './EmptyState.css';

const EmptyState = ({ 
  title = "No se encontraron resultados", 
  description = "Intenta ajustar tus criterios de búsqueda",
  actionLabel,
  onAction,
  variant = 'search'
}) => {
  const Icon = variant === 'error' ? FaFrown : FaSearch;
  
  return (
    <div className="empty-state">
      <div className={`empty-state-icon ${variant}`}>
        <Icon />
      </div>
      <h2 className="empty-state-title">{title}</h2>
      <p className="empty-state-description">{description}</p>
      {actionLabel && onAction && (
        <button 
          className="empty-state-action"
          onClick={onAction}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;