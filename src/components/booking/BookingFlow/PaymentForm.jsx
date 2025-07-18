import React, { useState, useCallback, useMemo } from 'react';
import './PaymentForm.css';

const PaymentForm = ({ payment, personalInfo, onChange, onPersonalInfoChange, onBack, onNext }) => {
  const [paymentMethod, setPaymentMethod] = useState(payment.method);
  const [errors, setErrors] = useState({});
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Validaciones
  const validatePersonalInfo = useCallback((info) => {
    const newErrors = {};
    
    if (!info.firstName?.trim()) {
      newErrors.firstName = 'El nombre es obligatorio';
    } else if (info.firstName.length < 2) {
      newErrors.firstName = 'El nombre debe tener al menos 2 caracteres';
    }
    
    if (!info.lastName?.trim()) {
      newErrors.lastName = 'El apellido es obligatorio';
    } else if (info.lastName.length < 2) {
      newErrors.lastName = 'El apellido debe tener al menos 2 caracteres';
    }
    
    if (!info.email?.trim()) {
      newErrors.email = 'El correo electrónico es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(info.email)) {
      newErrors.email = 'Ingresa un correo electrónico válido';
    }
    
    if (!info.phone?.trim()) {
      newErrors.phone = 'El teléfono es obligatorio';
    } else if (!/^\+?[\d\s\-()]{8,}$/.test(info.phone)) {
      newErrors.phone = 'Ingresa un número de teléfono válido';
    }
    
    return newErrors;
  }, []);

  const validateCardInfo = useCallback((card) => {
    const newErrors = {};
    
    if (!card.number) {
      newErrors.cardNumber = 'El número de tarjeta es obligatorio';
    } else if (card.number.length !== 16) {
      newErrors.cardNumber = 'El número de tarjeta debe tener 16 dígitos';
    } else if (!isValidCardNumber(card.number)) {
      newErrors.cardNumber = 'Número de tarjeta inválido';
    }
    
    if (!card.name?.trim()) {
      newErrors.cardName = 'El nombre en la tarjeta es obligatorio';
    }
    
    if (!card.expiry) {
      newErrors.cardExpiry = 'La fecha de expiración es obligatoria';
    } else if (!/^\d{2}\/\d{2}$/.test(card.expiry)) {
      newErrors.cardExpiry = 'Formato inválido (MM/AA)';
    } else if (!isValidExpiryDate(card.expiry)) {
      newErrors.cardExpiry = 'Fecha de expiración inválida';
    }
    
    if (!card.cvc) {
      newErrors.cardCvc = 'El CVC es obligatorio';
    } else if (card.cvc.length !== 3) {
      newErrors.cardCvc = 'El CVC debe tener 3 dígitos';
    }
    
    return newErrors;
  }, []);

  const validatePaypalInfo = useCallback((paypal) => {
    const newErrors = {};
    
    if (!paypal.email?.trim()) {
      newErrors.paypalEmail = 'El correo de PayPal es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(paypal.email)) {
      newErrors.paypalEmail = 'Ingresa un correo electrónico válido';
    }
    
    return newErrors;
  }, []);

  // Funciones de validación auxiliares
  const isValidCardNumber = (number) => {
    // Algoritmo de Luhn
    const digits = number.split('').map(Number).reverse();
    const sum = digits.reduce((acc, digit, index) => {
      if (index % 2 === 1) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      return acc + digit;
    }, 0);
    return sum % 10 === 0;
  };

  const isValidExpiryDate = (expiry) => {
    const [month, year] = expiry.split('/').map(Number);
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear() % 100;
    
    if (month < 1 || month > 12) return false;
    if (year < currentYear || (year === currentYear && month < currentMonth)) return false;
    
    return true;
  };

  const formatCardNumber = (value) => {
    const digits = value.replace(/\D/g, '');
    return digits.slice(0, 16);
  };

  const formatExpiryDate = (value) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length >= 3) {
      return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
    }
    return digits;
  };

  const getCardType = (number) => {
    const firstDigit = number.charAt(0);
    if (firstDigit === '4') return 'visa';
    if (firstDigit === '5') return 'mastercard';
    if (firstDigit === '3') return 'amex';
    return 'generic';
  };

  // Manejadores de eventos
  const handleMethodChange = useCallback((method) => {
    setPaymentMethod(method);
    onChange({ ...payment, method });
    setErrors(prev => {
      const newErrors = { ...prev };
      // Limpiar errores del método anterior
      Object.keys(newErrors).forEach(key => {
        if (key.startsWith('card') || key.startsWith('paypal')) {
          delete newErrors[key];
        }
      });
      return newErrors;
    });
  }, [payment, onChange]);

  const handleCardChange = useCallback((field, value) => {
    let processedValue = value;
    
    if (field === 'number') {
      processedValue = formatCardNumber(value);
    } else if (field === 'expiry') {
      processedValue = formatExpiryDate(value);
    } else if (field === 'cvc') {
      processedValue = value.replace(/\D/g, '').slice(0, 3);
    } else if (field === 'name') {
      processedValue = value.toUpperCase();
    }
    
    onChange({ 
      ...payment, 
      card: { ...payment.card, [field]: processedValue } 
    });

    // Validación en tiempo real
    if (field === 'number' && processedValue.length === 16) {
      setErrors(prev => {
        const newErrors = { ...prev };
        if (isValidCardNumber(processedValue)) {
          delete newErrors.cardNumber;
        } else {
          newErrors.cardNumber = 'Número de tarjeta inválido';
        }
        return newErrors;
      });
    }
  }, [payment, onChange]);

  const handlePaypalChange = useCallback((email) => {
    onChange({ 
      ...payment, 
      paypal: { ...payment.paypal, email } 
    });
  }, [payment, onChange]);

  const handlePersonalChange = useCallback((field, value) => {
    onPersonalInfoChange({ ...personalInfo, [field]: value });
    
    // Limpiar error específico cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [personalInfo, onPersonalInfoChange, errors]);

  // Validación completa del formulario
  const isFormValid = useMemo(() => {
    const personalErrors = validatePersonalInfo(personalInfo);
    let paymentErrors = {};

    if (paymentMethod === 'card') {
      paymentErrors = validateCardInfo(payment.card);
    } else if (paymentMethod === 'paypal') {
      paymentErrors = validatePaypalInfo(payment.paypal);
    }

    const hasErrors = Object.keys(personalErrors).length > 0 || 
                     Object.keys(paymentErrors).length > 0;
    
    return !hasErrors && termsAccepted;
  }, [personalInfo, payment, paymentMethod, termsAccepted, validatePersonalInfo, validateCardInfo, validatePaypalInfo]);

  const handleSubmit = async () => {
    // Validar todo el formulario
    const personalErrors = validatePersonalInfo(personalInfo);
    let paymentErrors = {};

    if (paymentMethod === 'card') {
      paymentErrors = validateCardInfo(payment.card);
    } else if (paymentMethod === 'paypal') {
      paymentErrors = validatePaypalInfo(payment.paypal);
    }

    const allErrors = { ...personalErrors, ...paymentErrors };

    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      return;
    }

    if (!termsAccepted) {
      setErrors(prev => ({ ...prev, terms: 'Debes aceptar los términos y condiciones' }));
      return;
    }

    setIsLoading(true);
    try {
      await onNext();
    } catch (error) {
      console.error('Error al procesar el pago:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="payment-form">
      <div className="payment-header">
        <h2>Completa tu reserva</h2>
        <p>Proporciona tus datos personales y elige un método de pago seguro</p>
      </div>
      
      <div className="personal-info section">
        <h3>
          <span className="section-icon">👤</span>
          Información personal
        </h3>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="firstName">Nombre *</label>
            <input 
              id="firstName"
              type="text" 
              value={personalInfo.firstName || ''}
              onChange={(e) => handlePersonalChange('firstName', e.target.value)}
              className={errors.firstName ? 'error' : ''}
              placeholder="Ingresa tu nombre"
              aria-describedby={errors.firstName ? 'firstName-error' : undefined}
            />
            {errors.firstName && (
              <span id="firstName-error" className="error-message" role="alert">
                {errors.firstName}
              </span>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="lastName">Apellido *</label>
            <input 
              id="lastName"
              type="text" 
              value={personalInfo.lastName || ''}
              onChange={(e) => handlePersonalChange('lastName', e.target.value)}
              className={errors.lastName ? 'error' : ''}
              placeholder="Ingresa tu apellido"
              aria-describedby={errors.lastName ? 'lastName-error' : undefined}
            />
            {errors.lastName && (
              <span id="lastName-error" className="error-message" role="alert">
                {errors.lastName}
              </span>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Correo electrónico *</label>
            <input 
              id="email"
              type="email" 
              value={personalInfo.email || ''}
              onChange={(e) => handlePersonalChange('email', e.target.value)}
              className={errors.email ? 'error' : ''}
              placeholder="ejemplo@correo.com"
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && (
              <span id="email-error" className="error-message" role="alert">
                {errors.email}
              </span>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="phone">Teléfono *</label>
            <input 
              id="phone"
              type="tel" 
              value={personalInfo.phone || ''}
              onChange={(e) => handlePersonalChange('phone', e.target.value)}
              className={errors.phone ? 'error' : ''}
              placeholder="+57 300 123 4567"
              aria-describedby={errors.phone ? 'phone-error' : undefined}
            />
            {errors.phone && (
              <span id="phone-error" className="error-message" role="alert">
                {errors.phone}
              </span>
            )}
          </div>
        </div>
      </div>
      
      <div className="payment-methods section">
        <h3>
          <span className="section-icon">💳</span>
          Método de pago
        </h3>
        <div className="method-options" role="radiogroup" aria-label="Selecciona método de pago">
          <button 
            type="button" 
            className={`method-option ${paymentMethod === 'card' ? 'active' : ''}`}
            onClick={() => handleMethodChange('card')}
            role="radio"
            aria-checked={paymentMethod === 'card'}
            aria-label="Pagar con tarjeta de crédito o débito"
          >
            <span className="method-icon">💳</span>
            <span>Tarjeta de crédito/débito</span>
          </button>
          <button 
            type="button" 
            className={`method-option ${paymentMethod === 'paypal' ? 'active' : ''}`}
            onClick={() => handleMethodChange('paypal')}
            role="radio"
            aria-checked={paymentMethod === 'paypal'}
            aria-label="Pagar con PayPal"
          >
            <span className="method-icon">🅿️</span>
            <span>PayPal</span>
          </button>
          <button 
            type="button" 
            className={`method-option ${paymentMethod === 'cash' ? 'active' : ''}`}
            onClick={() => handleMethodChange('cash')}
            role="radio"
            aria-checked={paymentMethod === 'cash'}
            aria-label="Pagar en efectivo al llegar"
          >
            <span className="method-icon">💵</span>
            <span>Efectivo al llegar</span>
          </button>
        </div>
        
        {paymentMethod === 'card' && (
          <div className="card-form payment-details">
            <div className="form-group">
              <label htmlFor="cardNumber">Número de tarjeta *</label>
              <div className="card-input-wrapper">
                <input 
                  id="cardNumber"
                  type="text" 
                  placeholder="1234 5678 9012 3456"
                  value={payment.card.number || ''}
                  onChange={(e) => handleCardChange('number', e.target.value)}
                  className={errors.cardNumber ? 'error' : ''}
                  maxLength="19"
                  aria-describedby={errors.cardNumber ? 'cardNumber-error' : undefined}
                />
                {payment.card.number && (
                  <span className={`card-type ${getCardType(payment.card.number)}`}></span>
                )}
              </div>
              {errors.cardNumber && (
                <span id="cardNumber-error" className="error-message" role="alert">
                  {errors.cardNumber}
                </span>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="cardName">Nombre en la tarjeta *</label>
              <input 
                id="cardName"
                type="text" 
                placeholder="JUAN PEREZ"
                value={payment.card.name || ''}
                onChange={(e) => handleCardChange('name', e.target.value)}
                className={errors.cardName ? 'error' : ''}
                aria-describedby={errors.cardName ? 'cardName-error' : undefined}
              />
              {errors.cardName && (
                <span id="cardName-error" className="error-message" role="alert">
                  {errors.cardName}
                </span>
              )}
            </div>
            
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="cardExpiry">Fecha de expiración *</label>
                <input 
                  id="cardExpiry"
                  type="text" 
                  placeholder="MM/AA"
                  value={payment.card.expiry || ''}
                  onChange={(e) => handleCardChange('expiry', e.target.value)}
                  className={errors.cardExpiry ? 'error' : ''}
                  maxLength="5"
                  aria-describedby={errors.cardExpiry ? 'cardExpiry-error' : undefined}
                />
                {errors.cardExpiry && (
                  <span id="cardExpiry-error" className="error-message" role="alert">
                    {errors.cardExpiry}
                  </span>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="cardCvc">CVC *</label>
                <input 
                  id="cardCvc"
                  type="text" 
                  placeholder="123"
                  value={payment.card.cvc || ''}
                  onChange={(e) => handleCardChange('cvc', e.target.value)}
                  className={errors.cardCvc ? 'error' : ''}
                  maxLength="3"
                  aria-describedby={errors.cardCvc ? 'cardCvc-error' : undefined}
                />
                {errors.cardCvc && (
                  <span id="cardCvc-error" className="error-message" role="alert">
                    {errors.cardCvc}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
        
        {paymentMethod === 'paypal' && (
          <div className="paypal-form payment-details">
            <div className="form-group">
              <label htmlFor="paypalEmail">Correo electrónico de PayPal *</label>
              <input 
                id="paypalEmail"
                type="email" 
                placeholder="usuario@example.com"
                value={payment.paypal.email || ''}
                onChange={(e) => handlePaypalChange(e.target.value)}
                className={errors.paypalEmail ? 'error' : ''}
                aria-describedby={errors.paypalEmail ? 'paypalEmail-error' : undefined}
              />
              {errors.paypalEmail && (
                <span id="paypalEmail-error" className="error-message" role="alert">
                  {errors.paypalEmail}
                </span>
              )}
            </div>
            <div className="paypal-note">
              <span className="info-icon">ℹ️</span>
              Serás redirigido a PayPal para completar el pago de forma segura
            </div>
          </div>
        )}
        
        {paymentMethod === 'cash' && (
          <div className="cash-note payment-details">
            <div className="cash-info">
              <span className="info-icon">💰</span>
              <div>
                <p><strong>Pago en efectivo al llegar</strong></p>
                <p>Pagarás directamente al anfitrión cuando llegues al alojamiento.</p>
                <p>Por favor, asegúrate de tener el efectivo exacto.</p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="terms section">
        <label className="terms-checkbox" htmlFor="terms">
          <input 
            id="terms"
            type="checkbox" 
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className={errors.terms ? 'error' : ''}
          />
          <span>
            Acepto los <a href="#terms" target="_blank" rel="noopener noreferrer">Términos y Condiciones</a> y la <a href="#privacy" target="_blank" rel="noopener noreferrer">Política de Privacidad</a>
          </span>
        </label>
        {errors.terms && (
          <span className="error-message" role="alert">
            {errors.terms}
          </span>
        )}
      </div>
      
      <div className="actions">
        <button 
          type="button" 
          className="back-button"
          onClick={onBack}
          disabled={isLoading}
        >
          ← Atrás
        </button>
        <button 
          type="button" 
          className="next-button"
          disabled={!isFormValid || isLoading}
          onClick={handleSubmit}
        >
          {isLoading ? (
            <>
              <span className="spinner"></span>
              Procesando...
            </>
          ) : (
            'Revisar y confirmar →'
          )}
        </button>
      </div>
    </div>
  );
};

export default PaymentForm;