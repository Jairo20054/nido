import React, { useState, useMemo, useCallback } from 'react';
import { Star, ChevronDown, ChevronUp, Camera, Calendar, User } from 'lucide-react';
import './ReviewSection.css';

const REVIEWS_PER_PAGE = 6;
const RATING_LABELS = {
  5: 'Excelente',
  4: 'Muy bueno',
  3: 'Bueno',
  2: 'Regular',
  1: 'Malo'
};

const ReviewSection = ({ reviews = [], loading = false, onLoadMore }) => {
  const [filter, setFilter] = useState('all');
  const [visibleReviews, setVisibleReviews] = useState(REVIEWS_PER_PAGE);
  const [expandedReviews, setExpandedReviews] = useState(new Set());
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  // Memoizar cálculos costosos
  const reviewStats = useMemo(() => {
    if (!reviews.length) return { filteredReviews: [], ratingCounts: {}, overallRating: 0 };

    const ratingCounts = reviews.reduce((acc, review) => {
      acc[review.rating] = (acc[review.rating] || 0) + 1;
      return acc;
    }, { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });

    const overallRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
    
    const filteredReviews = filter === 'all' 
      ? reviews 
      : reviews.filter(r => r.rating === parseInt(filter));

    return { filteredReviews, ratingCounts, overallRating };
  }, [reviews, filter]);

  const { filteredReviews, ratingCounts, overallRating } = reviewStats;
  const displayedReviews = filteredReviews.slice(0, visibleReviews);
  const hasMoreReviews = filteredReviews.length > visibleReviews;

  // Callbacks optimizados
  const handleFilterChange = useCallback((newFilter) => {
    setFilter(newFilter);
    setVisibleReviews(REVIEWS_PER_PAGE);
  }, []);

  const handleShowMore = useCallback(() => {
    const newVisible = visibleReviews + REVIEWS_PER_PAGE;
    setVisibleReviews(newVisible);
    
    if (onLoadMore && newVisible >= filteredReviews.length) {
      onLoadMore();
    }
  }, [visibleReviews, filteredReviews.length, onLoadMore]);

  const toggleReviewExpansion = useCallback((index) => {
    setExpandedReviews(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  }, []);

  const openPhotoModal = useCallback((photo) => {
    setSelectedPhoto(photo);
  }, []);

  const closePhotoModal = useCallback(() => {
    setSelectedPhoto(null);
  }, []);

  // Componente de estrellas reutilizable
  const StarRating = ({ rating, size = 'medium', showEmpty = false }) => {
    const stars = [];
    const totalStars = showEmpty ? 5 : rating;
    
    for (let i = 1; i <= totalStars; i++) {
      stars.push(
        <Star
          key={i}
          className={`star ${i <= rating ? 'filled' : 'empty'} ${size}`}
          fill={i <= rating ? 'currentColor' : 'none'}
        />
      );
    }
    return <div className="star-rating">{stars}</div>;
  };

  // Componente de filtros
  const FilterButton = ({ value, label, count, isActive, onClick }) => (
    <button 
      className={`filter-button ${isActive ? 'active' : ''}`}
      onClick={() => onClick(value)}
      aria-pressed={isActive}
    >
      <span>{label}</span>
      {count > 0 && <span className="filter-count">({count})</span>}
    </button>
  );

  // Componente de barra de rating
  const RatingBar = ({ rating, count, total }) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    
    return (
      <div className="rating-bar" onClick={() => handleFilterChange(rating.toString())}>
        <div className="rating-info">
          <StarRating rating={rating} size="small" />
          <span className="rating-label">{RATING_LABELS[rating]}</span>
        </div>
        <div className="bar-container">
          <div 
            className="bar-fill" 
            style={{ 
              width: `${percentage}%`,
              '--rating-color': `hsl(${(rating - 1) * 30}, 70%, 50%)`
            }}
          />
        </div>
        <span className="rating-count">{count}</span>
      </div>
    );
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Truncar texto largo
  const truncateText = (text, maxLength = 300) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="review-section loading">
        <div className="loading-spinner">Cargando reseñas...</div>
      </div>
    );
  }

  if (!reviews.length) {
    return (
      <div className="review-section empty">
        <div className="empty-state">
          <Star className="empty-icon" />
          <h3>Aún no hay reseñas</h3>
          <p>Sé el primero en compartir tu experiencia</p>
        </div>
      </div>
    );
  }

  return (
    <div className="review-section">
      {/* Header con rating general */}
      <div className="review-header">
        <div className="overall-rating">
          <div className="rating-summary">
            <div className="rating-number">{overallRating.toFixed(1)}</div>
            <div className="rating-details">
              <StarRating rating={Math.round(overallRating)} showEmpty />
              <div className="review-count">
                {reviews.length} {reviews.length === 1 ? 'reseña' : 'reseñas'}
              </div>
            </div>
          </div>
        </div>
        
        <div className="rating-distribution">
          <h4>Distribución de calificaciones</h4>
          {[5, 4, 3, 2, 1].map((rating) => (
            <RatingBar
              key={rating}
              rating={rating}
              count={ratingCounts[rating]}
              total={reviews.length}
            />
          ))}
        </div>
      </div>
      
      {/* Filtros */}
      <div className="review-filters">
        <div className="filter-label">Filtrar por:</div>
        <div className="filter-buttons">
          <FilterButton
            value="all"
            label="Todas"
            count={reviews.length}
            isActive={filter === 'all'}
            onClick={handleFilterChange}
          />
          {[5, 4, 3, 2, 1].map((rating) => (
            ratingCounts[rating] > 0 && (
              <FilterButton
                key={rating}
                value={rating.toString()}
                label={`${rating} ★`}
                count={ratingCounts[rating]}
                isActive={filter === rating.toString()}
                onClick={handleFilterChange}
              />
            )
          ))}
        </div>
      </div>
      
      {/* Lista de reseñas */}
      <div className="review-list">
        {displayedReviews.map((review, index) => {
          const isExpanded = expandedReviews.has(index);
          const shouldTruncate = review.text.length > 300;
          
          return (
            <article key={`${review.id || index}-${review.date}`} className="review-item">
              <header className="review-header-item">
                <div className="reviewer-info">
                  <div className="avatar" aria-label={`Avatar de ${review.reviewer.name}`}>
                    {review.reviewer.avatar ? (
                      <img src={review.reviewer.avatar} alt={review.reviewer.name} />
                    ) : (
                      <User size={20} />
                    )}
                  </div>
                  <div className="reviewer-details">
                    <h5 className="reviewer-name">{review.reviewer.name}</h5>
                    <div className="review-meta">
                      <Calendar size={14} />
                      <time dateTime={review.date}>{formatDate(review.date)}</time>
                    </div>
                  </div>
                </div>
                <div className="review-rating-display">
                  <StarRating rating={review.rating} />
                </div>
              </header>
              
              <div className="review-content">
                <p className="review-text">
                  {shouldTruncate && !isExpanded 
                    ? truncateText(review.text)
                    : review.text
                  }
                  {shouldTruncate && (
                    <button 
                      className="expand-button"
                      onClick={() => toggleReviewExpansion(index)}
                      aria-expanded={isExpanded}
                    >
                      {isExpanded ? (
                        <>Ver menos <ChevronUp size={16} /></>
                      ) : (
                        <>Ver más <ChevronDown size={16} /></>
                      )}
                    </button>
                  )}
                </p>
                
                {review.photos?.length > 0 && (
                  <div className="review-photos">
                    <div className="photos-header">
                      <Camera size={16} />
                      <span>{review.photos.length} {review.photos.length === 1 ? 'foto' : 'fotos'}</span>
                    </div>
                    <div className="photos-grid">
                      {review.photos.map((photo, idx) => (
                        <button
                          key={idx}
                          className="review-photo"
                          onClick={() => openPhotoModal(photo)}
                          aria-label={`Ver foto ${idx + 1} de ${review.reviewer.name}`}
                        >
                          <img 
                            src={photo} 
                            alt={`Foto ${idx + 1} de la reseña de ${review.reviewer.name}`}
                            loading="lazy"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
      
      {/* Botón mostrar más */}
      {hasMoreReviews && (
        <div className="show-more-container">
          <button 
            className="show-more"
            onClick={handleShowMore}
            disabled={loading}
          >
            {loading ? 'Cargando...' : `Mostrar más reseñas (${filteredReviews.length - visibleReviews} restantes)`}
          </button>
        </div>
      )}
      
      {/* Modal de foto */}
      {selectedPhoto && (
        <div className="photo-modal" onClick={closePhotoModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closePhotoModal} aria-label="Cerrar">
              ×
            </button>
            <img src={selectedPhoto} alt="Foto ampliada" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewSection;