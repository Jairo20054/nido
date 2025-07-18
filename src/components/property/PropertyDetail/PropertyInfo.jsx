import React from 'react';
import { FaStar, FaMedal, FaUserFriends, FaBed, FaBath, FaHome } from 'react-icons/fa';
import './PropertyInfo.css';

const PropertyInfo = ({ property }) => {
  return (
    <div className="property-info">
      <div className="info-header">
        <div>
          <h1 className="property-title">{property.title}</h1>
          <div className="property-location">
            <span>{property.location.neighborhood}</span>
            {property.location.city && <span> • {property.location.city}</span>}
            {property.location.country && <span> • {property.location.country}</span>}
          </div>
        </div>
        
        <div className="property-rating">
          <FaStar className="star-icon" />
          <span>{property.rating}</span>
          <span className="rating-count">({property.totalReviews} reseñas)</span>
          {property.isSuperhost && (
            <div className="superhost-badge">
              <FaMedal className="medal-icon" />
              <span>Superhost</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="property-meta">
        <div className="meta-item">
          <FaUserFriends className="meta-icon" />
          <span>{property.guests} {property.guests === 1 ? 'huésped' : 'huéspedes'}</span>
        </div>
        <div className="meta-item">
          <FaBed className="meta-icon" />
          <span>{property.bedrooms} {property.bedrooms === 1 ? 'habitación' : 'habitaciones'}</span>
        </div>
        <div className="meta-item">
          <FaBed className="meta-icon" />
          <span>{property.beds} {property.beds === 1 ? 'cama' : 'camas'}</span>
        </div>
        <div className="meta-item">
          <FaBath className="meta-icon" />
          <span>{property.bathrooms} {property.bathrooms === 1 ? 'baño' : 'baños'}</span>
        </div>
        <div className="meta-item">
          <FaHome className="meta-icon" />
          <span>{property.propertyType}</span>
        </div>
      </div>
      
      <div className="property-highlights">
        {property.highlights?.map((highlight, index) => (
          <div key={index} className="highlight">
            {highlight}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PropertyInfo;
