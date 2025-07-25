import React from 'react';
import './CategorySection.css';

const CategorySection = () => {
  const categories = [
    {
      id: 'economicas',
      title: 'Económicas',
      description: 'Alojamientos con precios accesibles sin comprometer la comodidad',
      icon: '💰',
    },
    {
      id: 'accesibles',
      title: 'Accesibles',
      description: 'Propiedades adaptadas para personas con movilidad reducida',
      icon: '♿',
    },
    {
      id: 'familiares',
      title: 'Familiares',
      description: 'Espacios amplios y seguros para disfrutar en familia',
      icon: '👨‍👩‍👧‍👦',
    },
    {
      id: 'lujo',
      title: 'Lujo',
      description: 'Experiencias premium con servicios exclusivos',
      icon: '🌟',
    },
    {
      id: 'larga-estadia',
      title: 'Larga Estadía',
      description: 'Opciones mensuales con descuentos especiales',
      icon: '📅',
    },
    {
      id: 'pet-friendly',
      title: 'Pet Friendly',
      description: 'Propiedades que aceptan mascotas',
      icon: '🐾',
    }
  ];

  return (
    <section className="category-section">
      <div className="category-container">
        <div className="category-header">
          <h2 className="category-title">Encuentra el alojamiento perfecto para ti</h2>
          <p className="category-subtitle">
            Explora nuestras categorías cuidadosamente seleccionadas para ofrecerte la mejor experiencia de arrendamiento
          </p>
        </div>

        <div className="category-grid">
          {categories.map((category) => (
            <div 
              key={category.id} 
              className={`category-card category-${category.id}`}
            >
              <div className="category-card-content">
                <div className="category-icon-container">
                  <span className="category-icon">{category.icon}</span>
                </div>
                <div className="category-text">
                  <h3 className="category-card-title">{category.title}</h3>
                  <p className="category-card-description">{category.description}</p>
                </div>
                <div className="category-card-footer">
                  <button className="category-explore-button">
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

        <div className="category-footer">
          <button className="view-all-button">Ver todas las categorías</button>
        </div>
      </div>
    </section>
  );
};

export default CategorySection;