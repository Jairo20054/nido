import React from 'react';
import './BookingStepper.css';

const BookingStepper = ({ activeStep = 0 }) => {
  // Validación adicional para activeStep
  const validatedActiveStep = Math.max(0, Math.min(activeStep, 2));
  
  const steps = [
    'Información del huésped',
    'Método de pago',
    'Confirmación'
  ];

  // Calcula el progreso de manera segura
  const progressWidth = steps.length > 1 
    ? (validatedActiveStep / (steps.length - 1)) * 100 
    : 0;

  return (
    <div className="stepper-container">
      <div 
        className="stepper-progress" 
        style={{ width: `${progressWidth}%` }}
        role="progressbar"
        aria-valuenow={validatedActiveStep + 1}
        aria-valuemin={1}
        aria-valuemax={steps.length}
      ></div>
      
      <div className="stepper-steps">
        {steps.map((step, index) => {
          const isActive = index <= validatedActiveStep;
          const isCurrent = index === validatedActiveStep;
          
          return (
            <div 
              key={index} 
              className={`step ${isActive ? 'active' : ''} ${isCurrent ? 'current' : ''}`}
              aria-current={isCurrent ? "step" : undefined}
            >
              <div className="step-number">{index + 1}</div>
              <div className="step-label">{step}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BookingStepper;