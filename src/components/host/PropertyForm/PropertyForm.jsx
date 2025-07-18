import React, { useState, useCallback, useMemo } from 'react';
import './PropertyForm.css';

const PropertyForm = () => {
  const [step, setStep] = useState(1);
  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'apartment',
    location: '',
    guests: 1,
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
    amenities: [],
    price: ''
  });

  const amenitiesOptions = useMemo(() => [
    'WiFi',
    'Cocina',
    'Aire acondicionado',
    'Calefacción',
    'TV',
    'Lavadora',
    'Secadora',
    'Estacionamiento',
    'Piscina',
    'Gimnasio',
    'Balcón',
    'Terraza',
    'Jardín',
    'Jacuzzi',
    'Chimenea',
    'Escritorio',
    'Mascotas permitidas',
    'Apto para fumadores'
  ], []);

  const stepTitles = useMemo(() => ({
    1: 'Información Básica',
    2: 'Detalles de la Propiedad',
    3: 'Fotos y Precio'
  }), []);

  const propertyTypes = useMemo(() => [
    { value: 'apartment', label: 'Apartamento' },
    { value: 'house', label: 'Casa' },
    { value: 'room', label: 'Habitación' },
    { value: 'loft', label: 'Loft' },
    { value: 'villa', label: 'Villa' },
    { value: 'studio', label: 'Estudio' },
    { value: 'penthouse', label: 'Penthouse' }
  ], []);

  // Validaciones por paso
  const validateStep = useCallback((stepNumber) => {
    const newErrors = {};
    
    switch (stepNumber) {
      case 1:
        if (!formData.title.trim()) {
          newErrors.title = 'El título es obligatorio';
        } else if (formData.title.length < 10) {
          newErrors.title = 'El título debe tener al menos 10 caracteres';
        }
        
        if (!formData.description.trim()) {
          newErrors.description = 'La descripción es obligatoria';
        } else if (formData.description.length < 50) {
          newErrors.description = 'La descripción debe tener al menos 50 caracteres';
        }
        
        if (!formData.type) {
          newErrors.type = 'Selecciona un tipo de propiedad';
        }
        break;
        
      case 2:
        if (!formData.location.trim()) {
          newErrors.location = 'La ubicación es obligatoria';
        }
        
        if (formData.guests < 1 || formData.guests > 20) {
          newErrors.guests = 'El número de huéspedes debe estar entre 1 y 20';
        }
        
        if (formData.bedrooms < 0 || formData.bedrooms > 10) {
          newErrors.bedrooms = 'El número de habitaciones debe estar entre 0 y 10';
        }
        
        if (formData.beds < 1 || formData.beds > 20) {
          newErrors.beds = 'El número de camas debe estar entre 1 y 20';
        }
        
        if (formData.bathrooms < 1 || formData.bathrooms > 10) {
          newErrors.bathrooms = 'El número de baños debe estar entre 1 y 10';
        }
        break;
        
      case 3:
        if (images.length === 0) {
          newErrors.images = 'Debes subir al menos una foto';
        } else if (images.length > 10) {
          newErrors.images = 'Máximo 10 fotos permitidas';
        }
        
        if (!formData.price || formData.price <= 0) {
          newErrors.price = 'El precio debe ser mayor a 0';
        } else if (formData.price > 10000000) {
          newErrors.price = 'El precio no puede exceder $10,000,000 COP';
        }
        break;
        
      default:
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, images]);

  const handleChange = useCallback((e) => {
    const { name, value, type } = e.target;
    const processedValue = type === 'number' ? parseInt(value) || 0 : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  }, [errors]);

  const handleCheckboxChange = useCallback((e) => {
    const { value, checked } = e.target;
    
    setFormData(prev => {
      const amenities = [...prev.amenities];
      
      if (checked) {
        if (!amenities.includes(value)) {
          amenities.push(value);
        }
      } else {
        const index = amenities.indexOf(value);
        if (index > -1) {
          amenities.splice(index, 1);
        }
      }
      
      return { ...prev, amenities };
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(3)) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const propertyData = {
        ...formData,
        images,
        createdAt: new Date().toISOString(),
        id: Date.now() // En producción, esto vendría del backend
      };
      
      // Simular llamada a la API
      console.log('Datos de la propiedad:', propertyData);
      
      // Aquí harías la llamada real a tu API
      // await createProperty(propertyData);
      
      alert('¡Propiedad publicada exitosamente!');
      
      // Resetear formulario
      setFormData({
        title: '',
        description: '',
        type: 'apartment',
        location: '',
        guests: 1,
        bedrooms: 1,
        beds: 1,
        bathrooms: 1,
        amenities: [],
        price: ''
      });
      setImages([]);
      setStep(1);
      setErrors({});
      
    } catch (error) {
      console.error('Error al publicar la propiedad:', error);
      alert('Error al publicar la propiedad. Por favor, inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = useCallback(() => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, 3));
    }
  }, [step, validateStep]);

  const prevStep = useCallback(() => {
    setStep(prev => Math.max(prev - 1, 1));
  }, []);

  const renderFormGroup = (id, label, type = 'text', options = {}) => (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      {type === 'textarea' ? (
        <textarea
          id={id}
          name={id}
          value={formData[id]}
          onChange={handleChange}
          className={errors[id] ? 'error' : ''}
          {...options}
        />
      ) : type === 'select' ? (
        <select
          id={id}
          name={id}
          value={formData[id]}
          onChange={handleChange}
          className={errors[id] ? 'error' : ''}
          {...options}
        >
          {options.options?.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          id={id}
          name={id}
          value={formData[id]}
          onChange={handleChange}
          className={errors[id] ? 'error' : ''}
          {...options}
        />
      )}
      {errors[id] && <span className="error-message">{errors[id]}</span>}
    </div>
  );

  return (
    <div className="property-form-container">
      <h1 className="form-title">{stepTitles[step]}</h1>
      
      <div className="progress-bar">
        {[1, 2, 3].map((stepNum, index) => (
          <React.Fragment key={stepNum}>
            <div className={`progress-step ${step >= stepNum ? 'active' : ''}`}>
              {stepNum}
            </div>
            {index < 2 && (
              <div className={`progress-line ${step >= stepNum + 1 ? 'active' : ''}`} />
            )}
          </React.Fragment>
        ))}
      </div>
      
      <form onSubmit={handleSubmit} className="property-form">
        {step === 1 && (
          <div className="form-step">
            {renderFormGroup('title', 'Título de la propiedad', 'text', {
              required: true,
              placeholder: 'Ej: Acogedor apartamento en el centro',
              maxLength: 100
            })}
            
            {renderFormGroup('description', 'Descripción', 'textarea', {
              required: true,
              placeholder: 'Describe tu propiedad en detalle...',
              rows: 5,
              maxLength: 1000
            })}
            
            {renderFormGroup('type', 'Tipo de propiedad', 'select', {
              required: true,
              options: propertyTypes
            })}
          </div>
        )}
        
        {step === 2 && (
          <div className="form-step">
            {renderFormGroup('location', 'Ubicación', 'text', {
              required: true,
              placeholder: 'Dirección completa'
            })}
            
            <div className="capacity-grid">
              {renderFormGroup('guests', 'Huéspedes', 'number', {
                min: 1,
                max: 20,
                required: true
              })}
              
              {renderFormGroup('bedrooms', 'Habitaciones', 'number', {
                min: 0,
                max: 10,
                required: true
              })}
              
              {renderFormGroup('beds', 'Camas', 'number', {
                min: 1,
                max: 20,
                required: true
              })}
              
              {renderFormGroup('bathrooms', 'Baños', 'number', {
                min: 1,
                max: 10,
                required: true
              })}
            </div>
            
            <div className="form-group">
              <label>Servicios y comodidades</label>
              <div className="amenities-grid">
                {amenitiesOptions.map(amenity => (
                  <label key={amenity} className="amenity-item">
                    <input
                      type="checkbox"
                      value={amenity}
                      checked={formData.amenities.includes(amenity)}
                      onChange={handleCheckboxChange}
                    />
                    <span>{amenity}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {step === 3 && (
          <div className="form-step">
            <div className="form-group">
              <label>Fotos de la propiedad</label>
              <div className="image-upload-container">
                {/* Aquí iría el componente ImageUploader mejorado */}
                <div className="image-placeholder">
                  <p>Arrastra y suelta las imágenes aquí o haz clic para seleccionar</p>
                  <p className="image-info">Máximo 10 imágenes, formatos: JPG, PNG, WebP</p>
                </div>
              </div>
              {errors.images && <span className="error-message">{errors.images}</span>}
            </div>
            
            {renderFormGroup('price', 'Precio por noche (COP)', 'number', {
              required: true,
              placeholder: 'Ej: 85000',
              min: 1,
              max: 10000000
            })}
          </div>
        )}
        
        <div className="form-actions">
          {step > 1 && (
            <button 
              type="button" 
              className="secondary-btn" 
              onClick={prevStep}
              disabled={isSubmitting}
            >
              Atrás
            </button>
          )}
          {step < 3 ? (
            <button 
              type="button" 
              className="primary-btn" 
              onClick={nextStep}
            >
              Siguiente
            </button>
          ) : (
            <button 
              type="submit" 
              className="primary-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Publicando...' : 'Publicar Propiedad'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default PropertyForm;