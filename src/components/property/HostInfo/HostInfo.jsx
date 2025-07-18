import React from 'react';
import { FaUser, FaStar, FaMedal, FaCalendarAlt, FaCheckCircle, FaComment } from 'react-icons/fa';
import './HostInfo.css';

const HostInfo = ({ host }) => {
  if (!host) {
    return null;
  }

  return (
    <div className="host-info">
      <div className="host-header">
        <h2>Anfitrión: {host.name}</h2>
        {host.isSuperhost && (
          <div className="superhost-badge">
            <FaMedal className="medal-icon" />
            <span>Superhost</span>
          </div>
        )}
      </div>
      
      <div className="host-details">
        <div className="host-avatar">
          {host.avatar ? (
            <img src={host.avatar} alt={host.name} />
          ) : (
            <div className="avatar-placeholder">
              <FaUser />
            </div>
          )}
        </div>
        
        <div className="host-meta">
          <div className="meta-item">
            <FaCalendarAlt className="meta-icon" />
            <span>Miembro desde: <strong>{host.memberSince}</strong></span>
          </div>
          <div className="meta-item">
            <FaCheckCircle className={`meta-icon ${host.verified ? 'verified' : 'not-verified'}`} />
            <span>Identidad verificada: <strong>{host.verified ? 'Sí' : 'No'}</strong></span>
          </div>
          <div className="meta-item">
            <FaComment className="meta-icon" />
            <span>Tasa de respuesta: <strong>{host.responseRate}%</strong></span>
          </div>
          <div className="meta-item">
            <FaStar className="meta-icon" />
            <span>Calificación: <strong>{host.hostRating}</strong></span>
          </div>
        </div>
      </div>
      
      <div className="host-description">
        <p>{host.bio}</p>
      </div>
      
      <div className="host-contact">
        <button className="contact-button">Contactar al anfitrión</button>
      </div>
    </div>
  );
};

export default HostInfo;