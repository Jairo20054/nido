import React from 'react';
import './PropertyCard.css';

const PropertyCard = ({ property }) => {
  return (
    <div className="property-card">
      <div className="property-image">
        <div className="image-slider">
          <img src={property.images[0]} alt={property.title} />
          <div className="image-overlay">
            <button className="favorite-button">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
              </svg>
            </button>
            <div className="property-tags">
              {property.tags.map((tag, index) => (
                <span key={index} className={`tag ${tag.toLowerCase()}`}>{tag}</span>
              ))}
              <span className="rating">★ {property.rating}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="property-details">
        <div className="property-header">
          <h3 className="property-title">{property.title}</h3>
          <div className="property-location">
            <span>{property.location}</span>
            <span>·</span>
            <span>{property.guests} huéspedes</span>
          </div>
        </div>
        
        <div className="property-features">
          <div className="feature">
            <span>🛏️</span> {property.bedrooms} hab
          </div>
          <div className="feature">
            <span>🚿</span> {property.bathrooms} baño{property.bathrooms > 1 ? 's' : ''}
          </div>
          <div className="feature">
            <span>📶</span> WiFi
          </div>
        </div>
        
        <div className="property-footer">
          <div className="reviews">
            <span>★ {property.rating}</span>
            <span>({property.reviewCount} reseñas)</span>
            <span className="verified">✓ Verificado</span>
          </div>
          
          <div className="pricing">
            <div className="price-per-night">${property.pricePerNight.toLocaleString()}/noche</div>
            <div className="total-price">Total: ${property.totalPrice.toLocaleString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
