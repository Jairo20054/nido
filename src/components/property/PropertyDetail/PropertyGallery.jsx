jsx:src/components/Property/PropertyGallery.jsx
import React, { useState } from 'react';
import { FaChevronLeft, FaChevronRight, FaExpand } from 'react-icons/fa';
import './PropertyGallery.css';

const PropertyGallery = ({ images, title }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const goToPrevious = () => {
    const isFirstImage = currentIndex === 0;
    const newIndex = isFirstImage ? images.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = () => {
    const isLastImage = currentIndex === images.length - 1;
    const newIndex = isLastImage ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  const openLightbox = () => {
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = 'auto';
  };

  if (!images || images.length === 0) {
    return (
      <div className="property-gallery empty">
        <div className="empty-gallery">No hay imágenes disponibles</div>
      </div>
    );
  }

  return (
    <div className="property-gallery">
      <div className="gallery-main">
        <button 
          className="nav-button prev" 
          onClick={goToPrevious}
          aria-label="Imagen anterior"
        >
          <FaChevronLeft />
        </button>
        
        <div 
          className="main-image-container"
          onClick={openLightbox}
          role="button"
          tabIndex={0}
          aria-label="Ampliar imagen"
        >
          <img 
            src={images[currentIndex]} 
            alt={`${title} - Imagen ${currentIndex + 1}`}
            className="main-image"
          />
          <div className="expand-overlay">
            <FaExpand className="expand-icon" />
          </div>
        </div>
        
        <button 
          className="nav-button next" 
          onClick={goToNext}
          aria-label="Siguiente imagen"
        >
          <FaChevronRight />
        </button>
        
        <div className="image-counter">
          {currentIndex + 1} / {images.length}
        </div>
      </div>
      
      {images.length > 1 && (
        <div className="gallery-thumbnails">
          {images.map((img, index) => (
            <div 
              key={index}
              className={`thumbnail ${index === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentIndex(index)}
              onKeyDown={(e) => e.key === 'Enter' && setCurrentIndex(index)}
              tabIndex={0}
              role="button"
              aria-label={`Ver imagen ${index + 1}`}
            >
              <img src={img} alt={`Miniatura ${index + 1}`} />
            </div>
          ))}
        </div>
      )}
      
      {lightboxOpen && (
        <div className="lightbox" onClick={closeLightbox}>
          <div className="lightbox-content" onClick={e => e.stopPropagation()}>
            <button 
              className="lightbox-close"
              onClick={closeLightbox}
              aria-label="Cerrar visor"
            >
              &times;
            </button>
            <img 
              src={images[currentIndex]} 
              alt={`${title} - Imagen ${currentIndex + 1}`}
              className="lightbox-image"
            />
            <div className="lightbox-controls">
              <button 
                className="lightbox-nav prev" 
                onClick={goToPrevious}
                aria-label="Imagen anterior"
              >
                <FaChevronLeft />
              </button>
              <div className="lightbox-counter">
                {currentIndex + 1} / {images.length}
              </div>
              <button 
                className="lightbox-nav next" 
                onClick={goToNext}
                aria-label="Siguiente imagen"
              >
                <FaChevronRight />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyGallery;
