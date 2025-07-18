import React, { useState } from 'react';
import './Profile.css';

const Profile = () => {
  const [userData, setUserData] = useState({
    name: 'Juan Pérez',
    email: 'juan@example.com',
    phone: '+57 123 456 7890',
    verified: true,
    memberSince: '15 Enero 2024'
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ ...userData });
  const [showSuccess, setShowSuccess] = useState(false);

  const handleEdit = () => {
    setEditData({ ...userData });
    setIsEditing(true);
  };

  const handleSave = () => {
    setUserData({ ...editData });
    setIsEditing(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleCancel = () => {
    setEditData({ ...userData });
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="profile">
      <div className="profile-header-section">
        <h2 className="section-title">Mi Perfil</h2>
        {showSuccess && (
          <div className="success-message">
            <span className="success-icon">✓</span>
            Perfil actualizado exitosamente
          </div>
        )}
      </div>

      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            <div className="avatar-initials">
              {getInitials(isEditing ? editData.name : userData.name)}
            </div>
            <div className="avatar-status"></div>
          </div>
          <div className="profile-info">
            <h3 className="profile-name">
              {isEditing ? editData.name : userData.name}
            </h3>
            {userData.verified && (
              <div className="verified-badge">
                <span className="verified-icon">✓</span> 
                <span>Verificado</span>
              </div>
            )}
            <div className="member-since">
              Miembro desde {userData.memberSince}
            </div>
          </div>
        </div>
        
        <div className="profile-details">
          <div className="detail-item">
            <span className="detail-label">
              <span className="detail-icon">✉</span>
              Email:
            </span>
            {isEditing ? (
              <input
                type="email"
                className="detail-input"
                value={editData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            ) : (
              <span className="detail-value">{userData.email}</span>
            )}
          </div>
          
          <div className="detail-item">
            <span className="detail-label">
              <span className="detail-icon">📱</span>
              Teléfono:
            </span>
            {isEditing ? (
              <input
                type="tel"
                className="detail-input"
                value={editData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
            ) : (
              <span className="detail-value">{userData.phone}</span>
            )}
          </div>
          
          <div className="detail-item">
            <span className="detail-label">
              <span className="detail-icon">👤</span>
              Nombre:
            </span>
            {isEditing ? (
              <input
                type="text"
                className="detail-input"
                value={editData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
            ) : (
              <span className="detail-value">{userData.name}</span>
            )}
          </div>
          
          <div className="detail-item">
            <span className="detail-label">
              <span className="detail-icon">📅</span>
              Miembro desde:
            </span>
            <span className="detail-value">{userData.memberSince}</span>
          </div>
        </div>
        
        <div className="profile-actions">
          {!isEditing ? (
            <>
              <button className="edit-profile-btn" onClick={handleEdit}>
                <span className="btn-icon">✏️</span>
                Editar Perfil
              </button>
              <button className="security-btn">
                <span className="btn-icon">🔒</span>
                Seguridad
              </button>
            </>
          ) : (
            <>
              <button className="save-btn" onClick={handleSave}>
                <span className="btn-icon">💾</span>
                Guardar
              </button>
              <button className="cancel-btn" onClick={handleCancel}>
                <span className="btn-icon">✖️</span>
                Cancelar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;