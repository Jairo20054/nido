import React, { useState } from 'react';
import './ImageGallery.css';

const ImageGallery = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const goToPrev = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };
  
  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };
  
  const goToImage = (index) => {
    setCurrentIndex(index);
  };
  
  return (
    <div className="image-gallery">
      <div className="main-image">
        <img src={images[currentIndex]} alt={`Property view ${currentIndex + 1}`} />
        <button className="nav-button prev" onClick={goToPrev}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.03 3.97a.75.75 0 010 1.06l-6.22 6.22h16.94a.75.75 0 010 1.5H4.81l6.22 6.22a.75.75 0 11-1.06 1.06l-7.5-7.5a.75.75 0 010-1.06l7.5-7.5a.75.75 0 011.06 0z" />
          </svg>
        </button>
        <button className="nav-button next" onClick={goToNext}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.97 3.97a.75.75 0 011.06 0l7.5 7.5a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 11-1.06-1.06l6.22-6.22H3a.75.75 0 010-1.5h16.19l-6.22-6.22a.75.75 0 010-1.06z" />
          </svg>
        </button>
        <div className="image-counter">
          {currentIndex + 1} / {images.length}
        </div>
      </div>
      
      <div className="thumbnail-grid">
        {images.slice(0, 4).map((image, index) => (
          <div 
            key={index} 
            className={`thumbnail ${index === currentIndex ? 'active' : ''}`}
            onClick={() => goToImage(index)}
          >
            <img src={image} alt={`Thumbnail ${index + 1}`} />
            {index === 3 && images.length > 4 && (
              <div className="more-images">+{images.length - 4}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageGallery;