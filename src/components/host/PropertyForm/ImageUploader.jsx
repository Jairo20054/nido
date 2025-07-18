import React, { useState, useCallback } from 'react';
import './ImageUploader.css';

const ImageUploader = ({ images, setImages, maxImages = 10, minImages = 5 }) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');

  const validateFiles = useCallback((files) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxFileSize = 5 * 1024 * 1024; // 5MB
    const validFiles = [];
    let errorMessage = '';

    Array.from(files).forEach(file => {
      if (!validTypes.includes(file.type)) {
        errorMessage = 'Solo se permiten archivos JPG, PNG y WebP';
        return;
      }
      if (file.size > maxFileSize) {
        errorMessage = 'Las imágenes deben ser menores a 5MB';
        return;
      }
      validFiles.push(file);
    });

    if (images.length + validFiles.length > maxImages) {
      errorMessage = `Solo puedes subir máximo ${maxImages} imágenes`;
      return { validFiles: [], error: errorMessage };
    }

    return { validFiles, error: errorMessage };
  }, [images.length, maxImages]);

  const handleImageChange = useCallback((e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const { validFiles, error } = validateFiles(files);
    
    if (error) {
      setError(error);
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (validFiles.length > 0) {
      setImages(prev => [...prev, ...validFiles]);
      setError('');
    }

    // Reset input
    e.target.value = '';
  }, [validateFiles, setImages]);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    const { validFiles, error } = validateFiles(files);
    
    if (error) {
      setError(error);
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (validFiles.length > 0) {
      setImages(prev => [...prev, ...validFiles]);
      setError('');
    }
  }, [validateFiles, setImages]);

  const removeImage = useCallback((index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setError('');
  }, [setImages]);

  const moveImage = useCallback((fromIndex, toIndex) => {
    setImages(prev => {
      const newImages = [...prev];
      const [movedImage] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, movedImage);
      return newImages;
    });
  }, [setImages]);

  const handleKeyDown = (e, index) => {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      removeImage(index);
    }
  };

  const getImageSrc = (image) => {
    if (image instanceof File) {
      return URL.createObjectURL(image);
    }
    return image;
  };

  return (
    <div className="image-uploader">
      <div 
        className={`upload-area ${dragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input 
          type="file" 
          id="property-images"
          multiple
          onChange={handleImageChange}
          accept="image/jpeg,image/jpg,image/png,image/webp"
          aria-describedby="upload-instructions"
        />
        <label htmlFor="property-images" className="upload-label">
          <div className="upload-icon" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className="upload-text">
            {dragActive ? 'Suelta las imágenes aquí' : 'Haz clic o arrastra fotos aquí'}
          </p>
          <p className="upload-hint" id="upload-instructions">
            Mínimo {minImages} fotos • Máximo {maxImages} fotos • JPG, PNG, WebP • Máx. 5MB cada una
          </p>
        </label>
      </div>

      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}

      {images.length > 0 && (
        <div className="images-section">
          <div className="images-header">
            <h3>Fotos subidas ({images.length}/{maxImages})</h3>
            {images.length < minImages && (
              <span className="warning-text">
                Necesitas al menos {minImages - images.length} foto{minImages - images.length === 1 ? '' : 's'} más
              </span>
            )}
          </div>
          
          <div className="image-preview-grid">
            {images.map((image, index) => (
              <div 
                key={index} 
                className={`image-preview ${index === 0 ? 'primary-image' : ''}`}
                tabIndex="0"
                onKeyDown={(e) => handleKeyDown(e, index)}
                role="button"
                aria-label={`Imagen ${index + 1}${index === 0 ? ' (principal)' : ''}`}
              >
                <img 
                  src={getImageSrc(image)} 
                  alt={`Preview ${index + 1}`} 
                  loading="lazy"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                
                {index === 0 && (
                  <div className="primary-badge">Principal</div>
                )}
                
                <div className="image-controls">
                  {index > 0 && (
                    <button 
                      type="button" 
                      className="move-btn move-left"
                      onClick={() => moveImage(index, index - 1)}
                      aria-label="Mover imagen a la izquierda"
                      title="Mover a la izquierda"
                    >
                      ←
                    </button>
                  )}
                  
                  {index < images.length - 1 && (
                    <button 
                      type="button" 
                      className="move-btn move-right"
                      onClick={() => moveImage(index, index + 1)}
                      aria-label="Mover imagen a la derecha"
                      title="Mover a la derecha"
                    >
                      →
                    </button>
                  )}
                  
                  <button 
                    type="button" 
                    className="remove-image-btn"
                    onClick={() => removeImage(index)}
                    aria-label={`Eliminar imagen ${index + 1}`}
                    title="Eliminar imagen"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <p className="upload-tip">
            💡 La primera imagen será la foto principal de tu propiedad
          </p>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;