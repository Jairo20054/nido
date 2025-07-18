import React, { useEffect } from 'react';
import './ErrorMessage.css';
import { motion, AnimatePresence } from 'framer-motion';

const ErrorMessage = ({ 
  message, 
  type = 'error', 
  position = 'center',
  onClose,
  showCloseButton = true,
  autoDismiss = true,
  autoDismissTimeout = 5000,
  icon = true
}) => {
  // Tipos de mensajes disponibles
  const messageTypes = {
    error: {
      icon: '❌',
      color: '#DC2626',
      bgColor: '#FEE2E2',
      borderColor: '#FECACA',
    },
    warning: {
      icon: '⚠️',
      color: '#D97706',
      bgColor: '#FEF3C7',
      borderColor: '#FDE68A',
    },
    info: {
      icon: 'ℹ️',
      color: '#0EA5E9',
      bgColor: '#E0F2FE',
      borderColor: '#BAE6FD',
    },
    success: {
      icon: '✅',
      color: '#059669',
      bgColor: '#D1FAE5',
      borderColor: '#A7F3D0',
    },
  };

  const currentType = messageTypes[type] || messageTypes.error;

  // Auto cerrar el mensaje después de un tiempo
  useEffect(() => {
    if (autoDismiss && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoDismissTimeout);
      
      return () => clearTimeout(timer);
    }
  }, [autoDismiss, onClose, autoDismissTimeout]);

  // Posiciones disponibles
  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2',
    'center': 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
  };

  const positionClass = positionClasses[position] || positionClasses.center;

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          className={`error-message fixed z-50 max-w-md shadow-lg rounded-lg p-4 ${positionClass}`}
          style={{
            backgroundColor: currentType.bgColor,
            borderLeft: `4px solid ${currentType.color}`,
            color: currentType.color,
          }}
          initial={{ opacity: 0, y: position.includes('top') ? -50 : position.includes('bottom') ? 50 : 0, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          role="alert"
          aria-live="assertive"
        >
          <div className="flex items-start">
            {icon && (
              <div className="flex-shrink-0 text-xl mr-3 mt-0.5">
                {currentType.icon}
              </div>
            )}
            
            <div className="flex-1">
              <p className="font-medium">{message}</p>
            </div>
            
            {showCloseButton && onClose && (
              <button
                onClick={onClose}
                className="flex-shrink-0 ml-3"
                aria-label="Cerrar mensaje"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
          
          {autoDismiss && (
            <motion.div 
              className="progress-bar h-1 mt-2 rounded-full"
              style={{ backgroundColor: `${currentType.color}33` }}
              initial={{ width: '100%' }}
              animate={{ width: 0 }}
              transition={{ duration: autoDismissTimeout / 1000, ease: 'linear' }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ErrorMessage;