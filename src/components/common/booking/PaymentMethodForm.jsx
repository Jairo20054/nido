import React, { useState } from 'react';
import './PaymentMethodForm.css';

const PaymentMethodForm = ({ onBack, onSubmit }) => {
  const [paymentMethod, setPaymentMethod] = useState('creditCard');
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name in cardData) {
      setCardData(prev => ({ ...prev, [name]: value }));
    } else {
      setPaymentMethod(value);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ paymentMethod, cardData });
  };

  return (
    <div className="payment-form-container">
      <h2 className="form-title">Método de Pago</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="payment-methods">
          <div className="payment-option">
            <input 
              type="radio" 
              id="creditCard" 
              name="paymentMethod" 
              value="creditCard" 
              checked={paymentMethod === 'creditCard'}
              onChange={handleChange}
            />
            <label htmlFor="creditCard">
              <div className="payment-icon">💳</div>
              Tarjeta de Crédito
            </label>
          </div>
          
          <div className="payment-option">
            <input 
              type="radio" 
              id="paypal" 
              name="paymentMethod" 
              value="paypal" 
              checked={paymentMethod === 'paypal'}
              onChange={handleChange}
            />
            <label htmlFor="paypal">
              <div className="payment-icon">🔵</div>
              PayPal
            </label>
          </div>
          
          <div className="payment-option">
            <input 
              type="radio" 
              id="transfer" 
              name="paymentMethod" 
              value="transfer" 
              checked={paymentMethod === 'transfer'}
              onChange={handleChange}
            />
            <label htmlFor="transfer">
              <div className="payment-icon">🏦</div>
              Transferencia Bancaria
            </label>
          </div>
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
              />
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
              />
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
                />
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
                />
              </div>
            </div>
          </div>
        )}
        
        <div className="form-actions">
          <button type="button" className="back-btn" onClick={onBack}>
            Regresar
          </button>
          <button type="submit" className="submit-btn">
            Confirmar Reserva
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentMethodForm;
