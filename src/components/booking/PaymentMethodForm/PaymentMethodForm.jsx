import React, { useState, useEffect } from 'react';
import './PaymentMethodForm.css';

const PaymentMethodForm = ({ onBack, onSubmit }) => {
  const [paymentMethod, setPaymentMethod] = useState('creditCard');
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: ''
  });
  const [errors, setErrors] = useState({});

  // Validar campos de tarjeta
  useEffect(() => {
    const newErrors = {};
    
    if (paymentMethod === 'creditCard') {
      if (!/^\d{16}$/.test(cardData.cardNumber.replace(/\s/g, ''))) {
        newErrors.cardNumber = 'Número de tarjeta inválido';
      }
      
      if (!cardData.cardName.trim()) {
        newErrors.cardName = 'Nombre requerido';
      }
      
      if (!/^\d{2}\/\d{2}$/.test(cardData.expiry)) {
        newErrors.expiry = 'Formato MM/AA requerido';
      }
      
      if (!/^\d{3,4}$/.test(cardData.cvv)) {
        newErrors.cvv = 'CVV inválido';
      }
    }
    
    setErrors(newErrors);
  }, [cardData, paymentMethod]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name in cardData) {
      // Formateo automático
      let formattedValue = value;
      
      if (name === 'cardNumber') {
        formattedValue = value
          .replace(/\D/g, '')
          .replace(/(.{4})/g, '$1 ')
          .trim()
          .slice(0, 19);
      }
      else if (name === 'expiry') {
        formattedValue = value
          .replace(/\D/g, '')
          .replace(/(\d{2})(\d{0,2})/, '$1/$2')
          .slice(0, 5);
      }
      else if (name === 'cvv') {
        formattedValue = value.replace(/\D/g, '').slice(0, 4);
      }
      
      setCardData(prev => ({ ...prev, [name]: formattedValue }));
    } else {
      setPaymentMethod(value);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validación final
    if (paymentMethod === 'creditCard' && Object.keys(errors).length > 0) {
      return;
    }
    
    // Llamada segura a onSubmit
    if (typeof onSubmit === 'function') {
      onSubmit({ 
        paymentMethod, 
        cardData: paymentMethod === 'creditCard' ? cardData : null 
      });
    }
  };

  // Manejo seguro de retroceso
  const handleBack = () => {
    if (typeof onBack === 'function') {
      onBack();
    }
  };

  return (
    <div className="payment-form-container">
      <h2 className="form-title">Método de Pago</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="payment-methods">
          {/* Opciones de pago... (igual que antes) */}
        </div>
        
        {paymentMethod === 'creditCard' && (
          <div className="card-details">
            <div className="form-group">
              <label>Número de Tarjeta</label>
              <input 
                type="text" 
                name="cardNumber"
                value={cardData.cardNumber} 
                onChange={handleChange}
                placeholder="1234 5678 9012 3456"
                required
                className={errors.cardNumber ? 'input-error' : ''}
              />
              {errors.cardNumber && (
                <div className="error-message">{errors.cardNumber}</div>
              )}
            </div>
            
            <div className="form-group">
              <label>Nombre en la Tarjeta</label>
              <input 
                type="text" 
                name="cardName"
                value={cardData.cardName} 
                onChange={handleChange}
                placeholder="JUAN PEREZ"
                required
                className={errors.cardName ? 'input-error' : ''}
              />
              {errors.cardName && (
                <div className="error-message">{errors.cardName}</div>
              )}
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Fecha de Expiración</label>
                <input 
                  type="text" 
                  name="expiry"
                  value={cardData.expiry} 
                  onChange={handleChange}
                  placeholder="MM/AA"
                  required
                  className={errors.expiry ? 'input-error' : ''}
                />
                {errors.expiry && (
                  <div className="error-message">{errors.expiry}</div>
                )}
              </div>
              
              <div className="form-group">
                <label>CVV</label>
                <input 
                  type="text" 
                  name="cvv"
                  value={cardData.cvv} 
                  onChange={handleChange}
                  placeholder="123"
                  required
                  className={errors.cvv ? 'input-error' : ''}
                />
                {errors.cvv && (
                  <div className="error-message">{errors.cvv}</div>
                )}
              </div>
            </div>
          </div>
        )}
        
        <div className="form-actions">
          <button 
            type="button" 
            className="back-btn" 
            onClick={handleBack}
          >
            Regresar
          </button>
          <button 
            type="submit" 
            className="submit-btn"
            disabled={paymentMethod === 'creditCard' && Object.keys(errors).length > 0}
          >
            Confirmar Reserva
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentMethodForm;