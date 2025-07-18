import React from 'react';
import './GuestInfoForm.css';

const GuestInfoForm = ({ formData, onChange, onSubmit }) => {
  return (
    <div className="guest-form-container">
      <h2 className="form-title">Información del huésped</h2>
      
      <form onSubmit={onSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Nombre</label>
            <input 
              type="text" 
              name="firstName"
              value={formData.firstName} 
              onChange={onChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Apellido</label>
            <input 
              type="text" 
              name="lastName"
              value={formData.lastName} 
              onChange={onChange}
              required
            />
          </div>
        </div>
        
        <div className="form-group">
          <label>Correo Electrónico</label>
          <input 
            type="email" 
            name="email"
            value={formData.email} 
            onChange={onChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Teléfono</label>
          <input 
            type="tel" 
            name="phone"
            value={formData.phone} 
            onChange={onChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Notas Especiales (Opcional)</label>
          <textarea 
            name="specialRequests"
            value={formData.specialRequests} 
            onChange={onChange}
            rows="3"
            placeholder="Dietas especiales, requerimientos de acceso, etc."
          ></textarea>
        </div>
        
        <div className="form-actions">
          <button type="submit" className="submit-btn">
            Continuar al Pago
          </button>
        </div>
      </form>
    </div>
  );
};

export default GuestInfoForm;
