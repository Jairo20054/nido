import React, { useState, useEffect } from 'react';
import './DateSelector.css';

const DateSelector = ({ dates, onChange, onNext }) => {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({ start: false, end: false });

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  // Format date for display
  const formatDateForInput = (date) => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  // Validate dates
  const validateDates = (startDate, endDate) => {
    const newErrors = {};
    
    if (startDate) {
      const start = new Date(startDate);
      const todayDate = new Date(today);
      
      if (start < todayDate) {
        newErrors.start = 'La fecha de llegada no puede ser anterior a hoy';
      }
    }
    
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (end <= start) {
        newErrors.end = 'La fecha de salida debe ser posterior a la llegada';
      }
      
      // Check if stay is too long (optional validation)
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 365) {
        newErrors.end = 'La estancia no puede exceder 365 días';
      }
    }
    
    return newErrors;
  };

  // Update errors when dates change
  useEffect(() => {
    const newErrors = validateDates(
      dates.start ? formatDateForInput(dates.start) : null,
      dates.end ? formatDateForInput(dates.end) : null
    );
    setErrors(newErrors);
  }, [dates.start, dates.end]);

  const handleStartChange = (e) => {
    const value = e.target.value;
    setTouched(prev => ({ ...prev, start: true }));
    
    onChange({ 
      ...dates, 
      start: value ? new Date(value) : null 
    });
  };
  
  const handleEndChange = (e) => {
    const value = e.target.value;
    setTouched(prev => ({ ...prev, end: true }));
    
    onChange({ 
      ...dates, 
      end: value ? new Date(value) : null 
    });
  };

  const handleStartBlur = () => {
    setTouched(prev => ({ ...prev, start: true }));
  };

  const handleEndBlur = () => {
    setTouched(prev => ({ ...prev, end: true }));
  };
  
  const isComplete = dates.start && dates.end && Object.keys(errors).length === 0;
  
  // Calculate number of nights
  const calculateNights = () => {
    if (dates.start && dates.end) {
      const diffTime = Math.abs(dates.end - dates.start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    }
    return 0;
  };

  const nights = calculateNights();

  return (
    <div className="date-selector">
      <div className="header">
        <h2>Selecciona tus fechas</h2>
        <p>Agrega tus fechas de viaje para obtener el precio exacto</p>
      </div>
      
      <div className="date-inputs">
        <div className={`date-input ${errors.start && touched.start ? 'error' : ''} ${dates.start ? 'filled' : ''}`}>
          <label htmlFor="start-date">Llegada</label>
          <input 
            id="start-date"
            type="date" 
            value={formatDateForInput(dates.start)}
            onChange={handleStartChange}
            onBlur={handleStartBlur}
            min={today}
            aria-describedby={errors.start && touched.start ? "start-error" : undefined}
            aria-invalid={errors.start && touched.start ? "true" : "false"}
          />
          {errors.start && touched.start && (
            <span id="start-error" className="error-message" role="alert">
              {errors.start}
            </span>
          )}
        </div>
        
        <div className={`date-input ${errors.end && touched.end ? 'error' : ''} ${dates.end ? 'filled' : ''}`}>
          <label htmlFor="end-date">Salida</label>
          <input 
            id="end-date"
            type="date" 
            value={formatDateForInput(dates.end)}
            onChange={handleEndChange}
            onBlur={handleEndBlur}
            min={dates.start ? formatDateForInput(dates.start) : today}
            aria-describedby={errors.end && touched.end ? "end-error" : undefined}
            aria-invalid={errors.end && touched.end ? "true" : "false"}
          />
          {errors.end && touched.end && (
            <span id="end-error" className="error-message" role="alert">
              {errors.end}
            </span>
          )}
        </div>
      </div>

      {nights > 0 && (
        <div className="stay-summary">
          <div className="nights-info">
            <span className="nights-count">{nights}</span>
            <span className="nights-label">{nights === 1 ? 'noche' : 'noches'}</span>
          </div>
          <div className="date-range">
            {dates.start && dates.end && (
              <>
                <span>{dates.start.toLocaleDateString('es-ES', { 
                  weekday: 'short', 
                  day: 'numeric', 
                  month: 'short' 
                })}</span>
                <span className="arrow">→</span>
                <span>{dates.end.toLocaleDateString('es-ES', { 
                  weekday: 'short', 
                  day: 'numeric', 
                  month: 'short' 
                })}</span>
              </>
            )}
          </div>
        </div>
      )}
      
      <div className="calendar-placeholder">
        <div className="placeholder-content">
          <div className="calendar-icon">📅</div>
          <p>Vista de calendario próximamente</p>
          <small>Por ahora usa los campos de fecha arriba</small>
        </div>
      </div>
      
      <div className="actions">
        <button 
          type="button" 
          className="next-button"
          disabled={!isComplete}
          onClick={onNext}
          aria-label={isComplete ? 'Continuar con la reserva' : 'Selecciona fechas válidas para continuar'}
        >
          <span>Continuar</span>
          {isComplete && <span className="arrow-icon">→</span>}
        </button>
      </div>
    </div>
  );
};

export default DateSelector;