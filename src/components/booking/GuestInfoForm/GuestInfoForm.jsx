import React from 'react';
import './GuestInfoForm.css';

const GuestInfoForm = ({ formData, onChange, onSubmit }) => {
  // Crear un objeto seguro con valores predeterminados
  const safeFormData = formData || {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialRequests: ''
  };

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
              value={safeFormData.firstName} 
              onChange={onChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Apellido</label>
            <input 
              type="text" 
              name="lastName"
              value={safeFormData.lastName} 
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
            value={safeFormData.email} 
            onChange={onChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Teléfono</label>
            <input 
              type="tel" 
              name="phone"
              value={safeFormData.phone} 
              onChange={onChange}
              required
            />
        </div>
        
        <div className="form-group">
          <label>Notas Especiales (Opcional)</label>
          <textarea 
            name="specialRequests"
            value={safeFormData.specialRequests} 
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
