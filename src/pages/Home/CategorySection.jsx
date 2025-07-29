import React, { useState, useEffect, useRef } from 'react';
import './CategorySection.css';

const CategorySection = () => {
  const categories = [
    {
      id: 'economicas',
      title: 'Económicas',
      description: 'Alojamientos con precios accesibles sin comprometer la comodidad',
      icon: '💰',
      color: '#10B981'
    },
    {
      id: 'accesibles',
      title: 'Accesibles',
      description: 'Propiedades adaptadas para personas con movilidad reducida',
      icon: '♿',
      color: '#0EA5E9'
    },
    {
      id: 'familiares',
      title: 'Familiares',
      description: 'Espacios amplios y seguros para disfrutar en familia',
      icon: '👨‍👩‍👧‍👦',
      color: '#F59E0B'
    },
    {
      id: 'lujo',
      title: 'Lujo',
      description: 'Experiencias premium con servicios exclusivos',
      icon: '🌟',
      color: '#8B5CF6'
    },
    {
      id: 'larga-estadia',
      title: 'Larga Estadía',
      description: 'Opciones mensuales con descuentos especiales',
      icon: '📅',
      color: '#06B6D4'
    },
    {
      id: 'pet-friendly',
      title: 'Pet Friendly',
      description: 'Propiedades que aceptan mascotas',
      icon: '🐾',
      color: '#EC4899'
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef(null);
  const intervalRef = useRef(null);
  
  // Variables para el desplazamiento con mouse
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Configurar el carrusel automático
  useEffect(() => {
    const startAutoScroll = () => {
      intervalRef.current = setInterval(() => {
        if (!isPaused && !isDragging) {
          setCurrentIndex(prev => (prev + 1) % categories.length);
        }
      }, 3000);
    };
    
    startAutoScroll();
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [categories.length, isPaused, isDragging]);

  // Desplazar al índice actual
  useEffect(() => {
    if (containerRef.current) {
      const card = containerRef.current.children[0];
      if (card) {
        const cardWidth = card.offsetWidth + 20; // Ancho de la tarjeta + gap
        containerRef.current.scrollTo({
          left: currentIndex * cardWidth,
          behavior: 'smooth'
        });
      }
    }
  }, [currentIndex]);

  // Manejar clic en una tarjeta
  const handleCardClick = (index) => {
    setCurrentIndex(index);
    setIsPaused(true);
    
    // Reanudar después de 5 segundos
    setTimeout(() => {
      setIsPaused(false);
    }, 5000);
  };

  // Manejar clic en los botones de navegación
  const handleNavClick = (direction) => {
    setIsPaused(true);
    if (direction === 'prev') {
      setCurrentIndex(prev => prev === 0 ? categories.length - 1 : prev - 1);
    } else {
      setCurrentIndex(prev => (prev + 1) % categories.length);
    }
    
    // Reanudar después de 5 segundos
    setTimeout(() => {
      setIsPaused(false);
    }, 5000);
  };

  // Manejar inicio del arrastre
  const startDrag = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setScrollLeft(containerRef.current.scrollLeft);
    setIsPaused(true);
  };

  // Manejar arrastre
  const duringDrag = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Ajuste de velocidad
    containerRef.current.scrollLeft = scrollLeft - walk;
  };

  // Finalizar arrastre
  const endDrag = () => {
    setIsDragging(false);
    setIsPaused(false);
  };

  return (
    <section className="category-section">
      <div className="category-container">
        <div className="category-header">
          <h2 className="category-title">Encuentra el alojamiento perfecto para ti</h2>
          <p className="category-subtitle">
            Explora nuestras categorías cuidadosamente seleccionadas para ofrecerte la mejor experiencia de arrendamiento
          </p>
        </div>

        <div className="category-slider-container">
          <button 
            className="slider-nav prev"
            onClick={() => handleNavClick('prev')}
            aria-label="Categoría anterior"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="nav-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          
         <div 
  className="category-grid"
  ref={containerRef}
  onMouseEnter={() => setIsPaused(true)}
  onMouseLeave={() => {
    setIsPaused(false);
    endDrag(); // Asegura que se limpie el estado de arrastre al salir
  }}
  onMouseDown={startDrag}
  onMouseMove={duringDrag}
  onMouseUp={endDrag}
  onTouchStart={(e) => {
    setIsPaused(true);
    startDrag(e.touches[0]);
  }}
  onTouchMove={(e) => {
    if (isDragging) duringDrag(e.touches[0]);
  }}
  onTouchEnd={() => {
    setIsPaused(false);
    endDrag();
  }}
  style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
>
            {categories.map((category, index) => (
              <div 
                key={category.id} 
                className={`category-card ${currentIndex === index ? 'active' : ''}`}
                onClick={() => handleCardClick(index)}
                style={{ '--category-color': category.color }}
              >
                <div className="category-card-content">
                  <div className="category-icon-container" style={{ backgroundColor: `${category.color}10` }}>
                    <span className="category-icon">{category.icon}</span>
                  </div>
                  <div className="category-text">
                    <h3 className="category-card-title">{category.title}</h3>
                    <p className="category-card-description">{category.description}</p>
                  </div>
                  <div className="category-card-footer">
                    <button className="category-explore-button" style={{ color: category.color }}>
                      Explorar
                      <svg xmlns="http://www.w3.org/2000/svg" className="category-arrow-icon" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <button 
            className="slider-nav next"
            onClick={() => handleNavClick('next')}
            aria-label="Categoría siguiente"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="nav-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <div className="slider-dots">
          {categories.map((_, index) => (
            <button
              key={index}
              className={`slider-dot ${currentIndex === index ? 'active' : ''}`}
              onClick={() => handleCardClick(index)}
              aria-label={`Ir a categoría ${index + 1}`}
              style={{ backgroundColor: currentIndex === index ? categories[index].color : '#D1D5DB' }}
            />
          ))}
        </div>

        <div className="category-footer">
          <button className="view-all-button">Ver todas las categorías</button>
        </div>
      </div>
    </section>
  );
};

export default CategorySection;