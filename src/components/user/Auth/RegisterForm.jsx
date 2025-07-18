import React, { useState } from 'react';
import './RegisterForm.css';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Validación en tiempo real
  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'name':
        if (!value.trim()) {
          newErrors.name = 'El nombre es requerido';
        } else if (value.trim().length < 2) {
          newErrors.name = 'El nombre debe tener al menos 2 caracteres';
        } else {
          delete newErrors.name;
        }
        break;

      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) {
          newErrors.email = 'El email es requerido';
        } else if (!emailRegex.test(value)) {
          newErrors.email = 'Ingresa un email válido';
        } else {
          delete newErrors.email;
        }
        break;

      case 'password':
        if (!value) {
          newErrors.password = 'La contraseña es requerida';
        } else if (value.length < 8) {
          newErrors.password = 'Mínimo 8 caracteres';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          newErrors.password = 'Debe incluir mayúscula, minúscula y número';
        } else {
          delete newErrors.password;
        }
        
        // Revalidar confirmación si ya tiene valor
        if (formData.confirmPassword && value !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Las contraseñas no coinciden';
        } else if (formData.confirmPassword && value === formData.confirmPassword) {
          delete newErrors.confirmPassword;
        }
        break;

      case 'confirmPassword':
        if (!value) {
          newErrors.confirmPassword = 'Confirma tu contraseña';
        } else if (value !== formData.password) {
          newErrors.confirmPassword = 'Las contraseñas no coinciden';
        } else {
          delete newErrors.confirmPassword;
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Validar campo después de un pequeño delay
    setTimeout(() => validateField(name, value), 300);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar todos los campos
    Object.keys(formData).forEach(key => {
      validateField(key, formData[key]);
    });

    if (!termsAccepted) {
      setErrors(prev => ({ ...prev, terms: 'Debes aceptar los términos y condiciones' }));
      return;
    }

    // Si hay errores, no enviar
    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsLoading(true);

    try {
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Aquí iría la lógica real de registro
      console.log('Registrando usuario:', formData);
      
      // Resetear formulario en caso de éxito
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
      setTermsAccepted(false);
      
      alert('¡Registro exitoso!');
      
    } catch (error) {
      setErrors({ submit: 'Error al registrar. Intenta nuevamente.' });
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;

    const labels = ['', 'Muy débil', 'Débil', 'Buena', 'Fuerte', 'Muy fuerte'];
    return { strength, label: labels[strength] };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2 className="auth-title">Crear Cuenta</h2>
          <p className="auth-subtitle">Únete a nuestra plataforma</p>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Nombre Completo *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`form-input ${errors.name ? 'error' : ''}`}
              placeholder="Ingresa tu nombre completo"
              required
              aria-describedby={errors.name ? 'name-error' : undefined}
            />
            {errors.name && (
              <span id="name-error" className="error-message" role="alert">
                {errors.name}
              </span>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="ejemplo@correo.com"
              required
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && (
              <span id="email-error" className="error-message" role="alert">
                {errors.email}
              </span>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Contraseña *
            </label>
            <div className="password-input-container">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder="Mínimo 8 caracteres"
                required
                aria-describedby={errors.password ? 'password-error' : 'password-help'}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            
            {formData.password && (
              <div className="password-strength">
                <div className={`strength-bar strength-${passwordStrength.strength}`}>
                  <div className="strength-fill"></div>
                </div>
                <span className="strength-label">{passwordStrength.label}</span>
              </div>
            )}
            
            {errors.password && (
              <span id="password-error" className="error-message" role="alert">
                {errors.password}
              </span>
            )}
            
            <small id="password-help" className="form-help">
              Incluye mayúscula, minúscula y número
            </small>
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirmar Contraseña *
            </label>
            <div className="password-input-container">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                placeholder="Repite tu contraseña"
                required
                aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {errors.confirmPassword && (
              <span id="confirm-password-error" className="error-message" role="alert">
                {errors.confirmPassword}
              </span>
            )}
          </div>
          
          <div className="terms-container">
            <input 
              type="checkbox" 
              id="terms" 
              checked={termsAccepted}
              onChange={(e) => {
                setTermsAccepted(e.target.checked);
                if (e.target.checked) {
                  setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.terms;
                    return newErrors;
                  });
                }
              }}
              className={errors.terms ? 'error' : ''}
              required 
            />
            <label htmlFor="terms" className="terms-label">
              Acepto los{' '}
              <a 
                href="/terminos" 
                className="terms-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                Términos y Condiciones
              </a>
              {' '}y la{' '}
              <a 
                href="/privacidad" 
                className="terms-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                Política de Privacidad
              </a>
            </label>
          </div>
          {errors.terms && (
            <span className="error-message" role="alert">
              {errors.terms}
            </span>
          )}
          
          {errors.submit && (
            <div className="submit-error" role="alert">
              {errors.submit}
            </div>
          )}
          
          <button 
            type="submit" 
            className="auth-submit-btn"
            disabled={isLoading || Object.keys(errors).length > 0}
          >
            {isLoading ? (
              <>
                <span className="loading-spinner"></span>
                Registrando...
              </>
            ) : (
              'Registrarse'
            )}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>
            ¿Ya tienes cuenta?{' '}
            <a href="/login" className="auth-link">
              Inicia Sesión
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;