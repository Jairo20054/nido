import React from 'react';
import './BookingStepper.css';

const BookingStepper = ({ activeStep = 0 }) => {
  const steps = [
    'Información del huésped',
    'Método de pago',
    'Confirmación'
  ];

  // Validación y normalización de activeStep
  const normalizedActiveStep = Math.max(
    0, 
    Math.min(
      Number.isInteger(activeStep) ? activeStep : 0, 
      steps.length - 1
    )
  );

  // Cálculo seguro del porcentaje de progreso
  const progressPercentage = steps.length > 1 
    ? (normalizedActiveStep / (steps.length - 1)) * 100 
    : 0;

  return (
    <div className="stepper-container">
      <div 
        className="stepper-progress" 
        style={{ width: `${progressPercentage}%` }}
        aria-hidden="true"
      ></div>
      
      <div className="stepper-steps">
        {steps.map((step, index) => (
          <div 
            key={index} 
            className={`step ${
              index <= normalizedActiveStep ? 'active' : ''
            } ${
              index === normalizedActiveStep ? 'current' : ''
            }`}
            aria-current={index === normalizedActiveStep ? 'step' : 'false'}
          >
            <div className="step-number">{index + 1}</div>
            <div className="step-label">{step}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookingStepper;