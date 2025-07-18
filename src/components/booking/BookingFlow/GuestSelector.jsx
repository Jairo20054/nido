import React, { useState, useEffect } from 'react';
import './GuestSelector.css';

const GuestSelector = ({ guests, maxGuests, onChange, onBack, onNext }) => {
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [animatingCounters, setAnimatingCounters] = useState({});

  // Guest type configurations
  const guestTypes = [
    {
      key: 'adults',
      title: 'Adultos',
      description: 'Mayores de 13 años',
      icon: '👤',
      minValue: 1,
      required: true
    },
    {
      key: 'children',
      title: 'Niños',
      description: 'De 2 a 12 años',
      icon: '🧒',
      minValue: 0,
      required: false
    },
    {
      key: 'infants',
      title: 'Bebés',
      description: 'Menores de 2 años',
      icon: '👶',
      minValue: 0,
      required: false,
      note: 'Los bebés no ocupan cama'
    },
    {
      key: 'pets',
      title: 'Mascotas',
      description: '¿Traerás un animal de servicio?',
      icon: '🐕',
      minValue: 0,
      required: false,
      note: 'Solo animales de servicio permitidos'
    }
  ];

  // Show notification
  const showNotification = (message, type = 'error') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  // Animate counter change
  const animateCounter = (type) => {
    setAnimatingCounters(prev => ({ ...prev, [type]: true }));
    setTimeout(() => {
      setAnimatingCounters(prev => ({ ...prev, [type]: false }));
    }, 200);
  };

  const updateGuests = (type, delta) => {
    const currentValue = guests[type];
    const newValue = currentValue + delta;
    const config = guestTypes.find(gt => gt.key === type);
    
    // Validate minimum values
    if (newValue < config.minValue) {
      if (config.required && newValue === 0) {
        showNotification('Se requiere al menos un adulto');
      }
      return;
    }
    
    // Calculate total guests (excluding pets for occupancy)
    const totalGuests = Object.entries({ ...guests, [type]: newValue })
      .filter(([key]) => key !== 'pets')
      .reduce((sum, [, val]) => sum + val, 0);
    
    // Validate maximum capacity
    if (totalGuests > maxGuests) {
      showNotification(`Este alojamiento permite un máximo de ${maxGuests} huéspedes`);
      return;
    }

    // Special validations
    if (type === 'infants' && newValue > guests.adults) {
      showNotification('No puede haber más bebés que adultos');
      return;
    }

    if (type === 'children' && newValue > 0 && guests.adults === 0) {
      showNotification('Los niños deben ir acompañados de adultos');
      return;
    }

    // Update guests and animate
    animateCounter(type);
    onChange({ ...guests, [type]: newValue });

    // Show success message for additions
    if (delta > 0) {
      const successMessages = {
        adults: 'Adulto agregado',
        children: 'Niño agregado',
        infants: 'Bebé agregado',
        pets: 'Mascota agregada'
      };
      showNotification(successMessages[type], 'success');
    }
  };
  
  // Calculate totals
  const totalGuests = Object.entries(guests)
    .filter(([key]) => key !== 'pets')
    .reduce((sum, [, val]) => sum + val, 0);
  
  const totalPets = guests.pets;
  const isComplete = guests.adults > 0;
  const remainingCapacity = maxGuests - totalGuests;

  // Generate summary text
  const getSummary = () => {
    const parts = [];
    if (guests.adults > 0) parts.push(`${guests.adults} adulto${guests.adults > 1 ? 's' : ''}`);
    if (guests.children > 0) parts.push(`${guests.children} niño${guests.children > 1 ? 's' : ''}`);
    if (guests.infants > 0) parts.push(`${guests.infants} bebé${guests.infants > 1 ? 's' : ''}`);
    if (guests.pets > 0) parts.push(`${guests.pets} mascota${guests.pets > 1 ? 's' : ''}`);
    
    return parts.length > 0 ? parts.join(', ') : 'Sin huéspedes';
  };

  return (
    <div className="guest-selector">
      {/* Notification */}
      {notification.show && (
        <div className={`notification ${notification.type}`} role="alert">
          <span className="notification-icon">
            {notification.type === 'success' ? '✅' : '⚠️'}
          </span>
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="header">
        <h2>¿Quiénes se hospedarán?</h2>
        <p>Este alojamiento permite un máximo de {maxGuests} huéspedes</p>
      </div>

      {/* Summary Card */}
      {totalGuests > 0 && (
        <div className="summary-card">
          <div className="summary-info">
            <h3>Resumen de huéspedes</h3>
            <p>{getSummary()}</p>
          </div>
          <div className="capacity-info">
            <div className="capacity-bar">
              <div 
                className="capacity-fill" 
                style={{ width: `${(totalGuests / maxGuests) * 100}%` }}
              ></div>
            </div>
            <span className="capacity-text">
              {totalGuests} de {maxGuests} huéspedes
            </span>
          </div>
        </div>
      )}
      
      {/* Guest Controls */}
      <div className="guest-controls">
        {guestTypes.map((guestType) => {
          const count = guests[guestType.key];
          const canDecrease = count > guestType.minValue;
          const canIncrease = guestType.key === 'pets' ? 
            true : 
            totalGuests < maxGuests;

          return (
            <div key={guestType.key} className="guest-type">
              <div className="guest-info">
                <div className="guest-icon">{guestType.icon}</div>
                <div className="guest-details">
                  <h3>{guestType.title}</h3>
                  <p>{guestType.description}</p>
                  {guestType.note && (
                    <small className="guest-note">{guestType.note}</small>
                  )}
                </div>
              </div>
              
              <div className="counter">
                <button 
                  className={`counter-btn decrease ${!canDecrease ? 'disabled' : ''}`}
                  onClick={() => updateGuests(guestType.key, -1)}
                  disabled={!canDecrease}
                  aria-label={`Disminuir ${guestType.title.toLowerCase()}`}
                >
                  <span>−</span>
                </button>
                
                <span 
                  className={`counter-value ${animatingCounters[guestType.key] ? 'animate' : ''}`}
                  aria-label={`${count} ${guestType.title.toLowerCase()}`}
                >
                  {count}
                </span>
                
                <button 
                  className={`counter-btn increase ${!canIncrease ? 'disabled' : ''}`}
                  onClick={() => updateGuests(guestType.key, 1)}
                  disabled={!canIncrease}
                  aria-label={`Aumentar ${guestType.title.toLowerCase()}`}
                >
                  <span>+</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h4>Configuraciones rápidas</h4>
        <div className="preset-buttons">
          <button 
            className="preset-btn"
            onClick={() => onChange({ adults: 1, children: 0, infants: 0, pets: 0 })}
          >
            <span className="preset-icon">👤</span>
            <span>Solo</span>
          </button>
          <button 
            className="preset-btn"
            onClick={() => onChange({ adults: 2, children: 0, infants: 0, pets: 0 })}
          >
            <span className="preset-icon">👫</span>
            <span>Pareja</span>
          </button>
          <button 
            className="preset-btn"
            onClick={() => onChange({ adults: 2, children: 2, infants: 0, pets: 0 })}
            disabled={maxGuests < 4}
          >
            <span className="preset-icon">👨‍👩‍👧‍👦</span>
            <span>Familia</span>
          </button>
        </div>
      </div>
      
      {/* Actions */}
      <div className="actions">
        <button 
          type="button" 
          className="back-button"
          onClick={onBack}
        >
          <span className="button-icon">←</span>
          <span>Atrás</span>
        </button>
        
        <button 
          type="button" 
          className="next-button"
          disabled={!isComplete}
          onClick={onNext}
          aria-label={isComplete ? 'Continuar con la reserva' : 'Selecciona al menos un adulto para continuar'}
        >
          <span>Continuar</span>
          {isComplete && <span className="button-icon">→</span>}
        </button>
      </div>
    </div>
  );
};

export default GuestSelector;