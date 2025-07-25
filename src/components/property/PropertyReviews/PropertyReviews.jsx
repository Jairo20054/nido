import React, { useState } from 'react';
import { FaStar, FaUserCircle } from 'react-icons/fa';
import './PropertyReviews.css';

const PropertyReviews = ({ reviews, rating, totalReviews }) => {
  const [expandedReview, setExpandedReview] = useState(null);
  
  if (!reviews || reviews.length === 0) {
    return (
      <div className="property-reviews">
        <h2>Reseñas</h2>
        <p>Aún no hay reseñas para esta propiedad.</p>
      </div>
    );
  }

  const toggleReview = (index) => {
    setExpandedReview(expandedReview === index ? null : index);
  };

  return (
    <div className="property-reviews">
      <div className="reviews-summary">
        <div className="overall-rating">
          <span className="rating-value">{rating}</span>
          <div className="rating-stars">
            {[...Array(5)].map((_, i) => (
              <FaStar 
                key={i} 
                className={`star ${i < Math.floor(rating) ? 'filled' : ''}`} 
              />
            ))}
          </div>
          <span className="total-reviews">{totalReviews} reseñas</span>
        </div>
      </div>
      
      <div className="reviews-list">
        {reviews.map((review, index) => (
          <div key={review.id || index} className="review-item">
            <div className="review-header">
              <div className="reviewer-avatar">
                {review.avatar ? (
                  <img src={review.avatar} alt={review.name} />
                ) : (
                  <FaUserCircle className="default-avatar" />
                )}
              </div>
              <div className="reviewer-info">
                <h3 className="reviewer-name">{review.name}</h3>
                <div className="review-date">{review.date}</div>
              </div>
              <div className="review-rating">
                <FaStar className="star filled" />
                <span>{review.rating}</span>
              </div>
            </div>
            
            <div 
              className={`review-content ${expandedReview === index ? 'expanded' : ''}`}
            >
              {review.comment}
            </div>
            
            {review.comment.length > 300 && (
              <button 
                className="review-toggle" 
                onClick={() => toggleReview(index)}
                aria-expanded={expandedReview === index}
              >
                {expandedReview === index ? 'Leer menos' : 'Leer más'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PropertyReviews;