import React, { useState } from 'react';
import './Favorites.css';

const Favorites = () => {
  const [favorites, setFavorites] = useState([
    { 
      id: 1, 
      title: 'Loft en Zona T', 
      price: '$85.000/noche', 
      location: 'Bogotá',
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=300&h=200&fit=crop',
      rating: 4.8,
      description: 'Moderno loft en el corazón de la Zona Rosa'
    },
    { 
      id: 2, 
      title: 'Casa Campestre', 
      price: '$120.000/noche', 
      location: 'Medellín',
      image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=300&h=200&fit=crop',
      rating: 4.9,
      description: 'Hermosa casa con vista a las montañas'
    },
    { 
      id: 3, 
      title: 'Apartamento Centro Histórico', 
      price: '$95.000/noche', 
      location: 'Cartagena',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300&h=200&fit=crop',
      rating: 4.7,
      description: 'Encantador apartamento colonial'
    }
  ]);

  const removeFavorite = (id) => {
    setFavorites(favorites.filter(fav => fav.id !== id));
  };

  const handleCardClick = (favorite) => {
    console.log('Navegando a:', favorite.title);
    // Aquí puedes implementar la navegación
  };

  if (favorites.length === 0) {
    return (
      <div className="favorites">
        <h2 className="section-title">Mis Favoritos</h2>
        <div className="empty-state">
          <div className="empty-icon">💝</div>
          <h3>No tienes favoritos aún</h3>
          <p>Guarda tus propiedades favoritas para verlas aquí</p>
        </div>
      </div>
    );
  }

  return (
    <div className="favorites">
      <div className="favorites-header">
        <h2 className="section-title">Mis Favoritos</h2>
        <span className="favorites-count">{favorites.length} propiedades</span>
      </div>
      
      <div className="favorites-grid">
        {favorites.map(fav => (
          <div key={fav.id} className="favorite-card" onClick={() => handleCardClick(fav)}>
            <div className="favorite-image-container">
              <img 
                src={fav.image} 
                alt={fav.title}
                className="favorite-image"
                loading="lazy"
              />
              <button 
                className="favorite-remove"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFavorite(fav.id);
                }}
                aria-label={`Eliminar ${fav.title} de favoritos`}
                title="Eliminar de favoritos"
              >
                ✕
              </button>
            </div>
            
            <div className="favorite-info">
              <div className="favorite-header">
                <h3 className="favorite-title">{fav.title}</h3>
                <div className="favorite-rating">
                  <span className="star">⭐</span>
                  <span className="rating-value">{fav.rating}</span>
                </div>
              </div>
              
              <p className="favorite-location">📍 {fav.location}</p>
              <p className="favorite-description">{fav.description}</p>
              <div className="favorite-footer">
                <p className="favorite-price">{fav.price}</p>
                <button className="view-details-btn">Ver detalles</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Favorites;
