import React from 'react';
import { FaTh, FaMapMarkerAlt } from 'react-icons/fa';
import './ViewToggle.css';

const ViewToggle = ({ currentView, onViewChange, disabled }) => {
  return (
    <div className="view-toggle">
      <button
        className={`toggle-button ${currentView === 'grid' ? 'active' : ''}`}
        onClick={() => onViewChange('grid')}
        disabled={disabled}
        aria-label="Vista de cuadrícula"
        aria-pressed={currentView === 'grid'}
      >
        <FaTh className="toggle-icon" />
        <span>Cuadrícula</span>
      </button>
      
      <button
        className={`toggle-button ${currentView === 'map' ? 'active' : ''}`}
        onClick={() => onViewChange('map')}
        disabled={disabled}
        aria-label="Vista de mapa"
        aria-pressed={currentView === 'map'}
      >
        <FaMapMarkerAlt className="toggle-icon" />
        <span>Mapa</span>
      </button>
    </div>
  );
};
export default ViewToggle;